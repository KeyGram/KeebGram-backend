const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/getAll", (req, res) => {
    const query = "SELECT * from vendor_applications";

    db.query(query, (err, results) => {
        if(err) {
            res.status(500).send("Error");
            return
        }
        if(results.length > 0) {
            const applications = results;

            res.status(200).json(applications)
        } else {
            res.status(400).send("No applications found.");
        }
    })
})

router.post("/create", (req, res) => {
    const { vendor } = req.body;
  
    const sql = `
      SET @ok = 0;
      CALL apply_for_vendor(?, ?, ?, ?, ?, ?, ?, ?, @ok);
      SELECT @ok AS ok;
    `;
  
    db.query(
      sql,
      [
        vendor?.account_id,
        vendor?.vendor_name,
        vendor?.store_url,
        vendor?.address_line,
        vendor?.city,
        vendor?.stprov,
        vendor?.postal,
        vendor?.phone_number
      ],
      (err, results) => {
        if (err) {
          console.error(err);
          if(err?.errno === 1062) {
            return res.status(500).send("Vendor Application already being processed");
          } else {
              return res.status(500).send("Error adding application");
          }
        }
  
        const ok = results[2][0].ok; // Adjusted to match the result set index
        if (ok === 1) {
          return res.status(201).send("Application submitted successfully");
        } else if (ok === 0) {
          return res.status(409).send("Vendor application already being processed");
        }
      }
    );
  });

  router.post("/delete", (req, res) => {
    const { application } = req.body;
  
    const query = "DELETE FROM vendor_applications WHERE application_id = ?; DELETE FROM addresses WHERE address_id = ?";
  
    db.query(query, [application?.application_id, application?.address_id], (err, result) => {
      if (err) {
        console.error("Error deleting application: ", err);
        res.status(500).send("Error deleting application");
        return;
      }
  
      // Note: Result object contains multiple query results.
      // Check the affected rows of both delete queries.
      const affectedRows = result.reduce((sum, res) => sum + res.affectedRows, 0);

      if(affectedRows > 0) {
        res.status(200).send("Application deleted successfully");
      } else {
        res.status(404).send("Application not found");
      }
    });
  });

  router.post("/approve", (req, res) => {
    const { application_id } = req.body;

    const sql = `
      SET @ok = 0;
      CALL approve_vendor_application(?, @ok);
      SELECT @ok AS ok;
    `;

    db.query(sql, [application_id], (err, results) => {
      if (err) {
        console.error(err);
      }
      console.log(results)
      const ok = results[2][0].ok; // Adjusted to match the result set index
      if (ok === 1) {
        res.status(200).send("Application approved")
      } else if (ok === 0) {
        res.status(500).send("Error approving application")
      }
    })
  })
  

module.exports = router;
