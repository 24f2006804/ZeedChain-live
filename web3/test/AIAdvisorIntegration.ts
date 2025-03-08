import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { AIAdvisorIntegration, MockFunctionsRouter } from "../typechain-types";
import fs from "fs";
import path from "path";

describe("AIAdvisorIntegration", function () {
    let aiAdvisor: AIAdvisorIntegration;
    let mockRouter: MockFunctionsRouter;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    
    const subscriptionId = 1;
    const donId = ethers.id("functions-don-1");
    
    // Load mock source
    const advisorSource = fs.readFileSync(
        path.join(__dirname, "mock-sources/advisor.js"),
        "utf8"
    );

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        // Deploy mock Functions Router
        const MockRouter = await ethers.getContractFactory("MockFunctionsRouter");
        mockRouter = await MockRouter.deploy();
        await mockRouter.waitForDeployment();

        // Deploy AIAdvisorIntegration with shorter source identifier
        const AIAdvisorIntegration = await ethers.getContractFactory("AIAdvisorIntegration");
        aiAdvisor = await AIAdvisorIntegration.deploy(
            await mockRouter.getAddress(),
            subscriptionId,
            donId,
            ethers.encodeBytes32String("advisor") // Shorter identifier
        );
        await aiAdvisor.waitForDeployment();
    });

    describe("AI Advice Flow", function () {
        it("Should request and receive AI advice", async function () {
            const startupId = 1;
            
            // Request advice
            const tx = await aiAdvisor.requestAIAdvice(startupId);
            const receipt = await tx.wait();
            
            const requestEvent = receipt?.logs.find(
                (log: any) => log.eventName === "AdviceRequested"
            );
            const requestId = requestEvent?.args?.requestId;

            // Mock the AI advice response
            const mockResponse = ethers.AbiCoder.defaultAbiCoder().encode(
                ["string", "uint256"],
                ["Invest in AI technology stack", 85]
            );
            
            await mockRouter.fulfillRequest(requestId, mockResponse, "0x");

            // Get latest advice
            const [recommendation, confidenceScore, timestamp] = await aiAdvisor.getLatestAdvice(startupId);
            
            expect(recommendation).to.equal("Invest in AI technology stack");
            expect(confidenceScore).to.equal(85);
            expect(timestamp).to.be.gt(0);
        });

        it("Should maintain historical advice", async function () {
            const startupId = 1;
            
            // First advice request
            const tx1 = await aiAdvisor.requestAIAdvice(startupId);
            const receipt1 = await tx1.wait();
            const requestId1 = receipt1?.logs.find(
                (log: any) => log.eventName === "AdviceRequested"
            )?.args?.requestId;

            await mockRouter.fulfillRequest(
                requestId1,
                ethers.AbiCoder.defaultAbiCoder().encode(
                    ["string", "uint256"],
                    ["First advice", 80]
                ),
                "0x"
            );

            // Second advice request
            const tx2 = await aiAdvisor.requestAIAdvice(startupId);
            const receipt2 = await tx2.wait();
            const requestId2 = receipt2?.logs.find(
                (log: any) => log.eventName === "AdviceRequested"
            )?.args?.requestId;

            await mockRouter.fulfillRequest(
                requestId2,
                ethers.AbiCoder.defaultAbiCoder().encode(
                    ["string", "uint256"],
                    ["Second advice", 85]
                ),
                "0x"
            );

            // Check historical advice
            const history = await aiAdvisor.getAllAdvice(startupId);
            expect(history.length).to.equal(2);
            expect(history[0].recommendation).to.equal("First advice");
            expect(history[0].confidenceScore).to.equal(80);
            expect(history[1].recommendation).to.equal("Second advice");
            expect(history[1].confidenceScore).to.equal(85);
        });

        it("Should handle request failures", async function () {
            const startupId = 1;
            
            const tx = await aiAdvisor.requestAIAdvice(startupId);
            const receipt = await tx.wait();
            
            const requestEvent = receipt?.logs.find(
                (log: any) => log.eventName === "AdviceRequested"
            );
            const requestId = requestEvent?.args?.requestId;

            // Mock a failed request
            const errorMessage = ethers.encodeBytes32String("API error");
            await mockRouter.fulfillRequest(requestId, "0x", errorMessage);

            // Verify failed request event was emitted
            const failedEvent = await aiAdvisor.queryFilter(aiAdvisor.filters.RequestFailed());
            expect(failedEvent[0].args?.requestId).to.equal(requestId);

            // Verify no advice was stored
            await expect(
                aiAdvisor.getLatestAdvice(startupId)
            ).to.be.revertedWith("No advice available");
        });
    });

    describe("Configuration", function () {
        it("Should allow owner to update configuration", async function () {
            const newSubscriptionId = 2;
            const newDonId = ethers.id("functions-don-2");
            const newGasLimit = 400000;
            
            await aiAdvisor.updateConfig(
                newSubscriptionId,
                newDonId,
                newGasLimit,
                ethers.encodeBytes32String("new source")
            );

            // Verify new config by making a request
            const tx = await aiAdvisor.requestAIAdvice(1);
            const receipt = await tx.wait();
            expect(receipt.status).to.equal(1);
        });

        it("Should prevent non-owners from updating configuration", async function () {
            await expect(
                aiAdvisor.connect(user).updateConfig(
                    2,
                    ethers.id("functions-don-2"),
                    400000,
                    ethers.encodeBytes32String("new source")
                )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Error Handling", function () {
        it("Should handle non-existent startup gracefully", async function () {
            await expect(
                aiAdvisor.getLatestAdvice(999)
            ).to.be.revertedWith("No advice available");
        });
    });
});