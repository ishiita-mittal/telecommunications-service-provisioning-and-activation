import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import provisioningService from "./services/provisioningService";
import historyService from "./services/historyService";
import api from "./services/api";
import resourceService from "./services/resourceService";
import activationService from "./services/activationService";
import orderService from "./services/orderService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  Package,
  ShoppingCart,
  Activity,
  Plus,
  Search,
  ArrowUpRight,
  Wifi,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Workflow,
} from "lucide-react";
import { Sidebar, Topbar } from "./components/Layout";
import { readData, writeData, idFor } from "./data";
import ServicePlans from "./pages/ServicePlans";
import CustomersPage from "./pages/Customers";
import ServiceAgents from "./pages/ServiceAgents";
import "./App.css";
const today = () => new Date().toISOString().slice(0, 10);
const statusClass = (s) =>
  String(s || "")
    .toLowerCase()
    .replaceAll(" ", "-");
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
function useData() {
  const [d, setD] = useState(readData);
  useEffect(() => {
    const sync = () => setD(readData());
    window.addEventListener("telecompro-update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("telecompro-update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const update = (patch) => {
    const n = { ...readData(), ...patch };
    writeData(n);
    setD(n);
  };
  return [d, update];
}
function Title({ name, desc, action }) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">TELECOM OPERATIONS</div>
        <h1>{name}</h1>
        <p>{desc}</p>
      </div>
      {action}
    </div>
  );
}
function Btn({ children, ...p }) {
  return (
    <button className="primary-btn" {...p}>
      <Plus size={16} />
      {children}
    </button>
  );
}
function Searcher({ value, onChange, placeholder = "Search records..." }) {
  return (
    <label className="searcher">
      <Search size={16} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
function Status({ children }) {
  return (
    <span className={`status ${statusClass(children)}`}>
      <i />
      {children}
    </span>
  );
}
function Panel({ title, sub, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
function Table({ cols, rows, empty = "No records found." }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {cols.map((x) => (
              <th key={x}>{x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r, i) => (
              <tr key={i}>
                {r.map((v, j) => (
                  <td key={j}>{v}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={cols.length} className="empty">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
function Modal({ title, close, save, children }) {
  return (
    <div
      className="modal-shade"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <form className="modal" onSubmit={save}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="x-btn" onClick={close}>
            ×
          </button>
        </div>
        <div className="form-grid">{children}</div>
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={close}>
            Cancel
          </button>
          <button className="primary-btn">Save record</button>
        </div>
      </form>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Dashboard() {
  const [data, setData] = useState({
    customers: [],
    plans: [],
    orders: [],
    activations: [],
    tasks: [],
    resources: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [
          customers,
          plans,
          orders,
          activations,
          tasks,
          resources,
        ] = await Promise.all([
          api.get("/customers"),
          api.get("/plans"),
          orderService.getAllOrders(),
          activationService.getAllRecords(),
          provisioningService.getAllTasks(),
          resourceService.getAllResources(),
        ]);

        setData({
          customers: customers.data,
          plans: plans.data,
          orders,
          activations,
          tasks,
          resources,
        });
      } catch (err) {
        setError(err.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const { customers, plans, orders, activations, tasks, resources } = data;

  const statuses = Object.entries(
    orders.reduce((counts, order) => {
      const status = order.orderStatus || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const colors = [
    "#21b58a",
    "#6582f4",
    "#f2b34e",
    "#e96d7b",
    "#9275d8",
    "#36a6b4",
  ];

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ].map((month, i) => ({
    month,
    orders: orders.filter(
      (o) => o.orderDate &&
        new Date(o.orderDate).getMonth() === i
    ).length,
  }));

  const active = activations.filter(
    (a) => a.activationStatus?.toUpperCase() === "ACTIVE"
  ).length;

  const inProgress = orders.filter(
    (o) => o.orderStatus?.toUpperCase() === "IN_PROGRESS"
  ).length;

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.orderDate || 0) - new Date(a.orderDate || 0)
    )
    .slice(0, 5);

  if (loading) {
    return <p>Loading dashboard data from database...</p>;
  }

  if (error) {
    return (
      <>
        <Title
          name="Good morning, Admin"
          desc="Telecom service operations overview."
        />
        <p style={{ color: "red" }}>{error}</p>
      </>
    );
  }

  return (
    <>
      <Title
        name="Good morning, Admin"
        desc="Here's what's happening across your telecom service operations today."
      />

      <div className="stats">
        {[
          [
            Users,
            "Total customers",
            customers.length,
            "Customer accounts",
            "violet",
          ],
          [
            Package,
            "Service plans",
            plans.length,
            `${plans.filter((p) => p.isAvailable).length} available`,
            "blue",
          ],
          [
            ShoppingCart,
            "Total orders",
            orders.length,
            `${inProgress} in progress`,
            "amber",
          ],
          [
            Activity,
            "Active services",
            active,
            "Successfully activated",
            "green",
          ],
        ].map(([I, n, v, note, t]) => (
          <div className="stat" key={n}>
            <div className={`stat-icon ${t}`}>
              <I size={19} />
            </div>
            <span>{n}</span>
            <strong>{v.toLocaleString("en-IN")}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>

      <div className="charts">
        <Panel
          title="Service order activity"
          sub="Orders received by month"
        >
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months}>
                <CartesianGrid
                  strokeDasharray="3 4"
                  vertical={false}
                  stroke="var(--line)"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    color: "var(--text)",
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill="#667cf3"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Order status"
          sub="Current order distribution"
        >
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statuses}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {statuses.map((x, i) => (
                    <Cell
                      key={x.name}
                      fill={colors[i % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        title="Recent service orders"
        sub="Latest customer service requests"
      >
        <Table
          cols={[
            "Order ID",
            "Customer",
            "Service plan",
            "Order date",
            "Status",
          ]}
          rows={recentOrders.map((o) => [
            <b className="mono">{o.orderId}</b>,
            o.customerName || "—",
            o.planName || "—",
            o.orderDate
              ? new Date(o.orderDate).toLocaleDateString("en-IN")
              : "—",
            <Status>{o.orderStatus || "Unknown"}</Status>,
          ])}
        />
      </Panel>

      <p className="demo-note">
        <Wifi size={14} /> Live database data · Connected to Spring Boot
        and MySQL.
      </p>
    </>
  );
}

function Customers({ d, update }) {
  const [s, S] = useState("");
  const [show, M] = useState(false);
  const [f, F] = useState({
    name: "",
    email: "",
    phone: "",
    plan: d.plans[0]?.planName || "",
  });
  const rows = d.customers.filter((x) =>
    `${x.id} ${x.name} ${x.email}`.toLowerCase().includes(s.toLowerCase()),
  );
  function save(e) {
    e.preventDefault();
    update({
      customers: [
        ...d.customers,
        { ...f, id: idFor("CUS", d.customers), status: "Active" },
      ],
    });
    M(false);
  }
  return (
    <>
      <Title
        name="Customers"
        desc="Manage customer profiles and subscribed services."
        action={<Btn onClick={() => M(true)}>Add customer</Btn>}
      />
      <div className="toolbar">
        <Searcher
          value={s}
          onChange={S}
          placeholder="Search customer name, email or ID..."
        />
      </div>
      <Panel title="Customer directory" sub={`${rows.length} records`}>
        <Table
          cols={[
            "Customer ID",
            "Customer",
            "Email",
            "Phone",
            "Service plan",
            "Status",
          ]}
          rows={rows.map((x) => [
            <b className="mono">{x.id}</b>,
            x.name,
            x.email,
            x.phone,
            x.plan,
            <Status>{x.status}</Status>,
          ])}
        />
      </Panel>
      {show && (
        <Modal title="Add customer" close={() => M(false)} save={save}>
          <Field label="Full name">
            <input
              required
              value={f.name}
              onChange={(e) => F({ ...f, name: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={f.email}
              onChange={(e) => F({ ...f, email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <input
              required
              pattern="[0-9]{10}"
              value={f.phone}
              onChange={(e) => F({ ...f, phone: e.target.value })}
            />
          </Field>
          <Field label="Service plan">
            <select
              value={f.plan}
              onChange={(e) => F({ ...f, plan: e.target.value })}
            >
              {d.plans.map((p) => (
                <option>{p.planName}</option>
              ))}
            </select>
          </Field>
        </Modal>
      )}
    </>
  );
}
function Plans({ d, update }) {
  const [s, S] = useState("");
  const [show, M] = useState(false);
  const [f, F] = useState({
    planName: "",
    planType: "Mobile",
    description: "",
    monthlyPrice: "",
    dataLimitGb: "",
    validityDays: "",
  });
  const rows = d.plans.filter((p) =>
    `${p.planName} ${p.planType}`.toLowerCase().includes(s.toLowerCase()),
  );
  function save(e) {
    e.preventDefault();
    update({
      plans: [
        ...d.plans,
        {
          ...f,
          id: Math.max(0, ...d.plans.map((p) => p.id)) + 1,
          monthlyPrice: +f.monthlyPrice,
          dataLimitGb: +f.dataLimitGb,
          validityDays: +f.validityDays,
          isAvailable: true,
        },
      ],
    });
    M(false);
  }
  return (
    <>
      <Title
        name="Service plans"
        desc="Configure mobile, broadband and fiber offerings."
        action={<Btn onClick={() => M(true)}>Add plan</Btn>}
      />
      <div className="toolbar">
        <Searcher value={s} onChange={S} placeholder="Search plans..." />
      </div>
      <div className="plan-grid">
        {rows.map((p) => (
          <article className="plan-card" key={p.id}>
            <div className="plan-top">
              <span>{p.planType}</span>
              <Status>{p.isAvailable ? "Available" : "Unavailable"}</Status>
            </div>
            <h3>{p.planName}</h3>
            <p>{p.description}</p>
            <strong className="price">
              {money(p.monthlyPrice)}
              <small> / month</small>
            </strong>
            <div className="plan-meta">
              <span>
                <Wifi size={14} />
                {p.dataLimitGb} GB
              </span>
              <span>
                <Clock3 size={14} />
                {p.validityDays} days
              </span>
            </div>
          </article>
        ))}
      </div>
      {show && (
        <Modal title="Add service plan" close={() => M(false)} save={save}>
          <Field label="Plan name">
            <input
              required
              value={f.planName}
              onChange={(e) => F({ ...f, planName: e.target.value })}
            />
          </Field>
          <Field label="Plan type">
            <select
              value={f.planType}
              onChange={(e) => F({ ...f, planType: e.target.value })}
            >
              <option>Mobile</option>
              <option>Broadband</option>
              <option>Fiber</option>
            </select>
          </Field>
          <Field label="Monthly price">
            <input
              required
              type="number"
              min="1"
              value={f.monthlyPrice}
              onChange={(e) => F({ ...f, monthlyPrice: e.target.value })}
            />
          </Field>
          <Field label="Data limit GB">
            <input
              required
              type="number"
              min="1"
              value={f.dataLimitGb}
              onChange={(e) => F({ ...f, dataLimitGb: e.target.value })}
            />
          </Field>
          <Field label="Validity days">
            <input
              required
              type="number"
              min="1"
              value={f.validityDays}
              onChange={(e) => F({ ...f, validityDays: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <input
              required
              value={f.description}
              onChange={(e) => F({ ...f, description: e.target.value })}
            />
          </Field>
        </Modal>
      )}
    </>
  );
}
function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [s, S] = useState("");
  const [show, M] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [f, F] = useState({
    customerId: "",
    planId: "",
    installationAddress: "",
    approvalRemarks: "",
  });

  async function fetchData() {
    try {
      setError("");
      const [orderResponse, customerResponse, planResponse] =
        await Promise.all([
          orderService.getAllOrders(),
          api.get("/customers"),
          api.get("/plans"),
        ]);

      setOrders(orderResponse);
      setCustomers(customerResponse.data);
      setPlans(planResponse.data);
    } catch (err) {
      setError(err.message || "Unable to load order information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const rows = orders.filter((o) =>
    `ORD-${o.orderId} ${o.customerName} ${o.planName} ${o.orderStatus}`
      .toLowerCase()
      .includes(s.toLowerCase()),
  );

  async function save(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await orderService.createOrder({
        customerId: Number(f.customerId),
        planId: Number(f.planId),
        installationAddress: f.installationAddress,
        approvalRemarks: f.approvalRemarks || null,
        reviewedBy: null,
        orderStatus: "SUBMITTED",
      });

      await fetchData();
      M(false);
      F({
        customerId: "",
        planId: "",
        installationAddress: "",
        approvalRemarks: "",
      });
    } catch (err) {
      setError(err.message || "Unable to create service order.");
    } finally {
      setSaving(false);
    }
  }

  const displayStatus = (status) =>
    String(status || "").replaceAll("_", " ");

  return (
    <>
      <Title
        name="Service orders"
        desc="Capture customer requests and monitor order fulfilment."
        action={<Btn onClick={() => M(true)}>Create order</Btn>}
      />

      <div className="toolbar">
        <Searcher
          value={s}
          onChange={S}
          placeholder="Search order, customer or plan..."
        />
      </div>

      {error && (
        <div className="info" role="alert">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <Panel
        title="All service orders"
        sub={loading ? "Loading records..." : `${rows.length} records`}
      >
        <Table
          cols={[
            "Order ID",
            "Customer",
            "Service plan",
            "Order date",
            "Status",
          ]}
          rows={
            loading
              ? []
              : rows.map((o) => [
                  <b className="mono">ORD-{o.orderId}</b>,
                  o.customerName || "—",
                  o.planName || "—",
                  o.orderDate
                    ? new Date(o.orderDate).toLocaleDateString("en-IN")
                    : "—",
                  <Status>{displayStatus(o.orderStatus)}</Status>,
                ])
          }
          empty={loading ? "Loading orders..." : "No service orders found."}
        />
      </Panel>

      {show && (
        <Modal
          title="Create service order"
          close={() => M(false)}
          save={save}
        >
          <Field label="Customer">
            <select
              required
              value={f.customerId}
              onChange={(e) => F({ ...f, customerId: e.target.value })}
            >
              <option value="">Choose customer</option>
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Available plan">
            <select
              required
              value={f.planId}
              onChange={(e) => F({ ...f, planId: e.target.value })}
            >
              <option value="">Choose plan</option>
              {plans
                .filter((p) => p.isAvailable)
                .map((p) => (
                  <option key={p.planId} value={p.planId}>
                    {p.planName} — ₹{p.monthlyPrice}/month
                  </option>
                ))}
            </select>
          </Field>

          <Field label="Installation address">
            <input
              required
              maxLength={255}
              value={f.installationAddress}
              onChange={(e) =>
                F({ ...f, installationAddress: e.target.value })
              }
              placeholder="Enter installation address"
            />
          </Field>

          <Field label="Approval remarks (optional)">
            <input
              maxLength={500}
              value={f.approvalRemarks}
              onChange={(e) => F({ ...f, approvalRemarks: e.target.value })}
              placeholder="Enter remarks"
            />
          </Field>
          {saving && <p>Saving order...</p>}
        </Modal>
      )}
    </>
  );
}
function SimpleTablePage({ title, desc, rows, cols, searchable = true }) {
  const [s, S] = useState("");
  const filtered = rows.filter((r) =>
    r.join(" ").toLowerCase().includes(s.toLowerCase()),
  );
  return (
    <>
      <Title name={title} desc={desc} />
      {searchable && (
        <div className="toolbar">
          <Searcher value={s} onChange={S} />
        </div>
      )}
      <Panel title={title} sub={`${filtered.length} records`}>
        <Table cols={cols} rows={filtered} />
      </Panel>
    </>
  );
}
function Agents() {
  const a = [
    [
      "AGT-1001",
      "Aarav Mehta",
      "aarav.mehta@gmail.com",
      "EMP001",
      "Technical",
      "Active",
    ],
    [
      "AGT-1002",
      "Ananya Sharma",
      "ananya.sharma@gmail.com",
      "EMP002",
      "Customer Support",
      "Active",
    ],
    [
      "AGT-1003",
      "Rohan Verma",
      "rohan.verma@gmail.com",
      "EMP003",
      "Network Operations",
      "Active",
    ],
    [
      "AGT-1004",
      "Sneha Gupta",
      "sneha.gupta@gmail.com",
      "EMP004",
      "Technical",
      "Inactive",
    ],
  ];
  return (
    <SimpleTablePage
      title="Service agents"
      desc="Manage the operational team supporting service delivery."
      cols={[
        "Agent ID",
        "Name",
        "Email",
        "Employee code",
        "Department",
        "Status",
      ]}
      rows={a.map((x) => [
        <b className="mono">{x[0]}</b>,
        x[1],
        x[2],
        x[3],
        x[4],
        <Status>{x[5]}</Status>,
      ])}
    />
  );
}

function History() {
  const [history, setHistory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        setError("");

        const [historyData, ordersResponse] = await Promise.all([
          historyService.getAllHistory(),
          orderService.getAllOrders(),
        ]);

        setHistory(Array.isArray(historyData) ? historyData : []);
        setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
      } catch (err) {
        setError(err.message || "Unable to load order history.");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const rows = history.map((item) => {
    const relatedOrder = orders.find(
      (order) => order.orderId === item.orderId
    );

    const updatedAt = item.changedAt
      ? new Date(item.changedAt).toLocaleString("en-IN")
      : "—";

    return [
      <b className="mono">{item.orderId}</b>,
      relatedOrder?.customerName || "—",
      item.oldStatus || "—",
      <Status>{item.newStatus || "Unknown"}</Status>,
      updatedAt,
      item.remarks || "—",
    ];
  });

  if (loading) {
    return <p>Loading order history...</p>;
  }

  if (error) {
    return (
      <>
        <Title
          name="Order history"
          desc="Audit-style timeline of order status changes."
        />
        <p style={{ color: "red" }}>{error}</p>
      </>
    );
  }

  return (
    <SimpleTablePage
      title="Order history"
      desc="Audit-style timeline of order status changes."
      cols={[
        "Order ID",
        "Customer",
        "Previous status",
        "New status",
        "Updated at",
        "Remarks",
      ]}
      rows={rows}
    />
  );
}


function Resources() {
  const [resources, setResources] = useState([]);
  const [s, S] = useState("");
  const [show, M] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [f, F] = useState({
    identifier: "",
    type: "SIM Card",
    description: "",
    location: "",
  });

  async function fetchResources() {
    try {
      setLoading(true);
      setError("");

      const data = await resourceService.getAllResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load network resources.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResources();
  }, []);

  const rows = resources.filter((x) =>
    `${x.resourceId} ${x.resourceIdentifier} ${x.resourceType} ${x.location} ${x.resourceStatus}`
      .toLowerCase()
      .includes(s.toLowerCase())
  );

  async function save(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await resourceService.createResource({
        resourceIdentifier: f.identifier,
        resourceType: f.type,
        description: f.description,
        location: f.location,
      });

      await fetchResources();

      F({
        identifier: "",
        type: "SIM Card",
        description: "",
        location: "",
      });

      M(false);
    } catch (err) {
      setError(err.message || "Unable to create resource.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Title
        name="Network resources"
        desc="Monitor network inventory, capacity and availability."
        action={<Btn onClick={() => M(true)}>Add resource</Btn>}
      />

      <div className="toolbar">
        <Searcher value={s} onChange={S} />
      </div>

      {error && (
        <p style={{ color: "red", margin: "10px 0" }}>{error}</p>
      )}

      <Panel
        title="Resource inventory"
        sub={`${rows.length} records`}
      >
        {loading ? (
          <p>Loading network resources...</p>
        ) : (
          <Table
            cols={[
              "Resource ID",
              "Identifier",
              "Type",
              "Description",
              "Location",
              "Status",
            ]}
            rows={rows.map((x) => [
              <b className="mono">RES-{x.resourceId}</b>,
              x.resourceIdentifier,
              x.resourceType,
              x.description || "—",
              x.location || "—",
              <Status>{x.resourceStatus || "Unknown"}</Status>,
            ])}
          />
        )}
      </Panel>

      {show && (
        <Modal
          title="Add network resource"
          close={() => M(false)}
          save={save}
        >
          <Field label="Identifier">
            <input
              required
              value={f.identifier}
              onChange={(e) =>
                F({ ...f, identifier: e.target.value })
              }
            />
          </Field>

          <Field label="Type">
            <select
              value={f.type}
              onChange={(e) =>
                F({ ...f, type: e.target.value })
              }
            >
              <option>SIM Card</option>
              <option>Fiber Port</option>
              <option>Broadband Port</option>
              <option>Network Capacity</option>
            </select>
          </Field>

          <Field label="Description">
            <input
              value={f.description}
              onChange={(e) =>
                F({ ...f, description: e.target.value })
              }
            />
          </Field>

          <Field label="Location">
            <input
              required
              value={f.location}
              onChange={(e) =>
                F({ ...f, location: e.target.value })
              }
            />
          </Field>

          {saving && <p>Saving resource...</p>}
        </Modal>
      )}
    </>
  );
}

function Provisioning() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  function formatStatus(status) {
    const statusMap = {
      PENDING: "Pending",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      FAILED: "Failed",
    };

    return statusMap[status] || status;
  }

  function mapTask(task) {
    return {
      id: task.taskId,
      taskId: `PRV-${String(task.taskId).padStart(4, "0")}`,
      orderId: `ORD-${task.orderId}`,
      customer: task.customerName || "—",
      resource: task.resourceIdentifier || "Not allocated",
      taskType: task.planName || "Provisioning",
      status: formatStatus(task.taskStatus),
    };
  }

  async function fetchTasks() {
    try {
      setError("");
      const data = await provisioningService.getAllTasks();
      setTasks(data.map(mapTask));
    } catch (err) {
      setError(err.message || "Unable to load provisioning tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function change(task, newStatus) {
    try {
      setActionLoading(task.id);
      setError("");

      if (newStatus === "In Progress") {
        await provisioningService.startTask(task.id);
      } else {
        await provisioningService.completeTask(
          task.id,
          undefined,
          "Provisioning completed"
        );
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message || "Unable to update provisioning task.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <>
      <Title
        name="Provisioning"
        desc="Assign resources and progress service provisioning tasks."
      />

      <div className="workflow-note">
        <Workflow />
        <div>
          <b>Provisioning workflow</b>
          <p>
            Track provisioning tasks and update their progress through the backend.
          </p>
        </div>
        <span>LIVE DATA</span>
      </div>

      {error && (
        <div className="info" role="alert">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <Panel
        title="Provisioning tasks"
        sub={loading ? "Loading records..." : `${tasks.length} records`}
      >
        <Table
          cols={[
            "Task ID",
            "Order",
            "Customer",
            "Resource",
            "Service plan",
            "Status",
            "Action",
          ]}
          rows={
            loading
              ? []
              : tasks.map((t) => [
                  <b className="mono">{t.taskId}</b>,
                  t.orderId,
                  t.customer,
                  t.resource,
                  t.taskType,
                  <Status>{t.status}</Status>,
                  t.status === "Pending" ? (
                    <button
                      className="mini-btn"
                      disabled={actionLoading === t.id}
                      onClick={() => change(t, "In Progress")}
                    >
                      {actionLoading === t.id ? "Updating..." : "Start"}
                    </button>
                  ) : t.status === "In Progress" ? (
                    <button
                      className="mini-btn green-btn"
                      disabled={actionLoading === t.id}
                      onClick={() => change(t, "Completed")}
                    >
                      {actionLoading === t.id ? "Updating..." : "Complete"}
                    </button>
                  ) : (
                    "—"
                  ),
                ])
          }
          empty={loading ? "Loading provisioning tasks..." : "No provisioning tasks found."}
        />
      </Panel>
    </>
  );
}


function Activation() {
  const [activations, setActivations] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [runningId, setRunningId] = useState(null);

  async function fetchActivations() {
    try {
      setError("");

      const [records, testRecords] = await Promise.all([
        activationService.getAllRecords(),
        activationService.getAllTests(),
      ]);

      setActivations(Array.isArray(records) ? records : []);
      setTests(Array.isArray(testRecords) ? testRecords : []);
    } catch (err) {
      setError(err.message || "Unable to load activation records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchActivations();
  }, []);

  async function runTest(activation) {
    try {
      setRunningId(activation.activationId);
      setError("");

      await activationService.runActivationTest(
        activation.activationId
      );

      await fetchActivations();
    } catch (err) {
      setError(err.message || "Unable to run activation test.");
    } finally {
      setRunningId(null);
    }
  }

  function getLatestTest(activationId) {
    return tests
      .filter((test) => test.activationId === activationId)
      .sort(
        (a, b) =>
          new Date(b.testedAt || 0) - new Date(a.testedAt || 0)
      )[0];
  }

  return (
    <>
      <Title
        name="Service activation"
        desc="View activation records and run service validation tests."
      />

      <div className="workflow-note">
        <CheckCircle2 />
        <div>
          <b>Activation & testing</b>
          <p>
            View provisioned service activation records and run
            backend-recorded activation tests.
          </p>
        </div>
        <span>DATABASE CONNECTED</span>
      </div>

      {error && (
        <p style={{ color: "red", margin: "10px 0" }}>{error}</p>
      )}

      <Panel
        title="Activation records"
        sub={`${activations.length} records`}
      >
        {loading ? (
          <p>Loading activation records...</p>
        ) : (
          <Table
            cols={[
              "Activation ID",
              "Order",
              "Customer",
              "Service plan",
              "Resource",
              "Date",
              "Status",
              "Test result",
              "Action",
            ]}
            rows={activations.map((a) => {
              const latestTest = getLatestTest(a.activationId);

              return [
                <b className="mono">ACT-{a.activationId}</b>,
                a.orderId,
                a.customerName || "—",
                a.planName || "—",
                a.resourceIdentifier || "—",
                a.activationDate
                  ? new Date(a.activationDate).toLocaleString("en-IN")
                  : "—",
                <Status>{a.activationStatus || "Unknown"}</Status>,
                <Status>
                  {latestTest?.testResult || "Not tested"}
                </Status>,
                <button
                  className="mini-btn green-btn"
                  disabled={runningId === a.activationId}
                  onClick={() => runTest(a)}
                >
                  {runningId === a.activationId
                    ? "Testing..."
                    : "Run test"}
                </button>,
              ];
            })}
          />
        )}
      </Panel>

      <p className="info">
        <AlertCircle size={15} /> Activation tests are recorded by the
        backend. They validate application records and do not connect
        to a live telecom network.
      </p>
    </>
  );
}

function Settings() {
  const [p, P] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("telecomAdminProfile")) || {
          name: "Admin User",
          email: "admin@telecompro.com",
          phone: "9876543210",
        }
      );
    } catch {
      return {
        name: "Admin User",
        email: "admin@telecompro.com",
        phone: "9876543210",
      };
    }
  });
  const [s, S] = useState(false);
  return (
    <>
      <Title
        name="Settings"
        desc="Manage administrator profile and workspace information."
      />
      <Panel title="Administrator profile" sub="Saved locally in this browser">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            localStorage.setItem("telecomAdminProfile", JSON.stringify(p));
            S(true);
          }}
          className="settings-form"
        >
          <Field label="Full name">
            <input
              value={p.name}
              onChange={(e) => {
                P({ ...p, name: e.target.value });
                S(false);
              }}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={p.email}
              onChange={(e) => {
                P({ ...p, email: e.target.value });
                S(false);
              }}
            />
          </Field>
          <Field label="Phone">
            <input
              value={p.phone}
              onChange={(e) => {
                P({ ...p, phone: e.target.value });
                S(false);
              }}
            />
          </Field>
          <button className="primary-btn">Save settings</button>
          {s && <small className="saved">Settings saved successfully.</small>}
        </form>
      </Panel>
      <div className="info">
        <AlertCircle size={15} /> Light/dark mode is controlled by the sun/moon
        button in the top bar. Preferences are saved in this browser.
      </div>
    </>
  );
}


function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setError("");
  }

  // Customer registration
  async function register(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await api.post("/users/register", {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      });

      setMessage(
        "Registration successful! Please log in using your new account."
      );

      setMode("login");

      setForm({
        fullName: "",
        email: form.email.trim().toLowerCase(),
        password: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });

    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  // Customer/Admin/Agent login
  async function login(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.post("/users/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      // Send authenticated user details to App
      onLogin(response.data);

    } catch (err) {
      setError(err.message || "Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Wifi size={23} />
          </div>

          <div>
            <strong>TelecomPro</strong>
            <span>Service Provisioning & Activation</span>
          </div>
        </div>

        <div className="auth-heading">
          <div className="eyebrow">
            J21 · TELECOM OPERATIONS
          </div>

          <h1>
            {mode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h1>

          <p>
            {mode === "login"
              ? "Sign in to your TelecomPro account."
              : "Register as a customer to get started."}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setError("");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        {message && (
          <div className="auth-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="auth-message error">
            {error}
          </div>
        )}

        {mode === "register" ? (

          <form className="auth-form" onSubmit={register}>

            <div className="auth-form-grid">

              <Field label="Full name">
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={updateField}
                  required
                  maxLength={100}
                  placeholder="Enter your full name"
                />
              </Field>

              <Field label="Email address">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  required
                  maxLength={120}
                  placeholder="you@example.com"
                />
              </Field>

              <Field label="Password">
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateField}
                  required
                  minLength={8}
                  maxLength={72}
                  placeholder="Minimum 8 characters"
                />
              </Field>

              <Field label="Phone number">
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                  required
                  maxLength={15}
                  placeholder="Enter phone number"
                />
              </Field>

              <div className="auth-full">
                <Field label="Address">
                  <input
                    name="address"
                    value={form.address}
                    onChange={updateField}
                    required
                    maxLength={255}
                    placeholder="Enter your address"
                  />
                </Field>
              </div>

              <Field label="City">
                <input
                  name="city"
                  value={form.city}
                  onChange={updateField}
                  required
                  placeholder="Enter city"
                />
              </Field>

              <Field label="State">
                <input
                  name="state"
                  value={form.state}
                  onChange={updateField}
                  required
                  placeholder="Enter state"
                />
              </Field>

              <Field label="PIN code">
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={updateField}
                  required
                  maxLength={10}
                  placeholder="Enter PIN code"
                />
              </Field>

            </div>

            <button
              type="submit"
              className="primary-btn auth-submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create customer account"}
            </button>

            <p className="auth-footnote">
              Public registration creates a CUSTOMER account only.
            </p>

          </form>

        ) : (

          <form className="auth-form" onSubmit={login}>

            <Field label="Email address">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                required
                placeholder="Enter your email"
              />
            </Field>

            <Field label="Password">
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
                required
                placeholder="Enter your password"
              />
            </Field>

            <button
              type="submit"
              className="primary-btn auth-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="auth-footnote">
              Sign in using your registered email and password.
            </p>

          </form>

        )}

      </div>
    </div>
  );
}

function Shell() {
  const [d, update] = useData();
  const [dark, D] = useState(
    () => localStorage.getItem("telecomTheme") === "dark",
  );
  const [open, O] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("telecomTheme", dark ? "dark" : "light");
  }, [dark]);
  return (
    <div className="app">
      <Sidebar open={open} close={() => O(false)} />
      <main className="main">
        <Topbar menu={() => O(true)} dark={dark} toggle={() => D((x) => !x)} />
        <div className="content">
          <Routes>
           <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/agents" element={<ServiceAgents />} />
            <Route path="/plans" element={<ServicePlans />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order-history" element={<History />} />
            <Route
              path="/resources"
              element={<Resources d={d} update={update} />}
            />
            <Route path="/provisioning" element={<Provisioning />} />
            <Route
              path="/activation"
              element={<Activation />}
            />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="*"
              element={
                <Title
                  name="Page not found"
                  desc="The requested page does not exist."
                />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("j21CurrentUser")
      );
    } catch {
      return null;
    }
  });

  function handleLogin(user) {
    sessionStorage.setItem(
      "j21CurrentUser",
      JSON.stringify(user)
    );

    setCurrentUser(user);
  }

  function handleLogout() {
    sessionStorage.removeItem("j21CurrentUser");
    setCurrentUser(null);
  }

  return (
    <BrowserRouter>
      {currentUser ? (
        <Shell />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </BrowserRouter>
  );
}

