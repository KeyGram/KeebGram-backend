const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/getLikesCount", (req, res) => {
    const { post_id } = req.query;

    // console.log("Post ID in /getLikesCount: " + post_id);
    const sql = "CALL get_likes_count(?);";

    db.query(sql, [post_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error retrieving like count");
      }
      if (result.length > 0) {
        return res.status(201).json(result[0][0]['COUNT(*)']);
      } else {
        return res.status(404).send("Error with post id");
      }
    });
});

router.get("/isPostLiked", (req, res) => {
  const { post_id, account_id } = req.query;
  const query = "SELECT * FROM likes WHERE post_id = ? AND account_id = ?";

  db.query(query, [post_id, account_id], (err, results) => {
    if (err) {
      res.status(500).send("Error during check if post has been liked");
      return;
    }

    if (results.length > 0) {
      return res.status(200).send(true);
    } else {
      return res.status(200).send(false);
    }
  });
});

router.post("/add", (req, res) => {
  const { post_id, account_id } = req.body;
  const query = "CALL like_post(?, ?, @ok); SELECT @ok as ok;";

  db.query(query, [post_id, account_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error liking post");
    }
    const ok = result[1][0].ok;
    if (ok === 1) {
      return res.status(201).send("Post Liked");
    } else {
      return res.status(409).send("Post already liked");
    }
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