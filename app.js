const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at https://localhosr:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const getAllPlayersList = (eachPlayer) => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
    jerseyNumber: eachPlayer.jersey_number,
    role: eachPlayer.role,
  };
};

//1 get all players
app.get("/players/", async (request, response) => {
  const getPlayers = `
SELECT 
* 
FROM 
cricket_team;`;
  const playersList = await db.all(getPlayers);
  response.send(playersList.map((eachPlayer) => getAllPlayersList(eachPlayer)));
});

//creates a player in team
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
INSERT INTO
cricket_team(player_name,jersey_number,role)
VALUES
(
'${playerName}',
${jerseyNumber},
'${role}'
);`;
  const dbResponse = await db.run(addPlayer);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
SELECT
*
FROM
cricket_team
WHERE 
player_id = ${playerId};`;

  const player = await db.get(getPlayer);
  response.send(getAllPlayersList(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
UPDATE
cricket_team
SET
player_name = '${playerName}',
jersey_number = ${jerseyNumber},
role = '${role}',
WHERE
player_id = ${playerId};`;

  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
DELETE FROM
cricket_team
WHERE 
player_id = ${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
