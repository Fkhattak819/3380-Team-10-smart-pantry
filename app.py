# ====================================================================
#  PYTHON BACKEND (app.py)
# ====================================================================

import pyodbc
from flask import Flask, request, jsonify
from flask_cors import CORS 
from werkzeug.security import generate_password_hash, check_password_hash
import atexit
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app) 

# --- Database Settings ---
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

def sql_to_dict_list(cursor):
    columns = [column[0] for column in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

# --- API Routes ---

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello! Your Pantry API is running."})

# ---------------------------------------------------------
#  USER AUTH
# ---------------------------------------------------------

@app.route('/api/users/login', methods=['POST'])
def login_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT UserID, PasswordHash FROM Users WHERE Username = ?", (username,))
        user = cursor.fetchone()

        if user and check_password_hash(user.PasswordHash, password):
            return jsonify({
                "message": "Login successful",
                "userId": user.UserID,
                "username": username
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    finally:
        conn.close()

@app.route('/api/users/register', methods=['POST'])
def register_user():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({"error": "Username, email, and password are required"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT UserID FROM Users WHERE Username = ? OR Email = ?", (username, email))
        if cursor.fetchone():
            return jsonify({"error": "Username or Email already exists"}), 409 

        hashed_password = generate_password_hash(password)
        cursor.execute("INSERT INTO Users (Username, Email, PasswordHash) VALUES (?, ?, ?)", 
                       (username, email, hashed_password))
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ---------------------------------------------------------
#  INGREDIENT & PANTRY (Supports Image 4)
# ---------------------------------------------------------

@app.route('/api/ingredients/search', methods=['GET'])
def search_ingredients():
    query = request.args.get('q', '')
    if not query or len(query) < 2: return jsonify([])

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT TOP 10 Name, DefaultUnit FROM Ingredients WHERE Name LIKE ? ORDER BY Name", (f"%{query}%",))
        return jsonify(sql_to_dict_list(cursor))
    finally:
        conn.close()

@app.route('/api/pantry', methods=['GET', 'DELETE'])
def manage_pantry():
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500
    cursor = conn.cursor()

    try:
        if request.method == 'GET':
            user_id = request.args.get('userId')
            cursor.execute("""
                SELECT p.PantryID, i.Name, p.Quantity, p.Unit
                FROM Pantry p
                JOIN Ingredients i ON p.IngredientID = i.IngredientID
                WHERE p.UserID = ? ORDER BY i.Name
            """, (user_id,))
            return jsonify(sql_to_dict_list(cursor))

        elif request.method == 'DELETE':
            user_id = request.args.get('userId')
            ingredient_name = request.args.get('ingredientName')
            cursor.execute("SELECT IngredientID FROM Ingredients WHERE Name = ?", (ingredient_name,))
            ing_row = cursor.fetchone()
            if ing_row:
                cursor.execute("DELETE FROM Pantry WHERE UserID = ? AND IngredientID = ?", (user_id, ing_row[0]))
                conn.commit()
                return jsonify({"success": True})
            return jsonify({"error": "Ingredient not found"}), 404
    finally:
        conn.close()

@app.route('/api/pantry/add', methods=['POST'])
def add_to_pantry():
    data = request.json
    user_id = data.get('userId')
    ingredient_name = data.get('ingredientName')
    quantity = data.get('quantity')

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT IngredientID, DefaultUnit FROM Ingredients WHERE Name = ?", (ingredient_name,))
        ing_row = cursor.fetchone()
        if not ing_row: return jsonify({"error": "Ingredient not found"}), 404
        
        ing_id = ing_row.IngredientID
        default_unit = ing_row.DefaultUnit

        cursor.execute("SELECT PantryID FROM Pantry WHERE UserID = ? AND IngredientID = ?", (user_id, ing_id))
        if cursor.fetchone():
            cursor.execute("UPDATE Pantry SET Quantity = Quantity + ? WHERE UserID = ? AND IngredientID = ?", (quantity, user_id, ing_id))
        else:
            cursor.execute("INSERT INTO Pantry (UserID, IngredientID, Quantity, Unit) VALUES (?, ?, ?, ?)", (user_id, ing_id, quantity, default_unit))
        conn.commit()
        return jsonify({"success": True})
    finally:
        conn.close()

# ---------------------------------------------------------
#  RECIPES (Supports Image 1 & 2)
# ---------------------------------------------------------

@app.route('/api/recipes/matches', methods=['GET'])
def get_recipe_matches():
    userId = request.args.get('userId', type=int)
    if not userId: return jsonify({"error": "Missing userId"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500
    
    try:
        cursor = conn.cursor()
        
        # UPDATED QUERY: Now uses STRING_AGG to list MISSING ingredients names
        # This supports your UI's "Missing: cooked rice, peas" display.
        query = """
            WITH UserPantry AS (
                SELECT IngredientID FROM Pantry WHERE UserID = ?
            ),
            RecipeStats AS (
                SELECT RecipeID, COUNT(IngredientID) as Total FROM RecipeIngredients GROUP BY RecipeID
            ),
            UserMatches AS (
                SELECT ri.RecipeID, COUNT(ri.IngredientID) as Found 
                FROM RecipeIngredients ri
                JOIN UserPantry up ON ri.IngredientID = up.IngredientID
                GROUP BY ri.RecipeID
            ),
            MissingIngredients AS (
                SELECT ri.RecipeID, STRING_AGG(i.Name, ', ') as MissingNames
                FROM RecipeIngredients ri
                JOIN Ingredients i ON ri.IngredientID = i.IngredientID
                LEFT JOIN UserPantry up ON ri.IngredientID = up.IngredientID
                WHERE up.IngredientID IS NULL -- Only get ingredients user DOES NOT have
                GROUP BY ri.RecipeID
            )
            SELECT TOP 20
                r.RecipeID, r.Title, r.TimeMinutes, r.CaloriesPerServing, r.Servings,
                ISNULL(rs.Total, 0) as TotalIngredients,
                ISNULL(um.Found, 0) as IngredientsUserHas,
                ISNULL(mi.MissingNames, '') as MissingIngredients, -- New Column!
                CASE WHEN ISNULL(rs.Total, 0) = 0 THEN 0 
                     ELSE (ISNULL(um.Found, 0) * 100.0 / rs.Total) END as MatchPercentage
            FROM Recipes r
            LEFT JOIN RecipeStats rs ON r.RecipeID = rs.RecipeID
            LEFT JOIN UserMatches um ON r.RecipeID = um.RecipeID
            LEFT JOIN MissingIngredients mi ON r.RecipeID = mi.RecipeID
            ORDER BY MatchPercentage DESC, r.Title
        """
        
        cursor.execute(query, (userId,))
        matches = sql_to_dict_list(cursor)
        
        # Process MissingIngredients into a list for the frontend
        for m in matches:
            if m['MissingIngredients']:
                m['MissingIngredients'] = m['MissingIngredients'].split(', ')
            else:
                m['MissingIngredients'] = []

        return jsonify(matches)

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
        
        cursor.execute("SELECT t.TagName FROM RecipeTags rt JOIN Tags t ON rt.TagID = t.TagID WHERE rt.RecipeID = ?", (recipe_id,))
        recipe['tags'] = [row[0] for row in cursor.fetchall()]
        
        return jsonify(recipe)

    finally:
        conn.close()

# ---------------------------------------------------------
#  SHOPPING LIST (Supports Image 3)
# ---------------------------------------------------------

@app.route('/api/shopping-list', methods=['GET', 'POST', 'DELETE'])
def manage_shopping_list():
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500
    cursor = conn.cursor()

    try:
        if request.method == 'GET':
            user_id = request.args.get('userId')
            cursor.execute("""
                SELECT sl.ShoppingListItemID, i.Name, sl.Quantity, sl.Unit, sl.IsPurchased
                FROM ShoppingList sl
                JOIN Ingredients i ON sl.IngredientID = i.IngredientID
                WHERE sl.UserID = ?
                ORDER BY sl.IsPurchased, i.Name
            """, (user_id,))
            return jsonify(sql_to_dict_list(cursor))

        elif request.method == 'POST':
            data = request.json
            user_id = data.get('userId')
            
            # "Add Missing Ingredients" feature
            if 'ingredients' in data: 
                for ing_name in data['ingredients']: # Expects list of names ["rice", "peas"]
                    cursor.execute("SELECT IngredientID, DefaultUnit FROM Ingredients WHERE Name = ?", (ing_name,))
                    row = cursor.fetchone()
                    if row:
                        # Upsert logic for shopping list
                        cursor.execute("SELECT 1 FROM ShoppingList WHERE UserID=? AND IngredientID=?", (user_id, row.IngredientID))
                        if not cursor.fetchone():
                            cursor.execute("INSERT INTO ShoppingList (UserID, IngredientID, Quantity, Unit) VALUES (?, ?, 1, ?)", 
                                         (user_id, row.IngredientID, row.DefaultUnit))
                conn.commit()
                return jsonify({"success": True})
            
            # Single item add
            ingredient_name = data.get('ingredientName')
            quantity = data.get('quantity', 1)
            cursor.execute("SELECT IngredientID, DefaultUnit FROM Ingredients WHERE Name = ?", (ingredient_name,))
            ing_row = cursor.fetchone()
            if ing_row:
                cursor.execute("INSERT INTO ShoppingList (UserID, IngredientID, Quantity, Unit, IsPurchased) VALUES (?, ?, ?, ?, 0)", 
                               (user_id, ing_row.IngredientID, quantity, ing_row.DefaultUnit))
                conn.commit()
                return jsonify({"success": True})
            return jsonify({"error": "Ingredient not found"}), 404

        elif request.method == 'DELETE':
            user_id = request.args.get('userId')
            item_id = request.args.get('itemId')
            cursor.execute("DELETE FROM ShoppingList WHERE UserID = ? AND ShoppingListItemID = ?", (user_id, item_id))
            conn.commit()
            return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)