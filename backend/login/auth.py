from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import pyodbc
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# --- Database Connection ---
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
        conn = pyodbc.connect(conn_string)
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

# --- ROUTES ---

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user with username and password"""
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    # Validation
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    if len(username) < 5:
        return jsonify({"error": "Username must be at least 5 characters"}), 400
    
    if len(password) < 5:
        return jsonify({"error": "Password must be at least 5 characters"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check if username already exists (case-insensitive)
        cursor.execute("SELECT UserID FROM Users WHERE LOWER(Username) = LOWER(?)", (username,))
        if cursor.fetchone():
            return jsonify({"error": "Username already exists"}), 409
        
        # Hash password and insert new user
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        # hashed_password = generate_password_hash(password)
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
        
    # except Exception as e:
    #     print(f"Signup Error: {e}")
    #     import traceback
    #     traceback.print_exc()
    #     return jsonify({"error": "Registration failed"}), 500
    except Exception as e:
        import traceback
        traceback.print_exc()  # prints full traceback in Flask console
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500
    finally:
        conn.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user with username and password"""
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
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
