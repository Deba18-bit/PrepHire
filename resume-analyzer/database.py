from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://prephire_user:password123@localhost/prephire"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency — gets database session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()