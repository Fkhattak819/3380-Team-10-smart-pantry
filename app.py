# This is a small, secure, and reliable backend for your Smart Pantry app.
# It uses Flask (a lightweight web framework) and pyodbc (to talk to SQL Server).
#
# --- How to Run This (in your VS Code Terminal) ---
# 1. Activate your virtual environment:
#    .\venv\Scripts\activate
# 2. Install the required libraries (only needs to be done once):
#    pip install flask pyodbc python-dotenv
# 3. Run the app:
#    python app.py
# 4. Your server will be running on http://127.0.0.1:5000 or http://localhost:5000
#
from flask import Flask, jsonify, request
import pyodbc # The library that connects Python to SQL Server
import os # Used to load environment variables
from dotenv import load_dotenv # Used to load the .env file

# Load the secret variables from the .env file
load_dotenv()

app = Flask(__name__)

# --- Database Connection Settings ---
# These are loaded securely from your .env file and OS variables
DB_SERVER = os.getenv('DB_SERVER', 'localhost\\SQLEXPRESS,1433')
DB_NAME = os.getenv('DB_DATABASE', 'PantryProject')
DB_USER = os.getenv('DB_USER', 'pantry_user')
DB_PASSWORD = os.getenv('DB_PASSWORD')

# Check if the password was loaded correctly
if not DB_PASSWORD:
    print("WARNING: DB_PASSWORD not found in .env file. Database connection will fail.")
    print("Please create a .env file with DB_PASSWORD=YourPassword")

def get_db_connection():
    """
    Creates and returns a new database connection.
    This is called by each function, ensuring a fresh, safe connection.
    """
    try:
        # This is the "Connection String"
        # It tells pyodbc how to find and log in to your database
        conn_string = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={DB_SERVER};"
            f"DATABASE={DB_NAME};"
            f"UID={DB_USER};"
            f"PWD={DB_PASSWORD};"
            f"TrustServerCertificate=yes;" # Added to trust your self-signed cert
        )
        conn = pyodbc.connect(conn_string)
        print("Database connection successful!")
        return conn
    except Exception as e:
        # This will print the error to your terminal if connection fails
        print(f"Database connection failed: {e}")
        return None

# --- API Routes ---

@app.route('/api/hello', methods=['GET'])
def hello():
    """A simple test route to see if the server is running."""
    return jsonify({"message": "Hello! Your Pantry API is running."})


@app.route('/api/recipes/matches', methods=['GET'])
def get_recipe_matches():
    """
    The main "recipe match" logic.
    Finds all recipes and calculates the match percentage based on a user's pantry.
    Expects a userId in the query string, e.g., /api/recipes/matches?userId=1
    """
    userId = request.args.get('userId', type=int)
    if not userId:
        return jsonify({"error": "Missing required parameter: userId"}), 400

    # This is the "magic" query. It does all the hard work in SQL
    # for maximum efficiency.
    query = """
        -- Step 1: Get the pantry for the specified user
        WITH UserPantry AS (
            SELECT IngredientID
            FROM Pantry
            WHERE UserID = ?
        ),
        -- Step 2: Count the total ingredients required for EVERY recipe
        RecipeIngredientCounts AS (
            SELECT
                RecipeID,
                COUNT(IngredientID) AS TotalIngredients
            FROM RecipeIngredients
            GROUP BY RecipeID
        ),
        -- Step 3: Count how many of the required ingredients the user has
        UserMatches AS (
            SELECT
                ri.RecipeID,
                COUNT(ri.IngredientID) AS IngredientsUserHas
            FROM RecipeIngredients ri
            INNER JOIN UserPantry up ON ri.IngredientID = up.IngredientID
            GROUP BY ri.RecipeID
        )
        -- Final Step: Join, calculate percentage, and order
        SELECT
            r.RecipeID,
            r.Title,
            r.TimeMinutes,
            r.CaloriesPerServing,
            ISNULL(ric.TotalIngredients, 0) AS TotalIngredients,
            ISNULL(um.IngredientsUserHas, 0) AS IngredientsUserHas,
            -- Calculate the match percentage
            CASE
                WHEN ISNULL(ric.TotalIngredients, 0) = 0 THEN 0
                ELSE (ISNULL(um.IngredientsUserHas, 0) * 100.0 / ric.TotalIngredients)
            END AS MatchPercentage
        FROM Recipes r
        LEFT JOIN RecipeIngredientCounts ric ON r.RecipeID = ric.RecipeID
        LEFT JOIN UserMatches um ON r.RecipeID = um.RecipeID
        ORDER BY
            MatchPercentage DESC,
            TotalIngredients ASC;
    """

    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = conn.cursor()
        # Execute the query, passing the userId as a safe parameter
        cursor.execute(query, (userId,))
        
        # Fetch all results
        rows = cursor.fetchall()
        
        # Get column names from the cursor description
        columns = [column[0] for column in cursor.description]
        
        # Convert the list of tuples (rows) into a list of dictionaries
        results = [dict(zip(columns, row)) for row in rows]
        
        return jsonify(results)

    except Exception as e:
        print(f"Error in /api/recipes/matches: {e}")
        return jsonify({"error": f"An internal error occurred: {e}"}), 500
    finally:
        # This is critical! Always close the connection.
        if conn:
            conn.close()
            print("Database connection closed.")


@app.route('/api/pantry/add', methods=['POST'])
def add_to_pantry():
    """
    Adds an item to a user's pantry.
    If the item already exists, it updates the quantity.
    Expects a JSON body like:
    {
      "userId": 1,
      "ingredientName": "egg",
      "quantity": 6
    }
    """
    data = request.json
    userId = data.get('userId')
    ingredientName = data.get('ingredientName')
    quantity = data.get('quantity')

    if not all([userId, ingredientName, quantity]):
        return jsonify({"error": "Missing required data: userId, ingredientName, and quantity"}), 400

    # This SQL query is an "UPSERT".
    # 1. It finds the IngredientID and DefaultUnit from the name.
    # 2. It checks if the item is already in the pantry.
    # 3. If it is, UPDATE the quantity.
    # 4. If it's not, INSERT a new row.
    upsert_query = """
        -- Step 1: Get variables
        DECLARE @UserID INT = ?;
        DECLARE @IngredientName NVARCHAR(150) = ?;
        DECLARE @Quantity FLOAT = ?;
        
        DECLARE @IngredientID INT;
        DECLARE @DefaultUnit NVARCHAR(50);
        DECLARE @PantryID INT;

        -- Step 2: Find the IngredientID and DefaultUnit
        SELECT @IngredientID = IngredientID, @DefaultUnit = DefaultUnit
        FROM Ingredients
        WHERE Name = @IngredientName;

        -- If ingredient doesn't exist in master list, stop
        IF @IngredientID IS NULL
        BEGIN
            RAISERROR('Ingredient not found in master list.', 16, 1);
            RETURN;
        END

        -- Step 3: Check if the item is already in the pantry
        SELECT @PantryID = PantryID
        FROM Pantry
        WHERE UserID = @UserID AND IngredientID = @IngredientID;

        -- Step 4: INSERT or UPDATE
        IF @PantryID IS NOT NULL
        BEGIN
            -- UPDATE: Add to the existing quantity
            UPDATE Pantry
            SET Quantity = Quantity + @Quantity
            WHERE PantryID = @PantryID;
            PRINT 'Updated existing pantry item.';
        END
        ELSE
        BEGIN
            -- INSERT: Add a new row
            INSERT INTO Pantry (UserID, IngredientID, Quantity, Unit)
            VALUES (@UserID, @IngredientID, @Quantity, @DefaultUnit);
            PRINT 'Inserted new pantry item.';
        END
    """
    
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = conn.cursor()
        # Execute the upsert query with the parameters
        cursor.execute(upsert_query, (userId, ingredientName, quantity))
        # We must call .commit() because we are changing data (INSERT/UPDATE)
        conn.commit()
        
        return jsonify({"success": True, "message": "Pantry updated successfully."}), 201

    except Exception as e:
        # If an error happens (like our RAISERROR), roll back any changes
        if conn:
            conn.rollback()
        print(f"Error in /api/pantry/add: {e}")
        # pyodbc wraps the RAISERROR in a (pyodbc.Error)
        # We can check the error message to send a friendlier response
        if 'Ingredient not found' in str(e):
            return jsonify({"error": f"Ingredient '{ingredientName}' not found in master list."}), 404
        return jsonify({"error": f"An internal error occurred: {e}"}), 500
    finally:
        if conn:
            conn.close()
            print("Database connection closed.")


# --- This is the standard "main" entry point for a Python script ---
if __name__ == '__main__':
    # host='0.0.0.0' makes the server accessible on your network (for your teammates)
    # debug=True makes the server auto-reload when you save changes
    app.run(host='0.0.0.0', port=5000, debug=True)