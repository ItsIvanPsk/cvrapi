const { query } = require('express');
const queryDatabase = require('../utils/queryDatabase');
const { v4: uuidv4 } = require('uuid');

exports.login = async (req, res) => {
  console.log("[login] - Start");
  let result = [];
  try {
    console.log("[login] - Reading POST data");
    let receivedPOST = req.body;
    console.log("[login] - POST data received:", receivedPOST);

    if (receivedPOST) {
      let uuid = uuidv4();
      let username = receivedPOST.username;
      let password = receivedPOST.password;
      if (username === 'undefined' || password == 'undefined'){
        return;
      }
      try {
        let user = await queryDatabase(`
          SELECT * FROM Users WHERE Name = '${username}' AND Pwd = '${password}';
        `);
        if (user.length === 0) {
          result.push('"result": "User not found"');
        }
        let hasToken = await queryDatabase(`SELECT * FROM SesionUsers WHERE UserId = ${user[0].UserId}`);
        console.log(hasToken);
        console.log(hasToken.length === 0);
        if (hasToken.length === 0) {
          await queryDatabase(`INSERT INTO SesionUsers (UserId, Token, ExpirationDate) VALUES ('${user[0].UserId}','${uuid}', NOW());`);
        } else {
          uuid = await queryDatabase(`SELECT Token FROM SesionUsers WHERE UserId = ${user[0].UserId}`);
        }
        console.log(user);
        if (user.length !== 0) {
          let response = {
            ...user[0],
            ...uuid[0]
          }
          result.push(response);
        } else {
          result.push('"result": "User not found"');
        }
      } catch (error) {
        console.error("[login] - Database query error:", error);
        res.status(500).send("Database query error");
        return;
      }
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("[login] - Error reading POST data:", error);
    res.status(500).send("Error reading POST data");
  }
};