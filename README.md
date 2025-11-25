# SmartPantry

A pantry management app to track your food inventory and find recipes based on what you have.

## How to Run

1. Install dependencies:
```bash
npm install
```

2. In one terminal, start the backend (Flask on port 5001 by default):
```bash
cd backend
python app.py
```

3. In another terminal, start the frontend dev server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (usually http://localhost:3000). API calls are proxied to the backend on port 5001.

Optional: if your backend runs elsewhere, create `frontend/.env` (or `.env.local`) with:
```
VITE_API_BASE=http://your-backend-host:5001/api
```
The app will fall back to `/api` when this is not set.

## What It Does

- Track items in your pantry with expiry dates
- Filter items by status (expiring soon, etc.)
- Get recipe suggestions based on available ingredients
- View recipe details with ingredients and instructions

## Project Structure

- `frontend/src/components/` - React components
- `frontend/src/models/` - Data models (PantryItem, Recipe)
- `frontend/src/services/` - Business logic
- `frontend/public/` - JSON data files (pantry.json, recipes.json)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Tech Used

- React
- Vite
- Tailwind CSS
