import React, {
  useEffect,
  useState,
} from "react";

import api from "../api";

import Layout from "../components/Layout";

function Appointments({
  activePage,
  setActivePage,
}) {

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchAppointments();

  }, []);

  const fetchAppointments = async () => {

    try {

      const response =
        await api.get("/patients");

      const patients =
        response.data;

      let allAppointments = [];

      patients.forEach((patient) => {

        const planned =
          patient.plannedSequence || [];

        planned.forEach((visit) => {

          allAppointments.push({

            patientName:
              patient?.biography
                ?.patientName || "",

            mobileNumber:
              patient?.biography
                ?.mobileNumber || "",

            registrationNo:
              patient?.biography
                ?.registrationNo || "",

            visitNo:
              visit.visitNo,

            date:
              visit.date,

            procedure:
              visit.procedure,

            status:
              "Pending",

          });

        });

      });

      setAppointments(
        allAppointments
      );

      setLoading(false);

    } catch (error) {

      console.error(error);

      setLoading(false);

    }

  };

  /* DATES */
  const today = new Date();

  const todayString =
    today.toISOString().split("T")[0];

  const tomorrow = new Date();

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  const tomorrowString =
    tomorrow.toISOString().split("T")[0];

  /* TODAY */
  const todayAppointmentsList =
    appointments.filter(
      (a) => a.date === todayString
    );

  /* TOMORROW */
  const tomorrowAppointmentsList =
    appointments.filter(
      (a) => a.date === tomorrowString
    );

  /* UPCOMING */
  const upcomingAppointments =
    appointments.filter(
      (a) =>
        a.date > tomorrowString
    );

  return (

    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
    >

      <div className="space-y-8">

        {/* HEADER */}
        <div>

          <h1 className="text-5xl font-bold text-gray-800">
            Appointments
          </h1>

          <p className="text-gray-500 mt-2 text-lg">
            Integrated Planned Sequence Appointments
          </p>

        </div>

        {/* LOADING */}
        {loading && (

          <div className="bg-white rounded-3xl p-10 border shadow-sm text-center text-2xl font-semibold">

            Loading Appointments...

          </div>

        )}

        {/* CONTENT */}
        {!loading && (

          <div className="space-y-8">

            {/* TODAY */}
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

              <div className="p-6 border-b bg-[#176bff] text-white">

                <h2 className="text-2xl font-bold">
                  Today's Appointments
                </h2>

              </div>

              <div className="divide-y">

                {todayAppointmentsList.length === 0 && (

                  <div className="p-6 text-gray-500">
                    No appointments today
                  </div>

                )}

                {todayAppointmentsList.map(
                  (
                    appointment,
                    index
                  ) => (

                    <div
                      key={index}
                      className="p-6 flex items-center justify-between hover:bg-gray-50"
                    >

                      <div>

                        <h3 className="text-xl font-bold">
                          {
                            appointment.patientName
                          }
                        </h3>

                        <p className="text-gray-500">
                          {
                            appointment.procedure
                          }
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="font-semibold">
                          {
                            appointment.mobileNumber
                          }
                        </p>

                        <p className="text-gray-500">
                          Visit #
                          {
                            appointment.visitNo
                          }
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* TOMORROW */}
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

              <div className="p-6 border-b bg-yellow-500 text-white">

                <h2 className="text-2xl font-bold">
                  Tomorrow's Appointments
                </h2>

              </div>

              <div className="divide-y">

                {tomorrowAppointmentsList.length === 0 && (

                  <div className="p-6 text-gray-500">
                    No appointments tomorrow
                  </div>

                )}

                {tomorrowAppointmentsList.map(
                  (
                    appointment,
                    index
                  ) => (

                    <div
                      key={index}
                      className="p-6 flex items-center justify-between hover:bg-gray-50"
                    >

                      <div>

                        <h3 className="text-xl font-bold">
                          {
                            appointment.patientName
                          }
                        </h3>

                        <p className="text-gray-500">
                          {
                            appointment.procedure
                          }
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="font-semibold">
                          {
                            appointment.mobileNumber
                          }
                        </p>

                        <p className="text-gray-500">
                          Visit #
                          {
                            appointment.visitNo
                          }
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* UPCOMING */}
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

              <div className="p-6 border-b bg-black text-white">

                <h2 className="text-2xl font-bold">
                  Upcoming Appointments
                </h2>

              </div>

              <div className="divide-y">

                {upcomingAppointments.length === 0 && (

                  <div className="p-6 text-gray-500">
                    No upcoming appointments
                  </div>

                )}

                {upcomingAppointments.map(
                  (
                    appointment,
                    index
                  ) => (

                    <div
                      key={index}
                      className="p-6 flex items-center justify-between hover:bg-gray-50"
                    >

                      <div>

                        <h3 className="text-xl font-bold">
                          {
                            appointment.patientName
                          }
                        </h3>

                        <p className="text-gray-500">
                          {
                            appointment.procedure
                          }
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="font-semibold">
                          {
                            appointment.date
                          }
                        </p>

                        <p className="text-gray-500">
                          {
                            appointment.mobileNumber
                          }
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        )}

      </div>

    </Layout>

  );
}

export default Appointments;