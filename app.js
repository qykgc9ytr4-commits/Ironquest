let workouts = {
    push: ["Chest Press","Shoulder Press","Lateral Raises","Triceps Pushdown","Plank"],
    pull: ["Lat Pulldown","Seated Row","Reverse Pec Deck","Biceps Curl","Hammer Curl"],
    legs: ["Leg Press","Bulgarian Split Squat","Leg Curl","Leg Extension","Calf Raises"]
}

let currentWorkout = null
let exerciseIndex = 0
let set = 1

function showScreen(name){
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"))
    document.getElementById("screen-"+name).classList.add("active")
}

function startWorkout(type){

    currentWorkout = workouts[type]
    exerciseIndex = 0
    set = 1

    document.getElementById("focus-mode").style.display = "block"

    renderExercise()

}

function renderExercise(){

    document.getElementById("exercise-name").innerText = currentWorkout[exerciseIndex]
    document.getElementById("set-info").innerText = "Série "+set+" / 3"

}

function markSet(){

    set++

    if(set > 3){
        set = 1
        exerciseIndex++
    }

    if(exerciseIndex >= currentWorkout.length){
        alert("Treino completo 💪")
        return
    }

    renderExercise()

}

function nextExercise(){

    if(exerciseIndex < currentWorkout.length -1){
        exerciseIndex++
        set = 1
        renderExercise()
    }

}

function prevExercise(){

    if(exerciseIndex > 0){
        exerciseIndex--
        set = 1
        renderExercise()
    }

}

function endWorkout(){

    document.getElementById("focus-mode").style.display = "none"
    alert("Treino terminado")

}
