/** @type {import('next').NextConfig} */

// BACKEND_URL is where the Next.js proxy forwards /api/*. Normalize it so a
// value entered with a trailing slash ("https://x.onrender.com/") or an
// accidental "/api" suffix doesn't produce a doubled/mangled path like
// "//api/health" or "/api/api/health" on the backend (both 404 in FastAPI).
const RAW = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const API = RAW.trim()
  .replace(/\/+$/, "")      // drop trailing slash(es)
  .replace(/\/api$/i, "");  // drop a trailing /api if present

const nextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API}/api/:path*` }];
  },
};
export default nextConfig;
