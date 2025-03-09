# ZeedChain

A decentralized application built on top of EDUChain that enables students to list their startups, complete KYC verification, and raise funding in exchange for equity. Investors can purchase equity and receive an NFT share representing their stake, while both founders and investors enjoy dedicated dashboards to track funds received and contributed.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture & Technologies](#architecture--technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Usage](#usage)
  - [For Founders](#for-founders)
  - [For Investors](#for-investors)
- [KYC Process](#kyc-process)
- [Dashboards](#dashboards)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

This application leverages modern web and blockchain technologies to provide a seamless platform where student entrepreneurs can list their startups and seek funding by offering equity. The system requires founders to complete a Know Your Customer (KYC) process before posting their startup, ensuring a secure and compliant ecosystem. Investors can review startups, purchase equity tokens, and receive NFT shares as a form of proof-of-investment.

---

## Features

- **Startup Listings:** Students can list their startup projects with detailed information.
- **KYC Verification:** Mandatory KYC process for founders to ensure authenticity.
- **Funding via Equity:** Investors purchase equity in startups, receiving NFT shares in return.
- **Investor Dashboard:** Monitor investments, track funds donated, and view NFT holdings.
- **Founder Dashboard:** Keep track of funds raised and investor interactions.
- **Decentralized Infrastructure:** Built using Solidity smart contracts integrated into the platform via EDUChain.
- **Modern UI/UX:** Crafted with Next.js and styled using Tailwind CSS for a responsive, dynamic experience.

---

## Architecture & Technologies

- **Frontend:** [Next.js](https://nextjs.org/) for server-side rendering and a seamless user experience.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a fast, responsive, and customizable design.
- **Smart Contracts:** Written in [Solidity](https://docs.soliditylang.org/) to manage equity transactions and NFT minting.
- **Blockchain:** Built on top of [EDUChain](#) for secure, transparent transactions.
- **Dashboards:** Separate dashboards for founders and investors provide tailored insights and transaction histories.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- A development blockchain network (e.g., [Ganache](https://www.trufflesuite.com/ganache)) or access to the EDUChain testnet/mainnet
- MetaMask or another Web3 wallet

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/your-app-repo.git
   cd your-app-repo

Install Dependencies
npm install
# or
yarn install


Compile Smart Contracts:
cd contracts
truffle compile
# or use Hardhat: npx hardhat compile


Environment Setup
NEXT_PUBLIC_API_URL=your_api_url_here
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=your_network_identifier
PRIVATE_KEY=your_private_key (for deployment only, keep secure!)
EDUCHAIN_API_KEY=your_educhain_api_key


Contributing
Contributing






Deployment

truffle migrate --network your_network
# or with Hardhat: npx hardhat run scripts/deploy.js --network your_network

Deploy Next.js App:
npm run build
npm run start


Contributions are welcome! To contribute:

Fork the repository.
Create a feature branch (git checkout -b feature/YourFeature).
Commit your changes.
Open a pull request with a detailed description of your changes.
