import React from "react";

function Layout({
  children,
  activePage,
  setActivePage,
}) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-[#f4f7fb] overflow-hidden">

      {/* SIDEBAR */}
      <div className="w-[280px] bg-gradient-to-b from-[#02152d] to-[#01214d] text-white flex flex-col justify-between shadow-2xl">

        {/* TOP */}
        <div>

          {/* LOGO */}
          <div className="h-[90px] border-b border-white/10 flex items-center px-7">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-3xl">
                🦷
              </div>

              <h1 className="text-[34px] font-bold">
                HDC Dental
              </h1>
            </div>
          </div>

          {/* MENU */}
          <div className="px-4 py-6 space-y-2">

            {/* DASHBOARD */}
            <button
              onClick={() => setActivePage("dashboard")}
              className={`
                w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 transition-all
                ${
                  activePage === "dashboard"
                    ? "bg-[#176bff] shadow-xl"
                    : "hover:bg-white/10"
                }
              `}
            >
              <span className="text-[24px]">🏠</span>
              <span className="text-[18px] font-medium">
                Dashboard
              </span>
            </button>

            {/* PATIENT ENTRY */}
            <button
              onClick={() => setActivePage("patients")}
              className={`
                w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 transition-all
                ${
                  activePage === "patients"
                    ? "bg-[#176bff] shadow-xl"
                    : "hover:bg-white/10"
                }
              `}
            >
              <span className="text-[24px]">👨‍⚕️</span>
              <span className="text-[18px] font-medium">
                Patient Entry
              </span>
            </button>

            {/* APPOINTMENTS */}
            <button
              onClick={() => setActivePage("appointments")}
              className={`
                w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 transition-all
                ${
                  activePage === "appointments"
                    ? "bg-[#176bff] shadow-xl"
                    : "hover:bg-white/10"
                }
              `}
            >
              <span className="text-[24px]">📅</span>
              <span className="text-[18px] font-medium">
                Appointments
              </span>
            </button>

            {/* PATIENTS RECORDS */}
            <button
              onClick={() => setActivePage("patients-list")}
              className={`
                w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 transition-all
                ${
                  activePage === "patients-list"
                    ? "bg-[#176bff] shadow-xl"
                    : "hover:bg-white/10"
                }
              `}
            >
              <span className="text-[24px]">👥</span>
              <span className="text-[18px] font-medium">
                Patients Records
              </span>
            </button>

            {/* ACCOUNT STATUS */}
            <button
              onClick={() => setActivePage("account-status")}
              className={`
                w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 transition-all
                ${
                  activePage === "account-status"
                    ? "bg-[#176bff] shadow-xl"
                    : "hover:bg-white/10"
                }
              `}
            >
              <span className="text-[24px]">💰</span>
              <span className="text-[18px] font-medium">
                Account Status
              </span>
            </button>

          </div>
        </div>

        {/* BOTTOM */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-5">

            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-xl font-bold">
                A
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  Admin
                </h3>

                <p className="text-white/60 text-sm">
                  HDC Clinic
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="
                w-full
                bg-red-500
                hover:bg-red-600
                py-3
                rounded-xl
                font-semibold
              "
            >
              Logout
            </button>

          </div>
        </div>

      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}
        <div className="h-[90px] bg-white border-b border-gray-200 px-10 flex items-center justify-between">

          <div className="flex items-center gap-8">

            <button className="text-[30px] text-gray-700">
              ☰
            </button>

            <h2 className="text-[34px] font-bold text-gray-800">
              {
                activePage === "dashboard"
                  ? "Dashboard"
                  : activePage === "patients"
                  ? "Patient Entry"
                  : activePage === "appointments"
                  ? "Appointments"
                  : activePage === "patients-list"
                  ? "Patients Records"
                  : activePage === "account-status"
                  ? "Account Status"
                  : ""
              }
            </h2>

          </div>

        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>

      </div>

    </div>
  );
}

export default Layout;