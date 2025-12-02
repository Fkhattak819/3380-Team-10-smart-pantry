// API helper for talking to backend
// VITE_API_URL should be set in environment variables (e.g., .env file)
// Falls back to localhost for local development only
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
if (!import.meta.env.VITE_API_URL) {
  console.warn('⚠️  VITE_API_URL not set. Using localhost fallback. Set VITE_API_URL in .env for production.');
} else {
  console.log('✅ Using API URL:', BASE_URL);
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    // Bypass Ngrok landing page when applicable
    'ngrok-skip-browser-warning': 'true'
  };
}

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
  console.log('📦 Response text:', text);
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    console.log('✅ Parsed JSON:', parsed);
    return parsed;
  } catch (e) {
    console.log('⚠️ Failed to parse JSON, returning text:', text);
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

export async function searchRecipes(query, maxTime = null, minCal = null, maxCal = null, diets = '') {
  const params = new URLSearchParams({ q: query });
  if (maxTime) params.append('maxTime', maxTime);
  if (minCal) params.append('minCal', minCal);
  if (maxCal) params.append('maxCal', maxCal);
  if (diets) params.append('diets', diets);
  
  const response = await fetch(`${BASE_URL}/recipes/search?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders()
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

export async function getUserPreferences(userId) {
  const response = await fetch(`${BASE_URL}/users/preferences?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function saveUserPreferences(userId, diets) {
  const response = await fetch(`${BASE_URL}/users/preferences`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId, diets })
  });
  return handleResponse(response);
}

// --- AUTH API FUNCTIONS ---

export async function login(username, password) {
  try {
    const url = `${BASE_URL}/users/login`;
    console.log('🔐 Attempting login to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password })
    });
    
    console.log('📡 Login response status:', response.status, response.statusText);
    
    // Handle non-OK responses by returning error object instead of throwing
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        console.log('❌ Login error response:', errorData);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON (e.g., HTML 404 page), use status message
        if (response.status === 404) {
          errorMessage = 'Endpoint not found. Make sure the backend has the latest code with auth routes.';
        }
      }
      return { error: errorMessage };
    }
    
    const result = await handleResponse(response);
    console.log('✅ Login success response:', result);
    return result;
  } catch (error) {
    // Network errors or fetch failures
    console.error('💥 Login network error:', error);
    return { error: error.message || 'Connection failed. Make sure the backend is accessible.' };
  }
}

export async function signup(username, password) {
  try {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password })
    });
    
    // Handle non-OK responses by returning error object instead of throwing
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If response is not JSON (e.g., HTML 404 page), use status message
        if (response.status === 404) {
          errorMessage = 'Endpoint not found. Make sure the backend has the latest code with auth routes.';
        }
      }
      return { error: errorMessage };
    }
    
    return handleResponse(response);
  } catch (error) {
    // Network errors or fetch failures
    return { error: error.message || 'Connection failed. Make sure the backend is accessible.' };
  }
}
