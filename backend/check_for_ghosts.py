import pyodbc
import os
from dotenv import load_dotenv

# --- CONFIGURATION ---
load_dotenv()

DB_SERVER = os.getenv('DB_SERVER', 'localhost\\SQLEXPRESS,1433')
DB_DATABASE = os.getenv('DB_DATABASE', 'pantryDatabase')
DB_USER = os.getenv('DB_USER', 'pantry_user')
DB_PASSWORD = os.getenv('DB_PASSWORD')

def get_db_connection():
    conn_string = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={DB_SERVER};"
        f"DATABASE={DB_DATABASE};"
        f"UID={DB_USER};"
        f"PWD={DB_PASSWORD};"
        f"TrustServerCertificate=yes;"
    )
    return pyodbc.connect(conn_string)

def check_recipes():
    conn = get_db_connection()
    cursor = conn.cursor()

    print("\n--- AUDIT START ---\n")

    # 1. CHECK FOR MISSING INSTRUCTIONS
    print("Checking for recipes with ZERO instructions...")
    query_instr = """
        SELECT r.RecipeID, r.Title
        FROM Recipes r
        LEFT JOIN Instructions i ON r.RecipeID = i.RecipeID
        WHERE i.InstructionID IS NULL
    """
    cursor.execute(query_instr)
    empty_instr = cursor.fetchall()

    if not empty_instr:
        print("SUCCESS: All recipes have instructions.")
    else:
        print(f"WARNING: Found {len(empty_instr)} recipes with NO instructions:")
        print("-" * 60)
        print(f"{'Recipe ID':<15} | {'Title'}")
        print("-" * 60)
        for row in empty_instr:
            print(f"{str(row.RecipeID):<15} | {row.Title}")
    
    print("\n" + "="*40 + "\n")

    # 2. CHECK FOR MISSING INGREDIENTS
    print("Checking for recipes with ZERO ingredients...")
    query_ing = """
        SELECT r.RecipeID, r.Title
        FROM Recipes r
        LEFT JOIN RecipeIngredients ri ON r.RecipeID = ri.RecipeID
        WHERE ri.IngredientID IS NULL
    """
    cursor.execute(query_ing)
    empty_ing = cursor.fetchall()

    if not empty_ing:
        print("SUCCESS: All recipes have ingredients.")
    else:
        print(f"WARNING: Found {len(empty_ing)} recipes with NO ingredients:")
        print("-" * 60)
        print(f"{'Recipe ID':<15} | {'Title'}")
        print("-" * 60)
        for row in empty_ing:
            print(f"{str(row.RecipeID):<15} | {row.Title}")

    print("\n--- AUDIT COMPLETE ---")
    conn.close()

if __name__ == "__main__":
    check_recipes()