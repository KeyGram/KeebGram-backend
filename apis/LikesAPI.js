const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/getLikesCount", (req, res) => {
    const { post_id } = req.query;

    console.log("Post ID in /getLikesCount: " + post_id);
    const sql = "CALL get_likes_count(?);";

    db.query(sql, [post_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error retrieving like count");
      }
      if (result.length > 0) {
      return res.status(201).json(result);
      } else {
        return res.status(404).send("Error with post id");
      }
    });
});

router.post("/add", (req, res) => {
  const { post_id, account_id } = req.body;
  const query = "INSERT INTO likes (post_id, account_id) VALUES (?, ?)";

  db.query(query, [post_id, account_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error liking post");
    }
    return res.status(201).send("Post Liked");
  });
});

router.delete("/delete", (req, res) => {
  const { post_id, account_id } = req.query;
  const query = "DELETE FROM likes WHERE post_id = ? AND account_id = ?";

  db.query(query, [post_id, account_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error removing like");
    }

    if (result.affectedRows === 1) {
      res.status(200).send("like removed successfully");
    } else {
      res.status(404).send("you have not liked this post");
    }
  });
});

module.exports = router;