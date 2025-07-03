#!/bin/bash

echo "🚀 Starting Inventory Management System..."

# 1. Run PostgreSQL container
echo "📦 Starting PostgreSQL..."
docker run -d \
  --name inventory-db \
  -e POSTGRES_DB=inventory_mg_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=Pass@123 \
  -p 5432:5432 \
  postgres:13

# 2. Pull and run backend
echo "🔄 Pulling backend image from Docker Hub..."
docker pull suyash2810/inventory-management:backend

echo "🛠️ Starting backend server..."
docker run -d \
  --name inventory-backend \
  --link inventory-db \
  -p 8000:8000 \
  suyash2810/inventory-management:backend

# 3. Pull and run frontend
echo "🔄 Pulling frontend image from Docker Hub..."
docker pull suyash2810/inventory-management:frontend

echo "🖥️ Starting frontend server..."
docker run -d \
  --name inventory-frontend \
  -p 4173:4173 \
  suyash2810/inventory-management:frontend

# 4. Done
echo "✅ All services started!"
echo "Frontend: http://localhost:4173"
echo "Backend:  http://localhost:8000"
