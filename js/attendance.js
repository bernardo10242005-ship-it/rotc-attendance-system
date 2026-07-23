// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// attendance.js
// COMPLETE VERSION
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

let gpsAccuracy = null;

let distanceMeters = 999999;

let photoTaken = false;

let drawing = false;

let signed = false;

let gpsWatchId = null;

let bestGpsAccuracy = Infinity;


// ======================================================
// PAGE START
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "ROTC Attendance System Starting..."
        );


        student =
        JSON.parse(
            localStorage.getItem(
                "student"
            )
        );


        if (!student) {

            window.location.href =
            "login.html";

            return;

        }


        displayStudent();


        const gpsStatus =
        document.getElementById(
            "gpsStatus"
        );


        if (gpsStatus) {

            gpsStatus.textContent =
            "⏳ Loading attendance settings...";

        }


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
// LOAD SETTINGS
// ======================================================

async function loadSettings() {

    try {

        const response =
        await fetch(

            APPS_SCRIPT_URL +
            "?t=" +
            Date.now(),

            {

                method:
                "GET",

                cache:
                "no-store"

            }

        );


        if (!response.ok) {

            throw new Error(

                "Server returned HTTP " +

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

                "Unable to load settings."

            );

        }


        settings =
        data;


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


        if (
            isNaN(
                TRAINING_LAT
            )
        ) {

            throw new Error(
                "Invalid training latitude."
            );

        }


        if (
            isNaN(
                TRAINING_LNG
            )
        ) {

            throw new Error(
                "Invalid training longitude."
            );

        }


        if (
            isNaN(
                ALLOWED_RADIUS
            )
        ) {

            ALLOWED_RADIUS =
            200;

        }


        const gpsStatus =
        document.getElementById(
            "gpsStatus"
        );


        if (gpsStatus) {

            gpsStatus.textContent =
            "🟡 Attendance settings loaded. Detecting GPS...";

        }


        initializeAttendance();

    }


    catch(error) {

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

            error.message

        );

    }

}


// ======================================================
// INITIALIZE
// ======================================================

function initializeAttendance() {

    updateClock();


    setInterval(

        updateClock,

        1000

    );


    startGPS();


    startCamera();


    setupSignature();

}


// ======================================================
// DATE & TIME
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
        "🟡 Searching for accurate GPS location...";

    }


    // ==================================================
    // INITIAL GPS READING
    // ==================================================

    navigator.geolocation.getCurrentPosition(

        handleGPSPosition,

        handleGPSError,

        {

            enableHighAccuracy:
            true,

            timeout:
            30000,

            maximumAge:
            0

        }

    );


    // ==================================================
    // CONTINUOUS GPS WATCH
    // LOOK FOR BETTER ACCURACY
    // ==================================================

    gpsWatchId =
    navigator.geolocation.watchPosition(

        handleGPSPosition,

        handleGPSError,

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
// HANDLE GPS POSITION
// ======================================================

function handleGPSPosition(
    position
) {

    const newLatitude =
    position.coords.latitude;


    const newLongitude =
    position.coords.longitude;


    const newAccuracy =
    position.coords.accuracy;


    console.log(

        "GPS reading:",

        newLatitude,

        newLongitude,

        "Accuracy:",

        newAccuracy

    );


    // ==================================================
    // KEEP BEST ACCURACY
    // ==================================================

    if (
        newAccuracy <=
        bestGpsAccuracy
    ) {

        bestGpsAccuracy =
        newAccuracy;


        latitude =
        newLatitude;


        longitude =
        newLongitude;


        gpsAccuracy =
        newAccuracy;

    }


    // ==================================================
    // UPDATE DISPLAY
    // ==================================================

    const gpsStatus =
    document.getElementById(
        "gpsStatus"
    );


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


    if (gpsStatus) {

        gpsStatus.textContent =

        "🟢 GPS VERIFIED • Accuracy ±" +

        gpsAccuracy.toFixed(1) +

        "m";

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

            "✅ Inside Allowed Area<br>" +

            "GPS Accuracy: ±" +

            gpsAccuracy.toFixed(1) +

            " meters";

        }

    }

    else {

        if (validationStatus) {

            validationStatus.innerHTML =

            "❌ Outside " +

            ALLOWED_RADIUS +

            " Meter Radius<br>" +

            "GPS Accuracy: ±" +

            gpsAccuracy.toFixed(1) +

            " meters";

        }

    }


    // ==================================================
    // GET ADDRESS
    // ==================================================

    getAddress(

        latitude,

        longitude

    );

}


// ======================================================
// GPS ERROR
// ======================================================

function handleGPSError(
    error
) {

    console.error(
        "GPS Error:",
        error
    );


    const gpsStatus =
    document.getElementById(
        "gpsStatus"
    );


    if (gpsStatus) {

        gpsStatus.textContent =
        "🔴 GPS NOT AVAILABLE";

    }

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

        lat +

        "&lon=" +

        lng;


        const response =
        await fetch(
            url
        );


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


    catch(error) {

        console.error(
            "Address Error:",
            error
        );

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

        function(stream) {

            video.srcObject =
            stream;

        }

    )

    .catch(

        function(error) {

            console.error(
                "Camera Error:",
                error
            );

            alert(

                "Unable to access camera.\n\n" +

                "Please allow camera permission."

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

    60 +

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

    60 +

    parseInt(
        start[1]
    );


    const endMinutes =

    parseInt(
        end[0]
    ) *

    60 +

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

    if (!settings) {

        alert(

            "Attendance settings are still loading."

        );

        return;

    }


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


    if (
        !attendanceOpen()
    ) {

        alert(

            "Attendance is outside the allowed time."

        );

        return;

    }


    if (
        latitude === null
    ) {

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


    // ==================================================
    // TRAINING DAY & TOPIC
    // ==================================================

    const trainingDay =
    settings.trainingDay ||
    "";


    const trainingTopic =
    settings.trainingTopic ||
    "";


    if (!trainingDay) {

        alert(
            "Training Day is not configured."
        );

        return;

    }


    if (!trainingTopic) {

        alert(
            "Training Topic is not configured."
        );

        return;

    }


    // ==================================================
    // CREATE ATTENDANCE DATA
    // ==================================================

    const now =
    new Date();


    const today =
    now.toLocaleDateString();


    const attendanceKey =

    (

        student.id ||

        student.studentNumber

    )

    +

    "_" +

    trainingDay +

    "_" +

    today;


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


        trainingDay:

        trainingDay,


        trainingTopic:

        trainingTopic,


        date:

        today,


        time:

        now.toLocaleTimeString(),


        status:

        document.getElementById(
            "status"
        ).value,


        address:

        document.getElementById(
            "address"
        ).textContent,


        latitude:

        latitude,


        longitude:

        longitude,


        gpsAccuracy:

        gpsAccuracy,


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
    // SAVE LOCAL BACKUP
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


        const result =
        JSON.parse(
            text
        );


        if (
            result.success
        ) {

            alert(

                "✅ Attendance Submitted Successfully!"

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


    catch(error) {

        console.error(
            "Submission Error:",
            error
        );


        alert(

            "❌ Failed to connect to Google Sheets.\n\n" +

            error.message

        );

    }

}
