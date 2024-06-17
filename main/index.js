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
}