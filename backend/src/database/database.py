from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ..config.settings import settings
import logging

logger = logging.getLogger(__name__)

# Create a base class for declarative models
Base = declarative_base()

# Initialize database engine and session as None
engine = None
SessionLocal = None

# Only create database connection if database is enabled
if settings.use_database and settings.database_url:
    try:
        logger.info(f"Initializing database connection to: {settings.database_url[:20]}...")
        # Create the database engine
        engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,  # Verify connections before use
            pool_recycle=300,    # Recycle connections after 5 minutes
            echo=settings.debug  # Log SQL queries in debug mode
        )

        # Create a configured "Session" class
        SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=engine
        )
        logger.info("Database engine created successfully")
    except Exception as e:
        logger.warning(f"Failed to create database engine: {e}")
        logger.warning("Continuing without database - conversation history will not be persisted")
        engine = None
        SessionLocal = None
else:
    logger.info("Database disabled - running in stateless mode")

def get_db():
    """
    Dependency function to get database session
    Returns None if database is not available
    """
    if SessionLocal is None:
        logger.warning("Database session requested but database is not available")
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Initialize the database by creating all tables
    Does nothing if database is not available
    """
    if engine is None:
        logger.info("Skipping database initialization - database not available")
        return

    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        logger.warning("Continuing without database - conversation history will not be persisted")