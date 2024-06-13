// testConnection.js
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "keebgram-db-server.mysql.database.azure.com",
  user: "keebgram@keebgram-db-server",
  password: "Password1",
  database: "KeebGram",
  port: 3306,
  ssl: {
    rejectUnauthorized: false,
  },
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database.");
  connection.end();
});
