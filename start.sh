#!/bin/bash

echo "🚀 Starting Walmart Sparkathon Delivery Optimization System"
echo "============================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Pull latest images and build
echo "🔄 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if RabbitMQ is ready
echo "🐰 Checking RabbitMQ status..."
while ! curl -f http://localhost:15672/api/overview --user admin:admin123 > /dev/null 2>&1; do
    echo "⏳ Waiting for RabbitMQ to be ready..."
    sleep 5
done
echo "✅ RabbitMQ is ready!"

# Check if Flask backend is ready
echo "🐍 Checking Flask backend status..."
while ! curl -f http://localhost:5000/api/dashboard-data > /dev/null 2>&1; do
    echo "⏳ Waiting for Flask backend to be ready..."
    sleep 5
done
echo "✅ Flask backend is ready!"

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🌐 Starting frontend development server..."
echo "============================================================"
echo "🎯 Services are running:"
echo "   Frontend:        http://localhost:3000"
echo "   Backend API:     http://localhost:5000"
echo "   RabbitMQ Admin:  http://localhost:15672 (admin/admin123)"
echo "============================================================"
echo "🚀 Starting React development server..."

# Start the React development server
npm start