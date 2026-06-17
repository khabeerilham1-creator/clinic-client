import React, { useEffect } from "react";

import {
  CATEGORY_OPTIONS,
  getTreatmentPrice,
  normalizeCategoryKey,
  PRICE_LIST,
} from "../../utils/clinicData";
import { formatCurrency } from "../../utils/patientHelpers";
import { playSectionSound } from "../../utils/sound";

function Invoice({ patientData, setPatientData }) {
  const items = patientData.invoice || [];
  const category = patientData.biography?.category || CATEGORY_OPTIONS[0].value;
  const categoryKey = normalizeCategoryKey(category);
  const discountPercent = Number(patientData.discountPercent || 0);

  useEffect(() => {
    if (items.length === 0) {
      setPatientData((prev) => ({
        ...prev,
        invoice: [
          {
            sno: 1,
            details: "",
            qty: 1,
            rate: 0,
            cost: 0,
            manualRate: false,
          },
        ],
        discount: 0,
        discountPercent: 0,
      }));
    }
  }, []);

  const updateItems = (updatedItems, extra = {}) => {
    const totalAmount = updatedItems.reduce((total, item) => total + Number(item.cost || 0), 0);
    const discountAmount = Math.round((totalAmount * Number(extra.discountPercent ?? discountPercent)) / 100);

    setPatientData((prev) => ({
      ...prev,
      ...extra,
      discount: discountAmount,
      invoice: updatedItems,
    }));
  };

  const handleChange = (index, field, value) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index], [field]: value };

    if (field === "details") {
      const autoRate = getTreatmentPrice(value, category);
      item.rate = autoRate;
      item.manualRate = false;
    }

    if (field === "rate") {
      item.manualRate = true;
    }

    if (field === "qty" || field === "rate" || field === "details") {
      item.cost = Number(item.qty || 0) * Number(item.rate || 0);
    }

    updatedItems[index] = item;
    updateItems(updatedItems);
  };

  const addRow = () => {
    updateItems([
      ...items,
      {
        sno: items.length + 1,
        details: "",
        qty: 1,
        rate: 0,
        cost: 0,
        manualRate: false,
      },
    ]);
    playSectionSound("success");
  };

  const deleteRow = (index) => {
    const updatedItems = items
      .filter((_, i) => i !== index)
      .map((item, i) => ({
        ...item,
        sno: i + 1,
      }));

    updateItems(updatedItems);
    playSectionSound("warning");
  };

  const handleDiscountChange = (value) => {
    const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
    updateItems(items, { discountPercent: safeValue });
  };

  const totalAmount = items.reduce((total, item) => total + Number(item.cost || 0), 0);
  const discountAmount = Math.round((totalAmount * discountPercent) / 100);
  const netCost = Math.max(totalAmount - discountAmount, 0);

  return (
    <div>
      <div className="panel-heading">
        <div>
          <h2>Invoice</h2>
          <p>Prices auto-fill from the clinic price list for {category}.</p>
        </div>

        <button onClick={addRow} className="btn btn-dark no-print" type="button">
          + Add Item
        </button>
      </div>

      <datalist id="treatment-price-list">
        {PRICE_LIST.map((item) => (
          <option key={item.description} value={item.description}>
            {formatCurrency(item[categoryKey])}
          </option>
        ))}
      </datalist>

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
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.sno || index + 1}</td>
                <td>
                  <input
                    list="treatment-price-list"
                    value={item.details || ""}
                    onChange={(event) => handleChange(index, "details", event.target.value)}
                    placeholder="Select or type treatment"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.qty}
                    onChange={(event) => handleChange(index, "qty", event.target.value)}
                    className="table-input small"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={(event) => handleChange(index, "rate", event.target.value)}
                    className="table-input"
                  />
                </td>
                <td>
                  <strong>{formatCurrency(item.cost)}</strong>
                </td>
                <td className="no-print">
                  <button onClick={() => deleteRow(index)} className="btn btn-sm btn-danger" type="button">
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
          <strong>{formatCurrency(totalAmount)}</strong>
        </div>

        <label className="field">
          <span>Discount %</span>
          <input
            type="number"
            min="0"
            max="100"
            value={discountPercent}
            onChange={(event) => handleDiscountChange(event.target.value)}
          />
        </label>

        <div>
          <span>Discount Amount</span>
          <strong>{formatCurrency(discountAmount)}</strong>
        </div>

        <div className="net-total">
          <span>Net Cost</span>
          <strong>{formatCurrency(netCost)}</strong>
        </div>
      </div>
    </div>
  );
}

export default Invoice;
