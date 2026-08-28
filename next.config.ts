import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma Compute menjalankan Next.js dari output standalone (server.js).
  output: "standalone",
  // Jangan bundle Prisma — biar client + query engine ikut apa adanya ke standalone.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
