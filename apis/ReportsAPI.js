const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/getAll", (req, res) => {
    const query = "SELECT * FROM reports";

    db.query(query, (err, results) => {
        if (err) {
          res.status(500).send("Error");
          return;
        }
    
        if (results.length > 0) {
          res.status(200).json(results);
        } else {
          res.status(204).send("No reports found");
        }
      });
});

router.get("/get/:id", (req, res) => {
    const reports_id = req.params.id;
    const query = "SELECT * FROM reports WHERE reports_id = ?";

    db.query(query, [reports_id], (err, results) => {
        if (err) {
          res.status(400).send("Error");
        }
    
        res.status(200).json(results);
      });
});

module.exports = router;
