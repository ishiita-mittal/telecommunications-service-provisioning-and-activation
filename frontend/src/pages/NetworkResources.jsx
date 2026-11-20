
import { useState, useEffect } from "react";
import { Search, Plus, Network, X } from "lucide-react";

const initialResources = [
  {
    id: 1,
    identifier: "SIM-1001",
    type: "SIM Card",
    capacity: "1 User",
    location: "Delhi",
    status: "Available",
  },
  {
    id: 2,
    identifier: "SIM-1002",
    type: "SIM Card",
    capacity: "1 User",
    location: "Noida",
    status: "Allocated",
  },
  {
    id: 3,
    identifier: "FIB-2001",
    type: "Fiber Port",
    capacity: "1 Gbps",
    location: "Ghaziabad",
    status: "Available",
  },
  {
    id: 4,
    identifier: "BB-3001",
    type: "Broadband Port",
    capacity: "500 Mbps",
    location: "Delhi",
    status: "Allocated",
  },
  {
    id: 5,
    identifier: "NET-4001",
    type: "Network Capacity",
    capacity: "10 Gbps",
    location: "Noida",
    status: "Maintenance",
  },
];

const emptyForm = {
  identifier: "",
  type: "SIM Card",
  capacity: "",
  location: "",
};

export default function NetworkResources() {
  const [resources, setResources] = useState(() => {
    try {
      const saved = localStorage.getItem("telecomResources");
      return saved ? JSON.parse(saved) : initialResources;
    } catch {
      return initialResources;
    }
  });

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem("telecomResources", JSON.stringify(resources));
  }, [resources]);

  const filteredResources = resources.filter((resource) =>
    `${resource.identifier} ${resource.type} ${resource.location} ${resource.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function handleSubmit(e) {
    e.preventDefault();

    const highestId = resources.reduce(
      (max, resource) => Math.max(max, Number(resource.id)),
      0
    );

    const newResource = {
      id: highestId + 1,
      ...formData,
      status: "Available",
    };

    setResources((previous) => [...previous, newResource]);
    setFormData(emptyForm);
    setShowForm(false);
  }

  function getStatusClass(status) {
    if (status === "Available") return "completed";
    if (status === "Allocated") return "progress";
    return "pending";
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h1>Network Resources</h1>
          <p>Manage network resources and monitor their availability.</p>
        </div>
      </div>

      <div className="customer-toolbar">
        <div className="customer-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="add-customer-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close Form" : "Add Resource"}
        </button>
      </div>

      {showForm && (
        <form className="customer-form" onSubmit={handleSubmit}>
          <div className="customer-form-section">
            <h3>Network Resource Information</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Resource Identifier</label>
                <input
                  required
                  value={formData.identifier}
                  onChange={(e) =>
                    setFormData({ ...formData, identifier: e.target.value })
                  }
                  placeholder="e.g. SIM-1006"
                />
              </div>

              <div className="form-group">
                <label>Resource Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option>SIM Card</option>
                  <option>Fiber Port</option>
                  <option>Broadband Port</option>
                  <option>Network Capacity</option>
                </select>
              </div>

              <div className="form-group">
                <label>Capacity</label>
                <input
                  required
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  placeholder="e.g. 1 Gbps"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Enter location"
                />
              </div>
            </div>
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
            <button type="submit" className="add-customer-btn">
              Add Resource
            </button>
          </div>
        </form>
      )}

      <div className="customer-table-card">
        <div className="table-header">
          <div>
            <h3>All Network Resources</h3>
            <p>{filteredResources.length} resources found</p>
          </div>
          <Network size={22} />
        </div>

        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Resource ID</th>
                <th>Identifier</th>
                <th>Resource Type</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <tr key={resource.id}>
                    <td><strong>RES-{resource.id}</strong></td>
                    <td>{resource.identifier}</td>
                    <td>{resource.type}</td>
                    <td>{resource.capacity}</td>
                    <td>{resource.location}</td>
                    <td>
                      <span className={`status ${getStatusClass(resource.status)}`}>
                        {resource.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No resources found.
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
