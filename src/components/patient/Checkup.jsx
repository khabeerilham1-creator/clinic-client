import React from "react";

import ToothChart from "../common/ToothChart";
import { HARD_TISSUE_CONDITIONS, SOFT_TISSUE_CONDITIONS } from "../../utils/clinicData";
import { playSectionSound } from "../../utils/sound";

function FindingTable({ rows, onDelete, emptyText, firstColumnLabel = "S No", firstValue }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table compact-table">
        <thead>
          <tr>
            <th>{firstColumnLabel}</th>
            <th>Condition</th>
            <th>Suggested Treatment</th>
            <th className="no-print">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan="4">{emptyText}</td>
            </tr>
          )}

          {rows.map((row, index) => (
            <tr key={`${row.condition}-${index}`}>
              <td>{firstValue ? firstValue(row, index) : index + 1}</td>
              <td>{row.condition || "-"}</td>
              <td>{row.treatment || "-"}</td>
              <td className="no-print">
                <button className="btn btn-sm btn-danger" type="button" onClick={() => onDelete(index)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClinicalSelector({
  title,
  options,
  selectedCondition,
  suggestedTreatment,
  manualCondition,
  manualTreatment,
  onSelect,
  onManualChange,
  onAddAuto,
  onAddManual,
}) {
  return (
    <div className="clinical-selector">
      <h3>{title}</h3>

      <div className="clinical-grid">
        <label className="field">
          <span>Pre-existing Condition</span>
          <select value={selectedCondition || ""} onChange={(event) => onSelect(event.target.value)}>
            <option value="">Select condition</option>
            {options.map((item) => (
              <option key={item.condition} value={item.condition}>
                {item.condition}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Suggested Treatment</span>
          <input value={suggestedTreatment || ""} readOnly placeholder="Auto treatment" />
        </label>
      </div>

      <button className="btn btn-primary btn-sm no-print" type="button" onClick={onAddAuto}>
        Add selected treatment
      </button>

      <div className="clinical-grid manual-grid">
        <label className="field">
          <span>Manual Condition</span>
          <textarea
            rows="3"
            value={manualCondition || ""}
            onChange={(event) => onManualChange("condition", event.target.value)}
            placeholder="Write manual condition"
          />
        </label>

        <label className="field">
          <span>Manual Treatment</span>
          <textarea
            rows="3"
            value={manualTreatment || ""}
            onChange={(event) => onManualChange("treatment", event.target.value)}
            placeholder="Write manual treatment"
          />
        </label>
      </div>

      <button className="btn btn-sm no-print" type="button" onClick={onAddManual}>
        Add manual treatment
      </button>
    </div>
  );
}

function Checkup({ patientData, setPatientData }) {
  const checkupData = patientData.checkup || {};
  const softRows = checkupData.softTissueRecords || [];
  const hardRows = checkupData.hardTissueRecords || [];
  const selectedToothNo = checkupData.selectedToothNo || "";

  const setCheckup = (updates) => {
    setPatientData((prev) => ({
      ...prev,
      checkup: {
        ...prev.checkup,
        ...updates,
      },
    }));
  };

  const selectCondition = (section, value) => {
    const options = section === "soft" ? SOFT_TISSUE_CONDITIONS : HARD_TISSUE_CONDITIONS;
    const found = options.find((item) => item.condition === value);
    const prefix = section === "soft" ? "soft" : "hard";

    setCheckup({
      [`${prefix}SelectedCondition`]: value,
      [`${prefix}SuggestedTreatment`]: found?.treatment || "",
      ...(section === "soft"
        ? {
            selectedCondition: value,
            suggestedTreatment: found?.treatment || "",
          }
        : {}),
    });
    playSectionSound("section");
  };

  const manualChange = (section, field, value) => {
    const prefix = section === "soft" ? "soft" : "hard";
    setCheckup({
      [`${prefix}Manual${field === "condition" ? "Condition" : "Treatment"}`]: value,
      ...(section === "soft" && field === "condition" ? { manualCondition: value } : {}),
      ...(section === "soft" && field === "treatment" ? { manualTreatment: value } : {}),
    });
  };

  const addFinding = (section, source) => {
    const prefix = section === "soft" ? "soft" : "hard";
    const rowsKey = section === "soft" ? "softTissueRecords" : "hardTissueRecords";
    const currentRows = section === "soft" ? softRows : hardRows;
    const condition =
      source === "manual"
        ? checkupData[`${prefix}ManualCondition`]
        : checkupData[`${prefix}SelectedCondition`];
    const treatment =
      source === "manual"
        ? checkupData[`${prefix}ManualTreatment`]
        : checkupData[`${prefix}SuggestedTreatment`];

    if (!condition && !treatment) {
      return;
    }

    setCheckup({
      [rowsKey]: [
        ...currentRows,
        {
          condition,
          treatment,
          source,
          ...(section === "hard" ? { toothNo: selectedToothNo } : {}),
        },
      ],
      ...(source === "manual"
        ? {
            [`${prefix}ManualCondition`]: "",
            [`${prefix}ManualTreatment`]: "",
          }
        : {}),
    });
    playSectionSound("success");
  };

  const deleteFinding = (section, index) => {
    const rowsKey = section === "soft" ? "softTissueRecords" : "hardTissueRecords";
    const currentRows = section === "soft" ? softRows : hardRows;
    setCheckup({
      [rowsKey]: currentRows.filter((_, rowIndex) => rowIndex !== index),
    });
    playSectionSound("warning");
  };

  const handleToothSelect = (toothNo) => {
    setCheckup({ selectedToothNo: toothNo });
    playSectionSound("section");
  };

  return (
    <div className="clinical-section">
      <div className="panel-heading">
        <div>
          <h2>Clinical Exam</h2>
          <p>Soft tissue and hard tissue findings with automatic treatment suggestions.</p>
        </div>
      </div>

      <section className="clinical-chart-card">
        <ClinicalSelector
          title="Soft Tissue Chart"
          options={SOFT_TISSUE_CONDITIONS}
          selectedCondition={checkupData.softSelectedCondition || checkupData.selectedCondition}
          suggestedTreatment={checkupData.softSuggestedTreatment || checkupData.suggestedTreatment}
          manualCondition={checkupData.softManualCondition || checkupData.manualCondition}
          manualTreatment={checkupData.softManualTreatment || checkupData.manualTreatment}
          onSelect={(value) => selectCondition("soft", value)}
          onManualChange={(field, value) => manualChange("soft", field, value)}
          onAddAuto={() => addFinding("soft", "auto")}
          onAddManual={() => addFinding("soft", "manual")}
        />

        <FindingTable
          rows={softRows}
          onDelete={(index) => deleteFinding("soft", index)}
          emptyText="No soft tissue findings selected yet."
        />
      </section>

      <section className="clinical-chart-card">
        <div className="tooth-chart-wrap">
          <ToothChart
            patientData={patientData}
            setPatientData={setPatientData}
            onToothSelect={handleToothSelect}
          />
        </div>
      </section>

      <section className="clinical-chart-card">
        <div className="selected-tooth-strip">
          <span>Selected Tooth</span>
          <strong>{selectedToothNo ? `#${selectedToothNo}` : "Click a tooth above"}</strong>
        </div>

        <ClinicalSelector
          title="Hard Tissue Chart"
          options={HARD_TISSUE_CONDITIONS}
          selectedCondition={checkupData.hardSelectedCondition}
          suggestedTreatment={checkupData.hardSuggestedTreatment}
          manualCondition={checkupData.hardManualCondition}
          manualTreatment={checkupData.hardManualTreatment}
          onSelect={(value) => selectCondition("hard", value)}
          onManualChange={(field, value) => manualChange("hard", field, value)}
          onAddAuto={() => addFinding("hard", "auto")}
          onAddManual={() => addFinding("hard", "manual")}
        />

        <FindingTable
          rows={hardRows}
          onDelete={(index) => deleteFinding("hard", index)}
          emptyText="No hard tissue findings selected yet."
          firstColumnLabel="Tooth No"
          firstValue={(row) => (row.toothNo ? `#${row.toothNo}` : "-")}
        />
      </section>
    </div>
  );
}

export default Checkup;
