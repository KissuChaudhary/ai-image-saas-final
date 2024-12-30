
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['fal.media', 'replicate.delivery'], // Add any domains you're loading images from
  },
  async redirects() {
    return [
      // Add any necessary redirects here
    ]
  },
  async rewrites() {
    return [
      // Add any necessary rewrites here
    ]
  },
}

module.exports = nextConfig

