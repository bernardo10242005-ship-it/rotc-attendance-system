const student = JSON.parse(localStorage.getItem("student"));

if (!student) {

window.location = "login.html";

}

document.getElementById("studentName").innerHTML = student.name;
document.getElementById("studentID").innerHTML = student.id;
document.getElementById("course").innerHTML = student.course;
document.getElementById("year").innerHTML = student.year;
document.getElementById("flight").innerHTML = student.flight;

function updateClock(){

const now = new Date();

document.getElementById("today").innerHTML =
now.toLocaleDateString("en-PH",{
weekday:"long",
year:"numeric",
month:"long",
day:"numeric"
});

document.getElementById("clock").innerHTML =
now.toLocaleTimeString("en-PH");

}

updateClock();

setInterval(updateClock,1000);

function logout(){

localStorage.removeItem("student");

window.location="index.html";

}