// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// dashboard.js
//
// FIXED ATTENDANCE VERIFICATION
//
// Verification is done by Google Apps Script using:
// Student Number
// + Training Day
// + Flight
// + Server Date
//
// IMPORTANT:
// Google Sheets is the official source of attendance.
// localStorage is NOT used to falsely show attendance.
// ======================================================


// ======================================================
// GOOGLE APPS SCRIPT WEB APP URL
// ======================================================

const API_URL =
"https://script.google.com/macros/s/AKfycbzrKmu79aGyyyVSjZuff9ZtNublgufjvzu6vc_UG0pWyIZCOM6ArqC7gHsFNIbjecvGRQ/exec";


// ======================================================
// LOAD STUDENT
// ======================================================

let student = null;

try {

    student =
    JSON.parse(
        localStorage.getItem("student")
    );

}
catch (error) {

    console.error(
        "Could not read student data:",
        error
    );

}


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
    state
) {

    if (!statusElement) {

        return;

    }


    if (
        state === "submitted"
    ) {

        statusElement.innerHTML =
        "✅ Attendance Already Submitted";

        statusElement.style.color =
        "lime";

        return;

    }


    if (
        state === "not_submitted"
    ) {

        statusElement.innerHTML =
        "Not Yet Submitted";

        statusElement.style.color =
        "orange";

        return;

    }


    if (
        state === "checking"
    ) {

        statusElement.innerHTML =
        "⏳ Checking Attendance...";

        statusElement.style.color =
        "white";

        return;

    }


    if (
        state === "error"
    ) {

        statusElement.innerHTML =
        "⚠️ Unable to verify attendance";

        statusElement.style.color =
        "orange";

        return;

    }

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


    // -----------------------------------------------
    // 1 → Training Day 1
    // -----------------------------------------------

    if (
        /^\d+$/.test(value)
    ) {

        value =
        "Training Day " +
        value;

    }


    // -----------------------------------------------
    // Day 1 → Training Day 1
    // -----------------------------------------------

    else if (
        /^day\s+\d+$/i.test(value)
    ) {

        const number =
        value.match(/\d+/)[0];


        value =
        "Training Day " +
        number;

    }


    // -----------------------------------------------
    // training day 1
    // → Training Day 1
    // -----------------------------------------------

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

    const url =
    API_URL +
    "?t=" +
    Date.now();


    console.log(
        "Loading settings from:",
        url
    );


    const response =
    await fetch(
        url,
        {
            method: "GET",
            cache: "no-store"
        }
    );


    if (!response.ok) {

        throw new Error(
            "Settings server returned HTTP " +
            response.status
        );

    }


    const data =
    await response.json();


    console.log(
        "Settings response:",
        data
    );


    if (
        data.success === false
    ) {

        throw new Error(
            data.message ||
            "Could not load attendance settings."
        );

    }


    const trainingDay =
    normalizeTrainingDay(
        data.trainingDay
    );


    if (!trainingDay) {

        throw new Error(
            "Training Day is not available."
        );

    }


    return trainingDay;

}


// ======================================================
// CHECK ATTENDANCE DIRECTLY FROM GOOGLE SHEETS
// ======================================================

async function checkAttendanceStatus() {

    if (!statusElement) {

        console.warn(
            "Attendance status element not found."
        );

        return;

    }


    showAttendanceStatus(
        "checking"
    );


    try {

        // ==================================================
        // GET CURRENT TRAINING DAY
        // ==================================================

        const trainingDay =
        await getCurrentTrainingDay();


        console.log(
            "Current Training Day:",
            trainingDay
        );


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
        // STUDENT FLIGHT
        // ==================================================

        const studentFlight =
        String(
            student.flight || ""
        )
        .replace(
            /^FLIGHT\s+/i,
            ""
        )
        .trim()
        .toUpperCase();


        if (!studentFlight) {

            throw new Error(
                "Student flight is missing."
            );

        }


        // ==================================================
        // BUILD VERIFICATION URL
        // ==================================================

        const verificationURL =
        API_URL +
        "?action=checkStudentAttendance" +
        "&trainingDay=" +
        encodeURIComponent(
            trainingDay
        ) +
        "&flight=" +
        encodeURIComponent(
            studentFlight
        ) +
        "&studentNumber=" +
        encodeURIComponent(
            studentNumber
        ) +
        "&t=" +
        Date.now();


        console.log(
            "Verification URL:",
            verificationURL
        );


        // ==================================================
        // SEND REQUEST
        // ==================================================

        const response =
        await fetch(
            verificationURL,
            {
                method: "GET",
                cache: "no-store"
            }
        );


        console.log(
            "Verification HTTP status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "Attendance server returned HTTP " +
                response.status
            );

        }


        // ==================================================
        // READ JSON
        // ==================================================

        const data =
        await response.json();


        console.log(
            "Attendance verification response:",
            data
        );


        // ==================================================
        // SERVER ERROR
        // ==================================================

        if (
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Attendance verification failed."
            );

        }


        // ==================================================
        // ATTENDANCE FOUND
        // ==================================================

        if (
            data.verified === true ||
            data.alreadySubmitted === true
        ) {

            showAttendanceStatus(
                "submitted"
            );


            // ---------------------------------------------
            // Save convenience copy
            // ---------------------------------------------

            localStorage.setItem(

                "attendanceRecord",

                JSON.stringify({

                    studentNumber:
                    studentNumber,

                    trainingDay:
                    trainingDay,

                    flight:
                    studentFlight,

                    date:
                    data.date || "",

                    time:
                    data.time || "",

                    status:
                    data.status || "",

                    submitted:
                    true

                })

            );


            console.log(
                "ATTENDANCE VERIFIED SUCCESSFULLY"
            );


            return;

        }


        // ==================================================
        // ATTENDANCE NOT FOUND
        // ==================================================

        showAttendanceStatus(
            "not_submitted"
        );


        console.log(
            "Attendance has NOT been submitted."
        );


        // Remove stale local record.
        //
        // This is important because Google Sheets
        // is the official source.

        localStorage.removeItem(
            "attendanceRecord"
        );

    }


    catch (error) {

        console.error(
            "ATTENDANCE VERIFICATION ERROR:",
            error
        );


        // ==================================================
        // IMPORTANT
        // ==================================================
        //
        // Do NOT automatically display "Submitted"
        // from localStorage.
        //
        // Google Sheets is the official checker.
        //
        // If the server cannot be reached, show the
        // verification error instead.
        //
        // ==================================================

        showAttendanceStatus(
            "error"
        );

    }

}


// ======================================================
// START ATTENDANCE CHECK
// ======================================================

checkAttendanceStatus();


// ======================================================
// AUTOMATIC REFRESH
//
// Re-check every 30 seconds.
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


    localStorage.removeItem(
        "attendanceSubmitted"
    );


    window.location.href =
    "index.html";

}
