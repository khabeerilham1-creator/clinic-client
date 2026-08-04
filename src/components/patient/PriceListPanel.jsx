import React from "react";

import {
  PRICE_LIST_SECTIONS,
} from "../../utils/clinicData";
import { formatCurrency } from "../../utils/patientHelpers";

const displayPrice = (price) => {
  if (typeof price === "number") {
    return formatCurrency(price);
  }

  return price || "-";
};

function PriceListPanel() {
  return (
    <section className="price-list-panel detail-card">
      <div className="panel-heading">
        <div>
          <h3>Price List</h3>
          <p>Clinic treatment prices.</p>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table price-list-table">
          <thead>
            <tr>
              <th>Section</th>
              <th>Treatment</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {PRICE_LIST_SECTIONS.flatMap((section) =>
              section.items.map(([description, price], index) => (
                <tr key={`${section.section}-${description}`}>
                  {index === 0 && (
                    <td rowSpan={section.items.length}>
                      <strong>{section.section}</strong>
                    </td>
                  )}
                  <td>{description}</td>
                  <td>
                    <strong>{displayPrice(price)}</strong>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default PriceListPanel;
