import React from "react";

import Layout from "../components/Layout";

function PlaceholderPage({
  activePage,
  setActivePage,
  handleLogout,
  title,
  eyebrow = "Workspace",
  description = "Format pending.",
}) {
  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero accent-hero">
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </section>

        <section className="panel">
          <div className="empty-state compact">Format pending.</div>
        </section>
      </div>
    </Layout>
  );
}

export default PlaceholderPage;
