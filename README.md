# InvenTrack — Inventory Management System

A full-stack **Inventory Management** mini project built with **React + FastAPI**.

> **BTech Mini Project** — Demonstrates CRUD operations, REST APIs, React Hooks, and SQLAlchemy ORM.

---

## 📁 Project Structure

```
react-mini-project/
├── backend/
│   ├── main.py           # FastAPI app entry point
│   ├── database.py       # SQLAlchemy engine + session
│   ├── models.py         # ORM models
│   ├── schemas.py        # Pydantic schemas
│   ├── crud.py           # Business logic & DB queries
│   ├── routers/
│   │   ├── products.py
│   │   ├── suppliers.py
│   │   ├── sales.py
│   │   ├── transactions.py
│   │   ├── dashboard.py
│   │   └── reports.py
│   ├── seed.py           # Database seeder (run once)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/api.js            # All Axios API calls
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── AlertPanel.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Suppliers.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Transactions.jsx
│   │   │   └── Reports.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── index.html
└── README.md
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 📦 Product Management | Add, view, delete products with full details |
| ⚠️ Low Stock Alerts | Highlight products at or below reorder level |
| 🏭 Supplier Directory | Add and manage supplier contact info |
| 💰 Sales Recording | Record sales, auto-reduce stock, calculate profit |
| 📋 Transaction Logs | Complete audit trail of all inventory events |
| 📊 Reports | Category stock, low stock, monthly profit with charts |
| 🔔 Expiry Reminders | Badge products expiring within 30 days |
| 🔄 Restock Reminders | Badge products with restock dates due soon |
| 📈 Analytics Dashboard | KPIs, top-selling products, category charts |
| ⬇️ CSV Export | Export any report to CSV |

---

## 🚀 How to Run

### 1. Backend (FastAPI)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample data (run only once)
python seed.py

# Start the backend server
uvicorn main:app --reload
```

Backend will run at: **http://localhost:8000**  
API docs (Swagger UI): **http://localhost:8000/docs**

---

### 2. Frontend (React + Vite)

```bash
cd frontend

# Install npm packages (already done if you ran npm install)
npm install

# Start the dev server
npm run dev
```

Frontend will run at: **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/` | List all products |
| POST | `/products/` | Add a product |
| DELETE | `/products/{id}` | Delete a product |
| GET | `/suppliers/` | List suppliers |
| POST | `/suppliers/` | Add supplier |
| DELETE | `/suppliers/{id}` | Delete supplier |
| GET | `/sales/` | List all sales |
| POST | `/sales/` | Record a sale |
| GET | `/transactions/` | List all transaction logs |
| GET | `/dashboard/` | Dashboard stats |
| GET | `/reports/category-stock` | Category stock report |
| GET | `/reports/low-stock` | Low stock report |
| GET | `/reports/profit-summary` | Monthly profit summary |

---

## 🛠️ Tech Stack

**Frontend:** React, Vite, React Router, Axios, Recharts  
**Backend:** FastAPI, SQLAlchemy, SQLite, Pydantic, Uvicorn

---

## 📝 Notes

- SQLite database (`inventory.db`) is auto-created in the `backend/` folder on first run.
- Run `seed.py` once to populate with 12 sample products, 4 suppliers, and 15+ sales.
- Both servers must be running at the same time for the app to work.
