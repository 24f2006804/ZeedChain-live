/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['ethers'],
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
        // Add polyfills and handle node core modules
        config.resolve.fallback = {
            fs: false,
            net: false,
            tls: false
        };

        // Add support for typechain-types transpilation
        config.module.rules.push({
            test: /\.ts$/,
            include: /web3\/typechain-types/,
            use: [
                {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        configFile: 'tsconfig.json'
                    }
                }
            ]
        });

        // Allow importing ethers in typechain-types
        config.externals = [...(config.externals || []), { ethers: 'ethers' }];

        return config;
    },
    images: {
        domains: ['zeedchain.io'],
    },
    eslint: {
        ignoreDuringBuilds: true, // Ignores ESLint errors during build
    },
    typescript: {
        ignoreBuildErrors: true, // Ignores TypeScript errors during build
    },
}

export default nextConfig;
