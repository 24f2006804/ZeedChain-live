import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import {
  EquityNFTFactory,
  DynamicValuation,
  MockV3Aggregator
} from "../typechain-types";

describe("DynamicValuation", function () {
  let dynamicValuation: DynamicValuation;
  let equityNFTFactory: EquityNFTFactory;
  let mockPriceFeed: MockV3Aggregator;
  let owner: SignerWithAddress;
  let founder: SignerWithAddress;
  let nonOwner: SignerWithAddress;
  let startupId: string;

  const STARTUP_NAME = "Test Startup";
  const STARTUP_DESC = "Test Description";
  const TOTAL_SHARES = 1000000;
  const DECIMALS = 8;
  const INITIAL_PRICE = 100000000; // 1000.00 USD with 8 decimals
  const UPDATE_INTERVAL = 24 * 60 * 60; // 1 day in seconds
  const GRACE_PERIOD = 60 * 60; // 1 hour in seconds

  beforeEach(async function () {
    [owner, founder, nonOwner] = await ethers.getSigners();

    // Deploy mock price feed with current timestamp
    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    mockPriceFeed = await MockV3Aggregator.deploy(DECIMALS, INITIAL_PRICE);

    // Deploy EquityNFTFactory
    const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
    equityNFTFactory = await EquityNFTFactory.deploy();

    // Deploy DynamicValuation with factory address
    const DynamicValuation = await ethers.getContractFactory("DynamicValuation");
    dynamicValuation = await DynamicValuation.deploy(await equityNFTFactory.getAddress());

    // Add owner as validator first
    await equityNFTFactory.addValidator(owner.address);

    // Register a startup with initial price as valuation
    const tx = await equityNFTFactory.connect(founder).registerStartup(
      STARTUP_NAME,
      STARTUP_DESC,
      TOTAL_SHARES,
      INITIAL_PRICE // Use the same initial price as the feed
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find((e: any) => e.eventName === "StartupRegistered");
    startupId = event?.args?.tokenId?.toString();

    // Validate startup using owner (who is now a validator)
    await equityNFTFactory.validateStartup(startupId, true);
  });

  describe("Price Feed Integration", function () {
    it("Should set price feed correctly", async function () {
      await dynamicValuation.setPriceFeed(startupId, await mockPriceFeed.getAddress());
      const feedData = await dynamicValuation.startupFeeds(startupId);
      expect(feedData.feedAddress).to.equal(await mockPriceFeed.getAddress());
      expect(feedData.isActive).to.be.true;
      expect(feedData.decimals).to.equal(DECIMALS);
    });

    it("Should reject zero address price feed", async function () {
      await expect(
        dynamicValuation.setPriceFeed(startupId, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(dynamicValuation, "InvalidPrice")
      .withArgs(startupId);
    });

    it("Should fail to set price feed from non-owner", async function () {
      await expect(
        dynamicValuation.connect(nonOwner).setPriceFeed(startupId, await mockPriceFeed.getAddress())
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Valuation Updates", function () {
    beforeEach(async function () {
      await dynamicValuation.setPriceFeed(startupId, await mockPriceFeed.getAddress());
    });

    it("Should update valuation based on price feed", async function () {
      await time.increase(UPDATE_INTERVAL);
      await mockPriceFeed.updateAnswer(120000000); // $1200.00
      await dynamicValuation.updateValuation(startupId);
      
      const newValuation = await equityNFTFactory.getStartupValuation(startupId);
      expect(newValuation).to.equal(120000000);
    });

    it("Should prevent updates within the minimum interval", async function () {
      await time.increase(UPDATE_INTERVAL);
      await mockPriceFeed.updateAnswer(110000000);
      await dynamicValuation.updateValuation(startupId);
      
      await expect(
        dynamicValuation.updateValuation(startupId)
      ).to.be.revertedWithCustomError(dynamicValuation, "UpdateTooSoon");
    });

    it("Should prevent excessive valuation changes", async function () {
      // First update with a normal change
      await time.increase(UPDATE_INTERVAL);
      await mockPriceFeed.updateAnswer(110000000);
      await dynamicValuation.updateValuation(startupId);
      
      // Try to update with 50% increase (above 30% threshold)
      await time.increase(UPDATE_INTERVAL);
      const newPrice = 165000000; // 50% increase from previous value
      await mockPriceFeed.updateAnswer(newPrice);
      
      await expect(
        dynamicValuation.updateValuation(startupId)
      ).to.be.revertedWithCustomError(dynamicValuation, "ExcessiveValuationChange");
    });

    it("Should detect and reject stale price data", async function () {
      // First make a valid update
      await time.increase(UPDATE_INTERVAL);
      await mockPriceFeed.updateAnswer(110000000);
      await dynamicValuation.updateValuation(startupId);
      
      // Move time beyond grace period but don't update price feed
      await time.increase(GRACE_PERIOD + UPDATE_INTERVAL + 1);
      
      await expect(
        dynamicValuation.updateValuation(startupId)
      ).to.be.revertedWithCustomError(dynamicValuation, "StalePriceData");
    });
  });

  describe("Emergency Controls", function () {
    beforeEach(async function () {
      await dynamicValuation.setPriceFeed(startupId, await mockPriceFeed.getAddress());
    });

    it("Should allow pausing by owner", async function () {
      await dynamicValuation.pause();
      expect(await dynamicValuation.paused()).to.be.true;

      await expect(
        dynamicValuation.updateValuation(startupId)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow unpausing by owner", async function () {
      await dynamicValuation.pause();
      await dynamicValuation.unpause();
      expect(await dynamicValuation.paused()).to.be.false;
    });

    it("Should allow disabling price feed", async function () {
      await dynamicValuation.setFeedStatus(startupId, false);
      
      await expect(
        dynamicValuation.updateValuation(startupId)
      ).to.be.revertedWithCustomError(dynamicValuation, "PriceFeedNotSet")
      .withArgs(startupId);
    });
  });
});