from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import products, suppliers, sales, transactions, dashboard, reports, invoices

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management API", version="1.0.0")

# CORS — allow React Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
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
