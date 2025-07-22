const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "databaseudin.cvei06i02g38.ap-southeast-2.rds.amazonaws.com",
  user: "adminudin",
  password: "baraqimak123",
  database: "databaseudin",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Terhubung yeay!");
});

module.exports = db;
