import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import MonthPeriodSelector from "../components/reports/MonthPeriodSelector";
import ReportActionButtons from "../components/reports/ReportActionButtons";
import { DOCTOR_NAME } from "../utils/clinicData";
import {
  balanceDue,
  formatCurrency,
  invoiceGroups,
  invoiceTotal,
  netAmount,
  parseLocalDate,
  paymentsTotal,
} from "../utils/patientHelpers";
import { escapeHtml, openPrintWindow, printElement } from "../utils/printLedger";
import { currentPeriod, monthBounds, periodLabel } from "../utils/reportPeriod";

const INCOME_LINES = [
  { key: "checkup", label: "Check-up", match: ["check", "consult"] },
  { key: "general", label: "General Comprehensive", match: ["general", "comprehensive"] },
  { key: "prostho", label: "Prosthodontics Complete Rehab Full Denture", match: ["prost", "denture", "rehab"] },
  { key: "implants", label: "Implants", match: ["implant"] },
  { key: "ortho", label: "Orthodontics", match: ["ortho", "brace"] },
  { key: "smile", label: "Smile make-overs", match: ["smile"] },
  { key: "bleaching", label: "LED Bleaching", match: ["bleach", "led"] },
];

const expenseArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.expenses)) {
    return payload.expenses;
  }

  return [];
};

const withinMonth = (value, month, year) => {
  const date = parseLocalDate(value);

  if (!date) {
    return false;
  }

  return date.getMonth() + 1 === month && date.getFullYear() === year;
};

const matchIncomeLine = (text) => {
  const clean = String(text || "").toLowerCase();

  return (
    INCOME_LINES.find((line) => line.match.some((token) => clean.includes(token))) || {
      key: "other",
      label: "Other Income",
    }
  );
};

function AccountStatusLedger({ patients, expenses, onEditPatient, onDeletePatient }) {
  const active = currentPeriod();
  const [periodMonth, setPeriodMonth] = useState(active.month);
  const [periodYear, setPeriodYear] = useState(active.year);
  const [dailyExpenses, setDailyExpenses] = useState([]);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const response = await api.get("/daily-expenses", {
          params: { month: periodMonth, year: periodYear, limit: 2000 },
        });
        setDailyExpenses(expenseArray(response.data));
      } catch (error) {
        console.error(error);
        setDailyExpenses([]);
      }
    };

    fetchDaily();
  }, [periodMonth, periodYear]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = currentPeriod();

      if (next.month !== periodMonth || next.year !== periodYear) {
        setPeriodMonth(next.month);
        setPeriodYear(next.year);
      }
    }, 60000);

    return () => window.clearInterval(timer);
  }, [periodMonth, periodYear]);

  const report = useMemo(() => {
    const bounds = monthBounds(periodMonth, periodYear);

    const periodPatients = patients.filter((patient) => {
      const date = parseLocalDate(patient.createdAt || patient.updatedAt);
      return date && date >= bounds.start && date <= bounds.end;
    });

    const incomeLines = Object.fromEntries(INCOME_LINES.map((line) => [line.key, 0]));
    incomeLines.other = 0;

    patients.forEach((patient) => {
      invoiceGroups(patient).forEach((invoice) => {
        (invoice.items || []).forEach((item) => {
          const amount = Number(item?.amount || item?.price || 0);
          const line = matchIncomeLine(item?.procedure || item?.treatment || item?.name);
          incomeLines[line.key] = (incomeLines[line.key] || 0) + amount;
        });
      });
    });

    const netIncome = patients.reduce((sum, patient) => sum + paymentsTotal(patient), 0);

    const periodExpenses = expenses.filter((entry) =>
      withinMonth(entry.date || entry.dueDate || entry.createdAt, periodMonth, periodYear)
    );

    const adminExpense = periodExpenses
      .filter((entry) => entry.category === "administration")
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const teamExpense = periodExpenses
      .filter((entry) => entry.category === "team")
      .reduce((sum, entry) => sum + Number(entry.netSalary || entry.amount || 0), 0);
    const materialExpense = periodExpenses
      .filter((entry) => entry.category === "dental-material")
      .reduce((sum, entry) => sum + Number(entry.totalAmount || entry.amount || 0), 0);
    const labExpense = patients.reduce(
      (sum, patient) =>
        sum +
        (patient.labExpenses || [])
          .filter((entry) => withinMonth(entry.date, periodMonth, periodYear))
          .reduce((inner, entry) => inner + Number(entry.amount || 0), 0),
      0
    );
    const dailyExpenseTotal = dailyExpenses.reduce(
      (sum, entry) => sum + Number(entry.amount || 0),
      0
    );

    const pcOutflow = patients.reduce(
      (sum, patient) =>
        sum +
        (patient.doctorShare || [])
          .filter((entry) => withinMonth(entry.date, periodMonth, periodYear))
          .reduce((inner, entry) => inner + Number(entry.amount || 0), 0),
      0
    );

    const outflowLines = [
      { label: "P/C", amount: pcOutflow },
      { label: "Lab", amount: labExpense },
      { label: "D/M", amount: materialExpense },
      { label: "D/E", amount: dailyExpenseTotal },
      { label: "Charity", amount: 0 },
      { label: "Savings", amount: 0 },
      { label: "Debts", amount: patients.reduce((sum, patient) => sum + balanceDue(patient), 0) },
    ];

    const totalOutflow = outflowLines.reduce((sum, line) => sum + line.amount, 0);

    const expenseBreakdown = [
      { label: "Administration", amount: adminExpense },
      { label: "Personnel", amount: teamExpense },
      { label: "Labs", amount: labExpense },
      { label: "Dental Material", amount: materialExpense },
      { label: "Maintenance", amount: 0 },
      { label: "P/C", amount: pcOutflow },
      { label: "D/E", amount: dailyExpenseTotal },
    ];

    const totalExpenseBreakdown = expenseBreakdown.reduce((sum, line) => sum + line.amount, 0);

    return {
      periodPatients,
      incomeLines,
      netIncome,
      outflowLines,
      totalOutflow,
      netAmount: netIncome - totalOutflow,
      expenseBreakdown,
      totalExpenseBreakdown,
    };
  }, [patients, expenses, dailyExpenses, periodMonth, periodYear]);

  const printReport = () => {
    printElement("account-status-sheet", `Account Status (${periodLabel(periodMonth, periodYear)})`);
  };

  const printPatientRow = (patient) => {
    openPrintWindow({
      title: "Account Status Entry",
      subtitle: periodLabel(periodMonth, periodYear),
      bodyHtml: `
        <table>
          <tr><th>Patient</th><th>Invoice</th><th>Paid</th><th>Balance</th></tr>
          <tr>
            <td>${escapeHtml(patient.name || "-")}</td>
            <td class="amount">${escapeHtml(formatCurrency(invoiceTotal(patient)))}</td>
            <td class="amount">${escapeHtml(formatCurrency(paymentsTotal(patient)))}</td>
            <td class="amount">${escapeHtml(formatCurrency(balanceDue(patient)))}</td>
          </tr>
        </table>
      `,
    });
  };

  const monthName = periodLabel(periodMonth, periodYear).split("-")[0];

  return (
    <section className="panel printable-report account-status-ledger">
      <div className="panel-heading">
        <div>
          <h2>Account Status</h2>
          <p>{DOCTOR_NAME} — Oral &amp; Dental Surgeon</p>
        </div>

        <div className="filter-controls no-print">
          <MonthPeriodSelector
            month={periodMonth}
            year={periodYear}
            onChange={(month, year) => {
              setPeriodMonth(month);
              setPeriodYear(year);
            }}
          />
          <button className="btn btn-dark" type="button" onClick={printReport}>
            Print
          </button>
        </div>
      </div>

      <div id="account-status-sheet" className="ledger-sheet account-status-sheet">
        <div className="account-status-header">
          <div>
            <span>Year</span>
            <strong>{periodYear}</strong>
          </div>
          <div>
            <span>Month</span>
            <strong>{monthName}</strong>
          </div>
          <div className="account-status-doctor">
            <strong>{DOCTOR_NAME}</strong>
            <span>Oral &amp; Dental Surgeon</span>
          </div>
        </div>

        <div className="account-status-top">
          <div className="account-status-block">
            <div className="account-status-block-title">Main</div>
            <div className="account-status-line">
              <span>Sir</span>
              <strong>{formatCurrency(report.netIncome)}</strong>
            </div>
            <table className="ledger-table compact-ledger">
              <thead>
                <tr>
                  <th colSpan="2">Net Income</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Income</td>
                  <td className="amount">{formatCurrency(report.netIncome)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="account-status-block">
            <div className="account-status-block-title">Out Flow</div>
            {report.outflowLines.map((line) => (
              <div key={line.label} className="account-status-line">
                <span>{line.label}</span>
                <strong>{formatCurrency(line.amount)}</strong>
              </div>
            ))}
            <table className="ledger-table compact-ledger">
              <thead>
                <tr>
                  <th colSpan="2">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Outflow</td>
                  <td className="amount">{formatCurrency(report.totalOutflow)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="account-status-net-row">
          <div>
            <span>Net Income</span>
            <strong>{formatCurrency(report.netIncome)}</strong>
          </div>
          <div>
            <span>Outflow</span>
            <strong>{formatCurrency(report.totalOutflow)}</strong>
          </div>
          <div>
            <span>Net Amount</span>
            <strong>{formatCurrency(report.netAmount)}</strong>
          </div>
        </div>

        <div className="account-status-columns">
          <div className="account-status-block">
            <div className="account-status-block-title">Income</div>
            {INCOME_LINES.map((line) => (
              <div key={line.key} className="account-status-line">
                <span>{line.label}</span>
                <strong>{formatCurrency(report.incomeLines[line.key] || 0)}</strong>
              </div>
            ))}
          </div>

          <div className="account-status-block">
            <div className="account-status-block-title">Expenses</div>
            {report.expenseBreakdown.map((line) => (
              <div key={line.label} className="account-status-line">
                <span>{line.label}</span>
                <strong>{formatCurrency(line.amount)}</strong>
              </div>
            ))}
            <div className="account-status-line total-line">
              <span>Total Expense</span>
              <strong>{formatCurrency(report.totalExpenseBreakdown)}</strong>
            </div>
          </div>
        </div>

        <div className="data-table-wrap account-status-patient-table">
          <table className="ledger-table full-width-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Invoice</th>
                <th>Net</th>
                <th>Paid</th>
                <th>Balance</th>
                <th className="no-print">Action</th>
              </tr>
            </thead>
            <tbody>
              {report.periodPatients.length === 0 && (
                <tr>
                  <td colSpan="6">No patient records in this month.</td>
                </tr>
              )}

              {report.periodPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.name || "-"}</td>
                  <td className="amount">{formatCurrency(invoiceTotal(patient))}</td>
                  <td className="amount">{formatCurrency(netAmount(patient))}</td>
                  <td className="amount">{formatCurrency(paymentsTotal(patient))}</td>
                  <td className="amount">{formatCurrency(balanceDue(patient))}</td>
                  <td>
                    <ReportActionButtons
                      onPrint={() => printPatientRow(patient)}
                      onEdit={() => onEditPatient?.(patient)}
                      onDelete={() => onDeletePatient?.(patient)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AccountStatusLedger;
