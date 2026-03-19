let player = JSON.parse(localStorage.getItem("ironquest_player")) || {
level:1,
xp:0
}
  
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

let currentWorkoutType = null

function showScreen(screen){

document.querySelectorAll(".screen").forEach(s=>{
s.classList.remove("active")
})

document.getElementById("screen-"+screen).classList.add("active")

if(screen === "profile"){
loadStats()
}

}

function openWorkout(type){

currentWorkoutType = type

document.getElementById("navbar").style.display = "none"
document.getElementById("workout-picker").style.display = "none"
document.getElementById("finish-container").style.display = "block"

document.getElementById("workout-title").innerText = type.toUpperCase()

showScreen("workout")

localStorage.setItem("ironquest_current", JSON.stringify([]))

renderWorkout()

}

function renderWorkout(){

let container = document.getElementById("workout-list")

let workout = workouts[currentWorkoutType]

let history = JSON.parse(localStorage.getItem("ironquest_history")) || []
let current = JSON.parse(localStorage.getItem("ironquest_current")) || []

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

let targetSets = ex === "Plank" ? 2 : 3

let doneSets = current.filter(l => l.exercise === ex).length

let isComplete = doneSets >= targetSets

html += `<div class="card ${isComplete ? 'done' : ''}">
<h3>${ex} &nbsp;&nbsp; PR ${pr}kg ${isComplete ? '✔' : ''}</h3>`

for(let i=1;i<=targetSets;i++){

let prev = current.find(l => l.exercise === ex && l.set === i)

html += `
<div style="display:flex;gap:8px;margin-top:6px">
<input id="${ex}-w-${i}" placeholder="Peso" value="${prev ? prev.weight : ""}">
<input id="${ex}-r-${i}" placeholder="Reps" value="${prev ? prev.reps : ""}">
<button onclick="saveSet('${ex}',${i})">✓</button>
</div>
`

}

html += `</div>`

})

container.innerHTML = html

}

function finishWorkout(){

let xp = calculateWorkoutXP()
gainXP(xp)

document.getElementById("navbar").style.display = "flex"
document.getElementById("workout-picker").style.display = "block"
document.getElementById("finish-container").style.display = "none"

document.getElementById("workout-list").innerHTML = ""

document.getElementById("workout-title").innerText = "Treino"

currentWorkoutType = null

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

let index = current.findIndex(l => l.exercise === exercise && l.set === set)

if(index >= 0){
current[index] = entry
}else{
current.push(entry)
}

localStorage.setItem("ironquest_history", JSON.stringify(history))
localStorage.setItem("ironquest_current", JSON.stringify(current))

renderWorkout()

}

function loadStats(){

let select = document.getElementById("exercise-select")

let history = JSON.parse(localStorage.getItem("ironquest_history")) || []

let exercises = [...new Set(history.map(l => l.exercise))]

select.innerHTML = exercises.map(e => `<option>${e}</option>`).join("")

renderChart()

select.onchange = renderChart

}

function renderChart(){

let exercise = document.getElementById("exercise-select").value

let history = JSON.parse(localStorage.getItem("ironquest_history")) || []

let logs = history.filter(l =>
l.exercise === exercise &&
l.reps >= 8 &&
l.reps <= 12
)

let best = 0
let data = []

logs.forEach(l => {

let w = Number(l.weight)

if(w > best){
best = w
data.push(best)
}

})

let labels = data.map((_,i)=> i+1)

let ctx = document.getElementById("pr-chart")

if(window.chart) window.chart.destroy()

window.chart = new Chart(ctx,{
type:"line",
data:{
labels,
datasets:[{
label:"PR Progress",
data,
tension:0.3
}]
}
})

document.getElementById("exercise-info").innerHTML =
`PR atual: ${best || "-"} kg <br> Records batidos: ${data.length}`

}

function calculateWorkoutXP(){

let current = JSON.parse(localStorage.getItem("ironquest_current")) || []

let exercises = [...new Set(current.map(l=>l.exercise))]

let completed = 0

exercises.forEach(ex=>{

let target = ex === "Plank" ? 2 : 3

let done = current.filter(l=>l.exercise===ex).length

if(done >= target) completed++

})

let xp = 40 + (completed * 5)

return xp

}

function calculateWorkoutXP(){

let current = JSON.parse(localStorage.getItem("ironquest_current")) || []

let exercises = [...new Set(current.map(l=>l.exercise))]

let completed = 0

exercises.forEach(ex=>{

let target = ex === "Plank" ? 2 : 3

let done = current.filter(l=>l.exercise===ex).length

if(done >= target) completed++

})

let xp = 40 + (completed * 5)

return xp

}

function updateHome(){

document.querySelector(".card h2").innerText =
"Level " + player.level

document.querySelector(".xp-fill").style.width =
(player.xp / (100 + player.level*25))*100 + "%"

document.querySelector(".card p").innerText =
"XP " + player.xp + " / " + (100 + player.level*25)

}
