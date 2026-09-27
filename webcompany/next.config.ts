import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Only trusted, repo-committed SVG placeholders live under /uploads/projects.
    // The admin upload API rejects SVG uploads, so this stays safe.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
