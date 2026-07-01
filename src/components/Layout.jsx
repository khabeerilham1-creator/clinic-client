import React, { useMemo, useState } from "react";
import { CLINIC_NAME } from "../utils/clinicData";
import { addActivityLog } from "../utils/activityLog";
import { isSoundEnabled, playSectionSound, setSoundEnabled } from "../utils/sound";

const NAV_ITEMS = [
  { page: "dashboard", label: "Dashboard", short: "D", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"] },
  { page: "patients", label: "New Patient Entry", short: "+", section: "Receptionist", roles: ["admin", "receptionist"] },
  { page: "patients-list", label: "Registered Client", short: "R", section: "Receptionist", roles: ["admin", "receptionist"] },
  { page: "appointments", label: "Appointments", short: "A", section: "Receptionist", roles: ["admin", "receptionist"] },
  { page: "lab-follow-up", label: "Lab Cases Follow Up", short: "L", section: "Receptionist", roles: ["receptionist"] },
  { page: "inventory-status", label: "Inventory Status", short: "I", section: "Receptionist", roles: ["receptionist"] },
  { page: "maintenance", label: "Maintenance", short: "M", section: "Receptionist", roles: ["receptionist"] },
  { page: "refurbishing", label: "Refurbishing", short: "RF", section: "Receptionist", roles: ["receptionist"] },
  { page: "daily-expense", label: "Daily Expense", short: "DE", section: "Receptionist", roles: ["receptionist"] },
  { page: "ongoing-patients", label: "On Going Patient", short: "O", section: "Receptionist", roles: ["receptionist"] },
  { page: "completed-patients", label: "Completed Patient", short: "C", section: "Receptionist", roles: ["receptionist"] },
  { page: "official-contact", label: "Official Contact", short: "OC", section: "Receptionist", roles: ["receptionist"] },
  { page: "dentist-patients", label: "Patient List", short: "P", section: "Dentist", roles: ["dentist", "doctor"] },
  { page: "dentist-summary", label: "Summary of Patients", short: "S", section: "Dentist", roles: ["dentist", "doctor"] },
  { page: "dentist-salary", label: "Patient List Salary Based", short: "SB", section: "Dentist", roles: ["dentist", "doctor"] },
  { page: "dentist-percentage", label: "Patient List Percentage Base", short: "%", section: "Dentist", roles: ["dentist", "doctor"] },
  { page: "dentist-referral", label: "Patient List Referral Based", short: "RF", section: "Dentist", roles: ["dentist", "doctor"] },
  { page: "lab-records", label: "Lab Records", short: "L", section: "Clinic", roles: ["admin"] },
  { page: "account-status", label: "Account Status", short: "$", section: "Finance", roles: ["admin"] },
  { page: "dentist-revenue", label: "Dentist Revenue", short: "25", section: "Finance", roles: ["admin"] },
  { page: "account-payable", label: "Account Payable", short: "AP", section: "Finance", roles: ["admin"] },
  { page: "account-receivable", label: "Account Receivables", short: "AR", section: "Finance", roles: ["admin"] },
  { page: "expenses", label: "Expenses", short: "E", section: "Finance", roles: ["admin"] },
  { page: "inventory", label: "Inventory", short: "I", section: "Operations", roles: ["admin"] },
  { page: "logs", label: "Logs", short: "LG", section: "Admin", roles: ["admin"] },
  { page: "notifications", label: "Notifications Alerts", short: "N", section: "Admin", roles: ["admin"] },
];

function Layout({ children, activePage, setActivePage, user, handleLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const profile = useMemo(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    const storedShift = JSON.parse(sessionStorage.getItem("shift") || "null");
    const role = sessionStorage.getItem("role") || storedUser.role || "Administrator";
    const name = user?.name || storedUser.name || storedUser.username || "HDC Admin";
    const dentistName = storedUser.dentistName || "";
    const roleLabel =
      role === "admin"
        ? "Admin"
        : role === "receptionist"
          ? "Receptionist"
          : role === "dentist"
            ? "Dentist"
            : role;

    return {
      name,
      role,
      roleLabel,
      dentistName,
      shiftLabel: storedShift?.label || storedUser.shiftName || "",
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
    addActivityLog("Logout", profile.roleLabel, { shift: profile.shiftLabel });

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("shift");

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
          <span>{profile.shiftLabel || "Live clinic workspace"}</span>
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
            <div className="user-role">
              {[profile.roleLabel, profile.dentistName, profile.shiftLabel].filter(Boolean).join(" | ")}
            </div>
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
