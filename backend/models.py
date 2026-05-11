from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact_person = Column(String)
    phone = Column(String)
    email = Column(String)
    address = Column(String)

    # One supplier can have many products
    products = relationship("Product", back_populates="supplier")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    quantity = Column(Integer, default=0)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    reorder_level = Column(Integer, default=10)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    expiry_date = Column(Date, nullable=True)    # optional
    restock_date = Column(Date, nullable=True)   # optional
    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", back_populates="products")
    sales = relationship("Sale", back_populates="product")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity_sold = Column(Integer, nullable=False)
    selling_price_at_sale = Column(Float, nullable=False)
    cost_price_at_sale = Column(Float, nullable=False)
    total_sale_amount = Column(Float, nullable=False)
    total_profit = Column(Float, nullable=False)
    sold_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="sales")


class TransactionLog(Base):
    __tablename__ = "transaction_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)       # e.g. "PRODUCT_ADDED", "SALE_RECORDED"
    product_name = Column(String)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
