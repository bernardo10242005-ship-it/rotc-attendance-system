// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// attendance.js
// ======================================================


// ======================================================
// GOOGLE APPS SCRIPT WEB APP URL
// ======================================================

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzrKmu79aGyyyVSjZuff9ZtNublgufjvzu6vc_UG0pWyIZCOM6ArqC7gHsFNIbjecvGRQ/exec";


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let settings = null;

let latitude = null;
let longitude = null;

let distanceMeters = 999999;

let TRAINING_LAT = 0;
let TRAINING_LNG = 0;
let ALLOWED_RADIUS = 200;

let photoTaken = false;

let drawing = false;
let signed = false;


// ======================================================
// GET STUDENT
// ======================================================

let student = null;

try {

    student =
    JSON.parse(
        localStorage.getItem("student")
    );

} catch (error) {

    console.error(
        "Student data error:",
        error
    );

}


if (!student) {

    alert(
        "Student information was not found. Please login again."
    );

    window.location.href =
    "login.html";

}


// ======================================================
// DISPLAY STUDENT
// ======================================================

if (student) {

    const cadetName =
    document.getElementById("cadetName");

    const studentNumber =
    document.getElementById("studentNumber");

    const flight =
    document.getElementById("flight");


    if (cadetName) {

        cadetName.textContent =
        student.name || "";

    }


    if (studentNumber) {

        studentNumber.textContent =
        "Student Number: " +
        (student.id || "");

    }


    if (flight) {

        flight.textContent =
        "Flight: " +
        (student.flight || "");

    }

}


// ======================================================
// LOAD ATTENDANCE SETTINGS
// ======================================================

async function loadSettings() {

    const gpsStatus =
    document.getElementById("gpsStatus");


    try {

        console.log(
            "================================"
        );

        console.log(
            "LOADING ATTENDANCE SETTINGS"
        );

        console.log(
            "URL:",
            APPS_SCRIPT_URL
        );


        if (gpsStatus) {

            gpsStatus.textContent =
            "⏳ Loading attendance settings...";

        }


        // ==================================================
        // FETCH GOOGLE APPS SCRIPT
        // ==================================================

        const response =
        await fetch(

            APPS_SCRIPT_URL +
            "?action=settings&t=" +
            Date.now(),

            {

                method:
                "GET",

                cache:
                "no-store",

                redirect:
                "follow"

            }

        );


        console.log(
            "HTTP STATUS:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "HTTP Error " +
                response.status
            );

        }


        // ==================================================
        // READ RESPONSE AS TEXT FIRST
        // ==================================================

        const responseText =
        await response.text();


        console.log(
            "RAW RESPONSE:",
            responseText
        );


        if (
            !responseText ||
            responseText.trim() === ""
        ) {

            throw new Error(
                "Google Apps Script returned an empty response."
            );

        }


        // ==================================================
        // CONVERT RESPONSE TO JSON
        // ==================================================

        let data;

        try {

            data =
            JSON.parse(
                responseText
            );

        } catch (jsonError) {

            console.error(
                "JSON ERROR:",
                jsonError
            );

            throw new Error(
                "Invalid JSON returned by Google Apps Script."
            );

        }


        console.log(
            "SETTINGS DATA:",
            data
        );


        // ==================================================
        // CHECK SERVER ERROR
        // ==================================================

        if (
            data.success === false
        ) {

            throw new Error(

                data.message ||

                "Google Apps Script returned an error."

            );

        }


        // ==================================================
        // CHECK REQUIRED SETTINGS
        // ==================================================

        if (
            data.latitude === undefined ||
            data.longitude === undefined
        ) {

            throw new Error(
                "Latitude or longitude is missing from settings."
            );

        }


        // ==================================================
        // SAVE SETTINGS
        // ==================================================

        settings =
        data;


        TRAINING_LAT =
        parseFloat(
            data.latitude
        );


        TRAINING_LNG =
        parseFloat(
            data.longitude
        );


        ALLOWED_RADIUS =
        parseFloat(
            data.radius
        );


        // Default radius

        if (
            isNaN(ALLOWED_RADIUS) ||
            ALLOWED_RADIUS <= 0
        ) {

            ALLOWED_RADIUS =
            200;

        }


        // ==================================================
        // VALIDATE LOCATION
        // ==================================================

        if (
            isNaN(TRAINING_LAT) ||
            isNaN(TRAINING_LNG)
        ) {

            throw new Error(
                "Invalid training ground coordinates."
            );

        }


        console.log(
            "TRAINING LAT:",
            TRAINING_LAT
        );


        console.log(
            "TRAINING LNG:",
            TRAINING_LNG
        );


        console.log(
            "ALLOWED RADIUS:",
            ALLOWED_RADIUS
        );


        console.log(
            "ATTENDANCE STATUS:",
            data.status
        );


        console.log(
            "START TIME:",
            data.startTime
        );


        console.log(
            "END TIME:",
            data.endTime
        );


        // ==================================================
        // SETTINGS LOADED SUCCESSFULLY
        // ==================================================

        if (gpsStatus) {

            gpsStatus.textContent =
            "🟡 Attendance settings loaded. Detecting GPS...";

        }


        console.log(
            "ATTENDANCE SETTINGS LOADED SUCCESSFULLY"
        );


        // ==================================================
        // START EVERYTHING
        // ==================================================

        initializeAttendance();


    }

    catch (error) {

        console.error(
            "================================"
        );

        console.error(
            "SETTINGS LOAD FAILED"
        );

        console.error(
            error
        );

        console.error(
            "================================"
        );


        if (gpsStatus) {

            gpsStatus.textContent =
            "🔴 Unable to load attendance settings.";

        }


        alert(

            "❌ Unable to load attendance settings.\n\n" +

            "Error: " +

            error.message

        );

    }

}


// ======================================================
// INITIALIZE ATTENDANCE
// ======================================================

function initializeAttendance() {

    console.log(
        "Starting attendance system..."
    );


    updateClock();


    setInterval(
        updateClock,
        1000
    );


    // Start GPS

    startGPS();


    // Start camera

    startCamera();


    // Setup signature

    setupSignature();

}


// ======================================================
// DATE AND TIME
// ======================================================

function updateClock() {

    const now =
    new Date();


    const dateElement =
    document.getElementById("date");


    const timeElement =
    document.getElementById("time");


    if (dateElement) {

        dateElement.value =
        now.toLocaleDateString();

    }


    if (timeElement) {

        timeElement.value =
        now.toLocaleTimeString();

    }

}


// ======================================================
// GPS
// ======================================================

function startGPS() {

    const gpsStatus =
    document.getElementById("gpsStatus");


    if (
        !navigator.geolocation
    ) {

        if (gpsStatus) {

            gpsStatus.textContent =
            "🔴 GPS NOT SUPPORTED";

        }

        return;

    }


    if (gpsStatus) {

        gpsStatus.textContent =
        "🟡 Detecting GPS...";

    }


    navigator.geolocation.getCurrentPosition(

        function(position) {


            latitude =
            position.coords.latitude;


            longitude =
            position.coords.longitude;


            if (gpsStatus) {

                gpsStatus.textContent =
                "🟢 GPS VERIFIED";

            }


            const latitudeElement =
            document.getElementById("latitude");


            const longitudeElement =
            document.getElementById("longitude");


            if (latitudeElement) {

                latitudeElement.textContent =
                latitude.toFixed(6);

            }


            if (longitudeElement) {

                longitudeElement.textContent =
                longitude.toFixed(6);

            }


            // Calculate distance

            distanceMeters =
            calculateDistance(

                latitude,

                longitude,

                TRAINING_LAT,

                TRAINING_LNG

            );


            const distanceElement =
            document.getElementById("distance");


            if (distanceElement) {

                distanceElement.textContent =
                distanceMeters.toFixed(1) +
                " meters";

            }


            // Validate radius

            const validationStatus =
            document.getElementById(
                "validationStatus"
            );


            if (validationStatus) {

                if (
                    distanceMeters <=
                    ALLOWED_RADIUS
                ) {

                    validationStatus.innerHTML =
                    "✅ Inside Allowed Area";

                }

                else {

                    validationStatus.innerHTML =
                    "❌ Outside " +
                    ALLOWED_RADIUS +
                    " Meter Radius";

                }

            }


            // Get address

            getAddress(
                latitude,
                longitude
            );


        },


        function(error) {


            console.error(
                "GPS ERROR:",
                error
            );


            if (gpsStatus) {

                gpsStatus.textContent =
                "🔴 GPS NOT AVAILABLE";

            }


            alert(

                "Unable to access your location.\n\n" +

                "Please turn ON your phone Location/GPS " +

                "and allow location permission."

            );

        },


        {

            enableHighAccuracy:
            true,

            timeout:
            15000,

            maximumAge:
            0

        }

    );

}


// ======================================================
// DISTANCE CALCULATION
// ======================================================

function calculateDistance(

    lat1,
    lon1,
    lat2,
    lon2

) {

    const R =
    6371000;


    const dLat =

    (

        lat2 -
        lat1

    )

    *

    Math.PI /
    180;


    const dLon =

    (

        lon2 -
        lon1

    )

    *

    Math.PI /
    180;


    const a =

    Math.sin(
        dLat / 2
    )

    *

    Math.sin(
        dLat / 2
    )

    +

    Math.cos(

        lat1 *
        Math.PI /
        180

    )

    *

    Math.cos(

        lat2 *
        Math.PI /
        180

    )

    *

    Math.sin(
        dLon / 2
    )

    *

    Math.sin(
        dLon / 2
    );


    const c =

    2 *

    Math.atan2(

        Math.sqrt(a),

        Math.sqrt(
            1 - a
        )

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

        "https://nominatim.openstreetmap.org/reverse" +

        "?format=jsonv2" +

        "&lat=" +
        encodeURIComponent(lat) +

        "&lon=" +
        encodeURIComponent(lng);


        const response =
        await fetch(
            url
        );


        if (!response.ok) {

            throw new Error(
                "Address service error."
            );

        }


        const data =
        await response.json();


        const addressElement =
        document.getElementById(
            "address"
        );


        if (addressElement) {

            addressElement.textContent =

            data.display_name ||

            "Address unavailable.";

        }


    }

    catch(error) {

        console.error(
            "ADDRESS ERROR:",
            error
        );


        const addressElement =
        document.getElementById(
            "address"
        );


        if (addressElement) {

            addressElement.textContent =
            "Unable to determine address.";

        }

    }

}


// ======================================================
// CAMERA
// ======================================================

function startCamera() {

    const video =
    document.getElementById("video");


    if (!video) {

        console.error(
            "Video element not found."
        );

        return;

    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        alert(
            "Camera is not supported by this browser."
        );

        return;

    }


    console.log(
        "Requesting camera permission..."
    );


    navigator.mediaDevices
    .getUserMedia({

        video: {

            facingMode:
            "user"

        },

        audio:
        false

    })

    .then(

        function(stream) {


            video.srcObject =
            stream;


            video.play();


            console.log(
                "Camera started successfully."
            );


        }

    )

    .catch(

        function(error) {


            console.error(
                "CAMERA ERROR:",
                error
            );


            alert(

                "Unable to access camera.\n\n" +

                "Please allow camera permission for this website."

            );

        }

    );

}


// ======================================================
// TAKE PHOTO
// ======================================================

function takePhoto() {

    const canvas =
    document.getElementById("photo");


    const video =
    document.getElementById("video");


    if (
        !canvas ||
        !video
    ) {

        alert(
            "Camera is not ready."
        );

        return;

    }


    const ctx =
    canvas.getContext("2d");


    ctx.drawImage(

        video,

        0,

        0,

        canvas.width,

        canvas.height

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

function setupSignature() {

    const signature =
    document.getElementById(
        "signature"
    );


    if (!signature) {

        return;

    }


    const signCtx =
    signature.getContext(
        "2d"
    );


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


    signature.addEventListener(

        "touchstart",

        startTouch,

        {

            passive:
            false

        }

    );


    signature.addEventListener(

        "touchmove",

        drawTouch,

        {

            passive:
            false

        }

    );


    signature.addEventListener(

        "touchend",

        stopDrawing

    );

}


// ======================================================
// SIGNATURE MOUSE
// ======================================================

function getMousePos(e) {

    const signature =
    document.getElementById(
        "signature"
    );


    const rect =
    signature.getBoundingClientRect();


    return {

        x:

        (

            e.clientX -
            rect.left

        )

        *

        (

            signature.width /
            rect.width

        ),


        y:

        (

            e.clientY -
            rect.top

        )

        *

        (

            signature.height /
            rect.height

        )

    };

}


function startMouse(e) {

    const signature =
    document.getElementById(
        "signature"
    );


    const ctx =
    signature.getContext(
        "2d"
    );


    drawing =
    true;


    signed =
    true;


    const pos =
    getMousePos(e);


    ctx.beginPath();


    ctx.moveTo(

        pos.x,

        pos.y

    );

}


function drawMouse(e) {

    if (!drawing) {

        return;

    }


    const signature =
    document.getElementById(
        "signature"
    );


    const ctx =
    signature.getContext(
        "2d"
    );


    const pos =
    getMousePos(e);


    ctx.lineTo(

        pos.x,

        pos.y

    );


    ctx.stroke();

}


// ======================================================
// SIGNATURE TOUCH
// ======================================================

function getTouchPos(e) {

    const signature =
    document.getElementById(
        "signature"
    );


    const rect =
    signature.getBoundingClientRect();


    const touch =
    e.touches[0];


    return {

        x:

        (

            touch.clientX -
            rect.left

        )

        *

        (

            signature.width /
            rect.width

        ),


        y:

        (

            touch.clientY -
            rect.top

        )

        *

        (

            signature.height /
            rect.height

        )

    };

}


function startTouch(e) {

    e.preventDefault();


    const signature =
    document.getElementById(
        "signature"
    );


    const ctx =
    signature.getContext(
        "2d"
    );


    drawing =
    true;


    signed =
    true;


    const pos =
    getTouchPos(e);


    ctx.beginPath();


    ctx.moveTo(

        pos.x,

        pos.y

    );

}


function drawTouch(e) {

    e.preventDefault();


    if (!drawing) {

        return;

    }


    const signature =
    document.getElementById(
        "signature"
    );


    const ctx =
    signature.getContext(
        "2d"
    );


    const pos =
    getTouchPos(e);


    ctx.lineTo(

        pos.x,

        pos.y

    );


    ctx.stroke();

}


function stopDrawing() {

    drawing =
    false;

}


// ======================================================
// CLEAR SIGNATURE
// ======================================================

function clearSignature() {

    const signature =
    document.getElementById(
        "signature"
    );


    if (!signature) {

        return;

    }


    const ctx =
    signature.getContext(
        "2d"
    );


    ctx.fillStyle =
    "white";


    ctx.fillRect(

        0,

        0,

        signature.width,

        signature.height

    );


    ctx.strokeStyle =
    "black";


    ctx.lineWidth =
    2;


    ctx.lineCap =
    "round";


    signed =
    false;

}


// ======================================================
// CHECK ATTENDANCE TIME
// ======================================================

function attendanceOpen() {

    if (!settings) {

        return false;

    }


    const now =
    new Date();


    const currentMinutes =

    now.getHours() *
    60

    +

    now.getMinutes();


    const startParts =

    String(
        settings.startTime
    )

    .split(":");


    const endParts =

    String(
        settings.endTime
    )

    .split(":");


    const startMinutes =

    parseInt(
        startParts[0]
    )

    *

    60

    +

    parseInt(
        startParts[1]
    );


    const endMinutes =

    parseInt(
        endParts[0]
    )

    *

    60

    +

    parseInt(
        endParts[1]
    );


    return (

        currentMinutes >=
        startMinutes

        &&

        currentMinutes <=
        endMinutes

    );

}


// ======================================================
// SUBMIT ATTENDANCE
// ======================================================

async function submitAttendance() {


    if (!settings) {

        alert(
            "Attendance settings are still loading."
        );

        return;

    }


    if (

        String(
            settings.status
        )

        .toUpperCase()

        !==

        "OPEN"

    ) {

        alert(
            "Attendance is currently CLOSED."
        );

        return;

    }


    if (!attendanceOpen()) {

        alert(
            "Attendance is outside the allowed time."
        );

        return;

    }


    if (latitude === null) {

        alert(
            "GPS not detected."
        );

        return;

    }


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


    if (!photoTaken) {

        alert(
            "Please capture your selfie."
        );

        return;

    }


    if (!signed) {

        alert(
            "Please provide your signature."
        );

        return;

    }


    const today =
    new Date()
    .toLocaleDateString();


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
        student.course || "",

        flight:
        student.flight || "",

        date:
        today,

        time:
        new Date()
        .toLocaleTimeString(),

        status:
        document.getElementById(
            "status"
        ).value,

        latitude:
        latitude,

        longitude:
        longitude,

        distance:
        distanceMeters
        .toFixed(2),

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
        document.getElementById(
            "signature"
        ).toDataURL(
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


    try {


        const response =
        await fetch(

            APPS_SCRIPT_URL,

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

        }

        else {

            alert(

                "❌ " +

                (

                    result.message ||

                    "Attendance submission failed."

                )

            );

        }


    }

    catch(error) {

        console.error(
            "SUBMISSION ERROR:",
            error
        );


        alert(

            "❌ Failed to connect to Google Sheets.\n\n" +

            error.message

        );

    }

}


// ======================================================
// START
// ======================================================

console.log(
    "ROTC Attendance System Starting..."
);


loadSettings();
