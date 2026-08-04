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

const parseReportDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value);
  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoDate) {
    const [, parsedYear, parsedMonth, parsedDay] = isoDate;
    return new Date(Number(parsedYear), Number(parsedMonth) - 1, Number(parsedDay));
  }

  const localDate = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);

  if (localDate) {
    const [, parsedDay, parsedMonth, rawYear] = localDate;
    const parsedYear = rawYear.length === 2 ? `20${rawYear}` : rawYear;

    return new Date(Number(parsedYear), Number(parsedMonth) - 1, Number(parsedDay));
  }

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const dateInPeriod = (value, month, year) => {
  const date = parseReportDate(value);

  if (!date) {
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
