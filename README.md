# Smart Pantry

A smart pantry management system created by Team 10.

## Overview

The Smart Pantry is a food inventory and meal suggestion site that aims to help its users monitor and use their ingredients effectively. It allows users to track their ingredients, optimize food storage, and overall discover recipes that can be made with what they already have. 

The goal of this project is to reduce food waste, encourage healthier eating, and make meal planning easier through a understandable interface.

## Features

- Inventory tracking
    - add, edit, and remove ingredients from your digital pantry
- Possible expiration monitoring
    - a one click area to see what may need to be replaced soon
- Recipe matching
    - automatically generate recipe suggestions based on available ingredients
- Showcasing healthy meal alternatives
    - discover healthier options based on ingredients or selected recipes
- Present missing items
    - quickly see what is missing for a particular recipe
- User-friendly interface
    - simple design for an amazing user experience

## How to Run

1. Install dependencies:
```bash
npm install
cd backend
pip install -r requirements.txt
```

2. Set up database:
   - Create database: `PantryDatabase`
   - Run `backend/init.sql` to create tables
   - Run `backend/seed_recipes.sql` to populate recipes
   - Run `backend/seed_user.sql` to create test user

3. Configure `.env` file (in project root):
```
DB_SERVER=localhost\\SQLEXPRESS,1433
DB_DATABASE=PantryDatabase
DB_USER=pantry_user
DB_PASSWORD=your_password
```

4. Configure backend API URL (if using remote backend via ngrok):
   Create `frontend/.env` (or `.env.local`) with:
   ```
   VITE_API_URL=https://your-ngrok-url.ngrok-free.dev/api
   ```
   If not set, the app defaults to the configured ngrok URL.

5. Start the frontend dev server:
```bash
npm run dev
```

6. Open your browser to the URL shown in the terminal (usually http://localhost:3000).

## What It Does

- Track items in your pantry with expiry dates
- Filter items by status (expiring soon, etc.)
- Get recipe suggestions based on available ingredients
- View recipe details with ingredients and instructions

## Project Structure

- `frontend/src/components/` - React components
- `frontend/src/models/` - Data models (PantryItem, Recipe)
- `frontend/src/services/` - Business logic
- `backend/` - Flask API and database scripts

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Tech Used

- React
- Vite
- Tailwind CSS
- Flask (Python)
- SQL Server

## Class Team

Team 10 - CSC 3380: Object Oriented Design  
Andrew Underwood, Hammaad Alam, Tyler Gates, Fahd Khattak, Madison Nguyen

## License

This project is part of a CSC 3380 course assignment for LSU.  
Currently for educational use, not distribution.
