import { useState, useEffect } from "react";
import { getSuppliers, addSupplier, deleteSupplier } from "../api/api";
import { Building2, Plus, Trash2, Phone, Mail, MapPin, User, CheckCircle, AlertTriangle, X } from "lucide-react";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm]  = useState(false);
  const [message, setMessage]   = useState(null);

  const [form, setForm] = useState({
    name: "", contact_person: "", phone: "", email: "", address: "",
  });

  useEffect(() => { loadSuppliers(); }, []);

  function loadSuppliers() {
    setLoading(true);
    getSuppliers()
      .then((res) => setSuppliers(res.data))
      .catch(() => showMsg("Failed to load suppliers.", "error"))
      .finally(() => setLoading(false));
  }

  function showMsg(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await addSupplier(form);
      showMsg("Supplier added.");
      setForm({ name: "", contact_person: "", phone: "", email: "", address: "" });
      setShowForm(false);
      loadSuppliers();
    } catch {
      showMsg("Failed to add supplier.", "error");
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Remove "${name}"?`)) return;
    try {
      await deleteSupplier(id);
      showMsg(`"${name}" removed.`);
      loadSuppliers();
    } catch {
      showMsg("Failed to delete supplier.", "error");
    }
  }

  if (loading) return <div className="loading"><Building2 size={16} /> Loading suppliers...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Suppliers</h1>
          <p>{suppliers.length} supplier(s) on record</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? "Cancel" : "Add Supplier"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.type === "success" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          {message.text}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-header">
            <h2><Plus size={14} /> New Supplier</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleAdd}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input name="name" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. FreshFoods Pvt Ltd" />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input name="contact_person" value={form.contact_person}
                    onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                    placeholder="e.g. Rajesh Kumar" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 9876543210" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. contact@supplier.com" />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Address</label>
                  <input name="address" value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. Mumbai, Maharashtra" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                <Plus size={13} /> Add Supplier
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Cards */}
      {suppliers.length === 0 ? (
        <div className="empty-state">
          <Building2 size={38} />
          <p>No suppliers added yet</p>
        </div>
      ) : (
        <div className="supplier-grid">
          {suppliers.map((s) => (
            <div key={s.id} className="supplier-card">
              <div className="supplier-card-top">
                <div>
                  <div className="supplier-name">{s.name}</div>
                  {s.contact_person && (
                    <div className="supplier-contact">
                      <User size={10} style={{ display: "inline", marginRight: 4 }} />
                      {s.contact_person}
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => handleDelete(s.id, s.name)}
                  title="Remove supplier"
                >
                  <Trash2 size={13} color="var(--danger)" />
                </button>
              </div>

              {s.phone && (
                <div className="supplier-detail">
                  <Phone size={11} /> {s.phone}
                </div>
              )}
              {s.email && (
                <div className="supplier-detail">
                  <Mail size={11} /> {s.email}
                </div>
              )}
              {s.address && (
                <div className="supplier-detail">
                  <MapPin size={11} /> {s.address}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Suppliers;
