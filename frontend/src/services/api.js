// Centralized API helper so the frontend talks to the Flask backend consistently.
// `VITE_API_BASE` lets you point to a remote backend in production; during dev we proxy `/api`.
export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function apiFetch(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options);
  return response;
}
