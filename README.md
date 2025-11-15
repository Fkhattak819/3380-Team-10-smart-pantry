# SmartPantry

A pantry management app to track your food inventory and find recipes based on what you have.

## How to Run

1. Install dependencies:
```bash
npm install
```

2. Start the dev server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (usually http://localhost:3000)

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
