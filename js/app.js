const form = document.getElementById("jobForm");
const jobsContainer = document.getElementById("jobsContainer");
const filterButtons = document.querySelectorAll(".filters button");
const toggle = document.getElementById("darkToggle");

let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
let currentFilter = "All";

/* Dark Mode */
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

/* Add Job */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const job = {
    id: Date.now(),
    company: company.value,
    role: role.value,
    date: date.value,
    status: status.value,
    notes: notes.value
  };

  jobs.push(job);
  saveJobs();
  renderJobs();
  form.reset();
});

/* Save to LocalStorage */
function saveJobs() {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

/* Render Jobs */
function renderJobs() {
  jobsContainer.innerHTML = "";

  const filtered = currentFilter === "All"
    ? jobs
    : jobs.filter(job => job.status === currentFilter);

  filtered.forEach(job => {
    const div = document.createElement("div");
    div.className = "job-card";

    div.innerHTML = `
      <h3>${job.company}</h3>
      <p>${job.role}</p>
      <span class="badge ${job.status}">${job.status}</span>
      <p class="muted">${job.date}</p>
    `;

    jobsContainer.appendChild(div);
  });

  updateStats();
}

/* Filters */
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderJobs();
  });
});

/* Stats */
function updateStats() {
  totalJobs.textContent = jobs.length;
  appliedJobs.textContent = jobs.filter(j => j.status === "Applied").length;
  interviewJobs.textContent = jobs.filter(j => j.status === "Interview").length;
  offerJobs.textContent = jobs.filter(j => j.status === "Offer").length;
}

/* Initial Load */
renderJobs();
