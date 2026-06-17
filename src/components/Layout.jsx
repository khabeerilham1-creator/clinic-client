import React, { useMemo, useState } from "react";
import { CLINIC_NAME } from "../utils/clinicData";
import { isSoundEnabled, playSectionSound, setSoundEnabled } from "../utils/sound";

const NAV_ITEMS = [
  { page: "dashboard", label: "Dashboard", short: "D", section: "Clinic", roles: ["admin"] },
  { page: "patients", label: "Patient Entry", short: "+", section: "Clinic", roles: ["admin", "doctor", "receptionist"] },
  { page: "patients-list", label: "Patient Records", short: "R", section: "Clinic", roles: ["admin"] },
  { page: "appointments", label: "Appointments", short: "A", section: "Clinic", roles: ["admin", "doctor", "receptionist"] },
  { page: "account-status", label: "Account Status", short: "$", section: "Finance", roles: ["admin"] },
];

function Layout({ children, activePage, setActivePage, user, handleLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const profile = useMemo(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    const role = sessionStorage.getItem("role") || storedUser.role || "Administrator";
    const name = user?.name || storedUser.name || storedUser.username || "HDC Admin";

    return {
      name,
      role,
      initials: name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };
  }, [user]);

  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(profile.role));
  const pageTitle = visibleNavItems.find((item) => item.page === activePage)?.label || "Clinic";

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user");

    if (handleLogout) {
      handleLogout();
    } else {
      window.location.reload();
    }
  };

  const goToPage = (page) => {
    playSectionSound("section");
    setActivePage(page);
    setMobileOpen(false);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) {
      playSectionSound("success");
    }
  };

  let lastSection = "";

  return (
    <div className="app-shell">
      <button
        className="mobile-menu-button no-print"
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        aria-label="Open navigation"
      >
        <span />
        <span />
        <span />
      </button>

      {mobileOpen && (
        <button
          className="sidebar-scrim no-print"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar no-print${mobileOpen ? " open" : ""}`}>
        <div className="brand-block">
          <div className="brand-mark">H</div>
          <div>
            <div className="brand-name">{CLINIC_NAME}</div>
            <div className="brand-meta">Dr Zaffar Iqbal</div>
          </div>
        </div>

        <div className="sidebar-status">
          <span className="status-dot" />
          <span>Live clinic workspace</span>
        </div>

        <nav className="nav-stack" aria-label="Main navigation">
          {visibleNavItems.map((item) => {
            const showSection = item.section !== lastSection;
            lastSection = item.section;

            return (
              <React.Fragment key={item.page}>
                {showSection && <div className="nav-section">{item.section}</div>}
                <button
                  type="button"
                  className={`nav-item${activePage === item.page ? " active" : ""}`}
                  onClick={() => goToPage(item.page)}
                >
                  <span className="nav-icon">{item.short}</span>
                  <span>{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="sidebar-upgrade">
          <div className="upgrade-title">{CLINIC_NAME}</div>
          <div className="upgrade-copy">
            Patient care, appointments, finance and treatment records in one place.
          </div>
          <button className="sound-toggle" type="button" onClick={toggleSound}>
            Section sound: {soundOn ? "On" : "Off"}
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{profile.initials || "AD"}</div>
          <div className="user-details">
            <div className="user-name">{profile.name}</div>
            <div className="user-role">{profile.role}</div>
          </div>
          <button className="logout-button" type="button" onClick={logout} aria-label="Logout">
            Out
          </button>
        </div>
      </aside>

      <main className="main-wrapper">
        <div className="mobile-title no-print">{pageTitle}</div>
        {children}
      </main>
    </div>
  );
}

export default Layout;
