/** @type {import('next').NextConfig} */
const nextConfig = {

    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "sharp$": false,
            "onnxruntime-node$": false,
        }
        return config;
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "picsum.photos",
            }
        ]
    }
};

module.exports = nextConfig
