import os
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api.router import router
from app.api.ws import websocket_endpoint

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

# Initialize the OpenAI client and agents
from agents import set_default_openai_key
set_default_openai_key(settings.OPENAI_API_KEY)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load models, initialize services, etc.
    logger.info("Starting NeuroLens backend server...")
    
    # Create models directory if it doesn't exist
    try:
        import os
        os.makedirs("models", exist_ok=True)
    except Exception as e:
        logger.warning(f"Could not create models directory: {str(e)}")
    
    yield
    
    # Shutdown: Clean up resources
    logger.info("Shutting down NeuroLens backend server...")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(router, prefix="/api")

# WebSocket route
app.websocket("/ws")(websocket_endpoint)

@app.get("/")
async def root():
    """Root endpoint to verify the server is running"""
    return {
        "status": "online",
        "name": settings.APP_NAME,
        "version": "0.1.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# Run with:
# uvicorn app.main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)