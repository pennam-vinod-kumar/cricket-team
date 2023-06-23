const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const allPlayersQuery = `SELECT *
    FROM cricket_team
    ORDER BY player_id;`;
  const playersArray = await db.all(allPlayersQuery);
  response.send(
    playersArray.map((each) => convertDbObjectToResponseObject(each))
  );
});

app.post("/players/", async (request, response) => {
  const bookDetails = request.body;
  const { playerName, jerseyNumber, role } = bookDetails;
  const postPlayersQuery = `INSERT INTO
  cricket_team(player_name,jersey_number,role)
  VALUES 
  ('${playerName}',${jerseyNumber},'${role}',);`;
  await db.run(postPlayersQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `SELECT *
    FROM cricket_team
    WHERE player_id=${playerId};`;
  const playerArray = await db.get(getPlayersQuery);
  response.send(
    playerArray.map((each) => convertDbObjectToResponseObject(each))
  );
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const bookDetails = request.body;
  const { playerName, jerseyNumber, role } = bookDetails;
  const putPlayersQuery = `UPDATE cricket_team
     SET
     player_name='${playerName}',
     jersey_number=${jerseyNumber},
     role='${role}',
     WHERE player_id=${playerId};`;
  await db.run(putPlayersQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayersQuery = `DELETE FROM
    cricket_team
    WHERE player_id=${playerId};`;
  await db.run(deletePlayersQuery);
  response.send("Player Removed");
});
module.exports = app;
