// Get API URL from env vars, fallback to localhost
// Using ngrok for remote backend or localhost for dev
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get headers for API calls
// Need JSON content type and ngrok skip header
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  };
}

// Handle API response - check if ok, parse JSON, handle errors
async function handleResponse(response) {
  if (!response.ok) {
    // Try to get error from JSON, fallback to text
    const errPayload = await response.json().catch(async () => {
      const txt = await response.text().catch(() => '');
      return { error: txt || `Request failed with status ${response.status}` };
    });
    throw new Error(errPayload.error || `Request failed with status ${response.status}`);
  }
  // Parse JSON response
  const text = await response.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Not JSON, return text as is
    return text;
  }
}


// Search ingredients for autocomplete
// Need at least 2 chars to search
export async function searchIngredients(query) {
  if (!query || query.length < 2) return [];
  const response = await fetch(`${BASE_URL}/ingredients/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

// Get user's pantry items
export async function getPantry(userId) {
  const response = await fetch(`${BASE_URL}/pantry?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

// Add item to pantry
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

// Remove item from pantry
export async function removeFromPantry(userId, ingredientName) {
  const response = await fetch(`${BASE_URL}/pantry?userId=${encodeURIComponent(userId)}&ingredientName=${encodeURIComponent(ingredientName)}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}

// Get recipes that match what's in pantry
// Sorted by match percentage
export async function getRecipeMatches(userId) {
  const response = await fetch(`${BASE_URL}/recipes/matches?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

// Get full recipe details with ingredients and instructions
export async function getRecipeDetails(recipeId) {
  const response = await fetch(`${BASE_URL}/recipe/${encodeURIComponent(recipeId)}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

// Search recipes with filters (time, calories, diet)
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

// Login - send username/password, return user data or error
// Return error object instead of throwing so UI can handle it
export async function login(username, password) {
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        if (response.status === 404) {
          errorMessage = 'Endpoint not found. Make sure the backend has the latest code with auth routes.';
        }
      }
      return { error: errorMessage };
    }
    
    return handleResponse(response);
  } catch (error) {
    return { error: error.message || 'Connection failed. Make sure the backend is accessible.' };
  }
}

// Signup - create new account
export async function signup(username, password) {
  try {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        if (response.status === 404) {
          errorMessage = 'Endpoint not found. Make sure the backend has the latest code with auth routes.';
        }
      }
      return { error: errorMessage };
    }
    
    return handleResponse(response);
  } catch (error) {
    return { error: error.message || 'Connection failed. Make sure the backend is accessible.' };
  }
}
