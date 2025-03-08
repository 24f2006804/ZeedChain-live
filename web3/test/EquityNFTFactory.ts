import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EquityNFTFactory } from "../typechain-types";

describe("EquityNFTFactory", function () {
    let equityNFTFactory: EquityNFTFactory;
    let owner: SignerWithAddress;
    let founder: SignerWithAddress;
    let validator: SignerWithAddress;
    let nonOwner: SignerWithAddress;

    const STARTUP_NAME = "Test Startup";
    const STARTUP_DESC = "Test Description";
    const TOTAL_SHARES = 1000000;
    const INITIAL_VALUATION = ethers.parseEther("1000000"); // 1M ETH

    beforeEach(async function () {
        [owner, founder, validator, nonOwner] = await ethers.getSigners();

        const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
        equityNFTFactory = await EquityNFTFactory.deploy();

        // Add validator to the validators list
        await equityNFTFactory.addValidator(validator.address);
    });

    describe("Startup Registration", function () {
        it("Should allow startup registration", async function () {
            await expect(
                equityNFTFactory.connect(founder).registerStartup(
                    STARTUP_NAME,
                    STARTUP_DESC,
                    TOTAL_SHARES,
                    INITIAL_VALUATION
                )
            ).to.emit(equityNFTFactory, "StartupRegistered");
        });

        it("Should fail with invalid parameters", async function () {
            await expect(
                equityNFTFactory.connect(founder).registerStartup(
                    "",
                    STARTUP_DESC,
                    TOTAL_SHARES,
                    INITIAL_VALUATION
                )
            ).to.be.revertedWith("Name cannot be empty");

            await expect(
                equityNFTFactory.connect(founder).registerStartup(
                    STARTUP_NAME,
                    STARTUP_DESC,
                    0,
                    INITIAL_VALUATION
                )
            ).to.be.revertedWith("Total shares must be greater than 0");
        });

        it("Should set correct startup details", async function () {
            await equityNFTFactory.connect(founder).registerStartup(
                STARTUP_NAME,
                STARTUP_DESC,
                TOTAL_SHARES,
                INITIAL_VALUATION
            );

            const startup = await equityNFTFactory.getStartupDetails(1);
            expect(startup.name).to.equal(STARTUP_NAME);
            expect(startup.description).to.equal(STARTUP_DESC);
            expect(startup.totalShares).to.equal(TOTAL_SHARES);
            expect(startup.availableShares).to.equal(TOTAL_SHARES);
            expect(startup.valuation).to.equal(INITIAL_VALUATION);
            expect(startup.founder).to.equal(founder.address);
            expect(startup.isValidated).to.be.false;
        });
    });

    describe("Startup Validation", function () {
        let startupId: number;

        beforeEach(async function () {
            const tx = await equityNFTFactory.connect(founder).registerStartup(
                STARTUP_NAME,
                STARTUP_DESC,
                TOTAL_SHARES,
                INITIAL_VALUATION
            );
            const receipt = await tx.wait();
            const event = receipt.logs.find((e: any) => e.eventName === "StartupRegistered");
            startupId = event?.args?.tokenId?.toString();
        });

        it("Should allow validation by authorized validator", async function () {
            await expect(
                equityNFTFactory.connect(validator).validateStartup(startupId, true)
            ).to.emit(equityNFTFactory, "StartupValidated");
        });

        it("Should prevent validation by non-validator", async function () {
            await expect(
                equityNFTFactory.connect(nonOwner).validateStartup(startupId, true)
            ).to.be.revertedWith("Not a validator");
        });

        it("Should update validation status correctly", async function () {
            await equityNFTFactory.connect(validator).validateStartup(startupId, true);
            const startup = await equityNFTFactory.getStartupDetails(startupId);
            expect(startup.isValidated).to.be.true;
        });
    });

    describe("Trusted Issuer Management", function () {
        it("Should allow owner to add trusted issuer", async function () {
            await expect(
                equityNFTFactory.connect(owner).addTrustedIssuer(nonOwner.address)
            ).to.emit(equityNFTFactory, "TrustedIssuerUpdated");
        });

        it("Should prevent non-owner from adding trusted issuer", async function () {
            await expect(
                equityNFTFactory.connect(nonOwner).addTrustedIssuer(nonOwner.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should allow owner to remove trusted issuer", async function () {
            await equityNFTFactory.connect(owner).addTrustedIssuer(nonOwner.address);
            await expect(
                equityNFTFactory.connect(owner).removeTrustedIssuer(nonOwner.address)
            ).to.emit(equityNFTFactory, "TrustedIssuerUpdated");
        });
    });

    describe("Share Issuance", function () {
        let startupId: number;

        beforeEach(async function () {
            const tx = await equityNFTFactory.connect(founder).registerStartup(
                STARTUP_NAME,
                STARTUP_DESC,
                TOTAL_SHARES,
                INITIAL_VALUATION
            );
            const receipt = await tx.wait();
            const event = receipt.logs.find((e: any) => e.eventName === "StartupRegistered");
            startupId = event?.args?.tokenId?.toString();

            // Validate the startup
            await equityNFTFactory.connect(validator).validateStartup(startupId, true);
        });

        it("Should issue shares through trusted issuer", async function () {
            // Add nonOwner as trusted issuer
            await equityNFTFactory.addTrustedIssuer(nonOwner.address);

            await expect(
                equityNFTFactory.connect(nonOwner).issueShares(startupId, founder.address, 100)
            ).to.emit(equityNFTFactory, "SharesIssued");

            const startup = await equityNFTFactory.getStartupDetails(startupId);
            expect(startup.availableShares).to.equal(TOTAL_SHARES - 100);
        });

        it("Should prevent non-trusted issuers from issuing shares", async function () {
            await expect(
                equityNFTFactory.connect(nonOwner).issueShares(startupId, founder.address, 100)
            ).to.be.revertedWith("Only founder or trusted issuer can issue shares");
        });
    });
});