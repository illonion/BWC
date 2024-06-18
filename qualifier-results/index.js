// Load in mappool
let allBeatmaps
async function getMappool() {
    const response = await fetch("../_data/sample-qualifier-results/beatmaps.json")
    const responseJson = await response.json()
    allBeatmaps = responseJson.beatmaps
}
getMappool()

// Load in scores
let allScores
async function getScores() {
    const response = await fetch("../_data/sample-qualifier-results/scores.json")
    const responseJson = await response.json()
    allScores = responseJson
}
getScores()

// Load in all teams
let allTeams
async function getTeams() {
    const response = await fetch("../_data/sample-qualifier-results/teams.json")
    const responseJson = await response.json()
    allTeams = responseJson
}

getTeams()