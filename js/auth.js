
/* =========================================
   CAREERTRACK AUTHENTICATION
   Handles login and registration through Supabase
========================================= */

// =========================================
// GET HTML ELEMENTS
// =========================================

// Login elements
const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");

// Registration elements
const signupForm = document.getElementById("signupForm");
const signupButton = document.getElementById("signupButton");

// Authentication sections
const loginSection = document.getElementById("loginSection");
const signupSection = document.getElementById("signupSection");

// Form switching links
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

// Message area
const authMessage = document.getElementById("authMessage");


// =========================================
// SWITCH BETWEEN LOGIN AND REGISTRATION
// =========================================

// Show registration form
showSignup.addEventListener("click", (event) => {
    event.preventDefault();

    loginSection.hidden = true;
    signupSection.hidden = false;

    authMessage.textContent = "";
});

// Show login form
showLogin.addEventListener("click", (event) => {
    event.preventDefault();

    signupSection.hidden = true;
    loginSection.hidden = false;

    authMessage.textContent = "";
});


// =========================================
// USER LOGIN
// =========================================

loginForm.addEventListener("submit", async (event) => {

    // Prevent the browser from refreshing the page
    event.preventDefault();

    // Collect login details
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Show loading feedback
    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";
    authMessage.textContent = "";

    try {

        // Authenticate the user through Supabase
        const { error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            throw error;
        }

        authMessage.textContent = "Login successful! Opening your dashboard...";

        // Open the main dashboard
        window.location.href = "index.html";

    } catch (error) {

        authMessage.textContent = error.message;

    } finally {

        // Restore the login button
        loginButton.disabled = false;
        loginButton.textContent = "Sign In";
    }

});


// =========================================
// USER REGISTRATION
// =========================================

signupForm.addEventListener("submit", async (event) => {

    // Prevent the browser from refreshing the page
    event.preventDefault();

    // Collect registration details
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Check whether the passwords match
    if (password !== confirmPassword) {
        authMessage.textContent = "Passwords do not match.";
        return;
    }

    // Show loading feedback
    signupButton.disabled = true;
    signupButton.textContent = "Creating account...";
    authMessage.textContent = "";

    try {

        // Create a new Supabase account
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            throw error;
        }

        // Handle email confirmation if required
        if (data.user && !data.session) {

            authMessage.textContent =
                "Account created! Please check your email to confirm your account.";

        } else {

            authMessage.textContent =
                "Account created successfully! You can now sign in.";

            signupForm.reset();
            signupSection.hidden = true;
            loginSection.hidden = false;
        }

    } catch (error) {

        authMessage.textContent = error.message;

    } finally {

        // Restore the registration button
        signupButton.disabled = false;
        signupButton.textContent = "Create Account";
    }

});
