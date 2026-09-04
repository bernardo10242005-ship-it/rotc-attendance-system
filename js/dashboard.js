// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// STUDENT DASHBOARD
// VERSION 3
//
// ATTENDANCE STATUS NOW CHECKS GOOGLE SHEETS
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
// SHOW STATUS
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
// FORMAT DATE
//
// IMPORTANT:
// Google Apps Script stores the date as:
//
// MM/dd/yyyy
//
// Example:
//
// 09/04/2026
//
// This function creates the same format.
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


    // Example:
    // "1"
    // becomes
    // "Training Day 1"

    if (
        /^\d+$/.test(value)
    ) {

        value =
        "Training Day " +
        value;

    }


    // Example:
    // "Day 4"
    // becomes
    // "Training Day 4"

    else if (
        /^day\s+\d+$/i.test(value)
    ) {

        const number =
        value.match(/\d+/)[0];


        value =
        "Training Day " +
        number;

    }


    // Example:
    // "training day 4"
    // becomes
    // "Training Day 4"

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
// LOAD CURRENT SETTINGS
//
// This gets the current Training Day from Apps Script.
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
// CHECK GOOGLE SHEETS ATTENDANCE
// ======================================================

async function checkAttendanceStatus() {

    if (!statusElement) {

        return;

    }


    // --------------------------------------------------
    // TEMPORARY LOADING MESSAGE
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
        // GET STUDENT FLIGHT
        // ==================================================

        const studentFlight =
        String(
            student.flight || ""
        ).trim();


        if (!studentFlight) {

            throw new Error(
                "Student flight is missing."
            );

        }


        // ==================================================
        // GET STUDENT NUMBER
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
        // REQUEST ATTENDANCE FROM GOOGLE SHEETS
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


        // ==================================================
        // CHECK SERVER RESPONSE
        // ==================================================

        if (
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Could not read attendance records."
            );

        }


        const records =
        Array.isArray(
            data.records
        )
        ?
        data.records
        :
        [];


        // ==================================================
        // TODAY'S SERVER DATE
        // ==================================================

        const today =
        getTodayServerDate();


        // ==================================================
        // SEARCH FOR STUDENT ATTENDANCE
        //
        // Must match:
        //
        // Student Number
        // +
        // Today's Date
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
        // DISPLAY FINAL STATUS
        // ==================================================

        showAttendanceStatus(
            alreadySubmitted
        );


        // ==================================================
        // SAVE LOCAL COPY TOO
        //
        // This is only a convenience.
        // Google Sheets remains the source of truth.
        // ==================================================

        if (
            alreadySubmitted
        ) {

            localStorage.setItem(
                "attendanceRecord",
                JSON.stringify({

                    studentNumber:
                    studentNumber,

                    date:
                    today,

                    trainingDay:
                    trainingDay,

                    submitted:
                    true

                })
            );

        }


        console.log(
            "Attendance check completed.",
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
        // FALLBACK TO LOCAL STORAGE
        //
        // If the server temporarily cannot be reached,
        // we use the previous local record.
        // --------------------------------------------------

        const attendance =
        JSON.parse(
            localStorage.getItem(
                "attendanceRecord"
            )
        );


        const today =
        getTodayServerDate();


        if (

            attendance &&

            String(
                attendance.studentNumber || ""
            ).trim() ===
            String(
                student.studentNumber || ""
            ).trim()

            &&

            String(
                attendance.date || ""
            ).trim() ===
            today

        ) {

            showAttendanceStatus(
                true
            );

        }

        else {

            showAttendanceStatus(
                false
            );

        }


        console.error(
            "Using local attendance fallback."
        );

    }

}


// ======================================================
// START ATTENDANCE STATUS CHECK
// ======================================================

checkAttendanceStatus();


// ======================================================
// OPTIONAL REFRESH
//
// Re-check every 30 seconds so the dashboard can update
// if attendance was submitted from another browser/device.
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
