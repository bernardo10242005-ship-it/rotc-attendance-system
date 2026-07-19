// ======================================================
// FULL BRIGHT COLLEGE
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// attendance.js
// PART 1 OF 2
// ======================================================

// ==========================
// GET LOGGED IN STUDENT
// ==========================

const student = JSON.parse(localStorage.getItem("student"));

if (!student) {
    window.location.href = "login.html";
}

document.getElementById("cadetName").textContent = student.name;
document.getElementById("studentNumber").textContent =
    "Student Number: " + student.id;
document.getElementById("flight").textContent =
    "Flight: " + student.flight;

// ==========================
// LOAD ADMIN SETTINGS
// ==========================

const settings =
JSON.parse(localStorage.getItem("attendanceSettings"));

if(!settings){

    alert("Attendance settings have not been configured.");

    window.location.href="dashboard.html";

}

const TRAINING_LAT =
parseFloat(settings.latitude);

const TRAINING_LNG =
parseFloat(settings.longitude);

const ALLOWED_RADIUS =
parseFloat(settings.radius) || 200;

// ==========================
// DATE & TIME
// ==========================

function updateClock(){

    const now=new Date();

    document.getElementById("date").value=
    now.toLocaleDateString();

    document.getElementById("time").value=
    now.toLocaleTimeString();

}

updateClock();

setInterval(updateClock,1000);

// ==========================
// GPS
// ==========================

let latitude=null;
let longitude=null;
let distanceMeters=999999;

// ==========================
// DISTANCE FORMULA
// ==========================

function calculateDistance(lat1,lon1,lat2,lon2){

const R=6371000;

const dLat=(lat2-lat1)*Math.PI/180;

const dLon=(lon2-lon1)*Math.PI/180;

const a=

Math.sin(dLat/2)*Math.sin(dLat/2)+

Math.cos(lat1*Math.PI/180)*

Math.cos(lat2*Math.PI/180)*

Math.sin(dLon/2)*

Math.sin(dLon/2);

const c=2*Math.atan2(

Math.sqrt(a),

Math.sqrt(1-a)

);

return R*c;

}

// ==========================
// GET ADDRESS
// ==========================

async function getAddress(lat,lng){

try{

const url=

`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

const response=await fetch(url);

const data=await response.json();

document.getElementById("address").textContent=

data.display_name;

}

catch{

document.getElementById("address").textContent=

"Unable to determine address.";

}

}

// ==========================
// GPS LOCATION
// ==========================

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(

function(position){

latitude=position.coords.latitude;

longitude=position.coords.longitude;

document.getElementById("gpsStatus").textContent=

"🟢 GPS VERIFIED";

document.getElementById("latitude").textContent=

latitude.toFixed(6);

document.getElementById("longitude").textContent=

longitude.toFixed(6);

getAddress(latitude,longitude);

distanceMeters=

calculateDistance(

latitude,

longitude,

TRAINING_LAT,

TRAINING_LNG

);

document.getElementById("distance").textContent=

distanceMeters.toFixed(1)+" meters";

if(distanceMeters<=ALLOWED_RADIUS){

document.getElementById("validationStatus").innerHTML=

"✅ Inside Allowed Area";

}else{

document.getElementById("validationStatus").innerHTML=

"❌ Outside "+ALLOWED_RADIUS+" Meter Radius";

}

},

function(){

document.getElementById("gpsStatus").textContent=

"🔴 GPS NOT AVAILABLE";

}

);

}

// ==========================
// CAMERA
// ==========================

const video = document.getElementById("video");

let photoTaken = false;

navigator.mediaDevices.getUserMedia({
    video: true
})
.then(stream => {
    video.srcObject = stream;
})
.catch(() => {

    alert("Unable to access camera.");

});

function takePhoto(){

    const canvas = document.getElementById("photo");

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video,0,0,320,240);

    photoTaken = true;

    alert(canvas.toDataURL("image/png").substring(0,40));

}

// ==========================
// SIGNATURE
// ==========================

const signature = document.getElementById("signature");
const signCtx = signature.getContext("2d");

let drawing = false;
let signed = false;

// White background
signCtx.fillStyle = "white";
signCtx.fillRect(0, 0, signature.width, signature.height);

signCtx.strokeStyle = "black";
signCtx.lineWidth = 2;
signCtx.lineCap = "round";

// ---------- DESKTOP ----------
signature.addEventListener("mousedown", startMouse);
signature.addEventListener("mousemove", drawMouse);
signature.addEventListener("mouseup", stopDrawing);
signature.addEventListener("mouseleave", stopDrawing);

// ---------- MOBILE ----------
signature.addEventListener("touchstart", startTouch, { passive: false });
signature.addEventListener("touchmove", drawTouch, { passive: false });
signature.addEventListener("touchend", stopDrawing);

function getMousePos(e) {
    const rect = signature.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function getTouchPos(e) {
    const rect = signature.getBoundingClientRect();
    const touch = e.touches[0];

    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

function startMouse(e) {

    drawing = true;
    signed = true;

    const pos = getMousePos(e);

    signCtx.beginPath();
    signCtx.moveTo(pos.x, pos.y);

}

function drawMouse(e) {

    if (!drawing) return;

    const pos = getMousePos(e);

    signCtx.lineTo(pos.x, pos.y);
    signCtx.stroke();

}

function startTouch(e) {

    e.preventDefault();

    drawing = true;
    signed = true;

    const pos = getTouchPos(e);

    signCtx.beginPath();
    signCtx.moveTo(pos.x, pos.y);

}

function drawTouch(e) {

    e.preventDefault();

    if (!drawing) return;

    const pos = getTouchPos(e);

    signCtx.lineTo(pos.x, pos.y);
    signCtx.stroke();

}

function stopDrawing() {

    drawing = false;
    signCtx.beginPath();

}

function clearSignature() {

    signCtx.fillStyle = "white";
    signCtx.fillRect(0, 0, signature.width, signature.height);

    signed = false;

    signCtx.strokeStyle = "black";
    signCtx.lineWidth = 2;
    signCtx.lineCap = "round";

}

// ==========================
// VALIDATE TIME
// ==========================

function attendanceOpen(){

const now=new Date();

const current=

now.getHours()*60+

now.getMinutes();

const start=settings.startTime.split(":");

const end=settings.endTime.split(":");

const startMinutes=

parseInt(start[0])*60+

parseInt(start[1]);

const endMinutes=

parseInt(end[0])*60+

parseInt(end[1]);

return current>=startMinutes && current<=endMinutes;

}

// ==========================
// SUBMIT
// ==========================

function submitAttendance(){

if(settings.status!=="OPEN"){

alert("Attendance is currently CLOSED.");

return;

}

if(!attendanceOpen()){

alert("Attendance is outside the allowed time.");

return;

}

if(latitude===null){

alert("GPS not detected.");

return;

}

if(distanceMeters>ALLOWED_RADIUS){

alert("You are outside the allowed "+ALLOWED_RADIUS+" meter radius.");

return;

}

if(!photoTaken){

alert("Please capture your selfie.");

return;

}

if(!signed){

alert("Please provide your signature.");

return;

}

const today=new Date().toLocaleDateString();

const attendanceKey=

student.id+"_"+today;

if(false && localStorage.getItem(attendanceKey)){

alert("You have already submitted attendance today.");

return;

}

const attendance = {

studentNumber: student.id,

name: student.name,

course: student.course,

flight: student.flight,

date: today,

time: new Date().toLocaleTimeString(),

status: document.getElementById("status").value,

latitude: latitude,

longitude: longitude,

distance: distanceMeters.toFixed(2),

address: document.getElementById("address").textContent,

photo: document.getElementById("photo").toDataURL("image/png"),

signature: signature.toDataURL("image/png"),

photoFileName:
student.id + "_" + today.replace(/\//g,"-") + "_selfie.png",

signatureFileName:
student.id + "_" + today.replace(/\//g,"-") + "_signature.png"

};


// Save locally to prevent duplicate submissions
localStorage.setItem(
    attendanceKey,
    JSON.stringify(attendance)
);

// Send attendance to Google Apps Script
fetch("https://script.google.com/macros/s/AKfycbwYYNTlVOqDT7F8QeAZrAJE1AR29NnNJvOZCak8S1FgJKoedQI3vwIv9TULBu8oy0FPzg/exec", {
    method: "POST",
    headers: {
        "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(attendance)
})
.then(response => response.json())
.then(result => {

    if(result.success){

        alert("✅ Attendance Submitted Successfully!");

        window.location.href = "dashboard.html";

    }else{

        alert("❌ " + result.message);

    }

})
.catch(error => {

    console.error(error);

    alert("❌ Failed to connect to Google Sheets.");

});
}
