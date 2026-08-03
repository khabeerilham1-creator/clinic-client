import React, { useEffect, useMemo, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import { formatDateDisplay } from "../utils/patientHelpers";

const ROLE_OPTIONS = [
  { id: "admin", label: "Admin" },
  { id: "receptionist", label: "Receptionist" },
  { id: "dentist", label: "Dentist" },
  { id: "doctor", label: "Dentist" },
];

const roleLabel = (role) => ROLE_OPTIONS.find((item) => item.id === role)?.label || role || "Staff";

const messageArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.messages)) {
    return payload.messages;
  }

  return [];
};

const currentUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch (error) {
    return {};
  }
};

function Messenger({ activePage, setActivePage, handleLogout }) {
  const user = currentUser();
  const role = sessionStorage.getItem("role") || user.role || "admin";
  const [messages, setMessages] = useState([]);
  const [toRole, setToRole] = useState(role === "admin" ? "receptionist" : "admin");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchMessages = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/messages", { params: { role, limit: 300 } });
      setMessages(messageArray(response.data));
    } catch (requestError) {
      console.error(requestError);
      setMessages([]);
      setError("Messages could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const timer = window.setInterval(fetchMessages, 30000);

    return () => window.clearInterval(timer);
  }, [role]);

  const visibleMessages = useMemo(
    () =>
      messages
        .filter((message) => message.fromRole === role || message.toRole === role || role === "admin")
        .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))),
    [messages, role]
  );

  const unreadCount = visibleMessages.filter((message) => message.toRole === role && !message.read).length;

  const sendMessage = async (event) => {
    event.preventDefault();

    if (sending || !body.trim()) {
      setError("Write a message before sending.");
      return;
    }

    setSending(true);
    setError("");
    setNotice("");

    try {
      await api.post("/messages", {
        fromRole: role,
        fromName: user.name || roleLabel(role),
        toRole,
        toName: roleLabel(toRole),
        body: body.trim(),
      });
      setBody("");
      setNotice("Message sent.");
      fetchMessages();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError?.response?.data?.detail || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  const markRead = async (message) => {
    if (!message?._id || message.read || message.toRole !== role) {
      return;
    }

    try {
      await api.patch(`/messages/${message._id}/read`);
      setMessages((current) =>
        current.map((item) => (item._id === message._id ? { ...item, read: true } : item))
      );
    } catch (requestError) {
      console.error(requestError);
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero">
          <div>
            <div className="eyebrow">Internal messenger</div>
            <h1>Messenger</h1>
            <p>{unreadCount} unread messages for {roleLabel(role)}.</p>
          </div>
          <div className="hero-actions no-print">
            <button className="btn" type="button" onClick={fetchMessages}>Refresh</button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}
        {notice && <div className="notice">{notice}</div>}

        <section className="messenger-layout">
          <form className="panel messenger-compose" onSubmit={sendMessage}>
            <div className="panel-heading">
              <div>
                <h2>New Message</h2>
                <p>Send account to account message.</p>
              </div>
            </div>

            <label className="field">
              <span>Send to</span>
              <select value={toRole} onChange={(event) => setToRole(event.target.value)}>
                {ROLE_OPTIONS.filter((item) => item.id !== role).map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Message</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Type message here"
              />
            </label>

            <button className="btn btn-primary" type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>

          <div className="panel messenger-list">
            <div className="panel-heading">
              <div>
                <h2>Inbox</h2>
                <p>Admin, receptionist and dentist account messages.</p>
              </div>
              <span className="pill warning">{unreadCount} unread</span>
            </div>

            <div className="message-stack">
              {loading && <div className="empty-state compact">Loading messages...</div>}
              {!loading && visibleMessages.length === 0 && (
                <div className="empty-state compact">No messages found.</div>
              )}
              {visibleMessages.map((message) => {
                const incoming = message.toRole === role;

                return (
                  <button
                    key={message._id}
                    type="button"
                    className={`message-row ${incoming ? "incoming" : "outgoing"} ${!message.read && incoming ? "unread" : ""}`}
                    onClick={() => markRead(message)}
                  >
                    <span>
                      <strong>{incoming ? message.fromName || roleLabel(message.fromRole) : `To ${message.toName || roleLabel(message.toRole)}`}</strong>
                      <small>{formatDateDisplay(message.createdAt)} {String(message.createdAt || "").slice(11, 16)}</small>
                    </span>
                    <p>{message.body}</p>
                    {!message.read && incoming && <b>New</b>}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Messenger;
