export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const currentPeriod = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

export const periodLabel = (month, year) => `${MONTH_NAMES[month - 1]}-${year}`;

export const monthBounds = (month, year) => ({
  start: new Date(year, month - 1, 1),
  end: new Date(year, month, 0, 23, 59, 59, 999),
});

export const dateInPeriod = (value, month, year) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getMonth() + 1 === month && date.getFullYear() === year;
};

export const recordInPeriod = (record, month, year) => {
  if (Number(record?.periodMonth) === month && Number(record?.periodYear) === year) {
    return true;
  }

  return dateInPeriod(record?.date || record?.createdAt, month, year);
};

export const previousPeriod = (month, year) => {
  if (month === 1) {
    return { month: 12, year: year - 1 };
  }

  return { month: month - 1, year };
};

export const periodSelectOptions = (yearsBack = 3) => {
  const { month, year } = currentPeriod();
  const options = [];

  for (let offset = 0; offset < yearsBack * 12; offset += 1) {
    let targetMonth = month - offset;
    let targetYear = year;

    while (targetMonth < 1) {
      targetMonth += 12;
      targetYear -= 1;
    }

    options.push({
      month: targetMonth,
      year: targetYear,
      label: periodLabel(targetMonth, targetYear),
    });
  }

  return options;
};
