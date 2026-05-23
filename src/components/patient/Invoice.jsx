import React, { useEffect } from "react";

function Invoice({
  patientData,
  setPatientData,
}) {

  const items =
    patientData.invoice || [];

  const discount =
    patientData.discount || 0;

  useEffect(() => {

    if (items.length === 0) {

      setPatientData((prev) => ({
        ...prev,

        invoice: [
          {
            sno: 1,
            details: "",
            qty: 1,
            rate: 0,
            cost: 0,
          },
        ],

        discount: 0,
      }));

    }

  }, []);

  const handleChange = (
    index,
    field,
    value
  ) => {

    const updatedItems = [...items];

    updatedItems[index][field] = value;

    if (
      field === "qty" ||
      field === "rate"
    ) {

      updatedItems[index].cost =
        Number(updatedItems[index].qty) *
        Number(updatedItems[index].rate);

    }

    setPatientData((prev) => ({
      ...prev,
      invoice: updatedItems,
    }));

  };

  const addRow = () => {

    const updatedItems = [
      ...items,
      {
        sno: items.length + 1,
        details: "",
        qty: 1,
        rate: 0,
        cost: 0,
      },
    ];

    setPatientData((prev) => ({
      ...prev,
      invoice: updatedItems,
    }));

  };

  const deleteRow = (index) => {

    const updatedItems = items
      .filter((_, i) => i !== index)
      .map((item, i) => ({
        ...item,
        sno: i + 1,
      }));

    setPatientData((prev) => ({
      ...prev,
      invoice: updatedItems,
    }));

  };

  const totalAmount = items.reduce(
    (total, item) =>
      total + Number(item.cost),
    0
  );

  const netCost =
    totalAmount - Number(discount);

  return (
    <div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Invoice
        </h2>

        <button
          onClick={addRow}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          + Add Item
        </button>

      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">

        <table className="w-full border border-gray-300">

          <thead className="bg-gray-100">

            <tr>

              <th className="border p-3">
                S.No
              </th>

              <th className="border p-3">
                Details
              </th>

              <th className="border p-3">
                Qty
              </th>

              <th className="border p-3">
                Rate
              </th>

              <th className="border p-3">
                Cost
              </th>

              <th className="border p-3">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {items.map((item, index) => (

              <tr key={index}>

                {/* SNO */}
                <td className="border p-2 text-center">
                  {item.sno}
                </td>

                {/* DETAILS */}
                <td className="border p-2">

                  <input
                    type="text"
                    value={item.details}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "details",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded"
                  />

                </td>

                {/* QTY */}
                <td className="border p-2">

                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "qty",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded"
                  />

                </td>

                {/* RATE */}
                <td className="border p-2">

                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "rate",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded"
                  />

                </td>

                {/* COST */}
                <td className="border p-2 text-center font-semibold">
                  {item.cost}
                </td>

                {/* DELETE */}
                <td className="border p-2 text-center">

                  <button
                    onClick={() =>
                      deleteRow(index)
                    }
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* TOTALS */}
      <div className="mt-6 flex justify-end">

        <div className="w-full md:w-96 space-y-4">

          {/* TOTAL */}
          <div className="flex justify-between border p-3 rounded-lg">

            <span className="font-semibold">
              Total Amount
            </span>

            <span>
              {totalAmount}
            </span>

          </div>

          {/* DISCOUNT */}
          <div className="flex justify-between items-center border p-3 rounded-lg">

            <span className="font-semibold">
              Discount
            </span>

            <input
              type="number"
              value={discount}
              onChange={(e) =>
                setPatientData((prev) => ({
                  ...prev,
                  discount:
                    e.target.value,
                }))
              }
              className="border rounded p-2 w-32"
            />

          </div>

          {/* NET COST */}
          <div className="flex justify-between border p-3 rounded-lg bg-gray-100">

            <span className="font-bold">
              Net Cost
            </span>

            <span className="font-bold">
              {netCost}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Invoice;