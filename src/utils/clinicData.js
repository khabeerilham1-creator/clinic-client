export const CLINIC_NAME = "HDC Dental Intelligence System";
export const DOCTOR_NAME = "Dr Zaffar Iqbal";
export const CLINIC_LOCATION = "Hayatabad, Peshawar";

export const SHIFT_OPTIONS = [
  {
    id: "morning",
    label: "Morning Shift",
    doctorName: "Dr Tufyl",
    doctorAliases: ["Dr Tufyl"],
  },
  {
    id: "evening",
    label: "Evening Shift",
    doctorName: "Dr Abdur Rehman",
    doctorAliases: ["Dr Abdur Rehman"],
  },
];

export const DEFAULT_LABS = [
  "Khyber Lab",
  "Hayat Lab",
  "Chamkani Lab",
];

export const CATEGORY_OPTIONS = [
  { key: "category1", value: "Elite (Category 1)", label: "Elite (Category 1)", patientType: "Elite" },
  { key: "category2", value: "Routine (Category 2)", label: "Routine (Category 2)", patientType: "Routine" },
  { key: "category3", value: "Non Affording (Category 3)", label: "Non Affording (Category 3)", patientType: "Non Affording" },
  { key: "category4", value: "Compassionate - Free", label: "Compassionate - Free", patientType: "Compassionate" },
];

export const normalizeCategoryKey = (category = "") => {
  const clean = String(category).toLowerCase();

  if (clean.includes("compassion") || clean.includes("free")) {
    return "category4";
  }

  if (clean.includes("3") || clean.includes("non")) {
    return "category3";
  }

  if (clean.includes("2") || clean.includes("routine")) {
    return "category2";
  }

  return "category1";
};

export const patientTypeForCategory = (category = "") =>
  CATEGORY_OPTIONS.find((option) => option.key === normalizeCategoryKey(category))?.patientType ||
  CATEGORY_OPTIONS[0].patientType;

export const SOFT_TISSUE_CONDITIONS = [
  ["Calculus", "U/S Scaling & Polishing"],
  ["Generalized Discoloration", "Bleaching or Veneers"],
  ["Generalized Gingival Recession", "U/S Scaling & Polishing, Fluoride Treatment"],
  ["Gingivitis", "u/s Scaling and Polishing"],
  ["Gingival Hyperplasia", "Gingivectomy under L/A"],
  ["Gingival Swelling", "Localized Scaling, Medication"],
  ["Juvenile Periodontitis", "U/S Scaling & Polishing"],
  ["Oral Ulcers", "Medications"],
  ["Periodontitis", "Root Planning"],
  ["Tartar Deposits", "Polishing"],
]
  .map(([condition, treatment]) => ({ condition, treatment }))
  .sort((a, b) => a.condition.localeCompare(b.condition));

export const HARD_TISSUE_CONDITIONS = [
  ["Abutment for Bridge", ""],
  ["Attrition", "Root Canal Treatment under L/A"],
  ["Class I Grossly Carious", "Root Canal Treatment under L/A"],
  ["Class I Moderate Carious", "Composite Filling"],
  ["Class II Grossly Carious", "Root Canal Treatment under L/A"],
  ["Class II Moderate Carious", "Composite Filling"],
  ["Class III Grossly Carious", "Root Canal Treatment under L/A"],
  ["Class III Moderate Carious", "Composite Filling"],
  ["Class IV Grossly Carious", "Root Canal Treatment under L/A"],
  ["Class IV Moderate Carious", "Composite Filling"],
  ["Class V Grossly Carious", "Root Canal Treatment under L/A"],
  ["Class V Moderate Carious", "Composite Filling"],
  ["BDR", "Extraction under L/A"],
  ["Discolored tooth", "Veneer"],
  ["Dislodged Filling", ""],
  ["Enamel Hypoplasia", "Veneer"],
  ["Fractured Tooth", "Surgical Extraction under L/A"],
  ["Grossly Fractured Dentine", "Pulpotomy"],
  ["Healthy", ""],
  ["Malposed", ""],
  ["Missing", "Implant or Bridge"],
  ["Pits and Fissures", "Sealants"],
  ["RCT Done", "Crown"],
  ["Shaky Grade I", "Localized Scaling, PRP"],
  ["Shaky Grade II", "Localized Scaling, PRP"],
  ["Shaky Grade III", "Extraction under L/A"],
  ["Supernumerary", "Extraction under L/A"],
  ["Unsatisfactory Bridge", ""],
  ["Unsatisfactory Crown", ""],
  ["Unsatisfactory Filling", ""],
  ["Unsatisfactory RCT Done", "Re-RCT"],
]
  .map(([condition, treatment]) => ({ condition, treatment }))
  .sort((a, b) => a.condition.localeCompare(b.condition));

export const LAB_TASK_CONDITIONS = [
  ["Bridge Preparation", "Zirconia Bridge"],
  ["Bridge Preparation", "PFM Bridge"],
  ["Complete Denture", "Acrylic Denture"],
  ["Crown Preparation", "Zirconia Crown"],
  ["Crown Preparation", "Ceramic Crown"],
  ["Impression for Braces", "Orthodontic Appliance"],
  ["Impression for Night Guard", "Hard/Soft Night Guard"],
  ["Partial Denture", "Cobalt Chrome P/D"],
  ["Post Space", "Fiber Post & Core"],
  ["Veneer Preparation", "E-Max Veneer"],
]
  .map(([condition, treatment]) => ({ condition, treatment }))
  .sort((a, b) => a.condition.localeCompare(b.condition));

export const PRICE_LIST = [
  { description: "Bleaching", category1: 50000, category2: 40000, category3: 30000 },
  { description: "Braces", category1: 150000, category2: 125000, category3: 100000 },
  { description: "Ceramic Crowns per unit", category1: 35000, category2: 30000, category3: 25000 },
  { description: "Ceramic Crowns Veneer", category1: 35000, category2: 30000, category3: 25000 },
  { description: "Cobalt Chrome P/D", category1: 50000, category2: 40000, category3: 30000 },
  { description: "Complex EXT", category1: 7500, category2: 5000, category3: 3000 },
  { description: "Composite Build Up", category1: 15000, category2: 10000, category3: 8000 },
  { description: "Dental Implants", category1: 125000, category2: 85000, category3: 65000 },
  { description: "Epulis removal", category1: 15000, category2: 12000, category3: 10000 },
  { description: "F/D Acrylic per jaw", category1: 50000, category2: 40000, category3: 35000 },
  { description: "F/D Removable per jaw", category1: 60000, category2: 50000, category3: 40000 },
  { description: "Fiber Post", category1: 5000, category2: 3000, category3: 2000 },
  { description: "General Gingivectomy", category1: 20000, category2: 15000, category3: 10000 },
  { description: "Impacted Tooth EXT", category1: 25000, category2: 15000, category3: 10000 },
  { description: "L-Gingivectomy Pulpotomy", category1: 10000, category2: 8000, category3: 6000 },
  { description: "Moderate Filling", category1: 10000, category2: 8000, category3: 6000 },
  { description: "MTA Pulpotomy", category1: 15000, category2: 10000, category3: 8000 },
  { description: "Night Guard", category1: 15000, category2: 10000, category3: 8000 },
  { description: "P/D per unit", category1: 5000, category2: 3000, category3: 2500 },
  { description: "P/D Removable per unit", category1: 7000, category2: 5000, category3: 4000 },
  { description: "Per Retainers", category1: 10000, category2: 7500, category3: 5000 },
  { description: "RCT", category1: 20000, category2: 15000, category3: 10000 },
  { description: "Root Planing", category1: 20000, category2: 15000, category3: 10000 },
  { description: "Sealants Filling", category1: 10000, category2: 8000, category3: 6000 },
  { description: "Simple EXT", category1: 5000, category2: 3000, category3: 2000 },
  { description: "Surgical EXT", category1: 15000, category2: 10000, category3: 7000 },
  { description: "U/S & Polishing", category1: 15000, category2: 10000, category3: 8000 },
].sort((a, b) => a.description.localeCompare(b.description));

export const getTreatmentPrice = (description, category) => {
  const categoryKey = normalizeCategoryKey(category);

  if (categoryKey === "category4") {
    return 0;
  }

  const item = PRICE_LIST.find(
    (entry) => entry.description.toLowerCase() === String(description).toLowerCase()
  );

  if (!item) {
    return 0;
  }

  return item[categoryKey] || 0;
};

export const treatmentOptions = PRICE_LIST.map((item) => item.description);
