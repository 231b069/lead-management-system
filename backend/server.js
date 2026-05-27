const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Lead Management Backend is running");
});

// Add lead
app.post("/api/leads", async (req, res) => {
  try {
    const { name, phone, source } = req.body;

    if (!name || !phone || !source) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({ message: "Name must be at least 3 characters" });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }

    const validSources = ["Call", "WhatsApp", "Field"];

    if (!validSources.includes(source)) {
      return res.status(400).json({ message: "Invalid lead source" });
    }

    const result = await pool.query(
      "INSERT INTO leads (name, phone, source) VALUES ($1, $2, $3) RETURNING *",
      [name.trim(), phone, source]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all leads
app.get("/api/leads", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM leads ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update lead status
app.put("/api/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ["Interested", "Not Interested", "Converted"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await pool.query(
      "UPDATE leads SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete lead
app.delete("/api/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM leads WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

