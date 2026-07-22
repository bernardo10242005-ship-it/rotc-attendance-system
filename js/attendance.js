// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// attendance.js
// ======================================================

// ======================================================
// GOOGLE APPS SCRIPT URLS
// ======================================================

// GET SETTINGS URL
const SETTINGS_API =
"https://script.google.com/macros/s/AKfycbzrKmu79aGyyyVSjZuff9ZtNublgufjvzu6vc_UG0pWyIZCOM6ArqC7gHsFNIbjecvGRQ/exec";

// POST ATTENDANCE URL
const ATTENDANCE_API =
"https://script.google.com/macros/s/AKfycbwYYNTlVOqDT7F8QeAZrAJE1AR29NnNJvOZCak8S1FgJKoedQI3vwIv9TULBu8oy0FPzg/exec";


// ======================================================
// GET LOGGED IN STUDENT
// ======================================================

const student =
JSON.parse(localStorage.getItem("student"));

if (!student) {

    window.location.href = "login.html";

    throw new Error("No logged-in student.");

}


// ======================================================
// DISPLAY STUDENT INFORMATION
// ======================================================

document.getElementById("cadetName").textContent =
student.name;

document.getElementById("studentNumber").textContent =
"Student Number: " + student.id;

document.getElementById("flight").textContent =
"Flight: " + student.flight;


// ======================================================
// SETTINGS VARIABLES
// ======================================================

let settings = null;

let TRAINING_LAT = 0;

let TRAINING_LNG = 0;

let ALLOWED_RADIUS = 200;


// ======================================================
// GPS VARIABLES
// ======================================================

let latitude = null;

let longitude = null;

let distanceMeters = 999999;


// ======================================================
// LOAD SETTINGS
// ======================================================

async function loadSettings() {

    const loadingMessage =
    document.getElementById("settingsStatus");

    try {

        if (loadingMessage) {

            loadingMessage.textContent =
            "⏳ Loading attendance settings...";

        }


        console.log("Loading settings from Google Apps Script...");


        const response =
        await fetch(
            SETTINGS_API + "?t=" + Date.now(),
            {
                method: "GET",
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                "HTTP Error: " + response.status
            );

        }


        const data =
        await response.json();


        console.log(
            "Google Apps Script settings:",
            data
        );


        // Check required settings

        if (
            !data ||
            !data.latitude ||
            !data.longitude ||
            !data.radius ||
            !data.status
        ) {

            throw new Error(
                "Incomplete attendance settings received."
            );

        }


        // Save settings

        settings = data;


        TRAINING_LAT =
        parseFloat(data.latitude);


        TRAINING_LNG =
        parseFloat(data.longitude);


        ALLOWED_RADIUS =
        parseFloat(data.radius) || 200;


        console.log(
            "Settings successfully loaded."
        );


        console.log(
            "Training Latitude:",
            TRAINING_LAT
        );


        console.log(
            "Training Longitude:",
            TRAINING_LNG
        );


        console.log(
            "Allowed Radius:",
            ALLOWED_RADIUS
        );


        if (loadingMessage) {

            loadingMessage.textContent =
            "🟢 Attendance settings loaded.";

        }


        // Start GPS only AFTER settings are loaded

        startGPS();


    } catch (error) {

        console.error(
            "SETTINGS ERROR:",
            error
        );


        if (loadingMessage) {

            loadingMessage.textContent =
            "🔴 Unable to load attendance settings.";

        }


        alert(
            "❌ Unable to load attendance settings.\n\n" +
            "Please contact the administrator."
        );

    }

}


// ======================================================
// START GPS
// ======================================================

function startGPS() {


    if (!navigator.geolocation) {

        document.getElementById(
            "gpsStatus"
        ).textContent =
        "🔴 GPS NOT SUPPORTED";

        return;

    }


    navigator.geolocation.getCurrentPosition(

        function(position) {


            latitude =
            position.coords.latitude;


            longitude =
            position.coords.longitude;


            document.getElementById(
                "gpsStatus"
            ).textContent =
            "🟢 GPS VERIFIED";


            document.getElementById(
                "latitude"
            ).textContent =
            latitude.toFixed(6);


            document.getElementById(
                "longitude"
            ).textContent =
            longitude.toFixed(6);


            // Get address

            getAddress(
                latitude,
                longitude
            );


            // Calculate distance

            distanceMeters =
            calculateDistance(

                latitude,

                longitude,

                TRAINING_LAT,

                TRAINING_LNG

            );


            document.getElementById(
                "distance"
            ).textContent =

            distanceMeters.toFixed(1)
            + " meters";


            // Check allowed radius

            if (
                distanceMeters <=
                ALLOWED_RADIUS
            ) {


                document.getElementById(
                    "validationStatus"
                ).innerHTML =

                "✅ Inside Allowed Area";


            } else {


                document.getElementById(
                    "validationStatus"
                ).innerHTML =

                "❌ Outside " +
                ALLOWED_RADIUS +
                " Meter Radius";


            }

        },


        function(error) {


            console.error(
                "GPS ERROR:",
                error
            );


            document.getElementById(
                "gpsStatus"
            ).textContent =
            "🔴 GPS NOT AVAILABLE";


        },


        {
            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

        }

    );

}


// ======================================================
// DISTANCE FORMULA
// ======================================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {


    const R = 6371000;


    const dLat =
    (lat2 - lat1) *
    Math.PI / 180;


    const dLon =
    (lon2 - lon1) *
    Math.PI / 180;


    const a =

    Math.sin(dLat / 2) *
    Math.sin(dLat / 2) +

    Math.cos(
        lat1 * Math.PI / 180
    ) *

    Math.cos(
        lat2 * Math.PI / 180
    ) *

    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);


    const c =
    2 *

    Math.atan2(

        Math.sqrt(a),

        Math.sqrt(1 - a)

    );


    return R * c;

}


// ======================================================
// GET ADDRESS
// ======================================================

async function getAddress(
    lat,
    lng
) {


    try {


        const url =

        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;


        const response =
        await fetch(url);


        const data =
        await response.json();


        document.getElementById(
            "address"
        ).textContent =

        data.display_name ||
        "Address unavailable.";


    } catch (error) {


        console.error(
            "ADDRESS ERROR:",
            error
        );


        document.getElementById(
            "address"
        ).textContent =

        "Unable to determine address.";


    }

}


// ======================================================
// DATE & TIME
// ======================================================

function updateClock() {


    const now =
    new Date();


    document.getElementById(
        "date"
    ).value =

    now.toLocaleDateString();


    document.getElementById(
        "time"
    ).value =

    now.toLocaleTimeString();

}


updateClock();


setInterval(
    updateClock,
    1000
);


// ======================================================
// CAMERA
// ======================================================

const video =
document.getElementById("video");


let photoTaken =
false;


navigator.mediaDevices
.getUserMedia({

    video: true

})


.then(
    stream => {

        video.srcObject =
        stream;

    }
)


.catch(
    error => {

        console.error(
            "CAMERA ERROR:",
            error
        );


        alert(
            "Unable to access camera.\n\n" +
            "Please allow camera permission."
        );

    }
);


function takePhoto() {


    const canvas =
    document.getElementById("photo");


    const ctx =
    canvas.getContext("2d");


    ctx.drawImage(
        video,
        0,
        0,
        320,
        240
    );


    photoTaken =
    true;


    alert(
        "✅ Selfie captured successfully!"
    );

}


// ======================================================
// SIGNATURE
// ======================================================

const signature =
document.getElementById("signature");


const signCtx =
signature.getContext("2d");


let drawing =
false;


let signed =
false;


// White background

signCtx.fillStyle =
"white";


signCtx.fillRect(

    0,

    0,

    signature.width,

    signature.height

);


signCtx.strokeStyle =
"black";


signCtx.lineWidth =
2;


signCtx.lineCap =
"round";


// Desktop

signature.addEventListener(
    "mousedown",
    startMouse
);


signature.addEventListener(
    "mousemove",
    drawMouse
);


signature.addEventListener(
    "mouseup",
    stopDrawing
);


signature.addEventListener(
    "mouseleave",
    stopDrawing
);


// Mobile

signature.addEventListener(
    "touchstart",
    startTouch,
    { passive: false }
);


signature.addEventListener(
    "touchmove",
    drawTouch,
    { passive: false }
);


signature.addEventListener(
    "touchend",
    stopDrawing
);


function getMousePos(e) {


    const rect =
    signature.getBoundingClientRect();


    return {

        x:
        e.clientX -
        rect.left,

        y:
        e.clientY -
        rect.top

    };

}


function getTouchPos(e) {


    const rect =
    signature.getBoundingClientRect();


    const touch =
    e.touches[0];


    return {

        x:
        touch.clientX -
        rect.left,

        y:
        touch.clientY -
        rect.top

    };

}


function startMouse(e) {


    drawing =
    true;


    signed =
    true;


    const pos =
    getMousePos(e);


    signCtx.beginPath();


    signCtx.moveTo(
        pos.x,
        pos.y
    );

}


function drawMouse(e) {


    if (!drawing)
    return;


    const pos =
    getMousePos(e);


    signCtx.lineTo(
        pos.x,
        pos.y
    );


    signCtx.stroke();

}


function startTouch(e) {


    e.preventDefault();


    drawing =
    true;


    signed =
    true;


    const pos =
    getTouchPos(e);


    signCtx.beginPath();


    signCtx.moveTo(
        pos.x,
        pos.y
    );

}


function drawTouch(e) {


    e.preventDefault();


    if (!drawing)
    return;


    const pos =
    getTouchPos(e);


    signCtx.lineTo(
        pos.x,
        pos.y
    );


    signCtx.stroke();

}


function stopDrawing() {


    drawing =
    false;


    signCtx.beginPath();

}


function clearSignature() {


    signCtx.fillStyle =
    "white";


    signCtx.fillRect(

        0,

        0,

        signature.width,

        signature.height

    );


    signed =
    false;


    signCtx.strokeStyle =
    "black";


    signCtx.lineWidth =
    2;


    signCtx.lineCap =
    "round";

}


// ======================================================
// VALIDATE TIME
// ======================================================

function attendanceOpen() {


    if (!settings)
    return false;


    const now =
    new Date();


    const current =

    now.getHours() *
    60 +

    now.getMinutes();


    const start =
    String(
        settings.startTime
    ).split(":");


    const end =
    String(
        settings.endTime
    ).split(":");


    const startMinutes =

    parseInt(start[0]) *
    60 +

    parseInt(start[1]);


    const endMinutes =

    parseInt(end[0]) *
    60 +

    parseInt(end[1]);


    return (

        current >=
        startMinutes &&

        current <=
        endMinutes

    );

}


// ======================================================
// SUBMIT ATTENDANCE
// ======================================================

async function submitAttendance() {


    // Settings must be loaded

    if (!settings) {


        alert(
            "⏳ Attendance settings are still loading.\n\n" +
            "Please wait a moment and try again."
        );


        return;

    }


    // Check status

    if (
        String(
            settings.status
        ).toUpperCase()
        !== "OPEN"
    ) {


        alert(
            "Attendance is currently CLOSED."
        );


        return;

    }


    // Check time

    if (!attendanceOpen()) {


        alert(
            "Attendance is outside the allowed time."
        );


        return;

    }


    // Check GPS

    if (
        latitude === null
    ) {


        alert(
            "GPS not detected."
        );


        return;

    }


    // Check distance

    if (
        distanceMeters >
        ALLOWED_RADIUS
    ) {


        alert(

            "You are outside the allowed " +

            ALLOWED_RADIUS +

            " meter radius."

        );


        return;

    }


    // Check selfie

    if (!photoTaken) {


        alert(
            "Please capture your selfie."
        );


        return;

    }


    // Check signature

    if (!signed) {


        alert(
            "Please provide your signature."
        );


        return;

    }


    // ==================================================
    // CREATE ATTENDANCE DATA
    // ==================================================

    const today =
    new Date().toLocaleDateString();


    const attendanceKey =

    student.id +
    "_" +
    today;


    const attendance = {


        studentNumber:
        student.id,


        name:
        student.name,


        course:
        student.course,


        flight:
        student.flight,


        date:
        today,


        time:
        new Date().toLocaleTimeString(),


        status:
        document.getElementById(
            "status"
        ).value,


        latitude:
        latitude,


        longitude:
        longitude,


        distance:
        distanceMeters.toFixed(2),


        address:
        document.getElementById(
            "address"
        ).textContent,


        photo:
        document.getElementById(
            "photo"
        ).toDataURL(
            "image/png"
        ),


        signature:
        signature.toDataURL(
            "image/png"
        ),


        photoFileName:

        student.id +

        "_" +

        today.replace(
            /\//g,
            "-"
        ) +

        "_selfie.png",


        signatureFileName:

        student.id +

        "_" +

        today.replace(
            /\//g,
            "-"
        ) +

        "_signature.png"

    };


    // ==================================================
    // SEND TO GOOGLE APPS SCRIPT
    // ==================================================

    try {


        alert(
            "⏳ Submitting attendance..."
        );


        const response =

        await fetch(

            ATTENDANCE_API,

            {

                method:
                "POST",


                headers: {

                    "Content-Type":
                    "text/plain;charset=utf-8"

                },


                body:
                JSON.stringify(
                    attendance
                )

            }

        );


        const result =
        await response.json();


        if (
            result.success
        ) {


            localStorage.setItem(

                attendanceKey,

                JSON.stringify(
                    attendance
                )

            );


            alert(

                "✅ Attendance Submitted Successfully!"

            );


            window.location.href =
            "dashboard.html";


        } else {


            alert(

                "❌ " +

                (
                    result.message ||
                    "Submission failed."
                )

            );

        }


    } catch (error) {


        console.error(
            "SUBMISSION ERROR:",
            error
        );


        alert(

            "❌ Failed to connect to Google Sheets.\n\n" +

            "Please check your internet connection."

        );

    }

}


// ======================================================
// START LOADING SETTINGS
// ======================================================

loadSettings();
