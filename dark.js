"use strict";
function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("puer_theme", newTheme);
  document.getElementById("themeIcon").className =
    newTheme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-fill";
}

(function () {
  const saved = localStorage.getItem("puer_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  const icon = document.getElementById("themeIcon");
  if (icon)
    icon.className = saved === "dark" ? "bi bi-sun-fill" : "bi bi-moon-fill";
})();
