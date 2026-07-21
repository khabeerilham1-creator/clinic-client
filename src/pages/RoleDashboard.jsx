import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import AppointmentDashboardModules from "../components/appointments/AppointmentDashboardModules";
import Layout from "../components/Layout";
import {
  appointmentArray,
  appointmentRequestParams,
  filterManualAppointmentsForUser,
  patientAppointmentSummary,
} from "../utils/appointmentHelpers";
import {
  activeShift,
  activeShiftId,
  balanceDue,
  dentistProfileForUser,
  expenseArray,
  filterPatientsForDentist,
  filterPatientsForActiveShift,
  formatCurrency,
  initials,
  mobileNumber,
  normalizeText,
  patientArray,
  patientName,
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

  if (category === "to-be-appointed") {
    return "To be appointed";
  }

  return "Completed";
}

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
          ? api.get("/expenses", { params: { category: "team", limit: 300 } })
          : Promise.resolve({ data: [] });

        const [patientsResponse, appointmentsResponse, expensesResponse] = await Promise.all([
          api.get("/patients", {
            params: { limit: 300, sort: "createdAt", order: -1, shift: activeShiftId() },
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
  const completedPatients = patientSummaries.filter(({ summary }) => summary.category === "completed");
  const toBeAppointedPatients = patientSummaries.filter(({ summary }) => summary.category === "to-be-appointed");

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
              <p>{dateLabel}. Client list and summary for the selected dentist.</p>
            </div>
            <div className="hero-actions no-print">
              <button className="btn btn-primary" onClick={() => setActivePage("patients")}>
                New client
              </button>
              <button className="btn btn-primary" onClick={() => setActivePage("dentist-patients")}>
                Client list
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
              <div className="metric-label">Clients</div>
              <div className="metric-value">{loading ? "..." : dentistPatients.length}</div>
              <div className="metric-detail">Records linked with this dentist</div>
            </div>
            <div className="metric-card gold-bordered">
              <div className="metric-accent green" />
              <div className="metric-label">On going</div>
              <div className="metric-value">
                {loading ? "..." : dentistPatientSummaries.filter(({ summary }) => summary.category === "ongoing").length}
              </div>
              <div className="metric-detail">Clients with appointments</div>
            </div>
            <div className="metric-card gold-bordered">
              <div className="metric-accent gold" />
              <div className="metric-label">To appoint</div>
              <div className="metric-value">
                {loading ? "..." : dentistPatientSummaries.filter(({ summary }) => summary.category === "to-be-appointed").length}
              </div>
              <div className="metric-detail">Plans missing date/time</div>
            </div>
            <div className="metric-card gold-bordered">
              <div className="metric-accent rose" />
              <div className="metric-label">Completed</div>
              <div className="metric-value">
                {loading ? "..." : dentistPatientSummaries.filter(({ summary }) => summary.category === "completed").length}
              </div>
              <div className="metric-detail">Visits completed</div>
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
                  <h2>Client List</h2>
                  <p>{dentistPatients.length} records available.</p>
                </div>
              </div>

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Reg No</th>
                      <th>Mobile</th>
                      <th>Status</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan="5">Loading clients...</td>
                      </tr>
                    )}
                    {!loading && dentistPatients.length === 0 && (
                      <tr>
                        <td colSpan="5">No clients found.</td>
                      </tr>
                    )}
                    {dentistPatients.slice(0, 12).map((patient) => (
                      <tr key={patient._id || regNo(patient)}>
                        <td>
                          <div className="patient-cell">
                            <span className="patient-avatar">{initials(patientName(patient))}</span>
                            <strong>{patientName(patient)}</strong>
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
                  <h2>Summary of Clients</h2>
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

        <AppointmentDashboardModules
          patients={patients}
          manualAppointments={manualAppointments}
          loading={loading}
          onAppointmentCreated={refreshManualAppointments}
          onOpenAppointments={() => setActivePage("appointments")}
        />

        <section className="role-action-grid">
          <RoleAction
            short="+"
            title="New Entry"
            detail="Open a fresh client file"
            tone="blue"
            onClick={() => setActivePage("patients")}
          />
          <RoleAction
            short="R"
            title="Registered Clients"
            detail="Search and open client records"
            tone="green"
            onClick={() => setActivePage("patients-list")}
          />
          <RoleAction
            short="A"
            title="Appointments"
            detail="View scheduled clients"
            tone="gold"
            onClick={() => setActivePage("appointments")}
          />
        </section>

        <section className="role-action-grid receptionist-status-grid">
          <RoleAction
            short="OC"
            title="Official Contacts"
            tone="cyan"
            onClick={() => setActivePage("official-contact")}
          />
          <RoleAction
            short="O"
            title="On Going Cases"
            detail={`${ongoingPatients.length} with appointments`}
            tone="blue"
            onClick={() => setActivePage("ongoing-patients")}
          />
          <RoleAction
            short="C"
            title="Completed Cases"
            detail={`${completedPatients.length} completed`}
            tone="gold"
            onClick={() => setActivePage("completed-patients")}
          />
          <RoleAction
            short="TA"
            title="To Be Appointed"
            detail={`${toBeAppointedPatients.length} waiting for date/time`}
            tone="cyan"
            onClick={() => setActivePage("to-be-appointed")}
          />
          <RoleAction
            short="AR"
            title="Receivables"
            tone="green"
            onClick={() => setActivePage("account-receivable")}
          />
          <RoleAction
            short="L"
            title="Lab Cases Follow Up"
            tone="violet"
            onClick={() => setActivePage("lab-follow-up")}
          />
          <RoleAction
            short="DE"
            title="Daily Expense"
            tone="rose"
            onClick={() => setActivePage("daily-expense")}
          />
        </section>
      </div>
    </Layout>
  );
}

export default RoleDashboard;
