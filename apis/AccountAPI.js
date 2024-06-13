const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/getAll", (req, res) => {
  const query = "SELECT * FROM accounts";

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Error");
      return;
    }
    if(results.length >0) {
      const users = results;

      res.status(200).json(users);
    } else {
      res.status(404).send("No users found.")
    }
  })
})

router.get("/getOneByEmail", (req, res) => {
  const { email } = req.query;

  const query = "SELECT * FROM accounts WHERE email = ?";

  db.query(query, [email], (err, results) => {
    if (err) {
      res.status(500).send("Error");
      return;
    }
    if (results.length > 0) {
      const user = results[0];
      delete user.password;

      res.status(200).json(user);
    } else {
      res.status(404).send("User not found");
    }
  });
});

router.get("/getOneByID", (req, res) => {
  const { id } = req.query;

  const query = "SELECT * FROM accounts WHERE account_id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send("Error");
      return;
    }

    if(results.length > 0){
      const user = results[0];
      delete user.password;

      res.status(200).json(user);
    } else {
      res.status(404).send("User not found");
    }
  })
})

// Route to add an account
router.post("/create", (req, res) => {
  const { email, password } = req.body;

  // Check that password is less than 45 characters
  if (password.length > 45) {
    return res.status(400).send("Password must be less than 45 characters.");
  }

  // Prepare the call to the stored procedure
  // @ok is the output parameter that we capture in the SELECT statement.
  const sql = "CALL create_account(?, ?, @ok); SELECT @ok AS ok;";

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error adding account");
    }

    // Extract the value of ok from the results
    const ok = results[1][0].ok;
    if (ok === 1) {
      return res.status(201).send("Account added successfully");
    } else if (ok === 0) {
      return res.status(409).send("Account with the same email already exists");
    }
  });
});

router.post("/update", (req, res) => {
  const {
    email,
    firstName,
    lastName,
    displayName,
    country,
    birthdate,
    gender,
    language,
  } = req.body;

  const query = `
      UPDATE accounts 
      SET 
        first_name = ?, 
        last_name = ?, 
        display_name = ?, 
        country = ?, 
        birthdate = ?, 
        gender = ?, 
        language = ?, 
        setup_finished = 1
      WHERE email = ?;
    `;

  db.query(
    query,
    [
      firstName,
      lastName,
      displayName,
      country,
      birthdate,
      gender,
      language,
      email,
    ],
    (err, result) => {
      if (err) {
        res.status(500).send("Error updating account details");
        return;
      }
      res.send("Account details updated successfully");
    }
  );
});

// DELETE endpoint to delete an account by email
router.delete("/delete", (req, res) => {
    const { email } = req.query; // Assuming email is passed as a query parameter
  
    const query = "DELETE FROM accounts WHERE email = ?";
  
    db.query(query, [email], (err, result) => {
      if (err) {
        console.error("Error deleting account:", err);
        res.status(500).send("Error deleting account");
        return;
      }
  
      if (result.affectedRows === 1) {
        res.status(200).send("Account deleted successfully");
      } else {
        res.status(404).send("Account not found");
      }
    });
  });
  
  // Route to verify login
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    let query = "CALL login(?, ?, @ok); SELECT @ok as ok;";
    db.query(query, [email, password], (err, results) => {
      if (err) {
        res.status(500).send("Error during login");
        return;
      }
  
      const ok = results[1][0].ok;
      if (ok === 1) {
        // Login successful
        query = "SELECT * FROM accounts WHERE email = ?";
        db.query(query, [email], (err, results) => {
          if (err) {
            res.status(500).send("Error during login");
            return;
          }
          if (results.length > 0) {
            const user = results[0];
            delete user.password;
  
            res.status(200).json(user);
          }
        });
      } else {
        return res.status(401).send("Invalid email or password");
      }
    });
  });
  

module.exports = router;
