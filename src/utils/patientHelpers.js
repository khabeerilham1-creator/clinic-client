import { SHIFT_OPTIONS } from "./clinicData";

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

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

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

  return SHIFT_OPTIONS.find((shift) => normalizeText(shift.doctorName) === cleanDoctor);
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
      doctorName: shift.doctorName,
    },
  };
};

export const regNo = (patient) =>
  bio(patient).regNo || bio(patient).registrationNo || "";

export const patientName = (patient) => bio(patient).patientName || "Unnamed patient";

export const mobileNumber = (patient) => bio(patient).mobileNumber || "-";

export const formatCurrency = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-PK")}`;

export const invoiceTotal = (patient) =>
  (patient?.invoice || []).reduce((sum, item) => sum + Number(item.cost || 0), 0);

export const discountPercent = (patient) =>
  Number(patient?.discountPercent ?? patient?.discount_percentage ?? 0);

export const discountAmount = (patient) => {
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

export const upcomingVisits = (patient) => patient?.plannedSequence || [];

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

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
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
  (name || "Patient")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
