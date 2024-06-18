const express = require("express");
const db = require("../db");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/products");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Fetch products by vendor ID
router.get("/getByVendorId", (req, res) => {
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
router.get("/getById", (req, res) => {
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

// Add a new product with image
router.post("/createProductWithImage", upload.single("image"), (req, res) => {
  const { name, description, price, unit_count, vendor_id } = req.body;
  const imageFile = req.file;

  if (
    !name ||
    !description ||
    !price ||
    !unit_count ||
    !vendor_id ||
    !imageFile
  ) {
    return res.status(400).send("All fields are required");
  }

  const imagePath = path.join("images/products", imageFile.filename);

  const query = "CALL create_product(?, ?, ?, ?, ?, ?, @ok); SELECT @ok AS ok;";

  db.query(
    query,
    [name, description, price, unit_count, vendor_id, imagePath],
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

router.put(
  "/:productId/updateProductWithImage",
  upload.single("image"),
  (req, res) => {
    const { productId } = req.params;
    const { name, description, price, unit_count } = req.body;
    const imageFile = req.file;

    let query = `
    UPDATE products 
    SET 
      name = ?, 
      description = ?, 
      price = ?, 
      unit_count = ?
  `;

    const queryParams = [name, description, price, unit_count];

    if (imageFile) {
      const imagePath = path.join("images/products", imageFile.filename);
      query += `, image_path = ?`;
      queryParams.push(imagePath);
    }

    query += ` WHERE product_id = ?`;
    queryParams.push(productId);

    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Error updating product:", err);
        return res.status(500).send("Error updating product");
      }
      res.status(200).send("Product updated successfully");
    });
  }
);

module.exports = router;
