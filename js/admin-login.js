// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// ADMIN LOGIN JS
// ======================================================

// ======================================================
// GOOGLE APPS SCRIPT WEB APP URL
// ======================================================

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzmqVoMihTcRZkRLhwgmCWK9zSv1bgP6W2YL0aEUio2bX340vPCdpVQ6uJD3lGNq3J_4A/exec";


// ======================================================
// SHOW / HIDE PASSWORD
// ======================================================

function togglePassword(){

    const pass=document.getElementById("password");

    if(!pass) return;

    if(pass.type==="password"){

        pass.type="text";

    }else{

        pass.type="password";

    }

}


// ======================================================
// ADMIN LOGIN
// ======================================================

function loginAdmin(){

    const username=document.getElementById("username").value.trim();
    const password=document.getElementById("password").value.trim();
    const error=document.getElementById("error");

    if(error) error.textContent="";

    // ===== YOUR ADMIN ACCOUNT =====

    if(

        username.toUpperCase()==="SIR IAN" &&
        password==="BERNS10242005@"

    ){

        localStorage.setItem("adminLoggedIn","true");

        window.location.href="admin-dashboard.html";

    }

    else{

        if(error){

            error.textContent="Invalid Username or Password.";

        }else{

            alert("Invalid Username or Password.");

        }

    }

}


// ======================================================
// LOAD ADMIN SETTINGS
// ======================================================

async function loadAdminSettings(){

    try{

        const response=await fetch(

            APPS_SCRIPT_URL+"?t="+Date.now(),

            {

                method:"GET",

                cache:"no-store"

            }

        );

        const settings=await response.json();

        if(document.getElementById("attendanceStatus"))
        document.getElementById("attendanceStatus").value=settings.status||"CLOSED";

        if(document.getElementById("trainingDay"))
        document.getElementById("trainingDay").value=settings.trainingDay||"";

        if(document.getElementById("trainingTopic"))
        document.getElementById("trainingTopic").value=settings.trainingTopic||"";

        if(document.getElementById("latitude"))
        document.getElementById("latitude").value=settings.latitude||"";

        if(document.getElementById("longitude"))
        document.getElementById("longitude").value=settings.longitude||"";

        if(document.getElementById("radius"))
        document.getElementById("radius").value=settings.radius||"200";

        if(document.getElementById("startTime"))
        document.getElementById("startTime").value=settings.startTime||"07:00";

        if(document.getElementById("endTime"))
        document.getElementById("endTime").value=settings.endTime||"12:00";

    }

    catch(error){

        console.error(error);

    }

}


// ======================================================
// GET GPS
// ======================================================

function getCurrentLocation(){

    if(!navigator.geolocation){

        alert("GPS is not supported.");

        return;

    }

    navigator.geolocation.getCurrentPosition(

        function(position){

            document.getElementById("latitude").value=
            position.coords.latitude.toFixed(7);

            document.getElementById("longitude").value=
            position.coords.longitude.toFixed(7);

            const status=document.getElementById("locationStatus");

            if(status){

                status.innerHTML="✅ Location Captured";

            }

        },

        function(){

            alert("Unable to get current location.");

        },

        {

            enableHighAccuracy:true,

            timeout:30000,

            maximumAge:0

        }

    );

}


// ======================================================
// SAVE SETTINGS
// ======================================================

async function saveSettings(){

    const settings={

        action:"saveSettings",

        status:document.getElementById("attendanceStatus").value,

        trainingDay:document.getElementById("trainingDay").value,

        trainingTopic:document.getElementById("trainingTopic").value,

        latitude:document.getElementById("latitude").value,

        longitude:document.getElementById("longitude").value,

        radius:document.getElementById("radius").value,

        startTime:document.getElementById("startTime").value,

        endTime:document.getElementById("endTime").value

    };

    try{

        const response=await fetch(APPS_SCRIPT_URL,{

            method:"POST",

            headers:{

                "Content-Type":"text/plain;charset=utf-8"

            },

            body:JSON.stringify(settings)

        });

        const result=await response.json();

        if(result.success){

            alert("Settings Saved Successfully.");

        }else{

            alert("Failed to Save Settings.");

        }

    }

    catch(error){

        alert("Unable to Save Settings.");

    }

}


// ======================================================
// OPEN GOOGLE DRIVE
// ======================================================

function openTrainingFiles(){

    window.open(

        "https://drive.google.com/drive/u/0/folders/10gMqlULJh9Xa7aB_e4v7Y_oa7pAQ6CHu",

        "_blank"

    );

}


// ======================================================
// LOGOUT
// ======================================================

function logoutAdmin(){

    localStorage.removeItem("adminLoggedIn");

    window.location.href="admin-login.html";

}


// ======================================================
// AUTO LOAD
// ======================================================

document.addEventListener("DOMContentLoaded",function(){

    if(document.getElementById("attendanceStatus")){

        loadAdminSettings();

    }

});
