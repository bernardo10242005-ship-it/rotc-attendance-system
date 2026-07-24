// ======================================================
// ROTC ATTENDANCE MANAGEMENT SYSTEM
// STUDENT LOGIN
// GOOGLE APPS SCRIPT MASTERLIST VERSION
// FLEXIBLE NAME MATCHING VERSION
// ======================================================


// ======================================================
// NORMALIZE NAME
//
// This function makes different ways of typing the same
// name easier to compare.
//
// Example:
//
// "BERNARDO, IAN CHRISTOPHER G."
//
// becomes:
//
// "bernardo ian christopher g"
//
// It removes:
// - Capitalization differences
// - Commas
// - Periods
// - Extra spaces
// ======================================================

function normalizeName(name) {

    return String(name || "")

        // Convert to lowercase
        .toLowerCase()

        // Remove commas
        .replace(/,/g, "")

        // Remove periods
        .replace(/\./g, "")

        // Replace multiple spaces with one space
        .replace(/\s+/g, " ")

        // Remove spaces at beginning/end
        .trim();

}


// ======================================================
// STUDENT LOGIN
// ======================================================

function loginStudent() {


    // ==================================================
    // GET INPUT ELEMENTS
    // ==================================================

    const idInput =
        document.getElementById(
            "studentID"
        );


    const nameInput =
        document.getElementById(
            "studentName"
        );


    const errorBox =
        document.getElementById(
            "error"
        );


    // ==================================================
    // CHECK INPUT ELEMENTS
    // ==================================================

    if (
        !idInput ||
        !nameInput ||
        !errorBox
    ) {

        console.error(
            "Student login input elements were not found."
        );

        return;

    }


    // ==================================================
    // GET STUDENT NUMBER
    // ==================================================

    const id =
        idInput.value
            .trim();


    // ==================================================
    // GET STUDENT NAME
    //
    // The name is normalized before checking.
    // ==================================================

    const name =
        normalizeName(
            nameInput.value
        );


    // ==================================================
    // CLEAR PREVIOUS MESSAGE
    // ==================================================

    errorBox.innerHTML = "";


    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (
        !/^\d{10}$/.test(id)
    ) {

        errorBox.innerHTML =
            "Student Number must contain exactly 10 digits.";

        return;

    }


    // ==================================================
    // CHECK EMPTY NAME
    // ==================================================

    if (!name) {

        errorBox.innerHTML =
            "Please enter your full name.";

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

        encodeURIComponent(
            id
        )

    )


    // ==================================================
    // CHECK SERVER RESPONSE
    // ==================================================

    .then(

        response => {

            if (
                !response.ok
            ) {

                throw new Error(
                    "Server returned an error."
                );

            }


            return response.json();

        }

    )


    // ==================================================
    // PROCESS GOOGLE APPS SCRIPT RESPONSE
    // ==================================================

    .then(

        student => {


            console.log(

                "GOOGLE MASTERLIST RESPONSE:",

                student

            );


            // ==================================================
            // STUDENT NOT FOUND
            // ==================================================

            if (
                !student.success
            ) {

                errorBox.innerHTML =

                    student.message ||

                    "Student number not found in MASTERLIST.";

                return;

            }


            // ==================================================
            // MASTERLIST NAME
            // ==================================================

            const masterlistName =

                normalizeName(

                    student.name

                );


            // ==================================================
            // FLEXIBLE NAME MATCHING
            //
            // The following are treated as equivalent:
            //
            // BERNARDO, IAN CHRISTOPHER G.
            // bernardo, ian christopher g.
            // Bernardo Ian Christopher G
            // BERNARDO IAN CHRISTOPHER G.
            //
            // Because normalizeName() removes:
            //
            // - Capitalization differences
            // - Commas
            // - Periods
            // - Extra spaces
            // ==================================================

            if (

                masterlistName !== name

            ) {


                console.log(

                    "NAME MISMATCH"

                );


                console.log(

                    "Masterlist Name:",

                    masterlistName

                );


                console.log(

                    "Entered Name:",

                    name

                );


                errorBox.innerHTML =

                    "Student Number or Name is incorrect.";

                return;

            }


            // ==================================================
            // CREATE STANDARD STUDENT OBJECT
            //
            // This makes sure the dashboard receives the
            // correct property names.
            // ==================================================

            const studentData = {


                // ==================================================
                // STUDENT INFORMATION
                // ==================================================

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



                // ==================================================
                // ROTC INFORMATION
                // ==================================================

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



                // ==================================================
                // MERITS AND DEMERITS
                // ==================================================

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
            // GO TO STUDENT DASHBOARD
            // ==================================================

            window.location.href =

                "dashboard.html";


        }

    )


    // ==================================================
    // HANDLE CONNECTION / SERVER ERROR
    // ==================================================

    .catch(

        error => {


            console.error(

                "MASTERLIST LOGIN ERROR:",

                error

            );


            errorBox.innerHTML =

                "Unable to connect to the student database. Please try again.";


        }

    );

}
