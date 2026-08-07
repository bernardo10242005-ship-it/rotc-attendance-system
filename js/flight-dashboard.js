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
// CLEAN FLIGHT NAME
// ======================================================

const flight =

leader.flight
.replace("FLIGHT ","")
.trim()
.toUpperCase();

// ======================================================
// DISPLAY FLIGHT
// ======================================================

document.getElementById("flightName").innerHTML =

"Flight " + flight;

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

        const response =
        await fetch(

            APPS_SCRIPT_URL +

            "?t=" +

            Date.now()

        );

        const settings =
        await response.json();

        console.log(settings);

        if(settings.trainingDay){

            document.getElementById("trainingDay").value =
            settings.trainingDay;

        }

        document.getElementById("trainingTopic").value =

        settings.trainingTopic ||

        settings.topic ||

        "";

        document.getElementById("attendanceWindow").value =

        settings.startTime +

        " - " +

        settings.endTime;

        loadFlightStatistics();

    }

    catch(error){

        console.error(error);

        alert("Unable to load training settings.");

    }

}

// ======================================================
// LOAD FLIGHT STATISTICS
// ======================================================

async function loadFlightStatistics(){

    try{

        const trainingDay =

        document.getElementById("trainingDay").value;

        const response =

        await fetch(

            APPS_SCRIPT_URL +

            "?action=getFlightStatistics" +

            "&trainingDay=" +

            encodeURIComponent(trainingDay) +

            "&flight=" +

            encodeURIComponent(flight)

        );

        const result =
        await response.json();

        console.log(result);

        if(result.success){

            document.getElementById("totalStrength").innerHTML =
            result.totalStrength;

            document.getElementById("totalPresent").innerHTML =
            result.totalPresent;

            document.getElementById("totalAbsent").innerHTML =
            result.totalAbsent;

        }

        else{

            alert(result.message);

        }

    }

    catch(error){

        console.error(error);

    }

}

// ======================================================
// TRAINING DAY CHANGED
// ======================================================

document
.getElementById("trainingDay")
.addEventListener(

    "change",

    function(){

        loadFlightStatistics();

    }

);

// ======================================================
// OPEN ATTENDANCE SPREADSHEET
// ======================================================

async function openAttendanceSpreadsheet(){

    try{

        const trainingDay =
        document.getElementById("trainingDay").value;

        const response =
        await fetch(

            APPS_SCRIPT_URL +

            "?action=getAttendanceSpreadsheet" +

            "&trainingDay=" +

            encodeURIComponent(trainingDay)

        );

        const result =
        await response.json();

        console.log(result);

        if(result.success){

            window.open(

                result.url,

                "_blank"

            );

        }

        else{

            alert(result.message);

        }

    }

    catch(error){

        console.error(error);

        alert("Unable to open spreadsheet.");

    }

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

    window.location.href =

    "index.html";

}
