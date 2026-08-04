import {
  balanceDue,
  bio,
  formatCurrencyBlank,
  formatDateDisplay,
  invoiceGroups,
  mobileNumber,
  netAmount,
  patientName,
  plannedVisitStatus,
  titledPatientName,
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
  if (!value) return "";
  const formatted = formatDateDisplay(value);

  return formatted || value || "";
};

const formatOptionalDate = (value) => (value ? formatDateDisplay(value) || value : "");

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
    const toothLabel =
      Array.isArray(item.toothNos) && item.toothNos.length
        ? item.toothNos.length === 32
          ? "All 32"
          : item.toothNos.map((toothNo) => `#${toothNo}`).join(", ")
        : item.toothNo
          ? `#${item.toothNo}`
          : rows.length + 1;

    rows.push(`
      <tr>
        <td>${escapeHtml(toothLabel)}</td>
        <td>Hard Tissue</td>
        <td>${escapeHtml(item.condition)}</td>
        <td>${escapeHtml(item.treatment)}</td>
      </tr>
    `);
  });

  safeList(checkup.labTaskRecords).forEach((item) => {
    const toothLabel =
      Array.isArray(item.toothNos) && item.toothNos.length
        ? item.toothNos.length === 32
          ? "All 32"
          : item.toothNos.map((toothNo) => `#${toothNo}`).join(", ")
        : item.toothNo
          ? `#${item.toothNo}`
          : rows.length + 1;

    rows.push(`
      <tr>
        <td>${escapeHtml(toothLabel)}</td>
        <td>Lab Task</td>
        <td>${escapeHtml(item.condition)}</td>
        <td>${escapeHtml(item.treatment)}</td>
      </tr>
    `);
  });

  // Live/unsaved selections fallback (if they are selected/mentioned in the inputs, make sure they print)
  const unsavedList = [];

  if (checkup.selectedCondition || checkup.manualCondition) {
    const condition = checkup.selectedCondition || checkup.manualCondition;
    const exists = rows.some((r) => r.includes(escapeHtml(condition)));
    if (!exists) {
      unsavedList.push(`
        <tr>
          <td>${rows.length + unsavedList.length + 1}</td>
          <td>Soft Tissue</td>
          <td>${escapeHtml(condition)}</td>
          <td>${escapeHtml(checkup.suggestedTreatment || checkup.manualTreatment)}</td>
        </tr>
      `);
    }
  }

  if (checkup.hardSelectedCondition || checkup.hardManualCondition) {
    const condition = checkup.hardSelectedCondition || checkup.hardManualCondition;
    const exists = rows.some((r) => r.includes(escapeHtml(condition)));
    if (!exists) {
      const toothLabel = checkup.selectedToothNo ? `#${checkup.selectedToothNo}` : (rows.length + unsavedList.length + 1);
      unsavedList.push(`
        <tr>
          <td>${escapeHtml(toothLabel)}</td>
          <td>Hard Tissue</td>
          <td>${escapeHtml(condition)}</td>
          <td>${escapeHtml(checkup.hardSuggestedTreatment || checkup.hardManualTreatment)}</td>
        </tr>
      `);
    }
  }

  if (checkup.labSelectedCondition || checkup.labManualCondition) {
    const condition = checkup.labSelectedCondition || checkup.labManualCondition;
    const exists = rows.some((r) => r.includes(escapeHtml(condition)));
    if (!exists) {
      const toothLabel = checkup.labSelectedToothNo ? `#${checkup.labSelectedToothNo}` : (rows.length + unsavedList.length + 1);
      unsavedList.push(`
        <tr>
          <td>${escapeHtml(toothLabel)}</td>
          <td>Lab Task</td>
          <td>${escapeHtml(condition)}</td>
          <td>${escapeHtml(checkup.labSuggestedTreatment || checkup.labManualTreatment)}</td>
        </tr>
      `);
    }
  }

  if (unsavedList.length > 0) {
    rows.push(...unsavedList);
  }

  return rows;
};

const plannedSequenceRows = (patient) =>
  safeList(patient?.plannedSequence)
    .filter((visit) => visit.date || visit.time || visit.procedure || visit.treatment || visit.details)
    .map(
      (visit, index) => {
        const status = plannedVisitStatus(visit) === "Done" ? "Done" : "Planned";

        return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(formatDate(visit.date))}</td>
          <td>${escapeHtml(visit.time || "-")}</td>
          <td>${escapeHtml(visit.procedure || visit.treatment || visit.details)}</td>
          <td>${escapeHtml(status)}</td>
        </tr>
      `;
      }
    );

const invoiceItemRows = (items) =>
  safeList(items)
    .filter((item) => item.details || Number(item.cost || 0) > 0)
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.details)}</td>
          <td>${escapeHtml(item.qty || "")}</td>
          <td>${escapeHtml(formatCurrencyBlank(item.rate))}</td>
          <td>${escapeHtml(formatCurrencyBlank(item.cost))}</td>
        </tr>
      `
    );

const paymentRows = (patient) =>
  safeList(patient?.accountLedger)
    .filter((entry) => Number(entry.amount || 0) > 0)
    .map(
      (entry, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(formatDate(entry.date || entry.timestamp))}</td>
          <td>${escapeHtml(entry.description || "")}</td>
          <td>${escapeHtml(formatCurrencyBlank(entry.amount))}</td>
        </tr>
      `
    );

const plainValue = (value) => escapeHtml(value || "-");

const tableRows = (rows, columns, emptyText) =>
  rowsOrEmpty(
    rows.map((cells) => `<tr>${cells.map((cell) => `<td>${plainValue(cell)}</td>`).join("")}</tr>`),
    columns,
    emptyText
  );

const specialtyBioGrid = (patient, includeFileNo = false) => {
  const patientBio = bio(patient);
  const rows = [
    ["Name", titledPatientName(patient), "Date", formatDate(patientBio.date || new Date())],
    ["Birthdate", patientBio.birthDate || "", "Gender", patientBio.gender || ""],
    ["Address", patientBio.address || "", "Contact", patientBio.cellNo || mobileNumber(patient)],
  ];

  if (includeFileNo) {
    rows.splice(1, 0, ["Age", patientBio.age || "", "File No", patientBio.fileNo || regNo(patient)]);
  }

  return `
    <table class="specialty-bio">
      <tbody>
        ${rows
          .map(
            ([leftLabel, leftValue, rightLabel, rightValue]) => `
              <tr>
                <th>${escapeHtml(leftLabel)}</th>
                <td>${plainValue(leftValue)}</td>
                <th>${escapeHtml(rightLabel)}</th>
                <td>${plainValue(rightValue)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
};

const optionValue = (value, options) =>
  options.map((option) => `${value === option ? "[x]" : "[ ]"} ${option}`).join("   ");

const orthodonticAssessmentPage = (patient) => {
  const assessment = patient?.orthodonticAssessment || {};
  const diagnosis = safeList(assessment.diagnosis);
  const habits = safeList(assessment.habits);

  return `
    <section class="specialty-page">
      <h1>Orthodontic Assessment Sheet</h1>
      ${specialtyBioGrid(patient)}

      <h2>Extra Oral Assessment</h2>
      <table class="line-table">
        <tbody>
          <tr><th>Facial Profile</th><td>${escapeHtml(optionValue(assessment.facialProfile, ["Concave", "Convex", "Straight"]))}</td></tr>
          <tr><th>Lips</th><td>${escapeHtml(optionValue(assessment.lips, ["Together at Rest", "Apart at Rest"]))}</td></tr>
          <tr><th>Habits</th><td>${escapeHtml(["Thumb Sucking", "Tongue Thrusting", "Bruxism"].map((habit) => `${habits.includes(habit) ? "[x]" : "[ ]"} ${habit}`).join("   "))}</td></tr>
        </tbody>
      </table>

      <h2>Intra Oral Assessment</h2>
      <table class="line-table">
        <tbody>
          <tr><th>Arch Space</th><td>${escapeHtml(optionValue(assessment.archSpace, ["Adequate", "Deficient"]))}</td></tr>
          <tr><th>Midline deviation</th><td>${escapeHtml(optionValue(assessment.midlineDeviation, ["Yes", "No"]))}</td></tr>
          <tr><th>Cross Bite</th><td>${escapeHtml(optionValue(assessment.crossBite, ["Yes", "No"]))}</td></tr>
        </tbody>
      </table>

      <h2>Occlusal Assessment</h2>
      <table class="line-table">
        <tbody>
          <tr><th>Permanent Molars</th><td>${escapeHtml(optionValue(assessment.permanentMolars, ["Class I", "Class II", "Class III"]))}</td></tr>
          <tr><th>Canines</th><td>${escapeHtml(optionValue(assessment.canines, ["Class I", "Class II", "Class III"]))}</td></tr>
          <tr><th>Over jet</th><td>${plainValue(assessment.overjet)} mm</td></tr>
          <tr><th>Deep Bite</th><td>${plainValue(assessment.deepBite)} mm</td></tr>
        </tbody>
      </table>

      <h2>Diagnosis</h2>
      <table class="diagnosis-print">
        <tbody>
          ${Array.from({ length: 7 }, (_, index) => `
            <tr><th>${index + 1}</th><td>${plainValue(diagnosis[index])}</td></tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
};

const orthodonticAdjustmentsPage = (patient) => {
  const savedRows = safeList(patient?.orthodonticAdjustments);
  const rows = savedRows.length >= 18 ? savedRows : [...savedRows, ...Array.from({ length: 18 - savedRows.length }, () => ({}))];

  return `
    <section class="specialty-page">
      <h1>Monthly Adjustment Sheet</h1>
      ${specialtyBioGrid(patient)}
      <table class="line-table adjustment-print">
        <thead><tr><th>Visit #</th><th>Date</th><th>Procedure</th></tr></thead>
        <tbody>
          ${rows
            .map(
              (row, index) => `
                <tr>
                  <td>${plainValue(row.visit || index + 1)}</td>
                  <td>${plainValue(formatOptionalDate(row.date))}</td>
                  <td>${plainValue(row.procedure)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
};

const fullDenturePage = (patient) => {
  const denture = patient?.fullDenture || {};
  const procedures = ["Initial Impression", "Bite registration OVD", "Trial", "Final Impression", "Final Insertion"].map(
    (procedure, index) => ({
      procedure,
      ...(denture.clinicalProcedure?.[index] || {}),
    })
  );

  return `
    <section class="specialty-page">
      <h1>Full Denture Sheet</h1>
      ${specialtyBioGrid(patient, true)}

      <h2>Dental History</h2>
      <table class="line-table">
        <tbody>
          <tr><th>Edentulous Months/Years</th><td>${plainValue(denture.edentulousDuration)}</td></tr>
          <tr><th>Reason For Loss of teeth</th><td>${plainValue(denture.reasonForLoss)}</td></tr>
          <tr><th>Previous Dentures</th><td>${plainValue(denture.previousDentures)}</td></tr>
        </tbody>
      </table>

      <h2>Clinical Procedure</h2>
      <table class="line-table">
        <thead><tr><th>Date</th><th>Procedure</th><th>Comments</th></tr></thead>
        <tbody>${tableRows(procedures.map((row) => [formatOptionalDate(row.date), row.procedure, row.comments]), 3, "No procedure recorded.")}</tbody>
      </table>

      <h2>Comments</h2>
      <div class="comments-box">${plainValue(denture.comments)}</div>
      <div class="signature-line">Signature ${plainValue(denture.signature)}</div>
    </section>
  `;
};

const implantCommencementPage = (patient) => `
  <section class="specialty-page">
    <h1>Implant Assessment File</h1>
    ${specialtyBioGrid(patient)}
    <div class="blank-implant"></div>
  </section>
`;

const plannedSequencePage = (patient) => {
  const plannedRows = plannedSequenceRows(patient);

  return `
    <section class="specialty-page">
      <h1>Planned Sequence</h1>
      ${specialtyBioGrid(patient)}
      <table class="line-table">
        <thead><tr><th>S No</th><th>Date</th><th>Time</th><th>Procedure</th><th>Status</th></tr></thead>
        <tbody>${rowsOrEmpty(plannedRows, 5, "No planned sequence selected.")}</tbody>
      </table>
    </section>
  `;
};

const accountStatusPage = (patient) => {
  const patientTotal = netAmount(patient);
  const paymentPlan = patient?.paymentPlan || {};
  let paidRunning = 0;
  const ledgerRows = safeList(patient?.accountLedger)
    .filter((entry) => Number(entry.amount || 0) > 0)
    .map((entry, index) => {
      paidRunning += Number(entry.amount || 0);

      return [
        index + 1,
        formatDate(entry.date || entry.timestamp),
        formatCurrencyBlank(entry.amount),
        formatCurrencyBlank(paidRunning),
        formatCurrencyBlank(Math.max(patientTotal - paidRunning, 0)),
      ];
    });

  return `
    <section class="specialty-page">
      <h1>Account Status</h1>
      ${specialtyBioGrid(patient)}
      ${
        paymentPlan.type
          ? `
            <table class="line-table">
              <tbody>
                <tr><th>Payment Type</th><td>${escapeHtml(paymentPlan.type === "installment" ? "Installments" : "Full Cash")}</td></tr>
                <tr><th>Down Payment</th><td>${escapeHtml(formatCurrencyBlank(paymentPlan.downPayment))}</td></tr>
                <tr><th>Monthly Installment</th><td>${escapeHtml(formatCurrencyBlank(paymentPlan.monthlyInstallment))}</td></tr>
              </tbody>
            </table>
          `
          : ""
      }
      <table class="line-table account-print">
        <thead><tr><th>S No</th><th>Date</th><th>Amount</th><th>Paid</th><th>Balance</th></tr></thead>
        <tbody>${tableRows(ledgerRows, 5, "No account entries recorded.")}</tbody>
      </table>
      <table class="invoice-totals account-summary">
        <tbody>
          <tr><td>Total</td><td>${escapeHtml(formatCurrencyBlank(patientTotal))}</td></tr>
          <tr><td>Total Paid</td><td>${escapeHtml(formatCurrencyBlank(paymentsTotal(patient)))}</td></tr>
          <tr class="net"><td>Balance</td><td>${escapeHtml(formatCurrencyBlank(balanceDue(patient)))}</td></tr>
        </tbody>
      </table>
    </section>
  `;
};

const acknowledgementPage = (patient) => {
  const acknowledgement = patient?.acknowledgement || {};

  return `
    <section class="ack-page">
      <div class="ack-print-brand">Dr. Zafar Iqbal &amp; Associates</div>
      <div class="ack-print-rule"></div>
      <h1>ACKNOWLEDGEMENT OF RECEIPT OF INFORMATION</h1>

      <p><strong>Please read carefully and ask about anything that you do not understand.</strong></p>
      <p><strong>We will be pleased to explain it further.</strong></p>
      <p>It is the policy of this dental practice to inform patients of all procedures contemplated for them.</p>
      <p>First visit is considered as a consultation session.</p>
      <p>In this session the complete examination of hard and soft tissues of the mouth is carried out and any dental treatment needed is identified.</p>
      <p>Any other treatment needed such as fillings, RCTs, extractions, caps (fixed teeth) etc. will be performed at a separate appointment after completion of the diagnosis.</p>
      <p>Dr. Zafar Iqbal assisted by other dentists &amp; dental auxiliaries of his choice, will perform the proposed treatment or oral surgical procedures, including the use of any necessary or advisable local anesthesia, radiographs (<u>X-rays</u>) and other diagnostic aids.</p>

      <h2>Mode of Payment</h2>
      <p>The patient will be fully informed about charges of his/her dental treatment. If there is some doubt or confusion about charges then please do ask, we will be pleased to explain it.</p>
      <p>If the treatment plan is modified or changed later on, the patient will be informed for the extra amount to be paid or refund.</p>
      <p><strong>This is the policy of HDC that 100% of the calculated amount is due at the time treatment is rendered.</strong></p>
      <p>The patient or the guardian will be responsible for all the payments of all the services rendered.</p>
      <p>In case of the treatment failure, the dental team will not be responsible, as we try our level best to render the best treatment and there will be no refunds.</p>
      <p>Though in prosthetic cases, if the prosthesis <u>i.e.</u> caps, full denture or partial denture (artificial teeth) is not satisfactory, then it is our responsibility to repeat it so we get the desired results.</p>
      <p>In the interest of our clinical improvement, we reserve the right to make changes in materials &amp; consequently in charges.</p>

      <div class="ack-print-signatures">
        <div><span>${plainValue(acknowledgement.patientSignature)}</span><b>Patient / Guardian Signature</b></div>
        <div><span>${plainValue(acknowledgement.staffSignature)}</span><b>Dentist / Staff Signature</b></div>
        <div><span>${plainValue(acknowledgement.date || formatOptionalDate(new Date()))}</span><b>Date</b></div>
      </div>
    </section>
  `;
};

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
        <div><b>Patient</b><span>${escapeHtml(titledPatientName(patient))}</span></div>
        <div><b>Contact</b><span>${escapeHtml(mobileNumber(patient))}</span></div>
        <div><b>Dentist</b><span>${escapeHtml(patientBio.doctorName || DOCTOR_NAME)}</span></div>
        <div><b>Category</b><span>${escapeHtml(patientBio.category || "-")}</span></div>
        <div><b>Age</b><span>${escapeHtml(patientBio.age || "-")}</span></div>
        <div><b>Type</b><span>${escapeHtml(patientBio.patientType || "-")}</span></div>
        <div class="wide"><b>Address</b><span>${escapeHtml(patientBio.address || "-")}</span></div>
      </div>

      <div class="chart-panel">
        <h3>Dental Chart</h3>
        <img class="chart" src="${escapeHtml(toothChartUrl)}" alt="Tooth chart" />
        <div class="chart-notes">
          <b>Notes</b>
          <span>${escapeHtml(patient?.toothNotes || "No tooth chart notes.")}</span>
        </div>
      </div>

      <div class="checkup-tables">
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
            <tr><th>S No</th><th>Date</th><th>Time</th><th>Procedure</th><th>Status</th></tr>
          </thead>
          <tbody>${rowsOrEmpty(plannedRows, 5, "No planned sequence selected.")}</tbody>
        </table>
      </div>
    </section>
  `;
};

const invoicePage = (patient, copyLabel, invoice) => {
  const patientBio = bio(patient);
  const invoiceRows = invoiceItemRows(invoice.items);
  const paidRows = paymentRows(patient);
  const total = (invoice.items || []).reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const discount = Number(invoice.discount || 0);
  const net = Math.max(total - discount, 0);

  return `
    <section class="invoice-page">
      <div class="invoice-content">
        <div class="invoice-topline">
          <strong>${escapeHtml(invoice.title || "Invoice")}</strong>
          <span>${escapeHtml(copyLabel)}</span>
        </div>

        <div class="invoice-bio">
          <div><b>Reg</b><span>${escapeHtml(regNo(patient) || "-")}</span></div>
          <div><b>Date</b><span>${escapeHtml(formatDate(patientBio.date || new Date()))}</span></div>
          <div><b>Name</b><span>${escapeHtml(titledPatientName(patient))}</span></div>
          <div><b>Contact</b><span>${escapeHtml(mobileNumber(patient))}</span></div>
          <div><b>Dentist</b><span>${escapeHtml(patientBio.doctorName || DOCTOR_NAME)}</span></div>
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
            <tr><td>Total</td><td>${escapeHtml(formatCurrencyBlank(total))}</td></tr>
            ${discount > 0 ? `<tr><td>Discount</td><td>${escapeHtml(formatCurrencyBlank(discount))}</td></tr>` : ""}
            <tr class="net"><td>Net Amount</td><td>${escapeHtml(formatCurrencyBlank(net))}</td></tr>
            <tr><td>Total Paid</td><td>${escapeHtml(formatCurrencyBlank(paymentsTotal(patient)))}</td></tr>
            <tr><td>Total Remaining</td><td>${escapeHtml(formatCurrencyBlank(balanceDue(patient)))}</td></tr>
          </tbody>
        </table>

        <h3>Payments</h3>
        <table class="payment-items">
          <thead>
            <tr><th>S</th><th>Date</th><th>Note</th><th>Amount</th></tr>
          </thead>
          <tbody>${rowsOrEmpty(paidRows, 4, "No payments recorded.")}</tbody>
        </table>

        <div class="invoice-signatures">
          <span>Patient Signature</span>
          <span>Receiver</span>
        </div>
      </div>
    </section>
  `;
};

export function printPatientFile(patient, toothChartSrc, mode = "all") {
  const printWindow = window.open("", "", "width=1200,height=900");

  if (!printWindow) {
    window.alert("Print window could not open. Please allow popups for this site.");
    return;
  }

  const toothChartUrl = new URL(toothChartSrc, window.location.origin).href;
  const invoices = invoiceGroups(patient);
  const normalizedMode = mode === "biography" ? "checkup" : mode;
  const shouldPrintCheckup = normalizedMode === "all" || normalizedMode === "checkup";
  const shouldPrintInvoice = normalizedMode === "all" || normalizedMode === "invoice";
  const shouldPrintPlannedSequence = normalizedMode === "plannedSequence";
  const checkupPages = shouldPrintCheckup
    ? `
        ${checkupPage(patient, "Clinic Copy", toothChartUrl)}
        ${checkupPage(patient, "Patient Copy", toothChartUrl)}
      `
    : "";
  const invoicePages = shouldPrintInvoice
    ? invoices
        .map(
          (invoice) => `
            ${invoicePage(patient, "Clinic Copy", invoice)}
            ${invoicePage(patient, "Patient Copy", invoice)}
          `
        )
        .join("")
    : "";
  const plannedPages = shouldPrintPlannedSequence ? plannedSequencePage(patient) : "";
  const specialtyPages = [
    normalizedMode === "implant" ? implantCommencementPage(patient) : "",
    normalizedMode === "orthodontic" ? orthodonticAssessmentPage(patient) : "",
    normalizedMode === "orthodonticAdjustments" ? orthodonticAdjustmentsPage(patient) : "",
    normalizedMode === "fullDenture" ? fullDenturePage(patient) : "",
    normalizedMode === "account" ? accountStatusPage(patient) : "",
    normalizedMode === "acknowledgement" ? acknowledgementPage(patient) : "",
  ].join("");
  const pages = checkupPages || invoicePages || plannedPages || specialtyPages ? `${checkupPages}${invoicePages}${plannedPages}${specialtyPages}` : checkupPage(patient, "Clinic Copy", toothChartUrl);

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
          .chart-panel{width:min(13.5cm,100%);margin:.2cm auto .3cm;text-align:center}
          .chart{display:block;width:100%;max-height:64mm;object-fit:contain;margin:2px auto 6px}
          .chart-notes{border:1px solid #cbd5e1;padding:6px;min-height:16mm;text-align:left}
          .chart-notes b,.chart-notes span{display:block}
          .chart-notes b{margin-bottom:4px;color:#334155}
          .checkup-tables{width:100%}
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
          .invoice-items th,.invoice-items td,.payment-items th,.payment-items td{padding:.11cm .12cm;font-size:9.2px}
          .invoice-items th:first-child,.invoice-items td:first-child{width:.75cm;text-align:center}
          .invoice-items th:nth-child(3),.invoice-items td:nth-child(3){width:1cm;text-align:center}
          .invoice-items th:nth-child(4),.invoice-items td:nth-child(4),
          .invoice-items th:nth-child(5),.invoice-items td:nth-child(5){width:2.05cm;text-align:right}
          .payment-items{margin-top:.1cm}
          .payment-items th:first-child,.payment-items td:first-child{width:.75cm;text-align:center}
          .payment-items th:last-child,.payment-items td:last-child{width:2.05cm;text-align:right}
          .invoice-totals{width:6.6cm;margin:.22cm 0 0 auto}
          .invoice-totals td{font-size:9.5px;padding:.1cm .13cm}
          .invoice-totals td:first-child{font-weight:800}
          .invoice-totals td:last-child{text-align:right}
          .invoice-totals .net td{font-weight:900;background:#edfdf8}
          .invoice-signatures{display:flex;justify-content:space-between;gap:.6cm;margin-top:.45cm}
          .invoice-signatures span{width:5.5cm;border-top:1px solid #111827;text-align:center;padding-top:.12cm;font-size:9px}
          .specialty-page{page:clinicLetterhead;width:${PRINT_PAGE_WIDTH_CM}cm;min-height:${PRINT_PAGE_HEIGHT_CM}cm;padding:${LETTERHEAD_TOP_CM}cm ${LETTERHEAD_SIDE_CM}cm ${LETTERHEAD_BOTTOM_CM}cm;background:#fff;page-break-after:always}
          .specialty-page>*{width:min(${PRINT_BODY_WIDTH_CM}cm,100%);margin-left:auto;margin-right:auto}
          .specialty-page h1{margin:0 auto .3cm;text-align:center;font-size:16px;text-decoration:underline}
          .specialty-page h2{margin:.28cm auto .12cm;font-size:11px;text-decoration:underline;color:#111827}
          .specialty-bio,.line-table,.diagnosis-print{margin-bottom:.16cm}
          .specialty-bio th,.line-table th,.diagnosis-print th{background:#fff;color:#111827;text-transform:none;letter-spacing:0;font-size:10px}
          .specialty-bio th{width:2.3cm}
          .specialty-bio td{height:.62cm}
          .line-table th{width:4.2cm}
          .line-table td,.line-table th,.diagnosis-print td,.diagnosis-print th{height:.55cm}
          .diagnosis-print th{width:.9cm;text-align:center}
          .adjustment-print th:first-child,.adjustment-print td:first-child{width:1.7cm;text-align:center}
          .adjustment-print th:nth-child(2),.adjustment-print td:nth-child(2){width:3cm}
          .account-print th:first-child,.account-print td:first-child{width:1.3cm;text-align:center}
          .comments-box{min-height:2.1cm;border:1px solid #b8c2cc;padding:.18cm;margin-bottom:.6cm}
          .signature-line{width:7cm;margin-left:0;border-top:1px solid #111827;padding-top:.12cm}
          .blank-implant{height:13.8cm;border:1px solid #b8c2cc;background:repeating-linear-gradient(0deg,#fff 0,#fff .78cm,#d1d5db .8cm)}
          .account-summary{margin-top:.3cm}
          .ack-page{page:ackPage;width:${PRINT_PAGE_WIDTH_CM}cm;min-height:${PRINT_PAGE_HEIGHT_CM}cm;padding:1.6cm 2.5cm 1.4cm;background:#fff;color:#000;page-break-after:always}
          .ack-print-brand{margin-top:.1cm;text-align:center;font-family:Georgia,"Times New Roman",serif;font-size:27px;font-style:italic;font-weight:800;color:#5f5f5f;text-shadow:1px 2px 2px rgba(0,0,0,.25)}
          .ack-print-rule{height:1px;margin:.18cm 0 1.25cm;background:#2f65c8}
          .ack-page h1{margin:0 0 .55cm;text-align:center;font-size:15px;text-decoration:underline}
          .ack-page h2{margin:.85cm 0 .48cm;text-align:center;font-size:16px;text-decoration:underline}
          .ack-page p{margin:0 0 .22cm;font-size:12.7px;line-height:1.42}
          .ack-print-signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:.55cm;margin-top:.9cm}
          .ack-print-signatures div{min-height:1.1cm;border-top:1px solid #111827;padding-top:.12cm;text-align:center}
          .ack-print-signatures span,.ack-print-signatures b{display:block}
          .ack-print-signatures span{min-height:.34cm;font-size:11px}
          .ack-print-signatures b{font-size:10px}
          .checkup-page:last-child,.invoice-page:last-child{page-break-after:auto}
          .specialty-page:last-child{page-break-after:auto}
          .ack-page:last-child{page-break-after:auto}
          @page clinicLetterhead{size:A4;margin:0}
          @page invoiceLetterhead{size:${INVOICE_PAGE_WIDTH_CM}cm ${INVOICE_PAGE_HEIGHT_CM}cm;margin:0}
          @page ackPage{size:A4;margin:0}
          @media print{
            body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
            .checkup-page{min-height:auto}
          }
        </style>
      </head>
      <body>
        ${pages}
        <script>window.onload=()=>setTimeout(()=>window.print(),300);<\/script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
