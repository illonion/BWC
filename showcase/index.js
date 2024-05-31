// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Map details
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

socket.onmessage = async (event) => {
    const data = JSON.parse(event.data)   
    console.log(data)
}