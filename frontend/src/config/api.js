// API Configuration
// This file centralizes the API base URL for easy updates

// Use ngrok tunnel URL for backend access
export const API_BASE_URL = 'https://epistemic-postnasal-reid.ngrok-free.dev';

// Helper function to build API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

