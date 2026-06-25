import React, { useEffect } from "react";
import { capitalizeFirstWord } from "../../utils/patientHelpers";

function PlannedSequence({
  patientData,
  setPatientData,
}) {

  const rows =
    patientData.plannedSequence || [];

  useEffect(() => {

    if (rows.length === 0) {

      setPatientData((prev) => ({
        ...prev,

        plannedSequence: [
          {
            visitNo: 1,
            date: "",
            procedure: "",
          },
        ],
      }));

    }

  }, []);

  const handleChange = (
    index,
    field,
    value
  ) => {

    const updatedRows = [...rows];

    updatedRows[index][field] = field === "procedure" ? capitalizeFirstWord(value) : value;

    setPatientData((prev) => ({
      ...prev,
      plannedSequence: updatedRows,
    }));

  };

  const addRow = () => {

    const updatedRows = [
      ...rows,
      {
        visitNo: rows.length + 1,
        date: "",
        procedure: "",
      },
    ];

    setPatientData((prev) => ({
      ...prev,
      plannedSequence: updatedRows,
    }));

  };

  const deleteRow = (index) => {

    const updatedRows = rows
      .filter((_, i) => i !== index)
      .map((row, i) => ({
        ...row,
        visitNo: i + 1,
      }));

    setPatientData((prev) => ({
      ...prev,
      plannedSequence: updatedRows,
    }));

  };

  return (
    <div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Planned Sequence Treatment
        </h2>

        <button
          onClick={addRow}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          + Add Visit
        </button>

      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">

        <table className="w-full border border-gray-300">

          <thead className="bg-gray-100">

            <tr>

              <th className="border p-3">
                Visit No
              </th>

              <th className="border p-3">
                Date
              </th>

              <th className="border p-3">
                Procedure
              </th>

              <th className="border p-3">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {rows.map((row, index) => (

              <tr key={index}>

                {/* VISIT NO */}
                <td className="border p-2 text-center">
                  {row.visitNo}
                </td>

                {/* DATE */}
                <td className="border p-2">

                  <input
                    type="text"
                    value={row.date}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "date",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded"
                    placeholder="dd/mm/yyyy"
                    inputMode="numeric"
                  />

                </td>

                {/* PROCEDURE */}
                <td className="border p-2">

                  <input
                    type="text"
                    placeholder="Enter Procedure"
                    value={row.procedure}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "procedure",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded"
                    autoCapitalize="sentences"
                    spellCheck="true"
                  />

                </td>

                {/* DELETE */}
                <td className="border p-2 text-center">

                  <button
                    onClick={() =>
                      deleteRow(index)
                    }
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default PlannedSequence;
