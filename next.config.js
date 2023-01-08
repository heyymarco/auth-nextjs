/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: false,
    
    webpack: (config) => {
        config.experiments = {
            ...config.experiments,
            ...{
                topLevelAwait: true
            }
        }
        return config
    },
}

module.exports = nextConfig