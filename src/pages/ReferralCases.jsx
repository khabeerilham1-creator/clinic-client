import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  activeShiftId,
  caseShareCalculation,
  filterPatientsForActiveShift,
  formatCurrency,
  formatDateDisplay,
  mobileNumber,
  patientArray,
  patientDepartmentLabel,
  patientName,
  referralInfo,
  regNo,
} from "../utils/patientHelpers";

function ReferralCases({ activePage, setActivePage, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [manualExpenses, setManualExpenses] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/patients", {
        params: { limit: 1000, sort: "createdAt", order: -1, shift: activeShiftId() },
      });
      const rows = filterPatientsForActiveShift(patientArray(response.data));

      setPatients(rows);
      setManualExpenses(
        Object.fromEntries(
          rows.map((patient) => [
            patient._id || regNo(patient),
            String(patient.biography?.referralManualExpense || ""),
          ])
        )
      );
    } catch (requestError) {
      console.error(requestError);
      setPatients([]);
      setError("Referral cases could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const referralRows = useMemo(
    () =>
      patients
        .map((patient) => ({
          patient,
          referral: referralInfo(patient),
        }))
        .filter(({ referral }) => referral.hasReferral),
    [patients]
  );

  const updateManualExpense = (patient, value) => {
    const key = patient._id || regNo(patient);

    setManualExpenses((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const saveManualExpense = async (patient) => {
    if (!patient?._id) {
      return;
    }

    const key = patient._id || regNo(patient);
    const nextPatient = {
      ...patient,
      biography: {
        ...(patient.biography || {}),
        referralManualExpense: Number(manualExpenses[key] || 0),
      },
    };

    try {
      await api.put(`/patients/${patient._id}`, nextPatient);
      setPatients((current) =>
        current.map((item) => (item._id === patient._id ? nextPatient : item))
      );
      setMessage("Manual expense saved.");
    } catch (requestError) {
      console.error(requestError);
      setError("Manual expense could not be saved.");
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Referral module</div>
            <h1>Referral Cases</h1>
            <p>Referral share is 15% after 10% dental material, lab charges and manual expenses.</p>
          </div>
          <div className="hero-actions no-print">
            <button className="btn" type="button" onClick={fetchPatients}>
              Refresh
            </button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}
        {message && <div className="notice">{message}</div>}

        <section className="panel">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Department</th>
                  <th>Referred By</th>
                  <th>Total Amount</th>
                  <th>Total Expense</th>
                  <th>Share</th>
                  <th className="no-print">Manual Expense</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="9">Loading referral cases...</td>
                  </tr>
                )}
                {!loading && referralRows.length === 0 && (
                  <tr>
                    <td colSpan="9">No referral cases found.</td>
                  </tr>
                )}
                {referralRows.map(({ patient, referral }) => {
                  const key = patient._id || regNo(patient);
                  const calculation = caseShareCalculation(patient, manualExpenses[key]);

                  return (
                    <tr key={key}>
                      <td>{formatDateDisplay(referral.date) || "-"}</td>
                      <td>
                        <strong>{patientName(patient)}</strong>
                        <small className="table-subtext">Reg {regNo(patient) || "-"}</small>
                      </td>
                      <td>{mobileNumber(patient)}</td>
                      <td>{patientDepartmentLabel(patient)}</td>
                      <td>
                        <strong>{referral.name || "-"}</strong>
                        <small className="table-subtext">
                          {[referral.roleLabel, referral.code ? `(${referral.code})` : ""].filter(Boolean).join(" ")}
                        </small>
                      </td>
                      <td>{formatCurrency(calculation.totalAmount)}</td>
                      <td>
                        {formatCurrency(calculation.totalExpense)}
                        <small className="table-subtext">
                          10% material {formatCurrency(calculation.dentalMaterial)} | Lab {formatCurrency(calculation.labCharges)}
                        </small>
                      </td>
                      <td>
                        <span className="pill success">{formatCurrency(calculation.share)}</span>
                      </td>
                      <td className="row-actions no-print">
                        <input
                          className="table-input small"
                          type="number"
                          min="0"
                          value={manualExpenses[key] || ""}
                          onChange={(event) => updateManualExpense(patient, event.target.value)}
                          placeholder="Implant accessories"
                        />
                        <button className="btn btn-sm" type="button" onClick={() => saveManualExpense(patient)}>
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default ReferralCases;
