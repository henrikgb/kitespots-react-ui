/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-leaflet-cluster"],
  images: {
    // Kite spot images are served directly from the public, read-only "location-images"
    // Blob Storage container (see AZURE_BLOB_PUBLIC_BASE_URL / LocationsRepository) rather
    // than through a Next.js proxy - next/image requires the hostname to be allow-listed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kitespotsad77.blob.core.windows.net",
        pathname: "/location-images/**",
      },
    ],
  },
}

module.exports = nextConfig;
