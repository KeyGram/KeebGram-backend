const express = require("express");
const db = require("../db");

const router = express.Router();

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

router.get("/getAll", (req, res) => {
  const query = "SELECT * FROM posts";

  db.query(query, (err, results) => {
    // Changed 'res' to 'results'
    if (err) {
      res.status(500).send("Error");
      return;
    }

    if (results.length > 0) {
      res.status(200).json(results); // Use 'results' here
    } else {
      res.status(404).send("No posts found");
    }
  });
});
router.post("/create", (req, res) => {
  const { account_id, content_text, content_image } = req.body;

  const query = "CALL create_post(?, ?, ?, ?, @ok); SELECT @ok AS ok;";
  const date = formatDate(Date.now());
  db.query(
    query,
    [account_id, content_text, content_image, date],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error adding post");
      }

      const ok = results[1][0].ok;
      if (ok === 1) {
        return res.status(201).send("Post created");
      } else if (ok === 0) {
        return res.status(409).send("Error");
      }
    }
  );
});

router.get("/next", (req, res) => {
  const query =
    "SELECT MAX(post_id) AS last_id FROM posts;";

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
module.exports = router;
