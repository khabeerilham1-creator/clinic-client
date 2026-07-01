import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import {
  balanceDue,
  expenseArray,
  formatCurrency,
  mobileNumber,
  patientArray,
  patientName,
  regNo,
} from "../utils/patientHelpers";

const expenseTitle = (expense) =>
  expense.description ||
  expense.expenseName ||
  expense.name ||
  expense.item ||
  expense.shop ||
  expense.vendor ||
  "Payable";

const expenseTotal = (expense) =>
  Number(expense.totalAmount || expense.netSalary || expense.amount || expense.basicSalary || 0);

const expensePaid = (expense) =>
  Number(expense.paid || 0) +
  (expense.payments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

function AdminFinance({ activePage, setActivePage, handleLogout, mode = "receivable" }) {
  const [patients, setPatients] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isPayable = mode === "payable";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [patientsResponse, expensesResponse] = await Promise.all([
          api.get("/patients", { params: { limit: 500, sort: "createdAt", order: -1 } }),
          api.get("/expenses", { params: { limit: 800, sort: "date", order: -1 } }),
        ]);

        setPatients(patientArray(patientsResponse.data));
        setExpenses(expenseArray(expensesResponse.data));
      } catch (requestError) {
        console.error(requestError);
        setError("Finance data could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const rows = useMemo(() => {
    if (isPayable) {
      return expenses
        .map((expense) => {
          const total = expenseTotal(expense);
          const paid = expensePaid(expense);
          const remaining = Math.max(total - paid, 0);

          return { expense, total, paid, remaining };
        })
        .filter((row) => row.remaining > 0);
    }

    return patients
      .map((patient) => ({ patient, remaining: balanceDue(patient) }))
      .filter((row) => row.remaining > 0);
  }, [expenses, patients, isPayable]);

  const totalRemaining = rows.reduce((sum, row) => sum + Number(row.remaining || 0), 0);

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero admin-hero">
          <div>
            <div className="eyebrow">Admin finance</div>
            <h1>{isPayable ? "Account Payable" : "Account Receivables"}</h1>
            <p>{rows.length} open records.</p>
          </div>
          <div className="hero-actions no-print">
            <div className="metric-card mini-finance-card">
              <div className="metric-label">Remaining</div>
              <div className="metric-value">{loading ? "..." : formatCurrency(totalRemaining)}</div>
            </div>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="panel gold-bordered">
          <div className="data-table-wrap">
            {isPayable ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="6">Loading payables...</td>
                    </tr>
                  )}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan="6">No open payables found.</td>
                    </tr>
                  )}
                  {rows.map(({ expense, total, paid, remaining }) => (
                    <tr key={expense._id || `${expense.category}-${expenseTitle(expense)}`}>
                      <td>
                        <span className="pill">{expense.category || "-"}</span>
                      </td>
                      <td>{expenseTitle(expense)}</td>
                      <td>{formatCurrency(total)}</td>
                      <td>{formatCurrency(paid)}</td>
                      <td>{formatCurrency(remaining)}</td>
                      <td>{expense.status || "Pending"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Reg No</th>
                    <th>Mobile</th>
                    <th>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="4">Loading receivables...</td>
                    </tr>
                  )}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan="4">No open receivables found.</td>
                    </tr>
                  )}
                  {rows.map(({ patient, remaining }) => (
                    <tr key={patient._id || regNo(patient)}>
                      <td>
                        <strong>{patientName(patient)}</strong>
                      </td>
                      <td>
                        <span className="pill">{regNo(patient) || "-"}</span>
                      </td>
                      <td>{mobileNumber(patient)}</td>
                      <td>{formatCurrency(remaining)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default AdminFinance;
