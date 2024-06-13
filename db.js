const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "keebgram-db-server.mysql.database.azure.com",
  user: "keebgram",
  password: "Password1",
  database: "KeebGram",
  multipleStatements: true,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");
});

module.exports = db;