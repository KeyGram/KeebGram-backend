const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/getAddressByAccountId", (req, res) => {
    const { account_id } = req.query;
  
    if (!account_id) {
      return res.status(400).send("Account ID is required");
    }
    const query = "SELECT * FROM addresses WHERE account_id = ?";
  
    db.query(query, [account_id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("(AddressesAPI)Error fetching vendor data");
      }
  
      if (results.length === 0) {
        return res.status(404).send("(AddressesAPI)Vendor Address not found");
      }
  
      res.status(200).json(results[0]);
    });
  });

router.post("/update", (req, res) => {
    const {
        account_id,
        address_line,
        city,
        stprov,
        postal,
    } = req.body;

    const query = `
      UPDATE addresses 
      SET 
        address_line = ?, 
        city = ?, 
        stprov = ?, 
        postal = ?
      WHERE account_id = ?;
    `;

    db.query(
        query,
        [address_line,
            city,
            stprov,
            postal,
            account_id,
        ],
        (err, result) => {
            if (err) {
              res.status(500).send("Error updating address details");
              return;
            }
            res.send("address details updated successfully");
          }
    );
});

module.exports = router;