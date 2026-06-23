export const CLINIC_NAME = "HDC Dental & Aesthetics";
export const DOCTOR_NAME = "Dr Zaffar Iqbal";
export const CLINIC_LOCATION = "Hayatabad, Peshawar";

export const SHIFT_OPTIONS = [
  {
    id: "morning",
    label: "Morning Shift",
    doctorName: "Dr Tufyl",
    password: "12345",
  },
  {
    id: "evening",
    label: "Evening Shift",
    doctorName: "Dr Abdur Rehman",
    password: "6789",
  },
];

export const DEFAULT_LABS = [
  "Khyber Lab",
  "Hayat Lab",
  "Chamkani Lab",
];

export const CATEGORY_OPTIONS = [
  { key: "category1", value: "Category 1 - Affording", label: "Category 1 - Affording" },
  { key: "category2", value: "Category 2 - Non Affording", label: "Category 2 - Non Affording" },
  { key: "category3", value: "Category 3 - Compassionate", label: "Category 3 - Compassionate" },
];

export const normalizeCategoryKey = (category = "") => {
  const clean = String(category).toLowerCase();

  if (clean.includes("2") || clean.includes("non")) {
    return "category2";
  }

  if (clean.includes("3") || clean.includes("compassion")) {
    return "category3";
  }

  return "category1";
};

export const SOFT_TISSUE_CONDITIONS = [
  ["Gingivitis", "u/s Scaling and Polishing"],
  ["Periodontitis", "Root Planning"],
  ["Generalized Gingival Recession", "u/s Scaling & Polishing, Fluoride treatment"],
  ["Oral ulcers", "Medications"],
  ["Calculus", "u/s Scaling & Polishing"],
  ["Tar Tar deposits", "Polishing"],
  ["Juvenile Periodontitis", "u/s Scaling & Polishing"],
  ["Gingival Hyperplasia", "Gingivectomy under L/A"],
  ["Gingival Swelling", "Localised Scaling, Medication"],
  ["Generalized Discoloration", "Bleaching or Veneers"],
].map(([condition, treatment]) => ({ condition, treatment }));

export const HARD_TISSUE_CONDITIONS = [
  ["Pits and Fissures", "Sealents"],
  ["Class I Moderate Carious", "Composite Filling"],
  ["Class I Grossly Carious", "Root Canal Treatment under L/A"],
  ["Class II Moderate Carious", "Composite Filling"],
  ["Class II Grossly Carious", "Root Canal Treatment under L/A"],
  ["Class III Moderate Carious", "Composite Filling"],
  ["Class III Grossly Carious", "Root Canal Treatment under L/A"],
  ["Class IV Moderate Carious", "Composite Filling"],
  ["Class IV Grossly Carious", "Root Canal Treatment under L/A"],
  ["Class V Moderate Carious", "Composite Filling"],
  ["Class V Grossly Carious", "Root Canal Treatment under L/A"],
  ["Attrition", "Root Canal Treatment under L/A"],
  ["Shaky Grade I", "Localized scaling, PRP"],
  ["Shaky Grade II", "Localized scaling, PRP"],
  ["Shaky Grade III", "Extraction under L/A"],
  ["BDR", "Extraction under L/A"],
  ["Fractured Tooth", "Surgical extraction under L/A"],
  ["Grossly Fractured Dentine", "Pulpotomy"],
  ["Missing", "Implant or Bridge"],
  ["RCTed", "Crown"],
  ["Supranumery", "Extraction under L/A"],
  ["Malposed", ""],
  ["Enameloplasia", "Veneer"],
  ["Discolored tooth", "Veneer"],
  ["Unsatisfactory RCT done", "Re-RCT"],
  ["Unsatisfactory Crown", ""],
  ["Unsatisfactory Bridge", ""],
  ["Dislodged Filling", ""],
  ["Unsatisfactory Filling", ""],
  ["Healthy", ""],
  ["Abutment for Bridge", ""],
].map(([condition, treatment]) => ({ condition, treatment }));

export const PRICE_LIST = [
  { description: "U/S & Polishing", category1: 15000, category2: 10000, category3: 8000 },
  { description: "Root planing", category1: 20000, category2: 15000, category3: 10000 },
  { description: "L-Gingivectomy Pulpotomy", category1: 10000, category2: 8000, category3: 6000 },
  { description: "g-Gingivectomy", category1: 20000, category2: 15000, category3: 10000 },
  { description: "Epulis removal", category1: 15000, category2: 12000, category3: 10000 },
  { description: "Simple EXT", category1: 5000, category2: 3000, category3: 2000 },
  { description: "Complex EXT", category1: 7500, category2: 5000, category3: 3000 },
  { description: "Surgical EXT", category1: 15000, category2: 10000, category3: 7000 },
  { description: "Impacted tooth EXT", category1: 25000, category2: 15000, category3: 10000 },
  { description: "Sealants Filling", category1: 10000, category2: 8000, category3: 6000 },
  { description: "Modulate Filling", category1: 10000, category2: 8000, category3: 6000 },
  { description: "Composite Build up", category1: 15000, category2: 10000, category3: 8000 },
  { description: "Fiber Post", category1: 5000, category2: 3000, category3: 2000 },
  { description: "RCT", category1: 20000, category2: 15000, category3: 10000 },
  { description: "MTA Pulpotomy", category1: 15000, category2: 10000, category3: 8000 },
  { description: "Dental Implants", category1: 125000, category2: 85000, category3: 65000 },
  { description: "Bleaching", category1: 50000, category2: 40000, category3: 30000 },
  { description: "Ceramic Crowns Veneer", category1: 35000, category2: 30000, category3: 25000 },
  { description: "Ceramic Crowns per unit", category1: 35000, category2: 30000, category3: 25000 },
  { description: "F/D molobly per jaw", category1: 60000, category2: 50000, category3: 40000 },
  { description: "P/D Molobly per unit", category1: 7000, category2: 5000, category3: 4000 },
  { description: "F/D Acrylic per jaw", category1: 50000, category2: 40000, category3: 35000 },
  { description: "P/D per unit", category1: 5000, category2: 3000, category3: 2500 },
  { description: "Coblot chrome P/D", category1: 50000, category2: 40000, category3: 30000 },
  { description: "Braces", category1: 150000, category2: 125000, category3: 100000 },
  { description: "Per Retainers", category1: 10000, category2: 7500, category3: 5000 },
  { description: "Night guard", category1: 15000, category2: 10000, category3: 8000 },
];

export const getTreatmentPrice = (description, category) => {
  const item = PRICE_LIST.find(
    (entry) => entry.description.toLowerCase() === String(description).toLowerCase()
  );

  if (!item) {
    return 0;
  }

  return item[normalizeCategoryKey(category)] || 0;
};

export const treatmentOptions = PRICE_LIST.map((item) => item.description);
