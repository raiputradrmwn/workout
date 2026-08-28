import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Jangan bundle Prisma — biar client + query engine dipakai apa adanya.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
