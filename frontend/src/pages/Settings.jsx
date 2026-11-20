
import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Settings as SettingsIcon,
  Save,
} from "lucide-react";

export default function Settings() {
  const [profile, setProfile] = useState(() => {
  const saved = localStorage.getItem("telecomAdminProfile");

  return saved
    ? JSON.parse(saved)
    : {
        name: "Admin User",
        email: "admin@telecompro.com",
        phone: "9876543210",
        role: "System Administrator",
      };
});

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    orderNotifications: true,
    activationNotifications: true,
  });

  const [saved, setSaved] = useState(false);

  function handleProfileChange(e) {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    localStorage.setItem("telecomAdminProfile", JSON.stringify(profile));
    localStorage.setItem("telecomPreferences", JSON.stringify(preferences));
    setSaved(true);
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h1>Settings</h1>
          <p>Manage your administrator profile and application preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="customer-table-card settings-card">
          <div className="table-header">
            <div>
              <h3><User size={19} /> Administrator Profile</h3>
              <p>Update your profile information.</p>
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <input value={profile.role} readOnly />
            </div>
          </div>
        </div>

        <div className="customer-table-card settings-card">
          <div className="table-header">
            <div>
              <h3><Bell size={19} /> Notifications</h3>
              <p>Choose which application notifications you want to receive.</p>
            </div>
          </div>

          <div className="settings-options">
            <label className="settings-option">
              <span>
                <strong>Email Notifications</strong>
                <small>Receive general application notifications.</small>
              </span>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => {
                  setPreferences({
                    ...preferences,
                    emailNotifications: e.target.checked,
                  });
                  setSaved(false);
                }}
              />
            </label>

            <label className="settings-option">
              <span>
                <strong>Order Notifications</strong>
                <small>Receive updates about service orders.</small>
              </span>
              <input
                type="checkbox"
                checked={preferences.orderNotifications}
                onChange={(e) => {
                  setPreferences({
                    ...preferences,
                    orderNotifications: e.target.checked,
                  });
                  setSaved(false);
                }}
              />
            </label>

            <label className="settings-option">
              <span>
                <strong>Activation Notifications</strong>
                <small>Receive updates about service activation.</small>
              </span>
              <input
                type="checkbox"
                checked={preferences.activationNotifications}
                onChange={(e) => {
                  setPreferences({
                    ...preferences,
                    activationNotifications: e.target.checked,
                  });
                  setSaved(false);
                }}
              />
            </label>
          </div>
        </div>

        <div className="customer-table-card settings-card">
          <div className="table-header">
            <div>
              <h3><Shield size={19} /> System Information</h3>
              <p>Application configuration details.</p>
            </div>
            <SettingsIcon size={22} />
          </div>

          <div className="system-info-grid">
            <div>
              <span>Application</span>
              <strong>TelecomPro</strong>
            </div>
            <div>
              <span>Project</span>
              <strong>J21 - Telecom Service Provisioning</strong>
            </div>
            <div>
              <span>Frontend</span>
              <strong>React.js + Vite</strong>
            </div>
            <div>
              <span>Backend</span>
              <strong>Spring Boot</strong>
            </div>
            <div>
              <span>Database</span>
              <strong>MySQL</strong>
            </div>
            <div>
              <span>Environment</span>
              <strong>Development</strong>
            </div>
          </div>
        </div>

        <div className="settings-save">
          {saved && <span>Settings saved successfully!</span>}
          <button type="submit" className="add-customer-btn">
            <Save size={17} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
