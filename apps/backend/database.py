from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment variable
database_url = os.getenv(
    "DATABASE_URL",
    "postgresql://internavi:internavi_dev@localhost:5432/internavi_db"
)

# Create engine
engine = create_engine(database_url, echo=True)


def init_db():
    """Initialize database by creating all tables"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Get database session"""
    with Session(engine) as session:
        yield session

