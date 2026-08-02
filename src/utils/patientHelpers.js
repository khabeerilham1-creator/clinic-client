import {
  departmentLabel,
  referralCodeForRole,
  referralRoleFromCode,
  SHIFT_OPTIONS,
} from "./clinicData";

export const patientArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.patients)) {
    return payload.patients;
  }

  return [];
};

export const inventoryArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

export const expenseArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.expenses)) {
    return payload.expenses;
  }

  return [];
};

export const bio = (patient) => patient?.biography || {};

export const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const DENTIST_PROFILES = [
  {
    id: "dr-tufyl",
    shiftId: "morning",
    names: ["Dr Tufyl", "Tufyl"],
  },
  {
    id: "dr-abdur-rehman",
    shiftId: "evening",
    names: ["Dr Abdur Rehman", "Abdur Rehman"],
  },
];

const uniqueValues = (values) =>
  Array.from(new Set(values.filter(Boolean)));

const dentistProfileByIdentity = (dentistId, dentistName) => {
  const cleanId = normalizeText(dentistId);
  const cleanName = normalizeText(dentistName);

  return (
    DENTIST_PROFILES.find((profile) => {
      const profileId = normalizeText(profile.id);
      const profileNames = profile.names.map(normalizeText);

      return (
        (cleanId && profileId === cleanId) ||
        (cleanName &&
          profileNames.some(
            (name) => name === cleanName || name.includes(cleanName) || cleanName.includes(name)
          ))
      );
    }) || null
  );
};

export const shiftById = (shiftId) => {
  const cleanId = normalizeText(shiftId);

  return SHIFT_OPTIONS.find(
    (shift) =>
      normalizeText(shift.id) === cleanId ||
      normalizeText(shift.label) === cleanId ||
      normalizeText(shift.label).includes(cleanId)
  );
};

export const shiftByDoctorName = (doctorName) => {
  const cleanDoctor = normalizeText(doctorName);

  return SHIFT_OPTIONS.find(
    (shift) =>
      normalizeText(shift.doctorName) === cleanDoctor ||
      (shift.doctorAliases || []).some((alias) => normalizeText(alias) === cleanDoctor)
  );
};

export const activeShift = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedShift = JSON.parse(sessionStorage.getItem("shift") || "null");

    if (storedShift?.id) {
      return shiftById(storedShift.id) || storedShift;
    }
  } catch (error) {
    return null;
  }

  return null;
};

export const activeShiftId = () => activeShift()?.id || "";

export const patientShiftId = (patient) => {
  const patientBio = bio(patient);
  const explicitShift =
    patient?.shiftId ||
    patient?.shift ||
    patientBio.shiftId ||
    patientBio.shift ||
    patientBio.shiftName;
  const matchedExplicitShift = shiftById(explicitShift);

  if (matchedExplicitShift) {
    return matchedExplicitShift.id;
  }

  return shiftByDoctorName(patientBio.doctorName)?.id || "";
};

export const patientShift = (patient) => shiftById(patientShiftId(patient));

export const dentistProfileForUser = (user = {}) => {
  const role = user.role || (typeof window !== "undefined" ? sessionStorage.getItem("role") : "") || "";
  const shift = shiftById(user.shiftId) || activeShift();
  const rawDentistId = user.dentistId || "";
  const rawDentistName =
    user.dentistName ||
    user.doctorName ||
    (["dentist", "doctor"].includes(role) ? user.name : "") ||
    "";
  const profile =
    dentistProfileByIdentity(rawDentistId, rawDentistName) ||
    DENTIST_PROFILES.find((item) => item.shiftId === shift?.id) ||
    null;
  const shiftDetails = profile ? shiftById(profile.shiftId) : shift;
  const profileNames = profile?.names || [];
  const shiftNames = shiftDetails ? [shiftDetails.doctorName, ...(shiftDetails.doctorAliases || [])] : [];
  const names = uniqueValues([rawDentistName, ...profileNames, ...shiftNames]);

  return {
    role,
    dentistId: profile?.id || rawDentistId,
    dentistName: rawDentistName || profileNames[0] || shiftDetails?.doctorName || "",
    names,
    shiftId: profile?.shiftId || shift?.id || "",
  };
};

export const patientMatchesDentist = (patient, userOrProfile = {}) => {
  const profile = Array.isArray(userOrProfile.names)
    ? userOrProfile
    : dentistProfileForUser(userOrProfile);
  const cleanDentistId = normalizeText(profile.dentistId);
  const expectedNames = uniqueValues([profile.dentistName, ...(profile.names || [])]).map(normalizeText);

  if (!cleanDentistId && expectedNames.length === 0) {
    return true;
  }

  const patientBio = bio(patient);
  const patientIds = [
    patient?.dentistId,
    patient?.doctorId,
    patientBio.dentistId,
    patientBio.doctorId,
  ]
    .map(normalizeText)
    .filter(Boolean);

  if (cleanDentistId && patientIds.includes(cleanDentistId)) {
    return true;
  }

  const patientNames = [
    patient?.dentistName,
    patient?.doctorName,
    patientBio.dentistName,
    patientBio.doctorName,
  ]
    .map(normalizeText)
    .filter(Boolean);

  if (
    patientNames.some((name) =>
      expectedNames.some((expected) => name === expected || name.includes(expected) || expected.includes(name))
    )
  ) {
    return true;
  }

  const hasDoctorIdentity = patientIds.length > 0 || patientNames.length > 0;

  return !hasDoctorIdentity && Boolean(profile.shiftId) && patientShiftId(patient) === profile.shiftId;
};

export const filterPatientsForDentist = (patients, user = {}) => {
  const role = user.role || (typeof window !== "undefined" ? sessionStorage.getItem("role") : "") || "";

  if (!["dentist", "doctor"].includes(role)) {
    return patients || [];
  }

  const profile = dentistProfileForUser(user);

  return (patients || []).filter((patient) => patientMatchesDentist(patient, profile));
};

export const belongsToActiveShift = (patient) => {
  const shift = activeShift();

  if (!shift?.id) {
    return true;
  }

  return patientShiftId(patient) === shift.id;
};

export const filterPatientsForActiveShift = (patients) =>
  (patients || []).filter((patient) => belongsToActiveShift(patient));

export const applyShiftToPatient = (patient, shift = activeShift()) => {
  if (!shift?.id) {
    return patient;
  }

  return {
    ...patient,
    shiftId: shift.id,
    shiftName: shift.label,
    biography: {
      ...(patient?.biography || {}),
      shiftId: shift.id,
      shiftName: shift.label,
    },
  };
};

export const regNo = (patient) =>
  bio(patient).regNo || bio(patient).registrationNo || "";

export const patientName = (patient) => bio(patient).patientName || "Unnamed client";

export const patientTitle = (patient) => String(bio(patient).title || "").trim();

export const titledPatientName = (patient) => {
  const title = patientTitle(patient);
  const name = patientName(patient);

  if (!title || name.toLowerCase().startsWith(title.toLowerCase())) {
    return name;
  }

  return `${title} ${name}`.trim();
};

export const mobileNumber = (patient) => bio(patient).mobileNumber || "-";

export const patientDepartmentId = (patient) =>
  patient?.entrySheetType || patient?.sheetType || patient?.department || "routine";

export const patientDepartmentLabel = (patient) => departmentLabel(patientDepartmentId(patient));

export const formatCurrency = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-PK")}`;

export const formatCurrencyBlank = (value) => {
  if (value === "" || value === null || value === undefined || Number(value || 0) === 0) {
    return "";
  }

  return formatCurrency(value);
};

const invoiceItemsTotal = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.cost || 0), 0);

const invoiceGroupsFromRows = (rows = [], patientDiscount = 0) => {
  if (!rows.length) {
    return [
      {
        id: "invoice-1",
        title: "Invoice 1",
        items: [],
        discount: Number(patientDiscount || 0),
      },
    ];
  }

  const groups = new Map();

  rows.forEach((item, index) => {
    const key = String(item.invoiceId || item.invoiceNo || item.invoiceTitle || "invoice-1");

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        title: item.invoiceTitle || `Invoice ${item.invoiceNo || groups.size + 1}`,
        invoiceNo: item.invoiceNo || groups.size + 1,
        items: [],
        discount: Number(item.invoiceDiscount || 0),
      });
    }

    groups.get(key).items.push({
      ...item,
      sno: item.sno || groups.get(key).items.length + 1,
      rowKey: item.rowKey || `${key}-${index}`,
    });
  });

  const result = Array.from(groups.values()).sort((a, b) => Number(a.invoiceNo) - Number(b.invoiceNo));

  if (result.length === 1 && !result[0].discount) {
    result[0].discount = Number(patientDiscount || 0);
  }

  return result;
};

export const invoiceGroups = (patient) => {
  const storedGroups = Array.isArray(patient?.invoices) ? patient.invoices : [];

  if (storedGroups.length > 0) {
    return storedGroups.map((invoice, index) => ({
      id: invoice.id || `invoice-${index + 1}`,
      title: invoice.title || `Invoice ${index + 1}`,
      invoiceNo: invoice.invoiceNo || index + 1,
      items: Array.isArray(invoice.items) ? invoice.items : [],
      discount: Number(invoice.discount || 0),
    }));
  }

  return invoiceGroupsFromRows(patient?.invoice || [], patient?.discount || 0);
};

export const invoiceTotal = (patient) =>
  invoiceGroups(patient).reduce((sum, invoice) => sum + invoiceItemsTotal(invoice.items), 0);

export const discountPercent = (patient) =>
  Number(patient?.discountPercent ?? patient?.discount_percentage ?? 0);

export const discountAmount = (patient) => {
  const groups = invoiceGroups(patient);

  if (groups.length > 1 || Array.isArray(patient?.invoices)) {
    return groups.reduce((sum, invoice) => sum + Number(invoice.discount || 0), 0);
  }

  if (patient?.discount !== undefined && patient?.discount !== null && patient?.discount !== "") {
    return Number(patient.discount || 0);
  }

  if (patient?.discountPercent !== undefined || patient?.discount_percentage !== undefined) {
    return Math.round((invoiceTotal(patient) * discountPercent(patient)) / 100);
  }

  return Number(patient?.discount || 0);
};

export const netAmount = (patient) =>
  Math.max(invoiceTotal(patient) - discountAmount(patient), 0);

export const paymentsTotal = (patient) =>
  (patient?.accountLedger || []).reduce((sum, entry) => {
    const type = String(entry?.type || "payment").toLowerCase();
    const amount = Number(entry?.amount || 0);

    return type === "debit" || type === "charge" ? sum - amount : sum + amount;
  }, 0);

export const balanceDue = (patient) =>
  Math.max(netAmount(patient) - paymentsTotal(patient), 0);

const labRecordTotal = (record) => {
  const explicitTotal = Number(record?.totalAmount || record?.total_amount || record?.amount || 0);

  if (explicitTotal) {
    return explicitTotal;
  }

  return Number(record?.units || 0) * Number(record?.costPerUnit || record?.cost_per_unit || 0);
};

export const patientLabExpenseTotal = (patient) =>
  (patient?.labRecords || patient?.labExpenses || []).reduce(
    (sum, record) => sum + labRecordTotal(record),
    0
  );

export const referralInfo = (patient) => {
  const patientBio = bio(patient);
  const referredByName = String(patientBio.referredByName || patientBio.referredBy || "").trim();
  const role = patientBio.referredByRole || "";
  const explicitCode = referralCodeForRole(role);
  const codeFromName = referredByName.match(/\(([ROAD])\)\s*$/i)?.[1]?.toUpperCase() || "";
  const code = explicitCode || codeFromName;
  const roleLabel =
    patientBio.referredByRoleLabel ||
    referralRoleFromCode(code) ||
    (role ? role.replace(/-/g, " ") : "");

  return {
    date: patientBio.referralDate || patientBio.referredDate || patientBio.date || "",
    name: referredByName.replace(/\s*\([ROAD]\)\s*$/i, ""),
    rawName: referredByName,
    role,
    roleLabel,
    code,
    hasReferral: Boolean(referredByName || role || code),
  };
};

export const caseShareCalculation = (patient, manualExpense = 0) => {
  const totalAmount = netAmount(patient);
  const dentalMaterial = Math.round(totalAmount * 0.1);
  const labCharges = patientLabExpenseTotal(patient);
  const extraExpense = Number(manualExpense || 0);
  const totalExpense = dentalMaterial + labCharges + extraExpense;
  const shareBase = Math.max(totalAmount - totalExpense, 0);
  const share = Math.round(shareBase * 0.15);

  return {
    totalAmount,
    dentalMaterial,
    labCharges,
    extraExpense,
    totalExpense,
    shareBase,
    share,
  };
};

export const patientRecordDate = (patient) =>
  bio(patient).date || patient?.createdAt || patient?.updatedAt || "";

export const parseLocalDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value);
  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoDate) {
    const [, year, month, day] = isoDate;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const localDate = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);

  if (localDate) {
    const [, day, month, rawYear] = localDate;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;

    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const dateKey = (value) => {
  const date = parseLocalDate(value);

  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const plannedVisitStatus = (visit, reference = new Date()) => {
  const savedStatus = String(visit?.status || "").trim().toLowerCase();

  if (savedStatus === "done" || savedStatus === "completed") {
    return "Done";
  }

  const visitKey = dateKey(visit?.date);
  const todayKey = dateKey(reference);

  if (!visitKey || !todayKey) {
    return "Planned";
  }

  if (visitKey < todayKey) {
    return "Done";
  }

  if (visitKey === todayKey) {
    return "Today";
  }

  return "Planned";
};

export const upcomingVisits = (patient) =>
  (patient?.plannedSequence || []).filter((visit) => {
    const hasContent = Boolean(
      visit?.date ||
        visit?.time ||
        visit?.procedure ||
        visit?.treatment ||
        visit?.details
    );

    return hasContent && plannedVisitStatus(visit) !== "Done";
  });

export const formatDateDisplay = (value) => {
  const date = parseLocalDate(value);

  if (!date) {
    return value || "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatTimeDisplay = (value) => {
  if (!value) {
    return "";
  }

  const text = String(value).trim();
  const timeMatch = text.match(/^(\d{1,2}):(\d{2})/);

  if (!timeMatch) {
    return text;
  }

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return text;
  }

  const period = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 || 12;
  const displayMinute = minute ? `:${String(minute).padStart(2, "0")}` : "";

  return `${displayHour}${displayMinute} ${period}`;
};

export const todayDisplayValue = () => formatDateDisplay(new Date());

export const capitalizeFirstWord = (value) => {
  const text = String(value ?? "");
  const index = text.search(/[A-Za-z]/);

  if (index === -1) {
    return text;
  }

  return `${text.slice(0, index)}${text.charAt(index).toUpperCase()}${text.slice(index + 1)}`;
};

export const matchesPeriod = (value, selectedMonth, selectedYear) => {
  const date = parseLocalDate(value);

  if (!date) {
    return false;
  }

  const yearMatches = String(date.getFullYear()) === String(selectedYear);
  const monthMatches =
    selectedMonth === "all" || String(date.getMonth() + 1) === String(selectedMonth);

  return yearMatches && monthMatches;
};

export const initials = (name) =>
  (name || "Client")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
