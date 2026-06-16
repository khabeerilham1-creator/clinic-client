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

export const balanceDue = (patient) =>
  Math.max(invoiceTotal(patient) - Number(patient?.discount || 0), 0);

export const upcomingVisits = (patient) => patient?.plannedSequence || [];

export const initials = (name) =>
  (name || "Patient")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

