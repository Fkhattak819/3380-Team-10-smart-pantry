#!/bin/bash

# SQL Server Database Setup Script
# This script sets up SQL Server in Docker and initializes the database

echo "=== SQL Server Database Setup ==="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo ""
    echo "Please install Docker Desktop:"
    echo "1. Download from: https://www.docker.com/products/docker-desktop/"
    echo "2. Install Docker Desktop.app"
    echo "3. Start Docker Desktop from Applications"
    echo "4. Wait for Docker to start (whale icon in menu bar)"
    echo "5. Run this script again"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo ""
    echo "Please start Docker Desktop and wait for it to be ready, then run this script again"
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Check if SQL Server container already exists
if docker ps -a | grep -q sqlserver; then
    echo "📦 SQL Server container exists"
    # Check if it's running
    if docker ps | grep -q sqlserver; then
        echo "✅ SQL Server container is already running"
    else
        echo "🔄 Starting existing SQL Server container..."
        docker start sqlserver
        sleep 5
    fi
else
    echo "🚀 Creating and starting SQL Server container..."
    docker run -e "ACCEPT_EULA=Y" \
        -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" \
        -p 1433:1433 \
        --name sqlserver \
        -d mcr.microsoft.com/mssql/server:2022-latest
    
    echo "⏳ Waiting for SQL Server to start (this may take 30-60 seconds)..."
    sleep 30
    
    # Wait for SQL Server to be ready
    for i in {1..30}; do
        if sqlcmd -S localhost,1433 -U sa -P "YourStrong@Passw0rd" -Q "SELECT 1" &> /dev/null; then
            echo "✅ SQL Server is ready!"
            break
        fi
        echo "   Waiting... ($i/30)"
        sleep 2
    done
fi

echo ""
echo "📊 Setting up database..."

# Create database
echo "Creating PantryDatabase..."
sqlcmd -S localhost,1433 -U sa -P "YourStrong@Passw0rd" -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PantryDatabase') CREATE DATABASE PantryDatabase" 2>&1

# Run init.sql
if [ -f "backend/init.sql" ]; then
    echo "Running init.sql to create tables..."
    sqlcmd -S localhost,1433 -U sa -P "YourStrong@Passw0rd" -d PantryDatabase -i backend/init.sql 2>&1 | grep -v "^$" | tail -5
fi

# Run seed_recipes.sql
if [ -f "backend/seed_recipes.sql" ]; then
    echo "Seeding recipes..."
    sqlcmd -S localhost,1433 -U sa -P "YourStrong@Passw0rd" -d PantryDatabase -i backend/seed_recipes.sql 2>&1 | grep -v "^$" | tail -5
fi

# Run seed_user.sql
if [ -f "backend/seed_user.sql" ]; then
    echo "Creating test user..."
    sqlcmd -S localhost,1433 -U sa -P "YourStrong@Passw0rd" -d PantryDatabase -i backend/seed_user.sql 2>&1 | grep -v "^$" | tail -5
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "You can now start your Flask backend with:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python app.py"
echo ""


