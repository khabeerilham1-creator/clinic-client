import React, { useEffect } from "react";
import {
  capitalizeFirstWord,
  dateKey,
  formatDateDisplay,
  plannedVisitStatus,
  todayDisplayValue,
} from "../../utils/patientHelpers";

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
            time: "",
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
        time: "",
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

        <h2 className="text-2xl font-bold text-black">
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

        <table className="data-table planned-sequence-table">

          <thead>

            <tr>

              <th className="border p-3">
                Visit No
              </th>

              <th className="border p-3">
                Date
              </th>

              <th className="border p-3">
                Time
              </th>

              <th className="border p-3">
                Procedure
              </th>

              <th className="border p-3">
                Status
              </th>

              <th className="border p-3">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {rows.map((row, index) => (

              <tr key={index} className={plannedVisitStatus(row) === "Done" ? "planned-row-done" : ""}>

                {/* VISIT NO */}
                <td className="border p-2 text-center">
                  {row.visitNo}
                </td>

                {/* DATE */}
                <td className="border p-2">

                  <input
                    type="date"
                    value={dateKey(row.date)}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "date",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded"
                    max="9999-12-31"
                  />

                </td>

                {/* TIME */}
                <td className="border p-2">

                  <input
                    type="time"
                    value={row.time || ""}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "time",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded"
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

                {/* STATUS */}
                <td className="border p-2 text-center">
                  <span className={`pill ${
                    plannedVisitStatus(row) === "Done"
                      ? "success"
                      : plannedVisitStatus(row) === "Today"
                        ? "warning"
                        : ""
                  }`}>
                    {plannedVisitStatus(row)}
                  </span>
                  {plannedVisitStatus(row) === "Done" && row.date && (
                    <small className="planned-done-date">
                      {formatDateDisplay(row.date)}
                    </small>
                  )}
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

      <div className="planned-sequence-note">
        Visits before {todayDisplayValue()} are marked Done automatically.
      </div>

    </div>
  );
}

export default PlannedSequence;
