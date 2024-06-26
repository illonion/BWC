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

// Get Cookie
function getCookie(cname) {
    let name = cname + "="
    let ca = document.cookie.split(';')
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

// Background Video
const bgVideoBlueEl = document.getElementById("bgVideoBlue")

// Team information
const teamBannerEl = document.getElementById("teamBanner")
const teamNameEl = document.getElementById("teamName")
let previousTeamName

// Team stars
const teamStarsEl = document.getElementById("teamStars")
let previousTeamStarCount, previousFirstTo

setInterval(() => {
    // Set background for winning side
    const winningTeamColour = getCookie("winningTeamColour")
    if (winningTeamColour === "blue") bgVideoBlueEl.style.opacity = 1
    else bgVideoBlueEl.style.opacity = 0

    // Set team name
    const winningTeamName = getCookie("winningTeamName")
    teamNameEl.innerText = winningTeamName

    if (previousTeamName !== winningTeamName) {
        // Set team banner
        const currentTeam = findTeamByTeamName(winningTeamName)
        if (currentTeam) {
            teamBannerEl.style.backgroundImage = `url("${currentTeam.team_banner}")`
        }
    }
    previousTeamName = winningTeamName

    // Set stars
    const currentTeamStarCount = parseInt(getCookie("teamStarCount"))
    const currentFirstTo = parseInt(getCookie("currentFirstTo"))
    if (currentTeamStarCount !== previousTeamStarCount || currentFirstTo !== previousFirstTo) {
        previousTeamStarCount = currentTeamStarCount
        previousFirstTo = currentFirstTo

        // Reset stars
        teamStarsEl.innerHTML = ""
        if (currentFirstTo === 0) return
        
        // Create stars
        function createStar(fill) {
            const teamStar = document.createElement("div")
            teamStar.classList.add("teamStar")
            if (fill) teamStar.classList.add("teamStarFill")
            return teamStar
        }

        // Display stars
        let i = 0
        for (i; i < currentTeamStarCount; i++) teamStarsEl.append(createStar(true))
        for (i; i < currentFirstTo; i++) teamStarsEl.append(createStar(false))
    }
}, 500)