"""
GeoResilience AI — Database Engine & Session Management
Supports PostgreSQL+PostGIS for production and SQLite for quick local development.
"""

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


# ---------- Engine Setup ----------

_is_sqlite = settings.database_url.startswith("sqlite")

if _is_sqlite:
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        echo=settings.debug,
    )
    # Enable WAL mode for better concurrent reads on SQLite
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, _):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.close()
else:
    engine = create_engine(
        settings.database_url,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        echo=settings.debug,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------- Base Model ----------

class Base(DeclarativeBase):
    pass


# ---------- Dependency Injection ----------

def get_db():
    """FastAPI dependency that yields a DB session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- Table Creation ----------

def init_db():
    """Create all tables. Safe to call multiple times (uses CREATE IF NOT EXISTS)."""
    Base.metadata.create_all(bind=engine)
    print(f"[DB] Tables created on: {settings.database_url.split('@')[-1] if '@' in settings.database_url else settings.database_url}")
