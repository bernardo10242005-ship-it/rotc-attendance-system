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

// ======================================================
// DISPLAY ATTENDANCE TABLE
// ======================================================

function displayAttendance(records){

    const tbody =
    document.querySelector("#attendanceTable tbody");

    tbody.innerHTML = "";

    if(records.length===0){

        tbody.innerHTML=

        `
        <tr>

            <td colspan="5">

                No attendance records found.

            </td>

        </tr>
        `;

        return;

    }

    records.forEach(record=>{

        const row=document.createElement("tr");

        row.innerHTML=`

            <td>${record.studentNumber}</td>

            <td>${record.name}</td>

            <td>${record.course}</td>

            <td>${record.status}</td>

            <td>${record.time}</td>

        `;

        tbody.appendChild(row);

    });

}


// ======================================================
// SEARCH FUNCTION
// ======================================================

document
.getElementById("searchBox")
.addEventListener(

    "keyup",

    function(){

        const keyword=

        this.value

        .toLowerCase()

        .trim();

        const filtered=

        attendanceData.filter(record=>{

            return(

                record.studentNumber
                .toLowerCase()
                .includes(keyword)

                ||

                record.name
                .toLowerCase()
                .includes(keyword)

            );

        });

        displayAttendance(filtered);

    }

);

// ======================================================
// REFRESH ATTENDANCE
// ======================================================

function refreshAttendance(){

    loadAttendance();

}


// ======================================================
// BACK TO DASHBOARD
// ======================================================

function backToDashboard(){

    window.location.href =
    "flight-dashboard.html";

}


// ======================================================
// AUTO REFRESH EVERY 10 SECONDS
// ======================================================

setInterval(

    function(){

        loadAttendance();

    },

    10000

);


// ======================================================
// LOGOUT FLIGHT LEADER
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
