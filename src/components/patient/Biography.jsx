import React, { useEffect } from "react";
import {
  CATEGORY_OPTIONS,
  patientTypeForCategory,
  REFERRAL_ROLE_OPTIONS,
  referralCodeForRole,
} from "../../utils/clinicData";
import { activeShift, capitalizeFirstWord, parseLocalDate, todayDisplayValue } from "../../utils/patientHelpers";

function Biography({
  patientData,
  setPatientData
}) {

  const formData =
    patientData.biography || {};

  const shift = activeShift();

  useEffect(() => {

    const today = todayDisplayValue();
    const defaultCategory = CATEGORY_OPTIONS[0].value;

    setPatientData((prev) => ({

      ...prev,

      biography: {

        ...prev.biography,

        date:
          prev.biography?.date ||
          today,

        title:
          prev.biography?.title ||
          "Mr.",

        category:
          prev.biography?.category ||
          defaultCategory,

        patientType:
          patientTypeForCategory(prev.biography?.category || defaultCategory),

        doctorName:
          prev.biography?.doctorName ||
          "",

        shiftId:
          shift?.id ||
          prev.biography?.shiftId ||
          "",

        shiftName:
          shift?.label ||
          prev.biography?.shiftName ||
          "",

      },

    }));

  }, []);

  // AGE
  const calculateAge = (dob) => {

    const birth =
      parseLocalDate(dob);

    if (!birth) {

      return "";

    }

    const today =
      new Date();

    let age =
      today.getFullYear() -
      birth.getFullYear();

    const monthDiff =
      today.getMonth() -
      birth.getMonth();

    if (
      monthDiff < 0 ||
      (
        monthDiff === 0 &&
        today.getDate() <
        birth.getDate()
      )
    ) {

      age--;

    }

    return age;

  };

  // INPUT CHANGE
  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    const textFields = new Set([
      "patientName",
      "occupation",
      "email",
      "ptclNumber",
      "mobileNumber",
      "emergencyNumber",
      "doctorName",
      "referredByName",
      "address",
    ]);
    const nextValue =
      textFields.has(name)
        ? capitalizeFirstWord(value)
        : value;

    let updatedData = {

      ...formData,

      [name]: nextValue,

    };

    if (
      name === "birthDate"
    ) {

      updatedData.age =
        calculateAge(nextValue);

    }

    if (
      name === "category"
    ) {

      updatedData.patientType =
        patientTypeForCategory(nextValue);

    }

    if (
      name === "referredByRole"
    ) {

      const roleOption = REFERRAL_ROLE_OPTIONS.find((option) => option.value === nextValue);

      updatedData.referredByRoleLabel = roleOption?.label || "";

    }

    setPatientData((prev) => ({

      ...prev,

      biography:
        updatedData,

    }));

  };

  return (

    <div spellCheck="true">

      <h2 className="
        text-2xl
        font-bold
        mb-6
        text-gray-800
      ">
        Bio Data
      </h2>

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-4
      ">

        {/* DATE */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Date
          </label>

          <input
            type="text"
            name="date"
            value={
              formData.date || ""
            }
            onChange={handleChange}
            placeholder="dd/mm/yyyy"
            inputMode="numeric"
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          />

        </div>

        {/* REG NO */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Registration No
          </label>

          <input
            type="text"
            name="regNo"
            value={
              formData.regNo || ""
            }
            placeholder="Auto on save"
            readOnly
            className="
              w-full
              border
              rounded-lg
              p-3
              bg-gray-100
            "
          />

        </div>

        {/* TITLE */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Title
          </label>

          <select
            name="title"
            value={
              formData.title || ""
            }
            onChange={handleChange}
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          >

            <option>
              Mr.
            </option>

            <option>
              Mrs.
            </option>

            <option>
              Miss.
            </option>

          </select>

        </div>

        {/* NAME */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Case Name
          </label>

          <input
            type="text"
            name="patientName"
            value={
              formData.patientName || ""
            }
            onChange={handleChange}
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          />

        </div>

        {/* BIRTH DATE */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Birth Date
          </label>

          <input
            type="text"
            name="birthDate"
            value={
              formData.birthDate || ""
            }
            onChange={handleChange}
            placeholder="dd/mm/yyyy"
            inputMode="numeric"
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          />

        </div>

        {/* AGE */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Age
          </label>

          <input
            type="text"
            name="age"
            value={
              formData.age || ""
            }
            readOnly
            className="
              w-full
              border
              rounded-lg
              p-3
              bg-gray-100
            "
          />

        </div>

        {/* OCCUPATION */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Occupation
          </label>

          <input
            type="text"
            name="occupation"
            value={
              formData.occupation || ""
            }
            onChange={handleChange}
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          />

        </div>

        {/* EMAIL */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={
              formData.email || ""
            }
            onChange={handleChange}
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          />

        </div>

        {/* PTCL */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            PTCL Number
          </label>

          <input
            type="text"
            name="ptclNumber"
            value={
              formData.ptclNumber || ""
            }
            onChange={handleChange}
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          />

        </div>

        {/* MOBILE */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Contact
          </label>

          <input
            type="text"
            name="mobileNumber"
            value={
              formData.mobileNumber || ""
            }
            onChange={handleChange}
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          />

        </div>

        {/* EMERGENCY */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Emergency Number
          </label>

          <input
            type="text"
            name="emergencyNumber"
            value={
              formData.emergencyNumber || ""
            }
            onChange={handleChange}
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          />

        </div>

        {/* DENTIST */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Working Shift
          </label>

          <input
            type="text"
            value={
              formData.shiftName || shift?.label || ""
            }
            readOnly
            className="
              w-full
              border
              rounded-lg
              p-3
              bg-gray-100
            "
          />

        </div>

        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Dentist 
          </label>

          <input
            type="text"
            name="doctorName"
            value={
              formData.doctorName || ""
            }
            onChange={handleChange}
            placeholder="Enter dentist name"
            autoCapitalize="words"
            spellCheck="true"
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          />

        </div>

        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Referred By
          </label>

          <input
            type="text"
            name="referredByName"
            value={
              formData.referredByName || ""
            }
            onChange={handleChange}
            placeholder="Name, e.g. Ali (R)"
            autoCapitalize="words"
            spellCheck="true"
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          />

        </div>

        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Referred By Role
          </label>

          <select
            name="referredByRole"
            value={
              formData.referredByRole || ""
            }
            onChange={handleChange}
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          >
            {REFERRAL_ROLE_OPTIONS.map((option) => (
              <option key={option.value || "none"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

        </div>

        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Referral Code
          </label>

          <input
            type="text"
            value={
              referralCodeForRole(formData.referredByRole)
                ? `(${referralCodeForRole(formData.referredByRole)})`
                : ""
            }
            readOnly
            placeholder="Auto"
            className="
              w-full
              border
              rounded-lg
              p-3
              bg-gray-100
            "
          />

        </div>

      </div>

      {/* ADDRESS */}
      <div className="mt-4">

        <label className="
          block
          mb-1
          font-medium
        ">
          Address
        </label>

        <textarea
          name="address"
          value={
            formData.address || ""
          }
          onChange={handleChange}
          autoCapitalize="sentences"
          spellCheck="true"
          rows="4"
          className="
            w-full
            border
            rounded-lg
            p-3
          "
        />

      </div>

    </div>

  );

}

export default Biography;
