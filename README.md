# Smart Pantry

A pantry management app that helps you track ingredients and find recipes based on what you have.

## What It Does

- Track ingredients in your pantry
- Get recipe suggestions based on what you have
- See what ingredients you're missing for recipes
- Filter recipes by diet, calories, prep time, and allergens

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Backend Setup

The backend runs on ngrok. To get the ngrok URL, email **aunde17@lsu.edu** and ask them to start the backend server.

Once you have the ngrok URL, create a file called `.env` in the `frontend` folder:

```
VITE_API_URL=https://your-ngrok-url.ngrok-free.dev/api
```

Replace `your-ngrok-url` with the actual ngrok URL you got.

### 3. Run the App

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (usually http://localhost:3000).

## How to Use

1. **Sign up** - Create an account with a username and password
2. **Add ingredients** - Go to the Pantry tab and add ingredients you have
3. **Find recipes** - Go to the Recipes tab to see recipes you can make
4. **Filter recipes** - Use the settings button to filter by diet, calories, etc.
5. **View recipe details** - Click on a recipe card to see ingredients and instructions
6. **Add missing ingredients to cart** - Click "Add Missing Ingredients" to add what you need to your shopping cart

## Tech Stack

- React (frontend)
- Vite (build tool)
- Tailwind CSS (styling)
- Flask (backend API)
- SQL Server (database)

## Project Structure

```
frontend/
  src/
    components/    # React components
    services/      # API calls and business logic
    models/        # Data models
backend/           # Flask API and database scripts
```

## Team

Team 10 - CSC 3380: Object Oriented Design  
Andrew Underwood, Hammaad Alam, Tyler Gates, Fahd Khattak, Madison Nguyen

## Notes

- Make sure the backend is running before using the app
- If you get connection errors, check that the ngrok URL in `.env` is correct
- Email aunde17@lsu.edu if you need help with the backend
