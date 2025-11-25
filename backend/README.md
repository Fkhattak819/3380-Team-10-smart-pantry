# Backend Directory

This directory contains all backend-related files for the Smart Pantry application.

## Structure

- `app.py` - Main Flask application with API endpoints
- `cal_and_serv.py` - Helper script for calculating calories and servings
- `seed_from_API.py` - Script to seed database from external API
- `requirements.txt` - Python dependencies

## Database Scripts

- `init.sql` - Creates database schema (tables)
- `seed_recipes.sql` - Populates recipes, ingredients, and tags
- `seed_user.sql` - Creates test user with sample pantry
- `clear_API_data.sql` - Clears API-sourced data
- `consolidate.sql` - Database consolidation script
- `unit_extension.sql` - Unit extension script

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure environment variables in `.env` file (in project root):
   ```
   DB_SERVER=localhost\\SQLEXPRESS,1433
   DB_DATABASE=PantryDatabase
   DB_USER=pantry_user
   DB_PASSWORD=your_password
   ```

3. Set up database:
   - Run `init.sql` to create tables
   - Run `seed_recipes.sql` to populate recipes
   - Run `seed_user.sql` to create test user

4. Run the Flask app:
   ```bash
   python app.py
   ```

## API Endpoints

See `app.py` for all available API endpoints. The main endpoints include:

- `/api/hello` - Health check
- `/api/recipes/matches?userId=1` - Get recipe matches
- `/api/pantry?userId=1` - Get user pantry
- `/api/pantry/add` - Add item to pantry
- `/api/pantry` (DELETE) - Remove item from pantry
- `/api/recipe/<recipe_id>` - Get recipe details
- `/api/ingredients/search?q=query` - Search ingredients
- `/api/users/register` - Register new user
- `/api/users/login` - User login

