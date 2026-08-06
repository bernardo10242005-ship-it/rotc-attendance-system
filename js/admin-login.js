// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// ADMIN LOGIN & COMMAND CENTER
// VERSION 3
//
// FEATURES
// - No GPS
// - No Camera
// - Save Attendance Settings
// - Load Attendance Settings
// - Open Training Files
// - Admin Login
// ======================================================

// ======================================================
// GOOGLE APPS SCRIPT WEB APP
// ======================================================

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzmqVoMihTcRZkRLhwgmCWK9zSv1bgP6W2YL0aEUio2bX340vPCdpVQ6uJD3lGNq3J_4A/exec";


// ======================================================
// SHOW / HIDE PASSWORD
// ======================================================

function togglePassword(){

    const pass =
    document.getElementById("password");

    if(!pass) return;

    if(pass.type==="password"){

        pass.type="text";

    }

    else{

        pass.type="password";

    }

}


// ======================================================
// ADMIN LOGIN
// ======================================================

function loginAdmin(){

    const username =
    document.getElementById("username").value.trim();

    const password =
    document.getElementById("password").value.trim();

    const error =
    document.getElementById("error");

    if(error){

        error.textContent="";

    }

    if(

        username.toUpperCase()==="SIR IAN"

        &&

        password==="BERNS10242005@"

    ){

        localStorage.setItem(

            "adminLoggedIn",

            "true"

        );

        window.location.href=

        "admin-dashboard.html";

    }

    else{

        if(error){

            error.textContent=

            "Invalid Username or Password.";

        }

        else{

            alert(

                "Invalid Username or Password."

            );

        }

    }

}


// ======================================================
// LOAD SETTINGS
// ======================================================

async function loadAdminSettings(){

    try{

        const response =

        await fetch(

            APPS_SCRIPT_URL +

            "?t=" +

            Date.now(),

            {

                method:"GET",

                cache:"no-store"

            }

        );

        const settings =

        await response.json();

        console.log(settings);

        document.getElementById("attendanceStatus").value =

        settings.status || "CLOSED";

        document.getElementById("trainingDay").value =

        settings.trainingDay || "";

        document.getElementById("trainingTopic").value =

        settings.trainingTopic ||

        settings.topic ||

        "";

        document.getElementById("startTime").value =

        settings.startTime ||

        "07:00";

        document.getElementById("endTime").value =

        settings.endTime ||

        "12:00";

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to load admin settings."

        );

    }

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

        console.log(result);

        if(result.success){

            alert("✅ Settings Saved Successfully.");

        }else{

            alert(result.message || "Failed to save settings.");

        }

    }

    catch(error){

        console.error(error);

        alert("Unable to save settings.");

    }

}


// ======================================================
// OPEN TRAINING FILES
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

    localStorage.removeItem(

        "adminLoggedIn"

    );

    window.location.href=

    "admin-login.html";

}


// ======================================================
// AUTO LOAD SETTINGS
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    function(){

        if(

            document.getElementById(

                "attendanceStatus"

            )

        ){

            loadAdminSettings();

        }

    }

);
