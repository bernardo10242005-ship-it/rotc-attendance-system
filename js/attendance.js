// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// attendance.js
//
// ONE ATTENDANCE SUBMISSION PER STUDENT PER TRAINING DAY
// PER CALENDAR DAY
//
// IMPROVED VERSION
// - Responsive signature canvas coordinates
// - Responsive camera capture
// - Mobile touch support
// - GPS verification
// - Google Apps Script submission
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

let cameraStream = null;


// ======================================================
// PAGE START
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "ROTC Attendance System Starting..."
        );


        // ==================================================
        // LOAD LOGGED-IN STUDENT
        // ==================================================

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


        // ==================================================
        // CHECK STUDENT LOGIN
        // ==================================================

        if (!student) {

            window.location.href =
            "login.html";

            return;

        }


        // ==================================================
        // DISPLAY STUDENT INFORMATION
        // ==================================================

        displayStudent();


        // ==================================================
        // SHOW LOADING STATUS
        // ==================================================

        const gpsStatus =
        document.getElementById(
            "gpsStatus"
        );


        if (gpsStatus) {

            gpsStatus.textContent =
            "⏳ Loading attendance settings...";

        }


        // ==================================================
        // LOAD SETTINGS
        // ==================================================

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
            student.studentNumber ||
            student.id ||
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


        if (!response.ok) {

            throw new Error(

                "Server returned HTTP " +
                response.status

            );

        }


        const text =
        await response.text();


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


        // ==================================================
        // CHECK BACKEND ERROR
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
        // SAVE SETTINGS
        // ==================================================

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


        // ==================================================
        // VALIDATE LATITUDE
        // ==================================================

        if (
            isNaN(
                TRAINING_LAT
            )
        ) {

            throw new Error(
                "Invalid training latitude."
            );

        }


        // ==================================================
        // VALIDATE LONGITUDE
        // ==================================================

        if (
            isNaN(
                TRAINING_LNG
            )
        ) {

            throw new Error(
                "Invalid training longitude."
            );

        }


        // ==================================================
        // DEFAULT RADIUS
        // ==================================================

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
        // SETTINGS LOADED
        // ==================================================

        if (gpsStatusExists()) {

            document.getElementById(
                "gpsStatus"
            ).textContent =
            "🟡 Attendance settings loaded. Detecting GPS...";

        }


        // ==================================================
        // START ATTENDANCE SYSTEM
        // ==================================================

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
// GPS STATUS HELPER
// ======================================================

function gpsStatusExists() {

    return !!document.getElementById(
        "gpsStatus"
    );

}


// ======================================================
// INITIALIZE ATTENDANCE SYSTEM
// ======================================================

function initializeAttendance() {

    console.log(
        "Initializing attendance system..."
    );


    // ==================================================
    // START DATE AND TIME
    // ==================================================

    updateClock();


    setInterval(

        updateClock,

        1000

    );


    // ==================================================
    // START GPS
    // ==================================================

    startGPS();


    // ==================================================
    // START CAMERA
    // ==================================================

    startCamera();


    // ==================================================
    // SETUP SIGNATURE
    // ==================================================

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
        now.toLocaleDateString(
            "en-PH"
        );

    }


    if (time) {

        time.value =
        now.toLocaleTimeString(
            "en-PH"
        );

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

async function startCamera() {

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


    try {

        cameraStream =
        await navigator.mediaDevices.getUserMedia({

            video: {

                facingMode:
                "user"

            },

            audio:
            false

        });


        video.srcObject =
        cameraStream;


        await video.play();


        console.log(
            "Camera started."
        );

    }


    catch (error) {

        console.error(
            "Camera Error:",
            error
        );


        alert(

            "Unable to access camera.\n\n" +

            "Please allow camera permission for this website."

        );

    }

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


    if (
        video.readyState <
        2
    ) {

        alert(
            "Camera is still loading. Please wait a moment."
        );

        return;

    }


    const ctx =
    canvas.getContext(
        "2d"
    );


    // ==================================================
    // GET REAL CAMERA DIMENSIONS
    // ==================================================

    const videoWidth =
    video.videoWidth;


    const videoHeight =
    video.videoHeight;


    if (
        !videoWidth ||
        !videoHeight
    ) {

        alert(
            "Camera image is not ready yet."
        );

        return;

    }


    // ==================================================
    // KEEP CANVAS ASPECT RATIO
    // ==================================================

    canvas.width =
    videoWidth;


    canvas.height =
    videoHeight;


    // ==================================================
    // MIRROR SELFIE
    // ==================================================

    ctx.save();


    ctx.translate(

        canvas.width,

        0

    );


    ctx.scale(

        -1,

        1

    );


    ctx.drawImage(

        video,

        0,

        0,

        canvas.width,

        canvas.height

    );


    ctx.restore();


    photoTaken =
    true;


    console.log(
        "Photo captured:",
        canvas.width,
        "x",
        canvas.height
    );


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


    // ==================================================
    // SET CANVAS BACKGROUND
    // ==================================================

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


    signCtx.lineJoin =
    "round";


    // ==================================================
    // MOUSE EVENTS
    // ==================================================

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


    // ==================================================
    // TOUCH EVENTS
    // ==================================================

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

        stopDrawing,

        {

            passive:
            false

        }

    );


    signature.addEventListener(

        "touchcancel",

        stopDrawing,

        {

            passive:
            false

        }

    );

}


// ======================================================
// GET RESPONSIVE CANVAS POSITION
// FIXES OFFSET ON DIFFERENT PHONE SCREENS
// ======================================================

function getCanvasCoordinates(

    clientX,

    clientY

) {

    const signature =
    document.getElementById(
        "signature"
    );


    const rect =
    signature.getBoundingClientRect();


    const scaleX =

    signature.width /
    rect.width;


    const scaleY =

    signature.height /
    rect.height;


    return {

        x:

        (

            clientX -
            rect.left

        ) *

        scaleX,


        y:

        (

            clientY -
            rect.top

        ) *

        scaleY

    };

}


// ======================================================
// MOUSE POSITION
// ======================================================

function getMousePos(e) {

    return getCanvasCoordinates(

        e.clientX,

        e.clientY

    );

}


// ======================================================
// START MOUSE DRAWING
// ======================================================

function startMouse(e) {

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
    getMousePos(
        e
    );


    ctx.beginPath();


    ctx.moveTo(

        pos.x,

        pos.y

    );

}


// ======================================================
// DRAW WITH MOUSE
// ======================================================

function drawMouse(e) {

    if (
        !drawing
    ) {

        return;

    }


    e.preventDefault();


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
// TOUCH POSITION
// ======================================================

function getTouchPos(e) {

    const touch =

    e.touches[0];


    if (!touch) {

        return {

            x:
            0,

            y:
            0

        };

    }


    return getCanvasCoordinates(

        touch.clientX,

        touch.clientY

    );

}


// ======================================================
// START TOUCH DRAWING
// ======================================================

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


// ======================================================
// DRAW WITH TOUCH
// ======================================================

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


    ctx.lineJoin =
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
// GET CURRENT TRAINING DAY
// ======================================================

function getTrainingDay() {

    return (

        settings.trainingDay ||

        ""

    );

}


// ======================================================
// GET STUDENT NUMBER
// ======================================================

function getStudentNumber() {

    return (

        student.studentNumber ||

        student.id ||

        ""

    ).toString().trim();

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
    // GET TRAINING INFORMATION
    // ==================================================

    const trainingDay =
    getTrainingDay();


    const trainingTopic =

    settings.trainingTopic ||

    settings.topic ||

    "";


    // ==================================================
    // CHECK TRAINING DAY
    // ==================================================

    if (!trainingDay) {

        alert(

            "❌ Training Day is not configured.\n\n" +

            "Please contact the administrator."

        );

        return;

    }


    // ==================================================
    // CHECK STUDENT NUMBER
    // ==================================================

    const studentNumber =
    getStudentNumber();


    if (!studentNumber) {

        alert(

            "❌ Student number is missing.\n\n" +

            "Please log in again."

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
    now.toLocaleDateString(
        "en-PH"
    );


    // ==================================================
    // CREATE ATTENDANCE KEY
    // ==================================================

    const attendanceKey =

    "attendance_" +

    studentNumber +

    "_" +

    trainingDay +

    "_" +

    today;


    // ==================================================
    // CHECK LOCAL DUPLICATE
    // ==================================================

    if (

        localStorage.getItem(
            attendanceKey
        )

    ) {

        alert(

            "⚠️ You have already submitted attendance for " +

            trainingDay +

            " today."

        );

        return;

    }


    // ==================================================
    // GET PHOTO CANVAS
    // ==================================================

    const photoCanvas =
    document.getElementById(
        "photo"
    );


    // ==================================================
    // GET SIGNATURE CANVAS
    // ==================================================

    const signatureCanvas =
    document.getElementById(
        "signature"
    );


    if (
        !photoCanvas ||
        !signatureCanvas
    ) {

        alert(
            "Photo or signature canvas was not found."
        );

        return;

    }


    // ==================================================
    // CREATE ATTENDANCE DATA
    // ==================================================

    const attendance = {

        studentNumber:

        studentNumber,


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


        topic:

        trainingTopic,


        date:

        today,


        time:

        now.toLocaleTimeString(
            "en-PH"
        ),


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

        photoCanvas.toDataURL(
            "image/png"
        ),


        signature:

        signatureCanvas.toDataURL(
            "image/png"
        ),


        photoFileName:

        studentNumber +

        "_" +

        trainingDay.replace(

            /\s+/g,

            "_"

        ) +

        "_" +

        today.replace(

            /\//g,

            "-"

        ) +

        "_selfie.png",


        signatureFileName:

        studentNumber +

        "_" +

        trainingDay.replace(

            /\s+/g,

            "_"

        ) +

        "_" +

        today.replace(

            /\//g,

            "-"

        ) +

        "_signature.png"

    };


    // ==================================================
    // SUBMIT TO GOOGLE APPS SCRIPT
    // ==================================================

    try {

        console.log(
            "Submitting attendance..."
        );


        console.log(
            "Student Number:",
            studentNumber
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


        // ==================================================
        // SERVER ACCEPTED ATTENDANCE
        // ==================================================

        if (
            result.success
        ) {

            // Save local duplicate marker
            // ONLY AFTER server accepts it.

            localStorage.setItem(

                attendanceKey,

                JSON.stringify({

                    studentNumber:

                    studentNumber,

                    trainingDay:

                    trainingDay,

                    date:

                    today,

                    submittedAt:

                    new Date().toISOString()

                })

            );


            alert(

                "✅ Attendance Submitted Successfully!\n\n" +

                "Training Day: " +

                trainingDay

            );


            // Stop camera after successful submission

            stopCamera();


            window.location.href =
            "dashboard.html";

        }


        // ==================================================
        // SERVER REJECTED ATTENDANCE
        // ==================================================

        else {

            if (

                result.code ===
                "ALREADY_SUBMITTED"

            ) {

                alert(

                    "⚠️ Attendance Already Submitted\n\n" +

                    "You have already submitted attendance for " +

                    trainingDay +

                    " today.\n\n" +

                    "You cannot submit attendance again today."

                );

                return;

            }


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


// ======================================================
// STOP CAMERA
// ======================================================

function stopCamera() {

    if (
        cameraStream
    ) {

        cameraStream
        .getTracks()
        .forEach(

            function (track) {

                track.stop();

            }

        );


        cameraStream =
        null;

    }


    const video =
    document.getElementById(
        "video"
    );


    if (video) {

        video.srcObject =
        null;

    }

}
