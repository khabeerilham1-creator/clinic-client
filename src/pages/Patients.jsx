import React, {
  useState,
  useEffect,
} from "react";

import api from "../api";

import Layout from "../components/Layout";

import Biography from "../components/patient/Biography";
import Checkup from "../components/patient/Checkup";
import PlannedSequence from "../components/patient/PlannedSequence";
import Invoice from "../components/patient/Invoice";

import toothChart from "../assets/tooth-chart.png";

function Patients({
  activePage,
  setActivePage,
}) {

 const [patientData, setPatientData] =
  useState({

    biography: {},

    checkup: {},

    plannedSequence: [],

    invoice: [],

    discount: 0,

    accountLedger: [],

  });

useEffect(() => {

  const patient =
    localStorage.getItem(
      "editPatient"
    );

  if (patient) {

    setPatientData(
      JSON.parse(patient)
    );

  }

}, []);

  const [loading, setLoading] =
    useState(false);

  /* SAVE */
  const handleSave = async () => {

    if (patientData?.isEditing) {

  alert(
    "Editing Mode - Save Disabled Until Update Route Is Connected"
  );

  return;

}

    try {

      setLoading(true);

      const response =
        await api.post(
          "/patients",
          patientData
        );

      // UPDATE REG NO LIVE
      setPatientData((prev) => ({

        ...prev,

        biography: {

          ...prev.biography,

          regNo:
            response.data.reg_no

        }

      }));

      console.log(response.data);

      alert(
        "Patient Saved Successfully"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Error Saving Patient"
      );

    } finally {

      setLoading(false);

    }

  };

  /* PRINT */
  const handlePrint = (
    patient
  ) => {

    const printWindow =
      window.open(
        "",
        "",
        "width=1400,height=1000"
      );

    const invoice =
      patient?.invoice || [];

    const planned =
      patient?.plannedSequence || [];

    const totalAmount =
      invoice.reduce(
        (sum,item)=>
          sum +
          Number(item.cost || 0),
        0
      );

    const discount =
      Number(
        patient?.discount || 0
      );

    const netAmount =
      totalAmount - discount;

    printWindow.document.write(`

    <html>

      <head>

        <title>
          HDC Dental Print
        </title>

        <style>

          body{
            font-family:Arial;
            margin:0;
            padding:12px;
            color:#000;
          }

          .section{
            font-size:16px;
            font-weight:bold;
            margin-top:20px;
            margin-bottom:12px;
            text-decoration:underline;
          }

          .bio{
            width:100%;
            margin-bottom:20px;
          }

          .bio td{
            border:none !important;
            padding:2px 0;
            font-size:14px;
            text-align:left;
          }

          .tooth{
            text-align:center;
            margin-bottom:20px;
          }

          .tooth img{
            width:850px;
          }

          table{
            width:100%;
            border-collapse:collapse;
            margin-top:10px;
            margin-bottom:30px;
          }

          th{
            border:1px solid #000;
            padding:4px;
            font-size:13px;
            text-align:center;
          }

          th{
  border:1px solid #000;
  padding:4px;
  font-size:13px;
  text-align:center;
}

td{
  padding:4px;
  font-size:13px;
  text-align:center;
}

  
          .totals{
            width:350px;
            margin-left:auto;
            margin-top:20px;
            page-break-inside: avoid;
          }

          .totals td{
            border:none !important;
            padding:4px;
            font-size:15px;
            font-weight:bold;
            white-space:nowrap;
          }

        </style>

      </head>

      <body>

        <!-- BIO -->
        <div class="section">
          Bio-data :
        </div>

        <table class="bio">

          <tr>

            <td>

              <b>
                Reg No :
              </b>

              ${
                patient?.biography
                  ?.regNo || ""
              }

            </td>

            <td
              style="
                text-align:right;
                width:300px;
                vertical-align:top;
              "
            >

              <b>
                Date :
              </b>

              ${
                patient?.biography
                  ?.date || ""
              }

            </td>

          </tr>

          <tr>

            <td>

              <b>
                Pt. Name :
              </b>

              ${
                patient?.biography
                  ?.patientName || ""
              }

            </td>

          </tr>

          <tr>

            <td>

              <b>
                Contact :
              </b>

              ${
                patient?.biography
                  ?.mobileNumber || ""
              }

            </td>

          </tr>

          <tr>

            <td>

              <b>
                Address :
              </b>

              ${
                patient?.biography
                  ?.address || ""
              }

            </td>

          </tr>

        </table>

        <!-- TOOTH -->
        <div class="tooth">

          <img
            src="${
              window.location.origin +
              toothChart
            }"
            style="
              width:760px;
            "
          />

        </div>

       <!-- TREATMENT DETAILS -->
<div class="section">
  Treatment Details :
</div>

<table style="
width:100%;
border:1px solid #000;
border-collapse:collapse;
">

  <tr>
    <th>S No</th>
    <th>Details</th>
    <th>Pre Existing Condition</th>
    <th>Recommended Treatment</th>
  </tr>

  <tr>
  <td style="border:none;">1</td>
  <td style="border:none;">Clinical</td>
  <td style="border:none;">
    ${patient?.checkup?.clinicalTasks?.condition || ""}
  </td>
  <td style="border:none;">
    ${patient?.checkup?.clinicalTasks?.treatment || ""}
  </td>
</tr>

<tr><td style="border:none;">2</td><td style="border:none;"></td><td style="border:none;"></td><td style="border:none;"></td></tr>
<tr><td style="border:none;">3</td><td style="border:none;"></td><td style="border:none;"></td><td style="border:none;"></td></tr>
<tr><td style="border:none;">4</td><td style="border:none;"></td><td style="border:none;"></td><td style="border:none;"></td></tr>
<tr><td style="border:none;">5</td><td style="border:none;"></td><td style="border:none;"></td><td style="border:none;"></td></tr>
<tr><td style="border:none;">6</td><td style="border:none;"></td><td style="border:none;"></td><td style="border:none;"></td></tr>

</table>

<div class="section">
  Invoice :
</div>

<table style="
width:100%;
border:1px solid #000;
border-collapse:collapse;
">

  <tr>
    <th>S No</th>
    <th>Details</th>
    <th>Qty</th>
    <th>Rate</th>
    <th>Cost</th>
  </tr>

  ${
    invoice.map(
      (item,index)=>`
      <tr>
        <td>${index + 1}</td>
        <td>${item.details || ""}</td>
        <td>${item.qty || ""}</td>
        <td>${item.rate || ""}</td>
        <td>${item.cost || ""}</td>
      </tr>
      `
    ).join("")
  }

</table>

<table class="totals">

  <tr>
    <td>Total Amount</td>
    <td align="right">${totalAmount}</td>
  </tr>

  <tr>
    <td>Discount</td>
    <td align="right">${discount}</td>
  </tr>

  <tr>
    <td>Net Amount</td>
    <td align="right">${netAmount}</td>
  </tr>

</table>

      </body>

    </html>

    `);

    printWindow.document.close();

    printWindow.print();

  };

  return (

    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
    >

      <div className="space-y-6">

        {/* HEADER */}
        <div className="
          bg-white
          rounded-3xl
          shadow-sm
          p-8
          border
        ">

          <h1 className="
            text-4xl
            font-bold
            text-gray-800
          ">
            Patient Entry
          </h1>

          <p className="
            text-gray-500
            mt-2
            text-lg
          ">
            Dental Patient Management System
          </p>

        </div>

        {/* BIOGRAPHY */}
        <div className="
          bg-white
          rounded-3xl
          shadow-sm
          border
          p-8
        ">

          <Biography
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

        {/* CHECKUP */}
        <div className="
          bg-white
          rounded-3xl
          shadow-sm
          border
          p-8
        ">

          <Checkup
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

        {/* PLANNED */}
        <div className="
          bg-white
          rounded-3xl
          shadow-sm
          border
          p-8
        ">

          <PlannedSequence
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

        {/* INVOICE */}
        <div className="
          bg-white
          rounded-3xl
          shadow-sm
          border
          p-8
          mb-32
        ">

          <Invoice
            patientData={patientData}
            setPatientData={setPatientData}
          />

        </div>

      </div>

      {/* BUTTONS */}
      <div className="
        fixed
        bottom-6
        right-6
        flex
        gap-4
        z-50
      ">

        <button
          onClick={handleSave}
          disabled={loading}
          className="
            bg-black
            hover:bg-gray-800
            text-white
            px-8
            py-4
            rounded-2xl
            shadow-2xl
            text-lg
            font-semibold
          "
        >

          {
            loading
              ? "Saving..."
              : "Save Patient"
          }

        </button>

        <button
          onClick={() =>
            handlePrint(
              patientData
            )
          }
          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-8
            py-4
            rounded-2xl
            shadow-2xl
            text-lg
            font-semibold
          "
        >
          Print
        </button>

      </div>

    </Layout>

  );

}

export default Patients;