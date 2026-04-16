/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = isStaticExport ? "/piggers" : "";

const nextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.31.155", "172.18.0.1", "192.168.0.6"],
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        basePath
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  },
  images: {
    unoptimized: isStaticExport,
    formats: ["image/avif", "image/webp"]
  }
};

export default nextConfig;
