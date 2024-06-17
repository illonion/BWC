// Round Name
const roundNameEl = document.getElementById("roundName")
let allBeatmaps

// Load in mappool
async function getMappool() {
    const response = await fetch("../_data/beatmaps.json")
    const responseJson = await response.json()

    // Round name
    roundNameEl.innerText = responseJson.roundName.toUpperCase()
    // Set beatmaps
    allBeatmaps = responseJson.beatmaps
}

getMappool()

// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Team Name
const redTeamNameEl = document.getElementById("redTeamName")
const blueTeamNameEl = document.getElementById("blueTeamName")
let currentRedTeamName, currentBlueTeamName

// Team Stars
const redTeamStarsEl = document.getElementById("redTeamStars")
const blueTeamStarsEl = document.getElementById("blueTeamStars")
let currentBestOf, currentFirstTo, currentRedStars, currentBlueStars

// Score Section
const redTeamScoreNumberEl = document.getElementById("redTeamScoreNumber")
const blueTeamScoreNumberEl = document.getElementById("blueTeamScoreNumber")
const redTeamAccuracyNumberEl = document.getElementById("redTeamAccuracyNumber")
const blueTeamAccuracyNumberEl = document.getElementById("blueTeamAccuracyNumber")
const teamScoreNumberDeltaEl = document.getElementById("teamScoreNumberDelta")
const teamScoreAccuracyDeltaEl = document.getElementById("teamScoreAccuracyDelta")
let currentScoreRed, currentScoreBlue, currentScoreDelta
const scoreAnimation = {
    redTeamScoreNumber: new CountUp("redTeamScoreNumber", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: "", decimal: "." }),
    blueTeamScoreNumber: new CountUp("blueTeamScoreNumber", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: "", decimal: "." }),
    teamScoreNumberDelta: new CountUp("teamScoreNumberDelta", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: "", decimal: "." })
}

// Score Accuracy Switch
const redTeamScoreTextEl = document.getElementById("redTeamScoreText")
const blueTeamScoreTextEl = document.getElementById("blueTeamScoreText")
let currentScoreType = "score"

// Moving score bar
const redTeamMovingScoreBarEl = document.getElementById("redTeamMovingScoreBar")
const blueTeamMovingScoreBarEl = document.getElementById("blueTeamMovingScoreBar")

socket.onmessage = async (event) => {
    const data = JSON.parse(event.data) 
    console.log(data)

    // Team names
    if (currentRedTeamName !== data.tourney.manager.teamName.left) {
        currentRedTeamName = data.tourney.manager.teamName.left
        redTeamNameEl.innerText = currentRedTeamName
    }
    if (currentBlueTeamName !== data.tourney.manager.teamName.right) {
        currentBlueTeamName = data.tourney.manager.teamName.right
        blueTeamNameEl.innerText = currentBlueTeamName
    }

    // Team Stars
    if (currentBestOf !== data.tourney.manager.bestOF ||
        currentRedStars !== data.tourney.manager.stars.left ||
        currentBlueStars !== data.tourney.manager.stars.right
    ) {
        currentBestOf = data.tourney.manager.bestOF
        currentFirstTo = Math.ceil(currentBestOf / 2)
        currentRedStars = data.tourney.manager.stars.left
        currentBlueStars = data.tourney.manager.stars.right

        redTeamStarsEl.innerHTML = ""
        blueTeamStarsEl.innerHTML = ""

        // Teams
        function createStars(starVariable, starContainer) {
            for (let i = 0; i < currentFirstTo; i++) {
                const teamStar = document.createElement("div")
                teamStar.classList.add("teamStar", (i < starVariable)? "teamStarFill" : null)
                starContainer.append(teamStar)
            } 
        }
        createStars(currentRedStars, redTeamStarsEl)
        createStars(currentBlueStars, blueTeamStarsEl)
    }

    // Scores
    if (currentScoreType === "score") {
        // Reset scores
        currentScoreRed = 0
        currentScoreBlue = 0
        currentScoreDelta = 0

        // Add scores
        for (let i = 0; i < data.tourney.ipcClients.length; i++) {
            let currentClient = data.tourney.ipcClients[i]
            let currentScore = currentClient.gameplay.score * (currentClient.gameplay.mods.str.includes("ST")? 1.75 : 1)
            console.log(currentScore)
            if (currentClient.team === "left") currentScoreRed += Math.round(currentScore)
            else currentScoreBlue += Math.round(currentScore)
        }

        // Set delta
        currentScoreDelta = Math.abs(currentScoreRed - currentScoreBlue)

        // Set animations
        scoreAnimation.redTeamScoreNumber.update(currentScoreRed)
        scoreAnimation.blueTeamScoreNumber.update(currentScoreBlue)
        scoreAnimation.teamScoreNumberDelta.update(currentScoreDelta)

        // Bar percentage
        let movingScoreBarDifferencePercent = Math.min(currentScoreDelta / 1000000, 1)
        let movingScoreBarRectangleWidth = Math.min(Math.pow(movingScoreBarDifferencePercent, 0.5) * 0.8 * 960, 960)
        // Set bar
        if (currentScoreRed > currentScoreBlue) {
            redTeamMovingScoreBarEl.style.width = `${movingScoreBarRectangleWidth}px`
            blueTeamMovingScoreBarEl.style.width = `0px`
        } else if (currentScoreRed === currentScoreBlue) {
            redTeamMovingScoreBarEl.style.width = `0px`
            blueTeamMovingScoreBarEl.style.width = `0px`
        } else if (currentScoreRed < currentScoreBlue) {
            redTeamMovingScoreBarEl.style.width = `0px`
            blueTeamMovingScoreBarEl.style.width = `${movingScoreBarRectangleWidth}px`
        }
    }
}