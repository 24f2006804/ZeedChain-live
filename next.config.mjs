/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
            net: false,
            tls: false,
            ethers: require.resolve('ethers')
        };

        // Add web3 directory to module resolution paths
        config.resolve.modules.push('/home/agnij/Desktop/ZeedChain-live/web3');

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

        // Use absolute paths for web3 imports
        config.resolve.alias = {
            ...config.resolve.alias,
            '@web3': '/home/agnij/Desktop/ZeedChain-live/web3'
        };

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
