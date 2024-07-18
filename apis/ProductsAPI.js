const express = require("express");
const db = require("../db");
const router = express.Router();

// Fetch products by vendor ID
router.get("/getProductsByVendorId", (req, res) => {
  const { vendorId } = req.query;
  console.log("Fetching products for vendor ID:", vendorId); // Debugging

  const query = "SELECT * FROM products WHERE vendor_id = ?";

  db.query(query, [vendorId], (err, results) => {
    if (err) {
      console.error("Error fetching products:", err); // Debugging
      return res.status(500).send("Error fetching products");
    }
    if (results.length === 0) {
      return res.status(404).send("No products found for vendor ID");
    }
    console.log("Products fetched successfully:", results); // Debugging
    res.status(200).json(results);
  });
});

// Fetch product by ID
router.get("/getProductById", (req, res) => {
  const { productId } = req.query;

  const query = "SELECT * FROM products WHERE product_id = ?";

  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Error fetching product details:", err);
      return res.status(500).send("Error fetching product details");
    }
    if (results.length > 0) {
      const product = results[0];
      let imageUrl = null;

      if (product.image_path) {
        imageUrl = `/images/products/${path.basename(product.image_path)}`;
      }

      res.status(200).json({ ...product, image_url: imageUrl });
    } else {
      res.status(404).send("Product not found");
    }
  });
});

router.get("/next", (req, res) => {
  const query = "SELECT MAX(product_id) AS last_id FROM products;";

  db.query(query, (err, results) => {
    if (err) {
      res.status(400).send("Error");
      return;
    }
    // Assuming results[0] contains the AUTO_INCREMENT value
    const nextId = results[0]?.last_id + 1;

    res.status(200).json({ nextId: nextId });
  });
});

// Add a new product
router.post("/create", (req, res) => {
  const {
    name,
    description,
    price,
    unit_count,
    vendor_id,
    image_data,
    alpha,
    modifier,
    accent,
    legend,
  } = req.body;

  const query =
    "CALL create_product(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @ok); SELECT @ok AS ok;";

  db.query(
    query,
    [
      name,
      description,
      price,
      unit_count,
      vendor_id,
      image_data,
      alpha,
      modifier,
      accent,
      legend,
    ],
    (err, results) => {
      if (err) {
        console.error("Error adding product:", err);
        return res.status(500).send("Error adding product");
      }

      const ok = results[1][0].ok;
      if (ok === 1) {
        res.status(201).send("Product added successfully");
      } else {
        res.status(409).send("Error");
      }
    }
  );
});

// Update product details
router.put("/update", (req, res) => {
  const { product_id, name, description, price, unit_count } = req.body;

  const query =
    "UPDATE products SET name = ?, description = ?, price = ?, unit_count = ? WHERE product_id = ?";

  db.query(
    query,
    [name, description, price, unit_count, product_id],
    (err, results) => {
      if (err) {
        console.error("Error updating product:", err);
        return res.status(500).send("Error updating product");
      }
      res.status(200).send("Product updated successfully");
    }
  );
});

// Delete a product
router.delete("/delete", (req, res) => {
  const { productId } = req.query;

  const query = "DELETE FROM products WHERE product_id = ?";

  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Error deleting product:", err);
      return res.status(500).send("Error deleting product");
    }
    if (results.affectedRows === 1) {
      res.status(200).send("Product deleted successfully");
    } else {
      res.status(404).send("Product not found");
    }
  });
});

module.exports = router;
