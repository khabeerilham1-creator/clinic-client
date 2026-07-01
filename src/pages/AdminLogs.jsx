import React, { useEffect, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import { formatDateDisplay } from "../utils/patientHelpers";
import { getLocalActivityLogs } from "../utils/activityLog";

function AdminLogs({ activePage, setActivePage, handleLogout }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/activity-logs", { params: { limit: 300 } });
        setLogs(response.data?.logs || []);
      } catch (requestError) {
        console.error(requestError);
        setLogs(getLocalActivityLogs());
        setError("Server logs could not be loaded. Local logs are shown.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero admin-hero">
          <div>
            <div className="eyebrow">Admin</div>
            <h1>Logs</h1>
            <p>Login, logout, patient edits and key staff activity.</p>
          </div>
        </section>

        {error && <div className="notice warning">{error}</div>}

        <section className="panel gold-bordered">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Staff</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Target</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6">Loading logs...</td>
                  </tr>
                )}
                {!loading && logs.length === 0 && (
                  <tr>
                    <td colSpan="6">No logs found.</td>
                  </tr>
                )}
                {logs.map((log, index) => {
                  const date = log.timestamp ? new Date(log.timestamp) : null;

                  return (
                    <tr key={log._id || `${log.timestamp}-${index}`}>
                      <td>{formatDateDisplay(log.timestamp)}</td>
                      <td>{date && !Number.isNaN(date.getTime()) ? date.toLocaleTimeString("en-PK") : "-"}</td>
                      <td>{log.actor || "-"}</td>
                      <td>
                        <span className="pill">{log.role || "staff"}</span>
                      </td>
                      <td>{log.action || "-"}</td>
                      <td>{log.target || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default AdminLogs;
