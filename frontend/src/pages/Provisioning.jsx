
import { useState, useEffect } from "react";
import { Search, Workflow, Play } from "lucide-react";
import provisioningService from "../services/provisioningService";

export default function Provisioning() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Convert backend task status into the labels used by the UI
  function formatStatus(status) {
    const statusMap = {
      PENDING: "Pending",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      FAILED: "Failed",
    };

    return statusMap[status] || status;
  }

  // Convert backend response into the existing table structure
  function mapTask(task) {
    return {
      id: task.taskId,
      taskId: `PRV-${task.taskId}`,
      orderId: `ORD-${task.orderId}`,
      customer: task.customerName || "—",
      resource: task.resourceIdentifier || "Not allocated",
      taskType: task.planName || "Provisioning",
      status: formatStatus(task.taskStatus),
      createdDate: task.createdAt
        ? task.createdAt.slice(0, 10)
        : "—",
    };
  }

  // Fetch actual tasks from Spring Boot
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

  const filteredTasks = tasks.filter((task) =>
    `${task.taskId} ${task.orderId} ${task.customer} ${task.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Start or complete a task through the backend
  async function updateTaskStatus(task, newStatus) {
    try {
      setActionLoading(task.id);
      setError("");

      if (newStatus === "In Progress") {
        await provisioningService.startTask(task.id);
      } else if (newStatus === "Completed") {
        await provisioningService.completeTask(
          task.id,
          undefined,
          "Provisioning completed"
        );
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message || "Unable to update task status.");
    } finally {
      setActionLoading(null);
    }
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
          <h1>Provisioning</h1>
          <p>Manage service provisioning tasks and resource assignments.</p>
        </div>
      </div>

      <div className="customer-toolbar">
        <div className="customer-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search provisioning tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="customer-table-card">
        <div className="table-header">
          <div>
            <h3>Provisioning Tasks</h3>
            <p>{filteredTasks.length} tasks found</p>
          </div>
          <Workflow size={22} />
        </div>

        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Resource</th>
                <th>Service Plan</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    Loading provisioning tasks...
                  </td>
                </tr>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td><strong>{task.taskId}</strong></td>
                    <td>{task.orderId}</td>
                    <td>{task.customer}</td>
                    <td>{task.resource}</td>
                    <td>{task.taskType}</td>
                    <td>{task.createdDate}</td>
                    <td>
                      <span className={`status ${getStatusClass(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      {task.status !== "Completed" &&
                        task.status !== "Failed" && (
                          <button
                            type="button"
                            className="add-customer-btn"
                            disabled={actionLoading === task.id}
                            onClick={() =>
                              updateTaskStatus(
                                task,
                                task.status === "Pending"
                                  ? "In Progress"
                                  : "Completed"
                              )
                            }
                          >
                            <Play size={14} />
                            {actionLoading === task.id
                              ? "Updating..."
                              : task.status === "Pending"
                                ? "Start"
                                : "Complete"}
                          </button>
                        )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No provisioning tasks found.
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
