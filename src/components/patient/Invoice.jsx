import React from "react";

import {
  CATEGORY_OPTIONS,
  getTreatmentPrice,
  normalizeCategoryKey,
  PRICE_LIST,
} from "../../utils/clinicData";
import {
  capitalizeFirstWord,
  formatCurrency,
  formatCurrencyBlank,
  invoiceGroups,
  todayDisplayValue,
} from "../../utils/patientHelpers";
import { playSectionSound } from "../../utils/sound";

const createItem = (invoiceId, index = 0) => ({
  sno: index + 1,
  invoiceId,
  details: "",
  qty: "",
  rate: "",
  cost: "",
  manualRate: false,
});

const createInvoice = (index = 0) => {
  const id = `invoice-${Date.now()}-${index}`;

  return {
    id,
    title: `Invoice ${index + 1}`,
    invoiceNo: index + 1,
    discount: "",
    items: [createItem(id)],
  };
};

const cleanInvoices = (patientData) => {
  const groups = invoiceGroups(patientData);
  const normalized = groups.length ? groups : [createInvoice(0)];

  return normalized.map((invoice, invoiceIndex) => {
    const id = invoice.id || `invoice-${invoiceIndex + 1}`;
    const items = (invoice.items || []).length ? invoice.items : [createItem(id)];

    return {
      ...invoice,
      id,
      title: invoice.title || `Invoice ${invoiceIndex + 1}`,
      invoiceNo: invoiceIndex + 1,
      discount: invoice.discount || "",
      items: items.map((item, itemIndex) => ({
        ...item,
        invoiceId: id,
        invoiceTitle: invoice.title || `Invoice ${invoiceIndex + 1}`,
        invoiceNo: invoiceIndex + 1,
        sno: itemIndex + 1,
        qty: item.qty || "",
        rate: item.rate || "",
        cost: item.cost || "",
      })),
    };
  });
};

const flattenInvoices = (invoices) =>
  invoices.flatMap((invoice, invoiceIndex) =>
    (invoice.items || []).map((item, itemIndex) => ({
      ...item,
      invoiceId: invoice.id,
      invoiceTitle: invoice.title || `Invoice ${invoiceIndex + 1}`,
      invoiceNo: invoiceIndex + 1,
      invoiceDiscount: Number(invoice.discount || 0),
      sno: itemIndex + 1,
    }))
  );

const invoicesDiscount = (invoices) =>
  invoices.reduce((sum, invoice) => sum + Number(invoice.discount || 0), 0);

const invoiceSubtotal = (invoice) =>
  (invoice.items || []).reduce((sum, item) => sum + Number(item.cost || 0), 0);

function Invoice({ patientData, setPatientData, initialPayment, setInitialPayment }) {
  const invoices = cleanInvoices(patientData);
  const category = patientData.biography?.category || CATEGORY_OPTIONS[0].value;
  const categoryKey = normalizeCategoryKey(category);
  const payment = initialPayment || { date: todayDisplayValue(), amount: "", description: "" };

  const updateInvoices = (nextInvoices) => {
    const normalized = nextInvoices.map((invoice, invoiceIndex) => ({
      ...invoice,
      invoiceNo: invoiceIndex + 1,
      title: invoice.title || `Invoice ${invoiceIndex + 1}`,
      items: (invoice.items || []).map((item, itemIndex) => ({
        ...item,
        invoiceId: invoice.id,
        invoiceTitle: invoice.title || `Invoice ${invoiceIndex + 1}`,
        invoiceNo: invoiceIndex + 1,
        sno: itemIndex + 1,
      })),
    }));

    setPatientData((prev) => ({
      ...prev,
      invoices: normalized,
      invoice: flattenInvoices(normalized),
      discount: invoicesDiscount(normalized),
      discountPercent: 0,
    }));
  };

  const handleInvoiceChange = (invoiceIndex, field, value) => {
    const nextInvoices = invoices.map((invoice, index) =>
      index === invoiceIndex
        ? {
            ...invoice,
            [field]: field === "title" ? capitalizeFirstWord(value) : value,
          }
        : invoice
    );

    updateInvoices(nextInvoices);
  };

  const handleItemChange = (invoiceIndex, itemIndex, field, value) => {
    const nextInvoices = invoices.map((invoice, currentInvoiceIndex) => {
      if (currentInvoiceIndex !== invoiceIndex) {
        return invoice;
      }

      const items = invoice.items.map((currentItem, currentItemIndex) => {
        if (currentItemIndex !== itemIndex) {
          return currentItem;
        }

        const item = {
          ...currentItem,
          [field]: field === "details" ? capitalizeFirstWord(value) : value,
        };

        if (field === "details") {
          const autoRate = getTreatmentPrice(value, category);
          item.rate = autoRate || "";
          item.qty = item.qty || 1;
          item.manualRate = false;
        }

        if (field === "rate") {
          item.manualRate = true;
        }

        if (field === "qty" || field === "rate" || field === "details") {
          const qty = Number(item.qty || 0);
          const rate = Number(item.rate || 0);
          const cost = qty * rate;
          item.cost = cost || "";
        }

        return item;
      });

      return {
        ...invoice,
        items,
      };
    });

    updateInvoices(nextInvoices);
  };

  const addInvoice = () => {
    updateInvoices([...invoices, createInvoice(invoices.length)]);
    playSectionSound("success");
  };

  const deleteInvoice = (invoiceIndex) => {
    if (invoices.length === 1) {
      updateInvoices([createInvoice(0)]);
      return;
    }

    updateInvoices(invoices.filter((_, index) => index !== invoiceIndex));
    playSectionSound("warning");
  };

  const addRow = (invoiceIndex) => {
    const nextInvoices = invoices.map((invoice, index) =>
      index === invoiceIndex
        ? {
            ...invoice,
            items: [...invoice.items, createItem(invoice.id, invoice.items.length)],
          }
        : invoice
    );

    updateInvoices(nextInvoices);
    playSectionSound("success");
  };

  const deleteRow = (invoiceIndex, itemIndex) => {
    const nextInvoices = invoices.map((invoice, index) => {
      if (index !== invoiceIndex) {
        return invoice;
      }

      const items = invoice.items.filter((_, rowIndex) => rowIndex !== itemIndex);

      return {
        ...invoice,
        items: items.length ? items : [createItem(invoice.id)],
      };
    });

    updateInvoices(nextInvoices);
    playSectionSound("warning");
  };

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoiceSubtotal(invoice), 0);
  const discountAmount = invoicesDiscount(invoices);
  const netCost = Math.max(totalAmount - discountAmount, 0);

  return (
    <div>
      <div className="panel-heading">
        <div>
          <h2>Invoice</h2>
          <p>Prices auto-fill from the clinic price list for {category}.</p>
        </div>

        <button onClick={addInvoice} className="btn btn-dark no-print" type="button">
          + Add Invoice
        </button>
      </div>

      <datalist id="treatment-price-list">
        {PRICE_LIST.map((item) => (
          <option key={item.description} value={item.description}>
            {formatCurrency(item[categoryKey] || 0)}
          </option>
        ))}
      </datalist>

      {/* Treatment Summary Block */}
      <section className="detail-card treatment-summary-card no-print" style={{ marginBottom: "24px" }}>
        <div className="panel-heading" style={{ marginBottom: "12px" }}>
          <div>
            <h3>Clinical Exam Treatment Summary</h3>
            <p className="text-sm text-slate-500">Suggested treatments and lab tasks from the patient's clinical examination.</p>
          </div>
        </div>
        <div className="data-table-wrap">
          <table className="data-table compact-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>Tooth No</th>
                <th>Condition / Task</th>
                <th>Suggested Treatment / Task</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const softRecords = patientData.checkup?.softTissueRecords || [];
                const hardRecords = patientData.checkup?.hardTissueRecords || [];
                const labRecords = patientData.checkup?.labTaskRecords || [];

                if (softRecords.length === 0 && hardRecords.length === 0 && labRecords.length === 0) {
                  return (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", color: "#64748b", padding: "12px" }}>
                        No treatment suggestions selected in Clinical Exam yet.
                      </td>
                    </tr>
                  );
                }

                const rows = [];
                softRecords.forEach((item, index) => {
                  rows.push(
                    <tr key={`soft-${index}`}>
                      <td style={{ fontWeight: "600", color: "#475569" }}>Soft Tissue</td>
                      <td>-</td>
                      <td>{item.condition || "-"}</td>
                      <td style={{ fontWeight: "600" }}>{item.treatment || "-"}</td>
                    </tr>
                  );
                });

                hardRecords.forEach((item, index) => {
                  const toothLabel = Array.isArray(item.toothNos) && item.toothNos.length
                    ? item.toothNos.length === 32
                      ? "All 32"
                      : item.toothNos.map((toothNo) => `#${toothNo}`).join(", ")
                    : item.toothNo
                      ? `#${item.toothNo}`
                      : "-";

                  rows.push(
                    <tr key={`hard-${index}`}>
                      <td style={{ fontWeight: "600", color: "#1e3a8a" }}>Hard Tissue</td>
                      <td>{toothLabel}</td>
                      <td>{item.condition || "-"}</td>
                      <td style={{ fontWeight: "600" }}>{item.treatment || "-"}</td>
                    </tr>
                  );
                });

                labRecords.forEach((item, index) => {
                  const toothLabel = Array.isArray(item.toothNos) && item.toothNos.length
                    ? item.toothNos.length === 32
                      ? "All 32"
                      : item.toothNos.map((toothNo) => `#${toothNo}`).join(", ")
                    : item.toothNo
                      ? `#${item.toothNo}`
                      : "-";

                  rows.push(
                    <tr key={`lab-${index}`}>
                      <td style={{ fontWeight: "600", color: "#0d9488" }}>Lab Task</td>
                      <td>{toothLabel}</td>
                      <td>{item.condition || "-"}</td>
                      <td style={{ fontWeight: "600" }}>{item.treatment || "-"}</td>
                    </tr>
                  );
                });

                return rows;
              })()}
            </tbody>
          </table>
        </div>
      </section>

      {invoices.map((invoice, invoiceIndex) => {
        const subtotal = invoiceSubtotal(invoice);
        const invoiceDiscount = Number(invoice.discount || 0);
        const invoiceNet = Math.max(subtotal - invoiceDiscount, 0);

        return (
          <section className="detail-card" key={invoice.id}>
            <div className="panel-heading">
              <label className="field inline-field">
                <span>Invoice Name</span>
                <input
                  value={invoice.title}
                  onChange={(event) => handleInvoiceChange(invoiceIndex, "title", event.target.value)}
                  autoCapitalize="words"
                  spellCheck="true"
                />
              </label>

              <div className="row-actions no-print">
                <button className="btn btn-sm" type="button" onClick={() => addRow(invoiceIndex)}>
                  + Add Item
                </button>
                <button className="btn btn-sm btn-danger" type="button" onClick={() => deleteInvoice(invoiceIndex)}>
                  Delete Invoice
                </button>
              </div>
            </div>

            <div className="data-table-wrap">
              <table className="data-table invoice-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Treatment / Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Cost</th>
                    <th className="no-print">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {invoice.items.map((item, itemIndex) => (
                    <tr key={`${invoice.id}-${itemIndex}`}>
                      <td>{itemIndex + 1}</td>
                      <td>
                        <input
                          list="treatment-price-list"
                          value={item.details || ""}
                          onChange={(event) =>
                            handleItemChange(invoiceIndex, itemIndex, "details", event.target.value)
                          }
                          placeholder="Select or type treatment"
                          className="table-input"
                          autoCapitalize="words"
                          spellCheck="true"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={item.qty || ""}
                          onChange={(event) => handleItemChange(invoiceIndex, itemIndex, "qty", event.target.value)}
                          className="table-input small"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={item.rate || ""}
                          onChange={(event) => handleItemChange(invoiceIndex, itemIndex, "rate", event.target.value)}
                          className="table-input"
                        />
                      </td>
                      <td>
                        <strong>{formatCurrencyBlank(item.cost)}</strong>
                      </td>
                      <td className="no-print">
                        <button
                          onClick={() => deleteRow(invoiceIndex, itemIndex)}
                          className="btn btn-sm btn-danger"
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="invoice-total-panel">
              <div>
                <span>Total Amount</span>
                <strong>{formatCurrencyBlank(subtotal)}</strong>
              </div>

              <label className="field">
                <span>Discount Amount</span>
                <input
                  type="number"
                  min="0"
                  value={invoice.discount || ""}
                  onChange={(event) => handleInvoiceChange(invoiceIndex, "discount", event.target.value)}
                  placeholder="Discount amount"
                />
              </label>

              <div className="net-total">
                <span>Net Cost</span>
                <strong>{formatCurrencyBlank(invoiceNet)}</strong>
              </div>
            </div>
          </section>
        );
      })}

      <div className="invoice-total-panel">
        <div>
          <span>All Invoices</span>
          <strong>{formatCurrencyBlank(totalAmount)}</strong>
        </div>
        <div>
          <span>Total Discount</span>
          <strong>{formatCurrencyBlank(discountAmount)}</strong>
        </div>
        <div className="net-total">
          <span>Total Net</span>
          <strong>{formatCurrencyBlank(netCost)}</strong>
        </div>
      </div>

      {initialPayment && setInitialPayment && (
        <div className="payment-panel no-print">
          <label className="field">
            <span>Paid Date</span>
            <input
              type="text"
              value={payment.date}
              onChange={(event) => setInitialPayment((current) => ({ ...current, date: event.target.value }))}
              placeholder="dd/mm/yyyy"
              inputMode="numeric"
            />
          </label>
          <label className="field">
            <span>Paid Now</span>
            <input
              type="number"
              min="0"
              value={payment.amount}
              onChange={(event) => setInitialPayment((current) => ({ ...current, amount: event.target.value }))}
              placeholder="Amount received"
            />
          </label>
          <label className="field">
            <span>Payment Note</span>
            <input
              value={payment.description}
              onChange={(event) =>
                setInitialPayment((current) => ({
                  ...current,
                  description: capitalizeFirstWord(event.target.value),
                }))
              }
              placeholder="Cash, card, bank transfer..."
              autoCapitalize="sentences"
              spellCheck="true"
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default Invoice;
