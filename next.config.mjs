/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = isStaticExport ? "/piggers" : "";
const siteUrl = "https://piggyland.ru";

const nextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.31.155", "172.18.0.1", "192.168.0.6", "192.168.0.14", "192.168.0.5"],
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        basePath
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: siteUrl
  },
  images: {
    unoptimized: isStaticExport,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    qualities: [60, 75]
  }
};

export default nextConfig;
