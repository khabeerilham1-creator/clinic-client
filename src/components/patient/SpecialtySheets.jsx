import React from "react";

import { capitalizeFirstWord, todayDisplayValue } from "../../utils/patientHelpers";

const textFields = new Set([
  "patientName",
  "address",
  "gender",
  "mobileNumber",
  "cellNo",
  "fileNo",
]);

const fixedProcedureRows = [
  "Initial Impression",
  "Bite registration OVD",
  "Trial",
  "Final Impression",
  "Final Insertion",
];

const blankRows = (count) => Array.from({ length: count }, () => ({}));

function updateBiography(setPatientData, name, value) {
  const nextValue = textFields.has(name) ? capitalizeFirstWord(value) : value;

  setPatientData((current) => ({
    ...current,
    biography: {
      ...(current.biography || {}),
      [name]: nextValue,
    },
  }));
}

function updateSheet(setPatientData, key, field, value) {
  setPatientData((current) => ({
    ...current,
    [key]: {
      ...(current[key] || {}),
      [field]: value,
    },
  }));
}

function Field({ label, value, onChange, type = "text", readOnly = false, textarea = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      {textarea ? (
        <textarea value={value || ""} onChange={(event) => onChange(event.target.value)} readOnly={readOnly} />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
        />
      )}
    </label>
  );
}

function OptionGroup({ label, value, options, onChange }) {
  return (
    <div className="sheet-option-block">
      <span className="sheet-label">{label}</span>
      <div className="sheet-option-row">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`sheet-option${value === option ? " selected" : ""}`}
            onClick={() => onChange(value === option ? "" : option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function BioDataGrid({ patientData, setPatientData, includeFileNo = false, compact = false }) {
  const bio = patientData.biography || {};

  return (
    <section className="sheet-section">
      <h3>Biodata</h3>
      <div className={`sheet-grid${compact ? " compact" : ""}`}>
        <Field
          label="Name"
          value={bio.patientName}
          onChange={(value) => updateBiography(setPatientData, "patientName", value)}
        />
        <Field
          label="Date"
          value={bio.date || todayDisplayValue()}
          onChange={(value) => updateBiography(setPatientData, "date", value)}
        />
        <Field
          label="Birthdate"
          value={bio.birthDate}
          onChange={(value) => updateBiography(setPatientData, "birthDate", value)}
        />
        <Field
          label="Gender"
          value={bio.gender}
          onChange={(value) => updateBiography(setPatientData, "gender", value)}
        />
        {includeFileNo && (
          <Field
            label="File No"
            value={bio.fileNo || bio.regNo}
            onChange={(value) => updateBiography(setPatientData, "fileNo", value)}
          />
        )}
        <Field
          label="Cell No"
          value={bio.cellNo || bio.mobileNumber}
          onChange={(value) => {
            updateBiography(setPatientData, "cellNo", value);
            updateBiography(setPatientData, "mobileNumber", value);
          }}
        />
        <div className="sheet-grid-wide">
          <Field
            label="Address"
            value={bio.address}
            onChange={(value) => updateBiography(setPatientData, "address", value)}
            textarea
          />
        </div>
      </div>
    </section>
  );
}

export function ImplantCommencementSheet({ patientData, setPatientData }) {
  return (
    <div className="specialty-sheet printable-report">
      <div className="panel-heading">
        <div>
          <h2>Implant Commencement Sheet</h2>
        </div>
      </div>
      <BioDataGrid patientData={patientData} setPatientData={setPatientData} />
      <section className="sheet-section implant-blank-section" aria-label="Implant commencement sheet" />
    </div>
  );
}

export function OrthodonticAssessmentSheet({ patientData, setPatientData }) {
  const assessment = patientData.orthodonticAssessment || {};
  const diagnosis = Array.isArray(assessment.diagnosis) ? assessment.diagnosis : Array(7).fill("");
  const habits = Array.isArray(assessment.habits) ? assessment.habits : [];

  const updateAssessment = (field, value) =>
    updateSheet(setPatientData, "orthodonticAssessment", field, value);
  const updateDiagnosis = (index, value) => {
    const next = Array.from({ length: 7 }, (_, rowIndex) => diagnosis[rowIndex] || "");

    next[index] = capitalizeFirstWord(value);
    updateAssessment("diagnosis", next);
  };
  const toggleHabit = (habit) => {
    const nextHabits = habits.includes(habit)
      ? habits.filter((item) => item !== habit)
      : [...habits, habit];

    updateAssessment("habits", nextHabits);
  };

  return (
    <div className="specialty-sheet printable-report">
      <div className="panel-heading">
        <div>
          <h2>Orthodontic Assessment Sheet</h2>
        </div>
      </div>

      <BioDataGrid patientData={patientData} setPatientData={setPatientData} />

      <section className="sheet-section">
        <h3>Extra Oral Assessment</h3>
        <div className="sheet-option-grid">
          <OptionGroup
            label="Facial Profile"
            value={assessment.facialProfile}
            options={["Concave", "Convex", "Straight"]}
            onChange={(value) => updateAssessment("facialProfile", value)}
          />
          <OptionGroup
            label="Lips"
            value={assessment.lips}
            options={["Together at Rest", "Apart at Rest"]}
            onChange={(value) => updateAssessment("lips", value)}
          />
          <div className="sheet-option-block">
            <span className="sheet-label">Habits</span>
            <div className="sheet-option-row">
              {["Thumb Sucking", "Tongue Thrusting", "Bruxism"].map((habit) => (
                <button
                  key={habit}
                  type="button"
                  className={`sheet-option${habits.includes(habit) ? " selected" : ""}`}
                  onClick={() => toggleHabit(habit)}
                >
                  {habit}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sheet-section">
        <h3>Intra Oral Assessment</h3>
        <div className="sheet-option-grid">
          <OptionGroup
            label="Arch Space"
            value={assessment.archSpace}
            options={["Adequate", "Deficient"]}
            onChange={(value) => updateAssessment("archSpace", value)}
          />
          <OptionGroup
            label="Midline Deviation"
            value={assessment.midlineDeviation}
            options={["Yes", "No"]}
            onChange={(value) => updateAssessment("midlineDeviation", value)}
          />
          <OptionGroup
            label="Cross Bite"
            value={assessment.crossBite}
            options={["Yes", "No"]}
            onChange={(value) => updateAssessment("crossBite", value)}
          />
        </div>
      </section>

      <section className="sheet-section">
        <h3>Occlusal Assessment</h3>
        <div className="sheet-option-grid">
          <OptionGroup
            label="Permanent Molars"
            value={assessment.permanentMolars}
            options={["Class I", "Class II", "Class III"]}
            onChange={(value) => updateAssessment("permanentMolars", value)}
          />
          <OptionGroup
            label="Canines"
            value={assessment.canines}
            options={["Class I", "Class II", "Class III"]}
            onChange={(value) => updateAssessment("canines", value)}
          />
          <Field
            label="Over jet mm"
            value={assessment.overjet}
            onChange={(value) => updateAssessment("overjet", value)}
          />
          <Field
            label="Deep Bite mm"
            value={assessment.deepBite}
            onChange={(value) => updateAssessment("deepBite", value)}
          />
        </div>
      </section>

      <section className="sheet-section">
        <h3>Diagnosis</h3>
        <div className="diagnosis-list">
          {Array.from({ length: 7 }, (_, index) => (
            <label className="diagnosis-row" key={index}>
              <span>{index + 1}</span>
              <input value={diagnosis[index] || ""} onChange={(event) => updateDiagnosis(index, event.target.value)} />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

export function OrthodonticAdjustmentsSheet({ patientData, setPatientData }) {
  const rows = patientData.orthodonticAdjustments || [];
  const visibleRows = rows.length >= 12 ? rows : [...rows, ...blankRows(12 - rows.length)];

  const updateRow = (index, field, value) => {
    const nextRows = visibleRows.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            [field]: field === "procedure" ? capitalizeFirstWord(value) : value,
          }
        : row
    );

    setPatientData((current) => ({
      ...current,
      orthodonticAdjustments: nextRows,
    }));
  };

  const addRow = () => {
    setPatientData((current) => ({
      ...current,
      orthodonticAdjustments: [...visibleRows, {}],
    }));
  };

  return (
    <div className="specialty-sheet printable-report">
      <div className="panel-heading">
        <div>
          <h2>Monthly Adjustment Sheet</h2>
        </div>
        <button className="btn btn-dark no-print" type="button" onClick={addRow}>
          + Add Visit
        </button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table sheet-table adjustment-table">
          <thead>
            <tr>
              <th>Visit #</th>
              <th>Date</th>
              <th>Procedure</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input value={row.visit || index + 1} onChange={(event) => updateRow(index, "visit", event.target.value)} />
                </td>
                <td>
                  <input value={row.date || ""} onChange={(event) => updateRow(index, "date", event.target.value)} />
                </td>
                <td>
                  <input
                    value={row.procedure || ""}
                    onChange={(event) => updateRow(index, "procedure", event.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AcknowledgementSheet({ patientData, setPatientData }) {
  const acknowledgement = patientData.acknowledgement || {};
  const updateAcknowledgement = (field, value) =>
    updateSheet(setPatientData, "acknowledgement", field, capitalizeFirstWord(value));

  return (
    <div className="acknowledgement-sheet specialty-sheet printable-report">
      <div className="ack-document">
        <div className="ack-brand">Dr. Zafar Iqbal &amp; Associates</div>
        <div className="ack-rule" />
        <h2>ACKNOWLEDGEMENT OF RECEIPT OF INFORMATION</h2>

        <p><strong>Please read carefully and ask about anything that you do not understand.</strong></p>
        <p><strong>We will be pleased to explain it further.</strong></p>
        <p>It is the policy of this dental practice to inform patients of all procedures contemplated for them.</p>
        <p>First visit is considered as a consultation session.</p>
        <p>In this session the complete examination of hard and soft tissues of the mouth is carried out and any dental treatment needed is identified.</p>
        <p>Any other treatment needed such as fillings, RCTs, extractions, caps (fixed teeth) etc. will be performed at a separate appointment after completion of the diagnosis.</p>
        <p>Dr. Zafar Iqbal assisted by other dentists &amp; dental auxiliaries of his choice, will perform the proposed treatment or oral surgical procedures, including the use of any necessary or advisable local anesthesia, radiographs (<u>X-rays</u>) and other diagnostic aids.</p>

        <h3>Mode of Payment</h3>
        <p>The patient will be fully informed about charges of his/her dental treatment. If there is some doubt or confusion about charges then please do ask, we will be pleased to explain it.</p>
        <p>If the treatment plan is modified or changed later on, the patient will be informed for the extra amount to be paid or refund.</p>
        <p><strong>This is the policy of HDC that 100% of the calculated amount is due at the time treatment is rendered.</strong></p>
        <p>The patient or the guardian will be responsible for all the payments of all the services rendered.</p>
        <p>In case of the treatment failure, the dental team will not be responsible, as we try our level best to render the best treatment and there will be no refunds.</p>
        <p>Though in prosthetic cases, if the prosthesis <u>i.e.</u> caps, full denture or partial denture (artificial teeth) is not satisfactory, then it is our responsibility to repeat it so we get the desired results.</p>
        <p>In the interest of our clinical improvement, we reserve the right to make changes in materials &amp; consequently in charges.</p>

        <div className="ack-signature-grid">
          <Field
            label="Patient / Guardian Signature"
            value={acknowledgement.patientSignature}
            onChange={(value) => updateAcknowledgement("patientSignature", value)}
          />
          <Field
            label="Doctor / Staff Signature"
            value={acknowledgement.staffSignature}
            onChange={(value) => updateAcknowledgement("staffSignature", value)}
          />
          <Field
            label="Date"
            value={acknowledgement.date}
            onChange={(value) => updateSheet(setPatientData, "acknowledgement", "date", value)}
          />
        </div>
      </div>
    </div>
  );
}

export function FullDentureSheet({ patientData, setPatientData }) {
  const denture = patientData.fullDenture || {};
  const procedureRows = fixedProcedureRows.map((procedure, index) => ({
    procedure,
    ...(denture.clinicalProcedure?.[index] || {}),
  }));

  const updateDenture = (field, value) => updateSheet(setPatientData, "fullDenture", field, value);
  const updateProcedure = (index, field, value) => {
    const nextRows = procedureRows.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            [field]: field === "comments" ? capitalizeFirstWord(value) : value,
          }
        : row
    );

    updateDenture("clinicalProcedure", nextRows);
  };

  return (
    <div className="specialty-sheet printable-report">
      <div className="panel-heading">
        <div>
          <h2>Full Denture Sheet</h2>
        </div>
      </div>

      <BioDataGrid patientData={patientData} setPatientData={setPatientData} includeFileNo />

      <section className="sheet-section">
        <h3>Dental History</h3>
        <div className="sheet-grid">
          <Field
            label="Edentulous Months/Years"
            value={denture.edentulousDuration}
            onChange={(value) => updateDenture("edentulousDuration", value)}
          />
          <Field
            label="Reason For Loss of teeth"
            value={denture.reasonForLoss}
            onChange={(value) => updateDenture("reasonForLoss", capitalizeFirstWord(value))}
          />
          <div className="sheet-grid-wide">
            <Field
              label="Previous Dentures"
              value={denture.previousDentures}
              onChange={(value) => updateDenture("previousDentures", capitalizeFirstWord(value))}
              textarea
            />
          </div>
        </div>
      </section>

      <section className="sheet-section">
        <h3>Clinical Procedure</h3>
        <div className="data-table-wrap">
          <table className="data-table sheet-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Procedure</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {procedureRows.map((row, index) => (
                <tr key={row.procedure}>
                  <td>
                    <input value={row.date || ""} onChange={(event) => updateProcedure(index, "date", event.target.value)} />
                  </td>
                  <td>{row.procedure}</td>
                  <td>
                    <input
                      value={row.comments || ""}
                      onChange={(event) => updateProcedure(index, "comments", event.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sheet-section">
        <h3>Comments</h3>
        <Field
          label="Comments"
          value={denture.comments}
          onChange={(value) => updateDenture("comments", capitalizeFirstWord(value))}
          textarea
        />
        <Field
          label="Signature"
          value={denture.signature}
          onChange={(value) => updateDenture("signature", capitalizeFirstWord(value))}
        />
      </section>
    </div>
  );
}
