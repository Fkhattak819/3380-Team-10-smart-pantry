# ====================================================================
#  PYTHON BACKEND (app.py)
# ====================================================================
#
# To run this file:
# 1. Install libraries: pip install flask pyodbc python-dotenv flask-cors
# 2. Run the app: python app.py
#
# ====================================================================

import pyodbc
from flask import Flask, request, jsonify
from flask_cors import CORS 
# NEW: Import hashing functions for security
from werkzeug.security import generate_password_hash, check_password_hash
import atexit
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# --- ENABLE CORS ---
CORS(app) 

# --- Database Connection Settings ---
DB_SERVER = os.getenv('DB_SERVER', 'localhost\\SQLEXPRESS,1433')
DB_DATABASE = os.getenv('DB_DATABASE', 'pantryDatabase')
DB_USER = os.getenv('DB_USER', 'pantry_user')
DB_PASSWORD = os.getenv('DB_PASSWORD')

if not DB_PASSWORD:
    print("WARNING: DB_PASSWORD not found in .env file.")

def get_db_connection():
    try:
        conn_string = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={DB_SERVER};"
            f"DATABASE={DB_DATABASE};"
            f"UID={DB_USER};"
            f"PWD={DB_PASSWORD};"
            f"TrustServerCertificate=yes;"
        )
        conn = pyodbc.connect(conn_string)
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

# Helper function
def sql_to_dict_list(cursor):
    columns = [column[0] for column in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

# --- API Routes ---

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello! Your Pantry API is running."})

# ==============================================================================
#  USER AUTHENTICATION
# ==============================================================================

@app.route('/api/users/register', methods=['POST'])
def register_user():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # 1. Basic Validation
    if not all([username, email, password]):
        return jsonify({"error": "Username, email, and password are required"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500

    try:
        cursor = conn.cursor()
        
        # 2. Check for Duplicates (Username OR Email)
        cursor.execute("SELECT UserID FROM Users WHERE Username = ? OR Email = ?", (username, email))
        existing_user = cursor.fetchone()
        
        if existing_user:
            return jsonify({"error": "Username or Email already exists"}), 409 # 409 = Conflict

        # 3. Hash the Password (Never store plain text!)
        # This creates a secure string like 'scrypt:32768:8:1$...'
        hashed_password = generate_password_hash(password)

        # 4. Insert the New User
        cursor.execute("""
            INSERT INTO Users (Username, Email, PasswordHash)
            VALUES (?, ?, ?)
        """, (username, email, hashed_password))
        
        conn.commit()
        
        return jsonify({"message": "User registered successfully"}), 201 # 201 = Created

    except Exception as e:
        print(f"Register Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ==============================================================================
#  INGREDIENT & PANTRY ROUTES
# ==============================================================================

@app.route('/api/ingredients/search', methods=['GET'])
def search_ingredients():
    query = request.args.get('q', '')
    if not query or len(query) < 2:
        return jsonify([])

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT TOP 10 Name, DefaultUnit 
            FROM Ingredients 
            WHERE Name LIKE ? 
            ORDER BY Name
        """, (f"%{query}%",))
        
        return jsonify(sql_to_dict_list(cursor))
    finally:
        conn.close()

@app.route('/api/pantry', methods=['GET'])
def get_pantry():
    user_id = request.args.get('userId')
    if not user_id: return jsonify({"error": "Missing userId"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.PantryID, i.Name, p.Quantity, p.Unit
            FROM Pantry p
            JOIN Ingredients i ON p.IngredientID = i.IngredientID
            WHERE p.UserID = ?
            ORDER BY i.Name
        """, (user_id,))
        return jsonify(sql_to_dict_list(cursor))
    finally:
        conn.close()

@app.route('/api/pantry/add', methods=['POST'])
def add_to_pantry():
    data = request.json
    user_id = data.get('userId')
    ingredient_name = data.get('ingredientName')
    quantity = data.get('quantity')

    if not all([user_id, ingredient_name, quantity]):
        return jsonify({"error": "Missing required data"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500

    try:
        cursor = conn.cursor()
        
        cursor.execute("SELECT IngredientID, DefaultUnit FROM Ingredients WHERE Name = ?", (ingredient_name,))
        ing_row = cursor.fetchone()
        
        if not ing_row:
            return jsonify({"error": "Ingredient not found"}), 404
        
        ing_id = ing_row.IngredientID
        default_unit = ing_row.DefaultUnit

        cursor.execute("SELECT PantryID FROM Pantry WHERE UserID = ? AND IngredientID = ?", (user_id, ing_id))
        pantry_row = cursor.fetchone()

        if pantry_row:
            cursor.execute("UPDATE Pantry SET Quantity = Quantity + ? WHERE PantryID = ?", (quantity, pantry_row.PantryID))
        else:
            cursor.execute("INSERT INTO Pantry (UserID, IngredientID, Quantity, Unit) VALUES (?, ?, ?, ?)", 
                           (user_id, ing_id, quantity, default_unit))
        
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/pantry', methods=['DELETE'])
def remove_from_pantry():
    user_id = request.args.get('userId')
    ingredient_name = request.args.get('ingredientName')

    if not all([user_id, ingredient_name]):
        return jsonify({"error": "Missing required data"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT IngredientID FROM Ingredients WHERE Name = ?", (ingredient_name,))
        ing_row = cursor.fetchone()
        
        if ing_row:
            ing_id = ing_row[0]
            cursor.execute("DELETE FROM Pantry WHERE UserID = ? AND IngredientID = ?", (user_id, ing_id))
            conn.commit()
            return jsonify({"success": True})
        else:
            return jsonify({"error": "Ingredient not found"}), 404

    finally:
        conn.close()

# ==============================================================================
#  RECIPE ROUTES
# ==============================================================================

@app.route('/api/recipes/matches', methods=['GET'])
def get_recipe_matches():
    userId = request.args.get('userId', type=int)
    if not userId:
        return jsonify({"error": "Missing userId"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500
    
    try:
        cursor = conn.cursor()
        
        query = """
            WITH UserPantry AS (
                SELECT IngredientID FROM Pantry WHERE UserID = ?
            ),
            RecipeCounts AS (
                SELECT RecipeID, COUNT(IngredientID) as Total FROM RecipeIngredients GROUP BY RecipeID
            ),
            UserMatches AS (
                SELECT ri.RecipeID, COUNT(ri.IngredientID) as Found 
                FROM RecipeIngredients ri
                JOIN UserPantry up ON ri.IngredientID = up.IngredientID
                GROUP BY ri.RecipeID
            )
            SELECT 
                r.RecipeID, r.Title, r.TimeMinutes, r.CaloriesPerServing, r.Servings,
                ISNULL(rc.Total, 0) as TotalIngredients,
                ISNULL(um.Found, 0) as IngredientsUserHas,
                CASE WHEN ISNULL(rc.Total, 0) = 0 THEN 0 
                     ELSE (ISNULL(um.Found, 0) * 100.0 / rc.Total) END as MatchPercentage
            FROM Recipes r
            LEFT JOIN RecipeCounts rc ON r.RecipeID = rc.RecipeID
            LEFT JOIN UserMatches um ON r.RecipeID = um.RecipeID
            ORDER BY MatchPercentage DESC, r.Title
        """
        
        cursor.execute(query, (userId,))
        return jsonify(sql_to_dict_list(cursor))

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/recipe/<string:recipe_id>', methods=['GET'])
def get_recipe_details(recipe_id):
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM Recipes WHERE RecipeID = ?", (recipe_id,))
        row = cursor.fetchone()
        if not row: return jsonify({"error": "Recipe not found"}), 404
            
        columns = [column[0] for column in cursor.description]
        recipe = dict(zip(columns, row))

        cursor.execute("""
            SELECT i.Name, ri.Quantity, ri.Unit, ri.Preparation
            FROM RecipeIngredients ri
            JOIN Ingredients i ON ri.IngredientID = i.IngredientID
            WHERE ri.RecipeID = ?
        """, (recipe_id,))
        recipe['ingredients'] = sql_to_dict_list(cursor)
        
        cursor.execute("SELECT StepNumber, StepText FROM Instructions WHERE RecipeID = ? ORDER BY StepNumber", (recipe_id,))
        recipe['instructions'] = sql_to_dict_list(cursor)
        
        cursor.execute("""
            SELECT t.TagName FROM RecipeTags rt
            JOIN Tags t ON rt.TagID = t.TagID
            WHERE rt.RecipeID = ?
        """, (recipe_id,))
        recipe['tags'] = [row[0] for row in cursor.fetchall()]
        
        return jsonify(recipe)

    finally:
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)