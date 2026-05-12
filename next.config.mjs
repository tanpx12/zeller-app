/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // Static export: no route handlers, Server Actions, or middleware.
  // Build artifact lands in ./out/ and is served by the Rust backend (tower-http::ServeDir)
  // or any static file server.
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_BUILD_SHA: process.env.NEXT_PUBLIC_BUILD_SHA ?? '',
  },
}

export default nextConfig
