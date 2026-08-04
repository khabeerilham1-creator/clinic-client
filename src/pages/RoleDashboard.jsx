import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import AppointmentDashboardModules from "../components/appointments/AppointmentDashboardModules";
import Layout from "../components/Layout";
import {
  appointmentArray,
  appointmentRequestParams,
  expectedAppointmentStatus,
  filterManualAppointmentsForUser,
  patientAppointmentSummary,
} from "../utils/appointmentHelpers";
import { openPatientFile } from "../utils/clientNavigation";
import {
  activeShift,
  activeShiftId,
  balanceDue,
  dentistProfileForUser,
  expenseArray,
  filterPatientsForDentist,
  filterPatientsForActiveShift,
  formatCurrency,
  formatDateDisplay,
  initials,
  mobileNumber,
  normalizeText,
  patientArray,
  patientName,
  parseLocalDate,
  regNo,
} from "../utils/patientHelpers";

function RoleAction({ short, title, detail, onClick, tone = "blue" }) {
  return (
    <button type="button" className={`role-action-card ${tone}`} onClick={onClick}>
      <span>{short}</span>
      <strong>{title}</strong>
      {detail && <small>{detail}</small>}
    </button>
  );
}

function patientStatus(patient, manualAppointments) {
  const category = patientAppointmentSummary(patient, manualAppointments).category;

  if (category === "ongoing") {
    return "On going";
  }

  if (category === "expected") {
    return "Expected";
  }

  return "Completed Cases";
}

const ledgerEntryValue = (entry) => {
  const type = String(entry?.type || "payment").toLowerCase();
  const amount = Number(entry?.amount || 0);

  return type === "debit" || type === "charge" ? -amount : amount;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

function RoleDashboard({ activePage, setActivePage, handleLogout }) {
  const shift = activeShift();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const role = sessionStorage.getItem("role") || user.role || "receptionist";
  const [patients, setPatients] = useState([]);
  const [manualAppointments, setManualAppointments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const expensesRequest = ["dentist", "doctor"].includes(role)
          ? api.get("/expenses", { params: { category: "team", limit: 1000 } })
          : Promise.resolve({ data: [] });

        const [patientsResponse, appointmentsResponse, expensesResponse] = await Promise.all([
          api.get("/patients", {
            params: { limit: 1000, sort: "createdAt", order: -1, shift: activeShiftId() },
          }),
          api.get("/appointments", {
            params: appointmentRequestParams(),
          }),
          expensesRequest,
        ]);

        setPatients(filterPatientsForActiveShift(patientArray(patientsResponse.data)));
        setManualAppointments(filterManualAppointmentsForUser(appointmentArray(appointmentsResponse.data)));
        setExpenses(expenseArray(expensesResponse?.data));
      } catch (requestError) {
        console.error(requestError);
        setPatients([]);
        setManualAppointments([]);
        setExpenses([]);
        setError("");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role]);

  const patientSummaries = useMemo(
    () => patients.map((patient) => ({ patient, summary: patientAppointmentSummary(patient, manualAppointments) })),
    [patients, manualAppointments]
  );
  const ongoingPatients = patientSummaries.filter(({ summary }) => summary.category === "ongoing");
  const expectedPatients = patientSummaries.filter(({ summary }) => summary.isExpected);
  const completedPatients = patientSummaries.filter(({ summary }) => summary.isCompletedCase);
  const followUpPatients = patientSummaries.filter(({ summary }) => summary.isFollowUp);
  const toBeAppointmentPatients = patientSummaries.filter(
    ({ patient, summary }) =>
      summary.isExpected && expectedAppointmentStatus(patient) === "to-be-appointment"
  );
  const incomeDetails = useMemo(() => {
    const reference = new Date();
    const todayStart = startOfDay(reference);
    const todayEnd = endOfDay(reference);
    const monthStart = new Date(reference.getFullYear(), reference.getMonth(), 1);
    const monthEnd = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999);
    const quarterStartMonth = Math.floor(reference.getMonth() / 3) * 3;
    const quarterStart = new Date(reference.getFullYear(), quarterStartMonth, 1);
    const quarterEnd = new Date(reference.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59, 999);
    const rows = patients
      .flatMap((patient) =>
        (patient.accountLedger || []).map((entry) => {
          const date = parseLocalDate(entry.date || entry.timestamp || entry.createdAt);

          return {
            patient,
            entry,
            date,
            amount: ledgerEntryValue(entry),
          };
        })
      )
      .filter((row) => row.date && row.amount !== 0);
    const inBounds = (row, start, end) => row.date >= start && row.date <= end;
    const sumRows = (items) => items.reduce((sum, row) => sum + row.amount, 0);
    const todayRows = rows
      .filter((row) => inBounds(row, todayStart, todayEnd))
      .sort((a, b) => b.date - a.date);
    const monthlyRows = rows.filter((row) => inBounds(row, monthStart, monthEnd));
    const quarterlyRows = rows.filter((row) => inBounds(row, quarterStart, quarterEnd));

    return {
      todayRows,
      todayTotal: sumRows(todayRows),
      monthlyTotal: sumRows(monthlyRows),
      quarterlyTotal: sumRows(quarterlyRows),
    };
  }, [patients]);

  const dentistProfile = dentistProfileForUser({ ...user, role });
  const dentistName = dentistProfile.dentistName || user.name || "Dentist";
  const dentistPatients = useMemo(
    () => filterPatientsForDentist(patients, { ...user, role }),
    [patients, user.dentistId, user.dentistName, user.doctorName, user.name, role]
  );
  const dentistPatientSummaries = useMemo(
    () => dentistPatients.map((patient) => ({ patient, summary: patientAppointmentSummary(patient, manualAppointments) })),
    [dentistPatients, manualAppointments]
  );

  const dentistSalary = useMemo(() => {
    const cleanDentist = normalizeText(dentistName);
    const match = expenses.find((entry) => normalizeText(entry.name).includes(cleanDentist));

    return Number(match?.netSalary || match?.basicSalary || 0);
  }, [expenses, dentistName]);

  const refreshManualAppointments = async () => {
    try {
      const response = await api.get("/appointments", {
        params: appointmentRequestParams(),
      });
      setManualAppointments(filterManualAppointmentsForUser(appointmentArray(response.data)));
    } catch (requestError) {
      console.error(requestError);
      setError("Appointments could not be refreshed.");
    }
  };

  if (["dentist", "doctor"].includes(role)) {
    return (
      <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
        <div className="page">
          <section className="page-hero accent-hero dentist-hero">
            <div>
              <div className="eyebrow">Dentist workspace</div>
              <h1>{dentistName}</h1>
              <p>{dateLabel}. Case list and summary for the selected dentist.</p>
            </div>
            <div className="hero-actions no-print">
              <button className="btn btn-primary" onClick={() => setActivePage("patients")}>
                New case
              </button>
              <button className="btn btn-primary" onClick={() => setActivePage("dentist-patients")}>
                Case list
              </button>
              <button className="btn" onClick={() => setActivePage("dentist-summary")}>
                Summary
              </button>
            </div>
          </section>

          {error && <div className="notice danger">{error}</div>}

          <AppointmentDashboardModules
            patients={dentistPatients}
            manualAppointments={manualAppointments}
            loading={loading}
            onAppointmentCreated={refreshManualAppointments}
            onOpenAppointments={() => setActivePage("appointments")}
          />

          <section className="metrics-grid">
            <div className="metric-card gold-bordered">
              <div className="metric-accent blue" />
              <div className="metric-label">Cases</div>
              <div className="metric-value">{loading ? "..." : dentistPatients.length}</div>
              <div className="metric-detail">Cases linked with this dentist</div>
            </div>
            <div className="metric-card gold-bordered">
              <div className="metric-accent green" />
              <div className="metric-label">On going</div>
              <div className="metric-value">
                {loading ? "..." : dentistPatientSummaries.filter(({ summary }) => summary.category === "ongoing").length}
              </div>
              <div className="metric-detail">Cases with appointments</div>
            </div>
            <div className="metric-card gold-bordered">
              <div className="metric-accent gold" />
              <div className="metric-label">Expected Cases</div>
              <div className="metric-value">
                {loading ? "..." : dentistPatientSummaries.filter(({ summary }) => summary.isExpected).length}
              </div>
              <div className="metric-detail">Checkup done, appointment not confirmed</div>
            </div>
            <div className="metric-card gold-bordered">
              <div className="metric-accent rose" />
              <div className="metric-label">Completed Cases</div>
              <div className="metric-value">
                {loading ? "..." : dentistPatientSummaries.filter(({ summary }) => summary.isCompletedCase).length}
              </div>
              <div className="metric-detail">The case has been successfully completed</div>
            </div>
            <div className="metric-card gold-bordered">
              <div className="metric-accent gold" />
              <div className="metric-label">Salary</div>
              <div className="metric-value">{loading ? "..." : formatCurrency(dentistSalary)}</div>
              <div className="metric-detail">From admin Team expenses</div>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="panel xl gold-bordered">
              <div className="panel-heading">
                <div>
                  <h2>Case List</h2>
                  <p>{dentistPatients.length} cases available.</p>
                </div>
              </div>

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Reg No</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan="5">Loading cases...</td>
                      </tr>
                    )}
                    {!loading && dentistPatients.length === 0 && (
                      <tr>
                        <td colSpan="5">No cases found.</td>
                      </tr>
                    )}
                    {dentistPatients.slice(0, 12).map((patient) => (
                      <tr key={patient._id || regNo(patient)}>
                        <td>
                          <div className="patient-cell">
                            <span className="patient-avatar">{initials(patientName(patient))}</span>
                            <button className="patient-link" type="button" onClick={() => openPatientFile(patient, setActivePage)}>
                              {patientName(patient)}
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className="pill">{regNo(patient) || "-"}</span>
                        </td>
                        <td>{mobileNumber(patient)}</td>
                        <td>
                          <span className={patientStatus(patient, manualAppointments) === "On going" ? "pill warning" : "pill success"}>
                            {patientStatus(patient, manualAppointments)}
                          </span>
                        </td>
                        <td>{formatCurrency(balanceDue(patient))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel gold-bordered">
              <div className="panel-heading">
                <div>
                  <h2>Summary of Cases</h2>
                  <p>Table format can be expanded when shared.</p>
                </div>
              </div>
              <div className="quick-grid">
                <button className="quick-action" type="button" onClick={() => setActivePage("dentist-salary")}>
                  <span>S</span>
                  Salary based
                </button>
                <button className="quick-action" type="button" onClick={() => setActivePage("dentist-percentage")}>
                  <span>%</span>
                  Percentage base
                </button>
                <button className="quick-action" type="button" onClick={() => setActivePage("dentist-referral")}>
                  <span>R</span>
                  Referral base
                </button>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero receptionist-hero shift-hero">
          <div>
            <h1>{shift?.label || "Front Desk"}</h1>
            <p>{dateLabel}</p>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="role-action-grid">
          <RoleAction
            short="ES"
            title="Entry Sheet"
            detail="Name, time, purpose, contact, entry and exit time"
            tone="blue"
            onClick={() => setActivePage("entry-sheet")}
          />
          <RoleAction
            short="A"
            title="Appointments"
            detail="View scheduled cases"
            tone="gold"
            onClick={() => setActivePage("appointments")}
          />
          <RoleAction
            short="+"
            title="New Case"
            detail="Open a fresh comprehensive case file"
            tone="green"
            onClick={() => setActivePage("patients")}
          />
          <RoleAction
            short="R"
            title="Registered Cases"
            detail="Search and open case records"
            tone="cyan"
            onClick={() => setActivePage("patients-list")}
          />
          <RoleAction
            short="E"
            title="Expenses"
            detail="Daily expense, dental material and dental lab"
            tone="blue"
            onClick={() => setActivePage("expenses")}
          />
          <RoleAction
            short="DM"
            title="Dental Material"
            detail="Open dental material entries"
            tone="gold"
            onClick={() => setActivePage("dental-material")}
          />
          <RoleAction
            short="LF"
            title="Lab Follow Up Sheet"
            detail="Pending and completed lab cases"
            tone="green"
            onClick={() => setActivePage("lab-follow-up")}
          />
          <RoleAction
            short={loading ? "..." : String(ongoingPatients.length)}
            title="On Going Cases"
            detail="All departments"
            tone="cyan"
            onClick={() => setActivePage("ongoing-patients")}
          />
          <RoleAction
            short={loading ? "..." : String(completedPatients.length)}
            title="Completed Cases"
            detail="All departments"
            tone="green"
            onClick={() => setActivePage("completed-patients")}
          />
          <RoleAction
            short={loading ? "..." : String(expectedPatients.length)}
            title="Expected Cases"
            detail="Checkup done, appointment expected"
            tone="blue"
            onClick={() => setActivePage("expected-cases")}
          />
          <RoleAction
            short={loading ? "..." : String(toBeAppointmentPatients.length)}
            title="To Be Appointment"
            detail="Cases marked from Expected"
            tone="gold"
            onClick={() => setActivePage("to-be-appointed")}
          />
          <RoleAction
            short={loading ? "..." : String(followUpPatients.length)}
            title="Follow Up"
            detail="Only Follow Up Needed: Yes"
            tone="rose"
            onClick={() => setActivePage("follow-up")}
          />
          <RoleAction
            short="AR"
            title="Receivables"
            detail="Open account receivables"
            tone="cyan"
            onClick={() => setActivePage("account-receivable")}
          />
        </section>
      </div>
    </Layout>
  );
}

export default RoleDashboard;
