import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load variables from the .env file
load_dotenv()

# Pull the hidden URL from the .env file
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the database engine with anti-drop pooling
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Automatically tests and heals dropped SSL connections
    pool_recycle=300     # Refreshes connections every 5 minutes to avoid timeouts
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency - gets database session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()