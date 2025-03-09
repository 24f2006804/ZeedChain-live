/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['ethers'],
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
            net: false,
            tls: false
        };

        config.resolve.extensionAlias = {
            '.js': ['.ts', '.js']
        };

        config.module.rules.push({
            test: /\.m?js$/,
            type: "javascript/auto",
            resolve: {
                fullySpecified: false
            }
        });

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

        return config;
    },
    env: {
        NEXT_PUBLIC_EQUITY_NFT_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_EQUITY_NFT_FACTORY_ADDRESS,
        NEXT_PUBLIC_FRACTIONAL_INVESTMENT_ADDRESS: process.env.NEXT_PUBLIC_FRACTIONAL_INVESTMENT_ADDRESS,
        NEXT_PUBLIC_STAKEHOLDER_GOVERNANCE_ADDRESS: process.env.NEXT_PUBLIC_STAKEHOLDER_GOVERNANCE_ADDRESS,
        NEXT_PUBLIC_PROFIT_DISTRIBUTION_ADDRESS: process.env.NEXT_PUBLIC_PROFIT_DISTRIBUTION_ADDRESS,
        NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
        NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL
    },
    images: {
        domains: ['zeedchain.io'],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
}

export default nextConfig;
