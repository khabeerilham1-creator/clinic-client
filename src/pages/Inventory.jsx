import React, { useEffect, useMemo, useRef, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";
import { inventoryArray } from "../utils/patientHelpers";
import { announceRestockAlert, playSectionSound } from "../utils/sound";

const todayInputValue = () => new Date().toISOString().split("T")[0];

const EMPTY_FORM = {
  productName: "",
  qty: "",
  minQty: "5",
  date: todayInputValue(),
  notes: "",
};

function Inventory({ activePage, setActivePage, handleLogout }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const lastAlertKey = useRef("");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/inventory", {
        params: { limit: 500, sort: "date", order: -1 },
      });

      setItems(inventoryArray(response.data));
    } catch (requestError) {
      console.error(requestError);
      setError("Inventory could not be loaded. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items
      .filter((item) => !query || item.productName?.toLowerCase().includes(query))
      .sort((a, b) => String(a.productName || "").localeCompare(String(b.productName || "")));
  }, [items, search]);

  const lowStockItems = useMemo(
    () => items.filter((item) => Number(item.qty || 0) <= Number(item.minQty || 0)),
    [items]
  );

  const totals = useMemo(() => {
    const totalQty = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);

    return {
      products: items.length,
      totalQty,
      lowStock: lowStockItems.length,
    };
  }, [items, lowStockItems]);

  useEffect(() => {
    if (loading || lowStockItems.length === 0) {
      return;
    }

    const key = lowStockItems
      .map((item) => `${item._id || item.productName}:${item.qty}:${item.minQty}`)
      .join("|");

    if (key !== lastAlertKey.current) {
      lastAlertKey.current = key;
      announceRestockAlert(lowStockItems[0].productName || "Inventory item");
    }
  }, [loading, lowStockItems]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.productName.trim()) {
      alert("Product name is required.");
      return;
    }

    const payload = {
      ...form,
      productName: form.productName.trim(),
      qty: Number(form.qty || 0),
      minQty: Number(form.minQty || 0),
      date: form.date || todayInputValue(),
    };

    try {
      if (editingId) {
        await api.put(`/inventory/${editingId}`, payload);
        setItems((current) =>
          current.map((item) => (item._id === editingId ? { ...item, ...payload } : item))
        );
      } else {
        const response = await api.post("/inventory", payload);
        setItems((current) => [response.data.item, ...current]);
      }

      playSectionSound("success");
      resetForm();
    } catch (requestError) {
      console.error(requestError);
      alert(requestError?.response?.data?.detail || "Inventory item could not be saved.");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      productName: item.productName || "",
      qty: String(item.qty ?? ""),
      minQty: String(item.minQty ?? 5),
      date: item.date || todayInputValue(),
      notes: item.notes || "",
    });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete inventory item "${item.productName}"?`)) {
      return;
    }

    try {
      await api.delete(`/inventory/${item._id}`);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      playSectionSound("success");
    } catch (requestError) {
      console.error(requestError);
      alert("Inventory item could not be deleted.");
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout}>
      <div className="page">
        <section className="page-hero">
          <div>
            <div className="eyebrow">Stock control</div>
            <h1>Inventory</h1>
            <p>Track dental stock quantities and restock before stockout.</p>
          </div>

          <div className="hero-actions no-print">
            <button className="btn" type="button" onClick={fetchInventory}>
              Refresh
            </button>
          </div>
        </section>

        {error && <div className="notice danger">{error}</div>}

        <section className="metrics-grid three">
          <div className="metric-card">
            <div className="metric-accent blue" />
            <div className="metric-label">Products</div>
            <div className="metric-value">{loading ? "..." : totals.products}</div>
            <div className="metric-detail">Inventory lines</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent green" />
            <div className="metric-label">Total quantity</div>
            <div className="metric-value">{loading ? "..." : totals.totalQty}</div>
            <div className="metric-detail">All visible stock</div>
          </div>
          <div className="metric-card">
            <div className="metric-accent rose" />
            <div className="metric-label">Restock alerts</div>
            <div className="metric-value">{loading ? "..." : totals.lowStock}</div>
            <div className="metric-detail">Needs restock before stockout</div>
          </div>
        </section>

        {lowStockItems.length > 0 && (
          <div className="notice warning">
            {lowStockItems[0].productName || "Inventory item"} needs to restock before stockout.
          </div>
        )}

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{editingId ? "Update Product" : "Add Product"}</h2>
              <p>Set minimum quantity to trigger the low-stock alert.</p>
            </div>
          </div>

          <div className="payment-panel inventory-form no-print">
            <label className="field">
              <span>Product Name</span>
              <input
                value={form.productName}
                onChange={(event) => handleChange("productName", event.target.value)}
                placeholder="Composite, gloves, implant kit..."
              />
            </label>
            <label className="field">
              <span>Qty</span>
              <input
                type="number"
                min="0"
                value={form.qty}
                onChange={(event) => handleChange("qty", event.target.value)}
                placeholder="Current quantity"
              />
            </label>
            <label className="field">
              <span>Restock Before</span>
              <input
                type="number"
                min="0"
                value={form.minQty}
                onChange={(event) => handleChange("minQty", event.target.value)}
                placeholder="Minimum qty"
              />
            </label>
            <label className="field">
              <span>Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(event) => handleChange("date", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Notes</span>
              <input
                value={form.notes}
                onChange={(event) => handleChange("notes", event.target.value)}
                placeholder="Supplier, pack size..."
              />
            </label>
            <button className="btn btn-primary" type="button" onClick={handleSubmit}>
              {editingId ? "Update" : "Save"}
            </button>
            {editingId && (
              <button className="btn" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </section>

        <section className="toolbar-panel no-print">
          <div className="search-field">
            <span>Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Product name"
            />
          </div>
        </section>

        <section className="panel">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Restock Before</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6">Loading inventory...</td>
                  </tr>
                )}

                {!loading && filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="6">No inventory items found.</td>
                  </tr>
                )}

                {filteredItems.map((item) => {
                  const isLow = Number(item.qty || 0) <= Number(item.minQty || 0);

                  return (
                    <tr key={item._id || item.productName}>
                      <td>
                        <strong>{item.productName}</strong>
                        {item.notes && <small>{item.notes}</small>}
                      </td>
                      <td>{Number(item.qty || 0)}</td>
                      <td>{Number(item.minQty || 0)}</td>
                      <td>{item.date || "-"}</td>
                      <td>
                        <span className={isLow ? "pill warning" : "pill success"}>
                          {isLow ? "Restock before stockout" : "In stock"}
                        </span>
                      </td>
                      <td className="row-actions no-print">
                        <button className="btn btn-sm" type="button" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          type="button"
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </button>
                      </td>
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

export default Inventory;
