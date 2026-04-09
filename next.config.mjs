/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";
const repoName = "/piggers";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isProduction ? repoName : "",
  assetPrefix: isProduction ? repoName : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProduction ? repoName : "",
    NEXT_PUBLIC_SITE_URL: "https://monster7337.github.io"
  },
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"]
  }
};

export default nextConfig;
