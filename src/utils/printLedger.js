import { CLINIC_NAME, DOCTOR_NAME } from "./clinicData";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const baseStyles = `
  body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#111827}
  h1{font-size:18px;margin:0 0 4px;text-align:center;text-transform:uppercase}
  h2{font-size:14px;margin:0 0 16px;text-align:center;color:#334155;font-weight:600}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{border:1px solid #111827;padding:6px 8px;font-size:12px}
  th{font-weight:700;text-align:center}
  .amount{text-align:right}
  .center{text-align:center}
  .total-row td{font-weight:700}
  .total-box{border:2px solid #111827;padding:6px 10px;display:inline-block;font-weight:700}
  .summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0}
  .summary-grid div{border:1px solid #111827;padding:8px}
  .summary-grid span{display:block;font-size:11px;color:#475569}
  .summary-grid strong{display:block;margin-top:4px;font-size:14px}
`;

export const openPrintWindow = ({ title, subtitle, bodyHtml }) => {
  const printWindow = window.open("", "", "width=980,height=760");

  if (!printWindow) {
    window.alert("Print window could not open. Please allow popups.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <h1>${escapeHtml(CLINIC_NAME)}</h1>
        <h2>${escapeHtml(subtitle || DOCTOR_NAME)}</h2>
        ${bodyHtml}
        <script>window.onload=()=>setTimeout(()=>window.print(),250);<\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export const printElement = (elementId, title) => {
  const node = document.getElementById(elementId);

  if (!node) {
    window.print();
    return;
  }

  openPrintWindow({
    title,
    subtitle: title,
    bodyHtml: node.innerHTML,
  });
};

export { escapeHtml };
