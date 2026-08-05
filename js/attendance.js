// ===========================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE SYSTEM
// attendance.js
//
// CLEAN VERSION
// NO GPS
// NO CAMERA
// SIGNATURE ONLY
// ===========================================

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzmqVoMihTcRZkRLhwgmCWK9zSv1bgP6W2YL0aEUio2bX340vPCdpVQ6uJD3lGNq3J_4A/exec";

let student = null;
let settings = null;

let drawing = false;
let signed = false;

document.addEventListener("DOMContentLoaded", () => {

    student = JSON.parse(localStorage.getItem("student"));

    if (!student) {
        window.location.href = "login.html";
        return;
    }

    displayStudent();

    loadSettings();

    updateClock();

    setInterval(updateClock,1000);

    setupSignature();

});

function displayStudent(){

    document.getElementById("cadetName").textContent =
        student.name;

    document.getElementById("studentNumber").textContent =
        student.studentNumber;

    document.getElementById("flight").textContent =
        student.flight;

}

async function loadSettings(){

    try{

        const response =
        await fetch(APPS_SCRIPT_URL);

        settings =
        await response.json();

        console.log(settings);

    }

    catch(err){

        alert("Unable to load attendance settings.");

        console.error(err);

    }

}

function updateClock(){

    const now = new Date();

    document.getElementById("date").value =
    now.toLocaleDateString("en-PH");

    document.getElementById("time").value =
    now.toLocaleTimeString("en-PH");

}
