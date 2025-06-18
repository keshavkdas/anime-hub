const API_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";

async function fetchReleaseData() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const text = await res.text();

    // Try to parse plain JSON or strip Markdown if needed
    const jsonText = text.trim().startsWith("```json")
      ? text.trim().replace(/```json|```/g, "").trim()
      : text;

    return JSON.parse(jsonText);
  } catch (err) {
    console.error("❌ Failed to fetch or parse calendar data:", err);
    return null;
  }
}

function createEntry(entry) {
  const color = entry.type === "Anime" ? "#60a5fa" :
                entry.type === "Manga" ? "#facc15" :
                "#a78bfa"; // Manhwa or others
  const date = new Date(entry.date).toLocaleDateString('default', {
    day: 'numeric',
    month: 'short',
  });

  return `<p class="entry"><span style="color:${color}; font-weight:bold">${entry.type}</span>: ${entry.title} <span style="color:#bbb">(${date})</span></p>`;
}

async function buildCalendar() {
  const calendar = document.getElementById("calendar");
  const zoomBtn = document.getElementById("zoomBtn");

  calendar.innerHTML = "<p style='text-align:center;'>📅 Loading release calendar...</p>";

  const data = await fetchReleaseData();
  calendar.innerHTML = ""; // Clear loading message

  if (!data) {
    calendar.innerHTML = "<p style='text-align:center;'>⚠️ No data available. Please try again later.</p>";
    return;
  }

  for (const month of Object.keys(data)) {
    const monthDiv = document.createElement("div");
    monthDiv.className = "month";
    monthDiv.innerHTML = `<h3>${month}</h3>`;

    const released = data[month].filter(item => item.status === "Released");
    const upcoming = data[month].filter(item => item.status === "Upcoming");

    if (released.length) {
      monthDiv.innerHTML += `<h4>🎉 Released</h4>`;
      released.forEach(entry => {
        monthDiv.innerHTML += createEntry(entry);
      });
    }

    if (upcoming.length) {
      monthDiv.innerHTML += `<h4>🚀 Upcoming</h4>`;
      upcoming.forEach(entry => {
        monthDiv.innerHTML += createEntry(entry);
      });
    }

    calendar.appendChild(monthDiv);
  }

  // Enable zoom toggle
  zoomBtn?.addEventListener("click", () => {
    calendar.classList.toggle("zoomed");
  });
}

buildCalendar();
