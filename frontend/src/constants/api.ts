// Backend base URL: explicit env override first, localhost while developing,
// same-origin in production (frontend and API share a domain).
export const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");
