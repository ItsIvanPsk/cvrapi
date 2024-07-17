const queryDatabase = require('../utils/queryDatabase');
const { v4: uuidv4 } = require('uuid');

exports.createSession = async (req, res) => {
  console.log("[createSession] - Start");
  let result = [];
  try {
    console.log("[createSession] - Reading POST data");
    let receivedPOST = req.body;
    console.log("[createSession] - POST data received:", receivedPOST);

    if (receivedPOST) {
      let uuid = uuidv4();
      try {
        console.log("[createSession] - Inserting into Hospital_Players");
        await queryDatabase(`INSERT INTO Hospital_Players (sessionId, sessionStartDate) VALUES ('${uuid}', NOW());`);
        console.log("[createSession] - Inserting into Hospital_Checkpoints");
        await queryDatabase(`INSERT INTO Hospital_Checkpoints (sessionId, checkpointId, date) VALUES ('${uuid}', 0, NOW());`);
        result.push(uuid);
        console.log("[createSession] - Success");
      } catch (error) {
        console.error("[createSession] - Database query error:", error);
        res.status(500).send("Database query error");
        return;
      }
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("[createSession] - Error reading POST data:", error);
    res.status(500).send("Error reading POST data");
  }
};

exports.endSession = async (req, res) => {
  console.log("[endSession] - Start");
  let result = [];
  try {
    console.log("[endSession] - Reading POST data");
    let receivedPOST = req.body;
    console.log("[endSession] - POST data received:", receivedPOST);

    if (receivedPOST) {
      let sessionId = receivedPOST.sessionId;
      if (sessionId === 'undefined' || sessionId === 'Undefined') {
        res.status(500).send("Invalid session Id, Undefined has been passed as sessionId");
      }
      try {
        console.log("[endSession] - Updating Hospital_Players");
        await queryDatabase(`UPDATE Hospital_Players SET sessionEndDate = NOW() WHERE sessionId = '${sessionId}';`);
        result.push('true');
        console.log("[endSession] - Success");
      } catch (error) {
        console.error("[endSession] - Database query error:", error);
        res.status(500).send("Database query error");
        return;
      }
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("[endSession] - Error reading POST data:", error);
    res.status(500).send("Error reading POST data");
  }
};

exports.playerCheckpoint = async (req, res) => {
  console.log("[playerCheckpoint] - Start");
  let result = [];
  try {
    console.log("[playerCheckpoint] - Reading POST data");
    let receivedPOST = req.body;
    console.log("[playerCheckpoint] - POST data received:", receivedPOST);

    if (receivedPOST) {
      let sessionId = receivedPOST.sessionId;
      let checkpointId = receivedPOST.checkpointId;

      try {
        console.log("[playerCheckpoint] - Checking session existence");
        let sessionExists = await queryDatabase(`SELECT * FROM Hospital_Players WHERE sessionId = '${sessionId}'`);
        if (sessionExists.length === 0) {
          throw new Error("sessionId does not exist in Hospital_Players");
        }

        console.log("[playerCheckpoint] - Checking checkpoint existence");
        let isDone = await queryDatabase(`SELECT * FROM Hospital_Checkpoints WHERE sessionId = '${sessionId}' AND checkpointId = ${checkpointId}`);
        if (isDone.length === 0) {
          await queryDatabase(`INSERT INTO Hospital_Checkpoints (sessionId, checkpointId, date) VALUES ('${sessionId}', ${checkpointId}, NOW());`);
          result.push('true');
        } else {
          result.push('exists');
        }
      } catch (error) {
        console.error("[playerCheckpoint] - Database query error:", error);
        res.status(500).send("Database query error: " + error.message);
        return;
      }
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("[playerCheckpoint] - Error reading POST data:", error);
    res.status(500).send("Error reading POST data");
  }
};

exports.sessionList = async (req, res) => {
  console.log("[sessionList] - Start");
  let result = [];
  try {
    try {
      console.log("[sessionList] - Checking session existence");
      let sessionLists = await queryDatabase(`
        SELECT hp.sessionId, hp.sessionStartDate, max(hc.checkpointId) as actualCheckpoint FROM vrapi_pro.hospital_players as hp
        INNER JOIN vrapi_pro.hospital_checkpoints as hc on hp.sessionId = hc.sessionId
        WHERE sessionEndDate IS NULL
        GROUP BY hp.sessionId;
      `);
      if (sessionLists.length === 0) {
        throw new Error("There are no active sessions on the hospital vr experience");
      }
      result = sessionLists;
    } catch (error) {
      console.error("[sessionList] - Database query error:", error);
      res.status(500).send("Database query error: " + error.message);
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("[sessionList] - Error reading data:", error);
    res.status(500).send("Error reading POST data");
  }
};