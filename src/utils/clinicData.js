export const CLINIC_NAME = "HDC Dental Intelligence System";
export const DOCTOR_NAME = "Dr Zaffar Iqbal";
export const CLINIC_LOCATION = "Hayatabad, Peshawar";

export const SHIFT_OPTIONS = [
  {
    id: "morning",
    label: "Morning Shift",
    serviceLabel: "Dental",
    doctorName: "Dr Tufyl",
    doctorAliases: ["Dr Tufyl"],
  },
  {
    id: "evening",
    label: "Evening Shift",
    serviceLabel: "Aesthetics",
    doctorName: "Dr Abdur Rehman",
    doctorAliases: ["Dr Abdur Rehman"],
  },
];

export const DEFAULT_LABS = [
  "Hayat Lab",
  "Khyber Lab",
  "Other",
];

export const CATEGORY_OPTIONS = [
  { key: "category1", value: "Standard", label: "Standard", patientType: "Case" },
];

export const DEPARTMENT_OPTIONS = [
  { id: "routine", label: "Comprehensive" },
  { id: "singleTooth", label: "Single Tooth" },
  { id: "implant", label: "Dental Implant" },
  { id: "orthodontic", label: "Orthodontic" },
  { id: "peads", label: "Peads" },
  { id: "fullDenture", label: "Full Denture" },
  { id: "smileMakeovers", label: "Smile Makeover" },
  { id: "cosmatics", label: "Cosmetic" },
  { id: "surgical", label: "Surgical" },
];

export const departmentLabel = (sheetType = "") =>
  DEPARTMENT_OPTIONS.find((department) => department.id === sheetType)?.label || "Comprehensive";

export const REFERRAL_ROLE_OPTIONS = [
  { value: "", label: "No Referral", code: "" },
  { value: "dentist", label: "Dentist", code: "D" },
  { value: "assistant-manager", label: "Assistant Manager", code: "A" },
  { value: "assistant", label: "Assistant", code: "A" },
  { value: "office-boy", label: "Office Boy", code: "O" },
  { value: "receptionist", label: "Receptionist", code: "R" },
  { value: "other", label: "Other", code: "" },
];

export const referralCodeForRole = (role = "") =>
  REFERRAL_ROLE_OPTIONS.find((option) => option.value === role)?.code || "";

export const referralRoleFromCode = (code = "") => {
  const cleanCode = String(code || "").replace(/[()]/g, "").trim().toUpperCase();

  if (!cleanCode) {
    return "";
  }

  return REFERRAL_ROLE_OPTIONS.find((option) => option.code === cleanCode)?.label || "";
};

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

export const PRICE_LIST_SECTIONS = [
  {
    section: "Consultation",
    items: [
      ["Consultation", 1000],
    ],
  },
  {
    section: "Soft tissues treatment modalities",
    items: [
      ["u/s Scaling & Polishing", 10000],
      ["Root Planning", 20000],
      ["Localized Gingivectomy", 10000],
      ["Generalized Gingivectomy", 20000],
      ["Epulis surgical removal", 15000],
      ["Crown lengthning", 5000],
    ],
  },
  {
    section: "Tooth Fillings",
    items: [
      ["Sealants", 6000],
      ["Moderate Composite Filling", 7500],
      ["Composite Build up", 10000],
      ["Fibre Post", 2500],
      ["Dycal", 5000],
    ],
  },
  {
    section: "Root canal treatment",
    items: [
      ["Posterior teeth (premolars & molars)", 25000],
      ["Anterior teeth (incisors & canines)", 20000],
      ["Pulpotomy permanent tooth", 20000],
      ["Pulpotomy Paeds", 15000],
    ],
  },
  {
    section: "Tooth Extraction",
    items: [
      ["Simple Extraction", 5000],
      ["BDR extraction", 7500],
      ["Complex extraction", 10000],
      ["Surgical extraction", 15000],
      ["Wisdom tooth extraction", 20000],
      ["Apicectomy", 15000],
    ],
  },
  {
    section: "Crowns & Bridges",
    items: [
      ["PFM crown", 10000],
      ["Zirconia/Ceramic grade I", 25000],
      ["Zirconia/Ceramic grade II", 15000],
      ["Overlay ceramic", 35000],
      ["Veneer ceramic", 35000],
    ],
  },
  {
    section: "Dental Implants",
    items: [
      ["Turkish Mode", 65000],
      ["Swiss Izen", 85000],
    ],
  },
  {
    section: "Acrylic Removable teeth",
    items: [
      ["Simple Partial Denture", 5000],
      ["Molloplast Partial denture", 7500],
      ["Simple Full Denture", "50000/jaw"],
      ["Molloplast Full Denture", 65000],
      ["Cobolt Chrome Partial denture", 45000],
      ["Night Guard", "15000/jaw"],
    ],
  },
  {
    section: "Cosmetic",
    items: [
      ["LED tooth whitening system", 40000],
      ["Dental Jewellary", "??"],
    ],
  },
];

export const PRICE_LIST = PRICE_LIST_SECTIONS.flatMap(({ section, items }) =>
  items.map(([description, price]) => ({
    section,
    description,
    price,
  }))
);

export const treatmentPriceValue = (price) => {
  if (typeof price === "number") {
    return price;
  }

  const numeric = String(price || "").match(/\d+/);

  return numeric ? Number(numeric[0]) : 0;
};

export const getTreatmentPrice = (description) => {
  const item = PRICE_LIST.find(
    (entry) => entry.description.toLowerCase() === String(description).toLowerCase()
  );

  if (!item) {
    return 0;
  }

  return treatmentPriceValue(item.price);
};

export const treatmentOptions = PRICE_LIST.map((item) => item.description);
