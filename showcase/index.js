// Round Names
const roundTextYellowEl = document.getElementById("roundTextYellow")
const roundTextBlackEl = document.getElementById("roundTextBlack")
let roundName
let allBeatmaps

// Load in mappool
async function getMappool() {
    const response = await fetch("../_data/showcaseBeatmaps.json")
    const responseJson = await response.json()

    // Round name
    roundName = responseJson.roundName.toUpperCase()
    roundTextYellowEl.innerText = roundName
    roundTextBlackEl.innerText = roundName
    setLetterSpacing(roundTextYellowEl)
    setLetterSpacing(roundTextBlackEl)

    // Set beatmaps
    allBeatmaps = responseJson.beatmaps
}

// Set letter
const roundTextMaxWidth = 510
const roundTextMaxMarginError = 0.5
function setLetterSpacing(element) {
    let currentLetterSpacing = window.getComputedStyle(element).getPropertyValue("letter-spacing").slice(0,-2)
    let currentLetterSpacingConditionMet = false
    while (!currentLetterSpacingConditionMet) {
        if (element.getBoundingClientRect().width > roundTextMaxWidth + roundTextMaxMarginError) {
            currentLetterSpacing -= 0.01
            element.style.letterSpacing = `${currentLetterSpacing}px`
        } else if (element.getBoundingClientRect().width < roundTextMaxWidth - roundTextMaxMarginError) {
            currentLetterSpacing += 0.01
            element.style.letterSpacing = `${currentLetterSpacing}px`
        } else {
            currentLetterSpacingConditionMet = true
        }
    }
}

getMappool()

// Find map in mappol
const findMapInMappool = (beatmapID) => allBeatmaps.find(beatmap => beatmap.beatmapID == beatmapID) || null

// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Map details
const titleNameEl = document.getElementById("titleName")
const artistNameEl = document.getElementById("artistName")
const mapperNameEl = document.getElementById("mapperName")
const difficultyNameEl = document.getElementById("difficultyName")
let currentId, currentMd5
let foundMapInMappool = false
// Stats
const statsLengthEl = document.getElementById("statsLength")
const statsSREl = document.getElementById("statsSR")
const statsBPMEl = document.getElementById("statsBPM")
const statsAREl = document.getElementById("statsAR")
const statsCSEl = document.getElementById("statsCS")
const statsHPEl = document.getElementById("statsHP")
const statsODEl = document.getElementById("statsOD")

// Replay by username
const replayByUsernameEl = document.getElementById("replayByUsername")
let replayByUsername

socket.onmessage = async (event) => {
    const data = JSON.parse(event.data)   
    console.log(data)

    // Map details
    if (currentId !== data.menu.bm.id || currentMd5 !== data.menu.bm.md5) {
        currentId = data.menu.bm.id
        currentMd5 = data.menu.bm.md5
        foundMapInMappool = false

        titleNameEl.innerText = data.menu.bm.metadata.title
        artistNameEl.innerText = data.menu.bm.metadata.artist
        mapperNameEl.innerText = data.menu.bm.metadata.mapper
        difficultyNameEl.innerText = data.menu.bm.metadata.difficulty

        const currentMap = findMapInMappool(currentId)
        if (currentMap) {
            foundMapInMappool = true

            // Set map details for everything
            // Length
            let lengthSeconds = parseInt(currentMap.songLength)
            let lengthMinutes = Math.floor(lengthSeconds / 60)
            let remainderSeconds = lengthSeconds % 60
            statsLengthEl.innerText = `${lengthMinutes}:${("0" + remainderSeconds.toString()).slice(-2)}`
            // SR
            statsSREl.innerText = Math.round(parseFloat(currentMap.difficultyrating) * 100) / 100
            // BPM
            statsBPMEl.innerText = parseFloat(currentMap.bpm)
            // AR
            statsAREl.innerText = Math.round(parseFloat(currentMap.ar) * 10) / 10
            // CS
            statsCSEl.innerText = Math.round(parseFloat(currentMap.cs) * 10) / 10
            // HP
            statsHPEl.innerText = Math.round(parseFloat(currentMap.hp) * 10) / 10
            // OD
            statsODEl.innerText = Math.round(parseFloat(currentMap.od) * 10) / 10
        }
    }
    // Stats
    if (!foundMapInMappool) {
        // Length
        let lengthSeconds = Math.round(data.menu.bm.time.full / 1000)
        let lengthMinutes = Math.floor(lengthSeconds / 60)
        let remainderSeconds = lengthSeconds % 60
        statsLengthEl.innerText = `${lengthMinutes}:${("0" + remainderSeconds.toString()).slice(-2)}`
        // SR
        statsSREl.innerText = data.menu.bm.stats.fullSR
        // BPM
        statsBPMEl.innerText = data.menu.bm.stats.BPM.common
        // AR
        statsAREl.innerText = Math.round(parseFloat(data.menu.bm.stats.AR) * 10) / 10
        // CS
        statsCSEl.innerText = Math.round(parseFloat(data.menu.bm.stats.CS) * 10) / 10
        // HP
        statsHPEl.innerText = Math.round(parseFloat(data.menu.bm.stats.HP) * 10) / 10
        // OD
        statsODEl.innerText = Math.round(parseFloat(data.menu.bm.stats.OD) * 10) / 10
    }

    // Replay by username
    if (replayByUsername !== data.resultsScreen.name) {
        replayByUsername = data.resultsScreen.name
        replayByUsernameEl.innerText = replayByUsername.toUpperCase()
    }
}