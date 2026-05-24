import React, {
  useEffect,
  useState,
} from "react";

import api from "../api";

import Layout from "../components/Layout";

function Dashboard({
  activePage,
  setActivePage,
}) {

  const [patients, setPatients] =
    useState([]);

  const [todayAppointments, setTodayAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchDashboardData();

  }, []);

  const fetchDashboardData = async () => {

    try {

      const patientResponse =
        await api.get("/patients");

      const patientData =
        patientResponse.data;

      setPatients(patientData);

      /* TODAY APPOINTMENTS */
      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const appointments = [];

      patientData.forEach(
        (patient) => {

          const planned =
            patient.plannedSequence || [];

          planned.forEach(
            (visit) => {

              if (
                visit.date === today
              ) {

                appointments.push({
                  patientName:
                    patient
                      ?.biography
                      ?.patientName,

                  registrationNo:
                    patient
                      ?.biography
                      ?.registrationNo,

                  procedure:
                    visit.procedure,

                  date:
                    visit.date,
                });

              }

            }
          );

        }
      );

      setTodayAppointments(
        appointments
      );

      setLoading(false);

    } catch (error) {

      console.error(error);

      setLoading(false);

    }

  };

  /* TOTAL REVENUE */
  const totalRevenue =
    patients.reduce((total, patient) => {

      const invoice =
        patient.invoice || [];

      const invoiceTotal =
        invoice.reduce(
          (sum, item) =>
            sum +
            Number(item.cost || 0),
          0
        );

      return total + invoiceTotal;

    }, 0);

  /* PENDING TREATMENTS */
  const pendingTreatments =
    patients.reduce((total, patient) => {

      const planned =
        patient.plannedSequence || [];

      return total + planned.length;

    }, 0);

  return (

    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
    >

      <div className="space-y-8">

        {/* HEADER */}
        <div>

          <h1 className="text-5xl font-bold text-gray-800">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-2 text-lg">
            Welcome to HDC Dental Management System
          </p>

        </div>

        {/* LOADING */}
        {loading && (

          <div className="bg-white rounded-3xl p-10 shadow-sm border text-center text-2xl font-semibold">

            Loading Dashboard...

          </div>

        )}

        {/* CONTENT */}
        {!loading && (

          <>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              {/* TOTAL PATIENTS */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border">

                <p className="text-gray-500 text-lg">
                  Total Patients
                </p>

                <h2 className="text-6xl font-bold mt-5 text-[#02152d]">
                  {patients.length}
                </h2>

              </div>

              {/* APPOINTMENTS */}
              <button
                onClick={() =>
                  setActivePage(
                    "appointments"
                  )
                }
                className="
                  bg-white
                  rounded-3xl
                  p-8
                  shadow-sm
                  border
                  hover:shadow-2xl
                  transition
                  text-left
                "
              >

                <p className="text-gray-500 text-lg">
                  Today Appointments
                </p>

                <h2 className="text-6xl font-bold mt-5 text-[#02152d]">
                  {
                    todayAppointments.length
                  }
                </h2>

              </button>

              {/* REVENUE */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border">

                <p className="text-gray-500 text-lg">
                  Total Revenue
                </p>

                <h2 className="text-5xl font-bold mt-5 text-green-600">
                  Rs {totalRevenue}
                </h2>

              </div>

              {/* PENDING */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border">

                <p className="text-gray-500 text-lg">
                  Pending Treatments
                </p>

                <h2 className="text-6xl font-bold mt-5 text-[#02152d]">
                  {pendingTreatments}
                </h2>

              </div>

            </div>

            {/* MODULES */}
            <div>

              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Available Modules
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* PATIENT ENTRY */}
                <button
                  onClick={() =>
                    setActivePage(
                      "patients"
                    )
                  }
                  className="
                    bg-white
                    rounded-3xl
                    p-8
                    border
                    shadow-sm
                    hover:shadow-2xl
                    transition
                    text-left
                  "
                >

                  <div className="text-6xl mb-6">
                    👨‍⚕️
                  </div>

                  <h2 className="text-2xl font-bold mb-3">
                    Patient Entry
                  </h2>

                  <p className="text-gray-500">
                    Manage patient records, treatments and invoices
                  </p>

                </button>

                {/* APPOINTMENTS */}
                <button
                  onClick={() =>
                    setActivePage(
                      "appointments"
                    )
                  }
                  className="
                    bg-white
                    rounded-3xl
                    p-8
                    border
                    shadow-sm
                    hover:shadow-2xl
                    transition
                    text-left
                  "
                >

                  <div className="text-6xl mb-6">
                    📅
                  </div>

                  <h2 className="text-2xl font-bold mb-3">
                    Appointments
                  </h2>

                  <p className="text-gray-500">
                    Manage clinic appointments and visits
                  </p>

                </button>

                {/* PATIENTS RECORDS */}
                <button
                  onClick={() =>
                    setActivePage(
                      "patients-list"
                    )
                  }
                  className="
                    bg-white
                    rounded-3xl
                    p-8
                    border
                    shadow-sm
                    hover:shadow-2xl
                    transition
                    text-left
                  "
                >

                  <div className="text-6xl mb-6">
                    👥
                  </div>

                  <h2 className="text-2xl font-bold mb-3">
                    Patients Records
                  </h2>

                  <p className="text-gray-500">
                    View all saved patient records and details
                  </p>

                </button>

              </div>

            </div>

            {/* TODAY APPOINTMENTS */}
            <div className="bg-white rounded-3xl shadow-sm border p-8">

              <div className="flex items-center justify-between mb-8">

                <h2 className="text-3xl font-bold text-gray-800">
                  Today Appointments
                </h2>

                <button
                  onClick={() =>
                    setActivePage(
                      "appointments"
                    )
                  }
                  className="
                    bg-[#176bff]
                    text-white
                    px-5
                    py-3
                    rounded-2xl
                    font-semibold
                  "
                >
                  Open Appointments
                </button>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b">

                      <th className="text-left p-4">
                        Reg No
                      </th>

                      <th className="text-left p-4">
                        Patient Name
                      </th>

                      <th className="text-left p-4">
                        Procedure
                      </th>

                      <th className="text-left p-4">
                        Date
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {todayAppointments.map(
                      (
                        appointment,
                        index
                      ) => (

                        <tr
                          key={index}
                          className="border-b hover:bg-gray-50"
                        >

                          <td className="p-4 font-semibold">
                            {
                              appointment.registrationNo
                            }
                          </td>

                          <td className="p-4">
                            {
                              appointment.patientName
                            }
                          </td>

                          <td className="p-4">
                            {
                              appointment.procedure
                            }
                          </td>

                          <td className="p-4">
                            {
                              appointment.date
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* RECENT PATIENTS */}
            <div className="bg-white rounded-3xl shadow-sm border p-8">

              <div className="flex items-center justify-between mb-8">

                <h2 className="text-3xl font-bold text-gray-800">
                  Recent Patients
                </h2>

                <button
                  onClick={() =>
                    setActivePage(
                      "patients-list"
                    )
                  }
                  className="
                    bg-[#176bff]
                    text-white
                    px-5
                    py-3
                    rounded-2xl
                    font-semibold
                  "
                >
                  Open Records
                </button>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b">

                      <th className="text-left p-4">
                        Reg No
                      </th>

                      <th className="text-left p-4">
                        Name
                      </th>

                      <th className="text-left p-4">
                        Mobile
                      </th>

                      <th className="text-left p-4">
                        Category
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {patients.map(
                      (
                        patient,
                        index
                      ) => (

                        <tr
                          key={index}
                          className="border-b hover:bg-gray-50"
                        >

                          <td className="p-4 font-semibold">
                            {
                              patient
                                ?.biography
                                ?.registrationNo
                            }
                          </td>

                          <td className="p-4">
                            {
                              patient
                                ?.biography
                                ?.patientName
                            }
                          </td>

                          <td className="p-4">
                            {
                              patient
                                ?.biography
                                ?.mobileNumber
                            }
                          </td>

                          <td className="p-4">
                            {
                              patient
                                ?.biography
                                ?.category
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </>

        )}

      </div>

    </Layout>

  );
}

export default Dashboard;