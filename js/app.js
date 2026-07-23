// ======================================================
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// STUDENT LOGIN
// GOOGLE APPS SCRIPT MASTERLIST VERSION
// ======================================================

function loginStudent() {

    // ==================================================
    // GET INPUTS
    // ==================================================

    const idInput =
        document.getElementById("studentID");

    const nameInput =
        document.getElementById("studentName");

    const errorBox =
        document.getElementById("error");


    // ==================================================
    // GET VALUES
    // ==================================================

    const id =
        idInput.value
            .trim();

    const name =
        nameInput.value
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();


    // ==================================================
    // CLEAR ERROR
    // ==================================================

    errorBox.innerHTML = "";


    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (!/^\d{10}$/.test(id)) {

        errorBox.innerHTML =
            "Student Number must contain exactly 10 digits.";

        return;

    }


    // ==================================================
    // GOOGLE APPS SCRIPT WEB APP URL
    // ==================================================

    const API_URL =
        "https://script.google.com/macros/s/AKfycbzmqVoMihTcRZkRLhwgmCWK9zSv1bgP6W2YL0aEUio2bX340vPCdpVQ6uJD3lGNq3J_4A/exec";


    // ==================================================
    // SHOW LOADING MESSAGE
    // ==================================================

    errorBox.innerHTML =
        "Checking student information...";


    // ==================================================
    // REQUEST STUDENT FROM GOOGLE MASTERLIST
    // ==================================================

    fetch(
        API_URL +
        "?action=getStudent&studentNumber=" +
        encodeURIComponent(id)
    )

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "Server returned an error."
            );

        }

        return response.json();

    })


    // ==================================================
    // PROCESS GOOGLE APPS SCRIPT RESPONSE
    // ==================================================

    .then(student => {

        console.log(
            "GOOGLE MASTERLIST RESPONSE:",
            student
        );


        // ==================================================
        // STUDENT NOT FOUND
        // ==================================================

        if (!student.success) {

            errorBox.innerHTML =
                student.message ||
                "Student number not found in MASTERLIST.";

            return;

        }


        // ==================================================
        // CHECK STUDENT NAME
        // ==================================================

        const masterlistName =

            String(
                student.name ||
                ""
            )
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();


        if (
            masterlistName !==
            name
        ) {

            errorBox.innerHTML =
                "Student Number or Name is incorrect.";

            return;

        }


        // ==================================================
        // CREATE STANDARD STUDENT OBJECT
        //
        // This makes sure your dashboard uses the
        // correct property names.
        // ==================================================

        const studentData = {

            // Student information

            studentNumber:
                student.studentNumber ||
                id,

            name:
                student.name ||
                "",

            section:
                student.section ||
                "",

            subjectCode:
                student.subjectCode ||
                "",

            email:
                student.email ||
                "",

            instructor:
                student.instructor ||
                "",

            masterlistDate:
                student.masterlistDate ||
                "",


            // ROTC information

            course:
                student.course ||
                "",

            year:
                student.year ||
                "",

            flight:
                student.flight ||
                "",

            studentType:
                student.studentType ||
                "REGULAR",


            // Merits and demerits

            merits:
                student.merits ||
                "0",

            demerits:
                student.demerits ||
                "0"

        };


        // ==================================================
        // SAVE STUDENT DATA
        // ==================================================

        localStorage.setItem(

            "student",

            JSON.stringify(
                studentData
            )

        );


        // ==================================================
        // LOGIN SUCCESS
        // ==================================================

        console.log(
            "LOGIN SUCCESS:",
            studentData
        );


        // ==================================================
        // GO TO DASHBOARD
        // ==================================================

        window.location.href =
            "dashboard.html";

    })


    // ==================================================
    // HANDLE ERROR
    // ==================================================

    .catch(error => {

        console.error(
            "MASTERLIST LOGIN ERROR:",
            error
        );


        errorBox.innerHTML =
            "Unable to connect to the student database. Please try again.";

    });

}
