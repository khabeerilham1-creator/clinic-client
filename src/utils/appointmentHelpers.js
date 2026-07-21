import {
  activeShift,
  activeShiftId,
  dateKey,
  dentistProfileForUser,
  formatDateDisplay,
  initials,
  mobileNumber,
  normalizeText,
  patientName,
  plannedVisitStatus,
  regNo,
} from "./patientHelpers";

export const APPOINTMENT_PURPOSE_OPTIONS = [
  "Consultation",
  "Follow up",
  "Scaling and polishing",
  "Root canal treatment",
  "Filling",
  "Extraction",
  "Crown or bridge",
  "Braces adjustment",
  "Implant visit",
  "Lab trial",
  "Emergency",
  "Other",
];

export const appointmentArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.appointments)) {
    return payload.appointments;
  }

  return [];
};

export const storedUser = () => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch (error) {
    return {};
  }
};

export const appointmentRequestParams = () => {
  const user = storedUser();
  const role = sessionStorage.getItem("role") || user.role || "";
  const params = {
    limit: 1000,
    sort: "date",
    order: 1,
  };
  const shiftId = activeShiftId();

  if (shiftId) {
    params.shift = shiftId;
  }

  if (["dentist", "doctor"].includes(role)) {
    const profile = dentistProfileForUser({ ...user, role });

    if (profile.dentistId) {
      params.dentistId = profile.dentistId;
    }
  }

  return params;
};

export const manualAppointmentPayload = (form) => {
  const shift = activeShift();
  const user = storedUser();
  const role = sessionStorage.getItem("role") || user.role || "";
  const dentistProfile = dentistProfileForUser({ ...user, role });
  const dentistName =
    dentistProfile.dentistName ||
    user.dentistName ||
    user.doctorName ||
    shift?.doctorName ||
    "";

  return {
    date: form.date || "",
    time: form.time || "",
    clientName: form.clientName || "",
    purpose: form.purpose || "",
    mobileNumber: form.mobileNumber || "",
    notes: form.notes || "",
    status: form.status || "scheduled",
    patientId: form.patientId || "",
    registrationNo: form.registrationNo || "",
    shiftId: shift?.id || user.shiftId || "",
    shiftName: shift?.label || user.shiftName || "",
    dentistId: dentistProfile.dentistId || user.dentistId || "",
    dentistName,
    doctorName: dentistName,
    createdByRole: role,
    createdByName: user.name || "",
  };
};

export const manualAppointmentShiftId = (appointment) =>
  appointment?.shiftId || appointment?.shift || appointment?.metadata?.shiftId || "";

const manualAppointmentDentistName = (appointment) =>
  appointment?.dentistName || appointment?.doctorName || appointment?.metadata?.dentistName || "";

export const manualAppointmentMatchesUser = (appointment, user = storedUser()) => {
  const role = sessionStorage.getItem("role") || user.role || "";
  const shiftId = activeShiftId();
  const appointmentShiftId = manualAppointmentShiftId(appointment);

  if (shiftId && appointmentShiftId && appointmentShiftId !== shiftId) {
    return false;
  }

  if (!["dentist", "doctor"].includes(role)) {
    return true;
  }

  const profile = dentistProfileForUser({ ...user, role });
  const dentistId = normalizeText(profile.dentistId);
  const appointmentDentistId = normalizeText(
    appointment?.dentistId || appointment?.doctorId || appointment?.metadata?.dentistId
  );

  if (dentistId && appointmentDentistId) {
    return dentistId === appointmentDentistId;
  }

  const expectedNames = [profile.dentistName, ...(profile.names || [])].map(normalizeText).filter(Boolean);
  const appointmentName = normalizeText(manualAppointmentDentistName(appointment));

  if (appointmentName && expectedNames.length > 0) {
    return expectedNames.some(
      (name) => appointmentName === name || appointmentName.includes(name) || name.includes(appointmentName)
    );
  }

  return !appointmentShiftId || !profile.shiftId || appointmentShiftId === profile.shiftId;
};

export const filterManualAppointmentsForUser = (appointments, user = storedUser()) =>
  (appointments || []).filter((appointment) => manualAppointmentMatchesUser(appointment, user));

const appointmentStatusFromDate = (appointment) => {
  const status = normalizeText(appointment?.status).replace(" ", "-");

  if (status === "completed" || status === "done") {
    return "Done";
  }

  if (status === "cancelled") {
    return "Cancelled";
  }

  if (status === "missed") {
    return "Missed";
  }

  const appointmentKey = dateKey(appointment?.date);
  const today = dateKey(new Date());

  if (!appointmentKey || !today) {
    return "Scheduled";
  }

  if (appointmentKey < today) {
    return "Done";
  }

  if (appointmentKey === today) {
    return "Today";
  }

  return "Scheduled";
};

export const manualAppointmentCard = (appointment) => {
  const cleanDateKey = dateKey(appointment?.date);

  return {
    id: appointment?._id || appointment?.id || `${appointment?.clientName || "manual"}-${cleanDateKey}`,
    source: "manual",
    raw: appointment,
    patientId: appointment?.patientId || "",
    patientName: appointment?.clientName || "Unnamed client",
    clientName: appointment?.clientName || "Unnamed client",
    mobileNumber: appointment?.mobileNumber || "-",
    registrationNo: appointment?.registrationNo || "",
    visitNo: "",
    date: cleanDateKey || appointment?.date || "",
    dateKey: cleanDateKey,
    dateLabel: formatDateDisplay(appointment?.date),
    time: appointment?.time || "",
    procedure: appointment?.purpose || "Manual appointment",
    purpose: appointment?.purpose || "Manual appointment",
    notes: appointment?.notes || "",
    status: appointmentStatusFromDate(appointment),
  };
};

export const plannedAppointmentsFromPatients = (patients, { includeUnscheduled = false } = {}) =>
  (patients || [])
    .flatMap((patient) =>
      (patient.plannedSequence || []).map((visit, index) => {
        const cleanDateKey = dateKey(visit.date);
        const procedure = visit.procedure || visit.treatment || visit.details || "";

        return {
          id: `planned-${patient._id || regNo(patient)}-${index}`,
          source: "planned",
          raw: visit,
          patient,
          patientId: patient._id || "",
          patientName: patientName(patient),
          clientName: patientName(patient),
          mobileNumber: mobileNumber(patient),
          registrationNo: regNo(patient),
          visitNo: visit.visitNo || index + 1,
          date: cleanDateKey || visit.date || "",
          dateKey: cleanDateKey,
          dateLabel: formatDateDisplay(visit.date),
          time: visit.time || "",
          procedure,
          purpose: procedure || "Treatment visit",
          status: plannedVisitStatus(visit),
        };
      })
    )
    .filter((appointment) => includeUnscheduled || appointment.dateKey)
    .sort((a, b) => `${a.dateKey} ${a.time}`.localeCompare(`${b.dateKey} ${b.time}`));

export const appointmentTimeline = (patients, manualAppointments) =>
  [
    ...plannedAppointmentsFromPatients(patients),
    ...filterManualAppointmentsForUser(manualAppointments).map(manualAppointmentCard),
  ].sort((a, b) => `${a.dateKey} ${a.time}`.localeCompare(`${b.dateKey} ${b.time}`));

export const isActiveAppointment = (appointment) =>
  Boolean(appointment?.dateKey && appointment?.time) &&
  !["Done", "Cancelled", "Missed"].includes(appointment?.status);

export const currentWeekRange = (reference = new Date()) => {
  const start = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const weekday = start.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  start.setDate(start.getDate() + mondayOffset);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start,
    end,
    startKey: dateKey(start),
    endKey: dateKey(end),
    label: `${formatDateDisplay(start)} - ${formatDateDisplay(end)}`,
  };
};

const rowHasTreatment = (row) =>
  Boolean(row?.date || row?.time || row?.procedure || row?.treatment || row?.details);

export const manualAppointmentMatchesPatient = (appointment, patient) => {
  const patientId = String(patient?._id || "");
  const appointmentPatientId = String(appointment?.patientId || appointment?.raw?.patientId || "");

  if (patientId && appointmentPatientId && patientId === appointmentPatientId) {
    return true;
  }

  const patientReg = normalizeText(regNo(patient));
  const appointmentReg = normalizeText(appointment?.registrationNo || appointment?.raw?.registrationNo);

  if (patientReg && appointmentReg && patientReg === appointmentReg) {
    return true;
  }

  const name = normalizeText(patientName(patient));
  const appointmentName = normalizeText(appointment?.clientName || appointment?.patientName || appointment?.raw?.clientName);

  return Boolean(name && appointmentName && name === appointmentName);
};

export const patientAppointmentSummary = (patient, manualAppointments = []) => {
  const plannedRows = (patient?.plannedSequence || []).filter(rowHasTreatment);
  const plannedCards = plannedAppointmentsFromPatients([patient]);
  const plannedWithDateTime = plannedCards.filter(isActiveAppointment);
  const plannedCompleted = plannedRows.filter((visit) => plannedVisitStatus(visit) === "Done");
  const plannedMissingSchedule = plannedRows.filter(
    (visit) => plannedVisitStatus(visit) !== "Done" && (!dateKey(visit.date) || !visit.time)
  );
  const matchingManual = filterManualAppointmentsForUser(manualAppointments)
    .map(manualAppointmentCard)
    .filter((appointment) => manualAppointmentMatchesPatient(appointment, patient));
  const activeManual = matchingManual.filter(isActiveAppointment);
  const completedManual = matchingManual.filter((appointment) => appointment.status === "Done");
  const needsAppointment =
    plannedMissingSchedule.length > 0 ||
    (plannedRows.length === 0 && activeManual.length === 0 && completedManual.length === 0);

  let category = "";

  if (plannedWithDateTime.length > 0 || activeManual.length > 0) {
    category = "ongoing";
  } else if (needsAppointment) {
    category = "to-be-appointed";
  } else if (plannedCompleted.length > 0 || completedManual.length > 0) {
    category = "completed";
  }

  return {
    category,
    scheduledCount: plannedWithDateTime.length + activeManual.length,
    completedCount: plannedCompleted.length + completedManual.length,
    missingCount: plannedMissingSchedule.length || (plannedRows.length === 0 ? 1 : 0),
    manualCount: matchingManual.length,
    nextAppointment: [...plannedWithDateTime, ...activeManual].sort((a, b) =>
      `${a.dateKey} ${a.time}`.localeCompare(`${b.dateKey} ${b.time}`)
    )[0],
  };
};

export const standaloneManualAppointments = (patients, manualAppointments, mode) =>
  filterManualAppointmentsForUser(manualAppointments)
    .map(manualAppointmentCard)
    .filter((appointment) => {
      const matchesPatient = (patients || []).some((patient) => manualAppointmentMatchesPatient(appointment, patient));

      if (matchesPatient) {
        return false;
      }

      if (mode === "ongoing") {
        return isActiveAppointment(appointment);
      }

      if (mode === "completed") {
        return appointment.status === "Done";
      }

      return false;
    });

export const appointmentInitials = (appointment) => initials(appointment?.clientName || appointment?.patientName);
