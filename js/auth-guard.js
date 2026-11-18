
/* =========================================
   CAREERTRACK AUTH GUARD
   Checks whether a user is signed in
========================================= */

async function checkUserSession() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
        // Redirect users who are not signed in
        window.location.href = "auth.html";
        return;
    }

    // User is signed in
    console.log("Authenticated user:", data.session.user.email);
}

// Run the session check
checkUserSession();
