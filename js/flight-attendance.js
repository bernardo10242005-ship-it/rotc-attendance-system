// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// FLIGHT ATTENDANCE
// PART 1
// ======================================================

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzmqVoMihTcRZkRLhwgmCWK9zSv1bgP6W2YL0aEUio2bX340vPCdpVQ6uJD3lGNq3J_4A/exec";

const leader =
JSON.parse(localStorage.getItem("flightLeader"));

const trainingDay =
localStorage.getItem("selectedTrainingDay");

if(!leader){

    window.location.href="flight-login.html";

}

document.getElementById("flightTitle").innerHTML =
leader.flight;

document.getElementById("trainingDayTitle").innerHTML =
trainingDay;

let attendanceData = [];

window.onload=function(){

    loadAttendance();

};

async function loadAttendance(){

    try{

        const response =
        await fetch(

            APPS_SCRIPT_URL +

            "?action=getAttendance" +

            "&flight=" +

            encodeURIComponent(leader.flight) +

            "&trainingDay=" +

            encodeURIComponent(trainingDay)

        );

        const result =
        await response.json();

        console.log(result);

        if(result.success){

            attendanceData =
            result.records;

            displayAttendance(attendanceData);

        }

        else{

            alert(result.message);

        }

    }

    catch(error){

        console.error(error);

        alert("Unable to load attendance.");

    }

}
