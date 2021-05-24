// JS for student-submit-quest.js

// Pull quest and user IDs from URL
const parsedUrl = new URL(window.location.href);
var questID = parsedUrl.searchParams.get("questid");
var userIDs = [];
userIDs.push(parsedUrl.searchParams.get("userid"));

var userNames = [];
var className;
var educatorName;
var educatorID;
var questDescription;
var uniqueQuestID;

var validInput = false;
var tempImagesDeleted = false;

// Create empty arrays to store files added to this quest and their URLs
var uploadedImageFiles = [];
var imageURLs = [];

/**
 * CITE - Implement a character limit counter.
 * Taken from https://www.sitepoint.com/community/t/javascript-form-elements-character-countdown-loop-through-form-elements/342603.
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
 * Write this
 */
function checkNumUploaded() {
    const maxImages = 3;
    if (className) {
        let message = "<div class='text-container'><p class='message'>You haven't uploaded any "
            + "images</p><img src='/img/question_icon.png' tabindex='0' role='button' id='image-info' data-bs-toggle='popover' "
            + "data-bs-content='Add up to 3 images that prove youve completed this task.' data-bs-container='body'>"
            + "</div>"
        if (uploadedImageFiles.length == maxImages) {
            $("#upload-image-input").attr("disabled", "");
        } else if (uploadedImageFiles.length == 0) {
            $(".uploaded-images").append(message);
        } else {
            $("#upload-image-input").removeAttr("disabled");
            if ($(".message")) {
                $(".message").remove();
            }
        }
    }
    // Popover code (taken from https://getbootstrap.com/docs/5.0/components/popovers/)
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })
}
/**
 * Write this.
 */
function storeTemporaryImage(image) {
    $("#" + image.name).attr("data-target", "modalCenter");
    let storageRef = getStorageRef(image, true);
    storageRef.put(image)
        .then(function () {
            console.log('Uploaded to temp Cloud storage');
            storageRef.getDownloadURL()
                .then(function (url) {
                    console.log(url);
                    image.tempURL = url;
                })
        });
}

/**
 * CITE - Write this.
 */
function processImage() {
    const imageInput = document.getElementById("upload-image-input");
    imageInput.addEventListener('change', function (event) {
        console.log(event.target.files[0]);
        uploadedImageFiles.push(event.target.files[0]);
        storeTemporaryImage(event.target.files[0]);
        addNamesToDOM();
    });
}

/**
 * Write this
 */
function resetDOM() {
    var uploadedImages = document.getElementsByClassName('list-item');
    while (uploadedImages[0]) {
        uploadedImages[0].parentNode.removeChild(uploadedImages[0]);
    }
}

/**
 * Write this.
 * 
 * @param {*} element 
 */
function showPreview(element) {
    $(".modal-body").html("");
    setTimeout(() => {
        let previewName = null;
        let previewURL = null;
        // console.log(uploadedImageFiles);
        // console.log($(element).attr("id"));
        // console.log($(element).attr("id") == uploadedImageFiles[0].name);
        // console.log(uploadedImageFiles[0].tempURL);
        for (var i = 0; i < uploadedImageFiles.length; i++) {
            if (uploadedImageFiles[i].name == $(element).attr("id")) {
                previewName = uploadedImageFiles[i].name;
                previewURL = uploadedImageFiles[i].tempURL;
            }
        }
        if (previewName) {
            $(".modal-title").html(previewName);
            $(".modal-body").html("<img src='" + previewURL + "'>");
        } else {
            $(".modal-title").html("No preview available");
            $(".modal-body").html("Sorry, we couldn't generate a preview for you.");
        }
    }, 1000);
}

/**
 * Write this
 */
function addNamesToDOM() {
    resetDOM();
    for (var i = 0; i < uploadedImageFiles.length; i++) {
        let imageDOM = "<li class='list-item'><a class='uploaded-image' id='" +
            uploadedImageFiles[i].name + "' data-bs-toggle='modal' data-bs-target='#imagePreview' onclick='showPreview(this)'>" +
            uploadedImageFiles[i].name + "</a><img src='/img/remove_icon.png' class='remove-icon' id='delete-" +
            uploadedImageFiles[i].name + "' onclick='removeImage(this)'></li>";
        $(".uploaded-images").append(imageDOM);
    }
    checkNumUploaded();
    $("#upload-image-input").prop("value", null);
}

/**
 * Write this
 */
function removeImage(element) {
    let imageName = $(element).attr("id");
    imageName = imageName.replace("delete-", "");
    let index = null;
    for (var i = 0; i < uploadedImageFiles.length; i++) {
        if (uploadedImageFiles[i].name === imageName) {
            index = i;
        }
    }
    if (index >= 0) {
        uploadedImageFiles.splice(index, 1);
    }
    addNamesToDOM();
}

/**
 * CITE and write
 */
function getStorageRef(file, temp) {
    let imageID = file.lastModified;
    // Create a storage reference
    let storageRef = storage.ref();
    if (!temp) {
        storageRef = storageRef.child("images/quests/" + imageID + ".jpg");
    } else {
        storageRef = storageRef.child("images/temp/" + imageID + ".jpg");
    }
    return storageRef;
}

/* Get the current user's name, class name, educator name, and ID from Firestore. */
function getCurrentStudent() {
    db.collection("Students").doc(userIDs[0])
        .get()
        .then(function (doc) {
            // Extract the current student's class name
            userNames.push(doc.data().Student_Name);
            className = doc.data().Student_Class;
            educatorName = doc.data().Student_Educator;
            if (className == null) {
                let message = "<div class='text-container'><p class='message'>You haven't been added to a class yet</p></div>"
                $(".uploaded-images").append(message);
                $("#card-button-container-1").remove();
                $("#upload-image-input").attr("disabled", "");
                $("#quest-notes").attr("disabled", "");
                $("#quest-notes").attr("placeholder", "Ask your teacher to add you to their class to start getting quests");
            }
            getQuestDescription();
            getUniqueQuestID();
            checkNumUploaded();
            getEducatorID();
            processImage();
            addSubmittersToDOM();
        });
}

/**
 * Write this.
 */
function addSubmittersToDOM() {
    for (var i = 0; i < userNames.length; i++) {
        if (i == 0) {
            let submitterName = "<li id='submitter->" + i + "'><p>" + userNames[i] + "</p>"
                + "<img src='/img/remove_icon_grey.png' class='remove-icon'></li>";
            $("#submitter-list").append(submitterName);
        }
    }
}

/**
 * Write this.
 */
function getEducatorID() {
    db.collection("Educators")
        .where("Educator_Name", "==", educatorName)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                educatorID = doc.id;
            })
        })
        .catch((error) => {
            console.log("Error getting educator ID: ", error);
        });
}

/**
 * Write this.
 */
function getQuestDescription() {
    console.log(questID);
    db.collection("Quests").doc(questID)
        .get()
        .then(function (doc) {
            questDescription = doc.data().description;
            console.log("Quest description successfully retrieved");
        })
        .catch((error) => {
            console.error("Error retrieving quest description: ", error);
        });
}

/**
 * Write this.
 */
function getUniqueQuestID() {
    db.collection("Students").doc(userIDs[0]).collection("Quests")
        .where("Quest_Status", "==", "active")
        .get()
        .then((querySnapshot) => {
            // There should only ever be one quest at a time
            querySnapshot.forEach((doc) => {
                uniqueQuestID = doc.id;
            })
        })
        .catch((error) => {
            console.log("Error getting unique quest ID: ", error);
        });
}


/**
 * Write this
 */
function updateQuestStatus() {
    db.collection("Students").doc(userIDs[0]).update({
        Student_Quest: false
    })
        .then(() => {
            console.log("Student quest status succesfully updated!");
        })
        .catch((error) => {
            console.error("Error updating student quest status: ", error);
        });
}

/**
 * Write this.
 * 
 * @param {*} imageURLs 
 */
function addQuestToDB(imageURLs) {
    let dateSubmitted = new Date();
    // Update quest in student's quest collection
    db.collection("Students").doc(userID[0]).collection("Quests").doc(uniqueQuestID).update({
        Quest_Status: "submitted",
        Date_Submitted: dateSubmitted
    })
        .then(() => {
            console.log("Student quest successfully updated!");
            updateQuestStatus();
            // Write quest to teacher's quest collection
            db.collection("Educators").doc(educatorID).collection("Quests").doc(uniqueQuestID).set({
                Quest_Submitters: userNames,
                Submitter_IDs: userIDs,
                Submitter_Class: className,
                Quest_Description: questDescription,
                Quest_Photos: imageURLs,
                Quest_Notes: $("#quest-notes").prop("value"),
                Date_Submitted: dateSubmitted
            })
                .then(() => {
                    console.log("Educator quest successfully written!");
                    $("#feedback").html("Success! Please wait...");
                    $("#feedback").css({ color: "green" });
                    $("#feedback").show(0);
                    $("#feedback").fadeOut(1000);
                    deleteTempImages("./student-home.html");
                })
                .catch((error) => {
                    console.error("Error adding educator quest: ", error);
                });
        })
        .catch((error) => {
            console.error("Error updating student quest: ", error);
        });
}

/**
 * Write this.
 * 
 * @param {*} link 
 */
function deleteTempImages(redirectLink) {
    let storageRef = storage.ref();
    deleteRef = storageRef.child("images/temp");
    deleteRef.listAll()
        .then((res) => {
            res.items.forEach((itemRef) => {
                itemRef.delete();
            });
            tempImagesDeleted = true;
            if (redirectLink != null || redirectLink != "") {
                setTimeout(function () {
                    location.href = redirectLink;
                }, 1000);
            }
        })
        .catch((error) => {
            console.error("Error deleting temp images: ", error);
        });
}

/**
 * Make sure the user has attached either photos or a note to their submission.
 */
function checkInput() {
    console.log(uploadedImageFiles.length);
    if (($("#quest-notes").prop("value") == null || $("#quest-notes").prop("value") === "") && uploadedImageFiles.length == 0) {
        $("#feedback").html("Attach a photo or enter quest notes");
        $("#feedback").css({
            color: "red"
        });
        $("#feedback").show(0);
        $("#feedback").fadeOut(2000);
    } else {
        validInput = true;
    }
}

/**
 * Write this.
 */
function generateImageURLs() {
    for (var i = 0; i < uploadedImageFiles.length; i++) {
        let storageRef = getStorageRef(uploadedImageFiles[i], false);
        console.log(storageRef);
        storageRef.put(uploadedImageFiles[i])
            .then(function () {
                console.log('Uploaded to Cloud storage');
                storageRef.getDownloadURL()
                    .then(function (url) {
                        console.log(url);
                        imageURLs.push(url);
                        console.log(imageURLs);
                        /* Once list of permanent URLs is complete, create quest documents in the student's and 
                           their teacher's quest collection (include array of image URLs as an attribute) */
                        if (i == (uploadedImageFiles.length)) {
                            addQuestToDB(imageURLs);
                        };
                    })
            });
    }
}

/**
 * Write this.
 *  * Adapted from: https://stackoverflow.com/questions/47935571/how-to-keep-the-radio-button-remain-checked-after-the-refresh
 */
function onClickAddFriends() {
    sessionStorage.setItem("previousData", JSON.stringify({ "imageURLs": imageURLs }));
    sessionStorage.setItem("previousData", JSON.stringify({ "notes": $("#quest-notes").prop("value") }));
    window.location.assign("./student-add-friends.html?questid=" + questID + "&uniquequestid=" + uniqueQuestID);
}

/**
 * CITE and write this
 */
function onClickSubmit() {
    checkInput();
    console.log(validInput);
    if (validInput) {
        if (uploadedImageFiles.length == 0) {
            addQuestToDB(imageURLs);
        } else {
            // Generate image URLs and add them to an array
            generateImageURLs();
        }
    }
}

/**
 * Write this.
 */
function onClickHome() {
    deleteTempImages("./student-home.html");
}

/**
 * Write this.
 * Taken from https://stackoverflow.com/questions/3252730/how-to-prevent-a-click-on-a-link-from-jumping-to-top-of-page
 */
$(".button").click(function (event) {
    event.preventDefault();
})


/**
 * Write this.
 */
$(document).ready(function () {
    getCurrentStudent();
    var previousData = sessionStorage.getItem("previousData");
    if (previousData.imageURLs !== null) {
        imageURLs = JSON.parse(existingURLs).imageURLs;
    }
    if (previousData.notes !== null) {
        $("#quest-notes").prop("value", JSON.parse(previousData).notes);
    }
    sessionStorage.clear();
});