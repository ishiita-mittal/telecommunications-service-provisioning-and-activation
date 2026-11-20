
import { useState, useEffect } from "react";
import { Search, Plus, ShoppingCart, X } from "lucide-react";

const initialOrders = [
  {
    id: "ORD-1001",
    customer: "Rahul Sharma",
    plan: "5G Unlimited",
    orderDate: "2026-11-10",
    status: "Completed",
  },
  {
    id: "ORD-1002",
    customer: "Priya Verma",
    plan: "Broadband 100 Mbps",
    orderDate: "2026-11-11",
    status: "In Progress",
  },
  {
    id: "ORD-1003",
    customer: "Amit Kumar",
    plan: "4G Premium",
    orderDate: "2026-11-12",
    status: "Pending",
  },
  {
    id: "ORD-1004",
    customer: "Neha Singh",
    plan: "Fiber 200 Mbps",
    orderDate: "2026-11-13",
    status: "Completed",
  },
  {
    id: "ORD-1005",
    customer: "Rohan Gupta",
    plan: "5G Basic",
    orderDate: "2026-11-14",
    status: "Failed",
  },
];

const emptyForm = {
  customer: "",
  plan: "",
  orderDate: new Date().toISOString().slice(0, 10),
};

export default function ServiceOrders() {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("telecomOrders");
      return saved ? JSON.parse(saved) : initialOrders;
    } catch {
      return initialOrders;
    }
  });

  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem("telecomOrders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    try {
      const savedCustomers = JSON.parse(
        localStorage.getItem("telecomCustomers") || "[]"
      );
      const savedPlans = JSON.parse(
        localStorage.getItem("telecomPlans") || "[]"
      );

      setCustomers(savedCustomers);
      setPlans(savedPlans);
    } catch {
      setCustomers([]);
      setPlans([]);
    }
  }, []);

  const filteredOrders = orders.filter((order) =>
    `${order.id} ${order.customer} ${order.plan} ${order.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function handleSubmit(e) {
    e.preventDefault();

    const highestId = orders.reduce((max, order) => {
      const number = Number(order.id.replace("ORD-", ""));
      return Math.max(max, number);
    }, 1000);

    const newOrder = {
      id: `ORD-${highestId + 1}`,
      ...formData,
      status: "Pending",
    };

    setOrders((previous) => [...previous, newOrder]);
    setFormData(emptyForm);
    setShowForm(false);
  }

  function getStatusClass(status) {
    if (status === "Completed") return "completed";
    if (status === "In Progress") return "progress";
    if (status === "Pending") return "pending";
    return "failed";
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h1>Service Orders</h1>
          <p>Manage customer orders and track their progress.</p>
        </div>
      </div>

      <div className="customer-toolbar">
        <div className="customer-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="add-customer-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close Form" : "Create Order"}
        </button>
      </div>

      {showForm && (
        <form className="customer-form" onSubmit={handleSubmit}>
          <div className="customer-form-section">
            <h3>New Service Order</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Select Customer</label>
                <select
                  required
                  value={formData.customer}
                  onChange={(e) =>
                    setFormData({ ...formData, customer: e.target.value })
                  }
                >
                  <option value="">Choose a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.name}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Service Plan</label>
                <select
                  required
                  value={formData.plan}
                  onChange={(e) =>
                    setFormData({ ...formData, plan: e.target.value })
                  }
                >
                  <option value="">Choose a plan</option>
                  {plans
                    .filter((plan) => plan.isAvailable)
                    .map((plan) => (
                      <option key={plan.id} value={plan.planName}>
                        {plan.planName} - ₹{plan.monthlyPrice}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Order Date</label>
                <input
                  required
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) =>
                    setFormData({ ...formData, orderDate: e.target.value })
                  }
                />
              </div>
            </div>

            {customers.length === 0 || plans.length === 0 ? (
              <p>
                Add customers and service plans first before creating an order.
              </p>
            ) : null}
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
              disabled={
                customers.length === 0 ||
                !plans.some((plan) => plan.isAvailable)
              }
            >
              Create Order
            </button>
          </div>
        </form>
      )}

      <div className="customer-table-card">
        <div className="table-header">
          <div>
            <h3>All Service Orders</h3>
            <p>{filteredOrders.length} orders found</p>
          </div>
          <ShoppingCart size={22} />
        </div>

        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Service Plan</th>
                <th>Order Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.customer}</td>
                    <td>{order.plan}</td>
                    <td>{order.orderDate}</td>
                    <td>
                      <span className={`status ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No orders found.
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
