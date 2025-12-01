import pyodbc
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

DB_SERVER = os.getenv('DB_SERVER', 'localhost\\SQLEXPRESS,1433')
DB_DATABASE = os.getenv('DB_DATABASE', 'pantryDatabase')
DB_USER = os.getenv('DB_USER', 'pantry_user')
DB_PASSWORD = os.getenv('DB_PASSWORD')

def create_users_table():
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
        cursor = conn.cursor()
        
        # Create Users table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
            BEGIN
                CREATE TABLE Users (
                    UserID INT PRIMARY KEY IDENTITY(1,1),
                    Username NVARCHAR(255) NOT NULL UNIQUE,
                    PasswordHash NVARCHAR(500) NOT NULL,
                    CreatedAt DATETIME DEFAULT GETDATE()
                )
            END
        """)
        
        conn.commit()
        print("✓ Users table created successfully (if it didn't exist)")
        conn.close()
        
    except Exception as e:
        print(f"Error creating Users table: {e}")

if __name__ == '__main__':
    create_users_table()