/** @type {import('next').NextConfig} */
const nextConfig = {
  // Every page is generated at build time as plain HTML, so the site is fully static.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
