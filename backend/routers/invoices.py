from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Sale
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime

router = APIRouter(prefix="/invoices", tags=["Invoices"])

# Brand colors
MAROON = colors.HexColor("#452829")
BLUSH  = colors.HexColor("#E8D1C5")
CREAM  = colors.HexColor("#F3E8DF")
SLATE  = colors.HexColor("#57595B")
WHITE  = colors.white


@router.get("/{sale_id}")
def generate_invoice(sale_id: int, db: Session = Depends(get_db)):
    """Generate and return a PDF invoice for a given sale."""
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    product = sale.product
    supplier = product.supplier if product else None

    # ── Build PDF in memory ───────────────────────────────────────────────────
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    elements = []

    # ── Helper styles ─────────────────────────────────────────────────────────
    h1_style = ParagraphStyle("h1", fontSize=22, textColor=MAROON, spaceAfter=2, fontName="Helvetica-Bold")
    sub_style = ParagraphStyle("sub", fontSize=9, textColor=SLATE, spaceAfter=2)
    label_style = ParagraphStyle("label", fontSize=8, textColor=SLATE, fontName="Helvetica-Bold",
                                  textTransform="uppercase", spaceAfter=2)
    value_style = ParagraphStyle("value", fontSize=10, textColor=MAROON)
    small_style = ParagraphStyle("small", fontSize=8, textColor=SLATE)
    footer_style = ParagraphStyle("footer", fontSize=8, textColor=SLATE, alignment=TA_CENTER)
    right_style = ParagraphStyle("right", fontSize=10, textColor=MAROON, alignment=TA_RIGHT)

    # ── Header ────────────────────────────────────────────────────────────────
    elements.append(Paragraph("InvenTrack", h1_style))
    elements.append(Paragraph("Inventory Management System", sub_style))
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=MAROON))
    elements.append(Spacer(1, 0.4 * cm))

    # Invoice title + number
    title_data = [
        [Paragraph("SALE INVOICE", ParagraphStyle("t", fontSize=14, fontName="Helvetica-Bold", textColor=MAROON)),
         Paragraph(f"Invoice #INV-{sale.id:04d}", right_style)],
    ]
    title_table = Table(title_data, colWidths=["60%", "40%"])
    title_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
    elements.append(title_table)
    elements.append(Spacer(1, 0.3 * cm))

    # Date row
    sold_dt = sale.sold_at.strftime("%d %b %Y, %I:%M %p") if sale.sold_at else datetime.now().strftime("%d %b %Y")
    date_data = [
        [Paragraph("Date of Sale", label_style), Paragraph(sold_dt, value_style)],
    ]
    date_table = Table(date_data, colWidths=["30%", "70%"])
    elements.append(date_table)
    elements.append(Spacer(1, 0.5 * cm))

    # ── Product & Supplier Info ───────────────────────────────────────────────
    info_data = [
        [Paragraph("PRODUCT DETAILS", label_style), Paragraph("SUPPLIER", label_style)],
        [
            Paragraph(product.name if product else "N/A", value_style),
            Paragraph(supplier.name if supplier else "—", value_style),
        ],
        [
            Paragraph(f"SKU: {product.sku}" if product else "", small_style),
            Paragraph(f"{supplier.contact_person}" if supplier and supplier.contact_person else "", small_style),
        ],
        [
            Paragraph(f"Category: {product.category}" if product else "", small_style),
            Paragraph(f"{supplier.phone}" if supplier and supplier.phone else "", small_style),
        ],
        [
            Paragraph("", small_style),
            Paragraph(f"{supplier.email}" if supplier and supplier.email else "", small_style),
        ],
    ]
    info_table = Table(info_data, colWidths=["50%", "50%"])
    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), CREAM),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("TOPPADDING", (0, 0), (-1, 0), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 1), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 3),
        ("BOX", (0, 0), (-1, -1), 0.5, BLUSH),
        ("LINEAFTER", (0, 0), (0, -1), 0.5, BLUSH),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 0.6 * cm))

    # ── Line Items Table ──────────────────────────────────────────────────────
    elements.append(Paragraph("SALE DETAILS", label_style))
    elements.append(Spacer(1, 0.15 * cm))

    item_header = ["Description", "Qty", "Unit Price", "Total"]
    item_row = [
        product.name if product else "Product",
        str(sale.quantity_sold),
        f"Rs. {sale.selling_price_at_sale:.2f}",
        f"Rs. {sale.total_sale_amount:.2f}",
    ]

    item_table = Table(
        [item_header, item_row],
        colWidths=["45%", "15%", "20%", "20%"],
    )
    item_table.setStyle(TableStyle([
        # Header row
        ("BACKGROUND", (0, 0), (-1, 0), MAROON),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8.5),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("LEFTPADDING", (0, 0), (-1, 0), 10),
        # Data row
        ("FONTSIZE", (0, 1), (-1, -1), 9.5),
        ("TOPPADDING", (0, 1), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 10),
        ("LEFTPADDING", (0, 1), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        # Borders
        ("BOX", (0, 0), (-1, -1), 0.5, BLUSH),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, BLUSH),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("ALIGN", (-1, 0), (-1, -1), "RIGHT"),
    ]))
    elements.append(item_table)
    elements.append(Spacer(1, 0.5 * cm))

    # ── Summary ───────────────────────────────────────────────────────────────
    profit_pct = (sale.total_profit / sale.total_sale_amount * 100) if sale.total_sale_amount > 0 else 0
    summary_data = [
        ["Cost Price / unit",  f"Rs. {sale.cost_price_at_sale:.2f}"],
        ["Selling Price / unit", f"Rs. {sale.selling_price_at_sale:.2f}"],
        ["Qty Sold",           str(sale.quantity_sold)],
        ["Total Revenue",      f"Rs. {sale.total_sale_amount:.2f}"],
        ["Total Profit",       f"Rs. {sale.total_profit:.2f}"],
        ["Profit Margin",      f"{profit_pct:.1f}%"],
    ]

    summary_table = Table(summary_data, colWidths=["60%", "40%"])
    summary_table.setStyle(TableStyle([
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("FONTNAME", (0, -3), (-1, -3), "Helvetica-Bold"),
        ("FONTNAME", (0, -2), (-1, -2), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, -2), (-1, -2), MAROON),
        ("FONTSIZE", (0, -2), (-1, -2), 11),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (1, -1), (1, -1), colors.HexColor("#3d7a5a")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("LINEABOVE", (0, -3), (-1, -3), 0.5, BLUSH),
        ("BACKGROUND", (0, -3), (-1, -1), CREAM),
        ("BOX", (0, 0), (-1, -1), 0.5, BLUSH),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("TEXTCOLOR", (0, 0), (-1, -1), SLATE),
    ]))

    # Right-align the summary box
    summary_wrapper = Table([[None, summary_table]], colWidths=["45%", "55%"])
    elements.append(summary_wrapper)
    elements.append(Spacer(1, 1.2 * cm))

    # ── Footer ────────────────────────────────────────────────────────────────
    elements.append(HRFlowable(width="100%", thickness=0.5, color=BLUSH))
    elements.append(Spacer(1, 0.25 * cm))
    elements.append(Paragraph(
        "Thank you for your business. This is a system-generated invoice — no signature required.",
        footer_style
    ))
    elements.append(Paragraph("InvenTrack — Inventory Management System", footer_style))

    # ── Build & Return ────────────────────────────────────────────────────────
    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="invoice-{sale.id}.pdf"'},
    )
