let workouts = {
push:["Chest Press","Shoulder Press","Lateral Raises","Triceps Pushdown","Plank"],
pull:["Lat Pulldown","Seated Row","Reverse Pec Deck","Biceps Curl","Hammer Curl"],
legs:["Leg Press","Bulgarian Split Squat","Leg Curl","Leg Extension","Calf Raises"]
}

let currentWorkout=null
let exerciseIndex=0
let set=1

function showScreen(name){
document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"))
document.getElementById("screen-"+name).classList.add("active")
}

function startWorkout(type){

currentWorkout=workouts[type]
exerciseIndex=0
set=1

document.getElementById("workout-selection").style.display="none"
document.getElementById("focus-mode").style.display="block"
document.getElementById("navbar").style.display="none"

renderExercise()

}

function renderExercise(){

document.getElementById("exercise-name").innerText=currentWorkout[exerciseIndex]
document.getElementById("set-info").innerText="Série "+set+" / 3"

let progress=((exerciseIndex+(set-1)/3)/currentWorkout.length)*100
document.getElementById("workout-progress").style.width=progress+"%"

let logs=JSON.parse(localStorage.getItem("ironquest_logs"))||[]
let last=logs.slice().reverse().find(l=>l.exercise===currentWorkout[exerciseIndex])

if(last){
document.getElementById("weight").value=last.weight
}else{
document.getElementById("weight").value=""
}
  let validLogs = logs.filter(l =>
    l.exercise === currentWorkout[exerciseIndex] &&
    l.reps >= 8 &&
    l.reps <= 12
)

if(validLogs.length){

    let pr = Math.max(...validLogs.map(l => Number(l.weight)))

    document.getElementById("exercise-pr").innerText = "PR: " + pr + "kg"

}else{

    document.getElementById("exercise-pr").innerText = ""

}

}

function markSet(){

let weight=document.getElementById("weight").value
let reps=document.getElementById("reps").value

let logs=JSON.parse(localStorage.getItem("ironquest_logs"))||[]

logs.push({
exercise:currentWorkout[exerciseIndex],
set:set,
weight:weight,
reps:reps,
date:new Date().toISOString()
})

localStorage.setItem("ironquest_logs",JSON.stringify(logs))

document.getElementById("weight").value=""
document.getElementById("reps").value=""

set++

if(set>3){
set=1
exerciseIndex++
}

if(exerciseIndex>=currentWorkout.length){
endWorkout()
return
}

renderExercise()

}

function nextExercise(){
if(exerciseIndex<currentWorkout.length-1){
exerciseIndex++
set=1
renderExercise()
}
}

function prevExercise(){
if(exerciseIndex>0){
exerciseIndex--
set=1
renderExercise()
}
}

function endWorkout(){

document.getElementById("focus-mode").style.display="none"
document.getElementById("workout-selection").style.display="block"
document.getElementById("navbar").style.display="flex"

window.scrollTo(0,0)

}
