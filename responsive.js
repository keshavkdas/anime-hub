// responsive.js
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 768) return; // mobile only

  const header = document.querySelector("header");
  const nav = header?.querySelector("nav");

  if (header && nav && !document.querySelector(".menu-toggle")) {
    const btn = document.createElement("button");
    btn.className = "menu-toggle";
    btn.innerText = "☰";
    btn.onclick = () => nav.classList.toggle("active");

    header.insertBefore(btn, nav);
  }
});
