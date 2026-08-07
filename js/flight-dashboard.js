// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// FLIGHT LEADER DASHBOARD V2
// ======================================================

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzmqVoMihTcRZkRLhwgmCWK9zSv1bgP6W2YL0aEUio2bX340vPCdpVQ6uJD3lGNq3J_4A/exec";

// ======================================================
// LOAD FLIGHT LEADER
// ======================================================

const leader =
JSON.parse(
localStorage.getItem("flightLeader")
);

if(!leader){

    window.location.href="flight-login.html";

}

// ======================================================
// DISPLAY FLIGHT
// ======================================================

document.getElementById("flightName").innerHTML=

"Flight Leader - " + leader.flight;


// ======================================================
// PAGE LOAD
// ======================================================

window.onload=function(){

    loadTrainingSettings();

};


// ======================================================
// LOAD TRAINING SETTINGS
// ======================================================

async function loadTrainingSettings(){

    try{

        const response=
        await fetch(

            APPS_SCRIPT_URL+

            "?t="+

            Date.now()

        );

        const settings=
        await response.json();

        console.log(settings);

        if(settings.trainingDay){

            document.getElementById("trainingDay").value=

            settings.trainingDay;

        }

        document.getElementById("trainingTopic").value=

        settings.trainingTopic ||

        settings.topic ||

        "";

        document.getElementById("attendanceWindow").value=

        settings.startTime+

        " - "+

        settings.endTime;

    }

    catch(error){

        console.error(error);

        alert("Unable to load training settings.");

    }

}


// ======================================================
// OPEN ATTENDANCE PAGE
// ======================================================

function openAttendanceSpreadsheet(){

    const trainingDay=

    document.getElementById("trainingDay").value;

    localStorage.setItem(

        "selectedTrainingDay",

        trainingDay

    );

    window.location.href=

    "flight-attendance.html";

}


// ======================================================
// REFRESH
// ======================================================

function refreshDashboard(){

    loadTrainingSettings();

}


// ======================================================
// LOGOUT
// ======================================================

function logoutFlightLeader(){

    localStorage.removeItem(

        "flightLeader"

    );

    localStorage.removeItem(

        "selectedTrainingDay"

    );

    window.location.href=

    "index.html";

}
