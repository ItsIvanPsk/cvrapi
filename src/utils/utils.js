var mysql = require('mysql2');

function queryDatabase(query) {
  return new Promise((resolve, reject) => {
    var connectionDev = mysql.createConnection({
      host: process.env.MYSQLHOST || "localhost",
      port: process.env.MYSQLPORT || 3306,
      user: process.env.MYSQLUSER || "vrapi",
      password: process.env.MYSQLPASSWORD || "P@ssw0rd",
      database: process.env.MYSQLDATABASE || "vrapi_pro"
    });

    connectionDev.query(query, (error, results) => { 
      if (error) return reject(error);
      resolve(results);
    });

    connectionDev.end();
  });
}

module.exports = queryDatabase;
