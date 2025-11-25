import pyodbc
import os
import json
import time
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

# --- CONFIGURATION ---
print("--- Dietary Tag Enrichment Starting ---")
load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("Error: GEMINI_API_KEY not found.")
    exit()

print("Configuring Gemini AI...")
genai.configure(api_key=api_key)

# USING THE MODEL THAT WORKED (2.5-flash)
# This model has a lower daily limit (250), so the script will pause/retry if hit.
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
        print(f"Database Error: {e}")
        return None

def get_dietary_tags_ai(title, ingredients):
    """
    Asks AI to analyze ingredients for specific dietary tags.
    Returns a LIST of valid tags.
    """
    valid_tags = [
        "vegan", "vegetarian", "pescatarian", 
        "gluten_free", "dairy_free", "egg_free", "soy_free", "nut_free", "shellfish_free",
        "pork_free", "beef_free",
        "keto", "paleo", "low_carb", "no_added_sugar"
    ]
    
    prompt = f"""
    Analyze this recipe for dietary compliance.
    
    Recipe: "{title}"
    Ingredients: {ingredients}
    
    Which of the following tags apply to this recipe?
    {valid_tags}
    
    Rules:
    - "pork_free": Apply if it contains NO pork, bacon, ham, lard, sausage (unless turkey/beef specified).
    - "beef_free": Apply if it contains NO beef, steak, veal.
    - "gluten_free": Check soy sauce, flour, bread, pasta (unless specified gluten-free).
    - "vegan": No meat, dairy, eggs, honey, gelatin.
    
    Return ONLY a JSON array of strings, e.g.: ["vegan", "gluten_free", "pork_free"]
    """
    
    retries = 0
    wait_time = 20
    while retries < 5:
        try:
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            tags = json.loads(text)
            
            clean_tags = [t for t in tags if t in valid_tags]
            return clean_tags
            
        except exceptions.ResourceExhausted:
            print(f"   [!] Rate limit. Sleeping {wait_time}s...", end="", flush=True)
            time.sleep(wait_time)
            retries += 1
            wait_time += 10
        except Exception as e:
            print(f"   [x] Error: {e}")
            return []
    return []

def process_recipes():
    conn = get_db_connection()
    if not conn: return

    cursor = conn.cursor()

    # 1. Get ONLY recipes that haven't been checked yet
    cursor.execute("""
        SELECT RecipeID, Title 
        FROM Recipes 
        WHERE IsDietaryChecked = 0 OR IsDietaryChecked IS NULL
    """)
    recipes = cursor.fetchall()
    
    if not recipes:
        print("No recipes need tagging (all checked).")
        return
    
    print(f"Found {len(recipes)} recipes remaining to tag.")

    for i, row in enumerate(recipes, 1):
        recipe_id = row.RecipeID
        title = row.Title
        
        cursor.execute("""
            SELECT I.Name, RI.Preparation 
            FROM RecipeIngredients RI
            JOIN Ingredients I ON RI.IngredientID = I.IngredientID
            WHERE RI.RecipeID = ?
        """, (recipe_id,))
        
        ings = cursor.fetchall()
        ing_text = ", ".join([f"{i.Name} ({i.Preparation or ''})" for i in ings])
        
        print(f"[{i}/{len(recipes)}] Tagging: {title}...", end="", flush=True)
        
        tags = get_dietary_tags_ai(title, ing_text)
        
        if tags:
            for tag in tags:
                # Ensure Tag exists
                cursor.execute("SELECT TagID FROM Tags WHERE TagName = ?", (tag,))
                tag_row = cursor.fetchone()
                
                if tag_row:
                    tag_id = tag_row[0]
                else:
                    cursor.execute("INSERT INTO Tags (TagName) VALUES (?)", (tag,))
                    cursor.execute("SELECT TagID FROM Tags WHERE TagName = ?", (tag,))
                    tag_id = cursor.fetchone()[0]
                
                # Link
                cursor.execute("SELECT 1 FROM RecipeTags WHERE RecipeID = ? AND TagID = ?", (recipe_id, tag_id))
                if not cursor.fetchone():
                    cursor.execute("INSERT INTO RecipeTags (RecipeID, TagID) VALUES (?, ?)", (recipe_id, tag_id))
            
            print(f" Added {len(tags)} tags.", end="")
        else:
            print(" No tags found (or API limit).", end="")
        
        # 2. MARK AS CHECKED (Even if no tags found, so we don't check again)
        cursor.execute("UPDATE Recipes SET IsDietaryChecked = 1 WHERE RecipeID = ?", (recipe_id,))
        conn.commit()
        print(" [Saved]")
            
        time.sleep(2) # Be polite to the API

    conn.close()
    print("Tagging complete!")

if __name__ == "__main__":
    process_recipes()