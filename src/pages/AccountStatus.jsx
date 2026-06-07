import React, {
  useEffect,
  useState,
} from "react";

import api from "../api";
import Layout from "../components/Layout";

function AccountStatus({
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

  useEffect(() => {

    fetchPatients();

  }, []);

  const fetchPatients = async () => {

    try {

      const response =
        await api.get("/patients");

      setPatients(response.data);

      setFilteredPatients(
        response.data
      );

    } catch (error) {

      console.error(error);

    }

  };

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
            ?.regNo || "";

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

  const handlePrint = () => {

    window.print();

  };

  const invoice =
    selectedPatient?.invoice || [];

  const totalAmount =
    invoice.reduce(
      (sum, item) =>
        sum +
        Number(item.cost || 0),
      0
    );

  const discount =
    Number(
      selectedPatient?.discount || 0
    );

  const balanceDue =
    totalAmount - discount;

  return (

    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
    >

      <div className="space-y-6">

        <div className="
          bg-white
          rounded-3xl
          border
          p-8
          shadow-sm
        ">

          <h1 className="
            text-4xl
            font-bold
            text-gray-800
          ">
            Account Status
          </h1>

          <p className="
            text-gray-500
            mt-2
          ">
            Patient Financial Ledger
          </p>

        </div>

        {/* SEARCH */}
        <div className="
          bg-white
          rounded-3xl
          border
          p-6
          shadow-sm
        ">

          <input
            type="text"
            value={search}
            onChange={(e)=>
              handleSearch(
                e.target.value
              )
            }
            placeholder="
              Search by Name,
              Reg No or Mobile
            "
            className="
              w-full
              border
              rounded-2xl
              p-4
            "
          />

        </div>

        {/* ACCOUNT FILE */}
        {selectedPatient && (

          <div className="
            bg-white
            rounded-3xl
            border
            shadow-sm
            p-8
          ">

            <div className="
              flex
              justify-between
              items-center
              mb-6
            ">

              <h2 className="
                text-3xl
                font-bold
              ">
                Patient Account File
              </h2>

              <div className="
                flex
                gap-3
              ">

                <button
  onClick={() => {

    const updatedName = prompt(
      "Patient Name",
      selectedPatient?.biography?.patientName || ""
    );

    if (!updatedName) return;

    setSelectedPatient({
      ...selectedPatient,
      biography: {
        ...selectedPatient.biography,
        patientName: updatedName,
      },
    });

  }}
  className="
    bg-[#176bff]
    text-white
    px-5
    py-2
    rounded-xl
  "
>
  Edit
</button>

                <button
                  onClick={handlePrint}
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

              </div>

            </div>

            <div className="
              bg-gray-50
              border
              rounded-2xl
              p-6
              mb-6
            ">

              <div className="
                grid
                grid-cols-2
                gap-6
              ">

                <div>

                  <p>
                    <b>Reg No:</b>{" "}
                    {
                      selectedPatient
                        ?.biography
                        ?.regNo || "-"
                    }
                  </p>

                  <p>
                    <b>Name:</b>{" "}
                    {
                      selectedPatient
                        ?.biography
                        ?.patientName
                    }
                  </p>

                  <p>
                    <b>Mobile:</b>{" "}
                    {
                      selectedPatient
                        ?.biography
                        ?.mobileNumber
                    }
                  </p>

                </div>

                <div>

                  <p>
                    <b>Category:</b>{" "}
                    {
                      selectedPatient
                        ?.biography
                        ?.category
                    }
                  </p>

                  <p>
                    <b>Total Amount:</b>
                    {" "}Rs {totalAmount}
                  </p>

                  <p>
                    <b>Balance Due:</b>
                    {" "}Rs {balanceDue}
                  </p>

                </div>

              </div>

            </div>

            <div className="
              overflow-x-auto
            ">

              <table className="
                w-full
                border
              ">

                <thead>

                  <tr className="
                    bg-gray-100
                  ">

                    <th className="border p-3">
                      Treatment
                    </th>

                    <th className="border p-3">
                      Qty
                    </th>

                    <th className="border p-3">
                      Rate
                    </th>

                    <th className="border p-3">
                      Amount
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {invoice.map(
                    (
                      item,
                      index
                    ) => (

                      <tr
                        key={index}
                      >

                        <td className="border p-3">
                          {
                            item.details
                          }
                        </td>

                        <td className="border p-3">
                          {
                            item.qty
                          }
                        </td>

                        <td className="border p-3">
                          {
                            item.rate
                          }
                        </td>

                        <td className="border p-3">
                          Rs {
                            item.cost
                          }
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            <div className="
              mt-6
              flex
              justify-end
            ">

              <div className="
                w-[350px]
                bg-gray-50
                rounded-2xl
                p-6
              ">

                <div className="
                  flex
                  justify-between
                  mb-3
                ">
                  <span>
                    Total Amount
                  </span>

                  <span>
                    Rs {totalAmount}
                  </span>
                </div>

                <div className="
                  flex
                  justify-between
                  mb-3
                ">
                  <span>
                    Discount
                  </span>

                  <span>
                    Rs {discount}
                  </span>
                </div>

                <div className="
                  flex
                  justify-between
                  text-xl
                  font-bold
                ">
                  <span>
                    Balance Due
                  </span>

                  <span>
                    Rs {balanceDue}
                  </span>
                </div>

              </div>

            </div>

          </div>

        )}

        {/* PATIENTS */}
        <div className="
          bg-white
          rounded-3xl
          border
          shadow-sm
          overflow-hidden
        ">

          <table className="w-full">

            <thead className="
              bg-gray-50
            ">

              <tr>

                <th className="p-4 text-left">
                  Reg No
                </th>

                <th className="p-4 text-left">
                  Patient Name
                </th>

                <th className="p-4 text-left">
                  Mobile
                </th>

                <th className="p-4 text-left">
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
                    className="
                      border-t
                    "
                  >

                    <td className="p-4">
                      {
                        patient
                          ?.biography
                          ?.regNo
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

                      <button
                        onClick={() =>
                          setSelectedPatient(
                            patient
                          )
                        }
                        className="
                          bg-[#176bff]
                          text-white
                          px-4
                          py-2
                          rounded-xl
                        "
                      >
                        Open Account
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </Layout>

  );

}

export default AccountStatus;