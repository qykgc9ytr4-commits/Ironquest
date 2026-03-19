let workouts = {
push: [
"Chest Press",
"Shoulder Press",
"Lateral Raises",
"Triceps Pushdown",
"Plank"
],

pull: [
"Lat Pulldown",
"Seated Row",
"Reverse Pec Deck",
"Biceps Curl",
"Hammer Curl"
],

legs: [
"Leg Press",
"Bulgarian Split Squat",
"Leg Curl",
"Leg Extension",
"Calf Raise"
]
}

function showScreen(screen){

document.querySelectorAll(".screen").forEach(s=>{
s.classList.remove("active")
})

document.getElementById("screen-"+screen).classList.add("active")

}

function openWorkout(type){

document.getElementById("navbar").style.display = "none"
showScreen("workout")

// ⭐ limpar treino atual
localStorage.setItem("ironquest_current", JSON.stringify([]))

let container = document.getElementById("workout-list")

let workout = workouts[type]

let history = JSON.parse(localStorage.getItem("ironquest_history")) || []

let html = ""

workout.forEach(ex => {

let validLogs = history.filter(l =>
l.exercise === ex &&
l.reps >= 8 &&
l.reps <= 12
)

let pr = validLogs.length
? Math.max(...validLogs.map(l => Number(l.weight)))
: "-"

html += `<div class="card">
<h3>${ex} &nbsp;&nbsp; PR ${pr}kg</h3>`

let targetSets = ex === "Plank" ? 2 : 3

for(let i=1;i<=targetSets;i++){

html += `
<div style="display:flex;gap:8px;margin-top:6px">
<input id="${ex}-w-${i}" placeholder="Peso">
<input id="${ex}-r-${i}" placeholder="Reps">
<button onclick="saveSet('${ex}',${i})">✓</button>
</div>
`

}

html += `</div>`

})

container.innerHTML = html

}

function finishWorkout(){

document.getElementById("navbar").style.display = "flex"
document.getElementById("workout-picker").style.display = "block"
document.getElementById("workout-title").innerText = "Treino"

showScreen("workout")

}

function saveSet(exercise,set){

let weight = document.getElementById(`${exercise}-w-${set}`).value
let reps = document.getElementById(`${exercise}-r-${set}`).value

let history = JSON.parse(localStorage.getItem("ironquest_history")) || []
let current = JSON.parse(localStorage.getItem("ironquest_current")) || []

let entry = {
exercise,
set,
weight,
reps,
date:new Date().toISOString()
}

history.push(entry)
current.push(entry)

localStorage.setItem("ironquest_history", JSON.stringify(history))
localStorage.setItem("ironquest_current", JSON.stringify(current))

}
