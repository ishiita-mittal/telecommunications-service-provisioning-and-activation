
import { useState } from "react";
import { Search, History } from "lucide-react";

const initialHistory = [
  {
    id: 1,
    orderId: "ORD-1001",
    customer: "Rahul Sharma",
    previousStatus: "Pending",
    newStatus: "In Progress",
    updatedDate: "2026-11-10 10:30 AM",
    remarks: "Order validation started",
  },
  {
    id: 2,
    orderId: "ORD-1001",
    customer: "Rahul Sharma",
    previousStatus: "In Progress",
    newStatus: "Completed",
    updatedDate: "2026-11-10 02:45 PM",
    remarks: "Service successfully activated",
  },
  {
    id: 3,
    orderId: "ORD-1002",
    customer: "Priya Verma",
    previousStatus: "Pending",
    newStatus: "In Progress",
    updatedDate: "2026-11-11 11:15 AM",
    remarks: "Provisioning process started",
  },
  {
    id: 4,
    orderId: "ORD-1003",
    customer: "Amit Kumar",
    previousStatus: "Pending",
    newStatus: "Pending",
    updatedDate: "2026-11-12 09:00 AM",
    remarks: "Order received and awaiting validation",
  },
  {
    id: 5,
    orderId: "ORD-1004",
    customer: "Neha Singh",
    previousStatus: "In Progress",
    newStatus: "Completed",
    updatedDate: "2026-11-13 04:20 PM",
    remarks: "Activation and testing completed",
  },
  {
    id: 6,
    orderId: "ORD-1005",
    customer: "Rohan Gupta",
    previousStatus: "In Progress",
    newStatus: "Failed",
    updatedDate: "2026-11-14 01:30 PM",
    remarks: "Resource allocation failed",
  },
];

export default function OrderHistory() {
  const [history] = useState(initialHistory);
  const [search, setSearch] = useState("");

  const filteredHistory = history.filter((item) =>
    `${item.orderId} ${item.customer} ${item.previousStatus} ${item.newStatus} ${item.remarks}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
          <h1>Order History</h1>
          <p>Track order status changes and activities.</p>
        </div>
      </div>

      <div className="customer-toolbar">
        <div className="customer-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by order ID, customer or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="customer-table-card">
        <div className="table-header">
          <div>
            <h3>Order Status History</h3>
            <p>{filteredHistory.length} history records found</p>
          </div>
          <History size={22} />
        </div>

        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Previous Status</th>
                <th>New Status</th>
                <th>Updated Date</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.orderId}</strong></td>
                    <td>{item.customer}</td>
                    <td>
                      <span className={`status ${getStatusClass(item.previousStatus)}`}>
                        {item.previousStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${getStatusClass(item.newStatus)}`}>
                        {item.newStatus}
                      </span>
                    </td>
                    <td>{item.updatedDate}</td>
                    <td>{item.remarks}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No history records found.
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
