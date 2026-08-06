// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// FLIGHT LEADER ATTENDANCE
// CLEAN VERSION
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

if(!trainingDay){

    window.location.href="flight-dashboard.html";

}

document.getElementById("flightTitle").innerHTML =
leader.flight;

document.getElementById("trainingDayTitle").innerHTML =
trainingDay;

const attendanceBody =
document.querySelector("#attendanceTable tbody");

const searchBox =
document.getElementById("searchBox");

let attendanceRecords = [];

window.onload=function(){

    loadAttendance();

};

async function loadAttendance(){

    attendanceBody.innerHTML =

    `
    <tr>

        <td colspan="8">

            Loading attendance...

        </td>

    </tr>
    `;

    try{

        const response =
        await fetch(

            APPS_SCRIPT_URL +

            "?action=getAttendance" +

            "&trainingDay=" +

            encodeURIComponent(trainingDay) +

            "&flight=" +

            encodeURIComponent(leader.flight)

        );

        const result =
        await response.json();

        console.log(result);

        if(!result.success){

            attendanceBody.innerHTML=

            `
            <tr>

                <td colspan="8">

                    No attendance records found.

                </td>

            </tr>
            `;

            return;

        }

        attendanceRecords = result.records;

        displayAttendance(attendanceRecords);

    }

    catch(error){

        console.error(error);

        attendanceBody.innerHTML=

        `
        <tr>

            <td colspan="8">

                Unable to load attendance.

            </td>

        </tr>
        `;

    }

}

// ======================================================
// DISPLAY ATTENDANCE TABLE
// ======================================================

function displayAttendance(records){

    attendanceBody.innerHTML = "";

    if(records.length===0){

        attendanceBody.innerHTML =

        `
        <tr>

            <td colspan="8">

                No attendance records found.

            </td>

        </tr>
        `;

        return;

    }

    records.forEach(record=>{

        const row =
        document.createElement("tr");

        row.innerHTML =

        `
        <td>${record.studentNumber}</td>

        <td>${record.name}</td>

        <td>${record.course}</td>

        <td>${record.date}</td>

        <td>${record.time}</td>

        <td>${record.status}</td>

        <td>

        ${
            record.signature

            ?

            `<a href="${record.signature}" target="_blank">
            View Signature
            </a>`

            :

            "No Signature"

        }

        </td>

        <td>

        <button
        class="btn"
        onclick="deleteAttendance('${record.studentNumber}')">

        DELETE

        </button>

        </td>
        `;

        attendanceBody.appendChild(row);

    });

}


// ======================================================
// SEARCH STUDENT
// ======================================================

searchBox.addEventListener(

    "keyup",

    function(){

        const keyword =

        this.value
        .toLowerCase()
        .trim();

        const filtered =

        attendanceRecords.filter(record=>{

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
// REFRESH BUTTON
// ======================================================

function refreshAttendance(){

    loadAttendance();

}

// ======================================================
// DELETE ATTENDANCE
// ======================================================

async function deleteAttendance(studentNumber){

    const confirmDelete = confirm(

        "Are you sure you want to delete this attendance record?"

    );

    if(!confirmDelete){

        return;

    }

    try{

        const response = await fetch(

            APPS_SCRIPT_URL,

            {

                method:"POST",

                headers:{

                    "Content-Type":"text/plain;charset=utf-8"

                },

                body:JSON.stringify({

                    action:"deleteAttendance",

                    trainingDay:trainingDay,

                    flight:leader.flight,

                    studentNumber:studentNumber

                })

            }

        );

        const result = await response.json();

        alert(result.message);

        loadAttendance();

    }

    catch(error){

        console.error(error);

        alert("Unable to delete attendance.");

    }

}


// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(function(){

    loadAttendance();

},10000);


// ======================================================
// LOGOUT
// ======================================================

function logoutFlightLeader(){

    localStorage.removeItem("flightLeader");

    localStorage.removeItem("selectedTrainingDay");

    window.location.href="index.html";

}
