import React, { useState } from "react";

import api from "../api";

import Layout from "../components/Layout";

import Biography from "../components/patient/Biography";
import Checkup from "../components/patient/Checkup";
import PlannedSequence from "../components/patient/PlannedSequence";
import Invoice from "../components/patient/Invoice";

function Patients() {

  const [patientData, setPatientData] = useState({

    biography: {},

    checkup: {},

    plannedSequence: [],

    invoice: [],

    discount: 0,

  });

  const [loading, setLoading] = useState(false);

  /* SAVE PATIENT */
  const handleSave = async () => {

    try {

      setLoading(true);

      const response = await api.post(
        "/patients",
        patientData
      );

      console.log(response.data);

      alert("Patient Saved Successfully");

    } catch (error) {

      console.error(error);

      alert("Error Saving Patient");

    } finally {

      setLoading(false);

    }

  };

  /* PRINT */
  const handlePrint = () => {

    window.print();

  };

  return (

    <Layout>

      <div className="space-y-6">

        {/* PAGE HEADER */}
        <div className="bg-white rounded-3xl shadow-sm p-8 border">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <h1 className="text-4xl font-bold text-gray-800">
                Patient Entry
              </h1>

              <p className="text-gray-500 mt-2 text-lg">
                Dental Patient Management System
              </p>

            </div>

            {/* QUICK INFO */}
            <div className="grid grid-cols-2 gap-4">

              <div className="bg-gray-100 rounded-2xl px-6 py-4">

                <p className="text-gray-500 text-sm">
                  Module
                </p>

                <h3 className="text-xl font-bold">
                  Patient Entry
                </h3>

              </div>

              <div className="bg-gray-100 rounded-2xl px-6 py-4">

                <p className="text-gray-500 text-sm">
                  Status
                </p>

                <h3 className="text-xl font-bold text-green-600">
                  Active
                </h3>

              </div>

            </div>

          </div>

        </div>

        {/* BIOGRAPHY */}
        <div className="bg-white rounded-3xl shadow-sm border p-8">

          <Biography
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

        {/* CHECKUP */}
        <div className="bg-white rounded-3xl shadow-sm border p-8">

          <Checkup
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

        {/* PLANNED SEQUENCE */}
        <div className="bg-white rounded-3xl shadow-sm border p-8">

          <PlannedSequence
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

        {/* INVOICE */}
        <div className="bg-white rounded-3xl shadow-sm border p-8 mb-32">

          <Invoice
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

      </div>

      {/* STICKY ACTION BUTTONS */}
      <div className="fixed bottom-6 right-6 flex gap-4 z-50">

        {/* SAVE */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="
            bg-black
            hover:bg-gray-800
            text-white
            px-8
            py-4
            rounded-2xl
            shadow-2xl
            text-lg
            font-semibold
            transition
          "
        >

          {
            loading
              ? "Saving..."
              : "Save Patient"
          }

        </button>

        {/* PRINT */}
        <button
          onClick={handlePrint}
          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-8
            py-4
            rounded-2xl
            shadow-2xl
            text-lg
            font-semibold
            transition
          "
        >
          Print
        </button>

      </div>

    </Layout>

  );
}

export default Patients;