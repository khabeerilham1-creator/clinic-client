import React from "react";

import {
  CATEGORY_OPTIONS,
  normalizeCategoryKey,
  PRICE_LIST,
} from "../../utils/clinicData";
import { formatCurrency } from "../../utils/patientHelpers";

function PriceListPanel({ category }) {
  const categoryKey = normalizeCategoryKey(category || CATEGORY_OPTIONS[0].value);

  return (
    <section className="price-list-panel detail-card">
      <div className="panel-heading">
        <div>
          <h3>Price List</h3>
          <p>Clinic treatment prices by client category.</p>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table price-list-table">
          <thead>
            <tr>
              <th>Treatment</th>
              <th className={categoryKey === "category1" ? "active-price-category" : ""}>Category 1</th>
              <th className={categoryKey === "category2" ? "active-price-category" : ""}>Category 2</th>
              <th className={categoryKey === "category3" ? "active-price-category" : ""}>Category 3</th>
              <th className={categoryKey === "category4" ? "active-price-category" : ""}>Free</th>
            </tr>
          </thead>
          <tbody>
            {PRICE_LIST.map((item) => (
              <tr key={item.description}>
                <td>
                  <strong>{item.description}</strong>
                </td>
                <td className={categoryKey === "category1" ? "active-price-category" : ""}>
                  {formatCurrency(item.category1)}
                </td>
                <td className={categoryKey === "category2" ? "active-price-category" : ""}>
                  {formatCurrency(item.category2)}
                </td>
                <td className={categoryKey === "category3" ? "active-price-category" : ""}>
                  {formatCurrency(item.category3)}
                </td>
                <td className={categoryKey === "category4" ? "active-price-category" : ""}>
                  {formatCurrency(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default PriceListPanel;
