// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// STUDENT DASHBOARD
// VERSION 2
// ======================================================

// =============================
// Load Student
// =============================

const student =
JSON.parse(localStorage.getItem("student"));

if(!student){

    window.location.href="login.html";

}

// =============================
// Display Student Information
// =============================

document.getElementById("studentName").textContent =
student.name || "";

document.getElementById("studentID").textContent =
student.studentNumber || "";

document.getElementById("course").textContent =
student.course || "";

document.getElementById("year").textContent =
student.year || "";

document.getElementById("flight").textContent =
student.flight || "";

document.getElementById("studentType").textContent =
student.studentType || "REGULAR";

document.getElementById("merits").textContent =
student.merits || "0";

document.getElementById("demerits").textContent =
student.demerits || "0";


// =============================
// Clock
// =============================

function updateClock(){

    const now=new Date();

    document.getElementById("today").textContent=
    now.toLocaleDateString("en-PH",{

        weekday:"long",
        year:"numeric",
        month:"long",
        day:"numeric"

    });

    document.getElementById("clock").textContent=
    now.toLocaleTimeString("en-PH");

}

updateClock();

setInterval(updateClock,1000);


// =============================
// Attendance Status
// =============================

function checkAttendanceStatus(){

    const today=
    new Date().toLocaleDateString("en-PH");

    const attendance=
    JSON.parse(localStorage.getItem("attendanceRecord"));

    const statusElement=
    document.getElementById("status");

    if(

        attendance &&

        attendance.studentNumber===student.studentNumber &&

        attendance.date===today

    ){

        statusElement.innerHTML=
        "✅ Attendance Submitted";

        statusElement.style.color="lime";

    }

    else{

        statusElement.innerHTML=
        "Not Yet Submitted";

        statusElement.style.color="orange";

    }

}

checkAttendanceStatus();


// =============================
// Logout
// =============================

function logout(){

    localStorage.removeItem("student");

    window.location.href="index.html";

}
