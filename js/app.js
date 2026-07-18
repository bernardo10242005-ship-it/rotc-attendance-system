function loginStudent() {

    const id = document.getElementById("studentID").value.trim();

    const name = document
        .getElementById("studentName")
        .value
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

    document.getElementById("error").innerHTML = "";

    if (id.length !== 10) {
        document.getElementById("error").innerHTML =
            "Student Number must contain 10 digits.";
        return;
    }

    if (!id.startsWith("240104")) {
        document.getElementById("error").innerHTML =
            "Invalid Student Number.";
        return;
    }

    fetch("data/students.json")
        .then(response => response.json())
        .then(data => {

            const student = data.find(s =>
                s.id === id &&
                s.name
                    .trim()
                    .replace(/\s+/g, " ")
                    .toLowerCase() === name
            );

            if (student) {

                localStorage.setItem(
                    "student",
                    JSON.stringify(student)
                );

                window.location.href = "dashboard.html";

            } else {

                document.getElementById("error").innerHTML =
                    "Student Number or Name is incorrect.";

            }

        })
        .catch(error => {

            console.error(error);

            document.getElementById("error").innerHTML =
                "Unable to load student database.";

        });

}