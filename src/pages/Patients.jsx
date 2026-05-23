import React, { useState } from "react";

import api from "../api";

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
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Patient Entry
          </h1>

          <p className="text-gray-500 mt-1">
            Dental Patient Management System
          </p>

        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">

          {/* SAVE */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90"
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
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Print
          </button>

        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="space-y-6">

        {/* BIOGRAPHY */}
        <div className="bg-white rounded-2xl shadow p-6">

          <Biography
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

        {/* CHECKUP */}
        <div className="bg-white rounded-2xl shadow p-6">

          <Checkup
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

        {/* PLANNED SEQUENCE */}
        <div className="bg-white rounded-2xl shadow p-6">

          <PlannedSequence
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

        {/* INVOICE */}
        <div className="bg-white rounded-2xl shadow p-6">

          <Invoice
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

      </div>

    </div>
  );
}

export default Patients;