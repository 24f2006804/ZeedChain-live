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

        // Configure typechain-types handling
        config.module.rules.push({
            test: /\.ts$/,
            include: /web3\/typechain-types/,
            use: [
                {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        configFile: '/home/agnij/Desktop/ZeedChain-live/web3/tsconfig.json'
                    }
                }
            ]
        });

        return config;
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
