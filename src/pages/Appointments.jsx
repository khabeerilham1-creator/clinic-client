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
  manualAppointmentCard,
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

function AppointmentCard({ appointment, tone, patient, onOpenPatient }) {
  const name = appointment.clientName || appointment.patientName;
  const canOpen = Boolean(patient && onOpenPatient);

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
  const role = sessionStorage.getItem("role") || "";
  const [patients, setPatients] = useState([]);
  const [manualAppointments, setManualAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [search, setSearch] = useState("");
  const [caseDetailSection, setCaseDetailSection] = useState("");
  const [activeWeekday, setActiveWeekday] = useState(1);

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
    const upcoming = activeAppointments.filter((appointment) => appointment.dateKey > week.endKey);
    const manual = filterManualAppointmentsForUser(manualAppointments)
      .map(manualAppointmentCard)
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
    const completedCases = filteredPatientSummaries.filter(({ summary }) => summary.isCompletedCase);
    const followUp = filteredPatientSummaries.filter(({ summary }) => summary.isFollowUp);

    return { today, weekly, upcoming, manual, expected, ongoing, completedCases, followUp };
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
    completedCases: {
      title: "Completed Cases",
      detail: "The case has been successfully completed.",
      count: grouped.completedCases.length,
    },
    followUp: {
      title: "Follow Up",
      detail: "Only cases marked Follow Up Needed: Yes in Clinical Exam.",
      count: grouped.followUp.length,
    },
  };
  const currentClientSection = clientSectionDetails[caseDetailSection] || clientSectionDetails.expected;
  const canDelete = role === "admin";
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

  const updateManualStatus = async (appointment, status) => {
    if (!appointment.raw?._id) {
      return;
    }

    setActionMessage("");

    try {
      await api.put(`/appointments/${appointment.raw._id}`, {
        ...appointment.raw,
        status,
      });
      setActionMessage("Appointment status updated.");
      fetchAppointments();
    } catch (requestError) {
      console.error(requestError);
      setError("Appointment status could not be updated.");
    }
  };

  const deleteManualAppointment = async (appointment) => {
    if (!appointment.raw?._id || !window.confirm("Delete this appointment?")) {
      return;
    }

    setActionMessage("");

    try {
      await api.delete(`/appointments/${appointment.raw._id}`);
      setActionMessage("Appointment deleted.");
      fetchAppointments();
    } catch (requestError) {
      console.error(requestError);
      setError("Appointment could not be deleted.");
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
                        {caseDetailSection === "completedCases"
                          ? "The case has been successfully completed."
                          : caseDetailSection === "followUp"
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
          onAppointmentCreated={handleManualCreated}
          onOpenPatient={(patient) => openPatientFile(patient, setActivePage)}
        />

        <section className="metrics-grid">
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
          <button className="metric-card metric-button" type="button" onClick={() => setCaseDetailSection("completedCases")}>
            <div className="metric-accent green" />
            <div className="metric-label">Completed Cases</div>
            <div className="metric-value">{loading ? "..." : grouped.completedCases.length}</div>
            <div className="metric-detail">Successfully completed cases</div>
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
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="6">Loading weekly appointments...</td>
                    </tr>
                  )}

                  {!loading && grouped.weekly.length === 0 && (
                    <tr>
                      <td colSpan="6">No appointments found this week.</td>
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

          <div className="panel wide">
            <div className="panel-heading">
              <div>
                <h2>Update Appointments</h2>
                <p>Update status or remove appointment entries.</p>
              </div>
              <span className="pill">{grouped.manual.length}</span>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Name</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="6">Loading appointments...</td>
                    </tr>
                  )}
                  {!loading && grouped.manual.length === 0 && (
                    <tr>
                      <td colSpan="6">No appointments saved yet.</td>
                    </tr>
                  )}
                  {grouped.manual.map((appointment) => (
                    <tr key={`manual-record-${appointment.id}`}>
                      <td>{appointment.dateLabel || "-"}</td>
                      <td>{appointment.timeLabel || formatTimeDisplay(appointment.time) || "-"}</td>
                      <td>
                        {appointmentPatient(appointment) ? (
                          <button
                            className="patient-link"
                            type="button"
                            onClick={() => openPatientFile(appointmentPatient(appointment), setActivePage)}
                          >
                            {appointment.clientName}
                          </button>
                        ) : (
                          <strong>{appointment.clientName}</strong>
                        )}
                        <small className="table-subtext">{appointment.mobileNumber}</small>
                      </td>
                      <td>{appointment.purpose}</td>
                      <td>
                        <select
                          className="table-select"
                          value={appointment.raw?.status || "scheduled"}
                          onChange={(event) => updateManualStatus(appointment, event.target.value)}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="missed">Missed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        {canDelete ? (
                          <button className="btn btn-sm" type="button" onClick={() => deleteManualAppointment(appointment)}>
                            Delete
                          </button>
                        ) : (
                          <span className="table-subtext">Admin only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {grouped.completedCases.length > 0 && (
            <div className="panel wide">
              <div className="panel-heading">
                <div>
                  <h2>Completed Cases</h2>
                  <p>The case has been successfully completed.</p>
                </div>
                <span className="pill success">{grouped.completedCases.length}</span>
              </div>

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Reg No</th>
                      <th>Contact</th>
                      <th>Phase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped.completedCases.slice(0, 8).map(({ patient, summary }) => (
                      <tr key={`completed-case-${patient._id || regNo(patient)}`}>
                        <td>
                          <button className="patient-link" type="button" onClick={() => openPatientFile(patient, setActivePage)}>
                            {patientName(patient)}
                          </button>
                          <small className="table-subtext">The case has been successfully completed.</small>
                        </td>
                        <td>
                          <span className="pill">{regNo(patient) || "-"}</span>
                        </td>
                        <td>{mobileNumber(patient)}</td>
                        <td>{summary.phaseLabel || "Phase completed"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default Appointments;
