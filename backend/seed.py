"""
Seed script - run this once to populate the database with sample data.
Usage: python seed.py
"""
from datetime import datetime, date, timedelta
from database import SessionLocal, engine, Base
from models import Product, Supplier, Sale, TransactionLog

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ─── Clear existing data ─────────────────────────────────────────────────────
db.query(Sale).delete()
db.query(TransactionLog).delete()
db.query(Product).delete()
db.query(Supplier).delete()
db.commit()

# ─── Suppliers ────────────────────────────────────────────────────────────────
suppliers = [
    Supplier(name="FreshFoods Pvt Ltd", contact_person="Rajesh Kumar", phone="9876543210", email="rajesh@freshfoods.in", address="Mumbai, Maharashtra"),
    Supplier(name="TechParts India", contact_person="Priya Nair", phone="9123456789", email="priya@techparts.in", address="Bengaluru, Karnataka"),
    Supplier(name="CleanHome Supplies", contact_person="Amit Sharma", phone="9988776655", email="amit@cleanhome.in", address="Delhi, NCR"),
    Supplier(name="MedCare Distributors", contact_person="Dr. Sunita Rao", phone="9871234560", email="sunita@medcare.in", address="Hyderabad, Telangana"),
]
db.add_all(suppliers)
db.commit()

s1, s2, s3, s4 = suppliers

today = date.today()

# ─── Products ─────────────────────────────────────────────────────────────────
products = [
    Product(name="Basmati Rice 5kg", sku="RICE001", category="Grocery", quantity=45, cost_price=280, selling_price=350, reorder_level=10, supplier_id=s1.id, expiry_date=today + timedelta(days=180)),
    Product(name="Sunflower Oil 1L", sku="OIL002", category="Grocery", quantity=8, cost_price=120, selling_price=160, reorder_level=10, supplier_id=s1.id, expiry_date=today + timedelta(days=20)),
    Product(name="USB-C Hub 7-in-1", sku="TECH003", category="Electronics", quantity=22, cost_price=850, selling_price=1299, reorder_level=5, supplier_id=s2.id),
    Product(name="Wireless Mouse", sku="TECH004", category="Electronics", quantity=4, cost_price=400, selling_price=699, reorder_level=5, supplier_id=s2.id),
    Product(name="Floor Cleaner 2L", sku="CLEAN005", category="Household", quantity=35, cost_price=85, selling_price=140, reorder_level=8, supplier_id=s3.id, expiry_date=today + timedelta(days=365)),
    Product(name="Dishwash Liquid 500ml", sku="CLEAN006", category="Household", quantity=6, cost_price=45, selling_price=80, reorder_level=8, supplier_id=s3.id, restock_date=today + timedelta(days=5)),
    Product(name="Paracetamol 500mg (10s)", sku="MED007", category="Medicine", quantity=120, cost_price=12, selling_price=25, reorder_level=20, supplier_id=s4.id, expiry_date=today + timedelta(days=15)),
    Product(name="Vitamin C Tablets 60s", sku="MED008", category="Medicine", quantity=50, cost_price=180, selling_price=299, reorder_level=10, supplier_id=s4.id, restock_date=today + timedelta(days=12)),
    Product(name="A4 Notebooks (Pack of 6)", sku="STAT009", category="Stationery", quantity=70, cost_price=110, selling_price=180, reorder_level=15),
    Product(name="Ball Pen Set (10 pcs)", sku="STAT010", category="Stationery", quantity=3, cost_price=30, selling_price=60, reorder_level=10),
    Product(name="Almonds 250g", sku="NUT011", category="Grocery", quantity=30, cost_price=190, selling_price=280, reorder_level=8, supplier_id=s1.id, expiry_date=today + timedelta(days=90)),
    Product(name="Green Tea 25 bags", sku="BEV012", category="Grocery", quantity=9, cost_price=75, selling_price=130, reorder_level=10, supplier_id=s1.id, restock_date=today + timedelta(days=3)),
]
db.add_all(products)
db.commit()

# ─── Sales ─────────────────────────────────────────────────────────────────────
def make_sale(product, qty, days_ago=0):
    # Guard: never sell more than available stock
    if product.quantity < qty:
        qty = product.quantity
    if qty <= 0:
        return  # Nothing to sell
    sold_at = datetime.now() - timedelta(days=days_ago)
    total_sale = qty * product.selling_price
    profit = (product.selling_price - product.cost_price) * qty
    product.quantity -= qty
    sale = Sale(
        product_id=product.id,
        quantity_sold=qty,
        selling_price_at_sale=product.selling_price,
        cost_price_at_sale=product.cost_price,
        total_sale_amount=total_sale,
        total_profit=profit,
        sold_at=sold_at
    )
    db.add(sale)
    db.add(TransactionLog(
        action="SALE_RECORDED",
        product_name=product.name,
        details=f"Sold {qty} unit(s) | Revenue: ₹{total_sale:.2f} | Profit: ₹{profit:.2f}",
        timestamp=sold_at
    ))

# Add some realistic sales spread over the past few months
make_sale(products[0], 5, days_ago=2)
make_sale(products[2], 3, days_ago=5)
make_sale(products[4], 10, days_ago=1)
make_sale(products[6], 20, days_ago=3)
make_sale(products[8], 15, days_ago=7)
make_sale(products[10], 6, days_ago=10)
make_sale(products[1], 4, days_ago=30)
make_sale(products[3], 2, days_ago=25)
make_sale(products[5], 8, days_ago=20)
make_sale(products[7], 12, days_ago=15)
make_sale(products[0], 3, days_ago=45)
make_sale(products[2], 5, days_ago=40)
make_sale(products[4], 7, days_ago=35)
make_sale(products[9], 5, days_ago=60)
make_sale(products[11], 4, days_ago=55)

db.commit()

# ─── Transaction Logs (non-sale events) ──────────────────────────────────────
logs = [
    TransactionLog(action="PRODUCT_ADDED", product_name="Basmati Rice 5kg", details="Initial stock entry | SKU: RICE001", timestamp=datetime.now() - timedelta(days=90)),
    TransactionLog(action="STOCK_UPDATED", product_name="Wireless Mouse", details="Stock updated from 10 to 20 units", timestamp=datetime.now() - timedelta(days=60)),
    TransactionLog(action="PRODUCT_ADDED", product_name="Paracetamol 500mg", details="New medicine product added | SKU: MED007", timestamp=datetime.now() - timedelta(days=45)),
    TransactionLog(action="STOCK_UPDATED", product_name="Floor Cleaner 2L", details="Restocked: +20 units added", timestamp=datetime.now() - timedelta(days=14)),
]
db.add_all(logs)
db.commit()

db.close()
print("✅ Database seeded successfully with sample data!")
