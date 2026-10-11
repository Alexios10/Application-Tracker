// Base URL for all API calls.
// Production: empty string, so calls go through the Vercel proxy (/api/** -> Railway).
// Local: VITE_API_BASE in .env.development, e.g. http://localhost:5242
export const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:5242"
).replace(/\/+$/, "");
