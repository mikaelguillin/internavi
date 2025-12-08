from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, engine
from models import School  # Import models to register them with SQLModel
from sqlalchemy.exc import OperationalError
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Internavi API",
    description="Backend API for Internavi Student Section",
    version="0.1.0"
)

# Initialize database on startup (gracefully handle connection errors)
@app.on_event("startup")
async def startup_event():
    try:
        # Test connection first
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        init_db()
        logger.info("Database initialized successfully")
    except OperationalError as e:
        logger.warning(f"Database connection failed: {e}")
        logger.warning("Server will start, but database features will not be available.")
        logger.warning("Please start PostgreSQL with: docker-compose up -d")
    except Exception as e:
        logger.error(f"Unexpected error during database initialization: {e}")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4321", "http://localhost:3000"],  # Astro default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Internavi API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

