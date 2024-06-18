const express = require("express");
const db = require("../db");

const router = express.Router();

const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toISOString().slice(0, 19).replace("T", " ");
};

router.get("/getAll", (req, res) => {
    const {post_id} = req.query;

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

router.get("/getOneById", (req, res) => {
    const {comment_id} = req.query;

    const query = "CALL get_comment_by_id(?, @ok); SELECT @ok as ok;";

    db.query(query, [comment_id], (err, results) => {
        if (err) {
            res.status(500).send("Error");
            return;
        }

        if (results.length > 0) {
            const comments = results[0];

            res.status(200).json(comments);
        } else {
            res.status(404).send("No comment found");
        }
    });
});

router.post("/create", (req, res) => {
    const {post_id, account_id, content} = req.body?.comment;

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

router.put("/edit", (req, res) => {
    const {comment_id, content} = req.body;
    const date = formatDate(Date.now());

    const query = "CALL edit_comment(?, ?, ?, @ok); SELECT @ok as ok;";

    db.query(query, [comment_id, content, date], (err, results) => {
        if (err) {
            res.status(500).send("Error editing comment");
            return;
        }

        const ok = results[1][0].ok;

        if (ok === 1) {
            res.status(200).send("Comment edited");
        } else {
            res.status(400).send("Error editing comment");
        }
    });
});

router.delete("/delete", (req, res) => {
    const {comment_id} = req.query;

    const query = "CALL delete_comment(?, @ok); SELECT @ok as ok;";

    db.query(query, [comment_id], (err, results) => {
        if (err) {
            res.status(500).send("Error deleting comment");
            return;
        }

        const ok = results[1][0].ok;

        if (ok === 1) {
            res.status(200).send("Comment deleted");
        } else {
            res.status(400).send("Error deleting comment");
        }
    });
});

module.exports = router;
