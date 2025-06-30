document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 768) return; // Apply only to mobile

  const header = document.querySelector("header");
  const nav = header?.querySelector("nav");

  if (header && nav && !document.querySelector(".menu-toggle")) {
    // Create drawer container
    const drawer = document.createElement("div");
    drawer.className = "mobile-drawer";

    // Clone nav links into drawer
    drawer.innerHTML = nav.innerHTML;

    // Toggle button
    const btn = document.createElement("button");
    btn.className = "menu-toggle";
    btn.innerText = "☰";
    btn.onclick = () => drawer.classList.toggle("open");

    // Inject both
    document.body.appendChild(drawer);
    header.appendChild(btn);
  }
});
