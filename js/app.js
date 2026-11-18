
/* =========================================
   CAREERTRACK APPLICATION TRACKER
   Manages job applications using Supabase
========================================= */

// =========================================
// GET HTML ELEMENTS
// =========================================

const form = document.getElementById("jobForm");
const jobsContainer = document.getElementById("jobsContainer");
const filterButtons = document.querySelectorAll(".filters button");
const toggle = document.getElementById("darkToggle");
const appMessage = document.getElementById("appMessage");

// Form fields
const companyInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const dateInput = document.getElementById("date");
const statusInput = document.getElementById("status");
const notesInput = document.getElementById("notes");

// Statistics
const totalJobs = document.getElementById("totalJobs");
const appliedJobs = document.getElementById("appliedJobs");
const interviewJobs = document.getElementById("interviewJobs");
const offerJobs = document.getElementById("offerJobs");

// =========================================
// APPLICATION DATA
// =========================================

// Applications loaded from Supabase
let jobs = [];

// Currently selected filter
let currentFilter = "All";

// =========================================
// DARK MODE
// =========================================

toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

// =========================================
// LOAD APPLICATIONS FROM SUPABASE
// =========================================

async function loadJobs() {

    appMessage.textContent = "Loading applications...";

    // Get the currently signed-in user
    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        window.location.href = "auth.html";
        return;
    }

    // Retrieve only this user's applications
    const { data, error } = await supabaseClient
        .from("applications")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

    if (error) {
        appMessage.textContent = "Could not load applications: " + error.message;
        return;
    }

    // Store retrieved applications
    jobs = data;

    appMessage.textContent = "";

    // Display applications
    renderJobs();
}

// =========================================
// ADD NEW APPLICATION
// =========================================

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get the signed-in user
    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        window.location.href = "auth.html";
        return;
    }

    // Prepare application information
    const job = {
        user_id: userData.user.id,
        company: companyInput.value.trim(),
        role: roleInput.value.trim(),
        application_date: dateInput.value,
        status: statusInput.value,
        notes: notesInput.value.trim()
    };

    // Disable the button while saving
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    appMessage.textContent = "";

    try {
        // Save application to Supabase
        const { error } = await supabaseClient
            .from("applications")
            .insert([job]);

        if (error) {
            throw error;
        }

        appMessage.textContent = "Application saved successfully!";

        // Clear the form
        form.reset();

        // Reload applications from database
        await loadJobs();

    } catch (error) {
        appMessage.textContent = "Could not save application: " + error.message;

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Add Job";
    }
});

// =========================================
// DISPLAY APPLICATIONS
// =========================================

function renderJobs() {

    // Clear the current application list
    jobsContainer.innerHTML = "";

    // Apply the selected status filter
    const filteredJobs = currentFilter === "All"
        ? jobs
        : jobs.filter(job => job.status === currentFilter);

    // Display a message if no applications exist
    if (filteredJobs.length === 0) {
        jobsContainer.textContent = "No applications found.";
    }

    // Create a card for each application
    filteredJobs.forEach(job => {

        const div = document.createElement("div");
        div.className = "job-card";

        const heading = document.createElement("h3");
        heading.textContent = job.company;

        const role = document.createElement("p");
        role.textContent = job.role;

        const badge = document.createElement("span");
        badge.className = "badge " + job.status;
        badge.textContent = job.status;

        const date = document.createElement("p");
        date.className = "muted";
        date.textContent = job.application_date;

        div.appendChild(heading);
        div.appendChild(role);
        div.appendChild(badge);
        div.appendChild(date);

        jobsContainer.appendChild(div);
    });

    // Refresh dashboard statistics
    updateStats();
}

// =========================================
// APPLICATION FILTERS
// =========================================

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Remove active styling from all filter buttons
        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        // Highlight the selected filter
        button.classList.add("active");

        // Update the current filter
        currentFilter = button.dataset.filter;

        // Refresh the application list
        renderJobs();
    });

});

// =========================================
// UPDATE DASHBOARD STATISTICS
// =========================================

function updateStats() {

    // Total number of applications
    totalJobs.textContent = jobs.length;

    // Applications with Applied status
    appliedJobs.textContent = jobs.filter(job =>
        job.status === "Applied"
    ).length;

    // Applications with Interview status
    interviewJobs.textContent = jobs.filter(job =>
        job.status === "Interview"
    ).length;

    // Applications with Offer status
    offerJobs.textContent = jobs.filter(job =>
        job.status === "Offer"
    ).length;
}

// =========================================
// INITIALISE DASHBOARD
// =========================================

// Load the signed-in user's applications
loadJobs();
