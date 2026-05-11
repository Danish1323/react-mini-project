import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, QrCode } from "lucide-react";

/**
 * QRModal — shows a QR code for a given product.
 * The QR encodes a JSON string with name, SKU, and category.
 * Allows downloading the QR as a PNG image.
 */
function QRModal({ product, onClose }) {
  const canvasRef = useRef(null);

  // What the QR encodes
  const qrValue = JSON.stringify({
    name: product.name,
    sku: product.sku,
    category: product.category,
    qty: product.quantity,
  });

  function handleDownload() {
    // The QRCodeCanvas renders a <canvas> element; grab it via the container ref
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${product.sku}.png`;
    a.click();
  }

  // Close on overlay click
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">
              <QrCode size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              Product QR Code
            </div>
            <div className="modal-subtitle">Scan to identify this product</div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* QR Code */}
        <div className="qr-wrap" ref={canvasRef}>
          <QRCodeCanvas
            value={qrValue}
            size={200}
            bgColor="#ffffff"
            fgColor="#452829"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Product info */}
        <div className="qr-meta">
          <div className="qr-meta-row">
            <span>Product</span>
            <span>{product.name}</span>
          </div>
          <div className="qr-meta-row">
            <span>SKU</span>
            <span>{product.sku}</span>
          </div>
          <div className="qr-meta-row">
            <span>Category</span>
            <span>{product.category}</span>
          </div>
          <div className="qr-meta-row">
            <span>Stock</span>
            <span>{product.quantity} units</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleDownload}>
            <Download size={13} /> Download PNG
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default QRModal;
