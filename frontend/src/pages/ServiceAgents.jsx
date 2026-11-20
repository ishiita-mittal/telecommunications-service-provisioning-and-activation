import { useState, useEffect } from "react";
import { Search, Plus, UserCog, Edit2, Trash2, Eye, CheckCircle2, AlertCircle, RefreshCw, X, Shield } from "lucide-react";
import agentService from "../services/agentService";
import userService from "../services/userService";

const initialForm = {
  mode: "new", // "new" or "existing"
  userId: "",
  fullName: "",
  email: "",
  phone: "",
  employeeCode: "",
  department: "Technical Support",
};

export default function ServiceAgents() {
  const [agents, setAgents] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewAgent, setViewAgent] = useState(null);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agentService.getAllAgents();
      setAgents(data);
    } catch (err) {
      setError(err.message || "Failed to load service agents from server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await userService.getAllUsers();
      setAvailableUsers(users);
    } catch (err) {
      console.warn("Could not load users list:", err.message);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingAgent(null);
    setFormData({
      ...initialForm,
      employeeCode: `J21-AG0${Math.floor(Math.random() * 900 + 100)}`,
    });
    setModalOpen(true);
  };

  const openEditModal = (agent) => {
    setEditingAgent(agent);
    setFormData({
      mode: "existing",
      userId: agent.userId ? String(agent.userId) : "",
      fullName: agent.fullName || "",
      email: agent.email || "",
      phone: agent.phone || "",
      employeeCode: agent.employeeCode || "",
      department: agent.department || "Technical Support",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAgent(null);
    setFormData(initialForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      employeeCode: formData.employeeCode.trim(),
      department: formData.department.trim(),
    };

    if (formData.mode === "existing" && formData.userId) {
      payload.userId = parseInt(formData.userId, 10);
    } else {
      payload.fullName = formData.fullName.trim();
      payload.email = formData.email.trim();
      payload.phone = formData.phone.trim();
    }

    try {
      if (editingAgent) {
        await agentService.updateAgent(editingAgent.agentId, payload);
        setSuccess("Service agent details updated successfully in MySQL.");
      } else {
        await agentService.createAgent(payload);
        setSuccess("New service agent record created in MySQL.");
      }
      closeModal();
      await fetchAgents();
      await fetchUsers();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to save agent record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (agent) => {
    if (!window.confirm(`Are you sure you want to delete agent "${agent.fullName || agent.employeeCode}" (ID: ${agent.agentId})?`)) {
      return;
    }
    setError(null);
    try {
      await agentService.deleteAgent(agent.agentId);
      setSuccess(`Agent "${agent.employeeCode}" deleted from database.`);
      await fetchAgents();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete agent.");
    }
  };

  const filteredAgents = agents.filter((a) => {
    const q = search.toLowerCase();
    return (
      (a.fullName && a.fullName.toLowerCase().includes(q)) ||
      (a.email && a.email.toLowerCase().includes(q)) ||
      (a.employeeCode && a.employeeCode.toLowerCase().includes(q)) ||
      (a.department && a.department.toLowerCase().includes(q)) ||
      String(a.agentId).includes(q)
    );
  });

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">OPERATIONS TEAM</div>
          <h1>Service Agents</h1>
          <p>Manage telecommunications support and provisioning personnel (synced with MySQL).</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-btn" onClick={fetchAgents} title="Refresh records">
            <RefreshCw size={15} />
            Refresh
          </button>
          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={16} />
            Add Agent
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
            placeholder="Search agent by name, email, employee code or department..."
          />
        </label>
        <span style={{ fontSize: "11px", color: "var(--muted)", alignSelf: "center" }}>
          {filteredAgents.length} agent{filteredAgents.length === 1 ? "" : "s"} found
        </span>
      </div>

      <section className="panel">
        <div className="panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>Agent Roster</h2>
            <p>Database records in MySQL (telecommunications_db.service_agents & users)</p>
          </div>
          <UserCog size={18} color="var(--muted)" />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            <RefreshCw size={24} className="spin" style={{ marginBottom: "10px" }} />
            <p>Loading service agents from MySQL database...</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Agent ID</th>
                  <th>Employee Code</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.length > 0 ? (
                  filteredAgents.map((a) => (
                    <tr key={a.agentId}>
                      <td>
                        <b className="mono">AGT-{a.agentId}</b>
                      </td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent)" }}>
                          {a.employeeCode}
                        </span>
                      </td>
                      <td>
                        <strong>{a.fullName || "—"}</strong>
                      </td>
                      <td>{a.email || "—"}</td>
                      <td>
                        <span className="status in-progress">
                          <i />
                          {a.department || "General"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="mini-btn"
                            title="View agent details"
                            onClick={() => setViewAgent(a)}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            className="mini-btn"
                            title="Edit agent details"
                            onClick={() => openEditModal(a)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="mini-btn"
                            title="Delete agent"
                            onClick={() => handleDelete(a)}
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
                    <td colSpan="6" className="empty">
                      No service agents found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* View Agent Details Modal */}
      {viewAgent && (
        <div className="modal-shade" onMouseDown={(e) => e.target === e.currentTarget && setViewAgent(null)}>
          <div className="modal custom-modal" style={{ maxWidth: "460px" }}>
            <div className="modal-head">
              <h2>Service Agent Profile</h2>
              <button type="button" className="x-btn" onClick={() => setViewAgent(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "grid", gap: "12px", fontSize: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Agent ID</span>
                <b className="mono">AGT-{viewAgent.agentId}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Employee Code</span>
                <strong style={{ fontFamily: "monospace" }}>{viewAgent.employeeCode}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>User ID</span>
                <b>{viewAgent.userId ? `USR-${viewAgent.userId}` : "—"}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Full Name</span>
                <strong>{viewAgent.fullName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Email</span>
                <span>{viewAgent.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Phone</span>
                <span>{viewAgent.phone || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Department</span>
                <span className="status in-progress"><i />{viewAgent.department}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="primary-btn" onClick={() => setViewAgent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Agent Modal */}
      {modalOpen && (
        <div className="modal-shade" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <form className="modal custom-modal" onSubmit={handleSave}>
            <div className="modal-head">
              <h2>{editingAgent ? `Edit Agent (AGT-${editingAgent.agentId})` : "Add Service Agent"}</h2>
              <button type="button" className="x-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            {!editingAgent && (
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <button
                  type="button"
                  className={formData.mode === "new" ? "primary-btn" : "secondary-btn"}
                  onClick={() => setFormData({ ...formData, mode: "new" })}
                  style={{ flex: 1, padding: "8px" }}
                >
                  Create New User
                </button>
                <button
                  type="button"
                  className={formData.mode === "existing" ? "primary-btn" : "secondary-btn"}
                  onClick={() => setFormData({ ...formData, mode: "existing" })}
                  style={{ flex: 1, padding: "8px" }}
                >
                  Link Existing User
                </button>
              </div>
            )}

            <div className="form-grid">
              <label className="field">
                <span>Employee Code *</span>
                <input
                  required
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  placeholder="e.g. J21-AG015"
                />
              </label>

              <label className="field">
                <span>Department *</span>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Order Management">Order Management</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Provisioning">Provisioning</option>
                  <option value="Activation">Activation</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Network Operations">Network Operations</option>
                </select>
              </label>

              {formData.mode === "existing" && !editingAgent ? (
                <label className="field" style={{ gridColumn: "span 2" }}>
                  <span>Select Existing User *</span>
                  <select
                    required
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  >
                    <option value="">-- Choose User --</option>
                    {availableUsers.map((u) => (
                      <option key={u.userId} value={u.userId}>
                        USR-{u.userId} — {u.fullName} ({u.email}) [{u.roleName || "USER"}]
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <>
                  <label className="field">
                    <span>Full Name *</span>
                    <input
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Rahul Yadav"
                    />
                  </label>

                  <label className="field">
                    <span>Email Address *</span>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rahul.agent@j21.com"
                    />
                  </label>

                  <label className="field" style={{ gridColumn: "span 2" }}>
                    <span>Phone Number</span>
                    <input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876510012"
                    />
                  </label>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={closeModal} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? "Saving..." : editingAgent ? "Update Agent" : "Create Agent"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
