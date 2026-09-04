// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// STUDENT DASHBOARD
//
// VERSION 4
//
// Attendance verification is handled directly by
// Google Apps Script using:
//
// Student Number
// + Training Day
// + Server Date
//
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
    state
) {

    if (!statusElement) {

        return;

    }


    // ==================================================
    // SUBMITTED
    // ==================================================

    if (
        state === "submitted"
    ) {

        statusElement.innerHTML =
        "✅ Attendance Already Submitted";

        statusElement.style.color =
        "lime";

        return;

    }


    // ==================================================
    // NOT SUBMITTED
    // ==================================================

    if (
        state === "not_submitted"
    ) {

        statusElement.innerHTML =
        "Not Yet Submitted";

        statusElement.style.color =
        "orange";

        return;

    }


    // ==================================================
    // CHECKING
    // ==================================================

    if (
        state === "checking"
    ) {

        statusElement.innerHTML =
        "⏳ Checking Attendance...";

        statusElement.style.color =
        "white";

        return;

    }


    // ==================================================
    // ERROR
    // ==================================================

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


    // 1 → Training Day 1

    if (
        /^\d+$/.test(value)
    ) {

        value =
        "Training Day " +
        value;

    }


    // Day 1 → Training Day 1

    else if (
        /^day\s+\d+$/i.test(value)
    ) {

        const number =
        value.match(/\d+/)[0];


        value =
        "Training Day " +
        number;

    }


    // training day 1
    // → Training Day 1

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

        return;

    }


    showAttendanceStatus(
        "checking"
    );


    try {

        // ==================================================
        // GET TRAINING DAY
        // ==================================================

        const trainingDay =
        await getCurrentTrainingDay();


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
        .replace("FLIGHT ", "")
        .trim()
        .toUpperCase();


        if (!studentFlight) {

            throw new Error(
                "Student flight is missing."
            );

        }


        // ==================================================
        // CREATE VERIFICATION URL
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


        // ==================================================
        // REQUEST SERVER VERIFICATION
        // ==================================================

        const response =
        await fetch(
            verificationURL,
            {
                method: "GET",
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Attendance server returned HTTP " +
                response.status
            );

        }


        const data =
        await response.json();


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
            data.alreadySubmitted === true
        ) {

            showAttendanceStatus(
                "submitted"
            );


            // Save local copy as convenience only.

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
                    data.date,

                    submitted:
                    true

                })

            );


            console.log(
                "Attendance VERIFIED:",
                data
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
            "Attendance NOT YET SUBMITTED:",
            data
        );

    }


    catch (error) {

        console.error(
            "ATTENDANCE VERIFICATION ERROR:",
            error
        );


        // ==================================================
        // LOCAL FALLBACK
        // ==================================================

        const attendance =
        JSON.parse(
            localStorage.getItem(
                "attendanceRecord"
            )
        );


        const studentNumber =
        String(
            student.studentNumber || ""
        ).trim();


        if (

            attendance &&

            String(
                attendance.studentNumber || ""
            ).trim() ===
            studentNumber &&

            attendance.submitted === true

        ) {

            showAttendanceStatus(
                "submitted"
            );

        }

        else {

            showAttendanceStatus(
                "error"
            );

        }

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


    window.location.href =
    "index.html";

}
