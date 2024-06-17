// Load in mappool
let allBeatmaps
async function getMappool() {
    const response = await fetch("../_data/sample_qualifier_results/beatmaps.json")
    const responseJson = await response.json()
    allBeatmaps = responseJson.beatmaps
}
getMappool()

