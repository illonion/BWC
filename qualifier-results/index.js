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
const findScore = (beatmap_id, player_id) => allScores.find(score => score.beatmapId == beatmap_id && score.playerId == player_id)

// Load in all teams
let allTeams
async function getTeams() {
    const response = await fetch("../_data/sample-qualifier-results/teams.json")
    const responseJson = await response.json()
    allTeams = responseJson.sort((a, b) => (a.team_seed < b.team_seed)? 1 : -1)
}
getTeams()

// Team Counter
let currentTeamCounter = 0

// Load team details
const teamBannerEl = document.getElementById("teamBanner")
const teamNameEl = document.getElementById("teamName")
const teamSeedEl = document.getElementById("teamSeed")
const resultsTableEl = document.getElementById("resultsTable")
const currentTeamEl = document.getElementById("currentTeam")

// Sleep function
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// Load teams
function loadTeam(teamObject) {
    // Add team details
    teamNameEl.innerText = teamObject.team_name
    teamSeedEl.innerText = `#${teamObject.team_seed}`
    teamBannerEl.style.backgroundImage = `url("${teamObject.team_banner}")`
    currentTeamEl.innerText = teamObject.team_name

    // Reset table
    resultsTableEl.innerHTML = ""

    // Add mods to results table
    const modRow = document.createElement("tr")
    modRow.classList.add("headerRow")
    for (let i = -1; i < allBeatmaps.length; i++) {
        const columnHeading = document.createElement("th")
        if (i !== -1) {
            columnHeading.innerText = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`

            switch (allBeatmaps[i].mod) {
                case "NM": columnHeading.style.backgroundColor = "#00AEB7"; break;
                case "HD": {
                    columnHeading.style.color = "#262626"
                    columnHeading.style.backgroundColor = "#F8C524"; 
                    break;
                }
                case "HR": columnHeading.style.backgroundColor = "#EC704A"; break;
                case "DT": columnHeading.style.backgroundColor = "#9C7BD1"; break;
            }
        } else columnHeading.classList.add("firstColumn")
        modRow.append(columnHeading)
    }
    resultsTableEl.append(modRow)

    // Create results object for team results
    let teamResultsObject = []
    for (let i = 0; i < allBeatmaps.length; i++) {
        teamResultsObject.push({
            "beatmap_id": allBeatmaps[i].beatmapID,
            "score": 0
        })
    }
    const findCurrentteamResultsObject = (beatmap_id) => teamResultsObject.find(object => object.beatmap_id === beatmap_id)

    // Append individual results
    for (let i = 0; i < teamObject.player_ids.length; i++) {
        if (teamObject.player_ids[i] === null) continue
        // For each player, create a row
        const modRowIndividual = document.createElement("tr")
        modRowIndividual.classList.add("notHeaderRow")
        for (let j = -1; j < allBeatmaps.length; j++) {
            const modDataIndividual = document.createElement("td")
            if (j === -1) {
                modDataIndividual.innerText = teamObject.player_names[i]
                modDataIndividual.classList.add("firstColumn")
            } else {
                const currentScore = findScore(allBeatmaps[j].beatmapID, teamObject.player_ids[i])
                if (currentScore) {
                    const score = currentScore.score
                    modDataIndividual.innerText = score
                    const teamScore = findCurrentteamResultsObject(allBeatmaps[j].beatmapID)
                    teamScore.score += score
                }
            }
            modRowIndividual.append(modDataIndividual)
        }
        resultsTableEl.append(modRowIndividual)
    }

    // Append final results
    const teamRow = document.createElement("tr")
    teamRow.classList.add("notHeaderRow")
    for (let i = -1; i < teamResultsObject.length; i++) {
        const teamRowData = document.createElement("td")
        if (i === -1) {
            teamRowData.innerText = teamObject.team_name
            teamRowData.classList.add("firstColumn")
        } else if (teamResultsObject[i].score !== 0) {
            teamRowData.innerText = teamResultsObject[i].score
        }
        teamRow.append(teamRowData)
    }
    resultsTableEl.insertBefore(teamRow, resultsTableEl.children[1])

    // Set height and line height of table depending on teammates
    let height
    switch (teamObject.player_ids.filter(player_id => player_id !== null).length) {
        case 6: 
            height = 70
            break
        case 7:
            height = 60
            break
        case 8:
            height = 53
            break
    }

    // Actually set the heights
    for (let i = 1; i < resultsTableEl.childElementCount; i++) {
        for (let j = 0; j < resultsTableEl.children[i].childElementCount; j++) {
            const currentElement = resultsTableEl.children[i].children[j]
            currentElement.style.height = `${height}px`
            currentElement.style.lineHeight = `${height}px`
        }
    }
}

let intervalId = setInterval(() => {
    if (allBeatmaps && allScores && allTeams) {
        loadTeam(allTeams[currentTeamCounter])
        clearInterval(intervalId)
    }
}, 100)

// Next and previous teams
function nextTeam() {
    currentTeamCounter++
    if (currentTeamCounter >= allTeams.length) currentTeamCounter = 0
    loadTeam(allTeams[currentTeamCounter])
}
function previousTeam() {
    currentTeamCounter--
    if (currentTeamCounter < 0) currentTeamCounter = allTeams.length - 1
    loadTeam(allTeams[currentTeamCounter])
}