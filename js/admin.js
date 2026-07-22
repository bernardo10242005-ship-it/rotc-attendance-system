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
// ADMIN LOGIN
// ======================================================

function loginAdmin() {

    const usernameBox =
    document.getElementById("username");

    const passwordBox =
    document.getElementById("password");


    // If not on admin login page
    if (
        !usernameBox ||
        !passwordBox
    ) {

        return;

    }


    const username =
    usernameBox.value.trim();


    const password =
    passwordBox.value.trim();


    // ==================================================
    // ADMIN LOGIN CREDENTIALS
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
        document.getElementById(
            "error"
        );


        if (error) {

            error.textContent =
            "Invalid Username or Password.";

        }

    }

}


// ======================================================
// LOAD ADMIN SETTINGS
// ======================================================

async function loadAdminSettings() {

    try {

        console.log(
            "Loading admin settings..."
        );


        const response =
        await fetch(
            APPS_SCRIPT_URL +
            "?t=" +
            Date.now()
        );


        if (
            !response.ok
        ) {

            throw new Error(
                "HTTP Error: " +
                response.status
            );

        }


        const settings =
        await response.json();


        console.log(
            "Settings loaded:",
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
        // DISPLAY SETTINGS IN ADMIN DASHBOARD
        // ==================================================

        const status =
        document.getElementById(
            "attendanceStatus"
        );


        const latitude =
        document.getElementById(
            "latitude"
        );


        const longitude =
        document.getElementById(
            "longitude"
        );


        const radius =
        document.getElementById(
            "radius"
        );


        const startTime =
        document.getElementById(
            "startTime"
        );


        const endTime =
        document.getElementById(
            "endTime"
        );


        if (status) {

            status.value =
            settings.status ||
            "CLOSED";

        }


        if (latitude) {

            latitude.value =
            settings.latitude ||
            "";

        }


        if (longitude) {

            longitude.value =
            settings.longitude ||
            "";

        }


        if (radius) {

            radius.value =
            settings.radius ||
            "200";

        }


        if (startTime) {

            startTime.value =
            settings.startTime ||
            "07:00";

        }


        if (endTime) {

            endTime.value =
            settings.endTime ||
            "12:00";

        }


        console.log(
            "Admin settings displayed successfully."
        );


    }

    catch(error) {

        console.error(
            "Settings Error:",
            error
        );


        alert(

            "❌ Unable to load attendance settings.\n\n" +

            error.message

        );

    }

}


// ======================================================
// GET CURRENT LOCATION
// ======================================================

function getCurrentLocation() {


    if (
        !navigator.geolocation
    ) {

        alert(
            "GPS is not supported by this device."
        );

        return;

    }


    const locationStatus =
    document.getElementById(
        "locationStatus"
    );


    if (locationStatus) {

        locationStatus.innerHTML =
        "🟡 Detecting your current location...";

    }


    navigator.geolocation.getCurrentPosition(

        function(position) {


            const latitude =
            position.coords.latitude;


            const longitude =
            position.coords.longitude;


            // ==================================================
            // PUT GPS INTO INPUT BOXES
            // ==================================================

            const latitudeBox =
            document.getElementById(
                "latitude"
            );


            const longitudeBox =
            document.getElementById(
                "longitude"
            );


            if (latitudeBox) {

                latitudeBox.value =
                latitude.toFixed(7);

            }


            if (longitudeBox) {

                longitudeBox.value =
                longitude.toFixed(7);

            }


            if (locationStatus) {

                locationStatus.innerHTML =

                "✅ Current location captured successfully.<br>" +

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
                "❌ Unable to get current location.";

            }


            alert(

                "Unable to get your current location.\n\n" +

                "Please make sure Location/GPS is turned ON and allow location permission."

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
// SAVE SETTINGS TO GOOGLE SHEETS
// ======================================================

async function saveSettings() {


    // ==================================================
    // GET INPUT VALUES
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
    // VALIDATE LOCATION
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


    // ==================================================
    // VALIDATE RADIUS
    // ==================================================

    const radiusNumber =
    parseFloat(
        radius
    );


    if (
        isNaN(radiusNumber) ||
        radiusNumber <= 0
    ) {

        alert(
            "❌ Please enter a valid radius in meters."
        );

        return;

    }


    // ==================================================
    // VALIDATE TIME
    // ==================================================

    if (
        !startTime ||
        !endTime
    ) {

        alert(
            "❌ Please enter the attendance start and end time."
        );

        return;

    }


    // ==================================================
    // CREATE SETTINGS OBJECT
    // ==================================================

    const settings = {

        action:
        "saveSettings",

        status:
        status,

        latitude:
        latitude,

        longitude:
        longitude,

        radius:
        radiusNumber
        .toString(),

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

    const locationStatus =
    document.getElementById(
        "locationStatus"
    );


    if (locationStatus) {

        locationStatus.innerHTML =
        "⏳ Saving attendance settings...";

    }


    try {


        // ==================================================
        // SEND SETTINGS TO GOOGLE APPS SCRIPT
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


        // ==================================================
        // READ RESPONSE
        // ==================================================

        const result =
        await response.json();


        console.log(
            "Save result:",
            result
        );


        // ==================================================
        // CHECK RESULT
        // ==================================================

        if (
            result.success
        ) {


            // Save a local copy too

            localStorage.setItem(

                "attendanceSettings",

                JSON.stringify(
                    settings
                )

            );


            if (locationStatus) {

                locationStatus.innerHTML =
                "✅ Attendance settings saved successfully.";

            }


            alert(

                "✅ Attendance Settings Saved Successfully!\n\n" +

                "The new settings are now stored in Google Sheets and will be used by student devices."

            );

        }

        else {


            throw new Error(

                result.message ||

                "Google Apps Script could not save the settings."

            );

        }


    }

    catch(error) {


        console.error(
            "Save Settings Error:",
            error
        );


        if (locationStatus) {

            locationStatus.innerHTML =
            "❌ Failed to save attendance settings.";

        }


        alert(

            "❌ Failed to save attendance settings.\n\n" +

            error.message

        );

    }

}


// ======================================================
// OPEN GOOGLE ATTENDANCE SPREADSHEET
// ======================================================

function openSheet() {


    window.open(

        "https://docs.google.com/spreadsheets/d/1y0PmS9GcmH8WcPNxundYdl7BWgYa_gl_KCp-dUqNZzA/edit",

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
// LOAD SETTINGS WHEN ADMIN DASHBOARD OPENS
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    function() {


        // Only run on admin dashboard

        if (
            document.getElementById(
                "attendanceStatus"
            )
        ) {


            // Load settings from Google Sheets

            loadAdminSettings();

        }

    }

);
