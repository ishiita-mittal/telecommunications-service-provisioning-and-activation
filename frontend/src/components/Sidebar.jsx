
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  ShoppingCart,
  History,
  Network,
  Workflow,
  Activity,
  Settings,
  Phone,
  X
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Service Agents", path: "/agents", icon: UserCog },
  { name: "Service Plans", path: "/plans", icon: Package },
  { name: "Service Orders", path: "/orders", icon: ShoppingCart },
  { name: "Order History", path: "/order-history", icon: History },
  { name: "Network Resources", path: "/resources", icon: Network },
  { name: "Provisioning", path: "/provisioning", icon: Workflow },
  { name: "Activation", path: "/activation", icon: Activity },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Phone size={22} />
          </div>
          <div>
            <h2>TelecomPro</h2>
            <span>Service Management</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p className="sidebar-label">MAIN MENU</p>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                onClick={onClose}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">AD</div>
          <div>
            <strong>Administrator</strong>
            <span>System Admin</span>
          </div>
        </div>
      </aside>
    </>
  );
}
