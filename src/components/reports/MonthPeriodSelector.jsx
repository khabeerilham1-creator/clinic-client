import React from "react";

import { currentPeriod, periodSelectOptions } from "../../utils/reportPeriod";

function MonthPeriodSelector({ month, year, onChange }) {
  const active = currentPeriod();
  const options = periodSelectOptions(4);

  const handleChange = (event) => {
    const [nextMonth, nextYear] = event.target.value.split("-").map(Number);
    onChange(nextMonth, nextYear);
  };

  return (
    <label className="field inline-field period-selector no-print">
      <span>Period</span>
      <select value={`${month}-${year}`} onChange={handleChange}>
        {options.map((option) => (
          <option key={`${option.month}-${option.year}`} value={`${option.month}-${option.year}`}>
            {option.label}
            {option.month === active.month && option.year === active.year ? " (Current)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

export default MonthPeriodSelector;
