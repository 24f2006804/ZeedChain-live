/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_EQUITY_NFT_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_EQUITY_NFT_FACTORY_ADDRESS,
        NEXT_PUBLIC_FRACTIONAL_INVESTMENT_ADDRESS: process.env.NEXT_PUBLIC_FRACTIONAL_INVESTMENT_ADDRESS,
        NEXT_PUBLIC_STAKEHOLDER_GOVERNANCE_ADDRESS: process.env.NEXT_PUBLIC_STAKEHOLDER_GOVERNANCE_ADDRESS,
        NEXT_PUBLIC_PROFIT_DISTRIBUTION_ADDRESS: process.env.NEXT_PUBLIC_PROFIT_DISTRIBUTION_ADDRESS,
        NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
        NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL
    },
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
            net: false,
            tls: false
        };
        return config;
    },
    images: {
        domains: ['zeedchain.io'],
    },

}

export default nextConfig;
