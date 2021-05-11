// JS for educator-create-group.js

var noInput = false;

/**
 * Implement a character limit counter.
 * 
 * @param {*} field - DOM-element that characters are being counted in
 * @param {*} field2 - ID of the DOM-element displaying the number of characters remaining
 * @param {*} maxlimit - Maximum number of characters allowed in "field"
 * @returns - false if the character limit has been exceeded
 */
function charCounter(field, field2, maxlimit) {
    var countfield = document.getElementById(field2);
    if (field.value.length > maxlimit) {
        field.value = field.value.substring(0, maxlimit);
        return false;
    } else {
        countfield.value = maxlimit - field.value.length;
    }
}

/**
 * Write a class to Firestore.
 * 
 * @param nickname - String containing the name of the group to be created
 */
function addClass(description, nickname) {
    db.collection("Classes").doc(nickname).set({
        Class_Name: description,
        Class_Nickname: nickname, 
        Class_Owner: firebase.auth().currentUser.displayName,
        Owner_Email: firebase.auth().currentUser.email,
        Class_Points: 0,
        Date_Created: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(() => {
            console.log("Group successfully written!");
        })
        .catch((error) => {
            console.error("Error adding group: ", error);
        });
}

/**
 * Make sure the user has input a group name.
 * 
 * @param nickname - String containing the name of the group to be created
 */
function checkInput(description, nickname) {
    if (description == null || nickname == null || description == "" || nickname === "") {
        noInput = true;
        $("#feedback").html("Please enter a class description and nickname");
        $("#feedback").css({
            color: "red"
        });
        $("#feedback").show(0);
        $("#feedback").fadeOut(2500);
    } else {
        noInput = false;
    }
}

/**
 * Deal with submission click in the appropriate manner.
 */
function onClickSubmit() {
    let description = document.getElementById("class-description").value;
    let nickname = document.getElementById("class-nickname").value;
    checkInput(description, nickname);
    if (noInput == false) {
        // Add group to Firestore
        addClass(description, nickname);
        // Display success message and direct users back to the main page
        let feedback = document.getElementById("feedback");
        feedback.innerHTML = "Success! Please wait...";
        $(feedback).css({
            color: "green"
        });
        $(feedback).show(0);
        $(feedback).fadeOut(2500);
        setTimeout(function () {
            location.href = "educator-add-students.html?classname=" + nickname;
        }, 2300);
    }
}
