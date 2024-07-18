const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/getAll", (req, res) => {
    const query = "SELECT * FROM Designs";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send("Error retrieving designs");
        }
        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).send("No designs found.");
        }
    });
});

router.get("/user/:userId", (req, res) => {
    const {userId} = req.params;
    const query = "SELECT * FROM Designs WHERE user_id = ?";
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).send("Error retrieving designs for user");
        }
        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).send("No designs found for this user.");
        }
    });
});

router.post("/create", (req, res) => {
    const {
        user_id,
        design_name,
        alphas_color,
        modifiers_color,
        accents_color,
        legends_color,
    } = req.body;

    const sql = "CALL create_design(?, ?, ?, ?, ?, ?)";
    db.query(
        sql,
        [
            user_id,
            design_name,
            alphas_color,
            modifiers_color,
            accents_color,
            legends_color,
        ],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error creating design");
            }
            res.status(201).send("Design created successfully");
        }
    );
});


router.put("/update", (req, res) => {
    const {
        design_id,
        design_name,
        alphas_color,
        modifiers_color,
        accents_color,
        legends_color,
    } = req.body;

    const sql = "CALL edit_design(?, ?, ?, ?, ?, ?)";
    db.query(
        sql,
        [
            design_id,
            design_name,
            alphas_color,
            modifiers_color,
            accents_color,
            legends_color,
        ],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error updating design");
            }
            res.send("Design updated successfully");
        }
    );
});


router.delete("/delete/:id", (req, res) => {
    const {id} = req.params;
    const sql = "CALL delete_design(?)";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting design:", err);
            return res.status(500).send("Error deleting design");
        }
        if (result.affectedRows === 1) {
            res.status(200).send("Design deleted successfully");
        } else {
            res.status(404).send("Design not found");
        }
    });
});

module.exports = router;
