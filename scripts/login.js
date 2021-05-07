// JS for login.html

// Set up a user type variable to store the type of user signing up or logging in
var userType = null;

// Set up redirectUrl to be used with signInSuccessWithAuthResult function below
var redirectUrl = null;

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Call the getUserType function
getUserType();
var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            //------------------------------------------------------------------------------------------
            // The code below is modified from default snippet provided by the FB documentation.
            //
            // If the user is a "brand new" user, then create a new "user" in your own database.
            // Assign this user with the name and email provided.
            // Before this works, you must enable "Firestore" from the firebase console.
            // The Firestore rules must allow the user to write. 
            //------------------------------------------------------------------------------------------
            var user = authResult.user;
            if (authResult.additionalUserInfo.isNewUser) { //if new user
                db.collection("Users").doc(user.uid).set({ //write to firestore
                    Name: user.displayName, //"users" collection
                    Email: user.email, //with authenticated user's ID (user.uid)
                    User_Type: userType, //with user type "educator" or "student"
                })
                    .then(function () {
                        console.log("New user added to firestore");
                        if (userType === "educator") {
                            window.location.assign(
                                "/html/educator-new-home.html"
                            ); //re-direct to educator-new-home.html after signup
                        } else {
                            window.location.assign(
                                "/html/student-new-home.html"
                            ); //re-direct to student-new-home.html after signup
                        }

                    })
                    .catch(function (error) {
                        console.log("Error adding new user: " + error);
                    });
            } else {
                return true;
            }
            return false;
        },
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: redirectUrl,
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        //firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        //firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        //firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: '<your-tos-url>',
    // Privacy policy url.
    privacyPolicyUrl: '<your-privacy-policy-url>'
};
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

/**
 * Checks to see which radio button is selected (Educator or Student) and assigns userType to either
 * "educator" or "student." Also sets redirectUrl to the appropriate page.
 */
function getUserType() {
    if ($("#educator-radio").prop('checked')) {
        userType = "educator";
        redirectUrl = "/html/educator-home.html";
    } else {
        userType = "student";
        redirectUrl = "/html/student-home.html";
    }
}