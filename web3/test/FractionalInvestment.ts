import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  EquityNFTFactory,
  FractionalInvestment
} from "../typechain-types";

describe("FractionalInvestment", function () {
  let equityNFTFactory: EquityNFTFactory;
  let fractionalInvestment: FractionalInvestment;
  let owner: SignerWithAddress;
  let founder: SignerWithAddress;
  let investor1: SignerWithAddress;
  let investor2: SignerWithAddress;
  let feeCollector: SignerWithAddress;
  let startupId: number;

  const STARTUP_NAME = "Test Startup";
  const STARTUP_DESC = "Test Description";
  const TOTAL_SHARES = 1000000;
  const INITIAL_VALUATION = ethers.parseEther("1000000"); // 1M ETH
  const INVESTMENT_AMOUNT = ethers.parseEther("10"); // 10 ETH

  beforeEach(async function () {
    [owner, founder, investor1, investor2, feeCollector] = await ethers.getSigners();

    // Deploy EquityNFTFactory
    const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
    equityNFTFactory = await EquityNFTFactory.deploy();

    // Deploy FractionalInvestment
    const FractionalInvestment = await ethers.getContractFactory("FractionalInvestment");
    fractionalInvestment = await FractionalInvestment.deploy(
      await equityNFTFactory.getAddress(),
      feeCollector.address
    );

    // Add FractionalInvestment as trusted issuer
    await equityNFTFactory.addTrustedIssuer(await fractionalInvestment.getAddress());

    // Register a startup
    const tx = await equityNFTFactory.connect(founder).registerStartup(
      STARTUP_NAME,
      STARTUP_DESC,
      TOTAL_SHARES,
      INITIAL_VALUATION
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find((e: any) => e.eventName === "StartupRegistered");
    startupId = event?.args?.tokenId?.toString();

    // Add owner as validator and validate startup
    await equityNFTFactory.addValidator(owner.address);
    await equityNFTFactory.validateStartup(startupId, true);
  });

  describe("Investment", function () {
    it("Should process instant investment with correct share calculation", async function () {
      const founderInitialBalance = await ethers.provider.getBalance(founder.address);
      const feeCollectorInitialBalance = await ethers.provider.getBalance(feeCollector.address);

      await expect(
        fractionalInvestment.connect(investor1).invest(startupId, {
          value: INVESTMENT_AMOUNT
        })
      ).to.emit(fractionalInvestment, "InvestmentMade");

      // Check investor received correct shares
      const expectedShares = (INVESTMENT_AMOUNT * 99n / 100n) * BigInt(TOTAL_SHARES) / INITIAL_VALUATION;
      const actualShares = await fractionalInvestment.getInvestorShares(startupId, investor1.address);
      expect(actualShares).to.equal(expectedShares);

      // Verify founder received investment amount minus fee
      const founderFinalBalance = await ethers.provider.getBalance(founder.address);
      const expectedFounderIncrease = INVESTMENT_AMOUNT * 99n / 100n; // 99% of investment
      expect(founderFinalBalance - founderInitialBalance).to.equal(expectedFounderIncrease);

      // Verify fee collector received fee
      const feeCollectorFinalBalance = await ethers.provider.getBalance(feeCollector.address);
      const expectedFee = INVESTMENT_AMOUNT * 1n / 100n; // 1% fee
      expect(feeCollectorFinalBalance - feeCollectorInitialBalance).to.equal(expectedFee);
    });

    it("Should fail investment if startup is not validated", async function () {
      // Register new unvalidated startup
      const tx = await equityNFTFactory.connect(founder).registerStartup(
        "Unvalidated Startup",
        "Description",
        TOTAL_SHARES,
        INITIAL_VALUATION
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find((e: any) => e.eventName === "StartupRegistered");
      const unvalidatedId = event?.args?.tokenId?.toString();

      await expect(
        fractionalInvestment.connect(investor1).invest(unvalidatedId, {
          value: INVESTMENT_AMOUNT
        })
      ).to.be.revertedWith("Startup not validated");
    });

    it("Should fail if investment is below minimum", async function () {
      const minInvestment = await fractionalInvestment.minInvestment();
      await expect(
        fractionalInvestment.connect(investor1).invest(startupId, {
          value: minInvestment - 1n
        })
      ).to.be.revertedWith("Investment below minimum");
    });

    it("Should maintain correct investment history", async function () {
      await fractionalInvestment.connect(investor1).invest(startupId, {
        value: INVESTMENT_AMOUNT
      });

      const history = await fractionalInvestment.getInvestmentHistory(startupId, investor1.address);
      expect(history.length).to.equal(1);
      expect(history[0].startupId).to.equal(startupId);
      expect(history[0].investmentAmount).to.equal(INVESTMENT_AMOUNT * 99n / 100n); // Net investment after fee
    });
  });

  describe("Profit Distribution", function () {
    beforeEach(async function () {
      // Make initial investments
      await fractionalInvestment.connect(investor1).invest(startupId, {
        value: INVESTMENT_AMOUNT
      });
      await fractionalInvestment.connect(investor2).invest(startupId, {
        value: INVESTMENT_AMOUNT * 2n
      });
    });

    it("Should distribute profits proportionally to share holders", async function () {
      const profitAmount = ethers.parseEther("3");
      const investor1InitialBalance = await ethers.provider.getBalance(investor1.address);
      const investor2InitialBalance = await ethers.provider.getBalance(investor2.address);

      await fractionalInvestment.connect(founder).distributeProfit(startupId, {
        value: profitAmount
      });

      const investor1FinalBalance = await ethers.provider.getBalance(investor1.address);
      const investor2FinalBalance = await ethers.provider.getBalance(investor2.address);

      // Investor 1 should get 1/3 of profits, Investor 2 should get 2/3
      const expectedInvestor1Profit = profitAmount / 3n;
      const expectedInvestor2Profit = (profitAmount * 2n) / 3n;

      // Allow for small rounding differences
      expect(investor1FinalBalance - investor1InitialBalance).to.be.closeTo(expectedInvestor1Profit, 1000n);
      expect(investor2FinalBalance - investor2InitialBalance).to.be.closeTo(expectedInvestor2Profit, 1000n);
    });

    it("Should only allow founder to distribute profits", async function () {
      const profitAmount = ethers.parseEther("1");
      await expect(
        fractionalInvestment.connect(investor1).distributeProfit(startupId, {
          value: profitAmount
        })
      ).to.be.revertedWith("Only founder can distribute profits");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update platform fee", async function () {
      await expect(fractionalInvestment.connect(owner).updatePlatformFee(200))
        .to.emit(fractionalInvestment, "PlatformFeeUpdated")
        .withArgs(100, 200);

      expect(await fractionalInvestment.platformFee()).to.equal(200);
    });

    it("Should prevent setting platform fee above 10%", async function () {
      await expect(fractionalInvestment.connect(owner).updatePlatformFee(1001))
        .to.be.revertedWith("Fee too high");
    });

    it("Should allow owner to update fee collector", async function () {
      const newCollector = investor1.address;
      await expect(fractionalInvestment.connect(owner).updateFeeCollector(newCollector))
        .to.emit(fractionalInvestment, "FeeCollectorUpdated")
        .withArgs(feeCollector.address, newCollector);

      expect(await fractionalInvestment.feeCollector()).to.equal(newCollector);
    });
  });
});