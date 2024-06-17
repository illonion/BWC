// Load in mappool
let allBeatmaps
async function getMappool() {
    const response = await fetch("../_data/sample-qualifier-results/beatmaps.json")
    const responseJson = await response.json()
    allBeatmaps = responseJson.beatmaps
    console.log(allBeatmaps)
}
getMappool()

// Load in scores
let allScores
async function getScores() {
    const response = await fetch("../_data/sample-qualifier-results/scores.json")
    const responseJson = await response.json()
    allScores = responseJson
    console.log(allScores)
}
getScores()