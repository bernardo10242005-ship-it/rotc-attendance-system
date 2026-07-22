// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// attendance.js
// ======================================================


// ======================================================
// GET LOGGED IN STUDENT
// ======================================================

const student =
    JSON.parse(localStorage.getItem("student"));

if (!student) {

    window.location.href = "login.html";

} else {

    document.getElementById("cadetName").textContent =
        student.name;

    document.getElementById("studentNumber").textContent =
        "Student Number: " + student.id;

    document.getElementById("flight").textContent =
        "Flight: " + student.flight;

}


// ======================================================
// GOOGLE APPS SCRIPT SETTINGS URL
// ======================================================

const SETTINGS_URL =
"https://script.google.com/macros/s/AKfycbzrKmu79aGyyyVSjZuff9ZtNublgufjvzu6vc_UG0pWyIZCOM6ArqC7gHsFNIbjecvGRQ/exec";


// ======================================================
// GOOGLE APPS SCRIPT ATTENDANCE SUBMISSION URL
// ======================================================

const SUBMIT_URL =
"https://script.google.com/macros/s/AKfycbwYYNTlVOqDT7F8QeAZrAJE1AR29NnNJvOZCak8S1FgJKoedQI3vwIv9TULBu8oy0FPzg/exec";


// ======================================================
// SETTINGS VARIABLES
// ======================================================

let settings = null;

let TRAINING_LAT = 0;

let TRAINING_LNG = 0;

let ALLOWED_RADIUS = 200;

let settingsLoaded = false;


// ======================================================
// GPS VARIABLES
// ======================================================

let latitude = null;

let longitude = null;

let distanceMeters = 999999;


// ======================================================
// LOAD ADMIN SETTINGS FROM GOOGLE SHEETS
// ======================================================

async function loadSettings() {

    try {

        console.log(
            "Loading attendance settings..."
        );


        const response = await fetch(

            SETTINGS_URL +
            "?t=" +
            Date.now(),

            {

                method: "GET",

                cache: "no-store"

            }

        );


        // Check server response

        if (!response.ok) {

            throw new Error(

                "HTTP Error: " +
                response.status

            );

        }


        // Convert response to JSON

        const data =
            await response.json();


        console.log(

            "Settings received:",

            data

        );


        // Check if settings exist

        if (

            !data ||

            data.latitude === undefined ||

            data.longitude === undefined ||

            data.radius === undefined

        ) {

            throw new Error(

                "Invalid settings returned by Google Apps Script."

            );

        }


        // Save settings

        settings = data;


        // Convert values to numbers

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
            ) || 200;


        // Check if coordinates are valid

        if (

            isNaN(TRAINING_LAT) ||

            isNaN(TRAINING_LNG)

        ) {

            throw new Error(

                "Invalid training ground coordinates."

            );

        }


        settingsLoaded = true;


        console.log(

            "Settings loaded successfully."

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


        // Start GPS after settings load

        startGPS();


    }

    catch (error) {


        console.error(

            "SETTINGS ERROR:",

            error

        );


        alert(

            "❌ Unable to load attendance settings.\n\n" +

            "Please check your internet connection " +

            "or contact the administrator."

        );


        const gpsStatus =
            document.getElementById(
                "gpsStatus"
            );


        if (gpsStatus) {

            gpsStatus.textContent =

                "🔴 Unable to load settings.";

        }

    }

}


// ======================================================
// START LOADING SETTINGS
// ======================================================

loadSettings();


// ======================================================
// DATE & TIME
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


updateClock();


setInterval(

    updateClock,

    1000

);


// ======================================================
// DISTANCE FORMULA
// HAVERSINE FORMULA
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

            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;


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


    }

    catch (error) {


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
// START GPS
// THIS ONLY RUNS AFTER SETTINGS ARE LOADED
// ======================================================

function startGPS() {


    if (!settingsLoaded) {


        console.log(

            "Waiting for settings..."

        );


        return;

    }


    if (

        !navigator.geolocation

    ) {


        const gpsStatus =

            document.getElementById(

                "gpsStatus"

            );


        if (gpsStatus) {

            gpsStatus.textContent =

                "🔴 GPS NOT AVAILABLE";

        }


        return;

    }


    const gpsStatus =

        document.getElementById(

            "gpsStatus"

        );


    if (gpsStatus) {

        gpsStatus.textContent =

            "📍 Detecting your location...";

    }


    navigator.geolocation.getCurrentPosition(


        // ==========================
        // SUCCESS
        // ==========================

        function(position) {


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


            if (latitudeElement) {

                latitudeElement.textContent =

                    latitude.toFixed(6);

            }


            const longitudeElement =

                document.getElementById(

                    "longitude"

                );


            if (longitudeElement) {

                longitudeElement.textContent =

                    longitude.toFixed(6);

            }


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


            console.log(

                "Distance:",

                distanceMeters

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


        },


        // ==========================
        // ERROR
        // ==========================

        function(error) {


            console.error(

                "GPS ERROR:",

                error

            );


            if (gpsStatus) {

                gpsStatus.textContent =

                    "🔴 GPS NOT AVAILABLE";

            }

        },


        // ==========================
        // GPS OPTIONS
        // ==========================

        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

        }

    );

}


// ======================================================
// CAMERA
// ======================================================

const video =

    document.getElementById(

        "video"

    );


let photoTaken = false;


if (

    navigator.mediaDevices &&

    navigator.mediaDevices.getUserMedia

) {


    navigator.mediaDevices

        .getUserMedia({

            video: true

        })


        .then(

            stream => {


                if (video) {

                    video.srcObject =

                        stream;

                }

            }

        )


        .catch(

            error => {


                console.error(

                    "CAMERA ERROR:",

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


    if (!canvas || !video) {

        alert(

            "Camera is not available."

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


    photoTaken = true;


    console.log(

        "Selfie captured."

    );

}


// ======================================================
// SIGNATURE
// ======================================================

const signature =

    document.getElementById(

        "signature"

    );


const signCtx =

    signature.getContext(

        "2d"

    );


let drawing = false;

let signed = false;


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


// ======================================================
// DESKTOP SIGNATURE
// ======================================================

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


// ======================================================
// MOBILE SIGNATURE
// ======================================================

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


// ======================================================
// MOUSE POSITION
// ======================================================

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


// ======================================================
// TOUCH POSITION
// ======================================================

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


// ======================================================
// START MOUSE
// ======================================================

function startMouse(e) {


    drawing = true;

    signed = true;


    const pos =

        getMousePos(e);


    signCtx.beginPath();


    signCtx.moveTo(

        pos.x,

        pos.y

    );

}


// ======================================================
// DRAW MOUSE
// ======================================================

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


// ======================================================
// START TOUCH
// ======================================================

function startTouch(e) {


    e.preventDefault();


    drawing = true;

    signed = true;


    const pos =

        getTouchPos(e);


    signCtx.beginPath();


    signCtx.moveTo(

        pos.x,

        pos.y

    );

}


// ======================================================
// DRAW TOUCH
// ======================================================

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


// ======================================================
// STOP DRAWING
// ======================================================

function stopDrawing() {


    drawing = false;


    signCtx.beginPath();

}


// ======================================================
// CLEAR SIGNATURE
// ======================================================

function clearSignature() {


    signCtx.fillStyle =

        "white";


    signCtx.fillRect(

        0,

        0,

        signature.width,

        signature.height

    );


    signed = false;


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


    if (

        !settings.startTime ||

        !settings.endTime

    ) {

        return false;

    }


    const now =

        new Date();


    const current =

        now.getHours() *

        60 +

        now.getMinutes();


    const start =

        settings.startTime

            .toString()

            .split(":");


    const end =

        settings.endTime

            .toString()

            .split(":");


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


    // ==========================
    // CHECK SETTINGS
    // ==========================

    if (!settingsLoaded || !settings) {


        alert(

            "⏳ Attendance settings are still loading.\n\n" +

            "Please wait a moment and try again."

        );


        return;

    }


    // ==========================
    // CHECK STATUS
    // ==========================

    if (

        settings.status !==

        "OPEN"

    ) {


        alert(

            "Attendance is currently CLOSED."

        );


        return;

    }


    // ==========================
    // CHECK TIME
    // ==========================

    if (!attendanceOpen()) {


        alert(

            "Attendance is outside the allowed time."

        );


        return;

    }


    // ==========================
    // CHECK GPS
    // ==========================

    if (

        latitude === null

    ) {


        alert(

            "GPS not detected."

        );


        return;

    }


    // ==========================
    // CHECK DISTANCE
    // ==========================

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


    // ==========================
    // CHECK PHOTO
    // ==========================

    if (!photoTaken) {


        alert(

            "Please capture your selfie."

        );


        return;

    }


    // ==========================
    // CHECK SIGNATURE
    // ==========================

    if (!signed) {


        alert(

            "Please provide your signature."

        );


        return;

    }


    // ==========================
    // DATE
    // ==========================

    const today =

        new Date()

            .toLocaleDateString();


    // ==========================
    // ATTENDANCE KEY
    // ==========================

    const attendanceKey =

        student.id +

        "_" +

        today;


    // ==========================
    // ATTENDANCE DATA
    // ==========================

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

            new Date()

                .toLocaleTimeString(),


        status:

            document

                .getElementById(

                    "status"

                )

                .value,


        latitude:

            latitude,


        longitude:

            longitude,


        distance:

            distanceMeters

                .toFixed(2),


        address:

            document

                .getElementById(

                    "address"

                )

                .textContent,


        photo:

            document

                .getElementById(

                    "photo"

                )

                .toDataURL(

                    "image/png"

                ),


        signature:

            signature

                .toDataURL(

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


    // ==========================
    // SAVE LOCALLY
    // ==========================

    localStorage.setItem(

        attendanceKey,

        JSON.stringify(

            attendance

        )

    );


    // ==========================
    // SUBMIT TO GOOGLE APPS SCRIPT
    // ==========================

    try {


        const response =

            await fetch(

                SUBMIT_URL,

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


        // ==========================
        // SUCCESS
        // ==========================

        if (

            result.success

        ) {


            alert(

                "✅ Attendance Submitted Successfully!"

            );


            window.location.href =

                "dashboard.html";


        }


        // ==========================
        // ERROR FROM APPS SCRIPT
        // ==========================

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

    catch (error) {


        console.error(

            "SUBMISSION ERROR:",

            error

        );


        alert(

            "❌ Failed to connect to Google Sheets."

        );

    }

}
