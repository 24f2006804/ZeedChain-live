// Helper function to convert decimal to hex chainId with proper MetaMask formatting
const toHexChainId = (num: number): string => {
  return `0x${num.toString(16)}`; // Simple conversion without padding
};

export const NETWORK_CONFIG = {
  chainId: 656476,
  chainIdHex: toHexChainId(656476),  // Will be "0xa0534"
  chainName: "OpenCampus CodeX Testnet",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: ["https://rpc.open-campus-codex.gelato.digital"],
  blockExplorerUrls: ["https://opencampus-codex.blockscout.com"]
};

// Helper function to convert hex to decimal chainId
export const fromHex = (hex: string): number => {
  return parseInt(hex.toLowerCase(), 16);
};

// MetaMask compatible network config
export const CHAIN_CONFIG = {
  chainId: NETWORK_CONFIG.chainIdHex,
  chainName: NETWORK_CONFIG.chainName,
  nativeCurrency: NETWORK_CONFIG.nativeCurrency,
  rpcUrls: NETWORK_CONFIG.rpcUrls,
  blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrls
};

// Contract addresses
export const CONTRACT_ADDRESSES = {
  EquityNFTFactory: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "",
  VerificationOracle: process.env.NEXT_PUBLIC_VERIFICATION_ORACLE || "",
  FinancialDataOracle: process.env.NEXT_PUBLIC_FINANCIAL_ORACLE || "",
  PerformanceMetricsOracle: process.env.NEXT_PUBLIC_PERFORMANCE_ORACLE || "",
  AIAdvisorIntegration: process.env.NEXT_PUBLIC_AI_ADVISOR || "",
  StakeholderGovernance: process.env.NEXT_PUBLIC_GOVERNANCE || "",
  ProfitDistribution: process.env.NEXT_PUBLIC_PROFIT_DISTRIBUTION || "",
  DynamicValuation: process.env.NEXT_PUBLIC_DYNAMIC_VALUATION || "",
  FractionalInvestment: process.env.NEXT_PUBLIC_FRACTIONAL_INVESTMENT || "",
};