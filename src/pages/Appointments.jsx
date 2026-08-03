import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import AppointmentDashboardModules from "../components/appointments/AppointmentDashboardModules";
import Layout from "../components/Layout";
import {
  appointmentArray,
  appointmentTimeline,
  appointmentRequestParams,
  currentWeekRange,
  filterManualAppointmentsForUser,
  manualAppointmentMatchesPatient,
  patientAppointmentSummary,
} from "../utils/appointmentHelpers";
import { openPatientFile } from "../utils/clientNavigation";
import {
  activeShift,
  activeShiftId,
  dateKey,
  filterPatientsForActiveShift,
  formatDateDisplay,
  formatTimeDisplay,
  initials,
  mobileNumber,
  patientArray,
  patientName,
  regNo,
} from "../utils/patientHelpers";

function AppointmentCard({
  appointment,
  tone,
  patient,
  onOpenPatient,
  onEditAppointment,
  onDeleteAppointment,
}) {
  const name = appointment.clientName || appointment.patientName;
  const canOpen = Boolean(patient && onOpenPatient);
  const canManage = appointment.source === "manual" && (onEditAppointment || onDeleteAppointment);

  return (
    <div className={`schedule-card ${tone}`}>
      <div className="schedule-date">
        <strong>{appointment.dateLabel}</strong>
        <span>{appointment.timeLabel || formatTimeDisplay(appointment.time) || `Visit ${appointment.visitNo || "-"}`}</span>
      </div>

      <div className="patient-cell">
        <span className="patient-avatar">{initials(name)}</span>
        <div>
          {canOpen ? (
            <button className="patient-link" type="button" onClick={() => onOpenPatient(patient)}>
              {name}
            </button>
          ) : (
            <strong>{name}</strong>
          )}
          <small>{appointment.purpose || appointment.procedure || "Treatment visit"}</small>
        </div>
      </div>

      <div className="schedule-meta">
        <span>{appointment.mobileNumber}</span>
        <span>{appointment.source === "manual" ? "Appointment" : `Reg ${appointment.registrationNo || "-"}`}</span>
      </div>

      {canManage && (
        <div className="row-actions appointment-actions no-print">
          {onEditAppointment && (
            <button className="btn btn-sm" type="button" onClick={() => onEditAppointment(appointment)}>
              Edit
            </button>
          )}
          {onDeleteAppointment && (
            <button className="btn btn-sm btn-danger" type="button" onClick={() => onDeleteAppointment(appointment)}>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const WEEK_DAYS = [
  { key: 1, label: "Monday" },
  { key: 2, label: "Tuesday" },
  { key: 3, label: "Wednesday" },
  { key: 4, label: "Thursday" },
  { key: 5, label: "Friday" },
  { key: 6, label: "Saturday" },
  { key: 0, label: "Sunday" },
];

const weekdayKey = (value) => {
  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date.getDay();
};

function Appointments({ activePage, setActivePage, handleLogout }) {
  const shift = activeShift();
  const [patients, setPatients] = useState([]);
  const [manualAppointments, setManualAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [search, setSearch] = useState("");
  const [caseDetailSection, setCaseDetailSection] = useState("");
  const [activeWeekday, setActiveWeekday] = useState(1);
  const [editingAppointment, setEditingAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");

    try {
      const [patientsResponse, appointmentsResponse] = await Promise.all([
        api.get("/patients", {
          params: { limit: 1000, sort: "createdAt", order: -1, shift: activeShiftId() },
        }),
        api.get("/appointments", {
          params: appointmentRequestParams(),
        }),
      ]);

      setPatients(filterPatientsForActiveShift(patientArray(patientsResponse.data)));
      setManualAppointments(filterManualAppointmentsForUser(appointmentArray(appointmentsResponse.data)));
    } catch (requestError) {
      console.error(requestError);
      setPatients([]);
      setManualAppointments([]);
      setError("Appointments could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const todayKey = dateKey(new Date());
  const isSunday = new Date().getDay() === 0;
  const week = useMemo(() => currentWeekRange(), []);
  const allAppointments = useMemo(
    () => appointmentTimeline(patients, manualAppointments),
    [patients, manualAppointments]
  );

  const appointmentPatient = (appointment) =>
    appointment.patient ||
    patients.find((patient) => manualAppointmentMatchesPatient(appointment, patient)) ||
    null;

  const matchesSearch = (values) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return values
      .map((value) => String(value || "").toLowerCase())
      .some((value) => value.includes(query));
  };

  const patientMatchesSearch = (patient, summary) =>
    matchesSearch([
      patientName(patient),
      regNo(patient),
      mobileNumber(patient),
      summary?.phaseLabel,
    ]);

  const appointmentMatchesSearch = (appointment) =>
    matchesSearch([
      appointment.clientName,
      appointment.patientName,
      appointment.registrationNo,
      appointment.mobileNumber,
      appointment.purpose,
      appointment.procedure,
      appointment.dateLabel,
      appointment.timeLabel,
    ]);

  const grouped = useMemo(() => {
    const activeAppointments = allAppointments.filter(
      (appointment) => !["Done", "Cancelled", "Missed"].includes(appointment.status)
    );
    const today = activeAppointments
      .filter((appointment) => appointment.dateKey === todayKey)
      .filter(appointmentMatchesSearch);
    const weekly = activeAppointments
      .filter((appointment) => appointment.dateKey >= week.startKey && appointment.dateKey <= week.endKey)
      .filter(appointmentMatchesSearch);
    const patientSummaries = patients
      .map((patient) => ({
        patient,
        summary: patientAppointmentSummary(patient, manualAppointments),
      }));
    const filteredPatientSummaries = patientSummaries.filter(({ patient, summary }) =>
      patientMatchesSearch(patient, summary)
    );
    const expected = filteredPatientSummaries.filter(({ summary }) => summary.isExpected);
    const ongoing = filteredPatientSummaries.filter(({ summary }) => summary.isOngoing);
    const followUp = filteredPatientSummaries.filter(({ summary }) => summary.isFollowUp);

    return { today, weekly, expected, ongoing, followUp };
  }, [allAppointments, todayKey, week.startKey, week.endKey, patients, manualAppointments, search]);

  const activeClients = grouped[caseDetailSection] || grouped.expected;
  const clientSectionDetails = {
    expected: {
      title: "Expected Cases",
      detail: "Expected cases are checkup-only cases that have not been scheduled or started yet, so the appointment is not confirmed.",
      count: grouped.expected.length,
    },
    ongoing: {
      title: "On Going",
      detail: "Cases whose planned sequence has appointment dates.",
      count: grouped.ongoing.length,
    },
    followUp: {
      title: "Follow Up",
      detail: "Only cases marked Follow Up Needed: Yes in Clinical Exam.",
      count: grouped.followUp.length,
    },
  };
  const currentClientSection = clientSectionDetails[caseDetailSection] || clientSectionDetails.expected;
  const weeklyByDay = useMemo(
    () =>
      WEEK_DAYS.map((day) => ({
        ...day,
        appointments: grouped.weekly.filter((appointment) => weekdayKey(appointment.dateKey) === day.key),
      })),
    [grouped.weekly]
  );
  const selectedWeekdayAppointments =
    weeklyByDay.find((day) => day.key === activeWeekday)?.appointments || [];

  const handleManualCreated = () => {
    setActionMessage("Appointment saved.");
    fetchAppointments();
  };

  const handleManualSaved = (_appointment, wasEditing) => {
    setActionMessage(wasEditing ? "Appointment updated." : "Appointment saved.");
    setEditingAppointment(null);
    fetchAppointments();
  };

  const handleDeleteAppointment = async (appointment) => {
    if (appointment.source !== "manual") {
      setActionMessage("Open the patient file to change planned visits.");
      return;
    }

    const id = appointment.raw?._id || appointment.id;

    if (!id) {
      setError("Appointment ID is missing.");
      return;
    }

    const confirmed = window.confirm(`Delete appointment for ${appointment.clientName || appointment.patientName}?`);

    if (!confirmed) {
      return;
    }

    setError("");
    setActionMessage("");

    try {
      await api.delete(`/appointments/${id}`);
      setActionMessage("Appointment deleted.");

      if ((editingAppointment?.raw?._id || editingAppointment?.id) === id) {
        setEditingAppointment(null);
      }

      fetchAppointments();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError?.response?.data?.detail || "Appointment could not be deleted.");
    }
  };

  if (caseDetailSection) {
    return (
      <Layout
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      >
        <div className="page">
          <section className="page-hero">
            <div>
              <div className="eyebrow">Case status</div>
              <h1>{currentClientSection.title}</h1>
              <p>{currentClientSection.detail}</p>
            </div>
            <div className="hero-actions no-print">
              <button className="btn" type="button" onClick={() => setCaseDetailSection("")}>
                Back
              </button>
            </div>
          </section>

          <section className="panel">
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Reg No</th>
                    <th>Contact</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="4">Loading cases...</td>
                    </tr>
                  )}
                  {!loading && activeClients.length === 0 && (
                    <tr>
                      <td colSpan="4">No cases found in this section.</td>
                    </tr>
                  )}
                  {activeClients.map(({ patient, summary }) => (
                    <tr key={patient._id || regNo(patient)}>
                      <td>
                        <button className="patient-link" type="button" onClick={() => openPatientFile(patient, setActivePage)}>
                          {patientName(patient)}
                        </button>
                      </td>
                      <td>
                        <span className="pill">{regNo(patient) || "-"}</span>
                      </td>
                      <td>{mobileNumber(patient)}</td>
                      <td>
                        {caseDetailSection === "followUp"
                            ? "Follow up needed"
                            : caseDetailSection === "ongoing"
                              ? `${summary.scheduledCount} scheduled`
                              : "Checkup done, appointment expected"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </Layout>
    );
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      handleLogout={handleLogout}
    >
      <div className="page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Appointments</div>
            <h1>{shift?.label ? `${shift.label} Appointments` : "Appointments"}</h1>
            <p>
              Search, update and review expected, ongoing, completed and follow-up cases.
            </p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn" onClick={fetchAppointments}>Refresh</button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}
        {actionMessage && <div className="notice">{actionMessage}</div>}

        <section className="toolbar-panel">
          <div className="search-field">
            <span>Search appointments</span>
            <input
              type="text"
              placeholder="Name, reg no, contact, purpose or phase"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </section>

        <AppointmentDashboardModules
          patients={patients}
          manualAppointments={manualAppointments}
          loading={loading}
          editingAppointment={editingAppointment}
          onAppointmentCreated={handleManualCreated}
          onAppointmentSaved={handleManualSaved}
          onCancelAppointmentEdit={() => setEditingAppointment(null)}
          onEditAppointment={setEditingAppointment}
          onDeleteAppointment={handleDeleteAppointment}
          onOpenPatient={(patient) => openPatientFile(patient, setActivePage)}
        />

        <section className="metrics-grid three">
          <button className="metric-card metric-button" type="button" onClick={() => setCaseDetailSection("expected")}>
            <div className="metric-accent blue" />
            <div className="metric-label">Expected Cases</div>
            <div className="metric-value">{loading ? "..." : grouped.expected.length}</div>
            <div className="metric-detail">Checkup done, appointment not confirmed</div>
          </button>
          <button className="metric-card metric-button" type="button" onClick={() => setCaseDetailSection("ongoing")}>
            <div className="metric-accent gold" />
            <div className="metric-label">On Going</div>
            <div className="metric-value">{loading ? "..." : grouped.ongoing.length}</div>
            <div className="metric-detail">Planned sequence has dates</div>
          </button>
          <button className="metric-card metric-button" type="button" onClick={() => setCaseDetailSection("followUp")}>
            <div className="metric-accent rose" />
            <div className="metric-label">Follow Up</div>
            <div className="metric-value">{loading ? "..." : grouped.followUp.length}</div>
            <div className="metric-detail">Clinical Exam marked yes</div>
          </button>
        </section>

        <section className="schedule-layout">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Today</h2>
                <p>{formatDateDisplay(todayKey)}</p>
              </div>
              <span className="pill">{grouped.today.length}</span>
            </div>

            <div className="schedule-stack">
              {loading && <div className="empty-state compact">Loading schedule...</div>}

              {!loading && isSunday && (
                <div className="holiday-state">
                  <strong>Clinic Off Today</strong>
                  <span>It is Sunday, the clinic holiday.</span>
                </div>
              )}

              {!loading && !isSunday && grouped.today.length === 0 && (
                <div className="empty-state compact">No appointments today.</div>
              )}

              {!isSunday && grouped.today.map((appointment, index) => (
                <AppointmentCard
                  key={`${appointment.registrationNo}-today-${index}`}
                  appointment={appointment}
                  patient={appointmentPatient(appointment)}
                  onOpenPatient={(patient) => openPatientFile(patient, setActivePage)}
                  onEditAppointment={setEditingAppointment}
                  onDeleteAppointment={handleDeleteAppointment}
                  tone="today"
                />
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Weekly Appointments</h2>
                <p>{week.label}</p>
              </div>
              <span className="pill warning">{grouped.weekly.length}</span>
            </div>

            <div className="weekday-tabs no-print" role="group" aria-label="Weekly appointments by day">
              {weeklyByDay.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  className={activeWeekday === day.key ? "active" : ""}
                  onClick={() => setActiveWeekday(day.key)}
                >
                  <span>{day.label}</span>
                  <strong>{day.appointments.length}</strong>
                </button>
              ))}
            </div>

            <div className="schedule-stack">
              {!loading && selectedWeekdayAppointments.length === 0 && (
                <div className="empty-state compact">No appointments for this day.</div>
              )}

              {selectedWeekdayAppointments.slice(0, 8).map((appointment, index) => (
                <AppointmentCard
                  key={`${appointment.source}-${appointment.id}-week-${index}`}
                  appointment={appointment}
                  patient={appointmentPatient(appointment)}
                  onOpenPatient={(patient) => openPatientFile(patient, setActivePage)}
                  onEditAppointment={setEditingAppointment}
                  onDeleteAppointment={handleDeleteAppointment}
                  tone="tomorrow"
                />
              ))}
            </div>
          </div>

          <div className="panel wide">
            <div className="panel-heading">
              <div>
                <h2>All Weekly Appointments</h2>
                <p>Planned and added appointments for the current week.</p>
              </div>
              <span className="pill success">{grouped.weekly.length}</span>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Contact</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th className="no-print">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="7">Loading weekly appointments...</td>
                    </tr>
                  )}

                  {!loading && grouped.weekly.length === 0 && (
                    <tr>
                      <td colSpan="7">No appointments found this week.</td>
                    </tr>
                  )}

                  {grouped.weekly.map((appointment, index) => (
                    <tr key={`${appointment.source}-${appointment.id}-weekly-row-${index}`}>
                      <td>
                        <span className="pill">{formatDateDisplay(appointment.date)}</span>
                      </td>
                      <td>
                        {appointmentPatient(appointment) ? (
                          <button
                            className="patient-link"
                            type="button"
                            onClick={() => openPatientFile(appointmentPatient(appointment), setActivePage)}
                          >
                            {appointment.clientName || appointment.patientName}
                          </button>
                        ) : (
                          <strong>{appointment.clientName || appointment.patientName}</strong>
                        )}
                      </td>
                      <td>{appointment.source === "manual" ? "Appointment" : `Visit ${appointment.visitNo || "-"}`}</td>
                      <td>{appointment.mobileNumber}</td>
                      <td>{appointment.timeLabel || formatTimeDisplay(appointment.time) || "-"}</td>
                      <td>{appointment.purpose || appointment.procedure || "-"}</td>
                      <td className="row-actions no-print">
                        {appointment.source === "manual" ? (
                          <>
                            <button className="btn btn-sm" type="button" onClick={() => setEditingAppointment(appointment)}>
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              type="button"
                              onClick={() => handleDeleteAppointment(appointment)}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-sm"
                            type="button"
                            onClick={() => openPatientFile(appointmentPatient(appointment), setActivePage)}
                            disabled={!appointmentPatient(appointment)}
                          >
                            Open
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel wide">
            <div className="panel-heading">
              <div>
                <h2>{currentClientSection.title}</h2>
                <p>{currentClientSection.detail}</p>
              </div>
              <span className="pill warning">{currentClientSection.count}</span>
            </div>

            <div className="quick-grid">
              {Object.entries(clientSectionDetails).map(([sectionKey, section]) => (
                <button
                  key={sectionKey}
                  className="quick-action"
                  type="button"
                  onClick={() => setCaseDetailSection(sectionKey)}
                >
                  <span>{section.count}</span>
                  {section.title}
                </button>
              ))}
            </div>
          </div>

        </section>
      </div>
    </Layout>
  );
}

export default Appointments;
