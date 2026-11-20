
import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

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
  Radio,
  Menu,
  X,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
} from "lucide-react";

// Sidebar navigation links
const links = [
  ["Dashboard", "/", LayoutDashboard],
  ["Customers", "/customers", Users],
  ["Service Agents", "/agents", UserCog],
  ["Service Plans", "/plans", Package],
  ["Service Orders", "/orders", ShoppingCart],
  ["Order History", "/order-history", History],
  ["Network Resources", "/resources", Network],
  ["Provisioning", "/provisioning", Workflow],
  ["Activation", "/activation", Activity],
  ["Settings", "/settings", Settings],
];

const pageTitles = Object.fromEntries(
  links.map(([name, path]) => [path, name])
);

// Default administrator profile
const defaultProfile = {
  name: "Admin User",
  email: "admin@telecompro.com",
  phone: "",
};

// Shared administrator profile hook
function useAdminProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("telecomAdminProfile")
      );

      return {
        ...defaultProfile,
        ...(saved || {}),
      };
    } catch {
      return defaultProfile;
    }
  });

  useEffect(() => {
    const refreshProfile = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("telecomAdminProfile")
        );

        setProfile({
          ...defaultProfile,
          ...(saved || {}),
        });
      } catch {
        setProfile(defaultProfile);
      }
    };

    window.addEventListener(
      "telecom-profile-update",
      refreshProfile
    );

    window.addEventListener("storage", refreshProfile);

    return () => {
      window.removeEventListener(
        "telecom-profile-update",
        refreshProfile
      );

      window.removeEventListener("storage", refreshProfile);
    };
  }, []);

  return profile;
}

// Sidebar component
export function Sidebar({ open, close }) {
  const profile = useAdminProfile();
  const adminName = profile.name || "Admin User";

  return (
    <>
      <div
        className={`scrim ${open ? "show" : ""}`}
        onClick={close}
      />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <Radio />
          </div>

          <div>
            <b>
              Telecom<span>Pro</span>
            </b>
            <small>Service Management</small>
          </div>

          <button
            className="mobile-close"
            onClick={close}
            aria-label="Close sidebar"
            type="button"
          >
            <X />
          </button>
        </div>

        {/* Navigation */}
        <div className="nav-label">WORKSPACE</div>

        <nav>
          {links.map(([name, path, Icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={close}
              className={({ isActive }) =>
                `nav-item ${isActive ? "selected" : ""}`
              }
            >
              <Icon size={18} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom administrator profile */}
        <NavLink
          to="/settings"
          onClick={close}
          className="sidebar-user"
          title="Open administrator profile"
        >
          <div className="avatar">
            {adminName.slice(0, 2).toUpperCase()}
          </div>

          <div className="sidebar-user-info">
            <b>{adminName}</b>
            <small>System Admin</small>
          </div>

          <ChevronDown size={16} />
        </NavLink>
      </aside>
    </>
  );
}

// Top navigation component
export function Topbar({ menu, dark, toggle }) {
  const location = useLocation();
  const navigate = useNavigate();

  const profile = useAdminProfile();
  const adminName = profile.name || "Admin User";

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Default notifications
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("telecomNotifications");

      if (saved) {
        return JSON.parse(saved);
      }

      return [
        {
          id: 1,
          title: "New service order",
          message:
            "A new customer service order has been received.",
          time: "Just now",
          read: false,
        },
        {
          id: 2,
          title: "Provisioning update",
          message:
            "A provisioning task is waiting for processing.",
          time: "10 minutes ago",
          read: false,
        },
        {
          id: 3,
          title: "Activation completed",
          message:
            "A service activation was completed successfully.",
          time: "1 hour ago",
          read: true,
        },
      ];
    } catch {
      return [];
    }
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // Close dropdowns after changing pages
  useEffect(() => {
    setShowProfile(false);
    setShowNotifications(false);
  }, [location.pathname]);

  // Save notification changes
  function saveNotifications(updated) {
    setNotifications(updated);

    localStorage.setItem(
      "telecomNotifications",
      JSON.stringify(updated)
    );
  }

  // Mark all notifications as read
  function markAllRead() {
    saveNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  // Mark one notification as read
  function markRead(id) {
    saveNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }

  // Navigate to settings/profile
  function openSettings() {
    setShowProfile(false);
    navigate("/settings");
  }

  return (
    <header className="topbar">
      <div className="top-left">
        <button
          className="icon-btn menu-btn"
          onClick={menu}
          aria-label="Open menu"
          type="button"
        >
          <Menu />
        </button>

        <span className="muted">Workspace</span>
        <span className="slash">/</span>
        <b>{pageTitles[location.pathname] || "Page"}</b>
      </div>

      <div className="top-right">
        {/* Search */}
        <label className="top-search">
          <Search size={16} />
          <input placeholder="Search workspace..." />
        </label>

        {/* Theme toggle */}
        <button
          className="icon-btn"
          title="Toggle theme"
          aria-label="Toggle theme"
          onClick={toggle}
          type="button"
        >
          {dark ? <Sun /> : <Moon />}
        </button>

        {/* Notifications */}
        <div
          className="notification-wrapper"
          ref={notificationRef}
        >
          <button
            className="icon-btn bell"
            title="Notifications"
            aria-label="Open notifications"
            type="button"
            onClick={() => {
              setShowNotifications((value) => !value);
              setShowProfile(false);
            }}
          >
            <Bell />

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-panel">
              <div className="notification-header">
                <div>
                  <strong>Notifications</strong>
                  <small>{unreadCount} unread</small>
                </div>

                <button
                  className="icon-btn"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close notifications"
                  type="button"
                >
                  <X size={17} />
                </button>
              </div>

              <button
                className="mark-read-button"
                onClick={markAllRead}
                disabled={unreadCount === 0}
                type="button"
              >
                Mark all as read
              </button>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <p className="notification-empty">
                    No notifications.
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      className={`notification-item ${
                        notification.read ? "read" : "unread"
                      }`}
                      onClick={() =>
                        markRead(notification.id)
                      }
                      type="button"
                    >
                      <span className="notification-indicator" />

                      <span className="notification-content">
                        <strong>{notification.title}</strong>
                        <span>{notification.message}</span>
                        <small>{notification.time}</small>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Administrator profile */}
        <div
          className="profile-wrapper"
          ref={profileRef}
        >
          <button
            className="top-profile"
            type="button"
            aria-label="Open administrator profile menu"
            aria-expanded={showProfile}
            onClick={() => {
              setShowProfile((value) => !value);
              setShowNotifications(false);
            }}
          >
            <div className="avatar">
              {adminName.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <b>{adminName}</b>
              <small>Administrator</small>
            </div>

            <ChevronDown size={16} />
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <button
                type="button"
                onClick={openSettings}
              >
                <User size={16} />
                My Profile
              </button>

              <button
                type="button"
                onClick={openSettings}
              >
                <Settings size={16} />
                Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
