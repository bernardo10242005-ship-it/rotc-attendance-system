// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// FLIGHT LEADER DASHBOARD
// ======================================================

// Load logged in Flight Leader
const leader =
JSON.parse(
localStorage.getItem("flightLeader")
);

// If not logged in
if(!leader){

    window.location.href="flight-login.html";

}

// Display Flight Name
document.getElementById("flightName").innerHTML=

leader.flight;

// ======================================================
// VIEW ATTENDANCE
// ======================================================

function openAttendance(){

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
