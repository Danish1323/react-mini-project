from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


# ─── Supplier ────────────────────────────────────────────────────────────────

class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierOut(SupplierBase):
    id: int

    class Config:
        from_attributes = True


# ─── Product ─────────────────────────────────────────────────────────────────

class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    quantity: int
    cost_price: float
    selling_price: float
    reorder_level: int = 10
    supplier_id: Optional[int] = None
    expiry_date: Optional[date] = None
    restock_date: Optional[date] = None

class ProductCreate(ProductBase):
    pass

class ProductRestock(BaseModel):
    quantity_added: int

class ProductOut(ProductBase):
    id: int
    created_at: datetime
    supplier: Optional[SupplierOut] = None

    class Config:
        from_attributes = True


# ─── Sale ─────────────────────────────────────────────────────────────────────

class SaleCreate(BaseModel):
    product_id: int
    quantity_sold: int

class SaleOut(BaseModel):
    id: int
    product_id: int
    quantity_sold: int
    selling_price_at_sale: float
    cost_price_at_sale: float
    total_sale_amount: float
    total_profit: float
    sold_at: datetime
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True


# ─── Transaction Log ─────────────────────────────────────────────────────────

class TransactionOut(BaseModel):
    id: int
    action: str
    product_name: Optional[str]
    details: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_products: int
    low_stock_count: int
    total_sales: float
    total_profit: float
    expiring_soon: list
    restock_due: list
    recent_transactions: list
    top_selling: list
    category_summary: list
