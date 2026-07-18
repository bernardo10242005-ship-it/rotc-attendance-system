// ======================================================
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// ADMIN.JS
// ======================================================

// ======================================================
// ADMIN LOGIN
// ======================================================

function loginAdmin() {

    const usernameBox = document.getElementById("username");
    const passwordBox = document.getElementById("password");

    // If we are not on admin.html, do nothing.
    if (!usernameBox || !passwordBox) return;

    const username = usernameBox.value.trim();
    const password = passwordBox.value.trim();

    if (username === "IAN" && password === "10242005") {

        localStorage.setItem("adminLoggedIn", "true");

        window.location.href = "admin-dashboard.html";

    } else {

        document.getElementById("error").textContent =
            "Invalid Username or Password.";

    }

}

// ======================================================
// ONLY RUN DASHBOARD CODE ON admin-dashboard.html
// ======================================================

if (document.getElementById("attendanceStatus")) {

    window.onload = function () {

        const settings =
        JSON.parse(localStorage.getItem("attendanceSettings"));

        if (settings) {

            document.getElementById("attendanceStatus").value =
            settings.status || "OPEN";

            document.getElementById("latitude").value =
            settings.latitude || "";

            document.getElementById("longitude").value =
            settings.longitude || "";

            document.getElementById("radius").value =
            settings.radius || 200;

            document.getElementById("startTime").value =
            settings.startTime || "";

            document.getElementById("endTime").value =
            settings.endTime || "";

        }

    };

}

// ======================================================
// GET CURRENT GPS
// ======================================================

function getCurrentLocation() {

    if (!navigator.geolocation) {

        alert("GPS is not supported.");

        return;

    }

    navigator.geolocation.getCurrentPosition(

        function(position){

            document.getElementById("latitude").value =
            position.coords.latitude;

            document.getElementById("longitude").value =
            position.coords.longitude;

            document.getElementById("locationStatus").innerHTML =
            "✅ Training Ground Location Captured Successfully";

        },

        function(){

            alert("Unable to get GPS.");

        }

    );

}

// ======================================================
// SAVE SETTINGS
// ======================================================

function saveSettings(){

    const settings={

        status:
        document.getElementById("attendanceStatus").value,

        latitude:
        document.getElementById("latitude").value,

        longitude:
        document.getElementById("longitude").value,

        radius:
        document.getElementById("radius").value || 200,

        startTime:
        document.getElementById("startTime").value,

        endTime:
        document.getElementById("endTime").value

    };

    localStorage.setItem(
        "attendanceSettings",
        JSON.stringify(settings)
    );

    console.log("Saved:", settings);

    alert("✅ Settings Saved Successfully!");

}

// ======================================================
// OPEN GOOGLE SHEET
// ======================================================

function openSheet(){

    window.open(
        "https://docs.google.com/spreadsheets/d/1y0PmS9GcmH8WcPNxundYdl7BWgYa_gl_KCp-dUqNZzA/edit",
        "_blank"
    );

}



// ======================================================
// LOGOUT
// ======================================================

function logoutAdmin(){

    localStorage.removeItem("adminLoggedIn");

    window.location.href="admin.html";

}