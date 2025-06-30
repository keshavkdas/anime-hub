document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("header nav");

  if (nav && !document.querySelector(".menu-toggle")) {
    const button = document.createElement("button");
    button.className = "menu-toggle";
    button.innerHTML = "☰";
    button.onclick = () => nav.classList.toggle("active");

    document.querySelector("header")?.appendChild(button);
  }
});
