// Round Name
const roundNameEl = document.getElementById("roundName")

// Load in mappool
async function getMappool() {
    const response = await fetch("../_data/beatmaps.json")
    const responseJson = await response.json()

    // Round name
    roundNameEl.innerText = responseJson.roundName.toUpperCase()
}

getMappool()

// Load in teams
let allTeams
async function getTeams() {
    const response = await fetch("../_data/teams.json")
    allTeams = await response.json()
}

getTeams()

// Find team by team name
const findTeamByTeamName = teamName => allTeams.find(team => team.team_name === teamName)