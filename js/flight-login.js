// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// FLIGHT LEADER LOGIN
// ======================================================

function loginFlightLeader() {

    const username = document
        .getElementById("flightUsername")
        .value
        .trim()
        .toUpperCase();

    const password = document
        .getElementById("flightPassword")
        .value
        .trim();

    const accounts = {

        "FLIGHT ALPHA":"alpha260106",
        "FLIGHT BRAVO":"bravo260106",
        "FLIGHT CHARLIE":"charlie260106",
        "FLIGHT DELTA":"delta260106",
        "FLIGHT ECHO":"echo260106",
        "FLIGHT FOXTROT":"foxtrot260106",
        "FLIGHT GOLF":"golf260106",
        "FLIGHT HOTEL":"hotel260106",
        "FLIGHT INDIA":"india260106",
        "FLIGHT JULIET":"juliet260106",
        "FLIGHT KILO":"kilo260106",
        "FLIGHT LIMA":"lima260106",
        "FLIGHT MIKE":"mike260106",
        "FLIGHT NOVEMBER":"november260106",
        "FLIGHT OSCAR":"oscar260106",
        "FLIGHT PAPA":"papa260106",
        "FLIGHT QUEBEC":"quebec260106",
        "FLIGHT IRREG":"irreg260106"

    };

    if(accounts[username] && accounts[username] === password){

        localStorage.setItem(

            "flightLeader",

            JSON.stringify({

                flight:username

            })

        );

        window.location.href="flight-dashboard.html";

    }

    else{

        document.getElementById("error").innerHTML=

        "❌ Invalid Flight Leader Account";

    }

}
