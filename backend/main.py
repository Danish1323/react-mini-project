import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, SessionLocal
from routers import products, suppliers, sales, transactions, dashboard, reports, invoices

# Create all tables before anything else
Base.metadata.create_all(bind=engine)


def auto_seed():
    """
    Run the seed script if the database has fewer than 5 products.
    Safe to call on every startup — won't wipe user-added data if
    the DB already has a reasonable amount of products.
    On Railway (ephemeral SQLite) the DB is always fresh per deploy,
    so this ensures demo data is always present.
    """
    from models import Product
    db = SessionLocal()
    try:
        count = db.query(Product).count()
        if count < 5:
            print(f"🌱 Only {count} product(s) found — running seed...")
            db.close()
            import seed  # runs seed.py as a module
        else:
            print(f"✅ DB has {count} products — skipping seed.")
            db.close()
    except Exception as e:
        print(f"⚠️  Auto-seed error: {e}")
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    auto_seed()
    yield
    # Shutdown (nothing needed)


app = FastAPI(
    title="InvenTrack API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins (covers Vercel preview URLs)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Register routers
app.include_router(products.router)
app.include_router(suppliers.router)
app.include_router(sales.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(invoices.router)


@app.get("/")
def root():
    return {"message": "InvenTrack API running", "version": "1.0.0"}
