const API_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";
const calendarEl = document.getElementById("calendar");

const TYPE_CLASS = { Anime: "anime", Manga: "manga", Manhwa: "manhwa" };

// Create Overlay
const overlay = document.createElement("div");
overlay.id = "calendarOverlay";
overlay.innerHTML = `
  <div class="overlay-nav">
    <button id="prevMonthBtn">‹</button>
    <h2 id="overlayMonth">Month</h2>
    <button id="nextMonthBtn">›</button>
    <button class="close-overlay">✖</button>
  </div>
  <div class="overlay-content">
    <div id="calendarGrid" class="calendar-grid"></div>
    <div id="sidebar" class="sidebar">
      <h3 id="sidebarTitle">Details</h3>
      <div id="sidebarEntries"></div>
    </div>
  </div>`;
document.body.appendChild(overlay);

// Add styles to match existing site look
const styleTag = document.createElement("style");
styleTag.textContent = `
#calendarOverlay { display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:#121212DE; z-index:1000; padding:20px; }
#calendarOverlay.active { display:flex; flex-direction:column; }
.overlay-nav { display:flex; align-items:center; justify-content:space-between; }
.overlay-nav button { background:#1f1f1f; color:#f97316; border:none; padding:8px 12px; cursor:pointer; border-radius:4px; }
.overlay-content { display:flex; flex:1; margin-top:10px; }
.calendar-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; flex:3; overflow-y:auto; }
.calendar-grid .day { background:#1f1f1f; padding:6px; border-radius:4px; position:relative; min-height:50px; }
.calendar-grid .day strong { display:block; }
.calendar-grid .dot { width:8px; height:8px; border-radius:50%; position:absolute; bottom:4px; left:4px; }
.dot.anime { background:#f97316; }
.dot.manga { background:#34d399; }
.dot.manhwa { background:#60a5fa; }
.sidebar { flex:1; background:#1f1f1f; margin-left:10px; padding:10px; overflow-y:auto; border-radius:4px; }
.sidebar h3 { margin-top:0; color:#f97316; }
.month-card { width:120px; background:#1f1f1f; border-radius:8px; padding:10px; margin:8px; display:inline-block; vertical-align:top; color:white; cursor:pointer; }
.month-card h4 { margin:0 0 8px; color:#f97316; }
`;
document.head.appendChild(styleTag);

let dataByMonth = {}, monthNames = [], currentMonthIdx = 0;

// Render Sidebar list
function renderSidebar(entries, title) {
  document.getElementById("sidebarTitle").textContent = title;
  const container = document.getElementById("sidebarEntries");
  container.innerHTML = "";
  entries.forEach(e => {
    const div = document.createElement("div");
    div.innerHTML = `<strong class="${TYPE_CLASS[e.type]}">${e.title}</strong><br>
                     <span>${e.type}, ${e.date}</span>`;
    container.appendChild(div);
  });
}

// Render Overlay calendar view
function renderOverlay(month) {
  currentMonthIdx = monthNames.indexOf(month);
  document.getElementById("overlayMonth").textContent = month;
  const entries = dataByMonth[month] || [];
  const dayMap = entries.reduce((m, e) => {
    const d = new Date(e.date).getDate();
    m[d] = m[d] || [];
    m[d].push(e);
    return m;
  }, {});

  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";
  for (let day = 1; day <= 31; day++) {
    const cell = document.createElement("div");
    cell.className = "day";
    cell.innerHTML = `<strong>${day}</strong>`;
    (dayMap[day] || []).forEach(e => {
      const dot = document.createElement("span");
      dot.className = `dot ${e.type.toLowerCase()}`;
      cell.appendChild(dot);
    });
    cell.onclick = () => renderSidebar(dayMap[day] || [], `Day ${day}, ${month}`);
    grid.appendChild(cell);
  }
  renderSidebar(entries, month);
}

// Helper to create month card
function createMonthCard(month) {
  const div = document.createElement("div");
  div.className = "month-card";
  div.innerHTML = `<h4>${month}</h4>`;
  (dataByMonth[month] || []).slice(0,4).forEach(e => {
    const d = new Date(e.date).getDate();
    const dot = `<span class="dot ${e.type.toLowerCase()}"></span>`;
    div.innerHTML += `<div>${d} ${dot.repeat(1)}</div>`;
  });
  div.onclick = () => openOverlay(month);
  return div;
}

function openOverlay(month) {
  overlay.classList.add("active");
  renderOverlay(month);
}

document.getElementById("prevMonthBtn").onclick = () => {
  if (currentMonthIdx > 0) renderOverlay(monthNames[--currentMonthIdx]);
};
document.getElementById("nextMonthBtn").onclick = () => {
  if (currentMonthIdx < monthNames.length - 1) renderOverlay(monthNames[++currentMonthIdx]);
};
document.querySelector(".close-overlay").onclick = () => overlay.classList.remove("active");

// Load Data and initialize
async function initCalendar() {
  calendarEl.innerHTML = `<p style="color:#ccc">Loading calendar…</p>`;
  try {
    const res = await fetch(API_URL);
    const { released, upcoming } = await res.json();
    dataByMonth = { ...released, ...upcoming };
    const monthOrder = ["January","February","March","April","May","June",
                        "July","August","September","October","November","December"];
    monthNames = monthOrder.filter(m => dataByMonth[m]?.length);
    calendarEl.innerHTML = "";
    monthNames.forEach(m => calendarEl.appendChild(createMonthCard(m)));
  } catch (err) {
    calendarEl.innerHTML = `<p style="color:tomato">Failed loading calendar</p>`;
    console.error(err);
  }
}
initCalendar();
