import pyodbc
import os
import json
import time
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

# --- CONFIGURATION ---
print("--- Script Starting ---")
load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("Error: GEMINI_API_KEY not found in .env file.")
    exit()

print("Configuring Gemini AI...")
genai.configure(api_key=api_key)

# REVERTED: Back to the version that worked for you (gemini-2.5-flash)
model = genai.GenerativeModel('gemini-2.5-flash')

DB_SERVER = os.getenv('DB_SERVER', 'localhost\\SQLEXPRESS,1433')
DB_DATABASE = os.getenv('DB_DATABASE', 'pantryDatabase')
DB_USER = os.getenv('DB_USER', 'pantry_user')
DB_PASSWORD = os.getenv('DB_PASSWORD')

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
        conn = pyodbc.connect(conn_string, timeout=10)
        return conn
    except Exception as e:
        print(f"CRITICAL DATABASE ERROR: {e}")
        return None

def get_ai_estimate_with_retry(recipe_title, ingredients):
    prompt = f"""
    I have a recipe named "{recipe_title}".
    The ingredients are: {ingredients}.
    
    Please estimate:
    1. The number of servings this recipe makes (standard meal size).
    2. The calories PER SERVING.
    
    Return ONLY a JSON object with no extra text, like this:
    {{ "servings": 4, "calories": 550 }}
    """
    
    retries = 0
    max_retries = 10
    wait_time = 20 # Start with 20 seconds

    while retries < max_retries:
        try:
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(text)
            return data.get('servings', 2), data.get('calories', 500)
            
        except exceptions.ResourceExhausted:
            print(f"\n   [!] Rate limit hit. Waiting {wait_time} seconds...", end="", flush=True)
            time.sleep(wait_time)
            retries += 1
            wait_time += 5 # Add 5 more seconds each time
            
        except Exception as e:
            print(f"\n   [x] AI Error for '{recipe_title}': {e}")
            return 2, 500 

    print("\n   [x] Max retries exceeded. Skipping.")
    return 2, 500

def enrich_database():
    conn = get_db_connection()
    if not conn: return

    cursor = conn.cursor()

    # Count how many left
    cursor.execute("SELECT COUNT(*) FROM Recipes WHERE CaloriesPerServing = 500 OR CaloriesPerServing IS NULL")
    total_to_do = cursor.fetchone()[0]
    
    if total_to_do == 0:
        print("No recipes need updating!")
        return

    print(f"Found {total_to_do} recipes to enrich.")
    
    cursor.execute("""
        SELECT RecipeID, Title 
        FROM Recipes 
        WHERE CaloriesPerServing = 500 OR CaloriesPerServing IS NULL
    """)
    recipes_to_update = cursor.fetchall()

    for i, row in enumerate(recipes_to_update, 1):
        recipe_id = row.RecipeID
        title = row.Title
        
        cursor.execute("""
            SELECT I.Name, RI.Quantity, RI.Unit, RI.Preparation
            FROM RecipeIngredients RI
            JOIN Ingredients I ON RI.IngredientID = I.IngredientID
            WHERE RI.RecipeID = ?
        """, (recipe_id,))
        
        ing_rows = cursor.fetchall()
        ing_list_parts = []
        for r in ing_rows:
            qty = r.Quantity if r.Quantity > 0 else ""
            unit = r.Unit if r.Unit != 'count' else ""
            name = r.Name
            prep = f"({r.Preparation})" if r.Preparation else ""
            ing_list_parts.append(f"{qty} {unit} {name} {prep}".strip())
            
        ing_text_block = ", ".join(ing_list_parts)
        
        print(f"[{i}/{total_to_do}] Enriching: {title}...", end="", flush=True)
        
        servings, calories = get_ai_estimate_with_retry(title, ing_text_block)
        
        cursor.execute("""
            UPDATE Recipes 
            SET Servings = ?, CaloriesPerServing = ?
            WHERE RecipeID = ?
        """, (servings, calories, recipe_id))
        conn.commit()
        
        print(f" Done! ({calories} cal)")
        
        # Standard delay to prevent hitting rate limits instantly
        time.sleep(5) 

    conn.close()
    print("Enrichment complete!")

if __name__ == "__main__":
    enrich_database()