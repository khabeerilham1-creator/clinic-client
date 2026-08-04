import React, { useMemo, useState } from "react";
import { addActivityLog } from "../utils/activityLog";
import { isSoundEnabled, playSectionSound, setSoundEnabled } from "../utils/sound";

const NAV_ITEMS = [
  { page: "dashboard", label: "Dashboard", short: "D", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"], hidden: true },
  { page: "entry-sheet", label: "Entry Sheet", short: "ES", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"], hidden: true },
  { page: "patients", label: "New Case", short: "+", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"], hidden: true },
  { page: "patients-list", label: "Registered Cases", short: "R", section: "Receptionist", roles: ["admin", "receptionist"], hidden: true },
  { page: "appointments", label: "Appointments", short: "A", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"], hidden: true },
  { page: "acknowledgement-sheet", label: "Acknowledgement Sheet", short: "AK", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"] },
  { page: "price-sheet", label: "Price Sheet", short: "PS", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"] },
  { page: "medications", label: "Medications", short: "RX", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"] },
  { page: "installment-mode", label: "Installment Mode", short: "IM", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"] },
  { page: "messenger", label: "Messenger", short: "MS", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"] },
  { page: "lab-follow-up", label: "Lab Cases Follow Up", short: "L", section: "Receptionist", roles: ["admin", "receptionist"] },
  { page: "dental-material", label: "Dental Material", short: "DM", section: "Receptionist", roles: ["receptionist"], hidden: true },
  { page: "inventory-status", label: "Inventory Status", short: "I", section: "Receptionist", roles: ["receptionist"] },
  { page: "maintenance", label: "Maintenance", short: "M", section: "Receptionist", roles: ["receptionist"] },
  { page: "refurbishing", label: "Refurbishing", short: "RF", section: "Receptionist", roles: ["receptionist"] },
  { page: "daily-expense", label: "Daily Expense", short: "DE", section: "Receptionist", roles: ["receptionist"], hidden: true },
  { page: "ongoing-patients", label: "On Going Cases", short: "O", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"], hidden: true },
  { page: "completed-patients", label: "Completed Cases", short: "C", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"], hidden: true },
  { page: "expected-cases", label: "Expected Cases", short: "EX", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"], hidden: true },
  { page: "to-be-appointed", label: "To Be Appointment", short: "TB", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"], hidden: true },
  { page: "follow-up", label: "Follow Up", short: "FU", section: "Clinic", roles: ["admin", "receptionist", "dentist", "doctor"], hidden: true },
  { page: "official-contact", label: "Official Contact", short: "OC", section: "Receptionist", roles: ["receptionist"] },
  { page: "dentist-patients", label: "Case List", short: "CL", section: "Dentist", roles: ["dentist", "doctor"] },
  { page: "dentist-summary", label: "Summary of Cases", short: "S", section: "Dentist", roles: ["dentist", "doctor"] },
  { page: "dentist-salary", label: "Case List Salary Based", short: "SB", section: "Dentist", roles: ["dentist", "doctor"], hidden: true },
  { page: "dentist-percentage", label: "Percentage Cases", short: "%", section: "Dentist", roles: ["dentist", "doctor"] },
  { page: "dentist-referral", label: "Referral Cases", short: "RF", section: "Dentist", roles: ["dentist", "doctor"], hidden: true },
  { page: "lab-records", label: "Dental Lab", short: "DL", section: "Clinic", roles: ["admin", "receptionist"], hidden: true },
  { page: "account-status", label: "Account Status", short: "$", section: "Finance", roles: ["admin"] },
  { page: "dentist-revenue", label: "Dentist Revenue", short: "25", section: "Finance", roles: ["admin"] },
  { page: "account-payable", label: "Account Payable", short: "AP", section: "Finance", roles: ["admin"] },
  { page: "account-receivable", label: "Account Receivables", short: "AR", section: "Finance", roles: ["admin", "receptionist"] },
  { page: "expenses", label: "Expenses", short: "E", section: "Finance", roles: ["admin", "receptionist"] },
  { page: "referral-cases", label: "Referral Cases", short: "RF", section: "Finance", roles: ["admin", "receptionist"] },
  { page: "inventory", label: "Inventory", short: "I", section: "Operations", roles: ["admin"] },
  { page: "logs", label: "Logs", short: "LG", section: "Admin", roles: ["admin"] },
  { page: "notifications", label: "Notifications Alerts", short: "N", section: "Admin", roles: ["admin", "receptionist", "dentist", "doctor"] },
];

function Layout({ children, activePage, setActivePage, user, handleLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const profile = useMemo(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    const storedShift = JSON.parse(sessionStorage.getItem("shift") || "null");
    const role = sessionStorage.getItem("role") || storedUser.role || "Administrator";
    const name = user?.name || storedUser.name || "Staff";
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

  const showSidebar = activePage === "dashboard";
  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(profile.role) && !item.hidden);
  const pageTitle = NAV_ITEMS.find((item) => item.page === activePage)?.label || "Clinic";

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

  const goBackToDashboard = () => {
    playSectionSound("section");
    setActivePage("dashboard");
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
      {showSidebar && (
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
      )}

      {showSidebar && mobileOpen && (
        <button
          className="sidebar-scrim no-print"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {showSidebar && (
      <aside className={`sidebar no-print${mobileOpen ? " open" : ""}`}>
        <div className="brand-block">
          <div>
            <div className="brand-name">HDC</div>
            <div className="brand-system">Dental Intelligence System</div>
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

        <div className="sidebar-footer">
          <button className="sound-toggle" type="button" onClick={toggleSound}>
            Section sound: {soundOn ? "On" : "Off"}
          </button>

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
        </div>
      </aside>
      )}

      <main className={`main-wrapper${showSidebar ? "" : " full-width"}`}>
        {showSidebar && <div className="mobile-title no-print">{pageTitle}</div>}
        {!showSidebar && (
          <div className="module-backbar no-print">
            <button className="btn btn-ghost" type="button" onClick={goBackToDashboard}>
              Back to Dashboard
            </button>
            <strong>{pageTitle}</strong>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

export default Layout;
