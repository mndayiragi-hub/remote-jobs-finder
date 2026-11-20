const listEl = document.getElementById("jobs");
const statusEl = document.getElementById("status");
const searchEl = document.getElementById("search");
const categoryEl = document.getElementById("category");
const sortEl = document.getElementById("sort");
let jobs = [];

function line(cls, text) {
  const p = document.createElement("p");
  p.className = cls;
  p.textContent = text;
  return p;
}

function card(j) {
  const el = document.createElement("article");
  el.className = "card";
  const h = document.createElement("h3");
  const a = document.createElement("a");
  a.textContent = j.title;
  if (typeof j.url === "string" && j.url.startsWith("https://")) {
    a.href = j.url;
    a.target = "_blank";
    a.rel = "noopener";
  }
  h.appendChild(a);
  el.appendChild(h);
  el.appendChild(line("meta", j.company_name + " - " + (j.job_type || "n/a").replace("_", " ")));
  el.appendChild(line("meta", j.candidate_required_location || "Location not stated"));
  if (j.salary) el.appendChild(line("meta", "Salary: " + j.salary));
  el.appendChild(line("meta", "Posted " + String(j.publication_date).slice(0, 10)));
  return el;
}

function fillCategories() {
  const cats = [...new Set(jobs.map(j => j.category))].sort();
  cats.forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    categoryEl.appendChild(o);
  });
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  const cat = categoryEl.value;
  const out = jobs.filter(j => (cat === "all" || j.category === cat) &&
    (j.title + " " + j.company_name + " " + (j.candidate_required_location || ""))
      .toLowerCase().includes(q));
  const s = sortEl.value;
  out.sort((a, b) => s === "title" ? a.title.localeCompare(b.title) :
    s === "company" ? a.company_name.localeCompare(b.company_name) :
    Date.parse(b.publication_date) - Date.parse(a.publication_date));
  statusEl.textContent = out.length + " of " + jobs.length + " jobs";
  listEl.replaceChildren(...out.map(card));
  if (out.length === 0 && jobs.length > 0) {
    listEl.appendChild(line("meta", "No jobs match your filters."));
  }
}

async function loadJobs() {
  statusEl.textContent = "Loading jobs...";
  try {
    const res = await fetch("/api/jobs");
    if (!res.ok) throw new Error("server answered " + res.status);
    const data = await res.json();
    jobs = Array.isArray(data.jobs) ? data.jobs : [];
    categoryEl.length = 1;
    fillCategories();
    render();
  } catch (err) {
    listEl.replaceChildren();
    statusEl.textContent = "Could not load jobs (" + err.message + "). ";
    const btn = document.createElement("button");
    btn.textContent = "Try again";
    btn.onclick = loadJobs;
    statusEl.appendChild(btn);
  }
}

searchEl.addEventListener("input", render);
categoryEl.addEventListener("change", render);
sortEl.addEventListener("change", render);
loadJobs();
