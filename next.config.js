/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'via.placeholder.com', 'images.unsplash.com', 'picsum.photos'],
  },
  env: {
    TEMPORAL_ADDRESS: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  },
}

module.exports = nextConfig