const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");

    const expanded =
      menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute(
      "aria-expanded",
      String(!expanded)
    );
  });
}


/* =========================
   STUDENT LOGIN
========================= */

const loginForm = document.getElementById("student-login-form");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const idInput = document.getElementById("student-id");
    const passwordInput = document.getElementById("student-password");

    const id = idInput ? idInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (id === "3996" && password === "pass123") {
      window.location.href = "student-dashboard.html";
    } else {
      alert(
        "Invalid credentials. Use 3996 / pass123 for the prototype."
      );
    }
  });
}
/* =========================================
   DASHBOARD XP
   ========================================= */

const dashboardXP = document.getElementById("dashboardXP");

if (dashboardXP) {

    const totalXP =
        Number(localStorage.getItem("studentXP")) || 0;

    dashboardXP.textContent =
        `${totalXP.toLocaleString()} XP`;
}
