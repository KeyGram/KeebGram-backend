const express = require("express");
const db = require("../db");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { FRONTEND_URL, DEBUG } = require("../config");

const router = express.Router();

router.get("/getAll", (req, res) => {
  const query = "SELECT * FROM accounts";

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Error");
      return;
    }
    if (results.length > 0) {
      const users = results;

      res.status(200).json(users);
    } else {
      res.status(404).send("No users found.");
    }
  });
});

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

    if (results.length > 0) {
      const user = results[0];
      delete user.password;

      res.status(200).json(user);
    } else {
      res.status(404).send("User not found");
    }
  });
});

router.get("/getOneByUsername", (req, res) => {
  const { username } = req.query;
  
  console.log("Received username:", username); // Log the received username

  const query = "SELECT * FROM accounts WHERE display_name = ?";

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Database error:", err); // Log database errors
      res.status(500).send("Error");
      return;
    }

    console.log("Database results:", results); // Log query results

    if (results.length > 0) {
      console.log("User found:", results[0]); // Log the found user
      const user = results[0];
      delete user.password;
      res.status(200).json(user);
    } else {
      console.log("No user found"); // Log when no user is found
      res.status(404).send("User:" + username + " not found");
    }
  });
});




// Route to add an account
router.post("/create", (req, res) => {
  const { email, password } = req.body;

  // Check that password is less than 45 characters
  if (password.length > 45) {
    return res.status(400).send("Password must be less than 45 characters.");
  }

  const token = jwt.sign({ email: email }, "keebgram-verify", {
    expiresIn: "1h",
  });

  // Prepare the call to the stored procedure
  // @ok is the output parameter that we capture in the SELECT statement.
  const sql = "CALL create_account(?, ?, ?, @ok); SELECT @ok AS ok;";

  db.query(sql, [email, password, token], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error adding account");
    }

    // Extract the value of ok from the results
    const ok = results[1][0].ok;
    if (ok === 1) {
      sendVerificationEmail(email, token);
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

  console.log(email);

  const query = "DELETE FROM accounts WHERE email = ?";

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error("Error deleting account:", err);
      res.status(500).send("Error deleting account");
      return;
    }

    console.log(result);
    
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

router.post("/registerGoogleAccount", (req, res) => {
  const { data } = req.body;
  // Prepare the call to the stored procedure
  // @ok is the output parameter that we capture in the SELECT statement.
  const sql = "CALL create_account_google(?, ?, @ok); SELECT @ok AS ok;";

  db.query(sql, [data?.email, ""], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error adding account");
    }

    // Extract the value of ok from the results
    const ok = results[1][0].ok;
    if (ok === 1) {
      // return res.status(201).send("Account added successfully");
      query = "SELECT * FROM accounts WHERE email = ?";
      db.query(query, [data?.email], (err, results) => {
        if (err) {
          res.status(500).send("Error during login");
          return;
        }
        if (results.length > 0) {
          const user = results[0];
          delete user.password;

          res.status(201).json(user);
        }
      });
    } else if (ok === 0) {
      // return res.status(409).send("Account with the same email already exists");
      query = "SELECT * FROM accounts WHERE email = ?";
      db.query(query, [data?.email], (err, results) => {
        if (err) {
          res.status(500).send("Error during login");
          return;
        }
        if (results.length > 0) {
          const user = results[0];
          delete user.password;

          res.status(409).json(user);
        }
      });
    }
  });
});

router.post("/verify", (req, res) => {
  const { token } = req.body;

  try {
    const decode = jwt.verify(token, "keebgram-verify");

    var query = "SELECT * FROM accounts WHERE verification_token = ?";

    db.query(query, [token], (err, results) => {
      if (err) {
        res.status(500).send("Error fetching token");
        return;
      }

      if (results.length > 0) {
        const user = results[0];

        if(user?.verification_token === token) {
          console.log("token match")

          query = "UPDATE accounts SET is_verified = 1 WHERE email = ?";

          db.query(query, [user?.email], (err, results) => {
            if(err) {
              res.status(500).send("Error updating account");
              return;
            }

            console.log(results);

            if (results?.changedRows > 0) {
              res.status(200).json({message: "Account verified successfully", user: user });
            } else {
              res.status(400).send("Account already verified");
            }
          })
        } 
      }
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).send("Token Expired");
    } else {
      res.status(404).json({message: "Matching token not found", error: error});
    }
  }
});

const sendVerificationEmail = (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "keebgram@gmail.com",
      pass: "lntl aopp qvgg urwd",
    },
  });

  const mailOption = {
    from: "keebgram@gmail.com",
    to: email,
    subject: "KeebGram Email Verification",
    text: `Please verify your account by clicking the following link: ${FRONTEND_URL[DEBUG]}/verify/token=${token}`,
  };

  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = router;
