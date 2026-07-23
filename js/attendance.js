// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// attendance.js - COMPLETE VERSION
// ======================================================


// ======================================================
// GOOGLE APPS SCRIPT WEB APP URL
// ======================================================

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzmqVoMihTcRZkRLhwgmCWK9zSv1bgP6W2YL0aEUio2bX340vPCdpVQ6uJD3lGNq3J_4A/exec";


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let student = null;
let settings = null;

let TRAINING_LAT = 0;
let TRAINING_LNG = 0;
let ALLOWED_RADIUS = 200;

let latitude = null;
let longitude = null;
let distanceMeters = 999999;

let photoTaken = false;
let drawing = false;
let signed = false;


// ======================================================
// PAGE START
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "ROTC Attendance System Starting..."
        );


        // Load logged-in student

        try {

            student =
            JSON.parse(
                localStorage.getItem(
                    "student"
                )
            );

        }

        catch (error) {

            console.error(
                "Student data error:",
                error
            );

            student = null;

        }


        // Check student login

        if (!student) {

            window.location.href =
            "login.html";

            return;

        }


        // Display student information

        displayStudent();


        // Show loading status

        const gpsStatus =
        document.getElementById(
            "gpsStatus"
        );


        if (gpsStatus) {

            gpsStatus.textContent =
            "⏳ Loading attendance settings...";

        }


        // Load settings

        loadSettings();

    }
);


// ======================================================
// DISPLAY STUDENT
// ======================================================

function displayStudent() {

    const cadetName =
    document.getElementById(
        "cadetName"
    );


    const studentNumber =
    document.getElementById(
        "studentNumber"
    );


    const flight =
    document.getElementById(
        "flight"
    );


    if (cadetName) {

        cadetName.textContent =
        student.name || "";

    }


    if (studentNumber) {

        studentNumber.textContent =
        "Student Number: " +
        (
            student.id ||
            student.studentNumber ||
            ""
        );

    }


    if (flight) {

        flight.textContent =
        "Flight: " +
        (
            student.flight ||
            ""
        );

    }

}


// ======================================================
// LOAD SETTINGS FROM GOOGLE APPS SCRIPT
// ======================================================

async function loadSettings() {

    try {

        console.log(
            "Connecting to Google Apps Script..."
        );


        const response =
        await fetch(

            APPS_SCRIPT_URL +
            "?t=" +
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
            "HTTP Status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(

                "Server returned HTTP " +
                response.status

            );

        }


        const text =
        await response.text();


        console.log(
            "Raw Apps Script Response:",
            text
        );


        if (!text) {

            throw new Error(
                "Empty response from Google Apps Script."
            );

        }


        let data;


        try {

            data =
            JSON.parse(
                text
            );

        }

        catch (jsonError) {

            console.error(
                "JSON Error:",
                jsonError
            );

            throw new Error(

                "Google Apps Script did not return valid JSON."

            );

        }


        console.log(
            "Settings received:",
            data
        );


        // Check backend error

        if (
            data.success === false
        ) {

            throw new Error(

                data.message ||
                "Google Apps Script returned an error."

            );

        }


        // Save settings

        settings =
        data;


        // ==================================================
        // GET TRAINING LOCATION
        // ==================================================

        TRAINING_LAT =
        parseFloat(
            settings.latitude
        );


        TRAINING_LNG =
        parseFloat(
            settings.longitude
        );


        ALLOWED_RADIUS =
        parseFloat(
            settings.radius
        );


        // Check latitude

        if (
            isNaN(
                TRAINING_LAT
            )
        ) {

            throw new Error(
                "Invalid training latitude."
            );

        }


        // Check longitude

        if (
            isNaN(
                TRAINING_LNG
            )
        ) {

            throw new Error(
                "Invalid training longitude."
            );

        }


        // Default radius

        if (
            isNaN(
                ALLOWED_RADIUS
            )
        ) {

            ALLOWED_RADIUS =
            200;

        }


        console.log(
            "Training Day:",
            settings.trainingDay
        );


        console.log(
            "Training Topic:",
            settings.trainingTopic
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


        // ==================================================
        // SETTINGS LOADED SUCCESSFULLY
        // ==================================================

        const gpsStatus =
        document.getElementById(
            "gpsStatus"
        );


        if (gpsStatus) {

            gpsStatus.textContent =
            "🟡 Attendance settings loaded. Detecting GPS...";

        }


        // Start system

        initializeAttendance();

    }


    catch (error) {

        console.error(
            "SETTINGS ERROR:",
            error
        );


        const gpsStatus =
        document.getElementById(
            "gpsStatus"
        );


        if (gpsStatus) {

            gpsStatus.textContent =
            "🔴 Unable to load attendance settings.";

        }


        alert(

            "❌ Unable to load attendance settings.\n\n" +

            error.message +

            "\n\nPlease contact the administrator."

        );

    }

}


// ======================================================
// INITIALIZE ATTENDANCE SYSTEM
// ======================================================

function initializeAttendance() {

    console.log(
        "Initializing attendance system..."
    );


    // Start date and time

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


    const date =
    document.getElementById(
        "date"
    );


    const time =
    document.getElementById(
        "time"
    );


    if (date) {

        date.value =
        now.toLocaleDateString();

    }


    if (time) {

        time.value =
        now.toLocaleTimeString();

    }

}


// ======================================================
// GPS
// ======================================================

function startGPS() {

    if (
        !navigator.geolocation
    ) {

        const gpsStatus =
        document.getElementById(
            "gpsStatus"
        );


        if (gpsStatus) {

            gpsStatus.textContent =
            "🔴 GPS NOT SUPPORTED";

        }


        alert(
            "Your browser does not support GPS."
        );


        return;

    }


    const gpsStatus =
    document.getElementById(
        "gpsStatus"
    );


    if (gpsStatus) {

        gpsStatus.textContent =
        "🟡 Detecting GPS...";

    }


    navigator.geolocation.getCurrentPosition(

        function (position) {

            latitude =
            position.coords.latitude;


            longitude =
            position.coords.longitude;


            console.log(
                "Student Latitude:",
                latitude
            );


            console.log(
                "Student Longitude:",
                longitude
            );


            if (gpsStatus) {

                gpsStatus.textContent =
                "🟢 GPS VERIFIED";

            }


            const latitudeElement =
            document.getElementById(
                "latitude"
            );


            const longitudeElement =
            document.getElementById(
                "longitude"
            );


            if (latitudeElement) {

                latitudeElement.textContent =
                latitude.toFixed(6);

            }


            if (longitudeElement) {

                longitudeElement.textContent =
                longitude.toFixed(6);

            }


            // ==================================================
            // CALCULATE DISTANCE
            // ==================================================

            distanceMeters =
            calculateDistance(

                latitude,

                longitude,

                TRAINING_LAT,

                TRAINING_LNG

            );


            const distanceElement =
            document.getElementById(
                "distance"
            );


            if (distanceElement) {

                distanceElement.textContent =

                distanceMeters.toFixed(1) +

                " meters";

            }


            // ==================================================
            // VALIDATE RADIUS
            // ==================================================

            const validationStatus =
            document.getElementById(
                "validationStatus"
            );


            if (
                distanceMeters <=
                ALLOWED_RADIUS
            ) {

                if (validationStatus) {

                    validationStatus.innerHTML =
                    "✅ Inside Allowed Area";

                }

            }

            else {

                if (validationStatus) {

                    validationStatus.innerHTML =

                    "❌ Outside " +

                    ALLOWED_RADIUS +

                    " Meter Radius";

                }

            }


            // ==================================================
            // GET ADDRESS
            // ==================================================

            getAddress(

                latitude,

                longitude

            );

        },


        function (error) {

            console.error(
                "GPS Error:",
                error
            );


            if (gpsStatus) {

                gpsStatus.textContent =
                "🔴 GPS NOT AVAILABLE";

            }


            alert(

                "Unable to access your location.\n\n" +

                "Please turn ON Location/GPS and allow location permission."

            );

        },


        {

            enableHighAccuracy:
            true,

            timeout:
            30000,

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

    ) *

    Math.PI /
    180;


    const dLon =

    (

        lon2 -
        lon1

    ) *

    Math.PI /
    180;


    const a =

    Math.sin(
        dLat / 2
    ) *

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


        const address =
        document.getElementById(
            "address"
        );


        if (address) {

            address.textContent =

            data.display_name ||

            "Address unavailable.";

        }

    }


    catch (error) {

        console.error(
            "Address Error:",
            error
        );


        const address =
        document.getElementById(
            "address"
        );


        if (address) {

            address.textContent =
            "Unable to determine address.";

        }

    }

}


// ======================================================
// CAMERA
// ======================================================

function startCamera() {

    const video =
    document.getElementById(
        "video"
    );


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


    navigator.mediaDevices
    .getUserMedia({

        video:
        true

    })

    .then(

        function (stream) {

            video.srcObject =
            stream;


            console.log(
                "Camera started."
            );

        }

    )

    .catch(

        function (error) {

            console.error(
                "Camera Error:",
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
    document.getElementById(
        "photo"
    );


    const video =
    document.getElementById(
        "video"
    );


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
    canvas.getContext(
        "2d"
    );


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
// MOUSE SIGNATURE
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
        e.clientX -
        rect.left,

        y:
        e.clientY -
        rect.top

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
    getMousePos(
        e
    );


    ctx.beginPath();


    ctx.moveTo(

        pos.x,

        pos.y

    );

}


function drawMouse(e) {

    if (
        !drawing
    ) {

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
    getMousePos(
        e
    );


    ctx.lineTo(

        pos.x,

        pos.y

    );


    ctx.stroke();

}


// ======================================================
// TOUCH SIGNATURE
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
        touch.clientX -
        rect.left,

        y:
        touch.clientY -
        rect.top

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
    getTouchPos(
        e
    );


    ctx.beginPath();


    ctx.moveTo(

        pos.x,

        pos.y

    );

}


function drawTouch(e) {

    e.preventDefault();


    if (
        !drawing
    ) {

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
    getTouchPos(
        e
    );


    ctx.lineTo(

        pos.x,

        pos.y

    );


    ctx.stroke();

}


// ======================================================
// STOP DRAWING
// ======================================================

function stopDrawing() {

    drawing =
    false;


    const signature =
    document.getElementById(
        "signature"
    );


    if (signature) {

        const ctx =
        signature.getContext(
            "2d"
        );


        ctx.beginPath();

    }

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


    signed =
    false;


    ctx.strokeStyle =
    "black";


    ctx.lineWidth =
    2;


    ctx.lineCap =
    "round";

}


// ======================================================
// CHECK ATTENDANCE TIME
// ======================================================

function attendanceOpen() {

    if (!settings) {

        return false;

    }


    const currentTime =
    new Date();


    const currentMinutes =

    currentTime.getHours() *
    60

    +

    currentTime.getMinutes();


    const start =
    String(
        settings.startTime ||
        "00:00"
    ).split(":");


    const end =
    String(
        settings.endTime ||
        "23:59"
    ).split(":");


    const startMinutes =

    parseInt(
        start[0]
    ) *
    60

    +

    parseInt(
        start[1]
    );


    const endMinutes =

    parseInt(
        end[0]
    ) *
    60

    +

    parseInt(
        end[1]
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

    // ==================================================
    // CHECK SETTINGS
    // ==================================================

    if (!settings) {

        alert(

            "Attendance settings are still loading.\n\n" +

            "Please wait a moment and try again."

        );

        return;

    }


    // ==================================================
    // CHECK ATTENDANCE STATUS
    // ==================================================

    if (

        String(
            settings.status
        ).toUpperCase()

        !==

        "OPEN"

    ) {

        alert(
            "Attendance is currently CLOSED."
        );

        return;

    }


    // ==================================================
    // CHECK ATTENDANCE TIME
    // ==================================================

    if (
        !attendanceOpen()
    ) {

        alert(

            "Attendance is outside the allowed time."

        );

        return;

    }


    // ==================================================
    // CHECK GPS
    // ==================================================

    if (
        latitude === null ||
        longitude === null
    ) {

        alert(
            "GPS not detected."
        );

        return;

    }


    // ==================================================
    // CHECK DISTANCE
    // ==================================================

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


    // ==================================================
    // CHECK PHOTO
    // ==================================================

    if (!photoTaken) {

        alert(

            "Please capture your selfie."

        );

        return;

    }


    // ==================================================
    // CHECK SIGNATURE
    // ==================================================

    if (!signed) {

        alert(

            "Please provide your signature."

        );

        return;

    }


    // ==================================================
    // GET CURRENT DATE AND TIME
    // ==================================================

    const now =
    new Date();


    const today =
    now.toLocaleDateString();


    // ==================================================
    // ATTENDANCE KEY
    // ==================================================

    const attendanceKey =

    (

        student.id ||

        student.studentNumber

    )

    +

    "_" +

    today;


    // ==================================================
    // GET TRAINING INFORMATION
    // ==================================================

    const trainingDay =

    settings.trainingDay ||

    "";


    const trainingTopic =

    settings.trainingTopic ||

    settings.topic ||

    "";


    // ==================================================
    // CREATE ATTENDANCE DATA
    // ==================================================

    const attendance = {

        studentNumber:

        student.id ||

        student.studentNumber ||

        "",


        name:

        student.name ||

        "",


        course:

        student.course ||

        "",


        flight:

        student.flight ||

        "",


        // IMPORTANT:
        // Training Day

        trainingDay:

        trainingDay,


        // IMPORTANT:
        // Training Topic

        trainingTopic:

        trainingTopic,


        // Compatibility field

        topic:

        trainingTopic,


        date:

        today,


        time:

        now.toLocaleTimeString(),


        status:

        document.getElementById(
            "status"
        )?.value || "",


        address:

        document.getElementById(
            "address"
        )?.textContent || "",


        latitude:

        latitude,


        longitude:

        longitude,


        distance:

        distanceMeters.toFixed(2),


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

        (

            student.id ||

            student.studentNumber ||

            "student"

        )

        +

        "_" +

        trainingDay.replace(

            /\s+/g,

            "_"

        )

        +

        "_" +

        today.replace(

            /\//g,

            "-"

        )

        +

        "_selfie.png",


        signatureFileName:

        (

            student.id ||

            student.studentNumber ||

            "student"

        )

        +

        "_" +

        trainingDay.replace(

            /\s+/g,

            "_"

        )

        +

        "_" +

        today.replace(

            /\//g,

            "-"

        )

        +

        "_signature.png"

    };


    // ==================================================
    // SAVE LOCAL COPY
    // ==================================================

    localStorage.setItem(

        attendanceKey,

        JSON.stringify(
            attendance
        )

    );


    // ==================================================
    // SEND TO GOOGLE APPS SCRIPT
    // ==================================================

    try {

        console.log(
            "Submitting attendance..."
        );


        console.log(
            "Training Day:",
            trainingDay
        );


        console.log(
            "Training Topic:",
            trainingTopic
        );


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


        const text =
        await response.text();


        console.log(
            "Submission Response:",
            text
        );


        let result;


        try {

            result =
            JSON.parse(
                text
            );

        }

        catch (error) {

            throw new Error(

                "Invalid response from Google Apps Script:\n" +

                text

            );

        }


        if (
            result.success
        ) {

            alert(

                "✅ Attendance Submitted Successfully!\n\n" +

                "Training Day: " +

                trainingDay

            );


            window.location.href =
            "dashboard.html";

        }

        else {

            alert(

                "❌ Attendance submission failed.\n\n" +

                (

                    result.message ||

                    "Unknown error."

                )

            );

        }

    }


    catch (error) {

        console.error(
            "Submission Error:",
            error
        );


        alert(

            "❌ Failed to submit attendance.\n\n" +

            error.message

        );

    }

}
