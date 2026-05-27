import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    source: "Call",
  });

  const API_URL = "http://localhost:5002/api/leads";

  const fetchLeads = async () => {
    try {
      const res = await axios.get(API_URL);
      setLeads(res.data);
    } catch (error) {
      setMessage("Backend not connected. Please start backend server.");
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const addLead = async (e) => {
    e.preventDefault();

    if (formData.name.trim().length < 3) {
      setMessage("Name must be at least 3 characters");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setMessage("Phone number must be exactly 10 digits");
      return;
    }

    try {
      await axios.post(API_URL, formData);
      setFormData({ name: "", phone: "", source: "Call" });
      setMessage("Lead added successfully");
      fetchLeads();
    } catch (error) {
      setMessage("Error adding lead");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status });
      setMessage("Status updated");
      fetchLeads();
    } catch (error) {
      setMessage("Error updating status");
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Delete this lead?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setMessage("Lead deleted");
      fetchLeads();
    } catch (error) {
      setMessage("Error deleting lead");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const q = search.toLowerCase();

    const searchMatch =
      lead.name.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      lead.source.toLowerCase().includes(q) ||
      lead.status.toLowerCase().includes(q);

    const sourceMatch = sourceFilter === "All" || lead.source === sourceFilter;
    const statusMatch = statusFilter === "All" || lead.status === statusFilter;

    return searchMatch && sourceMatch && statusMatch;
  });

  const total = leads.length;
  const interested = leads.filter((l) => l.status === "Interested").length;
  const converted = leads.filter((l) => l.status === "Converted").length;
  const notInterested = leads.filter((l) => l.status === "Not Interested").length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">CRM</div>
        <h2>LeadCRM</h2>
        <p>Mini CRM Dashboard</p>

        <nav>
          <span className="active">Dashboard</span>
          <span>Leads</span>
          <span>Reports</span>
          <span>Settings</span>
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h1>Lead Management System</h1>
            <p>Track and manage leads from Call, WhatsApp and Field sources.</p>
          </div>

          <button onClick={fetchLeads}>Refresh</button>
        </header>

        <section className="stats">
          <div className="stat blue">
            <p>Total Leads</p>
            <h2>{total}</h2>
          </div>

          <div className="stat purple">
            <p>Interested</p>
            <h2>{interested}</h2>
          </div>

          <div className="stat green">
            <p>Converted</p>
            <h2>{converted}</h2>
          </div>

          <div className="stat red">
            <p>Not Interested</p>
            <h2>{notInterested}</h2>
          </div>
        </section>

        <section className="grid">
          <div className="card form-card">
            <h2>Add New Lead</h2>
            <p className="muted">Fill lead information</p>

            <form onSubmit={addLead}>
              <label>Name</label>
              <input
                name="name"
                placeholder="Enter lead name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <label>Phone</label>
              <input
                name="phone"
                placeholder="Enter 10-digit number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <label>Source</label>
              <select
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
              >
                <option value="Call">Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Field">Field</option>
              </select>

              <button type="submit">Add Lead</button>
            </form>

            {message && <div className="message">{message}</div>}
          </div>

          <div className="card table-card">
            <div className="table-head">
              <div>
                <h2>Leads List</h2>
                <p className="muted">{filteredLeads.length} records found</p>
              </div>
            </div>

            <div className="filters">
              <input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="All">All Sources</option>
                <option value="Call">Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Field">Field</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Converted">Converted</option>
              </select>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Phone</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Update</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty">
                        No leads found
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div className="lead">
                            <div className="avatar">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <b>{lead.name}</b>
                              <small>ID #{lead.id}</small>
                            </div>
                          </div>
                        </td>

                        <td>{lead.phone}</td>
                        <td>
                          <span className="pill">{lead.source}</span>
                        </td>

                        <td>
                          <span
                            className={`status ${lead.status
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {lead.status}
                          </span>
                        </td>

                        <td>
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              updateStatus(lead.id, e.target.value)
                            }
                          >
                            <option value="Interested">Interested</option>
                            <option value="Not Interested">Not Interested</option>
                            <option value="Converted">Converted</option>
                          </select>
                        </td>

                        <td>
                          <button
                            className="delete"
                            onClick={() => deleteLead(lead.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

