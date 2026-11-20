import { useState, useEffect } from "react";
import { Search, Plus, Wifi, Clock3, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw, X } from "lucide-react";
import planService from "../services/planService";

const initialForm = {
  planName: "",
  planType: "MOBILE",
  monthlyPrice: "",
  dataLimitGb: "",
  validityDays: "30",
  description: "",
  isAvailable: true,
};

export default function ServicePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await planService.getAllPlans();
      setPlans(data);
    } catch (err) {
      setError(err.message || "Failed to load service plans from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openAddModal = () => {
    setEditingPlan(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName || "",
      planType: plan.planType || "MOBILE",
      monthlyPrice: plan.monthlyPrice !== null ? String(plan.monthlyPrice) : "",
      dataLimitGb: plan.dataLimitGb !== null ? String(plan.dataLimitGb) : "",
      validityDays: plan.validityDays !== null ? String(plan.validityDays) : "30",
      description: plan.description || "",
      isAvailable: plan.isAvailable ?? true,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPlan(null);
    setFormData(initialForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      planName: formData.planName.trim(),
      planType: formData.planType,
      monthlyPrice: parseFloat(formData.monthlyPrice),
      dataLimitGb: formData.dataLimitGb !== "" ? parseFloat(formData.dataLimitGb) : null,
      validityDays: parseInt(formData.validityDays, 10) || 30,
      description: formData.description.trim(),
      isAvailable: formData.isAvailable,
    };

    try {
      if (editingPlan) {
        await planService.updatePlan(editingPlan.planId, payload);
        setSuccess("Service plan updated successfully.");
      } else {
        await planService.createPlan(payload);
        setSuccess("New service plan added to MySQL database.");
      }
      closeModal();
      await fetchPlans();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to save service plan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Are you sure you want to delete plan "${plan.planName}" (ID: ${plan.planId})?`)) {
      return;
    }
    setError(null);
    try {
      await planService.deletePlan(plan.planId);
      setSuccess(`Plan "${plan.planName}" deleted from database.`);
      await fetchPlans();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete service plan.");
    }
  };

  const filteredPlans = plans.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.planName && p.planName.toLowerCase().includes(q)) ||
      (p.planType && p.planType.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">SERVICE CATALOG</div>
          <h1>Service Plans</h1>
          <p>Configure mobile, broadband and fiber offerings (synced with MySQL).</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-btn" onClick={fetchPlans} title="Refresh data">
            <RefreshCw size={15} />
            Refresh
          </button>
          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={16} />
            Add Plan
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
            placeholder="Search plans by name, type or description..."
          />
        </label>
        <span style={{ fontSize: "11px", color: "var(--muted)", alignSelf: "center" }}>
          {filteredPlans.length} plan{filteredPlans.length === 1 ? "" : "s"} found
        </span>
      </div>

      {loading ? (
        <div className="panel" style={{ textAlign: "center", padding: "50px", color: "var(--muted)" }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: "10px" }} />
          <p>Loading service plans from database...</p>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "50px", color: "var(--muted)" }}>
          <p>No service plans match your criteria.</p>
        </div>
      ) : (
        <div className="plan-grid">
          {filteredPlans.map((p) => (
            <article className="plan-card" key={p.planId}>
              <div className="plan-top">
                <span>{p.planType}</span>
                <span className={`status ${p.isAvailable ? "available" : "unavailable"}`}>
                  <i />
                  {p.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
              <h3 style={{ marginTop: "12px", marginBottom: "6px" }}>{p.planName}</h3>
              <p style={{ minHeight: "36px", fontSize: "11px", color: "var(--muted)" }}>
                {p.description || "No description provided."}
              </p>
              <strong className="price" style={{ margin: "12px 0" }}>
                ₹{Number(p.monthlyPrice || 0).toLocaleString("en-IN")}
                <small> / month</small>
              </strong>
              <div className="plan-meta" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <Wifi size={14} />
                  {p.dataLimitGb ? `${p.dataLimitGb} GB` : "Unlimited"}
                </span>
                <span>
                  <Clock3 size={14} />
                  {p.validityDays} days
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                <button
                  type="button"
                  className="mini-btn"
                  onClick={() => openEditModal(p)}
                  style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  type="button"
                  className="mini-btn"
                  onClick={() => handleDelete(p)}
                  style={{ background: "#ffeded", color: "#d35e68", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-shade" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <form className="modal custom-modal" onSubmit={handleSave}>
            <div className="modal-head">
              <h2>{editingPlan ? `Edit Plan (ID: ${editingPlan.planId})` : "Add Service Plan"}</h2>
              <button type="button" className="x-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>Plan Name *</span>
                <input
                  required
                  value={formData.planName}
                  onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  placeholder="e.g. Fiber Premium 500"
                />
              </label>

              <label className="field">
                <span>Plan Type *</span>
                <select
                  value={formData.planType}
                  onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                >
                  <option value="MOBILE">MOBILE</option>
                  <option value="BROADBAND">BROADBAND</option>
                  <option value="FIBER">FIBER</option>
                  <option value="BUSINESS">BUSINESS</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </label>

              <label className="field">
                <span>Monthly Price (₹) *</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                  placeholder="e.g. 799"
                />
              </label>

              <label className="field">
                <span>Data Limit (GB)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dataLimitGb}
                  onChange={(e) => setFormData({ ...formData, dataLimitGb: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </label>

              <label className="field">
                <span>Validity (Days) *</span>
                <input
                  required
                  type="number"
                  min="1"
                  value={formData.validityDays}
                  onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                  placeholder="e.g. 30"
                />
              </label>

              <label className="field">
                <span>Availability Status</span>
                <select
                  value={formData.isAvailable ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === "true" })}
                >
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </label>

              <label className="field" style={{ gridColumn: "span 2" }}>
                <span>Description</span>
                <input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe high-speed connectivity, perks, etc."
                />
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={closeModal} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
