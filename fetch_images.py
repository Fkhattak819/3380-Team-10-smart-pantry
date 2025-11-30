import requests
import pyodbc
import os
import time
from dotenv import load_dotenv

# --- CONFIGURATION ---
# We use the 'lookup' endpoint because we already have the specific ID
BASE_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i="

load_dotenv()

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
        return pyodbc.connect(conn_string)
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

def update_images():
    conn = get_db_connection()
    if not conn: return

    cursor = conn.cursor()

    # 1. Get ALL imported recipes (Numeric IDs)
    print("Fetching all imported recipes to update images...")
    cursor.execute("""
        SELECT RecipeID, Title 
        FROM Recipes 
        WHERE ISNUMERIC(RecipeID) = 1
    """)
    recipes = cursor.fetchall()
    
    print(f"Found {len(recipes)} recipes to check/update.")

    for i, row in enumerate(recipes, 1):
        recipe_id = row.RecipeID
        title = row.Title
        
        try:
            # 2. Call the API
            response = requests.get(f"{BASE_URL}{recipe_id}")
            data = response.json()
            
            if data['meals']:
                # 3. Get the URL
                raw_url = data['meals'][0]['strMealThumb']
                
                # 4. Convert to Medium format (add /medium)
                image_url = f"{raw_url}/medium"
                
                # 5. Update Database
                cursor.execute("UPDATE Recipes SET ImageURL = ? WHERE RecipeID = ?", (image_url, recipe_id))
                conn.commit()
                
                print(f"[{i}/{len(recipes)}] Updated: {title}")
            else:
                print(f"[{i}/{len(recipes)}] API has no data for: {title} (ID: {recipe_id})")

        except Exception as e:
            print(f"Error updating {title}: {e}")
            
        # Be nice to the API
        time.sleep(0.1)

    conn.close()
    print("Image update complete!")

if __name__ == "__main__":
    update_images()