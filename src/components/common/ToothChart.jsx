import React from "react";

const UPPER = [
  { num: 1, name: "Upper Right 3rd Molar", shape: "molar" },
  { num: 2, name: "Upper Right 2nd Molar", shape: "molar" },
  { num: 3, name: "Upper Right 1st Molar", shape: "molar" },
  { num: 4, name: "Upper Right 2nd Premolar", shape: "premolar" },
  { num: 5, name: "Upper Right 1st Premolar", shape: "premolar" },
  { num: 6, name: "Upper Right Canine", shape: "canine" },
  { num: 7, name: "Upper Right Lateral Incisor", shape: "lateral" },
  { num: 8, name: "Upper Right Central Incisor", shape: "central" },
  { num: 9, name: "Upper Left Central Incisor", shape: "central" },
  { num: 10, name: "Upper Left Lateral Incisor", shape: "lateral" },
  { num: 11, name: "Upper Left Canine", shape: "canine" },
  { num: 12, name: "Upper Left 1st Premolar", shape: "premolar" },
  { num: 13, name: "Upper Left 2nd Premolar", shape: "premolar" },
  { num: 14, name: "Upper Left 1st Molar", shape: "molar" },
  { num: 15, name: "Upper Left 2nd Molar", shape: "molar" },
  { num: 16, name: "Upper Left 3rd Molar", shape: "molar" },
];

const LOWER = [
  { num: 32, name: "Lower Right 3rd Molar", shape: "molar_lo" },
  { num: 31, name: "Lower Right 2nd Molar", shape: "molar_lo" },
  { num: 30, name: "Lower Right 1st Molar", shape: "molar_lo" },
  { num: 29, name: "Lower Right 2nd Premolar", shape: "premolar_lo" },
  { num: 28, name: "Lower Right 1st Premolar", shape: "premolar_lo" },
  { num: 27, name: "Lower Right Canine", shape: "canine_lo" },
  { num: 26, name: "Lower Right Lateral Incisor", shape: "lateral_lo" },
  { num: 25, name: "Lower Right Central Incisor", shape: "central_lo" },
  { num: 24, name: "Lower Left Central Incisor", shape: "central_lo" },
  { num: 23, name: "Lower Left Lateral Incisor", shape: "lateral_lo" },
  { num: 22, name: "Lower Left Canine", shape: "canine_lo" },
  { num: 21, name: "Lower Left 1st Premolar", shape: "premolar_lo" },
  { num: 20, name: "Lower Left 2nd Premolar", shape: "premolar_lo" },
  { num: 19, name: "Lower Left 1st Molar", shape: "molar_lo" },
  { num: 18, name: "Lower Left 2nd Molar", shape: "molar_lo" },
  { num: 17, name: "Lower Left 3rd Molar", shape: "molar_lo" },
];

const ALL_TEETH = [...UPPER, ...LOWER];
const ALL_TOOTH_NUMBERS = ALL_TEETH.map((tooth) => tooth.num);

const normalizeSelection = (selection) => {
  const values = Array.isArray(selection)
    ? selection
    : String(selection || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const numeric = values
    .map((item) => Number(item))
    .filter((item) => ALL_TOOTH_NUMBERS.includes(item));

  return ALL_TOOTH_NUMBERS.filter((toothNo) => numeric.includes(toothNo));
};

function ToothSVG({ shape, selected }) {
  const fill = selected ? "#E6F1FB" : "#f8fafc";
  const stroke = selected ? "#185FA5" : "#64748b";
  const p = { fill, stroke, strokeWidth: selected ? 2 : 1.2 };

  const shapes = {
    central: <svg viewBox="0 0 26 54" style={{ display: "block" }}><path d="M5,4 Q13,1 21,4 L22,30 Q20,46 13,52 Q6,46 4,30 Z" {...p} /><path d="M6,5 Q13,3 20,5 L21,16 Q13,13 5,16 Z" fill={stroke} opacity="0.18" /></svg>,
    lateral: <svg viewBox="0 0 23 52" style={{ display: "block" }}><path d="M5,5 Q11,2 17,5 L18,28 Q17,43 11,49 Q5,43 4,28 Z" {...p} /><path d="M5,6 Q11,4 17,6 L18,15 Q11,13 4,15 Z" fill={stroke} opacity="0.18" /></svg>,
    canine: <svg viewBox="0 0 22 58" style={{ display: "block" }}><path d="M5,4 Q11,1 17,4 L17,24 Q15,44 11,55 Q7,44 5,24 Z" {...p} /><path d="M5,5 Q11,3 17,5 L17,15 Q11,13 5,15 Z" fill={stroke} opacity="0.18" /></svg>,
    premolar: <svg viewBox="0 0 28 54" style={{ display: "block" }}><path d="M4,10 Q14,5 24,10 L23,33 Q21,47 14,52 Q7,47 5,33 Z" {...p} /><ellipse cx="9" cy="9" rx="4" ry="5" {...p} /><ellipse cx="19" cy="9" rx="4" ry="5" {...p} /><line x1="5" y1="12" x2="23" y2="12" stroke={stroke} strokeWidth="0.6" opacity="0.4" /></svg>,
    molar: <svg viewBox="0 0 32 54" style={{ display: "block" }}><path d="M3,12 Q16,5 29,12 L28,35 Q26,49 16,53 Q6,49 4,35 Z" {...p} /><ellipse cx="8" cy="10" rx="5" ry="6" {...p} /><ellipse cx="16" cy="7" rx="4" ry="5" {...p} /><ellipse cx="24" cy="10" rx="5" ry="6" {...p} /><line x1="4" y1="14" x2="28" y2="14" stroke={stroke} strokeWidth="0.6" opacity="0.4" /></svg>,
    central_lo: <svg viewBox="0 0 26 54" style={{ display: "block" }}><path d="M4,24 Q6,8 13,2 Q20,8 22,24 L21,46 Q17,52 13,52 Q9,52 5,46 Z" {...p} /><path d="M5,45 Q13,49 21,45 L20,36 Q13,39 6,36 Z" fill={stroke} opacity="0.18" /></svg>,
    lateral_lo: <svg viewBox="0 0 23 52" style={{ display: "block" }}><path d="M4,22 Q6,8 11,2 Q16,8 18,22 L17,44 Q14,50 11,50 Q8,50 5,44 Z" {...p} /><path d="M5,43 Q11,47 17,43 L16,35 Q11,38 6,35 Z" fill={stroke} opacity="0.18" /></svg>,
    canine_lo: <svg viewBox="0 0 22 58" style={{ display: "block" }}><path d="M4,24 Q5,7 11,1 Q17,7 18,24 L17,49 Q14,56 11,56 Q8,56 5,49 Z" {...p} /></svg>,
    premolar_lo: <svg viewBox="0 0 28 54" style={{ display: "block" }}><path d="M5,20 Q14,10 23,20 L22,44 Q20,52 14,53 Q8,52 6,44 Z" {...p} /><ellipse cx="9" cy="20" rx="4" ry="5" {...p} /><ellipse cx="19" cy="20" rx="4" ry="5" {...p} /><line x1="5" y1="22" x2="23" y2="22" stroke={stroke} strokeWidth="0.6" opacity="0.4" /></svg>,
    molar_lo: <svg viewBox="0 0 32 54" style={{ display: "block" }}><path d="M4,22 Q16,12 28,22 L27,44 Q24,53 16,54 Q8,53 5,44 Z" {...p} /><ellipse cx="8" cy="22" rx="5" ry="6" {...p} /><ellipse cx="16" cy="19" rx="4" ry="5" {...p} /><ellipse cx="24" cy="22" rx="5" ry="6" {...p} /><line x1="4" y1="24" x2="28" y2="24" stroke={stroke} strokeWidth="0.6" opacity="0.4" /></svg>,
  };

  return shapes[shape] || shapes.molar;
}

export default function ToothChart({ patientData, setPatientData, onToothSelect, selectedToothNos, hideNotes }) {
  const notes = patientData?.toothNotes || "";
  const selectedNumbers = normalizeSelection(
    selectedToothNos !== undefined
      ? selectedToothNos
      : (patientData?.checkup?.selectedToothNos || patientData?.checkup?.selectedToothNo)
  );
  const selectedCount = selectedNumbers.length;

  const clickTooth = (tooth) => {
    const nextNumbers = selectedNumbers.includes(tooth.num)
      ? selectedNumbers.filter((toothNo) => toothNo !== tooth.num)
      : ALL_TOOTH_NUMBERS.filter((toothNo) => [...selectedNumbers, tooth.num].includes(toothNo));

    onToothSelect?.(nextNumbers.map(String), tooth);
  };

  const selectAllTeeth = () => {
    onToothSelect?.(ALL_TOOTH_NUMBERS.map(String));
  };

  const clearSelection = () => {
    onToothSelect?.([]);
  };

  const saveNotes = (value) => {
    setPatientData((prev) => ({ ...prev, toothNotes: value }));
  };

  const JawRow = ({ teeth, numPos }) => (
    <div style={{ display: "flex", gap: "3px", justifyContent: "center", overflowX: "auto", paddingBottom: "4px" }}>
      {teeth.map((tooth) => {
        const isSelected = selectedNumbers.includes(tooth.num);

        return (
          <div
            key={tooth.num}
            title={tooth.name}
            onClick={() => clickTooth(tooth)}
            role="button"
            tabIndex={0}
            aria-label={`Select tooth ${tooth.num}: ${tooth.name}`}
            onKeyDown={(event) => event.key === "Enter" && clickTooth(tooth)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              cursor: "pointer",
              borderRadius: "6px",
              padding: "3px",
              background: isSelected ? "#E6F1FB" : "transparent",
              outline: isSelected ? "2px solid #185FA5" : "2px solid transparent",
              transition: "all .12s",
            }}
          >
            {numPos === "top" && (
              <span style={{ fontSize: "8px", color: isSelected ? "#0C447C" : "#94a3b8", fontWeight: isSelected ? "700" : "400", lineHeight: 1 }}>{tooth.num}</span>
            )}
            <div style={{ width: "22px" }}>
              <ToothSVG shape={tooth.shape} selected={isSelected} />
            </div>
            {numPos === "bottom" && (
              <span style={{ fontSize: "8px", color: isSelected ? "#0C447C" : "#94a3b8", fontWeight: isSelected ? "700" : "400", lineHeight: 1 }}>{tooth.num}</span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" }}>
          Tooth Selection Chart
        </h2>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
          Click any tooth to select it for the hard tissue entry below. The same tooth can be selected and added repeatedly.
        </p>
      </div>

      <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "16px 10px", border: "1px solid #e8ecf0", marginBottom: "14px" }}>
        <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "6px", paddingLeft: "4px" }}>Upper jaw (maxillary) 1-16</div>
        <JawRow teeth={UPPER} numPos="top" />

        <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "10px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
          <span style={{ fontSize: "9.5px", color: "#94a3b8", whiteSpace: "nowrap" }}>midline</span>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
        </div>

        <JawRow teeth={LOWER} numPos="bottom" />
        <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "6px", textAlign: "right", paddingRight: "4px" }}>Lower jaw (mandibular) 17-32</div>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "0 0 14px" }}>
        <button className="btn btn-primary btn-sm" type="button" onClick={selectAllTeeth}>
          Select all 32 teeth
        </button>
        <button className="btn btn-sm" type="button" onClick={clearSelection}>
          Clear selection
        </button>
      </div>

      {selectedCount > 0 ? (
        <div style={{ background: "#E6F1FB", border: "1px solid #B5D4F4", borderRadius: "12px", padding: "12px 16px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "700", color: "#0C447C", fontSize: "13.5px" }}>
              {selectedCount === 32
                ? "All 32 teeth selected"
                : `${selectedCount} tooth${selectedCount === 1 ? "" : "s"} selected`}
            </div>
            <div style={{ fontSize: "12px", color: "#185FA5", marginTop: "2px" }}>
              {selectedCount === 32
                ? "Ready for full-mouth hard tissue entry."
                : selectedNumbers.map((toothNo) => `#${toothNo}`).join(", ")}
            </div>
          </div>
          <button
            onClick={clearSelection}
            type="button"
            style={{ background: "#fff", border: "1px solid #B5D4F4", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", fontSize: "12px", color: "#0C447C", fontWeight: "600" }}
          >
            Clear selection
          </button>
        </div>
      ) : (
        <div style={{ background: "#f8fafc", border: "1px dashed #e2e8f0", borderRadius: "12px", padding: "10px 16px", marginBottom: "14px", fontSize: "12.5px", color: "#94a3b8", textAlign: "center" }}>
          Click one or more teeth to select them
        </div>
      )}

      {!hideNotes && (
        <div>
          <label style={{ display: "block", fontWeight: "600", fontSize: "13px", color: "#0f172a", marginBottom: "6px" }}>
            Tooth chart notes
          </label>
          <textarea
            value={notes}
            onChange={(event) => saveNotes(event.target.value)}
            placeholder="Add any observations, e.g. sensitivity, mobility, discolouration..."
            rows={3}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", fontFamily: "inherit", outline: "none", resize: "vertical", color: "#0f172a", lineHeight: "1.6" }}
          />
        </div>
      )}
    </div>
  );
}
