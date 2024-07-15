const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const postgres = require("postgres");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection setup
let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/products", async (req, res) => {
  try {
    const products = await sql`SELECT * FROM products`;
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/products", async (req, res) => {
  const { name, price, quantity, active } = req.body;

  if (!name || !price || !quantity) {
    return res.status(400).json({ message: "Please fill out all fields" });
  }

  const id = crypto.randomUUID();

  try {
    await sql`INSERT INTO products (id, name, price, quantity, active) VALUES (${id}, ${name}, ${price}, ${quantity}, ${active})`;
    const newProduct = { id, name, price, quantity, active };
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity, active } = req.body;

  try {
    const product = await sql`SELECT * FROM products WHERE id = ${id}`;

    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    await sql`UPDATE products SET name = ${name}, price = ${price}, quantity = ${quantity}, active = ${active} WHERE id = ${id}`;

    res.json({
      message: "Product updated successfully!",
      product: { id, name, price, quantity, active },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sql`DELETE FROM products WHERE id = ${id}`;

    if (result.count === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
