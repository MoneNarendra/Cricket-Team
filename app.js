const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initilatizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(
        'Server Running .... https://narendrakumar3sdyxnjscpxtwms.drops.nxtwave.tech/players/',
      )
    })
  } catch (e) {
    console.log(`Error Msg: ${e.message}`)
    process.exit(1)
  }
}

initilatizeDbAndServer()

// GET list of all players in team API

app.get('/players/', async (request, response) => {
  const getPlayersQuary = `SELECT * FROM cricket_team`
  const playersArray = await db.all(getPlayersQuary)

  const ans = eachPlayer => {
    return {
      playerId: eachPlayer.player_id,
      playerName: eachPlayer.player_name,
      jerseyNumber: eachPlayer.jersey_number,
      role: eachPlayer.role
    }
  }

  response.send(playersArray.map(eachPlayer => ans(eachPlayer)))
})

// Creates a new player in the team API

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuary = `
  INSERT INTO 
    cricket_team (player_name, jersey_number, role) 
  VALUES 
    ('${playerName}', 
    ${jerseyNumber},
    '${role}');`
  const dbResponse = await db.run(addPlayerQuary)
  // const playerId = dbResponse.lastID
  // response.send({playerId: playerId})
  response.send('Player Added to Team')
})

//  GET player based on a player ID API

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuary = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`
  const playersArray = await db.get(getPlayerQuary)

  const ans = playersArray => {
    return {
      playerId: playersArray.player_id,
      playerName: playersArray.player_name,
      jerseyNumber: playersArray.jersey_number,
      role: playersArray.role,
    }
  }

  response.send(ans(playersArray))

  // response.send(playersArray)
})

// PUT Updates the details of a player in the team

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuary = `
    UPDATE
      cricket_team
    SET 
      player_name='${playerName}', 
      jersey_number=${jerseyNumber}, 
      role='${role}'
    WHERE
      player_id=${playerId};`

  await db.run(updatePlayerQuary)
  response.send('Player Details Updated')
})

// DELETE player from the team

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuary = `
  DELETE FROM
    cricket_team
  WHERE
    player_id=${playerId};`
  await db.run(deletePlayerQuary)
  response.send('Player Removed')
})

module.exports = app
