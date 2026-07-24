// ======================================================
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// STUDENT DASHBOARD
// ======================================================


// ======================================================
// GET STUDENT DATA FROM LOCAL STORAGE
// ======================================================

const studentJSON =
    localStorage.getItem(
        "student"
    );


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

    studentNameElement.textContent =
        student.name ||
        "";

}


// ======================================================
// DISPLAY STUDENT NUMBER
// ======================================================

const studentIDElement =
    document.getElementById(
        "studentID"
    );


if (studentIDElement) {

    studentIDElement.textContent =
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

    courseElement.textContent =
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

    yearElement.textContent =
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

    flightElement.textContent =
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

    studentTypeElement.textContent =
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

    meritsElement.textContent =
        student.merits !== undefined &&
        student.merits !== null &&
        student.merits !== ""
            ? student.merits
            : "0";

}


// ======================================================
// DISPLAY DEMERITS
// ======================================================

const demeritsElement =
    document.getElementById(
        "demerits"
    );


if (demeritsElement) {

    demeritsElement.textContent =
        student.demerits !== undefined &&
        student.demerits !== null &&
        student.demerits !== ""
            ? student.demerits
            : "0";

}


// ======================================================
// DEBUG INFORMATION
// ======================================================

console.log(
    "Logged-in Student:",
    student
);


console.log(
    "Student Merits:",
    student.merits
);


console.log(
    "Student Demerits:",
    student.demerits
);


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

        todayElement.textContent =
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

        clockElement.textContent =
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


    // Return to login/home page

    window.location.href =
        "index.html";

}
