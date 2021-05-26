// JS for student-all-students.js

var currentStudent = null;

var students = [];
var firstPlace = 0;
var secondPlace = 0;
var thirdPlace = 0;

/**
 * Get the current user's name and class name from Firestore.
 */
function getCurrentStudent() {
    firebase.auth().onAuthStateChanged(function (somebody) {
        if (somebody) {
            db.collection("Students")
                .doc(somebody.uid)
                // Read
                .get()
                .then(function (doc) {
                    // Extract the current student's name
                    currentStudent = doc.data().Student_Name;
                    getStudents();
                });
        }
    });
}

/**
 * Write this.
 */
function populateStudentList(currentStudent) {
    for (var i = 0; i < students.length; i++) {
        let studentContainer = "<div class='student-container' id='student-container-" + i + "'></div>";
        $(".student-list").append(studentContainer);
        let ribbonContainer = "<div class='ribbon-container' id='ribbon-container-" + i + "'></div>";
        $("#student-container-" + i).append(ribbonContainer);
        if (students[i].points == firstPlace) {
            var ribbon = "<img src='/img/gold_ribbon.png'>";
        } else if (students[i].points == secondPlace) {
            var ribbon = "<img src='/img/silver_ribbon.png'>";
        } else if (students[i].points == thirdPlace) {
            var ribbon = "<img src='/img/bronze_ribbon.png'>";
        } else {
            ribbon = null;
        }
        $("#ribbon-container-" + i).append(ribbon);
        let studentName = "<p class='student-name' id='student-name-" + i + "'>" + students[i].name + "</p>";
        $("#student-container-" + i).append(studentName);
        // Different container color for student
        if (students[i].name == currentStudent) {
            $("#student-container-" + i).addClass("current-student-container");
        }
        let studentPoints = "<p class='student-points' id='student-points-" + i + "'>" + students[i].points + "</p>";
        $("#student-container-" + i).append(studentPoints);

        let leafIcon = "<img id='leaf-icon' src='/img/leaf_icon.png'>"
        $("#student-container-" + i).append(leafIcon);
    }
}

/**
 * Write this.
 * Taken from https://www.w3schools.com/js/js_array_sort.asp (sorting algorithm)
 */
 function getTopScores() {
    let studentScores = [];
    for (var i = 0; i < students.length; i++) {
        studentScores.push(students[i].points);
    }
    studentScores.sort(function (a, b) { return b - a });
    studentScores = new Set(studentScores);
    let iterator = studentScores.values();
    if (studentScores.size >= 3) {
        firstPlace = iterator.next().value;
        secondPlace = iterator.next().value;
        thirdPace = iterator.next().value;
    } else if (studentScores == 2) {
        firstPlace = iterator.next().value;
        secondPlace = iterator.next().value;
    } else if (studentScores == 1) {
        firstPlace = iterator.next().value;
    }
    populateStudentList(currentStudent);
}

/** 
 * Reads the students' names and scores from Firestore and puts them into an array.
 */
function getStudents() {
    db.collection("Students")
        .orderBy("Student_Points", "desc")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let studentObject = { "name": doc.data().Student_Name, "points": doc.data().Student_Points.toString() };
                students.push(studentObject);
            });
            getTopScores();
        })
}

/**
 * Call function when the page is ready.
 */
$(document).ready(function () {
    getCurrentStudent();
});
