const API_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";

async function fetchReleaseData() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const text = await res.text();

    // Handle possible ```json markdown wrapping
    const jsonText = text.trim().startsWith("```json")
      ? text.trim().replace(/```json|```/g, "").trim()
      : text;

    return JSON.parse(jsonText);
  } catch (err) {
    console.error("❌ Failed to fetch or parse calendar data:", err);
    return null;
  }
}

function determineStatus(dateStr) {
  const today = new Date();
  const releaseDate = new Date(dateStr);
  return releaseDate < today ? "Released" : "Upcoming";
}

function createEntry(entry) {
  const typeColor = entry.type === "Anime" ? "#60a5fa" :
                    entry.type === "Manga" ? "#facc15" :
                    "#a78bfa"; // Manhwa or other

  const dateFormatted = new Date(entry.date).toLocaleDateString('default', {
    day: 'numeric',
    month: 'short',
  });

  const status = determineStatus(entry.date); // Always calculate live

  return `<p class="entry">
    <span style="color:${typeColor}; font-weight:bold">${entry.type}</span>: ${entry.title}
    <span style="color:#bbb">(${dateFormatted})</span>
    <span style="color:${status === "Released" ? "#22c55e" : "#f43f5e"}">[${status}]</span>
  </p>`;
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

    const currentMonthEntries = data[month].map(entry => ({
      ...entry,
      status: determineStatus(entry.date) // Update status live
    }));

    const released = currentMonthEntries.filter(item => item.status === "Released");
    const upcoming = currentMonthEntries.filter(item => item.status === "Upcoming");

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

  zoomBtn?.addEventListener("click", () => {
    calendar.classList.toggle("zoomed");
  });
}

buildCalendar();
