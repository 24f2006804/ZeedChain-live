import { expect } from "chai";
import { ethers } from "hardhat";
import { type Log, type EventLog } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { VerificationOracle, MockFunctionsRouter } from "../typechain-types";
import fs from "fs";
import path from "path";

describe("VerificationOracle", function () {
    let verificationOracle: VerificationOracle;
    let mockRouter: MockFunctionsRouter;
    let owner: HardhatEthersSigner;
    let user: HardhatEthersSigner;
    
    const subscriptionId = 1n;
    const donId = ethers.id("functions-don-1");

    // Load mock sources
    const kycSource = fs.readFileSync(
        path.join(__dirname, "mock-sources/kyc.js"),
        "utf8"
    );
    const amlSource = fs.readFileSync(
        path.join(__dirname, "mock-sources/aml.js"),
        "utf8"
    );
    const credentialsSource = fs.readFileSync(
        path.join(__dirname, "mock-sources/credentials.js"),
        "utf8"
    );

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        // Deploy mock Functions Router
        const MockRouter = await ethers.getContractFactory("MockFunctionsRouter");
        mockRouter = await MockRouter.deploy();
        await mockRouter.waitForDeployment();

        // Deploy VerificationOracle with shorter source identifiers
        const VerificationOracle = await ethers.getContractFactory("VerificationOracle");
        verificationOracle = await VerificationOracle.deploy(
            await mockRouter.getAddress(),
            subscriptionId,
            donId,
            ethers.encodeBytes32String("kyc"),  // Shorter identifiers
            ethers.encodeBytes32String("aml"),
            ethers.encodeBytes32String("cred")
        );
        await verificationOracle.waitForDeployment();
    });

    describe("Verification Flow", function () {
        it("Should process full verification flow successfully", async function () {
            const tx = await verificationOracle.requestVerification(user.address, "documentHash123");
            const receipt = await tx.wait();
            if (!receipt) throw new Error("Transaction failed");

            // Get request ID from event
            const kycRequestEvent = receipt.logs.find(
                (log) => log.fragment?.name === 'VerificationRequested'
            );
            if (!kycRequestEvent) throw new Error("No KYC request event emitted");
            const kycRequestId = kycRequestEvent.args?.[0];

            // Mock success response for KYC
            await mockRouter.fulfillRequest(
                kycRequestId,
                ethers.AbiCoder.defaultAbiCoder().encode(["bool"], [true]),
                "0x"
            );

            // Get AML request event
            const amlBlock = await ethers.provider.getBlock('latest');
            if (!amlBlock) throw new Error("Block not found");
            const amlRequestEvent = (await verificationOracle.queryFilter(
                verificationOracle.filters.VerificationRequested(),
                amlBlock.number - 1,
                amlBlock.number
            )).pop();
            if (!amlRequestEvent) throw new Error("AML request event not found");
            const amlRequestId = amlRequestEvent.args[0];

            // Mock success response for AML
            await mockRouter.fulfillRequest(
                amlRequestId,
                ethers.AbiCoder.defaultAbiCoder().encode(["bool"], [true]),
                "0x"
            );

            // Get credentials request event
            const credBlock = await ethers.provider.getBlock('latest');
            if (!credBlock) throw new Error("Block not found");
            const credRequestEvent = (await verificationOracle.queryFilter(
                verificationOracle.filters.VerificationRequested(),
                credBlock.number - 1,
                credBlock.number
            )).pop();
            if (!credRequestEvent) throw new Error("Credentials request event not found");
            const credRequestId = credRequestEvent.args[0];

            // Mock success response for credentials
            await mockRouter.fulfillRequest(
                credRequestId,
                ethers.AbiCoder.defaultAbiCoder().encode(
                    ["string", "string"],
                    ["0x1234567890abcdef", "Mock Verification Service"]
                ),
                "0x"
            );

            // Check final verification status
            const status = await verificationOracle.getVerificationStatus(user.address);
            expect(status.kycPassed).to.be.true;
            expect(status.amlPassed).to.be.true;
            expect(status.credentialHash).to.equal("0x1234567890abcdef");
            expect(status.verificationSource).to.equal("Mock Verification Service");
            expect(status.isValid).to.be.true;
        });

        it("Should handle KYC verification failure", async function () {
            const tx = await verificationOracle.requestVerification(user.address, "documentHash123");
            const receipt = await tx.wait();
            if (!receipt) throw new Error("Transaction failed");

            // Get request ID from event
            const kycRequestEvent = receipt.logs.find(
                (log) => log.fragment?.name === 'VerificationRequested'
            );
            if (!kycRequestEvent) throw new Error("No KYC request event emitted");
            const kycRequestId = kycRequestEvent.args?.[0];

            // Mock failure response for KYC
            await mockRouter.fulfillRequest(
                kycRequestId,
                ethers.AbiCoder.defaultAbiCoder().encode(["bool"], [false]),
                "0x"
            );

            // Check verification status
            const status = await verificationOracle.getVerificationStatus(user.address);
            expect(status.kycPassed).to.be.false;
            expect(status.amlPassed).to.be.false;
            expect(status.credentialHash).to.equal("");
            expect(status.verificationSource).to.equal("KYC Failed");
            expect(status.isValid).to.be.true;
        });

        it("Should handle AML verification failure", async function () {
            const tx = await verificationOracle.requestVerification(user.address, "documentHash123");
            const receipt = await tx.wait();
            if (!receipt) throw new Error("Transaction failed");

            // Get request ID from event
            const kycRequestEvent = receipt.logs.find(
                (log) => log.fragment?.name === 'VerificationRequested'
            );
            if (!kycRequestEvent) throw new Error("No KYC request event emitted");
            const kycRequestId = kycRequestEvent.args?.[0];

            // Mock success response for KYC
            await mockRouter.fulfillRequest(
                kycRequestId,
                ethers.AbiCoder.defaultAbiCoder().encode(["bool"], [true]),
                "0x"
            );

            // Get AML request event
            const amlBlock = await ethers.provider.getBlock('latest');
            if (!amlBlock) throw new Error("Block not found");
            const amlRequestEvent = (await verificationOracle.queryFilter(
                verificationOracle.filters.VerificationRequested(),
                amlBlock.number - 1,
                amlBlock.number
            )).pop();
            if (!amlRequestEvent) throw new Error("AML request event not found");
            const amlRequestId = amlRequestEvent.args[0];

            // Mock failure response for AML
            await mockRouter.fulfillRequest(
                amlRequestId,
                ethers.AbiCoder.defaultAbiCoder().encode(["bool"], [false]),
                "0x"
            );

            // Check verification status
            const status = await verificationOracle.getVerificationStatus(user.address);
            expect(status.kycPassed).to.be.true;
            expect(status.amlPassed).to.be.false;
            expect(status.credentialHash).to.equal("");
            expect(status.verificationSource).to.equal("AML Check Failed");
            expect(status.isValid).to.be.true;
        });
    });

    describe("Configuration", function () {
        it("Should allow owner to update configuration", async function () {
            const newSubscriptionId = 2n;
            const newDonId = ethers.id("functions-don-2");
            const newGasLimit = 400000;
            
            await verificationOracle.updateConfig(
                newSubscriptionId,
                newDonId,
                newGasLimit,
                ethers.encodeBytes32String("new kyc source"),
                ethers.encodeBytes32String("new aml source"),
                ethers.encodeBytes32String("new credentials source")
            );

            // Verify new config by making a request
            const tx = await verificationOracle.requestVerification(user.address, "documentHash123");
            const receipt = await tx.wait();
            expect(receipt?.status).to.equal(1);
        });

        it("Should prevent non-owners from updating configuration", async function () {
            await expect(
                verificationOracle.connect(user).updateConfig(
                    2n,
                    ethers.id("functions-don-2"),
                    400000,
                    ethers.encodeBytes32String("new kyc source"),
                    ethers.encodeBytes32String("new aml source"),
                    ethers.encodeBytes32String("new credentials source")
                )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});