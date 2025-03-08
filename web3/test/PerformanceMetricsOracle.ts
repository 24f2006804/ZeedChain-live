import { expect } from "chai";
import { ethers } from "hardhat";
import { type ContractEventLog } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { PerformanceMetricsOracle, MockFunctionsRouter } from "../typechain-types";
import fs from "fs";
import path from "path";

describe("PerformanceMetricsOracle", function () {
    let performanceOracle: PerformanceMetricsOracle;
    let mockRouter: MockFunctionsRouter;
    let owner: HardhatEthersSigner;
    let provider: HardhatEthersSigner;
    let validator: HardhatEthersSigner;
    let unauthorized: HardhatEthersSigner;
    let startup: HardhatEthersSigner;
    
    const subscriptionId = 1n;
    const donId = ethers.id("functions-don-1");
    
    // Load mock source
    const performanceSource = fs.readFileSync(
        path.join(__dirname, "mock-sources/performance.js"),
        "utf8"
    );

    beforeEach(async function () {
        [owner, provider, validator, unauthorized, startup] = await ethers.getSigners();

        // Deploy mock Functions Router
        const MockRouter = await ethers.getContractFactory("MockFunctionsRouter");
        mockRouter = await MockRouter.deploy();
        await mockRouter.waitForDeployment();

        // Deploy PerformanceMetricsOracle with shorter source identifier
        const PerformanceMetricsOracle = await ethers.getContractFactory("PerformanceMetricsOracle");
        performanceOracle = await PerformanceMetricsOracle.deploy(
            await mockRouter.getAddress(),
            subscriptionId,
            donId,
            ethers.encodeBytes32String("perf") // Shorter identifier
        );
        await performanceOracle.waitForDeployment();

        // Setup roles
        const METRICS_PROVIDER_ROLE = await performanceOracle.METRICS_PROVIDER_ROLE();
        const VALIDATOR_ROLE = await performanceOracle.VALIDATOR_ROLE();
        
        await performanceOracle.grantRole(METRICS_PROVIDER_ROLE, provider.address);
        await performanceOracle.grantRole(VALIDATOR_ROLE, validator.address);
    });

    describe("Performance Metrics Flow", function () {
        it("Should request and receive performance metrics", async function () {
            const startupId = 1;
            
            // Request metrics
            const tx = await performanceOracle.connect(provider).requestPerformanceMetrics(startupId, "test_source");
            const receipt = await tx.wait();
            if (!receipt) throw new Error("Transaction failed");

            const requestEvent = receipt.logs.find(
                (log): log is ContractEventLog<any> => 
                    log.fragment && log.fragment.name === 'MetricsRequested'
            );
            if (!requestEvent) throw new Error("No event emitted");
            const requestId = requestEvent.args[0];

            // Mock metrics response with all 5 required metrics
            const metrics = [
                1000n,              // activeUsers
                ethers.parseEther("50000"), // monthlyRevenue (50K)
                15n,                // customerGrowth (15%)
                85n,                // retentionRate (85%)
                200n                // unitEconomics ($200 per user)
            ];

            // Fulfill with properly encoded response
            await mockRouter.fulfillRequest(
                requestId,
                ethers.AbiCoder.defaultAbiCoder().encode(["uint256[]"], [metrics]),
                "0x" // No error
            );

            // Check the stored metrics
            const storedMetrics = await performanceOracle.getLatestMetrics(startupId);
            expect(storedMetrics[0]).to.equal(metrics[0]); // activeUsers
            expect(storedMetrics[1]).to.equal(metrics[1]); // monthlyRevenue
            expect(storedMetrics[2]).to.equal(metrics[2]); // customerGrowth
            expect(storedMetrics[3]).to.equal(metrics[3]); // retentionRate
            expect(storedMetrics[4]).to.equal(metrics[4]); // unitEconomics
        });

        it("Should maintain historical metrics and allow validation", async function () {
            const startupId = 1;
            
            // First metrics request
            const tx = await performanceOracle.connect(provider).requestPerformanceMetrics(startupId, "test_source");
            const receipt = await tx.wait();
            if (!receipt) throw new Error("Transaction failed");

            const requestEvent = receipt.logs.find(
                (log): log is ContractEventLog<any> => 
                    log.fragment && log.fragment.name === 'MetricsRequested'
            );
            if (!requestEvent) throw new Error("No event emitted");
            const requestId = requestEvent.args[0];

            // First set of metrics
            const metrics1 = [
                1000n,              // activeUsers
                ethers.parseEther("50000"), // monthlyRevenue
                15n,                // customerGrowth
                85n,                // retentionRate
                200n                // unitEconomics
            ];

            await mockRouter.fulfillRequest(
                requestId,
                ethers.AbiCoder.defaultAbiCoder().encode(["uint256[]"], [metrics1]),
                "0x"
            );

            // Validate first metrics
            const storedMetrics = await performanceOracle.getLatestMetrics(startupId);
            await performanceOracle.connect(validator).validateMetrics(startupId, storedMetrics[5]); // Use timestamp from metrics

            // Wait for minimum update interval
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // 7 days
            await ethers.provider.send("evm_mine", []);

            // Second metrics request
            const tx2 = await performanceOracle.connect(provider).requestPerformanceMetrics(startupId, "test_source");
            const receipt2 = await tx2.wait();
            if (!receipt2) throw new Error("Transaction failed");

            const requestEvent2 = receipt2.logs.find(
                (log): log is ContractEventLog<any> => 
                    log.fragment && log.fragment.name === 'MetricsRequested'
            );
            if (!requestEvent2) throw new Error("No event emitted");
            const requestId2 = requestEvent2.args[0];

            // Second set of metrics with growth
            const metrics2 = [
                1200n,              // activeUsers (+20%)
                ethers.parseEther("65000"), // monthlyRevenue (+30%)
                18n,                // customerGrowth
                87n,                // retentionRate
                220n                // unitEconomics
            ];

            await mockRouter.fulfillRequest(
                requestId2,
                ethers.AbiCoder.defaultAbiCoder().encode(["uint256[]"], [metrics2]),
                "0x"
            );

            // Check historical data
            const history = await performanceOracle.getHistoricalMetrics(startupId);
            expect(history.length).to.equal(2);
            expect(history[0].activeUsers).to.equal(metrics1[0]);
            expect(history[1].activeUsers).to.equal(metrics2[0]);
        });

        it("Should prevent unauthorized validators", async function () {
            const startupId = 1;
            
            // Request metrics
            const tx = await performanceOracle.connect(provider).requestPerformanceMetrics(startupId, "test_source");
            const receipt = await tx.wait();
            if (!receipt) throw new Error("Transaction failed");

            const requestEvent = receipt.logs.find(
                (log): log is ContractEventLog<any> => 
                    log.fragment && log.fragment.name === 'MetricsRequested'
            );
            if (!requestEvent) throw new Error("No event emitted");
            const requestId = requestEvent.args[0];

            // Mock response
            const metrics = [
                1000n,              // activeUsers
                ethers.parseEther("50000"), // monthlyRevenue
                15n,                // customerGrowth
                85n,                // retentionRate
                200n                // unitEconomics
            ];

            await mockRouter.fulfillRequest(
                requestId,
                ethers.AbiCoder.defaultAbiCoder().encode(["uint256[]"], [metrics]),
                "0x"
            );

            // Get timestamp from stored metrics
            const storedMetrics = await performanceOracle.getLatestMetrics(startupId);
            const timestamp = storedMetrics[5];

            // Try to validate with unauthorized account
            await expect(
                performanceOracle.connect(unauthorized).validateMetrics(startupId, timestamp)
            ).to.be.revertedWith(`AccessControl: account ${unauthorized.address.toLowerCase()} is missing role ${await performanceOracle.VALIDATOR_ROLE()}`);
        });

        it("Should prevent updates too soon", async function () {
            const startupId = 1;
            
            // First request
            await performanceOracle.connect(provider).requestPerformanceMetrics(startupId, "test_source");

            // Try to request again immediately
            await expect(
                performanceOracle.connect(provider).requestPerformanceMetrics(startupId, "test_source")
            ).to.be.revertedWith("Update too soon");
        });

        it("Should prevent unauthorized metrics providers", async function () {
            await expect(
                performanceOracle.connect(unauthorized).requestPerformanceMetrics(1, "test_source")
            ).to.be.revertedWith(`AccessControl: account ${unauthorized.address.toLowerCase()} is missing role ${await performanceOracle.METRICS_PROVIDER_ROLE()}`);
        });
    });

    describe("Configuration", function () {
        it("Should allow admin to update configuration", async function () {
            const newSubscriptionId = 2n;
            const newDonId = ethers.id("functions-don-2");
            const newGasLimit = 400000;
            
            await performanceOracle.updateConfig(
                newSubscriptionId,
                newDonId,
                newGasLimit,
                ethers.encodeBytes32String("new_source")
            );

            // Verify new config by making a request
            const tx = await performanceOracle.connect(provider).requestPerformanceMetrics(1, "test_source");
            const receipt = await tx.wait();
            expect(receipt?.status).to.equal(1);
        });

        it("Should prevent non-admins from updating configuration", async function () {
            await expect(
                performanceOracle.connect(unauthorized).updateConfig(
                    2n,
                    ethers.id("functions-don-2"),
                    400000,
                    ethers.encodeBytes32String("new_source")
                )
            ).to.be.revertedWith(`AccessControl: account ${unauthorized.address.toLowerCase()} is missing role ${await performanceOracle.DEFAULT_ADMIN_ROLE()}`);
        });
    });
});