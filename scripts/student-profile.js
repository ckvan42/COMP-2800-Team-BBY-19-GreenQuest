// JS for student-profile.html

// Pull user ID from URL
const parsedUrl = new URL(window.location.href);
var userID = parsedUrl.searchParams.get("userid");

var userName;
var userPoints;
var profilePic;

/**
 * Write this.
 */
function getUserInfo() {
    db.collection("Students").doc(userID)
        .get()
        .then(function (doc) {
            userName = doc.data().Student_Name;
            userPoints = doc.data().Student_Points;
            profilePic = doc.data().Student_Profile_Pic;
            populateDOM();
            populateHeading();
        })
}

/**
 * Write this.
 */
function populateDOM() {
    $("#profile-name").html(userName);
    $("#profile-points").html(userPoints);
}

/**
 * Write this.
 */
function populateHeading() {
    $(".page-heading").html(userName + "\'s Page");
}

// Run function when document is ready 
$(document).ready(function () {
    getUserInfo();
});



//broken code below
let file = {};

function chooseFile(e) {
    file = e.target.files[0];
    console.log(file);
}

$("#file").change(function(){
    firebase.storage().ref('user/' + userID + '/profile.jpg').put(file).then(function () {
        console.log("successfully uploaded a image")
    }).catch(error => {
        console.log(error.message);
    })
});