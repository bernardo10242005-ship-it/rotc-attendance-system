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
// GET LOGGED IN STUDENT
// ======================================================

try {

    student =
        JSON.parse(
            localStorage.getItem("student")
        );

} catch (error) {

    student = null;

}


if (!student) {

    window.location.href =
        "login.html";

}


// ======================================================
// DISPLAY STUDENT INFORMATION
// ======================================================

function displayStudentInformation() {

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
            (student.id || "");

    }


    if (flight) {

        flight.textContent =
            "Flight: " +
            (student.flight || "");

    }

}


displayStudentInformation();


// ======================================================
// LOAD SETTINGS FROM GOOGLE APPS SCRIPT
// ======================================================

async function loadSettings() {

    const gpsStatus =
        document.getElementById(
            "gpsStatus"
        );


    if (gpsStatus) {

        gpsStatus.textContent =
            "⏳ Loading attendance settings...";

    }


    try {

        console.log(
            "Connecting to Apps Script..."
        );


        const response =
            await fetch(
                APPS_SCRIPT_URL +
                "?t=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store",
                    redirect: "follow"
                }
            );


        console.log(
            "Apps Script response:",
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
            "Apps Script raw response:",
            text
        );


        if (!text) {

            throw new Error(
                "Apps Script returned an empty response."
            );

        }


        let data;


        try {

            data =
                JSON.parse(text);

        } catch (error) {

            throw new Error(
                "The response from Apps Script is not valid JSON."
            );

        }


        console.log(
            "Settings received:",
            data
        );


        // Check Apps Script error

        if (
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Apps Script returned an error."
            );

        }


        // Check required settings

        if (
            data.latitude === undefined ||
            data.longitude === undefined
        ) {

            throw new Error(
                "Latitude or longitude is missing from the attendance settings."
            );

        }


        if (
            data.status === undefined
        ) {

            throw new Error(
                "Attendance status is missing from the settings."
            );

        }


        // Save settings

        settings =
            data;


        // Convert coordinates

        TRAINING_LAT =
            parseFloat(
                settings.latitude
            );


        TRAINING_LNG =
            parseFloat(
                settings.longitude
            );


        // Convert radius

        ALLOWED_RADIUS =
            parseFloat(
                settings.radius
            ) || 200;


        // Validate coordinates

        if (
            isNaN(TRAINING_LAT) ||
            isNaN(TRAINING_LNG)
        ) {

            throw new Error(
                "Training ground coordinates are invalid."
            );

        }


        console.log(
            "Attendance settings loaded successfully."
        );


        console.log(
            "Latitude:",
            TRAINING_LAT
        );


        console.log(
            "Longitude:",
            TRAINING_LNG
        );


        console.log(
            "Radius:",
            ALLOWED_RADIUS
        );


        // Start system

        initializeAttendance();


    } catch (error) {


        console.error(
            "Attendance settings error:",
            error
        );


        if (gpsStatus) {

            gpsStatus.textContent =
                "🔴 Unable to load attendance settings.";

        }


        alert(

            "❌ Unable to load attendance settings.\n\n" +

            "Error: " +
            error.message +

            "\n\nPlease check your internet connection or contact the administrator."

        );

    }

}


// ======================================================
// INITIALIZE ATTENDANCE
// ======================================================

function initializeAttendance() {

    console.log(
        "Initializing ROTC attendance system..."
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


    const dateElement =
        document.getElementById(
            "date"
        );


    const timeElement =
        document.getElementById(
            "time"
        );


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
        document.getElementById(
            "gpsStatus"
        );


    if (
        !navigator.geolocation
    ) {

        if (gpsStatus) {

            gpsStatus.textContent =
                "🔴 GPS NOT SUPPORTED";

        }

        alert(
            "Your browser does not support GPS location."
        );

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


            // Calculate distance

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


            // Check allowed radius

            const validationStatus =
                document.getElementById(
                    "validationStatus"
                );


            if (
                validationStatus
            ) {


                if (
                    distanceMeters <=
                    ALLOWED_RADIUS
                ) {

                    validationStatus.innerHTML =
                        "✅ Inside Allowed Area";

                } else {

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
                "GPS Error:",
                error
            );


            if (gpsStatus) {

                gpsStatus.textContent =
                    "🔴 GPS NOT AVAILABLE";

            }


            alert(

                "Unable to access your location.\n\n" +

                "Please make sure Location/GPS is turned ON and allow location permission for this website."

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
// DISTANCE FORMULA
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
                1 -
                a
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


        const addressElement =
            document.getElementById(
                "address"
            );


        if (addressElement) {

            addressElement.textContent =

                data.display_name ||

                "Address unavailable.";

        }


    } catch (error) {


        console.error(
            "Address Error:",
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

            video: true

        })

        .then(

            function(stream) {


                video.srcObject =
                    stream;


                console.log(
                    "Camera started."
                );

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
// SIGNATURE SETUP
// ======================================================

function setupSignature() {


    const signature =
        document.getElementById(
            "signature"
        );


    if (!signature) {

        console.error(
            "Signature canvas not found."
        );

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
            passive: false
        }

    );


    signature.addEventListener(

        "touchmove",

        drawTouch,

        {
            passive: false
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


    const signCtx =
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


    signCtx.beginPath();


    signCtx.moveTo(

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


    const signCtx =
        signature.getContext(
            "2d"
        );


    const pos =
        getMousePos(
            e
        );


    signCtx.lineTo(

        pos.x,

        pos.y

    );


    signCtx.stroke();

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


    const signCtx =
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


    signCtx.beginPath();


    signCtx.moveTo(

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


    const signCtx =
        signature.getContext(
            "2d"
        );


    const pos =
        getTouchPos(
            e
        );


    signCtx.lineTo(

        pos.x,

        pos.y

    );


    signCtx.stroke();

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


        const signCtx =
            signature.getContext(
                "2d"
            );


        signCtx.beginPath();

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
// VALIDATE ATTENDANCE TIME
// ======================================================

function attendanceOpen() {


    if (!settings) {

        return false;

    }


    const now =
        new Date();


    const current =

        now.getHours() *
        60

        +

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

        parseInt(
            start[0],
            10
        ) *

        60

        +

        parseInt(
            start[1],
            10
        );


    const endMinutes =

        parseInt(
            end[0],
            10
        ) *

        60

        +

        parseInt(
            end[1],
            10
        );


    return (

        current >=
        startMinutes

        &&

        current <=
        endMinutes

    );

}


// ======================================================
// SUBMIT ATTENDANCE
// ======================================================

async function submitAttendance() {


    if (!settings) {

        alert(
            "Attendance settings are still loading. Please wait."
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


    if (
        !photoTaken
    ) {

        alert(
            "Please capture your selfie."
        );

        return;

    }


    if (
        !signed
    ) {

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


        } else {


            alert(

                "❌ " +

                (

                    result.message ||

                    "Attendance submission failed."

                )

            );

        }


    } catch (error) {


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


// ======================================================
// START SYSTEM
// ======================================================

// Settings are loaded first.
// GPS and camera start only after settings load.

loadSettings();
