const API_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";
const calendarEl = document.getElementById("calendar");

const TYPE_CLASS = { Anime: "anime", Manga: "manga", Manhwa: "manhwa" };

// --- Overlay Setup ---
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
  <div class="sidebar">
    <h2 id="sidebarTitle">Details</h2>
    <div id="sidebarEntries"></div>
  </div>
`;
document.body.appendChild(overlay);

document.head.insertAdjacentHTML("beforeend", `<style>
.overlay { /* overlay styles here */ }
.month-nav { /* nav styles */ }
.calendar-grid { display: grid; gap:4px; grid-template-columns: repeat(7,1fr); overflow-y:auto; }
.day { background:#1f1f1f; padding:0.2rem; border-radius:4px; cursor:pointer; position:relative; min-height:40px; }
.day strong { display:block; font-weight:bold; }
.dot { width:6px; height:6px; border-radius:50%; display:inline-block; margin:1px; position:absolute; bottom:3px; }
.dot.anime { background:#f97316; }
.dot.manga { background:#34d399; }
.dot.manhwa { background:#60a5fa; }
.sidebar { width:260px; background:#181818; padding:1rem; overflow-y:auto; }
.entry { margin-bottom:0.7rem; font-size:0.9rem; }
.meta { color:#aaa; font-size:0.75rem; }
.close-btn { position:absolute;top:8px;right:12px;font-size:1.2rem;color:#aaa;cursor:pointer;background:none;border:none; }
.month-card { background:#222;border-radius:8px;padding:1rem;margin:0.5rem;display:inline-block;vertical-align:top;cursor:pointer;width:120px;text-align:center;color:#fff; }
.month-card h3 { margin-bottom:0.5rem;color:#f97316;font-size:1rem; }
</style>`);

const calendarGrid = overlay.querySelector("#calendarGrid");
const sidebarEntries = overlay.querySelector("#sidebarEntries");
const sidebarTitle = overlay.querySelector("#sidebarTitle");
const overlayMonth = overlay.querySelector("#overlayMonth");
const prevBtn = overlay.querySelector("#prevMonthBtn");
const nextBtn = overlay.querySelector("#nextMonthBtn");

overlay.querySelector(".close-btn").onclick = () => overlay.classList.remove("active");

let allData = {}, monthNames = [], currentMonthIndex = 0, selectedDay = null;

// Renders sidebar entries
function renderSidebar(entries, title) {
  sidebarTitle.textContent = title;
  sidebarEntries.innerHTML = "";
  entries.forEach(e => {
    const div = document.createElement("div");
    div.className = "entry";
    div.innerHTML = `<span class="${TYPE_CLASS[e.type] || ''}">${e.title}</span><br>
                     <span class="meta">${e.type} • ${e.date} • ${e.popularity}</span>`;
    sidebarEntries.append(div);
  });
}

// Builds calendar grid inside overlay
function renderCalendarGrid(month) {
  const events = allData[month] || [];
  overlayMonth.textContent = month;
  selectedDay = null;
  
  const dayMap = {};
  events.forEach(evt => {
    const d = parseInt(evt.date.split("-")[2]);
    (dayMap[d] = dayMap[d] || []).push(evt);
  });

  calendarGrid.innerHTML = "";
  for (let d = 1; d <= 31; d++) {
    const cell = document.createElement("div");
    cell.className = "day";
    cell.innerHTML = `<strong>${d}</strong>`;
    (dayMap[d] || []).forEach(evt => {
      const dot = document.createElement("div");
      dot.className = `dot ${evt.type.toLowerCase()}`;
      cell.append(dot);
    });
    cell.onclick = () => {
      if (selectedDay === d) {
        selectedDay = null;
        renderSidebar(events, month);
      } else {
        selectedDay = d;
        renderSidebar(dayMap[d] || [], `Day ${d} – ${month}`);
      }
    };
    calendarGrid.append(cell);
  }

  renderSidebar(events, month);
}

// Opens the overlay for a specific month
function openOverlay(month) {
  currentMonthIndex = monthNames.indexOf(month);
  overlay.classList.add("active");
  renderCalendarGrid(month);
}

// Creates mini-month card in the main calendar view
function createMonthCard(name, events) {
  const div = document.createElement("div");
  div.className = "month-card";
  div.innerHTML = `<h3>${name}</h3><div>${events.slice(0, 3).map(e => e.date.split("-")[2]).join(", ")}</div>`;
  div.onclick = () => openOverlay(name);
  return div;
}

prevBtn.onclick = () => {
  if (currentMonthIndex > 0) renderCalendarGrid(monthNames[--currentMonthIndex]);
};
nextBtn.onclick = () => {
  if (currentMonthIndex < monthNames.length - 1) renderCalendarGrid(monthNames[++currentMonthIndex]);
};

// Loads data from the API and renders mini-cards
async function loadCalendar() {
  calendarEl.innerHTML = "Loading calendar…";
  try {
    const res = await fetch(API_URL);
    const { released, upcoming } = await res.json();
    Object.assign(allData, released, upcoming);
    const monthOrder = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    monthNames = monthOrder.filter(m => allData[m] && allData[m].length);

    calendarEl.innerHTML = "";
    monthNames.forEach(m => calendarEl.append(createMonthCard(m, allData[m])));
  } catch (e) {
    console.error(e);
    calendarEl.textContent = "Failed to load calendar.";
  }
}

loadCalendar();
