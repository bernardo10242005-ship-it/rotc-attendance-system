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
// LOAD ADMIN SETTINGS
// ======================================================

async function loadAdminSettings() {

    try {

        const response =
        await fetch(

            APPS_SCRIPT_URL +
            "?t=" +
            Date.now(),

            {
                cache:
                "no-store"
            }

        );


        if (!response.ok) {

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


        const status =
        document.getElementById(
            "attendanceStatus"
        );


        const trainingDay =
        document.getElementById(
            "trainingDay"
        );


        const trainingTopic =
        document.getElementById(
            "trainingTopic"
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


        if (trainingDay) {

            trainingDay.value =
            settings.trainingDay ||
            "";

        }


        if (trainingTopic) {

            trainingTopic.value =
            settings.trainingTopic ||
            "";

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


            const accuracy =
            position.coords.accuracy;


            document.getElementById(
                "latitude"
            ).value =
            latitude.toFixed(7);


            document.getElementById(
                "longitude"
            ).value =
            longitude.toFixed(7);


            if (locationStatus) {

                locationStatus.innerHTML =

                "✅ Location captured.<br>" +

                "Accuracy: approximately " +

                accuracy.toFixed(1) +

                " meters.";

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

                "Make sure Location/GPS is ON and allow location permission."

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
// SAVE SETTINGS
// ======================================================

async function saveSettings() {

    const status =
    document.getElementById(
        "attendanceStatus"
    ).value;


    const trainingDay =
    document.getElementById(
        "trainingDay"
    ).value.trim();


    const trainingTopic =
    document.getElementById(
        "trainingTopic"
    ).value.trim();


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
    // VALIDATION
    // ==================================================

    if (!trainingDay) {

        alert(
            "❌ Please enter the Training Day."
        );

        return;

    }


    if (!trainingTopic) {

        alert(
            "❌ Please enter the Training Topic or Subject."
        );

        return;

    }


    if (
        latitude === "" ||
        longitude === ""
    ) {

        alert(
            "❌ Please enter or capture the training location."
        );

        return;

    }


    const radiusNumber =
    parseFloat(
        radius
    );


    if (
        isNaN(radiusNumber) ||
        radiusNumber <= 0
    ) {

        alert(
            "❌ Please enter a valid radius."
        );

        return;

    }


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
    // CREATE SETTINGS
    // ==================================================

    const settings = {

        action:
        "saveSettings",

        status:
        status,

        trainingDay:
        trainingDay,

        trainingTopic:
        trainingTopic,

        latitude:
        latitude,

        longitude:
        longitude,

        radius:
        radiusNumber.toString(),

        startTime:
        startTime,

        endTime:
        endTime

    };


    const locationStatus =
    document.getElementById(
        "locationStatus"
    );


    if (locationStatus) {

        locationStatus.innerHTML =
        "⏳ Saving settings...";

    }


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
                    settings
                )

            }

        );


        const result =
        await response.json();


        console.log(
            "Save result:",
            result
        );


        if (
            result.success
        ) {

            localStorage.setItem(

                "attendanceSettings",

                JSON.stringify(
                    settings
                )

            );


            if (locationStatus) {

                locationStatus.innerHTML =
                "✅ Settings saved successfully.";

            }


            alert(

                "✅ Attendance settings saved successfully!\n\n" +

                "Training Day: " +

                trainingDay +

                "\nTopic: " +

                trainingTopic

            );

        }

        else {

            throw new Error(

                result.message ||

                "Unable to save settings."

            );

        }

    }

    catch(error) {

        console.error(
            "Save Error:",
            error
        );


        if (locationStatus) {

            locationStatus.innerHTML =
            "❌ Failed to save settings.";

        }


        alert(

            "❌ Failed to save settings.\n\n" +

            error.message

        );

    }

}


// ======================================================
// OPEN GOOGLE SPREADSHEET
// ======================================================

function openSheet() {

    window.open(

        "https://docs.google.com/spreadsheets/d/1y0PmS9GcmH8WcPNxundYdl7BWgYa_gl_KCp-dUqNZzA/edit",

        "_blank"

    );

}


// ======================================================
// LOGOUT
// ======================================================

function logoutAdmin() {

    localStorage.removeItem(
        "adminLoggedIn"
    );


    window.location.href =
    "admin.html";

}


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    function() {

        if (
            document.getElementById(
                "attendanceStatus"
            )
        ) {

            loadAdminSettings();

        }

    }

);
