// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// attendance.js
// ======================================================

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzmqVoMihTcRZkRLhwgmCWK9zSv1bgP6W2YL0aEUio2bX340vPCdpVQ6uJD3lGNq3J_4A/exec";


let student = null;

let settings = null;

let TRAINING_LAT = 0;

let TRAINING_LNG = 0;

let ALLOWED_RADIUS = 200;

let latitude = null;

let longitude = null;

let gpsAccuracy = 999999;

let distanceMeters = 999999;

let photoTaken = false;

let drawing = false;

let signed = false;

let gpsWatchId = null;


// ======================================================
// PAGE START
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    function() {

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
            ) ||

            isNaN(
                TRAINING_LNG
            )
        ) {

            throw new Error(
                "Invalid training location."
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


        // ==================================================
        // DISPLAY TRAINING DAY
        // ==================================================

        const trainingDay =
        document.getElementById(
            "trainingDay"
        );


        if (trainingDay) {

            trainingDay.textContent =

            settings.trainingDay ||

            "Training Day";

        }


        // ==================================================
        // DISPLAY TRAINING TOPIC
        // ==================================================

        const trainingTopic =
        document.getElementById(
            "trainingTopic"
        );


        if (trainingTopic) {

            trainingTopic.textContent =

            settings.trainingTopic ||

            "No topic specified.";

        }


        const gpsStatus =
        document.getElementById(
            "gpsStatus"
        );


        if (gpsStatus) {

            gpsStatus.textContent =
            "🟡 Settings loaded. Detecting GPS...";

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
            "🔴 Unable to load settings.";

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
// CLOCK
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
// IMPROVED GPS
// ======================================================

function startGPS() {

    if (
        !navigator.geolocation
    ) {

        alert(
            "GPS is not supported."
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


    gpsWatchId =

    navigator.geolocation.watchPosition(

        function(position) {

            const newAccuracy =
            position.coords.accuracy;


            console.log(

                "GPS reading:",

                position.coords.latitude,

                position.coords.longitude,

                "Accuracy:",

                newAccuracy

            );


            // ==================================================
            // IGNORE VERY POOR GPS READINGS
            // ==================================================

            if (
                newAccuracy > 100
            ) {

                if (gpsStatus) {

                    gpsStatus.textContent =

                    "🟡 GPS accuracy is poor (" +

                    newAccuracy.toFixed(1) +

                    "m). Searching for a better signal...";

                }

                return;

            }


            // ==================================================
            // SAVE BEST READING
            // ==================================================

            if (
                newAccuracy <=
                gpsAccuracy
            ) {

                gpsAccuracy =
                newAccuracy;


                latitude =
                position.coords.latitude;


                longitude =
                position.coords.longitude;


                distanceMeters =
                calculateDistance(

                    latitude,

                    longitude,

                    TRAINING_LAT,

                    TRAINING_LNG

                );


                updateGPSDisplay();

            }

        },


        function(error) {

            console.error(
                "GPS Error:",
                error
            );


            if (gpsStatus) {

                gpsStatus.textContent =
                "🔴 GPS NOT AVAILABLE";

            }

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
// UPDATE GPS DISPLAY
// ======================================================

function updateGPSDisplay() {

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


    const distanceElement =
    document.getElementById(
        "distance"
    );


    const validationStatus =
    document.getElementById(
        "validationStatus"
    );


    if (latitudeElement) {

        latitudeElement.textContent =
        latitude.toFixed(6);

    }


    if (longitudeElement) {

        longitudeElement.textContent =
        longitude.toFixed(6);

    }


    if (distanceElement) {

        distanceElement.textContent =

        distanceMeters.toFixed(1) +

        " meters";

    }


    if (gpsStatus) {

        gpsStatus.textContent =

        "🟢 GPS VERIFIED — Accuracy: " +

        gpsAccuracy.toFixed(1) +

        "m";

    }


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


    getAddress(

        latitude,

        longitude

    );

}


// ======================================================
// DISTANCE
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
    ) ** 2

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
    ) ** 2;


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
// ADDRESS
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
                "Unable to access camera."
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


    signature.addEventListener(

        "mousedown",

        function(e) {

            drawing =
            true;

            signed =
            true;

            const rect =
            signature.getBoundingClientRect();


            ctx.beginPath();


            ctx.moveTo(

                e.clientX -
                rect.left,

                e.clientY -
                rect.top

            );

        }

    );


    signature.addEventListener(

        "mousemove",

        function(e) {

            if (!drawing) {

                return;

            }


            const rect =
            signature.getBoundingClientRect();


            ctx.lineTo(

                e.clientX -
                rect.left,

                e.clientY -
                rect.top

            );


            ctx.stroke();

        }

    );


    signature.addEventListener(

        "mouseup",

        stopDrawing

    );


    signature.addEventListener(

        "mouseleave",

        stopDrawing

    );

}


// ======================================================
// STOP DRAWING
// ======================================================

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


    signed =
    false;

}


// ======================================================
// ATTENDANCE TIME
// ======================================================

function attendanceOpen() {

    if (!settings) {

        return false;

    }


    const now =
    new Date();


    const currentMinutes =

    now.getHours() *
    60 +

    now.getMinutes();


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
        gpsAccuracy > 100
    ) {

        alert(

            "GPS accuracy is currently too low.\n\n" +

            "Please wait a few seconds for a better GPS signal."

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

        settings.trainingDay ||

        "",


        topic:

        settings.trainingTopic ||

        "",


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

        gpsAccuracy.toFixed(2),


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

        "_selfie.png",


        signatureFileName:

        (

            student.id ||

            student.studentNumber ||

            "student"

        )

        +

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

            alert(

                "✅ Attendance Submitted Successfully!\n\n" +

                settings.trainingDay +

                "\n" +

                settings.trainingTopic

            );


            window.location.href =
            "dashboard.html";

        }

        else {

            alert(

                "❌ Attendance submission failed.\n\n" +

                result.message

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
