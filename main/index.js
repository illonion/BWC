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
    teamScoreNumberDelta: new CountUp("teamScoreNumberDelta", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: "", decimal: "." }),
    redTeamAccuracyNumber: new CountUp("redTeamAccuracyNumber", 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: "", decimal: ".", suffix: "%"}),
    blueTeamAccuracyNumber: new CountUp("blueTeamAccuracyNumber", 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: "", decimal: ".", suffix: "%"}),
    teamScoreAccuracyDelta: new CountUp("teamScoreAccuracyDelta", 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: "", decimal: ".", suffix: "%"}),
}

// Score Accuracy Switch
const redTeamScoreTextEl = document.getElementById("redTeamScoreText")
const blueTeamScoreTextEl = document.getElementById("blueTeamScoreText")
const currentScoringSystemTextEl = document.getElementById("currentScoringSystemText")
let currentScoreType = "score"
function setScoringSystem(system) {
    currentScoreType = system
    if (currentScoreType === "score") {
        redTeamScoreNumberEl.style.display = "block"
        blueTeamScoreNumberEl.style.display = "block"
        teamScoreNumberDeltaEl.style.display = "block"
        redTeamAccuracyNumberEl.style.display = "none"
        blueTeamAccuracyNumberEl.style.display = "none"
        teamScoreAccuracyDeltaEl.style.display = "none"
        currentScoringSystemTextEl.innerText = "Score V2"
        redTeamScoreTextEl.innerText = "SCORE"
        blueTeamScoreTextEl.innerText = "SCORE"
    } else {
        redTeamScoreNumberEl.style.display = "none"
        blueTeamScoreNumberEl.style.display = "none"
        teamScoreNumberDeltaEl.style.display = "none"
        redTeamAccuracyNumberEl.style.display = "block"
        blueTeamAccuracyNumberEl.style.display = "block"
        teamScoreAccuracyDeltaEl.style.display = "block"
        currentScoringSystemTextEl.innerText = "Accuracy"
        redTeamScoreTextEl.innerText = "ACCURACY"
        blueTeamScoreTextEl.innerText = "ACCURACY"
    }
}

// IPC States
let currentIPCState = 0
let previousIPCState = 0

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
        let movingScoreBarRectangleWidth = Math.min(Math.pow(movingScoreBarDifferencePercent, 0.5)* 960, 960)
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
    } else if (currentScoreType === "accuracy") {
        // Reset scores
        currentScoreRed = 0
        currentScoreBlue = 0
        currentScoreDelta = 0

        // Add accuracies
        for (let i = 0; i < data.tourney.ipcClients.length; i++) {
            let currentClient = data.tourney.ipcClients[i]
            let currentScore = currentClient.gameplay.accuracy
            if (currentClient.team === "left") currentScoreRed += currentScore
            else currentScoreBlue += currentScore
        }

        currentScoreRed /= (data.tourney.ipcClients.length / 2)
        currentScoreBlue /= (data.tourney.ipcClients.length / 2)

        // Set delta
        currentScoreDelta = Math.abs(currentScoreRed - currentScoreBlue)

        // Set animations
        scoreAnimation.redTeamAccuracyNumber.update(currentScoreRed)
        scoreAnimation.blueTeamAccuracyNumber.update(currentScoreBlue)
        scoreAnimation.teamScoreAccuracyDelta.update(currentScoreDelta)

        // Bar percentage
        let movingScoreBarDifferencePercent = Math.min(currentScoreDelta / 15, 1)
        let movingScoreBarRectangleWidth = Math.min(Math.pow(movingScoreBarDifferencePercent, 0.5) * 960, 960)
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
    
    // IPC State
    // This is only used for setting the score system
    if (currentIPCState !== data.tourney.manager.ipcState) {
        currentIPCState = data.tourney.manager.ipcState
        if (previousIPCState === 4 && currentIPCState !== previousIPCState) setScoringSystem("score")
        previousIPCState = currentIPCState
    }
}