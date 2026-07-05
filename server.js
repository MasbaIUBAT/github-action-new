require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemSchema);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB Atlas connection error:", err.message);
  });

app.get("/", (req, res) => {
  res.send("Hello World from GitHub Actions deployment\n");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "app1",
    database: mongoose.connection.readyState === 1 ? "connected" : "not connected",
    processId: process.pid,
  });
});

app.post("/items", async (req, res) => {
  try {
    const item = await Item.create({
      name: req.body.name,
    });

    res.status(201).json({
      message: "Item saved successfully",
      item,
      processId: process.pid,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save item",
      error: error.message,
    });
  }
});

app.get("/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });

    res.json({
      count: items.length,
      items,
      processId: process.pid,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch items",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
