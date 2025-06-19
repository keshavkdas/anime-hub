const API_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";
const calendarEl = document.getElementById("calendar");
const zoomBtn = document.getElementById("zoomBtn");


const TYPE_CLASS = {
  Anime: "anime",
  Manga: "manga",
  Manhwa: "manhwa"
};

// Create overlay modal
const overlay = document.createElement("div");
overlay.className = "overlay";
overlay.innerHTML = `
  <button class="close-btn">✖ Close</button>
  <div class="calendar-grid" id="calendarGrid"></div>
  <div class="sidebar" id="sidebarList">
    <h2 id="sidebarTitle">Month Details</h2>
    <div id="sidebarEntries"></div>
  </div>
`;
document.body.appendChild(overlay);

const overlayStyle = document.createElement("style");
overlayStyle.textContent = `
  .overlay {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 75%;
    height: 75%;
    transform: translate(-50%, -50%);
    background: rgba(18, 18, 18, 0.95);
    border: 1px solid #333;
    border-radius: 10px;
    display: none;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    color: #fff;
    box-shadow: 0 0 30px rgba(0,0,0,0.6);
    display: flex;
    flex-direction: row;
    overflow: hidden;
    backdrop-filter: blur(2px);
  }

  .overlay.active {
    opacity: 1;
    pointer-events: all;
  }

  .calendar-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 0.5rem;
    gap: 4px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .day {
    background: #1f1f1f;
    padding: 0.4rem;
    border-radius: 4px;
    min-height: 50px;
    font-size: 0.75rem;
    word-wrap: break-word;
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
    padding: 0.5rem;
    overflow-y: auto;
  }

  .sidebar h2 {
    margin-top: 0;
    color: #facc15;
    font-size: 1rem;
  }

  .entry {
    margin: 0.4rem 0;
    line-height: 1.3;
    font-size: 0.75rem;
  }

  .entry .meta {
    color: #aaa;
    font-size: 0.68rem;
  }

  .close-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: transparent;
    border: none;
    color: #aaa;
    font-size: 1.5rem;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    z-index: 1001;
  }

  .close-btn:hover {
    color: #fff;
  }
`;

document.head.appendChild(overlayStyle);

const calendarGrid = overlay.querySelector("#calendarGrid");
const sidebarEntries = overlay.querySelector("#sidebarEntries");
const sidebarTitle = overlay.querySelector("#sidebarTitle");
overlay.querySelector(".close-btn").onclick = () => overlay.classList.remove("active");

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

function openOverlay(month, entries) {
  overlay.classList.add("active");
  sidebarTitle.textContent = month;
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

function createMonthCard(month, entries) {
  const div = document.createElement("div");
  div.className = "month";

  const title = document.createElement("h3");
  title.textContent = month;
  div.appendChild(title);

  const entryLimit = 5;
  const limited = entries.slice(0, entryLimit);

  limited.forEach(entry => {
    const e = document.createElement("div");
    e.className = "entry";
    const typeClass = TYPE_CLASS[entry.type] || "";
    e.innerHTML = `
      <span class="${typeClass}">${entry.title}</span><br/>
      <span class="meta">${entry.type} • ${entry.date} • ${entry.popularity}</span>
    `;
    div.appendChild(e);
  });

  title.addEventListener("click", () => openOverlay(month, entries));
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

      const card = createMonthCard(month, entries);
      calendarEl.appendChild(card);
    }
  } catch (err) {
    console.error("Failed to fetch or render:", err);
    calendarEl.innerHTML = `<p style="color:tomato;">❌ Failed to load calendar data.</p>`;
  }
}

loadCalendar();
