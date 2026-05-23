import React from "react";

import toothChart from "../../assets/tooth-chart.png";

function ToothChart({
  title,
  chartKey,
  patientData,
  setPatientData,
}) {

  const upperTeeth = [
    1,2,3,4,5,6,7,8,
    9,10,11,12,13,14,15,16
  ];

  const lowerTeeth = [
    32,31,30,29,28,27,26,25,
    24,23,22,21,20,19,18,17
  ];

  const chartData =
    patientData.checkup?.[chartKey] || {};

  const selectedTooth =
    chartData.selectedTooth || null;

  const condition =
    chartData.condition || "";

  const treatment =
    chartData.treatment || "";

  const handleToothSelect = (tooth) => {

    setPatientData((prev) => ({
      ...prev,

      checkup: {
        ...prev.checkup,

        [chartKey]: {
          ...prev.checkup?.[chartKey],

          selectedTooth: tooth,
        },
      },
    }));

  };

  const handleChange = (
    field,
    value
  ) => {

    setPatientData((prev) => ({
      ...prev,

      checkup: {
        ...prev.checkup,

        [chartKey]: {
          ...prev.checkup?.[chartKey],

          selectedTooth,

          [field]: value,
        },
      },
    }));

  };

  return (
    <div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {title}
      </h2>

      {/* IMAGE */}
      <div className="mb-8 flex justify-center">

        <img
          src={toothChart}
          alt="Tooth Chart"
          className="w-full max-w-5xl border rounded-2xl"
        />

      </div>

      {/* UPPER */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">

        {upperTeeth.map((tooth) => (

          <button
            key={tooth}
            onClick={() =>
              handleToothSelect(tooth)
            }
            className={`
              w-12 h-12 rounded-lg border font-semibold transition

              ${
                selectedTooth === tooth
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }
            `}
          >
            {tooth}
          </button>

        ))}

      </div>

      {/* LOWER */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">

        {lowerTeeth.map((tooth) => (

          <button
            key={tooth}
            onClick={() =>
              handleToothSelect(tooth)
            }
            className={`
              w-12 h-12 rounded-lg border font-semibold transition

              ${
                selectedTooth === tooth
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }
            `}
          >
            {tooth}
          </button>

        ))}

      </div>

      {/* DETAILS */}
      {selectedTooth && (

        <div className="border rounded-2xl p-6 bg-gray-50">

          <h3 className="text-xl font-bold mb-6">
            Selected Tooth:
            {" "}
            {selectedTooth}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* CONDITION */}
            <div>

              <label className="block mb-2 font-medium">
                Pre-existing Condition
              </label>

              <textarea
                rows="4"
                value={condition}
                onChange={(e) =>
                  handleChange(
                    "condition",
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              />

            </div>

            {/* TREATMENT */}
            <div>

              <label className="block mb-2 font-medium">
                Treatment
              </label>

              <textarea
                rows="4"
                value={treatment}
                onChange={(e) =>
                  handleChange(
                    "treatment",
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              />

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ToothChart;