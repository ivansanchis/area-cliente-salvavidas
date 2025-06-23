import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Desactivar ESLint durante el build para deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Mantener verificación de TypeScript
    ignoreBuildErrors: false,
  },
};

export default nextConfig;