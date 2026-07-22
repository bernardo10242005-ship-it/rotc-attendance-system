// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// ADMIN.JS
// ======================================================


// ======================================================
// GOOGLE APPS SCRIPT WEB APP URL
// ======================================================

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzmqVoMihTcRZkRLhwgmCWK9zSv1bgP6W2YL0aEUio2bX340vPCdpVQ6uJD3lGNq3J_4A/exec";


// ======================================================
// GOOGLE SHEET
// ======================================================

const GOOGLE_SHEET_URL =
"https://docs.google.com/spreadsheets/d/1y0PmS9GcmH8WcPNxundYdl7BWgYa_gl_KCp-dUqNZzA/edit";


// ======================================================
// ADMIN LOGIN
// ======================================================

function loginAdmin() {

    const usernameBox =
    document.getElementById("username");

    const passwordBox =
    document.getElementById("password");


    // Only run on admin login page

    if (!usernameBox || !passwordBox) {

        return;

    }


    const username =
    usernameBox.value.trim();

    const password =
    passwordBox.value.trim();


    // ==================================================
    // ADMIN ACCOUNT
    // ==================================================

    if (
        username === "IAN" &&
        password === "10242005"
    ) {

        localStorage.setItem(
            "adminLoggedIn",
            "true"
        );


        window.location.href =
        "admin-dashboard.html";

    }

    else {

        const error =
        document.getElementById("error");


        if (error) {

            error.textContent =
            "Invalid Username or Password.";

        }

    }

}


// ======================================================
// CHECK ADMIN LOGIN
// ======================================================

function checkAdminLogin() {

    const loggedIn =
    localStorage.getItem(
        "adminLoggedIn"
    );


    if (
        loggedIn !== "true"
    ) {

        window.location.href =
        "admin.html";

        return false;

    }


    return true;

}


// ======================================================
// LOAD SETTINGS FROM GOOGLE SHEETS
// ======================================================

async function loadAdminSettings() {

    console.log(
        "Loading admin settings from Google Sheets..."
    );


    const statusElement =
    document.getElementById(
        "settingsStatus"
    );


    if (statusElement) {

        statusElement.textContent =
        "⏳ Loading settings...";

    }


    try {


        const response =
        await fetch(

            APPS_SCRIPT_URL +
            "?action=getSettings&t=" +
            Date.now()

        );


        if (!response.ok) {

            throw new Error(

                "HTTP Error " +
                response.status

            );

        }


        const settings =
        await response.json();


        console.log(
            "Settings received:",
            settings
        );


        if (
            settings.success === false
        ) {

            throw new Error(
                settings.message ||
                "Unable to load settings."
            );

        }


        // ==================================================
        // DISPLAY SETTINGS
        // ==================================================


        const attendanceStatus =
        document.getElementById(
            "attendanceStatus"
        );


        if (attendanceStatus) {

            attendanceStatus.value =
            settings.status ||
            "CLOSED";

        }


        const latitude =
        document.getElementById(
            "latitude"
        );


        if (latitude) {

            latitude.value =
            settings.latitude ||
            "";

        }


        const longitude =
        document.getElementById(
            "longitude"
        );


        if (longitude) {

            longitude.value =
            settings.longitude ||
            "";

        }


        const radius =
        document.getElementById(
            "radius"
        );


        if (radius) {

            radius.value =
            settings.radius ||
            "200";

        }


        const startTime =
        document.getElementById(
            "startTime"
        );


        if (startTime) {

            startTime.value =
            settings.startTime ||
            "07:00";

        }


        const endTime =
        document.getElementById(
            "endTime"
        );


        if (endTime) {

            endTime.value =
            settings.endTime ||
            "12:00";

        }


        if (statusElement) {

            statusElement.textContent =
            "✅ Settings loaded successfully.";

        }


        // Save local backup

        localStorage.setItem(

            "attendanceSettings",

            JSON.stringify(
                settings
            )

        );


    }

    catch(error) {


        console.error(
            "Settings loading error:",
            error
        );


        if (statusElement) {

            statusElement.textContent =
            "❌ Unable to load settings.";

        }


        alert(

            "❌ Unable to load attendance settings.\n\n" +

            error.message

        );

    }

}


// ======================================================
// GET CURRENT GPS LOCATION
// ======================================================

function getCurrentLocation() {


    if (
        !navigator.geolocation
    ) {

        alert(
            "GPS is not supported by this browser."
        );

        return;

    }


    const locationStatus =
    document.getElementById(
        "locationStatus"
    );


    if (locationStatus) {

        locationStatus.innerHTML =
        "📍 Getting your current location...";

    }


    navigator.geolocation.getCurrentPosition(

        function(position) {


            const latitude =
            position.coords.latitude;


            const longitude =
            position.coords.longitude;


            // Put coordinates into inputs

            const latitudeInput =
            document.getElementById(
                "latitude"
            );


            const longitudeInput =
            document.getElementById(
                "longitude"
            );


            if (latitudeInput) {

                latitudeInput.value =
                latitude.toFixed(7);

            }


            if (longitudeInput) {

                longitudeInput.value =
                longitude.toFixed(7);

            }


            if (locationStatus) {

                locationStatus.innerHTML =

                "✅ Current Location Captured<br>" +

                "Latitude: " +
                latitude.toFixed(7) +

                "<br>" +

                "Longitude: " +
                longitude.toFixed(7);

            }


        },


        function(error) {


            console.error(
                "GPS Error:",
                error
            );


            if (locationStatus) {

                locationStatus.innerHTML =
                "❌ Unable to get location.";

            }


            alert(

                "❌ Unable to get GPS location.\n\n" +

                "Please make sure:\n" +

                "1. Location/GPS is ON.\n" +

                "2. You allowed location permission.\n" +

                "3. You are using HTTPS.\n" +

                "4. Your browser has location permission."

            );

        },


        {

            enableHighAccuracy:
            true,

            timeout:
            20000,

            maximumAge:
            0

        }

    );

}


// ======================================================
// SAVE SETTINGS TO GOOGLE SHEETS
// ======================================================

async function saveSettings() {


    // ==================================================
    // GET VALUES
    // ==================================================


    const status =
    document.getElementById(
        "attendanceStatus"
    ).value;


    const latitude =
    document.getElementById(
        "latitude"
    ).value.trim();


    const longitude =
    document.getElementById(
        "longitude"
    ).value.trim();


    const radius =
    document.getElementById(
        "radius"
    ).value.trim();


    const startTime =
    document.getElementById(
        "startTime"
    ).value;


    const endTime =
    document.getElementById(
        "endTime"
    ).value;


    // ==================================================
    // VALIDATE
    // ==================================================


    if (
        latitude === "" ||
        longitude === ""
    ) {

        alert(
            "❌ Please enter or capture the training ground location."
        );

        return;

    }


    if (
        isNaN(
            parseFloat(latitude)
        ) ||

        isNaN(
            parseFloat(longitude)
        )
    ) {

        alert(
            "❌ Latitude and longitude must be valid numbers."
        );

        return;

    }


    if (
        radius === "" ||
        isNaN(
            parseFloat(radius)
        )
    ) {

        alert(
            "❌ Please enter a valid radius in meters."
        );

        return;

    }


    if (
        parseFloat(radius) <= 0
    ) {

        alert(
            "❌ Radius must be greater than 0."
        );

        return;

    }


    if (
        !startTime ||
        !endTime
    ) {

        alert(
            "❌ Please select the attendance start and end time."
        );

        return;

    }


    // ==================================================
    // CREATE SETTINGS
    // ==================================================


    const settings = {

        action:
        "saveSettings",

        status:
        status,

        latitude:
        parseFloat(latitude),

        longitude:
        parseFloat(longitude),

        radius:
        parseFloat(radius),

        startTime:
        startTime,

        endTime:
        endTime

    };


    console.log(
        "Saving settings:",
        settings
    );


    // ==================================================
    // SHOW SAVING MESSAGE
    // ==================================================


    const statusElement =
    document.getElementById(
        "settingsStatus"
    );


    if (statusElement) {

        statusElement.textContent =
        "⏳ Saving settings...";

    }


    try {


        // ==================================================
        // SEND TO GOOGLE APPS SCRIPT
        // ==================================================


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
                    settings
                )

            }

        );


        if (!response.ok) {

            throw new Error(

                "HTTP Error " +
                response.status

            );

        }


        const result =
        await response.json();


        console.log(
            "Save result:",
            result
        );


        if (
            !result.success
        ) {

            throw new Error(

                result.message ||

                "Google Apps Script failed to save settings."

            );

        }


        // ==================================================
        // SAVE LOCAL BACKUP
        // ==================================================


        localStorage.setItem(

            "attendanceSettings",

            JSON.stringify({

                status:
                status,

                latitude:
                latitude,

                longitude:
                longitude,

                radius:
                radius,

                startTime:
                startTime,

                endTime:
                endTime

            })

        );


        // ==================================================
        // SUCCESS
        // ==================================================


        if (statusElement) {

            statusElement.textContent =
            "✅ Settings saved successfully.";

        }


        alert(

            "✅ Attendance Settings Saved!\n\n" +

            "Status: " +
            status +

            "\nLocation: " +
            latitude +
            ", " +
            longitude +

            "\nRadius: " +
            radius +
            " meters" +

            "\nTime: " +
            startTime +
            " - " +
            endTime

        );


    }

    catch(error) {


        console.error(
            "Save settings error:",
            error
        );


        if (statusElement) {

            statusElement.textContent =
            "❌ Failed to save settings.";

        }


        alert(

            "❌ Failed to save attendance settings.\n\n" +

            error.message

        );

    }

}


// ======================================================
// OPEN GOOGLE SHEET
// ======================================================

function openSheet() {


    window.open(

        GOOGLE_SHEET_URL,

        "_blank"

    );

}


// ======================================================
// LOGOUT ADMIN
// ======================================================

function logoutAdmin() {


    localStorage.removeItem(
        "adminLoggedIn"
    );


    window.location.href =
    "admin.html";

}


// ======================================================
// ADMIN DASHBOARD STARTUP
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    function() {


        // Only run on Admin Dashboard

        if (
            document.getElementById(
                "attendanceStatus"
            )
        ) {


            // Check login

            if (
                !checkAdminLogin()
            ) {

                return;

            }


            // Load settings

            loadAdminSettings();

        }

    }

);
