import React, { useState } from "react";

// ── State colour map ───────────────────────────────────────────────────────
const STATE = {
  healthy:    { fill: "#f0f4f8", stroke: "#aac0d4", label: "Healthy"    },
  cavity:     { fill: "#FCEBEB", stroke: "#E24B4A", label: "Cavity"     },
  crown:      { fill: "#FAEEDA", stroke: "#EF9F27", label: "Crown"      },
  treated:    { fill: "#EAF3DE", stroke: "#97C459", label: "Treated"    },
  missing:    { fill: "#E6F1FB", stroke: "#378ADD", label: "Missing"    },
  extraction: { fill: "#FCEBEB", stroke: "#791F1F", label: "Extraction" },
  filling:    { fill: "#EEEDFE", stroke: "#7F77DD", label: "Filling"    },
  rct:        { fill: "#FFF3CD", stroke: "#C9A227", label: "RCT"        },
};

const MODE_BG = {
  healthy: "#3B6D11", cavity: "#A32D2D", crown: "#854F0B",
  treated: "#0C447C", missing: "#185FA5", extraction: "#791F1F",
  filling: "#3C3489", rct: "#7A6100",
};

// ── Upper teeth 1–16 (right to left) ──────────────────────────────────────
const UPPER = [
  { num: 1,  name: "Upper Right 3rd Molar",         shape: "molar"    },
  { num: 2,  name: "Upper Right 2nd Molar",         shape: "molar"    },
  { num: 3,  name: "Upper Right 1st Molar",         shape: "molar"    },
  { num: 4,  name: "Upper Right 2nd Premolar",      shape: "premolar" },
  { num: 5,  name: "Upper Right 1st Premolar",      shape: "premolar" },
  { num: 6,  name: "Upper Right Canine",            shape: "canine"   },
  { num: 7,  name: "Upper Right Lateral Incisor",   shape: "lateral"  },
  { num: 8,  name: "Upper Right Central Incisor",   shape: "central"  },
  { num: 9,  name: "Upper Left Central Incisor",    shape: "central"  },
  { num: 10, name: "Upper Left Lateral Incisor",    shape: "lateral"  },
  { num: 11, name: "Upper Left Canine",             shape: "canine"   },
  { num: 12, name: "Upper Left 1st Premolar",       shape: "premolar" },
  { num: 13, name: "Upper Left 2nd Premolar",       shape: "premolar" },
  { num: 14, name: "Upper Left 1st Molar",          shape: "molar"    },
  { num: 15, name: "Upper Left 2nd Molar",          shape: "molar"    },
  { num: 16, name: "Upper Left 3rd Molar",          shape: "molar"    },
];

// ── Lower teeth 32–17 (right to left) ─────────────────────────────────────
const LOWER = [
  { num: 32, name: "Lower Right 3rd Molar",         shape: "molar_lo"    },
  { num: 31, name: "Lower Right 2nd Molar",         shape: "molar_lo"    },
  { num: 30, name: "Lower Right 1st Molar",         shape: "molar_lo"    },
  { num: 29, name: "Lower Right 2nd Premolar",      shape: "premolar_lo" },
  { num: 28, name: "Lower Right 1st Premolar",      shape: "premolar_lo" },
  { num: 27, name: "Lower Right Canine",            shape: "canine_lo"   },
  { num: 26, name: "Lower Right Lateral Incisor",   shape: "lateral_lo"  },
  { num: 25, name: "Lower Right Central Incisor",   shape: "central_lo"  },
  { num: 24, name: "Lower Left Central Incisor",    shape: "central_lo"  },
  { num: 23, name: "Lower Left Lateral Incisor",    shape: "lateral_lo"  },
  { num: 22, name: "Lower Left Canine",             shape: "canine_lo"   },
  { num: 21, name: "Lower Left 1st Premolar",       shape: "premolar_lo" },
  { num: 20, name: "Lower Left 2nd Premolar",       shape: "premolar_lo" },
  { num: 19, name: "Lower Left 1st Molar",          shape: "molar_lo"    },
  { num: 18, name: "Lower Left 2nd Molar",          shape: "molar_lo"    },
  { num: 17, name: "Lower Left 3rd Molar",          shape: "molar_lo"    },
];

// ── SVG tooth shapes ───────────────────────────────────────────────────────
function ToothSVG({ shape, fill, stroke, selected }) {
  const sw = selected ? 2 : 1.2;
  const p = { fill, stroke, strokeWidth: sw };

  const shapes = {
    // UPPER
    central:     <svg viewBox="0 0 26 54" style={{ display:"block" }}><path d="M5,4 Q13,1 21,4 L22,30 Q20,46 13,52 Q6,46 4,30 Z" {...p}/><path d="M6,5 Q13,3 20,5 L21,16 Q13,13 5,16 Z" fill={stroke} opacity="0.18"/></svg>,
    lateral:     <svg viewBox="0 0 23 52" style={{ display:"block" }}><path d="M5,5 Q11,2 17,5 L18,28 Q17,43 11,49 Q5,43 4,28 Z" {...p}/><path d="M5,6 Q11,4 17,6 L18,15 Q11,13 4,15 Z" fill={stroke} opacity="0.18"/></svg>,
    canine:      <svg viewBox="0 0 22 58" style={{ display:"block" }}><path d="M5,4 Q11,1 17,4 L17,24 Q15,44 11,55 Q7,44 5,24 Z" {...p}/><path d="M5,5 Q11,3 17,5 L17,15 Q11,13 5,15 Z" fill={stroke} opacity="0.18"/></svg>,
    premolar:    <svg viewBox="0 0 28 54" style={{ display:"block" }}><path d="M4,10 Q14,5 24,10 L23,33 Q21,47 14,52 Q7,47 5,33 Z" {...p}/><ellipse cx="9" cy="9" rx="4" ry="5" {...p}/><ellipse cx="19" cy="9" rx="4" ry="5" {...p}/><line x1="5" y1="12" x2="23" y2="12" stroke={stroke} strokeWidth="0.6" opacity="0.4"/></svg>,
    molar:       <svg viewBox="0 0 32 54" style={{ display:"block" }}><path d="M3,12 Q16,5 29,12 L28,35 Q26,49 16,53 Q6,49 4,35 Z" {...p}/><ellipse cx="8" cy="10" rx="5" ry="6" {...p}/><ellipse cx="16" cy="7" rx="4" ry="5" {...p}/><ellipse cx="24" cy="10" rx="5" ry="6" {...p}/><line x1="4" y1="14" x2="28" y2="14" stroke={stroke} strokeWidth="0.6" opacity="0.4"/></svg>,
    // LOWER
    central_lo:  <svg viewBox="0 0 26 54" style={{ display:"block" }}><path d="M4,24 Q6,8 13,2 Q20,8 22,24 L21,46 Q17,52 13,52 Q9,52 5,46 Z" {...p}/><path d="M5,45 Q13,49 21,45 L20,36 Q13,39 6,36 Z" fill={stroke} opacity="0.18"/></svg>,
    lateral_lo:  <svg viewBox="0 0 23 52" style={{ display:"block" }}><path d="M4,22 Q6,8 11,2 Q16,8 18,22 L17,44 Q14,50 11,50 Q8,50 5,44 Z" {...p}/><path d="M5,43 Q11,47 17,43 L16,35 Q11,38 6,35 Z" fill={stroke} opacity="0.18"/></svg>,
    canine_lo:   <svg viewBox="0 0 22 58" style={{ display:"block" }}><path d="M4,24 Q5,7 11,1 Q17,7 18,24 L17,49 Q14,56 11,56 Q8,56 5,49 Z" {...p}/></svg>,
    premolar_lo: <svg viewBox="0 0 28 54" style={{ display:"block" }}><path d="M5,20 Q14,10 23,20 L22,44 Q20,52 14,53 Q8,52 6,44 Z" {...p}/><ellipse cx="9" cy="20" rx="4" ry="5" {...p}/><ellipse cx="19" cy="20" rx="4" ry="5" {...p}/><line x1="5" y1="22" x2="23" y2="22" stroke={stroke} strokeWidth="0.6" opacity="0.4"/></svg>,
    molar_lo:    <svg viewBox="0 0 32 54" style={{ display:"block" }}><path d="M4,22 Q16,12 28,22 L27,44 Q24,53 16,54 Q8,53 5,44 Z" {...p}/><ellipse cx="8" cy="22" rx="5" ry="6" {...p}/><ellipse cx="16" cy="19" rx="4" ry="5" {...p}/><ellipse cx="24" cy="22" rx="5" ry="6" {...p}/><line x1="4" y1="24" x2="28" y2="24" stroke={stroke} strokeWidth="0.6" opacity="0.4"/></svg>,
  };

  return shapes[shape] || shapes["molar"];
}

// ── Main ToothChart component ──────────────────────────────────────────────
export default function ToothChart({ patientData, setPatientData }) {
  const toothStates = patientData?.toothStates || {};
  const [mode, setMode]       = useState("cavity");
  const [selected, setSelected] = useState(null);
  const [notes, setNotes]     = useState(patientData?.toothNotes || "");

  const allTeeth = [...UPPER, ...LOWER];

  const clickTooth = (tooth) => {
    const newStates = { ...toothStates, [tooth.num]: mode };
    setSelected(tooth);
    setPatientData((prev) => ({ ...prev, toothStates: newStates }));
  };

  const clearTooth = (num) => {
    const newStates = { ...toothStates };
    delete newStates[num];
    setPatientData((prev) => ({ ...prev, toothStates: newStates }));
    setSelected(null);
  };

  const clearAll = () => {
    if (!window.confirm("Clear all tooth markings?")) return;
    setPatientData((prev) => ({ ...prev, toothStates: {} }));
    setSelected(null);
  };

  const saveNotes = (val) => {
    setNotes(val);
    setPatientData((prev) => ({ ...prev, toothNotes: val }));
  };

  const markedCount = Object.keys(toothStates).length;
  const selState    = selected ? (toothStates[selected.num] || "healthy") : null;

  const JawRow = ({ teeth, numPos }) => (
    <div style={{ display: "flex", gap: "3px", justifyContent: "center", overflowX: "auto", paddingBottom: "4px" }}>
      {teeth.map((t) => {
        const st  = toothStates[t.num] || "healthy";
        const c   = STATE[st];
        const sel = selected?.num === t.num;
        return (
          <div
            key={t.num}
            title={`${t.name} — ${c.label}`}
            onClick={() => clickTooth(t)}
            role="button"
            tabIndex={0}
            aria-label={`Tooth ${t.num}: ${t.name}, ${c.label}`}
            onKeyDown={(e) => e.key === "Enter" && clickTooth(t)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
              cursor: "pointer", borderRadius: "6px", padding: "3px",
              background: sel ? "#E6F1FB" : "transparent",
              outline: sel ? "2px solid #185FA5" : "2px solid transparent",
              transition: "all .12s",
            }}
          >
            {numPos === "top" && (
              <span style={{ fontSize: "8px", color: sel ? "#0C447C" : "#94a3b8", fontWeight: sel ? "700" : "400", lineHeight: 1 }}>{t.num}</span>
            )}
            <div style={{ width: "22px" }}>
              <ToothSVG shape={t.shape} fill={c.fill} stroke={c.stroke} selected={sel} />
            </div>
            {numPos === "bottom" && (
              <span style={{ fontSize: "8px", color: sel ? "#0C447C" : "#94a3b8", fontWeight: sel ? "700" : "400", lineHeight: 1 }}>{t.num}</span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      {/* Section title */}
      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" }}>
          🦷 Interactive Tooth Chart
        </h2>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
          Select a condition mode, then click any tooth to mark it. Click again to change.
        </p>
      </div>

      {/* Mode selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Mark as:</span>
        {Object.entries(STATE).map(([key]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            style={{
              padding: "5px 13px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
              cursor: "pointer", border: "1.5px solid",
              background: mode === key ? MODE_BG[key] : "#fff",
              borderColor: mode === key ? MODE_BG[key] : "#e2e8f0",
              color: mode === key ? "#fff" : "#64748b",
              transition: "all .12s",
            }}
          >
            {STATE[key].label}
          </button>
        ))}
        {markedCount > 0 && (
          <button
            onClick={clearAll}
            style={{ marginLeft: "auto", padding: "5px 13px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "1.5px solid #f09595", background: "#FCEBEB", color: "#791F1F" }}
          >
            Clear all ({markedCount})
          </button>
        )}
      </div>

      {/* Chart */}
      <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "16px 10px", border: "1px solid #e8ecf0", marginBottom: "14px" }}>
        <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "6px", paddingLeft: "4px" }}>Upper jaw (maxillary) · 1–16</div>
        <JawRow teeth={UPPER} numPos="top" />

        <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "10px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
          <span style={{ fontSize: "9.5px", color: "#94a3b8", whiteSpace: "nowrap" }}>midline</span>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
        </div>

        <JawRow teeth={LOWER} numPos="bottom" />
        <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "6px", textAlign: "right", paddingRight: "4px" }}>Lower jaw (mandibular) · 17–32</div>
      </div>

      {/* Selected tooth detail */}
      {selected ? (
        <div style={{ background: "#E6F1FB", border: "1px solid #B5D4F4", borderRadius: "12px", padding: "12px 16px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "22px" }}>🦷</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "700", color: "#0C447C", fontSize: "13.5px" }}>{selected.name} — Tooth #{selected.num}</div>
            <div style={{ fontSize: "12px", color: "#185FA5", marginTop: "2px" }}>
              Marked as: <b>{STATE[selState]?.label}</b>
            </div>
          </div>
          <button
            onClick={() => clearTooth(selected.num)}
            style={{ background: "#fff", border: "1px solid #B5D4F4", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", fontSize: "12px", color: "#0C447C", fontWeight: "600" }}
          >
            Reset tooth
          </button>
        </div>
      ) : (
        <div style={{ background: "#f8fafc", border: "1px dashed #e2e8f0", borderRadius: "12px", padding: "10px 16px", marginBottom: "14px", fontSize: "12.5px", color: "#94a3b8", textAlign: "center" }}>
          Click any tooth to select it and mark its condition
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}>
        {Object.entries(STATE).map(([key, val]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11.5px", color: "#64748b" }}>
            <div style={{ width: "11px", height: "11px", borderRadius: "2px", background: val.fill, border: `1px solid ${val.stroke}`, flexShrink: 0 }} />
            {val.label}
          </div>
        ))}
      </div>

      {/* Marked teeth summary */}
      {markedCount > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e8ecf0", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
          <div style={{ fontWeight: "600", fontSize: "13px", color: "#0f172a", marginBottom: "8px" }}>
            📋 Marked teeth ({markedCount})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {Object.entries(toothStates).map(([num, state]) => {
              const t = [...UPPER, ...LOWER].find(t => t.num === Number(num));
              const c = STATE[state];
              return (
                <span key={num} style={{ background: c.fill, border: `1px solid ${c.stroke}`, borderRadius: "8px", padding: "3px 10px", fontSize: "11.5px", color: c.stroke, fontWeight: "600", cursor: "pointer" }}
                  onClick={() => { setSelected(t); }}
                  title={t?.name}
                >
                  #{num} {c.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart notes */}
      <div>
        <label style={{ display: "block", fontWeight: "600", fontSize: "13px", color: "#0f172a", marginBottom: "6px" }}>
          Tooth chart notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => saveNotes(e.target.value)}
          placeholder="Add any observations, e.g. sensitivity, mobility, discolouration…"
          rows={3}
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", fontFamily: "inherit", outline: "none", resize: "vertical", color: "#0f172a", lineHeight: "1.6" }}
        />
      </div>
    </div>
  );
}