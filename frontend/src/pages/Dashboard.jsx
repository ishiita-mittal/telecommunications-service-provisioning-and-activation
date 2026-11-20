
import {
  Users,
  ShoppingCart,
  Package,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const stats = [
  {
    title: "Total Customers",
    value: "1,250",
    change: "+12.5%",
    icon: Users,
    color: "blue"
  },
  {
    title: "Total Orders",
    value: "486",
    change: "+8.2%",
    icon: ShoppingCart,
    color: "purple"
  },
  {
    title: "Active Plans",
    value: "24",
    change: "+4.3%",
    icon: Package,
    color: "green"
  },
  {
    title: "Activated Services",
    value: "392",
    change: "+10.8%",
    icon: Activity,
    color: "orange"
  }
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
        <span className="dashboard-date">System Overview</span>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.title}>
              <div className={`stat-icon ${stat.color}`}>
                <Icon size={23} />
              </div>

              <p>{stat.title}</p>
              <h2>{stat.value}</h2>

              <span className="stat-change">
                <TrendingUp size={15} />
                {stat.change} from last month
              </span>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h3>Recent Service Orders</h3>
          <p className="panel-subtitle">Latest customer orders</p>

          <div className="order-list">
            <div className="order-row">
              <div>
                <strong>#ORD-1001</strong>
                <span>Rajesh Kumar</span>
              </div>
              <span className="status-badge pending">
                Pending
              </span>
            </div>

            <div className="order-row">
              <div>
                <strong>#ORD-1002</strong>
                <span>Priya Sharma</span>
              </div>
              <span className="status-badge completed">
                Completed
              </span>
            </div>

            <div className="order-row">
              <div>
                <strong>#ORD-1003</strong>
                <span>Amit Verma</span>
              </div>
              <span className="status-badge processing">
                Processing
              </span>
            </div>

            <div className="order-row">
              <div>
                <strong>#ORD-1004</strong>
                <span>Neha Singh</span>
              </div>
              <span className="status-badge completed">
                Completed
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <h3>Provisioning Status</h3>
          <p className="panel-subtitle">Current task overview</p>

          <div className="activity-item">
            <CheckCircle className="activity-success" />
            <div>
              <strong>Completed</strong>
              <span>35 tasks</span>
            </div>
          </div>

          <div className="activity-item">
            <Clock className="activity-warning" />
            <div>
              <strong>In Progress</strong>
              <span>12 tasks</span>
            </div>
          </div>

          <div className="activity-item">
            <AlertCircle className="activity-danger" />
            <div>
              <strong>Pending</strong>
              <span>8 tasks</span>
            </div>
          </div>
        </div>
      </div>

      <p className="demo-notice">
        Demonstration data – will be connected to the backend database later.
      </p>
    </div>
  );
}
