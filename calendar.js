const API_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";
const calendarEl = document.getElementById("calendar");
const zoomBtn = document.getElementById("zoomBtn");

zoomBtn.addEventListener("click", () => {
  calendarEl.classList.toggle("zoomed");
});

const TYPE_COLORS = {
  Anime: "🟠",
  Manga: "🟢",
  Manhwa: "🔵"
};

function createMonthSection(title, entriesByMonth) {
  const fragment = document.createDocumentFragment();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  months.forEach(month => {
    const items = entriesByMonth[month];
    if (!items || items.length === 0) return;

    const monthDiv = document.createElement("div");
    monthDiv.className = "month";

    const heading = document.createElement("h3");
    heading.textContent = `${month} (${title})`;
    monthDiv.appendChild(heading);

    items.forEach(entry => {
      const div = document.createElement("div");
      div.className = "entry";

      const color = TYPE_COLORS[entry.type] || "";
      div.innerHTML = `${color} <strong>${entry.title}</strong> <br/>
        <span style="color:#aaa;">${entry.type} • ${entry.date} • ${entry.popularity}</span>`;

      monthDiv.appendChild(div);
    });

    fragment.appendChild(monthDiv);
  });

  return fragment;
}

async function loadCalendar() {
  calendarEl.innerHTML = `<p style="color:#bbb;">⏳ Fetching releases...</p>`;

  try {
    const res = await fetch(API_URL);
    const { released, upcoming } = await res.json();

    calendarEl.innerHTML = "";

    // Render released section
    const releasedHeading = document.createElement("h2");
    releasedHeading.textContent = "✅ Released Anime, Manga & Manhwa (Till Today)";
    releasedHeading.style.color = "#4ade80";
    releasedHeading.style.gridColumn = "1 / -1";
    calendarEl.appendChild(releasedHeading);

    calendarEl.appendChild(createMonthSection("Released", released));

    // Render upcoming section
    const upcomingHeading = document.createElement("h2");
    upcomingHeading.textContent = "🚀 Upcoming Releases (Daily Fetched)";
    upcomingHeading.style.color = "#facc15";
    upcomingHeading.style.gridColumn = "1 / -1";
    calendarEl.appendChild(upcomingHeading);

    calendarEl.appendChild(createMonthSection("Upcoming", upcoming));

  } catch (err) {
    console.error("Failed to fetch or render:", err);
    calendarEl.innerHTML = `<p style="color:tomato;">❌ Failed to load calendar data.</p>`;
  }
}

loadCalendar();
