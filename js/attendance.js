// ======================================================
// ROTC ATTENDANCE SYSTEM
// LOAD STUDENT
// ======================================================

const student = JSON.parse(localStorage.getItem("student"));

if (!student) {
    window.location.href = "login.html";
}

// Display student information
document.getElementById("cadetName").textContent = student.name;

document.getElementById("studentNumber").textContent =
    "Student Number: " + student.id;

document.getElementById("flight").textContent =
    "Flight: " + student.flight;


// ======================================================
// GOOGLE APPS SCRIPT URL
// ======================================================

const SETTINGS_URL =
"https://script.google.com/macros/s/AKfycbzrKmu79aGyyyVSjZuff9ZtNublgufjvzu6vc_UG0pWyIZCOM6ArqC7gHsFNIbjecvGRQ/exec";


// ======================================================
// GLOBAL SETTINGS
// ======================================================

let settings = null;

let TRAINING_LAT = 0;
let TRAINING_LNG = 0;
let ALLOWED_RADIUS = 200;


// ======================================================
// LOAD SETTINGS
// ======================================================

async function loadSettings() {

    console.log("Loading attendance settings...");

    try {

        const response = await fetch(
            SETTINGS_URL + "?t=" + Date.now(),
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

        const data = await response.json();

        console.log("Google Apps Script Response:", data);

        if (!data || !data.latitude || !data.longitude) {

            throw new Error(
                "Invalid settings received from Google Sheets."
            );

        }

        settings = data;

        TRAINING_LAT =
            parseFloat(settings.latitude);

        TRAINING_LNG =
            parseFloat(settings.longitude);

        ALLOWED_RADIUS =
            parseFloat(settings.radius) || 200;

        console.log(
            "Settings successfully loaded:",
            settings
        );

        console.log(
            "Training Location:",
            TRAINING_LAT,
            TRAINING_LNG
        );

        console.log(
            "Allowed Radius:",
            ALLOWED_RADIUS
        );

        return true;

    }

    catch (error) {

        console.error(
            "SETTINGS ERROR:",
            error
        );

        alert(
            "❌ Unable to load attendance settings.\n\n" +
            "Please check your internet connection or contact the administrator."
        );

        return false;

    }

}


// ======================================================
// START ATTENDANCE SYSTEM
// ======================================================

async function startAttendanceSystem() {

    const settingsLoaded =
        await loadSettings();

    if (!settingsLoaded) {

        return;

    }

    console.log(
        "Attendance system is ready."
    );

    // Start GPS only AFTER settings are loaded
    startGPS();

}


// ======================================================
// GPS
// ======================================================

let latitude = null;

let longitude = null;

let distanceMeters = 999999;


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


            if (
                distanceMeters
                <= ALLOWED_RADIUS
            ) {

                document.getElementById(
                    "validationStatus"
                ).innerHTML =
                    "✅ Inside Allowed Area";

            }

            else {

                document.getElementById(
                    "validationStatus"
                ).innerHTML =
                    "❌ Outside "
                    + ALLOWED_RADIUS
                    + " Meter Radius";

            }


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
// DISTANCE CALCULATION
// ======================================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1)
        * Math.PI / 180;

    const dLon =
        (lon2 - lon1)
        * Math.PI / 180;


    const a =

        Math.sin(dLat / 2)
        * Math.sin(dLat / 2)

        +

        Math.cos(
            lat1 * Math.PI / 180
        )

        *

        Math.cos(
            lat2 * Math.PI / 180
        )

        *

        Math.sin(dLon / 2)
        * Math.sin(dLon / 2);


    const c =
        2 * Math.atan2(

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

        `https://nominatim.openstreetmap.org/reverse` +
        `?format=jsonv2` +
        `&lat=${lat}` +
        `&lon=${lng}`;


        const response =
            await fetch(url);


        const data =
            await response.json();


        document.getElementById(
            "address"
        ).textContent =

            data.display_name
            || "Address unavailable.";

    }

    catch (error) {

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
// START SYSTEM
// ======================================================

startAttendanceSystem();
