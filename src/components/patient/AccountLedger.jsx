import React, { useMemo, useState } from "react";

import {
  balanceDue,
  capitalizeFirstWord,
  formatCurrency,
  formatDateDisplay,
  netAmount,
  paymentsTotal,
  todayDisplayValue,
} from "../../utils/patientHelpers";
import { playSectionSound } from "../../utils/sound";

const emptyPayment = () => ({
  date: todayDisplayValue(),
  amount: "",
  description: "",
});

const entryValue = (entry) => {
  const type = String(entry?.type || "payment").toLowerCase();
  const amount = Number(entry?.amount || 0);

  return type === "debit" || type === "charge" ? -amount : amount;
};

function AccountLedger({ patientData, setPatientData }) {
  const [paymentForm, setPaymentForm] = useState(emptyPayment());
  const [editingIndex, setEditingIndex] = useState(null);
  const ledger = Array.isArray(patientData.accountLedger) ? patientData.accountLedger : [];
  const patientTotal = netAmount(patientData);
  const paid = paymentsTotal(patientData);
  const remaining = balanceDue(patientData);

  const ledgerRows = useMemo(() => {
    let runningPaid = 0;

    return ledger.map((entry, index) => {
      runningPaid += entryValue(entry);

      return {
        ...entry,
        index,
        paidRunning: runningPaid,
        remainingAfter: Math.max(patientTotal - runningPaid, 0),
      };
    });
  }, [ledger, patientTotal]);

  const resetForm = () => {
    setPaymentForm(emptyPayment());
    setEditingIndex(null);
  };

  const savePayment = () => {
    const amount = Number(paymentForm.amount || 0);

    if (amount <= 0) {
      playSectionSound("warning");
      return;
    }

    const entry = {
      id: ledger[editingIndex]?.id || `payment-${Date.now()}`,
      date: paymentForm.date || todayDisplayValue(),
      amount,
      description: capitalizeFirstWord(paymentForm.description || ""),
      type: "payment",
    };

    setPatientData((current) => {
      const currentLedger = Array.isArray(current.accountLedger) ? current.accountLedger : [];
      const nextLedger =
        editingIndex === null
          ? [...currentLedger, entry]
          : currentLedger.map((item, index) => (index === editingIndex ? { ...item, ...entry } : item));

      return {
        ...current,
        accountLedger: nextLedger,
      };
    });

    resetForm();
    playSectionSound("success");
  };

  const editPayment = (entry, index) => {
    setPaymentForm({
      date: entry.date || todayDisplayValue(),
      amount: entry.amount || "",
      description: entry.description || "",
    });
    setEditingIndex(index);
    playSectionSound("section");
  };

  const deletePayment = (index) => {
    setPatientData((current) => ({
      ...current,
      accountLedger: (current.accountLedger || []).filter((_, rowIndex) => rowIndex !== index),
    }));
    resetForm();
    playSectionSound("warning");
  };

  return (
    <div>
      <div className="panel-heading">
        <div>
          <h2>Account Status</h2>
          <p>Date, paid amount and remaining balance from the invoice.</p>
        </div>
      </div>

      <section className="account-status-summary">
        <div className="metric-card gold-bordered">
          <div className="metric-label">Patient total amount</div>
          <div className="metric-value">{formatCurrency(patientTotal)}</div>
          <div className="metric-detail">Invoice net amount</div>
        </div>
        <div className="metric-card gold-bordered">
          <div className="metric-label">Paid</div>
          <div className="metric-value">{formatCurrency(paid)}</div>
          <div className="metric-detail">Total received</div>
        </div>
        <div className="metric-card gold-bordered">
          <div className="metric-label">Remaining</div>
          <div className="metric-value">{formatCurrency(remaining)}</div>
          <div className="metric-detail">Patient balance</div>
        </div>
      </section>

      <section className="payment-panel account-ledger-form no-print">
        <label className="field">
          <span>Paid Date</span>
          <input
            type="text"
            value={paymentForm.date}
            onChange={(event) => setPaymentForm((current) => ({ ...current, date: event.target.value }))}
            placeholder="dd/mm/yyyy"
          />
        </label>
        <label className="field">
          <span>Paid Amount</span>
          <input
            type="number"
            min="0"
            value={paymentForm.amount}
            onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))}
            placeholder="Enter amount"
          />
        </label>
        <label className="field">
          <span>Payment Note</span>
          <input
            value={paymentForm.description}
            onChange={(event) => setPaymentForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Cash, card, bank transfer..."
            autoCapitalize="sentences"
            spellCheck="true"
          />
        </label>
        <button className="btn btn-primary" type="button" onClick={savePayment}>
          {editingIndex === null ? "Save payment" : "Update payment"}
        </button>
        {editingIndex !== null && (
          <button className="btn" type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </section>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Paid Amount</th>
              <th>Payment Note</th>
              <th>Remaining</th>
              <th className="no-print">Action</th>
            </tr>
          </thead>
          <tbody>
            {ledgerRows.length === 0 && (
              <tr>
                <td colSpan="5">No payment added yet.</td>
              </tr>
            )}
            {ledgerRows.map((entry) => (
              <tr key={entry.id || entry.index}>
                <td>{formatDateDisplay(entry.date)}</td>
                <td>{formatCurrency(entry.amount)}</td>
                <td>{entry.description || "-"}</td>
                <td>{formatCurrency(entry.remainingAfter)}</td>
                <td className="row-actions no-print">
                  <button className="btn btn-sm" type="button" onClick={() => editPayment(entry, entry.index)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-danger" type="button" onClick={() => deletePayment(entry.index)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccountLedger;
