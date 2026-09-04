// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// STUDENT DASHBOARD
// VERSION 4
//
// ATTENDANCE STATUS:
// - Reads attendance directly from Google Sheets
// - Does NOT depend on localStorage for status
// - Checks Student Number + Training Day + Date
// - Refreshes every 30 seconds
// ======================================================


// ======================================================
// GOOGLE APPS SCRIPT WEB APP URL
// ======================================================

const API_URL =
"https://script.google.com/macros/s/AKfycbzrKmu79aGyyyVSjZuff9ZtNublgufjvzu6vc_UG0pWyIZCOM6ArqC7gHsFNIbjecvGRQ/exec";


// ======================================================
// LOAD STUDENT
// ======================================================

const student =
JSON.parse(
    localStorage.getItem("student")
);


if (!student) {

    window.location.href =
    "login.html";

}


// ======================================================
// DISPLAY STUDENT INFORMATION
// ======================================================

const studentName =
document.getElementById("studentName");

const studentID =
document.getElementById("studentID");

const course =
document.getElementById("course");

const year =
document.getElementById("year");

const flight =
document.getElementById("flight");

const studentType =
document.getElementById("studentType");

const merits =
document.getElementById("merits");

const demerits =
document.getElementById("demerits");


if (studentName) {

    studentName.textContent =
    student.name || "";

}


if (studentID) {

    studentID.textContent =
    student.studentNumber || "";

}


if (course) {

    course.textContent =
    student.course || "";

}


if (year) {

    year.textContent =
    student.year || "";

}


if (flight) {

    flight.textContent =
    student.flight || "";

}


if (studentType) {

    studentType.textContent =
    student.studentType ||
    "REGULAR";

}


if (merits) {

    merits.textContent =
    student.merits || "0";

}


if (demerits) {

    demerits.textContent =
    student.demerits || "0";

}


// ======================================================
// CLOCK
// ======================================================

function updateClock() {

    const now =
    new Date();


    const todayElement =
    document.getElementById("today");


    const clockElement =
    document.getElementById("clock");


    if (todayElement) {

        todayElement.textContent =
        now.toLocaleDateString(
            "en-PH",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    }


    if (clockElement) {

        clockElement.textContent =
        now.toLocaleTimeString(
            "en-PH"
        );

    }

}


updateClock();


setInterval(
    updateClock,
    1000
);


// ======================================================
// ATTENDANCE STATUS ELEMENT
// ======================================================

const statusElement =
document.getElementById("status");


// ======================================================
// SHOW ATTENDANCE STATUS
// ======================================================

function showAttendanceStatus(
    submitted
) {

    if (!statusElement) {

        return;

    }


    if (submitted) {

        statusElement.innerHTML =
        "✅ Attendance Already Submitted";

        statusElement.style.color =
        "lime";

    }

    else {

        statusElement.innerHTML =
        "Not Yet Submitted";

        statusElement.style.color =
        "orange";

    }

}


// ======================================================
// GET TODAY
//
// Must match Google Apps Script:
//
// MM/dd/yyyy
//
// ======================================================

function getTodayServerDate() {

    const now =
    new Date();


    const month =
    String(
        now.getMonth() + 1
    ).padStart(
        2,
        "0"
    );


    const day =
    String(
        now.getDate()
    ).padStart(
        2,
        "0"
    );


    const year =
    now.getFullYear();


    return (
        month +
        "/" +
        day +
        "/" +
        year
    );

}


// ======================================================
// NORMALIZE TRAINING DAY
// ======================================================

function normalizeTrainingDay(
    trainingDay
) {

    let value =
    String(
        trainingDay || ""
    ).trim();


    if (!value) {

        return "";

    }


    if (
        /^\d+$/.test(value)
    ) {

        value =
        "Training Day " +
        value;

    }


    else if (
        /^day\s+\d+$/i.test(value)
    ) {

        const number =
        value.match(/\d+/)[0];


        value =
        "Training Day " +
        number;

    }


    else if (
        /^training\s+day\s+\d+$/i.test(value)
    ) {

        const number =
        value.match(/\d+/)[0];


        value =
        "Training Day " +
        number;

    }


    return value;

}


// ======================================================
// GET CURRENT TRAINING DAY
// ======================================================

async function getCurrentTrainingDay() {

    const response =
    await fetch(

        API_URL +
        "?t=" +
        Date.now()

    );


    if (!response.ok) {

        throw new Error(
            "Could not connect to attendance server."
        );

    }


    const data =
    await response.json();


    if (
        data.success === false
    ) {

        throw new Error(

            data.message ||
            "Could not load attendance settings."

        );

    }


    return normalizeTrainingDay(
        data.trainingDay
    );

}


// ======================================================
// CHECK ATTENDANCE
// ======================================================

async function checkAttendanceStatus() {

    if (!statusElement) {

        return;

    }


    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    statusElement.innerHTML =
    "⏳ Checking Attendance...";

    statusElement.style.color =
    "white";


    try {

        // ==================================================
        // GET CURRENT TRAINING DAY
        // ==================================================

        const trainingDay =
        await getCurrentTrainingDay();


        if (!trainingDay) {

            throw new Error(
                "Training Day is not available."
            );

        }


        // ==================================================
        // STUDENT NUMBER
        // ==================================================

        const studentNumber =
        String(
            student.studentNumber || ""
        ).trim();


        if (!studentNumber) {

            throw new Error(
                "Student number is missing."
            );

        }


        // ==================================================
        // FLIGHT
        // ==================================================

        const studentFlight =
        String(
            student.flight || ""
        )
        .replace("FLIGHT ", "")
        .trim()
        .toUpperCase();


        if (!studentFlight) {

            throw new Error(
                "Student flight is missing."
            );

        }


        // ==================================================
        // REQUEST ATTENDANCE
        // ==================================================

        const attendanceURL =

        API_URL +

        "?action=getAttendance" +

        "&trainingDay=" +
        encodeURIComponent(
            trainingDay
        ) +

        "&flight=" +
        encodeURIComponent(
            studentFlight
        ) +

        "&t=" +
        Date.now();


        const response =
        await fetch(
            attendanceURL
        );


        if (!response.ok) {

            throw new Error(

                "Attendance server returned HTTP " +
                response.status

            );

        }


        const data =
        await response.json();


        if (
            data.success === false
        ) {

            throw new Error(

                data.message ||
                "Could not read attendance records."

            );

        }


        // ==================================================
        // ATTENDANCE RECORDS
        // ==================================================

        const records =
        Array.isArray(
            data.records
        )
        ?
        data.records
        :
        [];


        // ==================================================
        // TODAY
        // ==================================================

        const today =
        getTodayServerDate();


        // ==================================================
        // FIND STUDENT
        // ==================================================

        let alreadySubmitted =
        false;


        for (
            let i = 0;
            i < records.length;
            i++
        ) {

            const record =
            records[i];


            const recordStudentNumber =
            String(
                record.studentNumber || ""
            ).trim();


            const recordDate =
            String(
                record.date || ""
            ).trim();


            if (

                recordStudentNumber ===
                studentNumber

                &&

                recordDate ===
                today

            ) {

                alreadySubmitted =
                true;

                break;

            }

        }


        // ==================================================
        // DISPLAY STATUS
        // ==================================================

        showAttendanceStatus(
            alreadySubmitted
        );


        // ==================================================
        // LOG
        // ==================================================

        console.log(

            "ATTENDANCE STATUS:",

            {

                trainingDay:
                trainingDay,

                studentNumber:
                studentNumber,

                flight:
                studentFlight,

                today:
                today,

                submitted:
                alreadySubmitted

            }

        );

    }


    catch (error) {

        console.error(

            "ATTENDANCE STATUS ERROR:",

            error

        );


        // --------------------------------------------------
        // IMPORTANT:
        //
        // We DO NOT use localStorage as the final answer.
        //
        // If Google Sheets cannot be checked, tell the user
        // that the status could not be verified.
        // --------------------------------------------------

        statusElement.innerHTML =
        "⚠️ Unable to verify attendance";

        statusElement.style.color =
        "orange";

    }

}


// ======================================================
// START CHECK
// ======================================================

checkAttendanceStatus();


// ======================================================
// AUTOMATIC REFRESH
//
// Check Google Sheets every 30 seconds.
// ======================================================

setInterval(

    checkAttendanceStatus,

    30000

);


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    localStorage.removeItem(
        "student"
    );


    localStorage.removeItem(
        "attendanceRecord"
    );


    window.location.href =
    "index.html";

}
