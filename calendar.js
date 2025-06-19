const API_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";
const calendarEl = document.getElementById("calendar");

const TYPE_CLASS = {
  Anime: "anime",
  Manga: "manga",
  Manhwa: "manhwa"
};

// ================= Overlay Modal Setup ================= //
const overlay = document.createElement("div");
overlay.className = "overlay";
overlay.innerHTML = `
  <button class="close-btn">✖</button>
  <div class="month-nav">
    <button id="prevMonthBtn">‹</button>
    <h2 id="overlayMonth">Month</h2>
    <button id="nextMonthBtn">›</button>
  </div>
  <div class="calendar-grid" id="calendarGrid"></div>
  <div class="sidebar" id="sidebarList">
    <h2 id="sidebarTitle">Day Details</h2>
    <div id="sidebarEntries"></div>
  </div>
`;
document.body.appendChild(overlay);

// Inject styles for overlay
const style = document.createElement("style");
style.textContent = `
  .overlay {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 85%;
    height: 85%;
    transform: translate(-50%, -50%);
    background: rgba(18, 18, 18, 0.95);
    border: 1px solid #333;
    border-radius: 10px;
    display: none;
    z-index: 1000;
    color: #fff;
    box-shadow: 0 0 30px rgba(0,0,0,0.6);
    display: flex;
    flex-direction: row;
    overflow: hidden;
    backdrop-filter: blur(4px);
  }
  .overlay.active {
    display: flex;
  }
  .month-nav {
    position: absolute;
    top: 0.5rem;
    left: 0;
    width: 100%;
    text-align: center;
    color: #facc15;
  }
  .month-nav h2 {
    display: inline-block;
    margin: 0 1rem;
    font-size: 1.2rem;
  }
  .month-nav button {
    background: transparent;
    border: none;
    color: #f97316;
    font-size: 1.4rem;
    cursor: pointer;
  }
  .calendar-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 2rem 1rem 1rem;
    gap: 6px;
    overflow-y: auto;
  }
  .day {
    background: #1f1f1f;
    padding: 0.4rem;
    border-radius: 6px;
    min-height: 50px;
    font-size: 0.75rem;
    cursor: pointer;
  }
  .day strong {
    display: block;
    margin-bottom: 0.2rem;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    margin: 1px;
  }
  .dot.anime { background-color: #f97316; }
  .dot.manga { background-color: #34d399; }
  .dot.manhwa { background-color: #60a5fa; }

  .sidebar {
    width: 260px;
    background: #181818;
    border-left: 1px solid #333;
    padding: 1rem;
    overflow-y: auto;
  }
  .sidebar h2 {
    margin-top: 0;
    color: #facc15;
    font-size: 1rem;
  }
  .entry {
    margin: 0.5rem 0;
    line-height: 1.3;
    font-size: 0.8rem;
  }
  .entry .meta {
    color: #aaa;
    font-size: 0.68rem;
  }
  .close-btn {
    position: absolute;
    top: 0.4rem;
    right: 0.8rem;
    background: transparent;
    border: none;
    color: #aaa;
    font-size: 1.4rem;
    cursor: pointer;
  }
  .close-btn:hover {
    color: #fff;
  }
`;
document.head.appendChild(style);

const calendarGrid = overlay.querySelector("#calendarGrid");
const sidebarEntries = overlay.querySelector("#sidebarEntries");
const sidebarTitle = overlay.querySelector("#sidebarTitle");
const overlayMonth = overlay.querySelector("#overlayMonth");
const prevMonthBtn = overlay.querySelector("#prevMonthBtn");
const nextMonthBtn = overlay.querySelector("#nextMonthBtn");

overlay.querySelector(".close-btn").onclick = () => overlay.classList.remove("active");

let allData = {};
let monthNames = [];
let currentMonthIndex = 0;
let selectedDay = null;

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

function renderCalendarGrid(month) {
  const entries = allData[month] || [];
  overlayMonth.textContent = month;
  sidebarTitle.textContent = "Month: " + month;
  selectedDay = null;

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
      if (selectedDay === i) {
        selectedDay = null;
        renderSidebar(entries);
      } else {
        selectedDay = i;
        renderSidebar(days[i] || []);
      }
    });

    calendarGrid.appendChild(cell);
  }

  renderSidebar(entries);
}

function openOverlay(month) {
  overlay.classList.add("active");
  currentMonthIndex = monthNames.indexOf(month);
  renderCalendarGrid(month);
}

function createMonthCard(month, entries) {
  const div = document.createElement("div");
  div.className = "month";

  const title = document.createElement("h3");
  title.textContent = month;
  div.appendChild(title);

  const limited = entries.slice(0, 5);
  limited.forEach(entry => {
    const e = document.createElement("div");
    e.className = "entry";
    const typeClass = TYPE_CLASS[entry.type] || "";
    e.innerHTML = `<span class="${typeClass}">${entry.title}</span><br/>
                   <span class="meta">${entry.type} • ${entry.date} • ${entry.popularity}</span>`;
    div.appendChild(e);
  });

  title.addEventListener("click", () => openOverlay(month));
  return div;
}

prevMonthBtn.addEventListener("click", () => {
  if (currentMonthIndex > 0) {
    currentMonthIndex--;
    renderCalendarGrid(monthNames[currentMonthIndex]);
  }
});

nextMonthBtn.addEventListener("click", () => {
  if (currentMonthIndex < monthNames.length - 1) {
    currentMonthIndex++;
    renderCalendarGrid(monthNames[currentMonthIndex]);
  }
});

async function loadCalendar() {
  calendarEl.innerHTML = `<p style="color:#bbb;">⏳ Fetching releases...</p>`;

  try {
    const res = await fetch(API_URL);
    const { released, upcoming } = await res.json();

    allData = {};
    for (const [month, items] of Object.entries(released)) {
      allData[month] = [...(allData[month] || []), ...items];
    }
    for (const [month, items] of Object.entries(upcoming)) {
      allData[month] = [...(allData[month] || []), ...items];
    }

    const order = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    monthNames = order.filter(m => allData[m]);

    calendarEl.innerHTML = "";
    monthNames.forEach(month => {
      const card = createMonthCard(month, allData[month]);
      calendarEl.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to fetch or render:", err);
    calendarEl.innerHTML = `<p style="color:tomato;">❌ Failed to load calendar data.</p>`;
  }
}

loadCalendar();
