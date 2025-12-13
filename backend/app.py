"""
FastAPI Application - RAG Chat Backend

Main application file with CORS middleware and router configuration.
Run with: uvicorn backend.app:app --reload --port 8000
"""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

try:
    # Try absolute import (when running from project root)
    from backend.routers import chat
except ModuleNotFoundError:
    # Fall back to relative import (when running from backend directory)
    from routers import chat

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(asctime)s - %(name)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Physical AI Textbook RAG API",
    description="Backend API for RAG-powered Q&A on Physical AI and Humanoid Robotics textbook",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Configuration
# Reads from CORS_ORIGINS environment variable (comma-separated)
# Default: localhost:3000 (Docusaurus dev server)
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in origins_str.split(",")]

logger.info(f"Configuring CORS with allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Environment-based origin whitelist
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Explicit method whitelist
    allow_headers=["Content-Type", "Authorization"],  # Explicit header whitelist
    max_age=3600  # Cache preflight requests for 1 hour
)

# Include routers
app.include_router(chat.router)

# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Physical AI Textbook RAG API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/api/chat/health"
    }


# Startup event
@app.on_event("startup")
async def startup_event():
    """Log startup information"""
    logger.info("="*60)
    logger.info("FastAPI application started")
    logger.info(f"CORS allowed origins: {allowed_origins}")
    logger.info("API documentation: http://localhost:8000/api/docs")
    logger.info("="*60)


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Log shutdown information"""
    logger.info("FastAPI application shutting down")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
