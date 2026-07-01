import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  activeShift,
  activeShiftId,
  balanceDue,
  bio,
  expenseArray,
  filterPatientsForActiveShift,
  formatCurrency,
  initials,
  mobileNumber,
  patientArray,
  patientName,
  regNo,
  upcomingVisits,
} from "../utils/patientHelpers";

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

function RoleAction({ short, title, detail, onClick, tone = "blue" }) {
  return (
    <button type="button" className={`role-action-card ${tone}`} onClick={onClick}>
      <span>{short}</span>
      <strong>{title}</strong>
      <small>{detail}</small>
    </button>
  );
}

function patientStatus(patient) {
  return upcomingVisits(patient).length > 0 ? "On going" : "Completed";
}

function dentistPatientMatch(patient, dentistName) {
  const cleanDentist = normalize(dentistName);

  if (!cleanDentist) {
    return true;
  }

  const patientBio = bio(patient);
  const doctorFields = [
    patientBio.doctorName,
    patientBio.dentistName,
    patient.doctorName,
    patient.dentistName,
  ].map(normalize);

  return doctorFields.some((field) => field && (field === cleanDentist || field.includes(cleanDentist)));
}

function RoleDashboard({ activePage, setActivePage, handleLogout }) {
  const shift = activeShift();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const role = sessionStorage.getItem("role") || user.role || "receptionist";
  const [patients, setPatients] = useState([]);
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
        const requests = [
          api.get("/patients", {
            params: { limit: 300, sort: "createdAt", order: -1, shift: activeShiftId() },
          }),
        ];

        if (role === "dentist") {
          requests.push(api.get("/expenses", { params: { category: "team", limit: 300 } }));
        }

        const [patientsResponse, expensesResponse] = await Promise.all(requests);
        setPatients(filterPatientsForActiveShift(patientArray(patientsResponse.data)));
        setExpenses(expenseArray(expensesResponse?.data));
      } catch (requestError) {
        console.error(requestError);
        setError("Dashboard data could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role]);

  const ongoingPatients = useMemo(
    () => patients.filter((patient) => upcomingVisits(patient).length > 0),
    [patients]
  );
  const completedPatients = useMemo(
    () => patients.filter((patient) => upcomingVisits(patient).length === 0),
    [patients]
  );

  const dentistName = user.dentistName || user.name || "Dentist";
  const dentistPatients = useMemo(() => {
    const matched = patients.filter((patient) => dentistPatientMatch(patient, dentistName));

    return matched.length ? matched : patients;
  }, [patients, dentistName]);

  const dentistSalary = useMemo(() => {
    const cleanDentist = normalize(dentistName);
    const match = expenses.find((entry) => normalize(entry.name).includes(cleanDentist));

    return Number(match?.netSalary || match?.basicSalary || 0);
  }, [expenses, dentistName]);

  if (role === "dentist") {
    return (
      <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
        <div className="page">
          <section className="page-hero accent-hero dentist-hero">
            <div>
              <div className="eyebrow">Dentist workspace</div>
              <h1>{dentistName}</h1>
              <p>{dateLabel}. Patient list and summary for the selected dentist.</p>
            </div>
            <div className="hero-actions no-print">
              <button className="btn btn-primary" onClick={() => setActivePage("dentist-patients")}>
                Patient list
              </button>
              <button className="btn" onClick={() => setActivePage("dentist-summary")}>
                Summary
              </button>
            </div>
          </section>

          {error && <div className="notice danger">{error}</div>}

          <section className="metrics-grid">
            <div className="metric-card gold-bordered">
              <div className="metric-accent blue" />
              <div className="metric-label">Patients</div>
              <div className="metric-value">{loading ? "..." : dentistPatients.length}</div>
              <div className="metric-detail">Records linked with this dentist</div>
            </div>
            <div className="metric-card gold-bordered">
              <div className="metric-accent green" />
              <div className="metric-label">On going</div>
              <div className="metric-value">
                {loading ? "..." : dentistPatients.filter((patient) => upcomingVisits(patient).length > 0).length}
              </div>
              <div className="metric-detail">Patients with appointments</div>
            </div>
            <div className="metric-card gold-bordered">
              <div className="metric-accent rose" />
              <div className="metric-label">Completed</div>
              <div className="metric-value">
                {loading ? "..." : dentistPatients.filter((patient) => upcomingVisits(patient).length === 0).length}
              </div>
              <div className="metric-detail">No appointment pending</div>
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
                  <h2>Patient List</h2>
                  <p>{dentistPatients.length} records available.</p>
                </div>
              </div>

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Reg No</th>
                      <th>Mobile</th>
                      <th>Status</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan="5">Loading patients...</td>
                      </tr>
                    )}
                    {!loading && dentistPatients.length === 0 && (
                      <tr>
                        <td colSpan="5">No patients found.</td>
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
                          <span className={patientStatus(patient) === "On going" ? "pill warning" : "pill success"}>
                            {patientStatus(patient)}
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
                  <h2>Summary of Patients</h2>
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
        <section className="page-hero accent-hero receptionist-hero">
          <div>
            <div className="eyebrow">Receptionist dashboard</div>
            <h1>{shift?.label || "Front Desk"}</h1>
            <p>{dateLabel}. New entries, registered clients and appointments.</p>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="role-action-grid">
          <RoleAction
            short="+"
            title="New Patient Entry"
            detail="Open a fresh patient file"
            tone="blue"
            onClick={() => setActivePage("patients")}
          />
          <RoleAction
            short="R"
            title="Registered Client"
            detail="Search and open patient records"
            tone="green"
            onClick={() => setActivePage("patients-list")}
          />
          <RoleAction
            short="A"
            title="Appointments"
            detail="View scheduled patients"
            tone="gold"
            onClick={() => setActivePage("appointments")}
          />
        </section>

        <section className="metrics-grid three compact-role-metrics">
          <div className="metric-card gold-bordered">
            <div className="metric-label">Registered clients</div>
            <div className="metric-value">{loading ? "..." : patients.length}</div>
            <div className="metric-detail">All visible patient files</div>
          </div>
          <div className="metric-card gold-bordered">
            <div className="metric-label">On going patient</div>
            <div className="metric-value">{loading ? "..." : ongoingPatients.length}</div>
            <div className="metric-detail">Patients with appointments</div>
          </div>
          <div className="metric-card gold-bordered">
            <div className="metric-label">Completed patient</div>
            <div className="metric-value">{loading ? "..." : completedPatients.length}</div>
            <div className="metric-detail">No appointment pending</div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default RoleDashboard;
