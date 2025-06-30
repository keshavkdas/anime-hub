document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 768) return; // Only apply on mobile

  const header = document.querySelector("header");
  const nav = header?.querySelector("nav");

  if (!header || !nav || document.querySelector(".menu-toggle")) return;

  // Create the mobile drawer
  const drawer = document.createElement("div");
  drawer.className = "mobile-drawer";
  drawer.innerHTML = nav.innerHTML;

  // Create hamburger button
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "menu-toggle";
  toggleBtn.setAttribute("aria-label", "Toggle menu");
  toggleBtn.innerText = "☰";

  toggleBtn.addEventListener("click", () => {
    drawer.classList.toggle("open");
  });

  // Close drawer on outside click (optional but UX-friendly)
  drawer.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      drawer.classList.remove("open");
    }
  });

  // Append elements
  document.body.appendChild(drawer);
  header.appendChild(toggleBtn);

  // Hide the original nav
  nav.style.display = "none";
});
