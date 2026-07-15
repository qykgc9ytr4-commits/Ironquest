let workouts=JSON.parse(localStorage.getItem("ironquest_workouts"))||{

push:["Chest Press","Shoulder Press","Lateral Raises","Triceps Pushdown","Plank"],

pull:["Lat Pulldown","Seated Row","Reverse Pec Deck","Biceps Curl","Hammer Curl"],

legs:["Leg Press","Bulgarian Split Squat","Leg Curl","Leg Extension","Calf Raise"]

}
let currentWorkoutType=null

let editingExercise=null

let showAllWeights=false

let player=JSON.parse(localStorage.getItem("ironquest_player"))||{level:1,xp:0}

let profile=JSON.parse(localStorage.getItem("ironquest_profile"))||{age:"",height:"",weight:""}

let weighIns=JSON.parse(localStorage.getItem("ironquest_weighins"))||[]

let exerciseSettings=JSON.parse(
localStorage.getItem("ironquest_settings")
)||{}

function showScreen(screen){

document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"))

document.getElementById("screen-"+screen).classList.add("active")

if(screen==="profile"){
loadStats()
loadProfile()
renderWeightChart()
renderWeighHistory()
}

if(screen==="plan"){
renderPlan()
}

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

let s=exerciseSettings[ex]||{
sets:ex==="Plank"?2:3,
min:8,
max:12
}

let validLogs=history.filter(l=>
l.exercise===ex &&
l.reps>=s.min &&
l.reps<=s.max
)

let pr=validLogs.length
?Math.max(...validLogs.map(l=>Number(l.weight)))
:"-"

let target=s.sets

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

let s=exerciseSettings[ex]||{
sets:ex==="Plank"?2:3,
min:8,
max:12
}

let target=s.sets

let done=current.filter(l=>l.exercise===ex).length

if(done>=target){
completed++
}

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

let currentWeight=profile.weight

if(weighIns.length){

currentWeight=weighIns[weighIns.length-1].weight

}

view.innerHTML=`

<p>Idade: ${profile.age||"-"}</p>

<p>Altura: ${profile.height||"-"} cm</p>

<p>Peso: ${currentWeight||"-"} kg</p>

`

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

function renderPlan(){

let container=document.getElementById("plan-content")

let html=""

Object.keys(workouts).forEach(day=>{

html+=`<div class="card">`

html+=`<h2>${day.toUpperCase()}</h2>`

workouts[day].forEach(ex=>{

html+=`

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:8px;
">

<p style="margin:0">${ex}</p>

<div>

<button
style="
width:40px;
height:40px;
padding:0;
margin-right:4px;
font-size:18px;
"
onclick="editExercise('${day}','${ex}')">

✏️

</button>

<button
style="
width:40px;
height:40px;
padding:0;
font-size:18px;
"
onclick="deleteExercise('${day}','${ex}')">

🗑️

</button>

</div>

</div>

`

if(editingExercise===ex){

let s=exerciseSettings[ex]||{
sets:3,
min:8,
max:12
}

html+=`

<div class="card">

<p>Séries</p>
<input id="sets" value="${s.sets}">

<p>Min reps</p>
<input id="min" value="${s.min}">

<p>Max reps</p>
<input id="max" value="${s.max}">

<button class="primary"
onclick="saveExercise('${ex}')">

💾 Guardar

</button>

</div>

`

}

})

html+=`

<button class="primary"
onclick="addExercise('${day}')">

➕ Adicionar Exercício

</button>

`

html+=`</div>`

})

container.innerHTML=html

}

function addExercise(day){

let ex=prompt("Nome do exercício")

if(!ex)return

workouts[day].push(ex)

localStorage.setItem(
"ironquest_workouts",
JSON.stringify(workouts)
)

renderPlan()

}

function deleteExercise(day,exercise){

workouts[day]=workouts[day].filter(e=>e!==exercise)

localStorage.setItem(
"ironquest_workouts",
JSON.stringify(workouts)
)

renderPlan()

}

function editExercise(day,exercise){

editingExercise=exercise

renderPlan()

}

function saveExercise(ex){

exerciseSettings[ex]={

sets:Number(document.getElementById("sets").value),

min:Number(document.getElementById("min").value),

max:Number(document.getElementById("max").value)

}

localStorage.setItem(
"ironquest_settings",
JSON.stringify(exerciseSettings)
)

localStorage.setItem(
"ironquest_workouts",
JSON.stringify(workouts)
)

editingExercise=null

renderPlan()

}

function saveWeighIn(){

let date=document.getElementById("weigh-date").value
let weight=document.getElementById("weigh-weight").value

if(!date || !weight)return


weighIns.push({

date:date,

weight:Number(weight)

})


localStorage.setItem(

"ironquest_weighins",

JSON.stringify(weighIns)

)


document.getElementById("weigh-date").value=""
document.getElementById("weigh-weight").value=""


loadProfile()

renderWeightChart()

renderWeighHistory()

}

function renderWeightChart(){

let ctx=document.getElementById("weight-chart")

if(!ctx)return


let sorted=[...weighIns].sort((a,b)=>
new Date(a.date)-new Date(b.date)
)


let labels=sorted.map(w=>{

let d=new Date(w.date)

return d.toLocaleDateString(

'pt-PT',

{
day:'2-digit',
month:'2-digit'
}

)

})


let data=sorted.map(w=>w.weight)


if(window.weightChart){

window.weightChart.destroy()

}


window.weightChart=new Chart(ctx,{

type:"line",

data:{

labels,

datasets:[{

label:"Peso",

data,

tension:0.3

}]

}

})

}

function renderWeighHistory(){

let history=document.getElementById("weigh-history")
let toggle=document.getElementById("weigh-toggle")

if(!history)return

let sorted=[...weighIns].sort((a,b)=>
new Date(b.date)-new Date(a.date)
)

let shown=showAllWeights ? sorted : sorted.slice(0,3)

history.innerHTML=shown.map((w,i)=>{

let d=new Date(w.date)

let date=d.toLocaleDateString(
'pt-PT',
{
day:'2-digit',
month:'2-digit'
}
)

let index=weighIns.findIndex(x=>
x.date===w.date &&
x.weight===w.weight
)

return `

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-top:8px;
">

<span>${date}</span>

<div>

<span>${w.weight} kg</span>

${showAllWeights ? `

<button
onclick="editWeigh(${index})"
style="margin-left:8px"
>

✏️

</button>

<button
onclick="deleteWeigh(${index})"
>

🗑️

</button>

` : ""}

</div>

</div>

`

}).join("")


if(sorted.length>3){

toggle.innerHTML=`

<p
style="
text-align:center;
margin-top:10px;
cursor:pointer;
"
onclick="toggleWeights()"
>

${showAllWeights
? `▲ Mostrar menos`
: `▼ Ver todas (${sorted.length})`
}

</p>

`

}

else{

toggle.innerHTML=""

}

}

function toggleWeights(){

showAllWeights=!showAllWeights

renderWeighHistory()

}

function editWeigh(index){

let weight=prompt(

"Novo peso:",

weighIns[index].weight

)

if(weight===null)return


weighIns[index].weight=Number(weight)


localStorage.setItem(

"ironquest_weighins",

JSON.stringify(weighIns)

)


loadProfile()

renderWeightChart()

renderWeighHistory()

}

function deleteWeigh(index){

if(

!confirm(

"Apagar esta pesagem?"

)

)return


weighIns.splice(index,1)


localStorage.setItem(

"ironquest_weighins",

JSON.stringify(weighIns)

)


loadProfile()

renderWeightChart()

renderWeighHistory()

}

updateHome()
