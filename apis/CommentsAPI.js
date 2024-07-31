const express = require("express");
const db = require("../db");

const router = express.Router();

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

router.get("/getAll", (req, res) => {
  const { post_id } = req.query;

  const query = "CALL get_comments(?, @ok); SELECT @ok as ok;";

  db.query(query, [post_id], (err, results) => {
    if (err) {
      res.status(500).send("Error");
      return;
    }

    if (results.length > 0) {
      const comments = results[0];

      res.status(200).json(comments);
    } else {
      res.status(404).send("No comments found");
    }
  });
});


router.get("/get/:id", (req, res) => {
  const comment_id = req.params.id;

  const query = "SELECT * FROM comments WHERE comment_id = ?";

  db.query(query, [comment_id], (err, results) => {
    if (err) {
      res.status(400).send("Error");
    }

    res.status(200).json(results);
  });
});

router.post("/edit/:id", (req, res) => {
  const { comment_id, post_id, account_id, content, comment_date } = req.body;

  const query = "CALL edit_comment(?, ?, ?, ?, ?, @ok); SELECT @ok as ok;";

  db.query(
    query,
    [comment_id, post_id, account_id, content, formatDate(comment_date)],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Error");
      }

      const ok = results[1][0].ok;

      if (ok === 1) {
        res.status(200).send("Comment updated successfully");
      } else {
        res.status(400).send("Failed to update comment");
      }
    }
  );
});

router.post("/create", (req, res) => {
  const { post_id, account_id, content } = req.body?.comment;

  const query = "CALL create_comment(?, ?, ?, ?, @ok); SELECT @ok as ok;";
  const date = formatDate(Date.now());
  db.query(query, [post_id, account_id, content, date], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    const ok = results[1][0].ok;

    if (ok === 1) {
      res.status(201).send("Comment created");
    } else {
      res.status(400).send("Error posting comment");
    }
  });
});

router.post("/delete", (req, res) => {
  const { comment_id } = req.body;

  const query = "DELETE FROM comments WHERE comment_id = ?";

  db.query(query, [comment_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Error");
    }

    if (results.affectedRows > 0) {
      res.status(200).send("Comment deleted successfully");
    } else {
      res.status(400).send("Error deleting comment");
    }
  });
});

module.exports = router;
