import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FinancialDataOracle, MockFunctionsRouter } from "../typechain-types";
import fs from "fs";
import path from "path";

describe("FinancialDataOracle", function () {
    let financialOracle: FinancialDataOracle;
    let mockRouter: MockFunctionsRouter;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    
    const subscriptionId = 1;
    const donId = ethers.id("functions-don-1");
    
    // Load mock source
    const financialSource = fs.readFileSync(
        path.join(__dirname, "mock-sources/financial.js"),
        "utf8"
    );

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        // Deploy mock Functions Router
        const MockRouter = await ethers.getContractFactory("MockFunctionsRouter");
        mockRouter = await MockRouter.deploy();
        await mockRouter.waitForDeployment();

        // Deploy FinancialDataOracle with shorter source identifier
        const FinancialDataOracle = await ethers.getContractFactory("FinancialDataOracle");
        financialOracle = await FinancialDataOracle.deploy(
            await mockRouter.getAddress(),
            subscriptionId,
            donId,
            ethers.encodeBytes32String("financial") // Shorter identifier
        );
        await financialOracle.waitForDeployment();
    });

    describe("Financial Metrics Flow", function () {
        it("Should request and receive financial metrics", async function () {
            const startupId = 1;
            
            // Request metrics
            const tx = await financialOracle.requestFinancialMetrics(startupId);
            const receipt = await tx.wait();
            
            const requestEvent = receipt?.logs.find(
                (log: any) => log.eventName === "MetricsRequested"
            );
            const requestId = requestEvent?.args?.requestId;

            // Mock metrics response
            const metrics = [1000000, 50000, 5000000, 100000];
            await mockRouter.fulfillRequest(
                requestId,
                ethers.AbiCoder.defaultAbiCoder().encode(["uint256[]"], [metrics]),
                "0x"
            );

            // Get latest metrics
            const [
                revenue,
                userGrowth,
                marketSize,
                burnRate,
                timestamp
            ] = await financialOracle.getLatestMetrics(startupId);
            
            expect(revenue).to.equal(metrics[0]);
            expect(userGrowth).to.equal(metrics[1]);
            expect(marketSize).to.equal(metrics[2]);
            expect(burnRate).to.equal(metrics[3]);
            expect(timestamp).to.be.gt(0);
        });

        it("Should maintain historical metrics", async function () {
            const startupId = 1;
            
            // First metrics request
            const tx1 = await financialOracle.requestFinancialMetrics(startupId);
            const receipt1 = await tx1.wait();
            const requestId1 = receipt1?.logs.find(
                (log: any) => log.eventName === "MetricsRequested"
            )?.args?.requestId;

            const metrics1 = [1000000, 50000, 5000000, 100000];
            await mockRouter.fulfillRequest(
                requestId1,
                ethers.AbiCoder.defaultAbiCoder().encode(["uint256[]"], [metrics1]),
                "0x"
            );

            // Second metrics request (after some time)
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // 7 days
            await ethers.provider.send("evm_mine", []);

            const tx2 = await financialOracle.requestFinancialMetrics(startupId);
            const receipt2 = await tx2.wait();
            const requestId2 = receipt2?.logs.find(
                (log: any) => log.eventName === "MetricsRequested"
            )?.args?.requestId;

            const metrics2 = [1500000, 75000, 7500000, 150000];
            await mockRouter.fulfillRequest(
                requestId2,
                ethers.AbiCoder.defaultAbiCoder().encode(["uint256[]"], [metrics2]),
                "0x"
            );

            // Check historical metrics
            const history = await financialOracle.getHistoricalMetrics(startupId);
            expect(history.length).to.equal(2);
            expect(history[0].revenue).to.equal(metrics1[0]);
            expect(history[1].revenue).to.equal(metrics2[0]);
        });

        it("Should prevent updates too soon", async function () {
            const startupId = 1;
            
            // First request
            await financialOracle.requestFinancialMetrics(startupId);

            // Try to request again immediately
            await expect(
                financialOracle.requestFinancialMetrics(startupId)
            ).to.be.revertedWith("Update too soon");
        });
    });

    describe("Configuration", function () {
        it("Should allow owner to update configuration", async function () {
            const newSubscriptionId = 2;
            const newDonId = ethers.id("functions-don-2");
            const newGasLimit = 400000;
            
            await financialOracle.updateConfig(
                newSubscriptionId,
                newDonId,
                newGasLimit,
                ethers.encodeBytes32String("new source")
            );

            // Verify new config by making a request
            const tx = await financialOracle.requestFinancialMetrics(1);
            const receipt = await tx.wait();
            expect(receipt.status).to.equal(1);
        });

        it("Should prevent non-owners from updating configuration", async function () {
            await expect(
                financialOracle.connect(user).updateConfig(
                    2,
                    ethers.id("functions-don-2"),
                    400000,
                    ethers.encodeBytes32String("new source")
                )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});