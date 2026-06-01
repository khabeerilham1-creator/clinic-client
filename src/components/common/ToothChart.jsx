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

  // ARRAY OF TOOTH ENTRIES
  const toothEntries =
    chartData.toothEntries || [];

  // ADD NEW TOOTH BLOCK
  const handleToothSelect = (
    tooth
  ) => {

    const newEntry = {
      id: Date.now(),
      tooth,
      condition: "",
      treatment: "",
    };

    setPatientData((prev) => ({

      ...prev,

      checkup: {

        ...prev.checkup,

        [chartKey]: {

          ...prev.checkup?.[chartKey],

          toothEntries: [
            ...toothEntries,
            newEntry
          ],
        },
      },
    }));

  };

  // UPDATE ENTRY
  const handleEntryChange = (
    id,
    field,
    value
  ) => {

    const updatedEntries =
      toothEntries.map((entry) => {

        if (entry.id === id) {

          return {
            ...entry,
            [field]: value,
          };

        }

        return entry;

      });

    setPatientData((prev) => ({

      ...prev,

      checkup: {

        ...prev.checkup,

        [chartKey]: {

          ...prev.checkup?.[chartKey],

          toothEntries:
            updatedEntries,
        },
      },
    }));

  };

  // DELETE ENTRY
  const removeEntry = (id) => {

    const updatedEntries =
      toothEntries.filter(
        (entry) =>
          entry.id !== id
      );

    setPatientData((prev) => ({

      ...prev,

      checkup: {

        ...prev.checkup,

        [chartKey]: {

          ...prev.checkup?.[chartKey],

          toothEntries:
            updatedEntries,
        },
      },
    }));

  };

  return (

    <div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {title}
      </h2>

      {/* TOOTH IMAGE */}
      <div className="mb-8 flex justify-center">

        <img
          src={toothChart}
          alt="Tooth Chart"
          className="w-full max-w-5xl border rounded-2xl"
        />

      </div>

      {/* UPPER TEETH */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">

        {upperTeeth.map((tooth) => (

          <button
            key={tooth}
            onClick={() =>
              handleToothSelect(tooth)
            }
            className="
              w-12
              h-12
              rounded-lg
              border
              font-semibold
              bg-white
              hover:bg-black
              hover:text-white
              transition
            "
          >
            {tooth}
          </button>

        ))}

      </div>

      {/* LOWER TEETH */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">

        {lowerTeeth.map((tooth) => (

          <button
            key={tooth}
            onClick={() =>
              handleToothSelect(tooth)
            }
            className="
              w-12
              h-12
              rounded-lg
              border
              font-semibold
              bg-white
              hover:bg-black
              hover:text-white
              transition
            "
          >
            {tooth}
          </button>

        ))}

      </div>

      {/* TOOTH BLOCKS */}
      <div className="space-y-6">

        {toothEntries.map((entry,index) => (

          <div
            key={entry.id}
            className="
              border
              rounded-2xl
              p-6
              bg-gray-50
            "
          >

            {/* HEADER */}
            <div className="
              flex
              justify-between
              items-center
              mb-4
            ">

              <h3 className="text-xl font-bold">

                Tooth {entry.tooth}

                {" "}

                #{index + 1}

              </h3>

              <button
                onClick={() =>
                  removeEntry(entry.id)
                }
                className="
                  bg-red-500
                  text-white
                  px-4
                  py-2
                  rounded-lg
                "
              >
                Remove
              </button>

            </div>

            <div className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            ">

              {/* CONDITION */}
              <div>

                <label className="
                  block
                  mb-2
                  font-medium
                ">
                  Pre-existing Condition
                </label>

                <textarea
                  rows="4"
                  value={entry.condition}
                  onChange={(e) =>
                    handleEntryChange(
                      entry.id,
                      "condition",
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    border
                    rounded-lg
                    p-3
                  "
                />

              </div>

              {/* TREATMENT */}
              <div>

                <label className="
                  block
                  mb-2
                  font-medium
                ">
                  Treatment
                </label>

                <textarea
                  rows="4"
                  value={entry.treatment}
                  onChange={(e) =>
                    handleEntryChange(
                      entry.id,
                      "treatment",
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    border
                    rounded-lg
                    p-3
                  "
                />

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}

export default ToothChart;