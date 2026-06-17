export const patientArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.patients)) {
    return payload.patients;
  }

  return [];
};

export const bio = (patient) => patient?.biography || {};

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
  patient?.createdAt || bio(patient).date || patient?.updatedAt || "";

export const initials = (name) =>
  (name || "Patient")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
