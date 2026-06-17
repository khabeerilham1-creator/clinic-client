import {
  balanceDue,
  bio,
  discountAmount,
  discountPercent,
  formatCurrency,
  invoiceTotal,
  mobileNumber,
  netAmount,
  patientName,
  paymentsTotal,
  regNo,
} from "./patientHelpers";
import { CLINIC_LOCATION, CLINIC_NAME, DOCTOR_NAME } from "./clinicData";

const formatDate = (value) => {
  const date = value ? new Date(`${value}`.includes("T") ? value : `${value}T00:00:00`) : new Date();

  if (Number.isNaN(date.getTime())) {
    return value || "";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const rowsOrEmpty = (rows, columns, emptyText) => {
  if (!rows.length) {
    return `<tr><td colspan="${columns}">${emptyText}</td></tr>`;
  }

  return rows.join("");
};

const selectedClinicalRows = (patient) => {
  const checkup = patient?.checkup || {};
  const rows = [];

  (checkup.softTissueRecords || []).forEach((item, index) => {
    rows.push(`
      <tr>
        <td>${index + 1}</td>
        <td>Soft Tissue</td>
        <td>${item.condition || ""}</td>
        <td>${item.treatment || ""}</td>
      </tr>
    `);
  });

  (checkup.hardTissueRecords || []).forEach((item, index) => {
    rows.push(`
      <tr>
        <td>${rows.length + 1}</td>
        <td>Hard Tissue</td>
        <td>${item.condition || ""}</td>
        <td>${item.treatment || ""}</td>
      </tr>
    `);
  });

  if (!rows.length && (checkup.selectedCondition || checkup.manualCondition)) {
    rows.push(`
      <tr>
        <td>1</td>
        <td>Soft Tissue</td>
        <td>${checkup.selectedCondition || checkup.manualCondition || ""}</td>
        <td>${checkup.suggestedTreatment || checkup.manualTreatment || ""}</td>
      </tr>
    `);
  }

  return rows;
};

const copyPage = (patient, copyLabel, toothChartUrl) => {
  const patientBio = bio(patient);
  const clinicalRows = selectedClinicalRows(patient);
  const plannedRows = (patient?.plannedSequence || [])
    .filter((visit) => visit.date || visit.procedure || visit.treatment || visit.details)
    .map(
      (visit, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${visit.date || ""}</td>
          <td>${visit.procedure || visit.treatment || visit.details || ""}</td>
          <td>${visit.status || "Planned"}</td>
        </tr>
      `
    );
  const invoiceRows = (patient?.invoice || [])
    .filter((item) => item.details || Number(item.cost || 0) > 0)
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.details || ""}</td>
          <td>${item.qty || ""}</td>
          <td>${formatCurrency(item.rate)}</td>
          <td>${formatCurrency(item.cost)}</td>
        </tr>
      `
    );

  return `
    <section class="copy-page">
      <div class="copy-label">${copyLabel}</div>
      <header>
        <h1>${CLINIC_NAME}</h1>
        <h2>${DOCTOR_NAME}</h2>
        <p>${CLINIC_LOCATION} &middot; ${formatDate(patientBio.date || new Date())}</p>
      </header>

      <div class="bio-grid">
        <div><b>Reg No</b><span>${regNo(patient) || "-"}</span></div>
        <div><b>Patient</b><span>${patientName(patient)}</span></div>
        <div><b>Mobile</b><span>${mobileNumber(patient)}</span></div>
        <div><b>Doctor</b><span>${patientBio.doctorName || DOCTOR_NAME}</span></div>
        <div><b>Category</b><span>${patientBio.category || "-"}</span></div>
        <div><b>Age</b><span>${patientBio.age || "-"}</span></div>
      </div>

      <h3>Treatment Details</h3>
      <table>
        <tr><th>S No</th><th>Section</th><th>Pre-existing Condition</th><th>Suggested Treatment</th></tr>
        ${rowsOrEmpty(clinicalRows, 4, "No treatment details selected.")}
      </table>

      <h3>Dental Chart</h3>
      <img class="chart" src="${toothChartUrl}" alt="Tooth chart" />

      <h3>Planned Sequence</h3>
      <table>
        <tr><th>S No</th><th>Date</th><th>Procedure</th><th>Status</th></tr>
        ${rowsOrEmpty(plannedRows, 4, "No planned sequence selected.")}
      </table>

      <h3>Invoice</h3>
      <table>
        <tr><th>S No</th><th>Item</th><th>Qty</th><th>Rate</th><th>Cost</th></tr>
        ${rowsOrEmpty(invoiceRows, 5, "No invoice items selected.")}
      </table>

      <table class="totals">
        <tr><td>Total</td><td>${formatCurrency(invoiceTotal(patient))}</td></tr>
        <tr><td>Discount (${discountPercent(patient)}%)</td><td>${formatCurrency(discountAmount(patient))}</td></tr>
        <tr><td>Net Amount</td><td>${formatCurrency(netAmount(patient))}</td></tr>
        <tr><td>Paid</td><td>${formatCurrency(paymentsTotal(patient))}</td></tr>
        <tr><td>Remaining</td><td>${formatCurrency(balanceDue(patient))}</td></tr>
      </table>

      <footer>
        <div>Patient Signature</div>
        <div>Doctor Signature</div>
      </footer>
    </section>
  `;
};

export function printPatientFile(patient, toothChartSrc) {
  const printWindow = window.open("", "", "width=1200,height=900");
  const toothChartUrl = window.location.origin + toothChartSrc;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${CLINIC_NAME} Patient File</title>
        <style>
          *{box-sizing:border-box}
          body{font-family:Arial,sans-serif;color:#111827;margin:0;background:#fff}
          .copy-page{min-height:100vh;padding:26px 34px;page-break-after:always}
          .copy-page:last-child{page-break-after:auto}
          .copy-label{text-align:right;font-size:13px;font-weight:800;color:#0f766e;text-transform:uppercase;letter-spacing:.08em}
          header{text-align:center;border-bottom:2px solid #111827;padding-bottom:10px;margin-bottom:16px}
          header h1{font-size:25px;margin:0 0 4px;text-transform:uppercase}
          header h2{font-size:17px;margin:0 0 4px}
          header p{font-size:12px;margin:0;color:#475569}
          .bio-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px 18px;margin:14px 0 16px}
          .bio-grid div{display:flex;border-bottom:1px solid #d1d5db;padding:5px 0;font-size:12px}
          .bio-grid b{width:92px;color:#334155}
          .bio-grid span{flex:1}
          h3{font-size:13px;margin:14px 0 6px;text-transform:uppercase;letter-spacing:.08em;color:#0f2747}
          table{width:100%;border-collapse:collapse;margin-bottom:10px}
          th{background:#eef2f7;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
          th,td{border:1px solid #cbd5e1;padding:6px 8px;font-size:11.5px;vertical-align:top}
          .chart{display:block;max-width:620px;width:100%;margin:6px auto 10px}
          .totals{width:330px;margin-left:auto}
          .totals td:first-child{font-weight:800}
          .totals td:last-child{text-align:right}
          footer{display:flex;justify-content:space-between;margin-top:34px}
          footer div{width:210px;border-top:1px solid #111827;text-align:center;padding-top:6px;font-size:11px}
          @page{size:A4;margin:10mm}
          @media print{.copy-page{padding:0;min-height:auto}}
        </style>
      </head>
      <body>
        ${copyPage(patient, "Clinic Copy", toothChartUrl)}
        ${copyPage(patient, "Patient Copy", toothChartUrl)}
        <script>window.onload=()=>setTimeout(()=>window.print(),300);<\/script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
