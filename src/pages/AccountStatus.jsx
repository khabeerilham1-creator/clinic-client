import React from "react";
import Layout from "../components/Layout";

function AccountStatus({
  activePage,
  setActivePage,
}) {
  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
    >
      <div className="bg-white rounded-2xl p-8 shadow">

        <h1 className="text-3xl font-bold mb-6">
          Account Status
        </h1>

        <input
          type="text"
          placeholder="Search Patient..."
          className="w-full border p-3 rounded-xl mb-6"
        />

        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3">Session Date</th>
                <th className="border p-3">Amount</th>
                <th className="border p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border p-3">-</td>
                <td className="border p-3">-</td>
                <td className="border p-3">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-right">
          <h2 className="text-xl font-bold">
            Balance Due: Rs 0
          </h2>
        </div>

      </div>
    </Layout>
  );
}

export default AccountStatus;