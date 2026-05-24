import React, {
  useEffect,
  useState,
} from "react";

import api from "../api";
import Layout from "../components/Layout";

function PatientsList({
  activePage,
  setActivePage,
}) {

  const [patients, setPatients] =
    useState([]);

  const [filteredPatients, setFilteredPatients] =
    useState([]);

  const [selectedPatient, setSelectedPatient] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchPatients();

  }, []);

  /* FETCH */
  const fetchPatients = async () => {

    try {

      const response =
        await api.get("/patients");

      setPatients(response.data);

      setFilteredPatients(
        response.data
      );

      setLoading(false);

    } catch (error) {

      console.error(error);

      setLoading(false);

    }

  };

  /* SEARCH */
  const handleSearch = (
    value
  ) => {

    setSearch(value);

    const filtered =
      patients.filter((patient) => {

        const name =
          patient?.biography
            ?.patientName || "";

        const reg =
          patient?.biography
            ?.registrationNo || "";

        const mobile =
          patient?.biography
            ?.mobileNumber || "";

        return (

          name
            .toLowerCase()
            .includes(
              value.toLowerCase()
            ) ||

          reg.includes(value) ||

          mobile.includes(value)

        );

      });

    setFilteredPatients(filtered);

  };

  /* DELETE */
  const handleDelete = async (
    id
  ) => {

    try {

      await api.delete(
        `/patients/${id}`
      );

      alert(
        "Patient Deleted Successfully"
      );

      fetchPatients();

      setSelectedPatient(null);

    } catch (error) {

      console.error(error);

      alert(
        "Delete Failed"
      );

    }

  };

  /* PRINT */
  const handlePrint = (
    patient
  ) => {

    const printWindow =
      window.open(
        "",
        "",
        "width=1200,height=900"
      );

    const invoice =
      patient?.invoice || [];

    const planned =
      patient?.plannedSequence || [];

    printWindow.document.write(`

      <html>

        <head>

          <title>
            HDC Dental Print
          </title>

          <style>

            body{
              font-family:Arial;
              padding:40px;
            }

            table{
              width:100%;
              border-collapse:collapse;
              margin-top:20px;
              margin-bottom:30px;
            }

            th,td{
              border:1px solid #000;
              padding:10px;
              text-align:left;
            }

            h2,h3{
              margin-bottom:15px;
            }

            img{
              width:100%;
              max-width:700px;
              display:block;
              margin:auto;
            }

          </style>

        </head>

        <body>

          <h2>
            HDC Dental
          </h2>

          <p>
            <b>Patient Name:</b>
            ${
              patient?.biography
                ?.patientName || ""
            }
          </p>

          <p>
            <b>Contact:</b>
            ${
              patient?.biography
                ?.mobileNumber || ""
            }
          </p>

          <p>
            <b>Date:</b>
            ${
              patient?.biography
                ?.date || ""
            }
          </p>

          <h3>
            Treatment Details
          </h3>

          <img src="/tooth-chart.png" />

          <table>

            <tr>

              <th>
                S No
              </th>

              <th>
                Details
              </th>

              <th>
                Pre Existing Condition
              </th>

              <th>
                Recommended Treatment
              </th>

            </tr>

            <tr>

              <td>
                1
              </td>

              <td>
                Clinical
              </td>

              <td>
                ${
                  patient?.checkup
                    ?.clinicalTasks
                    ?.condition || "-"
                }
              </td>

              <td>
                ${
                  patient?.checkup
                    ?.clinicalTasks
                    ?.treatment || "-"
                }
              </td>

            </tr>

          </table>

          <h3>
            Planned Sequence Treatment
          </h3>

          <table>

            <tr>

              <th>
                Visit No
              </th>

              <th>
                Date
              </th>

              <th>
                Procedure
              </th>

            </tr>

            ${planned.map((visit)=>

              `
                <tr>

                  <td>
                    ${visit.visitNo}
                  </td>

                  <td>
                    ${visit.date}
                  </td>

                  <td>
                    ${visit.procedure}
                  </td>

                </tr>
              `

            ).join("")}

          </table>

          <h3>
            Invoice
          </h3>

          <table>

            <tr>

              <th>
                Details
              </th>

              <th>
                Qty
              </th>

              <th>
                Rate
              </th>

              <th>
                Cost
              </th>

            </tr>

            ${invoice.map((item)=>

              `
                <tr>

                  <td>
                    ${item.details}
                  </td>

                  <td>
                    ${item.qty}
                  </td>

                  <td>
                    ${item.rate}
                  </td>

                  <td>
                    ${item.cost}
                  </td>

                </tr>
              `

            ).join("")}

          </table>

        </body>

      </html>

    `);

    printWindow.document.close();

    printWindow.print();

  };

  return (

    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
    >

      <div className="space-y-8">

        {/* HEADER */}
        <div>

          <h1 className="text-5xl font-bold text-gray-800">
            Patients Records
          </h1>

          <p className="text-gray-500 mt-2 text-lg">
            All Saved Patients Data
          </p>

        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-3xl border shadow-sm p-6">

          <input
            type="text"
            placeholder="Search by Name, Reg No or Mobile Number..."
            value={search}
            onChange={(e)=>
              handleSearch(
                e.target.value
              )
            }
            className="
              w-full
              border
              rounded-2xl
              p-5
              text-lg
              outline-none
            "
          />

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left p-5">
                    Reg No
                  </th>

                  <th className="text-left p-5">
                    Patient Name
                  </th>

                  <th className="text-left p-5">
                    Mobile
                  </th>

                  <th className="text-left p-5">
                    Category
                  </th>

                  <th className="text-left p-5">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredPatients.map(
                  (
                    patient,
                    index
                  ) => (

                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="p-5">
                        {
                          patient
                            ?.biography
                            ?.registrationNo
                        }
                      </td>

                      <td className="p-5">
                        {
                          patient
                            ?.biography
                            ?.patientName
                        }
                      </td>

                      <td className="p-5">
                        {
                          patient
                            ?.biography
                            ?.mobileNumber
                        }
                      </td>

                      <td className="p-5">
                        {
                          patient
                            ?.biography
                            ?.category
                        }
                      </td>

                      <td className="p-5 flex gap-3">

                        <button
                          onClick={() =>
                            setSelectedPatient(
                              patient
                            )
                          }
                          className="
                            bg-[#176bff]
                            text-white
                            px-5
                            py-2
                            rounded-xl
                          "
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              patient._id
                            )
                          }
                          className="
                            bg-red-500
                            text-white
                            px-5
                            py-2
                            rounded-xl
                          "
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* MODAL */}
        {selectedPatient && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">

            <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8">

              <div className="flex justify-between mb-8">

                <h2 className="text-4xl font-bold">
                  Patient Details
                </h2>

                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      handlePrint(
                        selectedPatient
                      )
                    }
                    className="
                      bg-green-600
                      text-white
                      px-5
                      py-2
                      rounded-xl
                    "
                  >
                    Print
                  </button>

                  <button
                    onClick={() =>
                      setSelectedPatient(null)
                    }
                    className="
                      bg-red-500
                      text-white
                      px-5
                      py-2
                      rounded-xl
                    "
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </Layout>

  );
}

export default PatientsList;