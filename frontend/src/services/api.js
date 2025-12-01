// // Centralized API helper so the frontend talks to the Flask backend consistently.
// // `VITE_API_BASE` lets you point to a remote backend in production; during dev we proxy `/api`.
// // export const API_BASE = import.meta.env.VITE_API_BASE || '/api';
// export const API_BASE = 'https://epistemic-postnasal-reid.ngrok-free.dev';

// export async function apiFetch(path, options) {
//   const response = await fetch(`${API_BASE}${path}`, options);
//   return response;
// }

// ...existing code...
// Centralized API helper so the frontend talks to the remote backend (ngrok).
// It prefers VITE_API_URL if set, otherwise uses the provided ngrok host.
const BASE_URL = import.meta.env.VITE_API_URL || 'https://epistemic-postnasal-reid.ngrok-free.dev/api';

// --- HELPER: HEADERS ---
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    // Bypass Ngrok landing page when applicable
    'ngrok-skip-browser-warning': 'true'
  };
}

// --- HELPER: RESPONSE HANDLER ---
async function handleResponse(response) {
  if (!response.ok) {
    // try parse json error, fallback to text
    const errPayload = await response.json().catch(async () => {
      const txt = await response.text().catch(() => '');
      return { error: txt || `Request failed with status ${response.status}` };
    });
    throw new Error(errPayload.error || `Request failed with status ${response.status}`);
  }
  // Attempt to parse JSON, but return null if no body
  const text = await response.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// --- API FUNCTIONS ---

export async function searchIngredients(query) {
  if (!query || query.length < 2) return [];
  const response = await fetch(`${BASE_URL}/ingredients/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function getPantry(userId) {
  const response = await fetch(`${BASE_URL}/pantry?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function addToPantry(userId, ingredientName, quantity, unit = null) {
  const payload = { userId, ingredientName, quantity };
  if (unit) {
    payload.unit = unit;
  }
  const response = await fetch(`${BASE_URL}/pantry/add`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function removeFromPantry(userId, ingredientName) {
  const response = await fetch(`${BASE_URL}/pantry?userId=${encodeURIComponent(userId)}&ingredientName=${encodeURIComponent(ingredientName)}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function getRecipeMatches(userId) {
  const response = await fetch(`${BASE_URL}/recipes/matches?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function getRecipeDetails(recipeId) {
  const response = await fetch(`${BASE_URL}/recipe/${encodeURIComponent(recipeId)}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}


export async function getShoppingList(userId) {
  const response = await fetch(`${BASE_URL}/shopping-list?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function addToShoppingList(userId, ingredientName, quantity = 1) {
  const response = await fetch(`${BASE_URL}/shopping-list`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId, ingredientName, quantity })
  });
  return handleResponse(response);
}

export async function addMissingToShoppingList(userId, recipeId) {
  const response = await fetch(`${BASE_URL}/shopping-list/add-from-recipe`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId, recipeId })
  });
  return handleResponse(response);
}

export async function removeFromShoppingList(userId, itemId) {
  const response = await fetch(`${BASE_URL}/shopping-list?userId=${encodeURIComponent(userId)}&itemId=${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}
