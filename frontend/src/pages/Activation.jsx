
import { useState, useEffect } from "react";
import { Search, Plus, Activity, X, CheckCircle } from "lucide-react";

const initialActivations = [
  {
    id: 1,
    activationId: "ACT-1001",
    orderId: "ORD-1001",
    customer: "Rahul Sharma",
    service: "5G Unlimited",
    activationDate: "2026-11-10",
    status: "Active",
    testResult: "Passed",
  },
  {
    id: 2,
    activationId: "ACT-1002",
    orderId: "ORD-1002",
    customer: "Priya Verma",
    service: "Broadband 100 Mbps",
    activationDate: "2026-11-11",
    status: "In Progress",
    testResult: "Pending",
  },
  {
    id: 3,
    activationId: "ACT-1003",
    orderId: "ORD-1003",
    customer: "Amit Kumar",
    service: "4G Premium",
    activationDate: "2026-11-12",
    status: "Failed",
    testResult: "Failed",
  },
];

const emptyForm = {
  orderId: "",
  customer: "",
  service: "",
};

export default function Activation() {
  const [activations, setActivations] = useState(() => {
    try {
      const saved = localStorage.getItem("telecomActivations");
      return saved ? JSON.parse(saved) : initialActivations;
    } catch {
      return initialActivations;
    }
  });

  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem("telecomActivations", JSON.stringify(activations));
  }, [activations]);

  useEffect(() => {
    try {
      setTasks(
        JSON.parse(localStorage.getItem("telecomProvisioning") || "[]")
      );
      setOrders(
        JSON.parse(localStorage.getItem("telecomOrders") || "[]")
      );
    } catch {
      setTasks([]);
      setOrders([]);
    }
  }, []);

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  );

  const filteredActivations = activations.filter((item) =>
    `${item.activationId} ${item.orderId} ${item.customer} ${item.service} ${item.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function handleSubmit(e) {
    e.preventDefault();

    const highestId = activations.reduce(
      (max, item) => Math.max(max, Number(item.id)),
      0
    );

    const newActivation = {
      id: highestId + 1,
      activationId: `ACT-${1001 + highestId}`,
      ...formData,
      activationDate: new Date().toISOString().slice(0, 10),
      status: "In Progress",
      testResult: "Pending",
    };

    setActivations((previous) => [...previous, newActivation]);
    setFormData(emptyForm);
    setShowForm(false);
  }

  function runTest(id) {
    setActivations((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Active",
              testResult: "Passed",
            }
          : item
      )
    );
  }

  function getStatusClass(status) {
    if (status === "Active") return "completed";
    if (status === "In Progress") return "progress";
    if (status === "Pending") return "pending";
    return "failed";
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h1>Service Activation</h1>
          <p>Manage service activation records and perform activation tests.</p>
        </div>
      </div>

      <div className="customer-toolbar">
        <div className="customer-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search activation records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="add-customer-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close Form" : "Create Activation"}
        </button>
      </div>

      {showForm && (
        <form className="customer-form" onSubmit={handleSubmit}>
          <div className="customer-form-section">
            <h3>New Activation Record</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Completed Provisioning Task</label>
                <select
                  required
                  value={formData.orderId}
                  onChange={(e) => {
                    const selectedTask = completedTasks.find(
                      (task) => task.orderId === e.target.value
                    );

                    const selectedOrder = orders.find(
                      (order) => order.id === e.target.value
                    );

                    setFormData({
                      ...formData,
                      orderId: e.target.value,
                      customer:
                        selectedTask?.customer ||
                        selectedOrder?.customer ||
                        "",
                      service: selectedOrder?.plan || "",
                    });
                  }}
                >
                  <option value="">Select a completed task</option>
                  {completedTasks.map((task) => (
                    <option key={task.id} value={task.orderId}>
                      {task.orderId} - {task.customer}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Customer</label>
                <input value={formData.customer} readOnly />
              </div>

              <div className="form-group">
                <label>Service Plan</label>
                <input value={formData.service} readOnly />
              </div>
            </div>

            {completedTasks.length === 0 && (
              <p>
                Complete a provisioning task first to create an activation
                record.
              </p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setShowForm(false);
                setFormData(emptyForm);
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-customer-btn"
              disabled={completedTasks.length === 0}
            >
              Create Activation
            </button>
          </div>
        </form>
      )}

      <div className="customer-table-card">
        <div className="table-header">
          <div>
            <h3>Activation Records</h3>
            <p>{filteredActivations.length} records found</p>
          </div>
          <Activity size={22} />
        </div>

        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Activation ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Service Plan</th>
                <th>Activation Date</th>
                <th>Status</th>
                <th>Test Result</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredActivations.length > 0 ? (
                filteredActivations.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.activationId}</strong></td>
                    <td>{item.orderId}</td>
                    <td>{item.customer}</td>
                    <td>{item.service}</td>
                    <td>{item.activationDate}</td>
                    <td>
                      <span className={`status ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${getStatusClass(item.testResult)}`}>
                        {item.testResult}
                      </span>
                    </td>
                    <td>
                      {item.status === "In Progress" && (
                        <button
                          className="add-customer-btn"
                          onClick={() => runTest(item.id)}
                        >
                          <CheckCircle size={14} />
                          Run Test
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No activation records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
