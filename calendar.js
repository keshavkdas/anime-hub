
const API_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";

async function fetchReleaseData() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      console.error(`❌ Server returned ${res.status}`);
      return {};
    }

    const data = await res.json();
    console.log("✅ Received data:", data); // Debug log
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch or parse calendar data:", error);
    return {};
  }
}

function createMonthCard(month, items) {
  const div = document.createElement("div");
  div.className = "month";
  div.innerHTML = `<h3>${month}</h3>`;

  items.forEach(entry => {
    const color =
      entry.type === "Anime"
        ? "#60a5fa"
        : entry.type === "Manga"
        ? "#facc15"
        : "#34d399"; // Manhwa

    const dateStr = new Date(entry.date).toLocaleDateString("default", {
      day: "numeric",
      month: "short"
    });

    div.innerHTML += `
      <p class="entry">
        <span style="color:${color}">${entry.type}</span>: ${entry.title} 
        <span style="color:#bbb">(${dateStr})</span> 
        <span style="font-style: italic; color: #888">[${entry.status}]</span>
      </p>`;
  });

  return div;
}

async function buildCalendar() {
  const calendar = document.getElementById("calendar");
  const zoomBtn = document.getElementById("zoomBtn");

  const data = await fetchReleaseData();

  if (!data || Object.keys(data).length === 0) {
    console.warn("⚠️ No data returned from API");
    calendar.innerHTML = `<p style="text-align:center; color:red;">⚠️ No data available</p>`;
    return;
  }

  const orderedMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  orderedMonths.forEach(month => {
    if (data[month] && data[month].length > 0) {
      const monthCard = createMonthCard(month, data[month]);
      calendar.appendChild(monthCard);
    }
  });

  zoomBtn?.addEventListener("click", () => {
    calendar.classList.toggle("zoomed");
  });
}

buildCalendar();
