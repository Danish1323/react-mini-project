from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from models import Product, Supplier, Sale, TransactionLog
from schemas import ProductCreate, SupplierCreate, SaleCreate


# ─── Products ─────────────────────────────────────────────────────────────────

def get_products(db: Session):
    return db.query(Product).all()

def create_product(db: Session, product: ProductCreate):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    # Log the action
    log = TransactionLog(
        action="PRODUCT_ADDED",
        product_name=db_product.name,
        details=f"SKU: {db_product.sku}, Category: {db_product.category}, Qty: {db_product.quantity}"
    )
    db.add(log)
    db.commit()

    return db_product

def delete_product(db: Session, product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return None

    # Log before deleting
    log = TransactionLog(
        action="PRODUCT_DELETED",
        product_name=product.name,
        details=f"Product '{product.name}' (SKU: {product.sku}) was removed from inventory"
    )
    db.add(log)
    db.delete(product)
    db.commit()
    return True


# ─── Suppliers ────────────────────────────────────────────────────────────────

def get_suppliers(db: Session):
    return db.query(Supplier).all()

def create_supplier(db: Session, supplier: SupplierCreate):
    db_supplier = Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def delete_supplier(db: Session, supplier_id: int):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        return None
    db.delete(supplier)
    db.commit()
    return True


# ─── Sales ────────────────────────────────────────────────────────────────────

def get_sales(db: Session):
    return db.query(Sale).all()

def create_sale(db: Session, sale_data: SaleCreate):
    # Get the product
    product = db.query(Product).filter(Product.id == sale_data.product_id).first()
    if not product:
        return {"error": "Product not found"}
    if sale_data.quantity_sold <= 0:
        return {"error": "Quantity must be at least 1"}
    if product.quantity < sale_data.quantity_sold:
        return {"error": f"Insufficient stock. Only {product.quantity} unit(s) available."}

    total_sale = sale_data.quantity_sold * product.selling_price
    total_profit = (product.selling_price - product.cost_price) * sale_data.quantity_sold

    # Create sale record
    sale = Sale(
        product_id=product.id,
        quantity_sold=sale_data.quantity_sold,
        selling_price_at_sale=product.selling_price,
        cost_price_at_sale=product.cost_price,
        total_sale_amount=total_sale,
        total_profit=total_profit
    )
    db.add(sale)

    # Reduce product stock
    product.quantity -= sale_data.quantity_sold

    # Log the transaction
    log = TransactionLog(
        action="SALE_RECORDED",
        product_name=product.name,
        details=f"Sold {sale_data.quantity_sold} unit(s) of '{product.name}' | Revenue: ₹{total_sale:.2f} | Profit: ₹{total_profit:.2f}"
    )
    db.add(log)
    db.commit()
    db.refresh(sale)
    return sale


# ─── Transactions ─────────────────────────────────────────────────────────────

def get_transactions(db: Session):
    return db.query(TransactionLog).order_by(TransactionLog.timestamp.desc()).all()


# ─── Dashboard ────────────────────────────────────────────────────────────────

def get_dashboard_stats(db: Session):
    today = date.today()
    soon = today + timedelta(days=30)  # expiring within 30 days

    products = db.query(Product).all()
    total_products = len(products)
    low_stock = [p for p in products if p.quantity <= p.reorder_level]

    # Expiring soon
    expiring = [
        {"id": p.id, "name": p.name, "expiry_date": str(p.expiry_date)}
        for p in products if p.expiry_date and today <= p.expiry_date <= soon
    ]

    # Restock due
    restock_due = [
        {"id": p.id, "name": p.name, "restock_date": str(p.restock_date)}
        for p in products if p.restock_date and p.restock_date <= soon
    ]

    # Sales totals
    sales = db.query(Sale).all()
    total_sales = sum(s.total_sale_amount for s in sales)
    total_profit = sum(s.total_profit for s in sales)

    # Top-selling products by quantity sold
    top_selling_raw = (
        db.query(Product.name, func.sum(Sale.quantity_sold).label("total_sold"))
        .join(Sale, Sale.product_id == Product.id)
        .group_by(Product.name)
        .order_by(func.sum(Sale.quantity_sold).desc())
        .limit(5)
        .all()
    )
    top_selling = [{"name": row[0], "total_sold": row[1]} for row in top_selling_raw]

    # Category summary
    category_raw = (
        db.query(Product.category, func.sum(Product.quantity).label("total_qty"))
        .group_by(Product.category)
        .all()
    )
    category_summary = [{"category": row[0], "total_qty": row[1]} for row in category_raw]

    # Recent 5 transactions
    recent = db.query(TransactionLog).order_by(TransactionLog.timestamp.desc()).limit(5).all()
    recent_transactions = [
        {"action": t.action, "product_name": t.product_name, "details": t.details, "timestamp": str(t.timestamp)}
        for t in recent
    ]

    return {
        "total_products": total_products,
        "low_stock_count": len(low_stock),
        "total_sales": round(total_sales, 2),
        "total_profit": round(total_profit, 2),
        "expiring_soon": expiring,
        "restock_due": restock_due,
        "recent_transactions": recent_transactions,
        "top_selling": top_selling,
        "category_summary": category_summary,
    }


# ─── Reports ─────────────────────────────────────────────────────────────────

def get_category_stock_report(db: Session):
    rows = (
        db.query(Product.category, func.sum(Product.quantity).label("total_qty"), func.count(Product.id).label("product_count"))
        .group_by(Product.category)
        .all()
    )
    return [{"category": r[0], "total_qty": r[1], "product_count": r[2]} for r in rows]

def get_low_stock_report(db: Session):
    products = db.query(Product).all()
    return [
        {"id": p.id, "name": p.name, "sku": p.sku, "category": p.category,
         "quantity": p.quantity, "reorder_level": p.reorder_level}
        for p in products if p.quantity <= p.reorder_level
    ]

def get_profit_summary(db: Session):
    sales = db.query(Sale).all()
    monthly = {}
    for s in sales:
        key = s.sold_at.strftime("%Y-%m")
        if key not in monthly:
            monthly[key] = {"month": key, "revenue": 0, "profit": 0, "transactions": 0}
        monthly[key]["revenue"] += s.total_sale_amount
        monthly[key]["profit"] += s.total_profit
        monthly[key]["transactions"] += 1

    # Round values
    for k in monthly:
        monthly[k]["revenue"] = round(monthly[k]["revenue"], 2)
        monthly[k]["profit"] = round(monthly[k]["profit"], 2)

    return sorted(monthly.values(), key=lambda x: x["month"])
