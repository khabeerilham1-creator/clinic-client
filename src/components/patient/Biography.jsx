import React, { useEffect } from "react";
import { CATEGORY_OPTIONS } from "../../utils/clinicData";

function Biography({
  patientData,
  setPatientData
}) {

  const formData =
    patientData.biography || {};

  const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");

  useEffect(() => {

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

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
          "Category 1 - Affording",

        patientType:
          prev.biography?.patientType ||
          "Affording",

        doctorName:
          prev.biography?.doctorName ||
          (sessionUser.role === "doctor" ? sessionUser.name : ""),

      },

    }));

  }, []);

  // AGE
  const calculateAge = (dob) => {

    const birth =
      new Date(dob);

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

    let updatedData = {

      ...formData,

      [name]: value,

    };

    if (
      name === "birthDate"
    ) {

      updatedData.age =
        calculateAge(value);

    }

    setPatientData((prev) => ({

      ...prev,

      biography:
        updatedData,

    }));

  };

  return (

    <div>

      <h2 className="
        text-2xl
        font-bold
        mb-6
        text-gray-800
      ">
        Biography Section
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
            type="date"
            name="date"
            value={
              formData.date || ""
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
            Patient Name
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
            type="date"
            name="birthDate"
            value={
              formData.birthDate || ""
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
            Mobile Number
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

        {/* CATEGORY */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Category
          </label>

          <select
            name="category"
            value={
              formData.category || ""
            }
            onChange={handleChange}
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          >

            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.key} value={option.value}>
                {option.label}
              </option>
            ))}

          </select>

        </div>

        {/* PATIENT TYPE */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Patient Type
          </label>

          <select
            name="patientType"
            value={
              formData.patientType || ""
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
              Compassionate
            </option>

            <option>
              Non-Affording
            </option>

            <option>
              Affording
            </option>

          </select>

        </div>

        {/* DOCTOR */}
        <div>

          <label className="
            block
            mb-1
            font-medium
          ">
            Doctor / Case Done By
          </label>

          <input
            type="text"
            name="doctorName"
            value={
              formData.doctorName || ""
            }
            onChange={handleChange}
            placeholder="Dr Zaffar Iqbal"
            className="
              w-full
              border
              rounded-lg
              p-3
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
