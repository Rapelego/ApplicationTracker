
/* =========================================
   CAREERTRACK APPLICATION TRACKER
   Manages job applications using Supabase
========================================= */

// =========================================
// GET HTML ELEMENTS
// =========================================

const form = document.getElementById("jobForm");
// Edit Application Modal Elements
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");

const editCompany = document.getElementById("editCompany");
const editRole = document.getElementById("editRole");
const editDate = document.getElementById("editDate");
const editStatus = document.getElementById("editStatus");
const editNotes = document.getElementById("editNotes");

const closeModal = document.getElementById("closeModal");
const cancelEdit = document.getElementById("cancelEdit");

// Stores the ID of the application being edited
let editingJobId = null;
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

        const notes = document.createElement("p");
notes.className = "muted";
notes.textContent = job.notes || "No notes added.";

        div.appendChild(heading);
        div.appendChild(role);
        div.appendChild(badge);
        div.appendChild(date);
        div.appendChild(notes);

        // Edit application button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "btn-edit";

        editButton.addEventListener("click", () => {
            editJob(job);
        });

        // Delete application button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "btn-delete";

        deleteButton.addEventListener("click", () => {
            deleteJob(job.id);
        });

        // Add buttons to the application card
        div.appendChild(editButton);
        div.appendChild(deleteButton);

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

/* =========================================
   EDIT APPLICATION
   Opens the modal and fills in existing details
========================================= */

function editJob(job) {

    // Store the application ID
    editingJobId = job.id;

    // Fill the form with the current application details
    editCompany.value = job.company;
    editRole.value = job.role;
    editDate.value = job.application_date;
    editStatus.value = job.status;
    editNotes.value = job.notes || "";

    // Display the modal
    editModal.hidden = false;
}


// =========================================
// DELETE APPLICATION
// =========================================

async function deleteJob(jobId) {

    // Ask the user to confirm deletion
    const confirmDelete = confirm(
        "Are you sure you want to delete this application?"
    );

    if (!confirmDelete) {
        return;
    }

    // Delete the application from Supabase
    const { error } = await supabaseClient
        .from("applications")
        .delete()
        .eq("id", jobId);

    if (error) {
        appMessage.textContent =
            "Could not delete application: " + error.message;
        return;
    }

    appMessage.textContent = "Application deleted successfully!";

    // Refresh the dashboard
    await loadJobs();
}


// =========================================
// INITIALISE DASHBOARD
// =========================================
/* =========================================
   CLOSE EDIT APPLICATION MODAL
========================================= */

// Close using the X button
closeModal.addEventListener("click", closeEditModal);

// Close using the Cancel button
cancelEdit.addEventListener("click", closeEditModal);

function closeEditModal() {
    editModal.hidden = true;
    editForm.reset();
    editingJobId = null;
}
// Load the signed-in user's applications
loadJobs();

/* =========================================
   SAVE EDITED APPLICATION
========================================= */

editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!editingJobId) {
        return;
    }

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        appMessage.textContent = "Please sign in again.";
        return;
    }

    const updatedApplication = {
        company: editCompany.value.trim(),
        role: editRole.value.trim(),
        application_date: editDate.value,
        status: editStatus.value,
        notes: editNotes.value.trim()
    };

    const { error } = await supabaseClient
        .from("applications")
        .update(updatedApplication)
        .eq("id", editingJobId)
        .eq("user_id", userData.user.id);

    if (error) {
        appMessage.textContent = "Could not update application: " + error.message;
        return;
    }

    // Close and reset the modal
    editModal.hidden = true;
    editForm.reset();
    editingJobId = null;

    appMessage.textContent = "Application updated successfully!";

    // Refresh the application list
    await loadJobs();
});
