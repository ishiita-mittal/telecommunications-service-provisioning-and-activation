import { useState, useEffect } from "react";
import { Search, Plus, Users, Edit2, Trash2, Eye, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck } from "lucide-react";
import customerService from "../services/customerService";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  kycStatus: "PENDING",
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.message || "Failed to load customers from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      fullName: customer.fullName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      pincode: customer.pincode || "",
      kycStatus: customer.kycStatus || "PENDING",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
    setFormData(initialForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      kycStatus: formData.kycStatus,
    };

    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.customerId, payload);
        setSuccess("Customer details updated successfully in MySQL.");
      } else {
        await customerService.createCustomer(payload);
        setSuccess("New customer and user account created in MySQL.");
      }
      closeModal();
      await fetchCustomers();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to save customer record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete customer "${customer.fullName}" (ID: ${customer.customerId})?`)) {
      return;
    }
    setError(null);
    try {
      await customerService.deleteCustomer(customer.customerId);
      setSuccess(`Customer "${customer.fullName}" deleted from database.`);
      await fetchCustomers();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete customer.");
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.fullName && c.fullName.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      String(c.customerId).includes(q)
    );
  });

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">CUSTOMER ACCOUNTS</div>
          <h1>Customers</h1>
          <p>Manage customer profiles, address info, and KYC status (synced with MySQL).</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-btn" onClick={fetchCustomers} title="Refresh records">
            <RefreshCw size={15} />
            Refresh
          </button>
          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={16} />
            Add Customer
          </button>
        </div>
      </div>

      {success && (
        <div className="workflow-note" style={{ borderLeft: "4px solid #1aab79", marginBottom: "16px" }}>
          <CheckCircle2 size={18} color="#1aab79" />
          <div>
            <b>Success</b>
            <p>{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="workflow-note" style={{ borderLeft: "4px solid #e96d7b", marginBottom: "16px" }}>
          <AlertCircle size={18} color="#e96d7b" />
          <div>
            <b>Notice / Error</b>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="toolbar">
        <label className="searcher">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name, email, phone or city..."
          />
        </label>
        <span style={{ fontSize: "11px", color: "var(--muted)", alignSelf: "center" }}>
          {filteredCustomers.length} customer{filteredCustomers.length === 1 ? "" : "s"} found
        </span>
      </div>

      <section className="panel">
        <div className="panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>Customer Directory</h2>
            <p>Database records in MySQL (telecommunications_db.customers & users)</p>
          </div>
          <Users size={18} color="var(--muted)" />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            <RefreshCw size={24} className="spin" style={{ marginBottom: "10px" }} />
            <p>Loading customers from MySQL database...</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City / State</th>
                  <th>KYC Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <tr key={c.customerId}>
                      <td>
                        <b className="mono">CUS-{c.customerId}</b>
                      </td>
                      <td>
                        <strong>{c.fullName || "—"}</strong>
                      </td>
                      <td>{c.email || "—"}</td>
                      <td>{c.phone || "—"}</td>
                      <td>
                        {c.city ? `${c.city}, ${c.state || ""}` : "—"}
                      </td>
                      <td>
                        <span
                          className={`status ${
                            c.kycStatus === "VERIFIED"
                              ? "completed"
                              : c.kycStatus === "PENDING"
                              ? "pending"
                              : "failed"
                          }`}
                        >
                          <i />
                          {c.kycStatus || "PENDING"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="mini-btn"
                            title="View customer profile"
                            onClick={() => setViewCustomer(c)}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            className="mini-btn"
                            title="Edit customer details"
                            onClick={() => openEditModal(c)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="mini-btn"
                            title="Delete customer"
                            onClick={() => handleDelete(c)}
                            style={{ background: "#ffeded", color: "#d35e68" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty">
                      No customers found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* View Customer Details Modal */}
      {viewCustomer && (
        <div className="modal-shade" onMouseDown={(e) => e.target === e.currentTarget && setViewCustomer(null)}>
          <div className="modal custom-modal" style={{ maxWidth: "480px" }}>
            <div className="modal-head">
              <h2>Customer Profile</h2>
              <button type="button" className="x-btn" onClick={() => setViewCustomer(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "grid", gap: "12px", fontSize: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Customer ID</span>
                <b className="mono">CUS-{viewCustomer.customerId}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>User ID</span>
                <b>{viewCustomer.userId ? `USR-${viewCustomer.userId}` : "—"}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Full Name</span>
                <strong>{viewCustomer.fullName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Email</span>
                <span>{viewCustomer.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Phone</span>
                <span>{viewCustomer.phone || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Address</span>
                <span>{viewCustomer.address || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>City & State</span>
                <span>{viewCustomer.city || "—"}, {viewCustomer.state || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Postal Code</span>
                <span>{viewCustomer.pincode || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                <span style={{ color: "var(--muted)" }}>KYC Status</span>
                <span
                  className={`status ${
                    viewCustomer.kycStatus === "VERIFIED"
                      ? "completed"
                      : viewCustomer.kycStatus === "PENDING"
                      ? "pending"
                      : "failed"
                  }`}
                >
                  <i />
                  {viewCustomer.kycStatus}
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="primary-btn" onClick={() => setViewCustomer(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="modal-shade" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <form className="modal custom-modal" onSubmit={handleSave}>
            <div className="modal-head">
              <h2>{editingCustomer ? `Edit Customer (CUS-${editingCustomer.customerId})` : "Add New Customer"}</h2>
              <button type="button" className="x-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>Full Name *</span>
                <input
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                />
              </label>

              <label className="field">
                <span>Email Address *</span>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. priya@gmail.com"
                />
              </label>

              <label className="field">
                <span>Phone Number</span>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876500020"
                />
              </label>

              <label className="field">
                <span>KYC Verification Status</span>
                <select
                  value={formData.kycStatus}
                  onChange={(e) => setFormData({ ...formData, kycStatus: e.target.value })}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </label>

              <label className="field" style={{ gridColumn: "span 2" }}>
                <span>Street Address</span>
                <input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Sector 62, Industrial Area"
                />
              </label>

              <label className="field">
                <span>City</span>
                <input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Noida"
                />
              </label>

              <label className="field">
                <span>State</span>
                <input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Uttar Pradesh"
                />
              </label>

              <label className="field">
                <span>Postal Code (Pincode)</span>
                <input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="e.g. 201309"
                />
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={closeModal} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? "Saving..." : editingCustomer ? "Update Customer" : "Create Customer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
