const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/getUserNotifications", (req, res) => {
  const { account_id } = req.query;

  if (!account_id) {
    return res.status(400).send("Account ID is required");
  }

  const sql = "SELECT * from notifications WHERE account_id = ?";

  db.query(sql, [account_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving user notifications");
    }

    console.log(results);
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(404).json(results);
    }
  });
});

router.post("/create", (req, res) => {
  const { post, message } = req.body;
  const query =
    "INSERT INTO notifications (post_id, account_id, message) VALUES (?, ?, ?)";

  db.query(
    query,
    [post?.post_id, post?.account_id, message],
    (err, results) => {
      if (err) {
        res.status(500).send("Error creating notification");
        return;
      }

      if (results?.affectedRows > 0) {
        res.status(201).json({ message: `Notification Created` });
      } else {
        res.status(401).json({ message: `Unable to add Notification` });
      }
    }
  );
});

router.put("/markUserNotificationsRead", (req, res) => {
  const { account_id } = req.query;

  console.log(account_id)
  const sql = "UPDATE notifications SET is_read = 1 WHERE account_id = ?";

  db.query(sql, [account_id], (err, results) => {
    if (err) {
      res.status(500).send("Error updating notification");
      return;
    }
    if (results.affectedRows > 0) {
      res.status(200).json({ message: "Notifications updated" });
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  });
});

router.delete("/delete", (req, res) => {
  const { notification_id } = req.query;

  const query = `DELETE FROM notifications WHERE notification_id = ${notification_id}`;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Error deleting notification");
      return;
    }

    if (results.affectedRows > 0) {
      res.status(200).send("Notification deleted");
    } else {
      res.status(404).send("Notification does not exist");
    }
  });
});

module.exports = router;
