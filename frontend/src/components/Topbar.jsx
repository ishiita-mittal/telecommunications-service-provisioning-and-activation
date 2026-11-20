
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  CheckCheck,
  Settings,
  User,
  X,
} from "lucide-react";

const initialNotifications = [
  {
    id: 1,
    title: "New service order",
    message: "A new customer service order has been received.",
    time: "Just now",
    read: false,
  },
  {
    id: 2,
    title: "Provisioning update",
    message: "A provisioning task is waiting for processing.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 3,
    title: "Activation completed",
    message: "A service activation was successfully completed.",
    time: "1 hour ago",
    read: true,
  },
];

export default function Topbar({ menu, dark, toggle, onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("telecomNotifications")) ||
        initialNotifications
      );
    } catch {
      return initialNotifications;
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  function updateNotifications(updated) {
    setNotifications(updated);
    localStorage.setItem("telecomNotifications", JSON.stringify(updated));
  }

  function markAllRead() {
    updateNotifications(notifications.map((n) => ({ ...n, read: true })));
  }

  function markRead(id) {
    updateNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  }

  const profile = (() => {
    try {
      return JSON.parse(localStorage.getItem("telecomAdminProfile")) || {};
    } catch {
      return {};
    }
  })();

  const adminName = profile.name || "Admin User";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-button"
          onClick={menu || onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="topbar-search">
          <Search size={18} />
          <input type="text" placeholder="Search anything..." />
        </div>
      </div>

      <div className="topbar-right">
        <div className="notification-wrapper">
          <button
            className="notification-button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-panel">
              <div className="notification-header">
                <div>
                  <strong>Notifications</strong>
                  <span>{unreadCount} unread messages</span>
                </div>
                <button
                  className="notification-close"
                  onClick={() => setShowNotifications(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <button
                className="mark-read-button"
                onClick={markAllRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck size={15} />
                Mark all as read
              </button>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <p className="notification-empty">You're all caught up!</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      className={`notification-item ${n.read ? "read" : "unread"}`}
                      onClick={() => markRead(n.id)}
                    >
                      <span className="notification-indicator" />
                      <span className="notification-content">
                        <strong>{n.title}</strong>
                        <span>{n.message}</span>
                        <small>{n.time}</small>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-wrapper">
          <button
            className="topbar-profile"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
          >
            <div className="profile-avatar">
              {adminName.slice(0, 2).toUpperCase()}
            </div>
            <div className="profile-info">
              <strong>{adminName}</strong>
              <span>Administrator</span>
            </div>
            <ChevronDown size={17} />
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <Link
                to="/settings"
                onClick={() => setShowProfile(false)}
              >
                <User size={16} />
                My Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setShowProfile(false)}
              >
                <Settings size={16} />
                Settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
