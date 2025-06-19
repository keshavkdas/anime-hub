const API_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";
const calendarEl = document.getElementById("calendar");

const TYPE_CLASS = {
  Anime: "anime",
  Manga: "manga",
  Manhwa: "manhwa"
};

const overlay = document.createElement("div");
overlay.className = "overlay";
overlay.innerHTML = `
  <button class="close-btn">✖</button>
  <div class="calendar-grid" id="calendarGrid"></div>
  <div class="sidebar" id="sidebarList">
    <h2 id="sidebarTitle">Month Details</h2>
    <div id="sidebarEntries"></div>
  </div>
`;
document.body.appendChild(overlay);

const calendarGrid = overlay.querySelector("#calendarGrid");
const sidebarEntries = overlay.querySelector("#sidebarEntries");
const sidebarTitle = overlay.querySelector("#sidebarTitle");

overlay.querySelector(".close-btn").onclick = () => {
  overlay.classList.remove("active");
  calendarGrid.innerHTML = "";
  sidebarEntries.innerHTML = "";
};

function renderSidebar(entries) {
  sidebarEntries.innerHTML = "";
  entries.forEach(entry => {
    const div = document.createElement("div");
    div.className = "entry";
    const cls = TYPE_CLASS[entry.type] || "";
    div.innerHTML = `<span class="${cls}">${entry.title}</span><br/>
      <span class="meta">${entry.type} • ${entry.date} • ${entry.popularity}</span>`;
    sidebarEntries.appendChild(div);
  });
}

function openOverlay(month, entries) {
  overlay.classList.add("active");
  sidebarTitle.textContent = month;

  const days = {};
  entries.forEach(item => {
    const day = parseInt(item.date.split("-")[2] || "1");
    if (!days[day]) days[day] = [];
    days[day].push(item);
  });

  calendarGrid.innerHTML = "";
  for (let i = 1; i <= 31; i++) {
    const cell = document.createElement("div");
    cell.className = "day";
    cell.innerHTML = `<strong>${i}</strong>`;

    const releases = days[i] || [];
    releases.forEach(entry => {
      const dot = document.createElement("span");
      dot.className = `dot ${entry.type.toLowerCase()}`;
      cell.appendChild(dot);
    });

    cell.addEventListener("click", () => {
      renderSidebar(days[i] || []);
    });

    calendarGrid.appendChild(cell);
  }

  renderSidebar(entries);
}

function getMonthIndex(monthName) {
  return [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ].indexOf(monthName);
}

function getFirstDayOfMonth(year, monthIndex) {
  return new Date(year, monthIndex, 1).getDay();
}

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function createMiniCalendar(month, entries) {
  const div = document.createElement("div");
  div.className = "mini-month";

  const title = document.createElement("div");
  title.className = "month-title";
  title.textContent = month;
  div.appendChild(title);

  const weekdayNames = ["S", "M", "T", "W", "T", "F", "S"];
  const miniGrid = document.createElement("div");
  miniGrid.className = "mini-grid";

  weekdayNames.forEach(day => {
    const wd = document.createElement("div");
    wd.className = "weekday";
    wd.textContent = day;
    miniGrid.appendChild(wd);
  });

  const monthIndex = getMonthIndex(month);
  const year = 2025;
  const firstDay = getFirstDayOfMonth(year, monthIndex);
  const totalDays = getDaysInMonth(year, monthIndex);

  const releaseMap = {};
  entries.forEach(item => {
    const day = parseInt(item.date.split("-")[2] || "1");
    if (!releaseMap[day]) releaseMap[day] = [];
    releaseMap[day].push(item);
  });

  for (let i = 0; i < firstDay; i++) {
    miniGrid.appendChild(document.createElement("div"));
  }

  for (let i = 1; i <= totalDays; i++) {
    const cell = document.createElement("div");
    cell.className = "mini-day";
    cell.innerHTML = `<span>${i}</span>`;

    const releases = releaseMap[i] || [];
    releases.forEach(entry => {
      const dot = document.createElement("span");
      dot.className = `dot ${entry.type.toLowerCase()}`;
      cell.appendChild(dot);
    });

    miniGrid.appendChild(cell);
  }

  div.appendChild(miniGrid);
  div.addEventListener("click", () => openOverlay(month, entries));
  return div;
}

async function loadCalendar() {
  calendarEl.innerHTML = `<p style="color:#bbb;">⏳ Fetching releases...</p>`;

  try {
    const res = await fetch(API_URL);
    const { released, upcoming } = await res.json();

    const combined = {};
    for (const [month, items] of Object.entries(released)) {
      combined[month] = [...(combined[month] || []), ...items];
    }
    for (const [month, items] of Object.entries(upcoming)) {
      combined[month] = [...(combined[month] || []), ...items];
    }

    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    calendarEl.innerHTML = "";
    for (const month of monthOrder) {
      const entries = combined[month];
      if (!entries || entries.length === 0) continue;

      const card = createMiniCalendar(month, entries);
      calendarEl.appendChild(card);
    }
  } catch (err) {
    console.error("Failed to fetch or render:", err);
    calendarEl.innerHTML = `<p style="color:tomato;">❌ Failed to load calendar data.</p>`;
  }
}

loadCalendar();
