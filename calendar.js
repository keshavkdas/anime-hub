const API_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";
const calendarEl = document.getElementById("calendar");
const zoomBtn = document.getElementById("zoomBtn");

zoomBtn.addEventListener("click", () => {
  calendarEl.classList.toggle("zoomed");
});

const TYPE_CLASS = {
  Anime: "anime",
  Manga: "manga",
  Manhwa: "manhwa"
};

function createMonthCard(month, entries) {
  const div = document.createElement("div");
  div.className = "month";

  const title = document.createElement("h3");
  title.textContent = month;
  div.appendChild(title);

  const entryLimit = 5;
  const limited = entries.slice(0, entryLimit);
  const extra = entries.length > entryLimit;

  const renderEntries = (entryList) => {
    entryList.forEach(entry => {
      const e = document.createElement("div");
      e.className = "entry";

      const typeClass = TYPE_CLASS[entry.type] || "";
      e.innerHTML = `
        <span class="${typeClass}">${entry.title}</span><br/>
        <span class="meta">${entry.type} • ${entry.date} • ${entry.popularity}</span>
      `;
      div.appendChild(e);
    });
  };

  renderEntries(limited);

  if (extra) {
    const remaining = entries.slice(entryLimit);
    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.display = "none";
    hiddenContainer.className = "hidden-entries";
    renderEntries(remaining);

    div.appendChild(hiddenContainer);
  }

  title.addEventListener("click", () => {
    div.classList.toggle("expanded");
    const hidden = div.querySelector(".hidden-entries");
    if (hidden) {
      hidden.style.display = hidden.style.display === "none" ? "block" : "none";
    }
  });

  return div;
}

async function loadCalendar() {
  calendarEl.innerHTML = `<p style="color:#bbb;">⏳ Fetching releases...</p>`;

  try {
    const res = await fetch(API_URL);
    const { released, upcoming } = await res.json();

    // Merge both into one object by month
    const combined = {};

    for (const [month, items] of Object.entries(released)) {
      combined[month] = [...(combined[month] || []), ...items];
    }
    for (const [month, items] of Object.entries(upcoming)) {
      combined[month] = [...(combined[month] || []), ...items];
    }

    // Sort by month order
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

