// ======================================================
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// STUDENT DASHBOARD
// ======================================================


// ======================================================
// GET STUDENT DATA FROM LOCAL STORAGE
// ======================================================

const studentJSON =
    localStorage.getItem("student");


// ======================================================
// CHECK IF STUDENT IS LOGGED IN
// ======================================================

if (!studentJSON) {

    window.location.href =
        "login.html";

}


// ======================================================
// CONVERT JSON INTO STUDENT OBJECT
// ======================================================

const student =
    JSON.parse(
        studentJSON
    );


// ======================================================
// DISPLAY STUDENT NAME
// ======================================================

const studentNameElement =
    document.getElementById(
        "studentName"
    );

if (studentNameElement) {

    studentNameElement.innerHTML =
        student.name ||
        "";

}


// ======================================================
// DISPLAY STUDENT NUMBER
//
// IMPORTANT:
// Google Apps Script returns:
// student.studentNumber
//
// NOT:
// student.id
// ======================================================

const studentIDElement =
    document.getElementById(
        "studentID"
    );

if (studentIDElement) {

    studentIDElement.innerHTML =
        student.studentNumber ||
        "";

}


// ======================================================
// DISPLAY COURSE
// ======================================================

const courseElement =
    document.getElementById(
        "course"
    );

if (courseElement) {

    courseElement.innerHTML =
        student.course ||
        "";

}


// ======================================================
// DISPLAY YEAR LEVEL
// ======================================================

const yearElement =
    document.getElementById(
        "year"
    );

if (yearElement) {

    yearElement.innerHTML =
        student.year ||
        "";

}


// ======================================================
// DISPLAY FLIGHT
// ======================================================

const flightElement =
    document.getElementById(
        "flight"
    );

if (flightElement) {

    flightElement.innerHTML =
        student.flight ||
        "";

}


// ======================================================
// DISPLAY STUDENT TYPE
// ======================================================

const studentTypeElement =
    document.getElementById(
        "studentType"
    );

if (studentTypeElement) {

    studentTypeElement.innerHTML =
        student.studentType ||
        "";

}


// ======================================================
// DISPLAY MERITS
// ======================================================

const meritsElement =
    document.getElementById(
        "merits"
    );

if (meritsElement) {

    meritsElement.innerHTML =
        student.merits ||
        "0";

}


// ======================================================
// DISPLAY DEMERITS
// ======================================================

const demeritsElement =
    document.getElementById(
        "demerits"
    );

if (demeritsElement) {

    demeritsElement.innerHTML =
        student.demerits ||
        "0";

}


// ======================================================
// DISPLAY CURRENT DATE AND TIME
// ======================================================

function updateClock() {

    const now =
        new Date();


    // ==================================================
    // CURRENT DATE
    // ==================================================

    const todayElement =
        document.getElementById(
            "today"
        );


    if (todayElement) {

        todayElement.innerHTML =
            now.toLocaleDateString(

                "en-PH",

                {

                    weekday:
                        "long",

                    year:
                        "numeric",

                    month:
                        "long",

                    day:
                        "numeric"

                }

            );

    }


    // ==================================================
    // CURRENT TIME
    // ==================================================

    const clockElement =
        document.getElementById(
            "clock"
        );


    if (clockElement) {

        clockElement.innerHTML =
            now.toLocaleTimeString(
                "en-PH"
            );

    }

}


// ======================================================
// START CLOCK
// ======================================================

updateClock();

setInterval(
    updateClock,
    1000
);


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    // Remove student information

    localStorage.removeItem(
        "student"
    );


    // Return to home page

    window.location.href =
        "index.html";

}
