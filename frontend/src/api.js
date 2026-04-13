// Central API base URL — update this one place to change all endpoints.
export const API_BASE = "https://api.reechomedia.com";
export const API = `${API_BASE}/api`;

// Returns the auth header object for axios calls.
export const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
