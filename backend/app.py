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

# --- HELPER: DIETARY CHECK ---
def check_dietary_restrictions(recipe_tags, user_diets):
    """
    Returns True if recipe is safe based on user diets.
    """
    if not user_diets: return True
    
    # Normalize tags to set for fast lookup
    recipe_tag_set = set(t.lower() for t in recipe_tags)
    
    for diet in user_diets:
        diet = diet.lower()
        # Check if the specific "safe" tag exists on the recipe
        if diet in ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'pork_free', 'beef_free', 'keto']:
            if diet not in recipe_tag_set:
                return False
    return True

# --- API Routes ---

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello! Your Pantry API is running."})

# ---------------------------------------------------------
#  USER AUTH & PREFERENCES
# ---------------------------------------------------------

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new user with username and password"""
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    # Validation
    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400
    
    if len(username) < 5:
        return jsonify({"error": "Username must be at least 5 characters"}), 400
    
    if len(password) < 5:
        return jsonify({"error": "Password must be at least 5 characters"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "cannot connect to database"}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check if username already exists (case-insensitive)
        cursor.execute("SELECT UserID FROM Users WHERE LOWER(Username) = LOWER(?)", (username,))
        if cursor.fetchone():
            return jsonify({"error": "Username already exists"}), 409
        
        # Hash password and insert new user
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        cursor.execute(
            "INSERT INTO Users (Username, PasswordHash) VALUES (?, ?)",
            (username, hashed_password)
        )
        conn.commit()
        
        # Get the newly created user ID
        cursor.execute("SELECT UserID FROM Users WHERE LOWER(Username) = LOWER(?)", (username,))
        user_id = cursor.fetchone()[0]
        
        return jsonify({
            "message": "User registered successfully",
            "userId": user_id,
            "username": username
        }), 201
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500
    finally:
        conn.close()


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user with username and password"""
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "cannot connect to database"}), 500
    
    try:
        cursor = conn.cursor()
        
        # Find user by username (case-insensitive)
        cursor.execute("SELECT UserID, PasswordHash FROM Users WHERE LOWER(Username) = LOWER(?)", (username,))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"error": "Invalid username or password"}), 401
        
        user_id, password_hash = row[0], row[1]
        
        # Verify password
        if not check_password_hash(password_hash, password):
            return jsonify({"error": "Invalid username or password"}), 401
        
        return jsonify({
            "message": "Login successful",
            "userId": user_id,
            "username": username
        }), 200
        
    except Exception as e:
        print(f"Login Error: {e}")
        return jsonify({"error": "Login failed"}), 500
    finally:
        conn.close()

# @app.route('/api/users/login', methods=['POST'])
# def login_user():
#     data = request.json
#     username = data.get('username')
#     password = data.get('password')

#     if not username or not password:
#         return jsonify({"error": "Username and password required"}), 400

#     conn = get_db_connection()
#     if not conn: return jsonify({"error": "Database fail"}), 500

#     try:
#         cursor = conn.cursor()
#         cursor.execute("SELECT UserID, PasswordHash FROM Users WHERE Username = ?", (username,))
#         user = cursor.fetchone()

#         if user and check_password_hash(user.PasswordHash, password):
#             return jsonify({
#                 "message": "Login successful",
#                 "userId": user.UserID,
#                 "username": username
#             }), 200
#         else:
#             return jsonify({"error": "Invalid credentials"}), 401
#     finally:
#         conn.close()

# @app.route('/api/users/register', methods=['POST'])
# def register_user():
#     data = request.json
#     username = data.get('username')
#     # Email removed as requested
#     password = data.get('password')

#     if not all([username, password]):
#         return jsonify({"error": "Username and password are required"}), 400

#     conn = get_db_connection()
#     if not conn: return jsonify({"error": "Database fail"}), 500

#     try:
#         cursor = conn.cursor()
#         cursor.execute("SELECT UserID FROM Users WHERE Username = ?", (username,))
#         if cursor.fetchone():
#             return jsonify({"error": "Username already exists"}), 409 

#         hashed_password = generate_password_hash(password)
        
#         # Insert without Email
#         cursor.execute("INSERT INTO Users (Username, PasswordHash) VALUES (?, ?)", 
#                        (username, hashed_password))
#         conn.commit()
#         return jsonify({"message": "User registered successfully"}), 201
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
#     finally:
#         conn.close()

@app.route('/api/users/preferences', methods=['GET', 'POST'])
def user_preferences():
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500
    cursor = conn.cursor()

    try:
        if request.method == 'GET':
            user_id = request.args.get('userId')
            cursor.execute("SELECT DietType FROM UserPreferences WHERE UserID = ?", (user_id,))
            rows = cursor.fetchall()
            diets = [row[0] for row in rows]
            return jsonify(diets)

        elif request.method == 'POST':
            data = request.json
            user_id = data.get('userId')
            diets = data.get('diets', []) # List of strings

            # Clear old prefs and add new ones
            cursor.execute("DELETE FROM UserPreferences WHERE UserID = ?", (user_id,))
            for diet in diets:
                cursor.execute("INSERT INTO UserPreferences (UserID, DietType) VALUES (?, ?)", (user_id, diet))
            
            conn.commit()
            return jsonify({"message": "Preferences updated"})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ---------------------------------------------------------
#  INGREDIENT & PANTRY
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

# --- CONSUME RECIPE (MAKE RECIPE) ---
@app.route('/api/pantry/consume', methods=['POST'])
def consume_recipe():
    """
    Deducts ingredients from pantry when a user makes a recipe.
    EXCLUDES spices and staples.
    """
    data = request.json
    user_id = data.get('userId')
    recipe_id = data.get('recipeId')
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500
    try:
        cursor = conn.cursor()
        
        # 1. Get Recipe Ingredients
        cursor.execute("""
            SELECT IngredientID, Quantity, Unit 
            FROM RecipeIngredients 
            WHERE RecipeID = ?
        """, (recipe_id,))
        ingredients = cursor.fetchall()
        
        ignore_units = ['tsp', 'tbsp', 'teaspoon', 'tablespoon', 'pinch', 'dash', 'to taste']
        
        updates_made = 0
        
        for ing in ingredients:
            ing_id = ing.IngredientID
            qty_needed = ing.Quantity
            unit = ing.Unit.lower().strip()
            
            # SKIP spices/staples logic
            if unit in ignore_units or qty_needed == 0:
                continue
                
            cursor.execute("""
                UPDATE Pantry 
                SET Quantity = CASE 
                    WHEN Quantity - ? < 0 THEN 0 
                    ELSE Quantity - ? 
                END
                WHERE UserID = ? AND IngredientID = ?
            """, (qty_needed, qty_needed, user_id, ing_id))
            
            if cursor.rowcount > 0:
                updates_made += 1
                
        conn.commit()
        return jsonify({"success": True, "message": f"Pantry updated for {updates_made} items."})
        
    except Exception as e:
        print(f"Consume Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ---------------------------------------------------------
#  RECIPES (MATCHING & SEARCHING)
# ---------------------------------------------------------

@app.route('/api/recipes/matches', methods=['GET'])
def get_recipe_matches():
    userId = request.args.get('userId', type=int)
    if not userId: return jsonify({"error": "Missing userId"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500
    
    try:
        cursor = conn.cursor()
        
        # 1. Get User Preferences
        cursor.execute("SELECT DietType FROM UserPreferences WHERE UserID = ?", (userId,))
        user_diets = [row[0] for row in cursor.fetchall()]

        # 2. Get Recipes + Match % + Missing Ingredients List
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
                WHERE up.IngredientID IS NULL 
                GROUP BY ri.RecipeID
            ),
            RecipeTagList AS (
                SELECT rt.RecipeID, STRING_AGG(t.TagName, ',') as TagList
                FROM RecipeTags rt
                JOIN Tags t ON rt.TagID = t.TagID
                GROUP BY rt.RecipeID
            )
            SELECT TOP 50
                r.RecipeID, r.Title, r.TimeMinutes, r.CaloriesPerServing, r.Servings, r.ImageURL,
                ISNULL(rs.Total, 0) as TotalIngredients,
                ISNULL(um.Found, 0) as IngredientsUserHas,
                ISNULL(mi.MissingNames, '') as MissingIngredients,
                ISNULL(rtl.TagList, '') as Tags,
                CASE WHEN ISNULL(rs.Total, 0) = 0 THEN 0 
                     ELSE (ISNULL(um.Found, 0) * 100.0 / rs.Total) END as MatchPercentage
            FROM Recipes r
            LEFT JOIN RecipeStats rs ON r.RecipeID = rs.RecipeID
            LEFT JOIN UserMatches um ON r.RecipeID = um.RecipeID
            LEFT JOIN MissingIngredients mi ON r.RecipeID = mi.RecipeID
            LEFT JOIN RecipeTagList rtl ON r.RecipeID = rtl.RecipeID
            ORDER BY MatchPercentage DESC, r.Title
        """
        
        cursor.execute(query, (userId,))
        all_matches = sql_to_dict_list(cursor)
        
        # 3. Filter by Diet
        valid_matches = []
        for recipe in all_matches:
            recipe['MissingIngredients'] = recipe['MissingIngredients'].split(', ') if recipe['MissingIngredients'] else []
            recipe_tags = recipe['Tags'].split(',') if recipe['Tags'] else []
            
            if check_dietary_restrictions(recipe_tags, user_diets):
                valid_matches.append(recipe)

        return jsonify(valid_matches[:10])

    finally:
        conn.close()

@app.route('/api/recipes/search', methods=['GET'])
def search_recipes():
    query_text = request.args.get('q', '')
    max_time = request.args.get('maxTime', type=int)
    min_cal = request.args.get('minCal', type=int)
    max_cal = request.args.get('maxCal', type=int)
    diet_param = request.args.get('diets', '') 

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500
    
    try:
        cursor = conn.cursor()
        
        sql = """
            SELECT r.RecipeID, r.Title, r.TimeMinutes, r.CaloriesPerServing, r.Servings, r.ImageURL,
            STRING_AGG(t.TagName, ',') as Tags
            FROM Recipes r
            LEFT JOIN RecipeTags rt ON r.RecipeID = rt.RecipeID
            LEFT JOIN Tags t ON rt.TagID = t.TagID
            WHERE r.Title LIKE ?
        """
        params = [f"%{query_text}%"]

        if max_time:
            sql += " AND r.TimeMinutes <= ?"
            params.append(max_time)
        
        if min_cal:
            sql += " AND r.CaloriesPerServing >= ?"
            params.append(min_cal)
        
        if max_cal:
            sql += " AND r.CaloriesPerServing <= ?"
            params.append(max_cal)

        sql += " GROUP BY r.RecipeID, r.Title, r.TimeMinutes, r.CaloriesPerServing, r.Servings, r.ImageURL"
        sql += " ORDER BY r.Title"
        sql = sql.replace("SELECT", "SELECT TOP 50")

        cursor.execute(sql, params)
        results = sql_to_dict_list(cursor)

        final_results = []
        user_diets = diet_param.split(',') if diet_param else []
        
        for r in results:
            r_tags = r['Tags'].split(',') if r['Tags'] else []
            if check_dietary_restrictions(r_tags, user_diets):
                final_results.append(r)

        return jsonify(final_results)
    except Exception as e:
        print(e)
        return jsonify([])
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
#  SHOPPING LIST
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
            
            if 'ingredients' in data: 
                for ing_name in data['ingredients']:
                    cursor.execute("SELECT IngredientID, DefaultUnit FROM Ingredients WHERE Name = ?", (ing_name,))
                    row = cursor.fetchone()
                    if row:
                        cursor.execute("SELECT 1 FROM ShoppingList WHERE UserID=? AND IngredientID=?", (user_id, row.IngredientID))
                        if not cursor.fetchone():
                            cursor.execute("INSERT INTO ShoppingList (UserID, IngredientID, Quantity, Unit) VALUES (?, ?, 1, ?)", 
                                         (user_id, row.IngredientID, row.DefaultUnit))
                conn.commit()
                return jsonify({"success": True})
            
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

@app.route('/api/shopping-list/add-from-recipe', methods=['POST'])
def add_missing_ingredients():
    """
    SMART FEATURE: Adds all missing ingredients from a recipe to shopping list.
    """
    data = request.json
    user_id = data.get('userId')
    recipe_id = data.get('recipeId')

    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database fail"}), 500

    try:
        cursor = conn.cursor()
        
        # Calculate difference between Recipe Needs and Pantry Haves
        query = """
            SELECT 
                ri.IngredientID, 
                ri.Unit,
                (ri.Quantity - ISNULL(p.Quantity, 0)) AS MissingQty
            FROM RecipeIngredients ri
            LEFT JOIN Pantry p ON ri.IngredientID = p.IngredientID AND p.UserID = ?
            WHERE ri.RecipeID = ?
        """
        cursor.execute(query, (user_id, recipe_id))
        rows = cursor.fetchall()
        
        count = 0
        for row in rows:
            ing_id = row.IngredientID
            unit = row.Unit
            missing_qty = row.MissingQty
            
            if missing_qty > 0:
                cursor.execute("SELECT ShoppingListItemID FROM ShoppingList WHERE UserID = ? AND IngredientID = ?", (user_id, ing_id))
                existing = cursor.fetchone()
                
                if existing:
                     cursor.execute("""
                        UPDATE ShoppingList 
                        SET Quantity = CASE WHEN Quantity < ? THEN ? ELSE Quantity END
                        WHERE ShoppingListItemID = ?
                     """, (missing_qty, missing_qty, existing[0]))
                else:
                    cursor.execute("""
                        INSERT INTO ShoppingList (UserID, IngredientID, Quantity, Unit, IsPurchased)
                        VALUES (?, ?, ?, ?, 0)
                    """, (user_id, ing_id, missing_qty, unit))
                count += 1
        
        conn.commit()
        return jsonify({"message": f"Added {count} items", "addedCount": count})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)