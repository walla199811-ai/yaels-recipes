/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'via.placeholder.com', 'images.unsplash.com', 'picsum.photos'],
  },
  env: {
    TEMPORAL_ADDRESS: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Exclude Cypress files from TypeScript build checking
  transpilePackages: [],
}

module.exports = nextConfig