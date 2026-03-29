let workouts={
push:["Chest Press","Shoulder Press","Lateral Raises","Triceps Pushdown","Plank"],
pull:["Lat Pulldown","Seated Row","Reverse Pec Deck","Biceps Curl","Hammer Curl"],
legs:["Leg Press","Bulgarian Split Squat","Leg Curl","Leg Extension","Calf Raise"]
}

let currentWorkoutType=null

let player=JSON.parse(localStorage.getItem("ironquest_player"))||{level:1,xp:0}

let profile=JSON.parse(localStorage.getItem("ironquest_profile"))||{age:"",height:"",weight:""}

function showScreen(screen){
document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"))
document.getElementById("screen-"+screen).classList.add("active")
if(screen==="profile"){loadStats();loadProfile()}
}

function openWorkout(type){
currentWorkoutType=type
document.getElementById("navbar").style.display="none"
document.getElementById("workout-picker").style.display="none"
document.getElementById("finish-container").style.display="block"
document.getElementById("workout-title").innerText=type.toUpperCase()
showScreen("workout")
localStorage.setItem("ironquest_current",JSON.stringify([]))
renderWorkout()
}

function renderWorkout(){

let container=document.getElementById("workout-list")
let workout=workouts[currentWorkoutType]

let history=JSON.parse(localStorage.getItem("ironquest_history"))||[]
let current=JSON.parse(localStorage.getItem("ironquest_current"))||[]

let html=""

workout.forEach(ex=>{

let validLogs=history.filter(l=>l.exercise===ex&&l.reps>=8&&l.reps<=12)
let pr=validLogs.length?Math.max(...validLogs.map(l=>Number(l.weight))):"-"

let target=ex==="Plank"?2:3
let done=current.filter(l=>l.exercise===ex).length
let complete=done>=target

html+=`<div class="card ${complete?'done':''}">
<h3>${ex} PR ${pr}kg ${complete?'✔':''}</h3>`

for(let i=1;i<=target;i++){

let prev=current.find(l=>l.exercise===ex&&l.set===i)

html+=`
<div style="display:flex;gap:8px;margin-top:6px">
<input id="${ex}-w-${i}" value="${prev?prev.weight:""}" placeholder="Peso">
<input id="${ex}-r-${i}" value="${prev?prev.reps:""}" placeholder="Reps">
<button onclick="saveSet('${ex}',${i})">✓</button>
</div>`
}

html+=`</div>`
})

container.innerHTML=html
}

function saveSet(exercise,set){

let weight=document.getElementById(`${exercise}-w-${set}`).value
let reps=document.getElementById(`${exercise}-r-${set}`).value

let history=JSON.parse(localStorage.getItem("ironquest_history"))||[]
let current=JSON.parse(localStorage.getItem("ironquest_current"))||[]

let entry={exercise,set,weight,reps,date:new Date().toISOString()}

history.push(entry)

let index=current.findIndex(l=>l.exercise===exercise&&l.set===set)
if(index>=0) current[index]=entry
else current.push(entry)

localStorage.setItem("ironquest_history",JSON.stringify(history))
localStorage.setItem("ironquest_current",JSON.stringify(current))

renderWorkout()
}

function finishWorkout(){
let xp=calculateXP()
gainXP(xp)
document.getElementById("navbar").style.display="flex"
document.getElementById("workout-picker").style.display="block"
document.getElementById("finish-container").style.display="none"
document.getElementById("workout-list").innerHTML=""
document.getElementById("workout-title").innerText="Treino"
showScreen("workout")
}

function calculateXP(){

let current=JSON.parse(localStorage.getItem("ironquest_current"))||[]
let exercises=[...new Set(current.map(l=>l.exercise))]
let completed=0

exercises.forEach(ex=>{
let target=ex==="Plank"?2:3
let done=current.filter(l=>l.exercise===ex).length
if(done>=target) completed++
})

return 40+(completed*5)
}

function gainXP(amount){

player.xp+=amount
let leveled=false
let needed=100+(player.level*25)

while(player.xp>=needed){
player.xp-=needed
player.level++
leveled=true
needed=100+(player.level*25)
}

localStorage.setItem("ironquest_player",JSON.stringify(player))
updateHome()
if(leveled) showLevelUp()
}

function updateHome(){

document.querySelector(".card h2").innerText="Level "+player.level
let needed=100+(player.level*25)
document.querySelector(".xp-fill").style.width=(player.xp/needed*100)+"%"
document.querySelector(".card p").innerText=`XP ${player.xp} / ${needed}`
}

function showLevelUp(){
document.getElementById("levelup-text").innerText="Agora és Level "+player.level
document.getElementById("levelup-popup").style.display="flex"
}

function closeLevelUp(){
document.getElementById("levelup-popup").style.display="none"
}

function loadProfile(){
let view=document.getElementById("profile-view")
view.innerHTML=`
<p>Idade: ${profile.age||"-"}</p>
<p>Altura: ${profile.height||"-"} cm</p>
<p>Peso: ${profile.weight||"-"} kg</p>`
}

function editProfile(){
document.getElementById("profile-edit").style.display="block"
document.getElementById("age").value=profile.age
document.getElementById("height").value=profile.height
document.getElementById("weight").value=profile.weight
}

function saveProfile(){
profile.age=document.getElementById("age").value
profile.height=document.getElementById("height").value
profile.weight=document.getElementById("weight").value
localStorage.setItem("ironquest_profile",JSON.stringify(profile))
document.getElementById("profile-edit").style.display="none"
loadProfile()
}

function loadStats(){
let select=document.getElementById("exercise-select")
let history=JSON.parse(localStorage.getItem("ironquest_history"))||[]
let exercises=[...new Set(history.map(l=>l.exercise))]
select.innerHTML=exercises.map(e=>`<option>${e}</option>`).join("")
renderChart()
select.onchange=renderChart
}

function renderChart(){

let exercise=document.getElementById("exercise-select").value
let history=JSON.parse(localStorage.getItem("ironquest_history"))||[]

let logs=history.filter(l=>l.exercise===exercise&&l.reps>=8&&l.reps<=12)

let best=0
let data=[]

logs.forEach(l=>{
let w=Number(l.weight)
if(w>best){best=w;data.push(best)}
})

let labels=data.map((_,i)=>i+1)

let ctx=document.getElementById("pr-chart")
if(window.chart) window.chart.destroy()

window.chart=new Chart(ctx,{
type:"line",
data:{labels,datasets:[{label:"PR Progress",data,tension:0.3}]}
})

document.getElementById("exercise-info").innerHTML=
`PR atual: ${best||"-"} kg <br> Records: ${data.length}`

// HISTÓRICO EDITÁVEL
let list=document.getElementById("history-list")

list.innerHTML=logs.map((l,i)=>`
<div style="display:flex;justify-content:space-between;margin-top:8px">
<span>${l.weight}kg x ${l.reps}</span>
<div>
<button onclick="editLog(${i})">✏️</button>
<button onclick="deleteLog(${i})">🗑️</button>
</div>
</div>
`).join("")
}

function deleteLog(index){

let exercise=document.getElementById("exercise-select").value
let history=JSON.parse(localStorage.getItem("ironquest_history"))||[]

let logs=history.filter(l=>l.exercise===exercise&&l.reps>=8&&l.reps<=12)
let logToDelete=logs[index]

let removed=false

history=history.filter(l=>{
if(!removed && l===logToDelete){
removed=true
return false
}
return true
})

localStorage.setItem("ironquest_history",JSON.stringify(history))

renderChart()
}

function editLog(index){

let exercise=document.getElementById("exercise-select").value
let history=JSON.parse(localStorage.getItem("ironquest_history"))||[]

let logs=history.filter(l=>l.exercise===exercise&&l.reps>=8&&l.reps<=12)

let log=logs[index]

let newWeight=prompt("Novo peso:",log.weight)
let newReps=prompt("Novas reps:",log.reps)

if(newWeight!==null) log.weight=newWeight
if(newReps!==null) log.reps=newReps

localStorage.setItem("ironquest_history",JSON.stringify(history))

renderChart()
}

updateHome()
