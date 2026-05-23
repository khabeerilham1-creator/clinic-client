import React from "react";

import ToothChart from "../common/ToothChart";

function Checkup({
  patientData,
  setPatientData,
}) {

  const checkupData =
    patientData.checkup || {};

  const conditionsData = [
    {
      condition: "Gingivitis",
      treatment: "Scaling and Polishing",
    },
    {
      condition: "Periodontitis",
      treatment: "Root Planning",
    },
    {
      condition: "Generalized Gingival Recession",
      treatment:
        "Scaling & Polishing, Fluoride Treatment",
    },
    {
      condition: "Oral Ulcers",
      treatment: "Medications",
    },
    {
      condition: "Calculus",
      treatment:
        "Scaling & Polishing",
    },
    {
      condition: "Tar Tar Deposits",
      treatment: "Polishing",
    },
    {
      condition:
        "Juvenile Periodontitis",
      treatment:
        "Scaling & Polishing",
    },
    {
      condition:
        "Gingival Hyperplasia",
      treatment:
        "Gingivectomy under L/A",
    },
    {
      condition:
        "Gingival Swelling",
      treatment:
        "Localized Scaling, Medication",
    },
    {
      condition:
        "Generalized Discoloration",
      treatment:
        "Bleaching or Veneers",
    },
    {
      condition:
        "Pits and Fissures",
      treatment: "Sealants",
    },
    {
      condition:
        "Class I Moderate Carious",
      treatment:
        "Composite Filling",
    },
    {
      condition:
        "Class I Grossly Carious",
      treatment:
        "RCT under L/A",
    },
    {
      condition:
        "Class II Moderate Carious",
      treatment:
        "Composite Filling",
    },
    {
      condition:
        "Class II Grossly Carious",
      treatment:
        "RCT under L/A",
    },
    {
      condition:
        "Class III Moderate Carious",
      treatment:
        "Composite Filling",
    },
    {
      condition:
        "Class III Grossly Carious",
      treatment:
        "RCT under L/A",
    },
    {
      condition:
        "Class IV Moderate Carious",
      treatment:
        "Composite Filling",
    },
    {
      condition:
        "Class IV Grossly Carious",
      treatment:
        "RCT under L/A",
    },
    {
      condition:
        "Class V Moderate Carious",
      treatment:
        "Composite Filling",
    },
    {
      condition:
        "Class V Grossly Carious",
      treatment:
        "RCT under L/A",
    },
    {
      condition: "Attrition",
      treatment:
        "RCT under L/A",
    },
    {
      condition:
        "Shaky Grade I",
      treatment:
        "Localized Scaling, PRP",
    },
    {
      condition:
        "Shaky Grade II",
      treatment:
        "Localized Scaling, PRP",
    },
    {
      condition:
        "Shaky Grade III",
      treatment:
        "Extraction under L/A",
    },
    {
      condition: "BDR",
      treatment:
        "Extraction under L/A",
    },
    {
      condition:
        "Fractured Tooth",
      treatment:
        "Surgical Extraction under L/A",
    },
    {
      condition:
        "Grossly Fractured Dentine",
      treatment:
        "Pulpotomy",
    },
    {
      condition: "Missing",
      treatment:
        "Implant or Bridge",
    },
    {
      condition: "RCTed",
      treatment: "Crown",
    },
    {
      condition:
        "Supranumery",
      treatment:
        "Extraction under L/A",
    },
    {
      condition:
        "Enameloplasia",
      treatment: "Veneer",
    },
    {
      condition:
        "Discolored Tooth",
      treatment: "Veneer",
    },
    {
      condition:
        "Unsatisfactory RCT Done",
      treatment: "Re-RCT",
    },
  ];

  const handleConditionChange = (
    value
  ) => {

    const found =
      conditionsData.find(
        (item) =>
          item.condition === value
      );

    setPatientData((prev) => ({
      ...prev,

      checkup: {
        ...prev.checkup,

        selectedCondition:
          value,

        suggestedTreatment:
          found
            ? found.treatment
            : "",
      },
    }));

  };

  const handleManualChange = (
    field,
    value
  ) => {

    setPatientData((prev) => ({
      ...prev,

      checkup: {
        ...prev.checkup,

        [field]: value,
      },
    }));

  };

  return (
    <div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Checkup Section
      </h2>

      {/* SOFT TISSUE */}
      <div className="border rounded-2xl p-5 mb-6">

        <h3 className="text-xl font-semibold mb-4">
          Soft Tissue
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* CONDITION */}
          <div>

            <label className="block mb-2 font-medium">
              Pre-existing Conditions
            </label>

            <select
              value={
                checkupData.selectedCondition || ""
              }
              onChange={(e) =>
                handleConditionChange(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3"
            >

              <option value="">
                Select Condition
              </option>

              {conditionsData.map(
                (item, index) => (

                  <option
                    key={index}
                    value={
                      item.condition
                    }
                  >
                    {
                      item.condition
                    }
                  </option>

                )
              )}

            </select>

          </div>

          {/* TREATMENT */}
          <div>

            <label className="block mb-2 font-medium">
              Suggested Treatments
            </label>

            <input
              type="text"
              value={
                checkupData.suggestedTreatment || ""
              }
              readOnly
              className="w-full border rounded-lg p-3 bg-gray-100"
            />

          </div>

        </div>

        {/* MANUAL ENTRY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

          {/* MANUAL CONDITION */}
          <div>

            <label className="block mb-2 font-medium">
              Manual Condition
            </label>

            <textarea
              rows="4"
              value={
                checkupData.manualCondition || ""
              }
              onChange={(e) =>
                handleManualChange(
                  "manualCondition",
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3"
            />

          </div>

          {/* MANUAL TREATMENT */}
          <div>

            <label className="block mb-2 font-medium">
              Manual Treatment
            </label>

            <textarea
              rows="4"
              value={
                checkupData.manualTreatment || ""
              }
              onChange={(e) =>
                handleManualChange(
                  "manualTreatment",
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3"
            />

          </div>

        </div>

      </div>

      {/* HARD TISSUE */}
      <div className="border rounded-2xl p-5">

        <h3 className="text-xl font-semibold mb-6">
          Hard Tissue
        </h3>

        {/* CLINICAL TASKS */}
        <div className="mb-10">

          <ToothChart
            title="Clinical Tasks"
            chartKey="clinicalTasks"
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

        {/* LAB TASKS */}
        <div>

          <ToothChart
            title="Lab Tasks"
            chartKey="labTasks"
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

      </div>

    </div>
  );
}

export default Checkup;