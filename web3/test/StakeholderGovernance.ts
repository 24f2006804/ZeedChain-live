import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import {
  EquityNFTFactory,
  FractionalInvestment,
  StakeholderGovernance
} from "../typechain-types";

describe("StakeholderGovernance", function () {
  let stakeholderGovernance: StakeholderGovernance;
  let equityNFTFactory: EquityNFTFactory;
  let fractionalInvestment: FractionalInvestment;
  let owner: SignerWithAddress;
  let investor1: SignerWithAddress;
  let investor2: SignerWithAddress;
  let investor3: SignerWithAddress;
  let startupId: number;

  const STARTUP_NAME = "Test Startup";
  const STARTUP_DESC = "Test Description";
  const TOTAL_SHARES = 1000000;
  const INITIAL_VALUATION = ethers.parseEther("100"); // 100 ETH instead of 1M ETH
  const INVESTMENT_AMOUNT = ethers.parseEther("1"); // 1 ETH investment
  const VOTING_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds

  beforeEach(async function () {
    [owner, investor1, investor2, investor3] = await ethers.getSigners();

    // Deploy EquityNFTFactory
    const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
    equityNFTFactory = await EquityNFTFactory.deploy();

    // Deploy FractionalInvestment
    const FractionalInvestment = await ethers.getContractFactory("FractionalInvestment");
    fractionalInvestment = await FractionalInvestment.deploy(
      await equityNFTFactory.getAddress(),
      owner.address // Use owner as fee collector
    );

    // Deploy StakeholderGovernance with FractionalInvestment address
    const StakeholderGovernance = await ethers.getContractFactory("StakeholderGovernance");
    stakeholderGovernance = await StakeholderGovernance.deploy(
      await fractionalInvestment.getAddress()
    );

    // Register and validate a startup
    const registerTx = await equityNFTFactory.connect(owner).registerStartup(
      STARTUP_NAME,
      STARTUP_DESC,
      TOTAL_SHARES,
      INITIAL_VALUATION
    );
    const receipt = await registerTx.wait();
    const event = receipt.logs.find((e: any) => e.eventName === "StartupRegistered");
    startupId = event?.args?.tokenId?.toString();

    // Add owner as validator and validate startup
    await equityNFTFactory.addValidator(owner.address);
    await equityNFTFactory.validateStartup(startupId, true);

    // Add FractionalInvestment as trusted issuer
    await equityNFTFactory.addTrustedIssuer(await fractionalInvestment.getAddress());

    // Invest with different investors (each gets 20% of shares)
    const investAmount = INVESTMENT_AMOUNT;
    await fractionalInvestment.connect(investor1).invest(startupId, { value: investAmount });
    await fractionalInvestment.connect(investor2).invest(startupId, { value: investAmount });
    await fractionalInvestment.connect(investor3).invest(startupId, { value: investAmount });

    // Instead of setting absolute timestamp, increase time by a day
    await time.increase(24 * 60 * 60);
  });

  describe("Proposal Creation", function () {
    it("Should allow shareholders to create proposals", async function () {
      const description = "Test Proposal";
      await expect(
        stakeholderGovernance.connect(investor1).createProposal(startupId, description)
      ).to.emit(stakeholderGovernance, "ProposalCreated");
    });

    it("Should fail if creator has insufficient shares", async function () {
      const description = "Test Proposal";
      await expect(
        stakeholderGovernance.connect(owner).createProposal(startupId, description)
      ).to.be.revertedWith("Insufficient shares to propose");
    });
  });

  describe("Voting", function () {
    let proposalId: number;

    beforeEach(async function () {
      // Create proposal from an investor with sufficient shares
      const tx = await stakeholderGovernance.connect(investor1).createProposal(
        startupId,
        "Test Proposal"
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find((e: any) => e.eventName === "ProposalCreated");
      proposalId = event?.args?.proposalId?.toString();
    });

    it("Should allow shareholders to vote", async function () {
      await expect(
        stakeholderGovernance.connect(investor2).vote(proposalId, true)
      ).to.emit(stakeholderGovernance, "Voted");
    });

    it("Should prevent double voting", async function () {
      await stakeholderGovernance.connect(investor2).vote(proposalId, true);
      await expect(
        stakeholderGovernance.connect(investor2).vote(proposalId, true)
      ).to.be.revertedWith("Already voted");
    });

    it("Should prevent voting after deadline", async function () {
      await time.increase(VOTING_PERIOD + 1);
      await expect(
        stakeholderGovernance.connect(investor2).vote(proposalId, true)
      ).to.be.revertedWith("Voting period ended");
    });
  });

  describe("Proposal Execution", function () {
    let proposalId: number;

    beforeEach(async function () {
      const tx = await stakeholderGovernance.connect(investor1).createProposal(
        startupId,
        "Test Proposal"
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find((e: any) => e.eventName === "ProposalCreated");
      proposalId = event?.args?.proposalId?.toString();
    });

    it("Should execute proposal after voting period", async function () {
      // Have majority vote in favor
      await stakeholderGovernance.connect(investor2).vote(proposalId, true);
      await stakeholderGovernance.connect(investor3).vote(proposalId, true);
      
      await time.increase(VOTING_PERIOD + 1);
      await expect(
        stakeholderGovernance.connect(investor1).executeProposal(proposalId)
      ).to.emit(stakeholderGovernance, "ProposalExecuted");
    });

    it("Should fail to execute before voting period ends", async function () {
      await expect(
        stakeholderGovernance.connect(investor1).executeProposal(proposalId)
      ).to.be.revertedWith("Voting period not ended");
    });

    it("Should fail to execute rejected proposals", async function () {
      // Have majority vote against
      await stakeholderGovernance.connect(investor2).vote(proposalId, false);
      await stakeholderGovernance.connect(investor3).vote(proposalId, false);
      
      await time.increase(VOTING_PERIOD + 1);
      await expect(
        stakeholderGovernance.connect(investor1).executeProposal(proposalId)
      ).to.be.revertedWith("Proposal not approved");
    });
  });
});