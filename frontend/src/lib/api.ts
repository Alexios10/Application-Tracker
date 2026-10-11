// Base-URL for alle API-kall.
// Produksjon: tom streng, så kallene går via Vercel-proxyen (/api/** -> Railway).
// Lokalt: VITE_API_BASE i .env.development, f.eks. http://localhost:5242
export const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:5242"
).replace(/\/+$/, "");
