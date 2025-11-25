# Backend Connection Setup Guide

## ✅ What's Been Done

1. **Merged dev branch** - Flask backend is now in your current branch
2. **Configured Vite proxy** - Frontend requests to `/api/*` are proxied to Flask backend
3. **Updated frontend components** - RecipeList and InventoryList now use Flask API
4. **Created requirements.txt** - Python dependencies listed

## 🚀 How to Run

### Step 1: Install Python Dependencies

```bash
pip install -r backend/requirements.txt
```

Or install individually:
```bash
pip install flask flask-cors pyodbc python-dotenv werkzeug
```

### Step 2: Set Up Database

Make sure your SQL Server database is set up:
1. Create database: `PantryDatabase`
2. Run `backend/init.sql` to create tables
3. Run `backend/seed_recipes.sql` to populate recipes
4. Run `backend/seed_user.sql` to create test user

### Step 3: Configure Environment Variables

Make sure your `.env` file exists with:
```
DB_SERVER=localhost\\SQLEXPRESS,1433
DB_DATABASE=PantryDatabase
DB_USER=pantry_user
DB_PASSWORD=your_password
```

### Step 4: Start Flask Backend

In Terminal 1:
```bash
cd backend
python app.py
```

The backend will run on `http://localhost:5000`

### Step 5: Start React Frontend

In Terminal 2:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔌 API Endpoints

The Flask backend provides these endpoints:

- `GET /api/hello` - Test endpoint
- `GET /api/recipes/matches?userId=1` - Get recipe matches for user
- `GET /api/pantry?userId=1` - Get user's pantry items
- `POST /api/pantry/add` - Add item to pantry
- `DELETE /api/pantry?userId=1&ingredientName=egg` - Remove item from pantry
- `GET /api/recipe/<recipe_id>` - Get recipe details
- `GET /api/ingredients/search?q=egg` - Search ingredients

## 📝 Frontend Changes

### RecipeList Component
- Now fetches from `/api/recipes/matches?userId=1`
- Displays match percentages from backend
- Filters recipes by match percentage

### InventoryList Component  
- Now fetches from `/api/pantry?userId=1`
- Loads pantry items from database

## 🔧 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify database connection in `.env`
- Make sure all Python dependencies are installed

### Frontend can't connect to backend
- Make sure Flask backend is running on port 5000
- Check browser console for CORS errors
- Verify Vite proxy configuration in `frontend/vite.config.js`

### Database connection errors
- Verify SQL Server is running
- Check `.env` file has correct credentials
- Ensure database `PantryDatabase` exists

## 📌 Next Steps

1. **User Authentication** - The backend has user registration/login endpoints
2. **Dynamic User ID** - Currently hardcoded to `userId=1`, make it dynamic
3. **Add/Remove Pantry Items** - Wire up the add/remove buttons to API calls
4. **Error Handling** - Add better error messages for users

## 🎯 Testing

Test the API directly:
```bash
# Test backend is running
curl http://localhost:5000/api/hello

# Get recipes for user 1
curl http://localhost:5000/api/recipes/matches?userId=1

# Get pantry for user 1
curl http://localhost:5000/api/pantry?userId=1
```

