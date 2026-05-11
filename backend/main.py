import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import products, suppliers, sales, transactions, dashboard, reports, invoices

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management API", version="1.0.0")

# CORS — allow dev servers and all Vercel deployments
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

# In production, allow all origins (Vercel preview URLs vary per deploy)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # open for Vercel; lock to specific domain after deploy
    allow_credentials=False,      # must be False when allow_origins=["*"]
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
