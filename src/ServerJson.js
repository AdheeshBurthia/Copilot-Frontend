const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

const products = [
  {
    id: "2db6e5dc-2118-44c4-b4e3-4a59847cd38f",
    name: "Laptop",
    price: 400.0,
    quantity: 4,
    active: true,
  },
  {
    id: "2db6e5dc-2118-44c4-b4e3-4a59847cd37f",
    name: "Keyboard",
    price: 29.99,
    quantity: 10,
    active: true,
  },
];

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/products", (req, res) => {
  res.json(products);
});

app.post("/products", (req, res) => {
  const { name, price, quantity, active } = req.body;

  if (!name || !price || !quantity) {
    return res.status(400).json({ message: "Please fill out all fields" });
  }

  const id = crypto.randomUUID();
  const newProduct = { id, name, price, quantity, active };

  products.push(newProduct);

  res.status(201).json(newProduct);
});

app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, price, quantity, active } = req.body;

  const product = products.find((product) => product.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  product.name = name;
  product.price = price;
  product.quantity = quantity;
  product.active = active;

  res.json({ message: "Product updated successfully!", product });
});

app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex((product) => product.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products.splice(productIndex, 1);

  res.json({ message: "Product deleted successfully!" });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
