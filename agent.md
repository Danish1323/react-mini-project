Build a full-stack Inventory Management mini project for a college React subject using:

Frontend:

- React with Vite
- React Router
- Axios
- Plain CSS or Tailwind (choose the simpler option that keeps the code easy to understand)
- Functional components with hooks only
- Keep React code simple, beginner-friendly, and student-like, but still properly structured

Backend:

- FastAPI
- SQLAlchemy
- SQLite
- Pydantic schemas
- CORS enabled for React frontend
- Keep backend code clean, modular, and good quality Python

Important coding style requirements:

- Write code in a way that a BTech student can understand and explain in viva
- Do NOT over-engineer
- Do NOT use Redux, Docker, WebSockets, authentication, or microservices
- Use simple folder structure
- Use clear variable names
- Add short useful comments only where needed
- Prefer readability over cleverness
- React code should feel like student project code, but neat and organized
- Python backend should be cleaner and slightly more professional, with separate files for models, schemas, database, and routers/services if needed
- Avoid giant files; split components logically
- Make the app easy to run locally

Project goal:
Create an Inventory Management web app for a small business to track stock levels, suppliers, sales, and reports.

Main required features:

1. Product list with quantities
2. Low-stock highlight alerts
3. Sales and profit tracking
4. Supplier contact list
5. Category-wise stock view
6. Product addition and deletion
7. Transaction logs
8. Basic inventory reports

Add these 2 unique extra features: 9. Expiry / restock reminder system:

- Products can have optional expiry date and restock date
- Show “expiring soon” and “restock due” badges on dashboard
- Add alert cards for upcoming expiry and restock deadlines

10. Inventory analytics dashboard:

- Show top-selling products
- Show low-stock count
- Show category-wise stock summary
- Show simple monthly sales and profit summary using charts
- Keep charts basic and clear

App expectations:

- Good looking, clean, simple dashboard-style UI
- Minimal and modern design
- Responsive for laptop and mobile
- Sidebar navigation on desktop, collapsible/hamburger on mobile
- Soft colors, neat cards, tables, badges, and forms
- UI should not look flashy or overdesigned
- Make it look like a good student mini project that can impress faculty
- Use a compact dashboard typography style, not huge hero headings
- Keep labels clear and practical

Suggested pages/screens:

1. Dashboard
   - KPI cards: total products, low stock items, total sales, total profit
   - Recent transactions
   - Alert widgets
   - Quick category summary
   - Top-selling products chart or list

2. Products page
   - Table of products
   - Search by product name
   - Filter by category
   - Add product form
   - Delete product action
   - Quantity, cost price, selling price, stock, category, supplier, reorder level, optional expiry/restock dates

3. Suppliers page
   - Supplier list
   - Add supplier form
   - Contact info: name, phone, email, address

4. Sales page
   - Record a sale transaction
   - Automatically reduce stock after sale
   - Calculate revenue, cost, and profit
   - Show sales history

5. Transactions page
   - Show inventory logs such as product added, stock updated, sale recorded, product deleted
   - Include date/time and action type

6. Reports page
   - Category-wise stock report
   - Low-stock report
   - Profit summary
   - Exportable report view if simple enough

Core business logic:

- Each product should include:
  - id
  - name
  - sku
  - category
  - quantity
  - cost_price
  - selling_price
  - reorder_level
  - supplier_id
  - optional expiry_date
  - optional restock_date
  - created_at

- Supplier should include:
  - id
  - name
  - contact_person
  - phone
  - email
  - address

- Sale should include:
  - id
  - product_id
  - quantity_sold
  - selling_price_at_sale
  - cost_price_at_sale
  - total_sale_amount
  - total_profit
  - sold_at

- Transaction log should include:
  - id
  - action
  - product_name
  - details
  - timestamp

Rules:

- If quantity <= reorder_level, mark as low stock
- On sale creation, reduce product quantity
- Prevent sale if stock is insufficient
- Profit = (selling_price_at_sale - cost_price_at_sale) \* quantity_sold
- Reports should be computed from saved data
- Dashboard cards must update from backend data

Tech implementation requirements:
Frontend:

- Use React Router for pages
- Use Axios for API calls
- Create reusable components like:
  - Sidebar
  - Header
  - StatCard
  - ProductTable
  - AlertPanel
  - SupplierForm
  - ProductForm
  - SalesForm
  - TransactionTable
  - ReportCards
- Use simple state management with useState and useEffect
- Keep API calls in a small api.js file
- Add loading states and empty states
- Show success/error messages simply
- Keep forms controlled and easy to read

Backend:

- Use FastAPI app with modular structure like:
  - main.py
  - database.py
  - models.py
  - schemas.py
  - crud.py or routers/
- Use SQLAlchemy ORM
- Use SQLite for easy setup
- Add CORS middleware
- Use Pydantic for request/response validation
- Provide REST APIs for products, suppliers, sales, dashboard stats, reports, and transactions

Recommended API endpoints:

- GET /products
- POST /products
- DELETE /products/{id}
- GET /suppliers
- POST /suppliers
- GET /sales
- POST /sales
- GET /transactions
- GET /dashboard
- GET /reports/category-stock
- GET /reports/low-stock
- GET /reports/profit-summary

UI/UX rules:

- Use a dashboard layout with sidebar + topbar
- Tables should be readable and simple
- Low stock rows should be highlighted with colored badge
- Use cards for KPIs
- Use badges for low stock, expiring soon, restock due
- Use charts only where useful; keep them basic and not crowded
- Use icons if needed, but lightly
- Keep accessibility in mind: labels, buttons, contrast, spacing
- Add a clean color theme with light background and one main accent color
- Keep headings practical and short

Data and demo requirements:

- Seed the database with some sample products, suppliers, sales, and logs
- Include at least 8–12 sample products across multiple categories
- Include realistic dummy data for demo

Project output requirements:

1. Generate the complete project structure for frontend and backend
2. Write all source code files
3. Include a README with setup instructions
4. Include run steps:
   - backend: uvicorn main:app --reload
   - frontend: npm install && npm run dev
5. Ensure frontend connects correctly to backend
6. Avoid code that is too advanced for a student project
7. Make the project actually runnable

Folder structure expectation:
inventory-management/
frontend/
backend/
README.md

Also do these:

- First show me the complete folder structure
- Then generate backend code
- Then generate frontend code
- Then generate README¸
- Then list how to run the project
- If a file is long, still provide full code
- Make sure imports are correct
- Make sure code is internally consistent

Design direction:

- Clean student dashboard
- Simple but attractive
- Not boring, not too flashy
- Professional enough for presentation
- Use cards, soft shadows, rounded corners, neat spacing
- Keep UI intuitive and easy to demo in class

Bonus if simple enough:

- Add CSV export button for reports
- Add search and filter together on products page
- Add small “recent activity” section on dashboard

Very important:

- Do not give me only explanation
- Actually generate the full project code
- Make sure the app is feasible for a mini project
- Keep frontend code simple and explainable
- Keep backend code high quality and structured
