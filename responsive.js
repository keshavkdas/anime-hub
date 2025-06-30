// responsive.js
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 768) return; // Only for mobile

  const header = document.querySelector("header");
  const nav = document.querySelector("header nav");

  if (header && nav && !document.querySelector(".menu-toggle")) {
    const button = document.createElement("button");
    button.className = "menu-toggle";
    button.innerHTML = "☰";
    button.style.cssText = `
      background: none;
      border: none;
      color: #f97316;
      font-size: 1.5rem;
      padding: 0.5rem 1rem;
      cursor: pointer;
    `;

    button.onclick = () => {
      nav.classList.toggle("active");
    };

    header.insertBefore(button, nav);
  }
});
