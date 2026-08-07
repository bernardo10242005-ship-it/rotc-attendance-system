// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// attendance.js
//
// VERSION 2
// SIGNATURE ONLY
// NO GPS
// NO CAMERA
// ======================================================



// ======================================================
// GOOGLE APPS SCRIPT WEB APP
// ======================================================

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzmqVoMihTcRZkRLhwgmCWK9zSv1bgP6W2YL0aEUio2bX340vPCdpVQ6uJD3lGNq3J_4A/exec";



// ======================================================
// GLOBAL VARIABLES
// ======================================================

let student = null;

let settings = null;

let canvas = null;

let ctx = null;

let drawing = false;

let signed = false;



// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {

    //---------------------------------------------------
    // Check Login
    //---------------------------------------------------

    student = JSON.parse(localStorage.getItem("student"));

    console.log(student);

    if (!student) {

        window.location.href = "login.html";

        return;

    }

    //---------------------------------------------------
    // Display Student
    //---------------------------------------------------

    displayStudent();

    //---------------------------------------------------
    // Load Admin Settings
    //---------------------------------------------------

    await loadSettings();

    //---------------------------------------------------
    // Clock
    //---------------------------------------------------

    updateClock();

    setInterval(updateClock,1000);

    //---------------------------------------------------
    // Signature Pad
    //---------------------------------------------------

    setupSignature();

});



// ======================================================
// DISPLAY STUDENT INFORMATION
// ======================================================

function displayStudent(){

    document.getElementById("cadetName").textContent =
    student.name;

    document.getElementById("studentNumber").textContent =
    student.studentNumber;

    document.getElementById("flight").textContent =
    student.flight;

}



// ======================================================
// LOAD ADMIN SETTINGS
// ======================================================

async function loadSettings(){

    try{

        const response =
        await fetch(
            APPS_SCRIPT_URL + "?t=" + Date.now()
        );

        settings =
        await response.json();

        console.log("Attendance Settings");

        console.log(settings);

    }

    catch(error){

        console.error(error);

        alert("Unable to load attendance settings.");

    }

}



// ======================================================
// LIVE DATE & TIME
// ======================================================

function updateClock(){

    const now = new Date();

    document.getElementById("date").value =
    now.toLocaleDateString("en-PH");

    document.getElementById("time").value =
    now.toLocaleTimeString("en-PH");

}



// ======================================================
// SIGNATURE PAD
// ======================================================

function setupSignature(){

    canvas =
    document.getElementById("signature");

    ctx =
    canvas.getContext("2d");

    //---------------------------------------------------
    // White Background
    //---------------------------------------------------

    ctx.fillStyle = "white";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    //---------------------------------------------------
    // Pen Style
    //---------------------------------------------------

    ctx.strokeStyle = "black";

    ctx.lineWidth = 2;

    ctx.lineCap = "round";

    ctx.lineJoin = "round";



    //---------------------------------------------------
    // Mouse Events
    //---------------------------------------------------

    canvas.addEventListener(
        "mousedown",
        startDrawing
    );

    canvas.addEventListener(
        "mousemove",
        draw
    );

    canvas.addEventListener(
        "mouseup",
        stopDrawing
    );

    canvas.addEventListener(
        "mouseleave",
        stopDrawing
    );



    //---------------------------------------------------
    // Touch Events
    //---------------------------------------------------

    canvas.addEventListener(
        "touchstart",
        startDrawingTouch,
        {passive:false}
    );

    canvas.addEventListener(
        "touchmove",
        drawTouch,
        {passive:false}
    );

    canvas.addEventListener(
        "touchend",
        stopDrawing
    );

    
}


// ======================================================
// START DRAWING (MOUSE)
// ======================================================

function startDrawing(e){

    drawing = true;

    signed = true;

    ctx.beginPath();

    ctx.moveTo(e.offsetX, e.offsetY);

}



// ======================================================
// DRAW (MOUSE)
// ======================================================

function draw(e){

    if(!drawing) return;

    ctx.lineTo(e.offsetX, e.offsetY);

    ctx.stroke();

}



// ======================================================
// STOP DRAWING
// ======================================================

function stopDrawing(){

    drawing = false;

}



// ======================================================
// GET TOUCH POSITION
// ======================================================

function getTouchPosition(event){

    const rect = canvas.getBoundingClientRect();

    return {

        x:
        event.touches[0].clientX - rect.left,

        y:
        event.touches[0].clientY - rect.top

    };

}



// ======================================================
// START DRAWING (TOUCH)
// ======================================================

function startDrawingTouch(event){

    event.preventDefault();

    drawing = true;

    signed = true;

    const pos = getTouchPosition(event);

    ctx.beginPath();

    ctx.moveTo(pos.x, pos.y);

}



// ======================================================
// DRAW (TOUCH)
// ======================================================

function drawTouch(event){

    event.preventDefault();

    if(!drawing) return;

    const pos = getTouchPosition(event);

    ctx.lineTo(pos.x, pos.y);

    ctx.stroke();

}



// ======================================================
// CLEAR SIGNATURE
// ======================================================

function clearSignature(){

    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

    ctx.fillStyle = "white";

    ctx.fillRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

    ctx.strokeStyle = "black";

    ctx.lineWidth = 2;

    ctx.lineCap = "round";

    ctx.lineJoin = "round";

    signed = false;

}



// ======================================================
// CONVERT SIGNATURE TO PNG
// ======================================================

function getSignatureImage(){

    return canvas.toDataURL("image/png");

}



// ======================================================
// CHECK IF ATTENDANCE IS OPEN
// ======================================================

function attendanceOpen(){

    if(!settings){

        alert("Attendance settings not loaded.");

        return false;

    }

    if(settings.status !== "OPEN"){

        alert("Attendance is currently CLOSED.");

        return false;

    }

    return true;

}

// ======================================================
// SUBMIT ATTENDANCE
// ======================================================

async function submitAttendance(){

    //----------------------------------------------------
    // Attendance Open?
    //----------------------------------------------------

    if(!attendanceOpen()){

        return;

    }

    //----------------------------------------------------
    // Signature Required
    //----------------------------------------------------

    if(!signed){

        alert("Please provide your signature first.");

        return;

    }

    //----------------------------------------------------
    // Disable Button
    //----------------------------------------------------

    const submitButton = document.querySelector(
        "button.btn"
    );

    submitButton.disabled = true;

    submitButton.innerHTML =
    "Submitting Attendance...";

    //----------------------------------------------------
    // Attendance Data
    //----------------------------------------------------

    const attendanceData = {

        studentNumber:
        student.studentNumber,

        name:
        student.name,

        course:
        student.course,

        year:
        student.year,

        flight:
        student.flight,

        studentType:
        student.studentType,

        status:
        document.getElementById("status").value,

        trainingDay:
        settings.trainingDay,

        trainingTopic:
        settings.trainingTopic ||

        settings.topic ||

        "",

        signature:
        getSignatureImage(),

        signatureFileName:

        student.studentNumber +

        "_" +

        Date.now() +

        "_signature.png"

    };

    console.log(attendanceData);

    //----------------------------------------------------
    // Send To Apps Script
    //----------------------------------------------------

    try{

        const response =

        await fetch(

            APPS_SCRIPT_URL,

            {

                method:"POST",

                headers:{

                    "Content-Type":"text/plain;charset=utf-8"

                },

                body:

                JSON.stringify(attendanceData)

            }

        );

        const result =

        await response.json();

        console.log(result);

        //------------------------------------------------
        // Success
        //------------------------------------------------

        if(result.success){

            localStorage.setItem(

                "attendanceSubmitted",

                "true"

            );

            alert(

                "Attendance submitted successfully."

            );

            window.location.href =

            "dashboard.html";

            return;

        }

        //------------------------------------------------
        // Duplicate
        //------------------------------------------------

        if(result.code ===

            "ALREADY_SUBMITTED"

        ){

            alert(result.message);

            window.location.href =

            "dashboard.html";

            return;

        }

        //------------------------------------------------
        // Other Error
        //------------------------------------------------

        alert(

            result.message ||

            "Attendance submission failed."

        );

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to connect to the attendance server."

        );

    }

    finally{

        submitButton.disabled = false;

        submitButton.innerHTML =

        "✅ SUBMIT ATTENDANCE";

    }

}


