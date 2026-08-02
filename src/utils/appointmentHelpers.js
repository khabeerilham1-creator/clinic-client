import {
  activeShift,
  activeShiftId,
  dateKey,
  dentistProfileForUser,
  formatDateDisplay,
  formatTimeDisplay,
  initials,
  mobileNumber,
  normalizeText,
  patientName,
  plannedVisitStatus,
  regNo,
} from "./patientHelpers";

export const APPOINTMENT_PURPOSE_OPTIONS = [
  "Consultation",
  "On Going Treatment",
  "Follow up",
  "Cementation",
  "Braces adjustment",
  "Implant visit",
  "Lab trial",
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
    timeLabel: formatTimeDisplay(appointment?.time),
    procedure: appointment?.purpose || "Appointment",
    purpose: appointment?.purpose || "Appointment",
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
          timeLabel: formatTimeDisplay(visit.time),
          phase: visit.phase || "Phase 1",
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

export const rowHasTreatment = (row) =>
  Boolean(row?.date || row?.time || row?.procedure || row?.treatment || row?.details);

export const patientHasCompletedCheckupFile = (patient) => {
  const checkup = patient?.checkup || {};
  const hasClinicalRecord = Boolean(
    (checkup.softTissueRecords || []).length ||
      (checkup.hardTissueRecords || []).length ||
      (checkup.labTaskRecords || []).length ||
      Object.keys(patient?.toothStates || {}).length
  );
  const hasFileContent = Boolean(
    hasClinicalRecord ||
      (patient?.invoice || []).length ||
      (patient?.invoices || []).length ||
      (patient?.accountLedger || []).length ||
      (patient?.plannedSequence || []).some(rowHasTreatment)
  );

  return Boolean(patientName(patient) && hasFileContent);
};

export const patientPlannedRows = (patient) => (patient?.plannedSequence || []).filter(rowHasTreatment);

export const plannedRowsWithDate = (patient) =>
  patientPlannedRows(patient).filter((visit) => Boolean(dateKey(visit.date)));

export const patientExpectedForAppointment = (patient) =>
  patientHasCompletedCheckupFile(patient) && plannedRowsWithDate(patient).length === 0;

export const patientOngoingForAppointment = (patient) =>
  plannedRowsWithDate(patient).some((visit) => plannedVisitStatus(visit) !== "Done");

export const lastPlannedVisit = (patient) => {
  const datedRows = plannedRowsWithDate(patient);

  if (datedRows.length === 0) {
    return null;
  }

  const sortedRows = [...datedRows].sort((a, b) => {
    const dateCompare = String(dateKey(a.date)).localeCompare(String(dateKey(b.date)));

    if (dateCompare) {
      return dateCompare;
    }

    return Number(a.visitNo || 0) - Number(b.visitNo || 0);
  });

  return sortedRows[sortedRows.length - 1] || null;
};

export const completedPhaseLabel = (patient) => {
  const visit = lastPlannedVisit(patient);
  const phase = visit?.phase || (visit?.visitNo ? `Phase ${visit.visitNo}` : "Phase 1");

  return `${phase} completed`;
};

export const patientCompletedCase = (patient) => {
  const visit = lastPlannedVisit(patient);

  return Boolean(visit && plannedVisitStatus(visit) === "Done");
};

export const patientFollowUpCase = (patient) => {
  const value =
    patient?.checkup?.followUpNeeded ||
    patient?.checkup?.followUpNeed ||
    patient?.checkup?.followUp;

  return String(value || "").trim().toLowerCase() === "yes";
};

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
  const plannedRows = patientPlannedRows(patient);
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
  const isExpected = patientExpectedForAppointment(patient);
  const isOngoing = patientOngoingForAppointment(patient) || activeManual.length > 0;
  const isCompletedCase = patientCompletedCase(patient);
  const isFollowUp = patientFollowUpCase(patient);

  let category = "expected";

  if (isOngoing) {
    category = "ongoing";
  } else if (isCompletedCase) {
    category = "completed-cases";
  } else if (isExpected) {
    category = "expected";
  } else if (completedManual.length > 0) {
    category = "completed-cases";
  }

  return {
    category,
    isExpected,
    isOngoing,
    isCompletedCase,
    isFollowUp,
    phaseLabel: isCompletedCase ? completedPhaseLabel(patient) : "",
    scheduledCount: plannedWithDateTime.length + activeManual.length,
    completedCount: plannedCompleted.length + completedManual.length,
    missingCount: plannedMissingSchedule.length,
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
