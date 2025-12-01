import pyodbc
import os
import json
import time
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

# --- CONFIGURATION ---
print("--- Cook Time Enrichment Starting ---")
load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("Error: GEMINI_API_KEY not found in .env file.")
    exit()

print("Configuring Gemini AI...")
genai.configure(api_key=api_key)

# Using the model that worked for you (2.5-flash)
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

def get_cook_time_ai(title, instructions):
    """
    Asks AI to estimate total cook time based on instructions.
    """
    prompt = f"""
    I have a recipe named "{title}".
    Here are the instructions:
    {instructions}
    
    Based on these instructions, estimate the TOTAL time (prep + cook) in minutes.
    Be realistic. If it says "marinate overnight", do not include the marinating time, just the active work + cook time.
    If no time is mentioned, make a best guess based on the cooking method (e.g. baking a potato takes ~60 mins).
    
    Return ONLY a JSON object with no extra text, like this:
    {{ "minutes": 45 }}
    """
    
    retries = 0
    wait_time = 20
    while retries < 5:
        try:
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(text)
            return data.get('minutes', 31) # Return 31 if failed, so we don't get stuck in loop
            
        except exceptions.ResourceExhausted:
            print(f"   [!] Rate limit. Sleeping {wait_time}s...", end="", flush=True)
            time.sleep(wait_time)
            retries += 1
            wait_time += 10
        except Exception as e:
            print(f"   [x] AI Error: {e}")
            return 31 # Change to 31 so we don't retry it forever
    return 31

def process_recipes():
    conn = get_db_connection()
    if not conn: return

    cursor = conn.cursor()

    # 1. Find recipes with EXACTLY the default (30) time
    # This filters out anything you've already updated to 45, 20, 60, etc.
    print("Scanning for recipes with default 30 min cook time...")
    cursor.execute("""
        SELECT RecipeID, Title 
        FROM Recipes 
        WHERE TimeMinutes = 30
    """)
    recipes = cursor.fetchall()
    
    if not recipes:
        print("No recipes need time updates.")
        return
    
    print(f"Found {len(recipes)} recipes to update.")

    for i, row in enumerate(recipes, 1):
        recipe_id = row.RecipeID
        title = row.Title
        
        # Get instructions for context
        cursor.execute("""
            SELECT StepText FROM Instructions 
            WHERE RecipeID = ? 
            ORDER BY StepNumber
        """, (recipe_id,))
        
        steps = cursor.fetchall()
        if not steps:
            print(f"[{i}/{len(recipes)}] Skipping {title} (No instructions)")
            continue
            
        instr_text = " ".join([s[0] for s in steps])
        if len(instr_text) > 5000: instr_text = instr_text[:5000] + "..."
        
        print(f"[{i}/{len(recipes)}] Estimating time for: {title}...", end="", flush=True)
        
        minutes = get_cook_time_ai(title, instr_text)
        
        # Update DB
        cursor.execute("UPDATE Recipes SET TimeMinutes = ? WHERE RecipeID = ?", (minutes, recipe_id))
        conn.commit()
        print(f" Done! ({minutes} mins)")
            
        time.sleep(2) 

    conn.close()
    print("Time enrichment complete!")

if __name__ == "__main__":
    process_recipes()