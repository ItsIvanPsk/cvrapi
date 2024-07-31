// utils/queryDatabase.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || "localhost",
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || "vrapi",
  password: process.env.MYSQLPASSWORD || "P@ssw0rd",
  database: process.env.MYSQLDATABASE || "vrapi_pro",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function queryDatabase(query) {
  try {
    const [results] = await pool.query(query);
    return results;
  } catch (error) {
    throw error;
  }
}

module.exports = queryDatabase;
