#!/bin/bash
# Start FastAPI backend server
# Usage: ./start_server.sh

echo "🚀 Starting FastAPI backend server..."
echo "📍 API docs will be available at: http://localhost:8000/api/docs"
echo "🔍 Health check: http://localhost:8000/api/chat/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uv run uvicorn app:app --host 0.0.0.0 --port 8000 --reload
