function loginStudent() {

    const id =
        document
            .getElementById("studentID")
            .value
            .trim();

    const name =
        document
            .getElementById("studentName")
            .value
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();

    const errorBox =
        document
            .getElementById("error");

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
    // GOOGLE APPS SCRIPT WEB APP
    // ==================================================

    const API_URL =
        "https://script.google.com/macros/s/AKfycbzmqVoMihTcRZkRLhwgmCWK9zSv1bgP6W2YL0aEUio2bX340vPCdpVQ6uJD3lGNq3J_4A/exec";


    // ==================================================
    // LOOK UP STUDENT FROM GOOGLE MASTERLIST
    // ==================================================

    errorBox.innerHTML =
        "Checking student information...";


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

    .then(student => {

        console.log(
            "MASTERLIST RESPONSE:",
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
        // CHECK NAME
        // ==================================================

        const masterlistName =
            String(
                student.name || ""
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
        // SAVE STUDENT INFORMATION
        // ==================================================

        localStorage.setItem(

            "student",

            JSON.stringify(
                student
            )

        );


        // ==================================================
        // LOGIN SUCCESS
        // ==================================================

        window.location.href =
            "dashboard.html";

    })

    .catch(error => {

        console.error(
            "MASTERLIST LOGIN ERROR:",
            error
        );

        errorBox.innerHTML =
            "Unable to connect to the student database. Please try again.";

    });

}
