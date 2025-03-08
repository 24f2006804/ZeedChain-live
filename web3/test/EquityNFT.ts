import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EquityNFT } from "../typechain-types";

describe("EquityNFT", function () {
  let equityNFT: EquityNFT;
  let owner: SignerWithAddress;
  let startupOwner: SignerWithAddress;
  let investor1: SignerWithAddress;
  let investor2: SignerWithAddress;
  
  const TOTAL_SHARES = 1000000;
  const INITIAL_VALUATION = ethers.parseEther("100"); // 100 ETH instead of 1M ETH
  
  beforeEach(async function () {
    [owner, startupOwner, investor1, investor2] = await ethers.getSigners();
    
    const EquityNFT = await ethers.getContractFactory("EquityNFT");
    equityNFT = await EquityNFT.deploy(owner.address);
    await equityNFT.initialize(startupOwner.address, TOTAL_SHARES, INITIAL_VALUATION);
    
    // Grant VALUATION_ROLE to owner for testing
    await equityNFT.grantRole(await equityNFT.VALUATION_ROLE(), owner.address);
  });

  describe("Initialization", function () {
    it("Should set the correct initial values", async function () {
      expect(await equityNFT.totalShares()).to.equal(TOTAL_SHARES);
      expect(await equityNFT.sharesForSale()).to.equal(TOTAL_SHARES);
      expect(await equityNFT.currentValuation()).to.equal(INITIAL_VALUATION);
      expect(await equityNFT.startupOwner()).to.equal(startupOwner.address);
      expect(await equityNFT.fundingActive()).to.be.true;
    });
  });

  describe("Investment", function () {
    it("Should allow investment with correct share calculation", async function () {
      const shareAmount = 100000; // 10% of total shares
      const expectedPrice = INITIAL_VALUATION * BigInt(shareAmount) / BigInt(TOTAL_SHARES);
      
      await expect(equityNFT.connect(investor1).investInStartup(shareAmount, {
        value: expectedPrice
      }))
        .to.emit(equityNFT, "Investment")
        .withArgs(investor1.address, expectedPrice, shareAmount);
      
      expect(await equityNFT.investorShares(investor1.address)).to.equal(shareAmount);
      expect(await equityNFT.sharesForSale()).to.equal(TOTAL_SHARES - shareAmount);
    });

    it("Should refund excess payment", async function () {
      const shareAmount = 100000;
      const expectedPrice = INITIAL_VALUATION * BigInt(shareAmount) / BigInt(TOTAL_SHARES);
      const excessAmount = ethers.parseEther("0.1"); // 0.1 ETH excess
      
      const balanceBefore = await ethers.provider.getBalance(investor1.address);
      
      const tx = await equityNFT.connect(investor1).investInStartup(shareAmount, {
        value: expectedPrice + excessAmount
      });
      
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      
      const balanceAfter = await ethers.provider.getBalance(investor1.address);
      const totalCost = balanceBefore - balanceAfter;
      
      // Total cost should be expectedPrice + gasCost (excess should be refunded)
      expect(totalCost).to.equal(expectedPrice + gasCost);
    });
  });

  describe("Valuation Updates", function () {
    it("Should update valuation correctly", async function () {
      const newValuation = ethers.parseEther("200"); // 200 ETH
      
      await expect(equityNFT.updateValuation(newValuation))
        .to.emit(equityNFT, "ValuationUpdated")
        .withArgs(INITIAL_VALUATION, newValuation);
      
      expect(await equityNFT.currentValuation()).to.equal(newValuation);
    });

    it("Should fail if caller doesn't have VALUATION_ROLE", async function () {
      const newValuation = ethers.parseEther("200");
      await expect(
        equityNFT.connect(investor1).updateValuation(newValuation)
      ).to.be.revertedWith(/AccessControl: .*/);
    });
  });

  describe("Profit Distribution", function () {
    beforeEach(async function () {
      // Each investor gets 25% of shares
      const shareAmount = TOTAL_SHARES / 4;
      const investAmount = INITIAL_VALUATION * BigInt(shareAmount) / BigInt(TOTAL_SHARES);
      
      await equityNFT.connect(investor1).investInStartup(shareAmount, {
        value: investAmount
      });
      await equityNFT.connect(investor2).investInStartup(shareAmount, {
        value: investAmount
      });
    });

    it("Should distribute profits proportionally", async function () {
      const profitAmount = ethers.parseEther("1"); // 1 ETH profit
      const expectedShare = profitAmount / 4n; // 25% each
      
      // Get initial balances
      const initialBalance1 = await ethers.provider.getBalance(investor1.address);
      const initialBalance2 = await ethers.provider.getBalance(investor2.address);
      
      await equityNFT.connect(startupOwner).distributeProfits({ value: profitAmount });
      
      // Get final balances
      const finalBalance1 = await ethers.provider.getBalance(investor1.address);
      const finalBalance2 = await ethers.provider.getBalance(investor2.address);
      
      // Check profit distribution
      expect(finalBalance1 - initialBalance1).to.equal(expectedShare);
      expect(finalBalance2 - initialBalance2).to.equal(expectedShare);
    });
  });

  describe("Emergency Controls", function () {
    it("Should allow pausing by admin", async function () {
      await equityNFT.pause();
      expect(await equityNFT.paused()).to.be.true;
    });

    it("Should prevent investments when paused", async function () {
      await equityNFT.pause();
      
      const shareAmount = 100000;
      const investAmount = INITIAL_VALUATION * BigInt(shareAmount) / BigInt(TOTAL_SHARES);
      
      await expect(
        equityNFT.connect(investor1).investInStartup(shareAmount, {
          value: investAmount
        })
      ).to.be.revertedWith("Pausable: paused");
    });
  });
});