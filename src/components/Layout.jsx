import React from "react";

function Layout({ children }) {

  return (
    <div className="flex h-screen bg-[#f4f7fb] overflow-hidden">

      {/* SIDEBAR */}
      <div className="w-[280px] bg-gradient-to-b from-[#02152d] to-[#01214d] text-white flex flex-col justify-between shadow-2xl">

        {/* TOP */}
        <div>

          {/* LOGO */}
          <div className="h-[90px] border-b border-white/10 flex items-center px-7">

            <div className="flex items-center gap-4">

              {/* ICON */}
              <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-3xl">

                🦷

              </div>

              {/* TITLE */}
              <div>

                <h1 className="text-[34px] font-bold tracking-tight leading-none">
                  HDC Dental
                </h1>

              </div>

            </div>

          </div>

          {/* NAVIGATION */}
          <div className="px-4 py-6 space-y-2">

            {/* ITEM */}
            <button className="w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 hover:bg-white/10 transition-all">

              <span className="text-[24px]">
                🏠
              </span>

              <span className="text-[18px] font-medium">
                Dashboard
              </span>

            </button>

            {/* ACTIVE */}
            <button className="w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 bg-[#176bff] shadow-xl">

              <span className="text-[24px]">
                👨‍⚕️
              </span>

              <span className="text-[18px] font-semibold">
                Patient Entry
              </span>

            </button>

            {/* ITEM */}
            <button className="w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 hover:bg-white/10 transition-all">

              <span className="text-[24px]">
                📅
              </span>

              <span className="text-[18px] font-medium">
                Appointments
              </span>

            </button>

            {/* ITEM */}
            <button className="w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 hover:bg-white/10 transition-all">

              <span className="text-[24px]">
                🧾
              </span>

              <span className="text-[18px] font-medium">
                Invoices
              </span>

            </button>

            {/* ITEM */}
            <button className="w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 hover:bg-white/10 transition-all">

              <span className="text-[24px]">
                👥
              </span>

              <span className="text-[18px] font-medium">
                Patients
              </span>

            </button>

            {/* ITEM */}
            <button className="w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 hover:bg-white/10 transition-all">

              <span className="text-[24px]">
                🦷
              </span>

              <span className="text-[18px] font-medium">
                Treatments
              </span>

            </button>

            {/* ITEM */}
            <button className="w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 hover:bg-white/10 transition-all">

              <span className="text-[24px]">
                📊
              </span>

              <span className="text-[18px] font-medium">
                Reports
              </span>

            </button>

            {/* ITEM */}
            <button className="w-full h-[62px] rounded-2xl flex items-center gap-4 px-5 hover:bg-white/10 transition-all">

              <span className="text-[24px]">
                ⚙️
              </span>

              <span className="text-[18px] font-medium">
                Settings
              </span>

            </button>

          </div>

        </div>

        {/* BOTTOM USER */}
        <div className="p-4 border-t border-white/10">

          <div className="h-[82px] rounded-2xl bg-white/5 flex items-center justify-between px-5">

            <div className="flex items-center gap-4">

              {/* AVATAR */}
              <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-[20px] font-bold">

                A

              </div>

              {/* USER */}
              <div>

                <h3 className="font-semibold text-[18px]">
                  HDC Clinic
                </h3>

                <p className="text-white/60 text-sm">
                  Admin
                </p>

              </div>

            </div>

            <span className="text-xl">
              ⌄
            </span>

          </div>

        </div>

      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}
        <div className="h-[90px] bg-white border-b border-gray-200 px-10 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-8">

            <button className="text-[30px] text-gray-700">
              ☰
            </button>

            <h2 className="text-[34px] font-bold text-gray-800 tracking-tight">
              Patient Entry
            </h2>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-8">

            {/* BELL */}
            <div className="relative">

              <button className="text-[28px] text-gray-700">
                🔔
              </button>

              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">

                3

              </div>

            </div>

            {/* PROFILE */}
            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-full bg-[#02152d] text-white flex items-center justify-center text-lg font-bold">

                A

              </div>

              <div>

                <h3 className="text-[18px] font-semibold text-gray-800">
                  Admin
                </h3>

              </div>

            </div>

          </div>

        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">

          {children}

        </div>

      </div>

    </div>
  );
}

export default Layout;