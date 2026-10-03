/* =========================================================
   MINI G INNOVA SPARK
   STUDENT LOGIN SYSTEM
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");


/* =========================================================
   PROTOTYPE ACCOUNT
   ========================================================= */

const DEMO_USERNAME = "GG3996";
const DEMO_PASSWORD = "pass123";


/* =========================================================
   SWITCH TO LOGIN
   ========================================================= */

loginBtn.addEventListener("click", () => {

    loginBtn.classList.add("active");
    registerBtn.classList.remove("active");

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

});


/* =========================================================
   SWITCH TO REGISTER
   ========================================================= */

registerBtn.addEventListener("click", () => {

    registerBtn.classList.add("active");
    loginBtn.classList.remove("active");

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

});


/* =========================================================
   LOGIN
   ========================================================= */

loginForm.querySelector("form").addEventListener("submit", function(event) {

    event.preventDefault();

    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    const submitButton = this.querySelector(".submit-btn");


    /* Check credentials */

    if (
        username === DEMO_USERNAME &&
        password === DEMO_PASSWORD
    ) {

        /* Successful login */

        submitButton.innerHTML =
            "<span>Signing in...</span><span>✓</span>";

        submitButton.disabled = true;


        /* Small delay for visual feedback */

        setTimeout(() => {

            window.location.href = "student-dashboard.html";

        }, 700);

    } else {

        /* Incorrect credentials */

        showLoginError();

        loginPassword.value = "";

    }

});


/* =========================================================
   LOGIN ERROR
   ========================================================= */

function showLoginError() {

    let errorMessage =
        document.getElementById("loginError");


    /* Create error message if it doesn't exist */

    if (!errorMessage) {

        errorMessage = document.createElement("p");

        errorMessage.id = "loginError";

        errorMessage.style.marginTop = "12px";
        errorMessage.style.textAlign = "center";
        errorMessage.style.fontSize = "0.82rem";
        errorMessage.style.fontWeight = "700";
        errorMessage.style.color = "#f87171";

        loginForm
            .querySelector("form")
            .appendChild(errorMessage);

    }


    errorMessage.textContent =
        "Incorrect username or password.";


    /* Remove message after a few seconds */

    setTimeout(() => {

        if (errorMessage) {
            errorMessage.remove();
        }

    }, 3500);

}


/* =========================================================
   REGISTER FORM
   ========================================================= */

registerForm.querySelector("form").addEventListener("submit", function(event) {

    event.preventDefault();

    const submitButton = this.querySelector(".submit-btn");

    submitButton.innerHTML =
        "<span>Account created ✓</span><span>→</span>";


    /*
       Prototype only.

       A real registration system will eventually
       need a backend/database.
    */

    setTimeout(() => {

        loginBtn.click();

        submitButton.innerHTML =
            "<span>Create Account</span><span>→</span>";

    }, 1200);

});


/* =========================================================
   ENTER KEY SUPPORT
   ========================================================= */

loginPassword.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        loginForm
            .querySelector("form")
            .requestSubmit();

    }

});


/* =========================================================
   REMEMBER ME
   ========================================================= */

const rememberMe =
    document.getElementById("rememberMe");


if (rememberMe) {

    const savedUsername =
        localStorage.getItem("miniGUsername");


    if (savedUsername) {

        loginUsername.value = savedUsername;

        rememberMe.checked = true;

    }


    rememberMe.addEventListener("change", () => {

        if (rememberMe.checked) {

            localStorage.setItem(
                "miniGUsername",
                loginUsername.value.trim()
            );

        } else {

            localStorage.removeItem("miniGUsername");

        }

    });

}


/* =========================================================
   DEBUG MESSAGE
   ========================================================= */

console.log(
    "Mini G Innova Spark login system loaded."
);