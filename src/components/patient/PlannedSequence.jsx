import React, { useEffect } from "react";
import {
  capitalizeFirstWord,
  dateKey,
  formatDateDisplay,
  plannedVisitStatus,
  todayDisplayValue,
} from "../../utils/patientHelpers";

const generateSequenceFromExam = (patient) => {
  const checkup = patient?.checkup || {};
  const soft = checkup.softTissueRecords || [];
  const hard = checkup.hardTissueRecords || [];
  const lab = checkup.labTaskRecords || [];

  const items = [];

  soft.forEach((r) => {
    if (r.treatment || r.condition) {
      items.push({
        type: "soft",
        procedure: r.treatment || r.condition,
      });
    }
  });

  hard.forEach((r) => {
    if (r.treatment || r.condition) {
      items.push({
        type: "hard",
        procedure: r.treatment || r.condition,
        toothNo: r.toothNo,
      });
    }
  });

  lab.forEach((r) => {
    if (r.treatment || r.condition) {
      items.push({
        type: "lab",
        procedure: r.treatment || r.condition,
        toothNo: r.toothNo,
      });
    }
  });

  const getWeight = (item) => {
    const proc = String(item.procedure).toLowerCase();
    
    // 1. scaling polishing
    if (proc.includes("scaling") || proc.includes("polishing") || proc.includes("planing")) {
      return 1;
    }
    
    // 2. rcts
    if (proc.includes("rct") || proc.includes("root canal") || proc.includes("pulpotomy")) {
      return 2;
    }
    
    // 3. fillings
    if (proc.includes("filling") || proc.includes("sealant") || proc.includes("composite")) {
      return 3;
    }
    
    // 4. lab task
    if (
      item.type === "lab" ||
      proc.includes("crown") ||
      proc.includes("bridge") ||
      proc.includes("denture") ||
      proc.includes("veneer") ||
      proc.includes("post") ||
      proc.includes("prosthetic")
    ) {
      return 4;
    }
    
    // 6. surgical ext (check first to avoid matching simple ext)
    if (proc.includes("surgical extraction") || proc.includes("surgical ext")) {
      return 6;
    }
    
    // 5. simple ext
    if (proc.includes("extraction") || proc.includes("ext")) {
      return 5;
    }
    
    return 7;
  };

  items.sort((a, b) => getWeight(a) - getWeight(b));

  if (items.length === 0) {
    return [
      {
        visitNo: 1,
        date: "",
        time: "",
        procedure: "",
      },
    ];
  }

  return items.map((item, index) => {
    const suffix = item.toothNo ? ` (Tooth ${item.toothNo})` : "";
    return {
      visitNo: index + 1,
      date: "",
      time: "",
      procedure: `${item.procedure}${suffix}`,
    };
  });
};

function PlannedSequence({
  patientData,
  setPatientData,
}) {

  const rows =
    patientData.plannedSequence || [];

  const autoGenerateSequence = () => {
    const generated = generateSequenceFromExam(patientData);
    setPatientData((prev) => ({
      ...prev,
      plannedSequence: generated,
    }));
  };

  useEffect(() => {
    const isSequenceEmpty =
      rows.length === 0 ||
      (rows.length === 1 && !rows[0].procedure && !rows[0].date && !rows[0].time);

    if (isSequenceEmpty) {
      const generated = generateSequenceFromExam(patientData);
      setPatientData((prev) => ({
        ...prev,
        plannedSequence: generated,
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

        <div className="flex items-center gap-2">
          <button
            onClick={autoGenerateSequence}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg mr-2"
          >
            Auto-Generate from Exam
          </button>
          <button
            onClick={addRow}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            + Add Visit
          </button>
        </div>

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
