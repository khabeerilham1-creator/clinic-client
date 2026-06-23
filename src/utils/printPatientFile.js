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
import { DOCTOR_NAME } from "./clinicData";

const PRINT_PAGE_WIDTH_CM = 21;
const PRINT_PAGE_HEIGHT_CM = 29.7;
const INVOICE_PAGE_WIDTH_CM = 14.8;
const INVOICE_PAGE_HEIGHT_CM = 21;
const LETTERHEAD_TOP_CM = 4.35;
const LETTERHEAD_BOTTOM_CM = 2.35;
const LETTERHEAD_SIDE_CM = 1.55;
const PRINT_BODY_WIDTH_CM = 16.8;
const INVOICE_LETTERHEAD_TOP_CM = 2.55;
const INVOICE_LETTERHEAD_BOTTOM_CM = 1.55;
const INVOICE_LETTERHEAD_SIDE_CM = 1.05;
const INVOICE_BODY_WIDTH_CM = 12.55;

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

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
    return `<tr><td colspan="${columns}">${escapeHtml(emptyText)}</td></tr>`;
  }

  return rows.join("");
};

const safeList = (value) => (Array.isArray(value) ? value : []);

const selectedClinicalRows = (patient) => {
  const checkup = patient?.checkup || {};
  const rows = [];

  safeList(checkup.softTissueRecords).forEach((item, index) => {
    rows.push(`
      <tr>
        <td>${index + 1}</td>
        <td>Soft Tissue</td>
        <td>${escapeHtml(item.condition)}</td>
        <td>${escapeHtml(item.treatment)}</td>
      </tr>
    `);
  });

  safeList(checkup.hardTissueRecords).forEach((item) => {
    rows.push(`
      <tr>
        <td>${escapeHtml(item.toothNo ? `#${item.toothNo}` : rows.length + 1)}</td>
        <td>Hard Tissue</td>
        <td>${escapeHtml(item.condition)}</td>
        <td>${escapeHtml(item.treatment)}</td>
      </tr>
    `);
  });

  if (!rows.length && (checkup.selectedCondition || checkup.manualCondition)) {
    rows.push(`
      <tr>
        <td>1</td>
        <td>Soft Tissue</td>
        <td>${escapeHtml(checkup.selectedCondition || checkup.manualCondition)}</td>
        <td>${escapeHtml(checkup.suggestedTreatment || checkup.manualTreatment)}</td>
      </tr>
    `);
  }

  return rows;
};

const plannedSequenceRows = (patient) =>
  safeList(patient?.plannedSequence)
    .filter((visit) => visit.date || visit.procedure || visit.treatment || visit.details)
    .map(
      (visit, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(visit.date)}</td>
          <td>${escapeHtml(visit.procedure || visit.treatment || visit.details)}</td>
          <td>${escapeHtml(visit.status || "Planned")}</td>
        </tr>
      `
    );

const invoiceItemRows = (patient) =>
  safeList(patient?.invoice)
    .filter((item) => item.details || Number(item.cost || 0) > 0)
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.details)}</td>
          <td>${escapeHtml(item.qty)}</td>
          <td>${escapeHtml(formatCurrency(item.rate))}</td>
          <td>${escapeHtml(formatCurrency(item.cost))}</td>
        </tr>
      `
    );

const checkupPage = (patient, copyLabel, toothChartUrl) => {
  const patientBio = bio(patient);
  const clinicalRows = selectedClinicalRows(patient);
  const plannedRows = plannedSequenceRows(patient);

  return `
    <section class="checkup-page">
      <div class="sheet-mark">
        <strong>Patient Checkup Sheet</strong>
        <span>${escapeHtml(copyLabel)}</span>
      </div>

      <div class="bio-grid">
        <div><b>Reg No</b><span>${escapeHtml(regNo(patient) || "-")}</span></div>
        <div><b>Date</b><span>${escapeHtml(formatDate(patientBio.date || new Date()))}</span></div>
        <div><b>Patient</b><span>${escapeHtml(patientName(patient))}</span></div>
        <div><b>Mobile</b><span>${escapeHtml(mobileNumber(patient))}</span></div>
        <div><b>Doctor</b><span>${escapeHtml(patientBio.doctorName || DOCTOR_NAME)}</span></div>
        <div><b>Category</b><span>${escapeHtml(patientBio.category || "-")}</span></div>
        <div><b>Age</b><span>${escapeHtml(patientBio.age || "-")}</span></div>
        <div><b>Type</b><span>${escapeHtml(patientBio.patientType || "-")}</span></div>
        <div class="wide"><b>Address</b><span>${escapeHtml(patientBio.address || "-")}</span></div>
      </div>

      <div class="checkup-grid">
        <div>
          <h3>Clinical Exam</h3>
          <table>
            <thead>
              <tr><th>No / Tooth</th><th>Section</th><th>Pre-existing Condition</th><th>Suggested Treatment</th></tr>
            </thead>
            <tbody>${rowsOrEmpty(clinicalRows, 4, "No treatment details selected.")}</tbody>
          </table>

          <h3>Planned Sequence</h3>
          <table>
            <thead>
              <tr><th>S No</th><th>Date</th><th>Procedure</th><th>Status</th></tr>
            </thead>
            <tbody>${rowsOrEmpty(plannedRows, 4, "No planned sequence selected.")}</tbody>
          </table>
        </div>

        <aside>
          <h3>Dental Chart</h3>
          <img class="chart" src="${escapeHtml(toothChartUrl)}" alt="Tooth chart" />
          <div class="chart-notes">
            <b>Notes</b>
            <span>${escapeHtml(patient?.toothNotes || "No tooth chart notes.")}</span>
          </div>
        </aside>
      </div>
    </section>
  `;
};

const invoicePage = (patient, copyLabel) => {
  const patientBio = bio(patient);
  const invoiceRows = invoiceItemRows(patient);

  return `
    <section class="invoice-page">
      <div class="invoice-content">
        <div class="invoice-topline">
          <strong>Invoice</strong>
          <span>${escapeHtml(copyLabel)}</span>
        </div>

        <div class="invoice-bio">
          <div><b>Reg</b><span>${escapeHtml(regNo(patient) || "-")}</span></div>
          <div><b>Date</b><span>${escapeHtml(formatDate(patientBio.date || new Date()))}</span></div>
          <div><b>Name</b><span>${escapeHtml(patientName(patient))}</span></div>
          <div><b>Mobile</b><span>${escapeHtml(mobileNumber(patient))}</span></div>
          <div><b>Doctor</b><span>${escapeHtml(patientBio.doctorName || DOCTOR_NAME)}</span></div>
          <div><b>Cat</b><span>${escapeHtml(patientBio.category || "-")}</span></div>
        </div>

        <table class="invoice-items">
          <thead>
            <tr><th>S</th><th>Treatment / Details</th><th>Qty</th><th>Rate</th><th>Cost</th></tr>
          </thead>
          <tbody>${rowsOrEmpty(invoiceRows, 5, "No invoice items selected.")}</tbody>
        </table>

        <table class="invoice-totals">
          <tbody>
            <tr><td>Total</td><td>${escapeHtml(formatCurrency(invoiceTotal(patient)))}</td></tr>
            <tr><td>Discount (${escapeHtml(discountPercent(patient))}%)</td><td>${escapeHtml(formatCurrency(discountAmount(patient)))}</td></tr>
            <tr class="net"><td>Net Amount</td><td>${escapeHtml(formatCurrency(netAmount(patient)))}</td></tr>
            <tr><td>Paid</td><td>${escapeHtml(formatCurrency(paymentsTotal(patient)))}</td></tr>
            <tr><td>Remaining</td><td>${escapeHtml(formatCurrency(balanceDue(patient)))}</td></tr>
          </tbody>
        </table>

        <div class="invoice-signatures">
          <span>Patient Signature</span>
          <span>Receiver</span>
        </div>
      </div>
    </section>
  `;
};

export function printPatientFile(patient, toothChartSrc) {
  const printWindow = window.open("", "", "width=1200,height=900");

  if (!printWindow) {
    window.alert("Print window could not open. Please allow popups for this site.");
    return;
  }

  const toothChartUrl = new URL(toothChartSrc, window.location.origin).href;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Patient File Print</title>
        <style>
          *{box-sizing:border-box}
          html,body{margin:0;padding:0;background:#fff;color:#111827;font-family:Arial,Helvetica,sans-serif}
          body{font-size:11px}
          table{width:100%;border-collapse:collapse}
          th,td{border:1px solid #b8c2cc;padding:4px 5px;text-align:left;vertical-align:top}
          th{background:#edf2f7;font-size:9px;text-transform:uppercase;letter-spacing:.04em;color:#1f2937}
          td{font-size:10.5px;line-height:1.25}
          h3{margin:8px 0 5px;font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:#0f2747}
          .sheet-mark{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;border-bottom:2px solid #111827;padding-bottom:6px}
          .sheet-mark strong{font-size:15px;text-transform:uppercase}
          .sheet-mark span,.invoice-topline span{font-weight:800;text-transform:uppercase;color:#0f766e;letter-spacing:.08em}
          .bio-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px 13px;margin-bottom:8px}
          .bio-grid div,.invoice-bio div{display:flex;gap:6px;border-bottom:1px solid #d1d5db;padding:3px 0}
          .bio-grid .wide{grid-column:1 / -1}
          .bio-grid b{width:66px;color:#334155}
          .bio-grid span,.invoice-bio span{flex:1;min-width:0}
          .checkup-grid{display:grid;grid-template-columns:minmax(0,1fr) 62mm;gap:10px;align-items:start}
          .chart{display:block;width:100%;max-height:70mm;object-fit:contain;margin:2px auto 6px}
          .chart-notes{border:1px solid #cbd5e1;padding:6px;min-height:24mm}
          .chart-notes b,.chart-notes span{display:block}
          .chart-notes b{margin-bottom:4px;color:#334155}
          .checkup-page,.invoice-page{page-break-after:always;background:#fff}
          .checkup-page{page:clinicLetterhead;width:${PRINT_PAGE_WIDTH_CM}cm;min-height:${PRINT_PAGE_HEIGHT_CM}cm;padding:${LETTERHEAD_TOP_CM}cm ${LETTERHEAD_SIDE_CM}cm ${LETTERHEAD_BOTTOM_CM}cm}
          .invoice-page{page:invoiceLetterhead;width:${INVOICE_PAGE_WIDTH_CM}cm;min-height:${INVOICE_PAGE_HEIGHT_CM}cm;padding:${INVOICE_LETTERHEAD_TOP_CM}cm ${INVOICE_LETTERHEAD_SIDE_CM}cm ${INVOICE_LETTERHEAD_BOTTOM_CM}cm}
          .checkup-page{overflow:hidden}
          .checkup-page>*,.invoice-content{width:min(${PRINT_BODY_WIDTH_CM}cm,100%);margin-left:auto;margin-right:auto}
          .invoice-content{width:min(${INVOICE_BODY_WIDTH_CM}cm,100%);height:auto;max-height:${INVOICE_PAGE_HEIGHT_CM - INVOICE_LETTERHEAD_TOP_CM - INVOICE_LETTERHEAD_BOTTOM_CM}cm;padding:0;overflow:hidden}
          .invoice-topline{display:flex;align-items:center;justify-content:space-between;border-bottom:1.5px solid #111827;padding-bottom:.16cm;margin-bottom:.22cm}
          .invoice-topline strong{font-size:14px;text-transform:uppercase}
          .invoice-bio{display:grid;grid-template-columns:1fr 1fr;gap:.08cm .28cm;margin-bottom:.2cm}
          .invoice-bio div{font-size:9.5px;padding:.06cm 0}
          .invoice-bio b{width:1.4cm;color:#334155}
          .invoice-items th,.invoice-items td{padding:.11cm .12cm;font-size:9.2px}
          .invoice-items th:first-child,.invoice-items td:first-child{width:.75cm;text-align:center}
          .invoice-items th:nth-child(3),.invoice-items td:nth-child(3){width:1cm;text-align:center}
          .invoice-items th:nth-child(4),.invoice-items td:nth-child(4),
          .invoice-items th:nth-child(5),.invoice-items td:nth-child(5){width:2.05cm;text-align:right}
          .invoice-totals{width:6.6cm;margin:.22cm 0 0 auto}
          .invoice-totals td{font-size:9.5px;padding:.1cm .13cm}
          .invoice-totals td:first-child{font-weight:800}
          .invoice-totals td:last-child{text-align:right}
          .invoice-totals .net td{font-weight:900;background:#edfdf8}
          .invoice-signatures{display:flex;justify-content:space-between;gap:.6cm;margin-top:.45cm}
          .invoice-signatures span{width:5.5cm;border-top:1px solid #111827;text-align:center;padding-top:.12cm;font-size:9px}
          .checkup-page:last-child,.invoice-page:last-child{page-break-after:auto}
          @page clinicLetterhead{size:A4;margin:0}
          @page invoiceLetterhead{size:${INVOICE_PAGE_WIDTH_CM}cm ${INVOICE_PAGE_HEIGHT_CM}cm;margin:0}
          @media print{
            body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
            .checkup-page{min-height:auto}
          }
        </style>
      </head>
      <body>
        ${checkupPage(patient, "Clinic Copy", toothChartUrl)}
        ${invoicePage(patient, "Clinic Copy")}
        ${checkupPage(patient, "Patient Copy", toothChartUrl)}
        ${invoicePage(patient, "Patient Copy")}
        <script>window.onload=()=>setTimeout(()=>window.print(),300);<\/script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
