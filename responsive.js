document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 768) return; // Only for mobile

  const header = document.querySelector("header");
  const nav = header?.querySelector("nav");

  if (header && nav && !document.querySelector(".menu-toggle")) {
    // Create drawer and clone nav content
    const drawer = document.createElement("div");
    drawer.className = "mobile-drawer";
    drawer.innerHTML = nav.innerHTML;

    // Create hamburger button
    const btn = document.createElement("button");
    btn.className = "menu-toggle";
    btn.innerText = "☰";
    btn.onclick = () => drawer.classList.toggle("open");

    // Inject elements
    document.body.appendChild(drawer);
    header.appendChild(btn);

    // Hide original nav
    nav.style.display = "none";
  }
});
