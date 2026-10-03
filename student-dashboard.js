document.addEventListener("DOMContentLoaded", () => {
/* =========================================
   RECORD DAILY LOGIN
========================================= */

if (window.MiniGProgress) {
    MiniGProgress.recordDailyLogin();
}
    /* =====================================
       CURRENT DATE
    ===================================== */

    const dateElement =
        document.getElementById("currentDate");

    if (dateElement) {

        const today = new Date();

        const dateText =
            today.toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                }
            );

        dateElement.textContent =
            dateText;
    }


    /* =====================================
       USER NAME
    ===================================== */

    const userName =
        "George";

    const userNameElement =
        document.getElementById("userName");

    if (userNameElement) {
        userNameElement.textContent =
            userName;
    }


    /* =====================================
       INITIALS
    ===================================== */

    const avatar =
        document.getElementById("profileAvatar");

    if (avatar) {

        const initials =
            userName
                .split(" ")
                .map(name => name[0])
                .join("")
                .toUpperCase();

        avatar.textContent =
            initials;
    }


/* =====================================
   CENTRAL STUDENT PROGRESS
===================================== */

if (
    window.MiniGProgress
) {
    MiniGProgress.recordDailyLogin();
}

const progressState =
    window.MiniGProgress
        ? MiniGProgress.getState()
        : {
            totalXP: 20,
            streak: 1
        };

const totalXP =
    Number(
        progressState.totalXP
    ) || 0;

const streak =
    Number(
        progressState.streak
    ) || 0;

const level =
    window.MiniGProgress
        ? MiniGProgress.getLevel(
            totalXP
        )
        : Math.floor(
            totalXP / 500
        ) + 1;

const xpIntoLevel =
    window.MiniGProgress
        ? MiniGProgress.getXPIntoLevel(
            totalXP
        )
        : totalXP % 500;

const progress =
    (
        xpIntoLevel / 500
    ) * 100;

const xpToNext =
    window.MiniGProgress
        ? MiniGProgress.getXPToNextLevel(
            totalXP
        )
        : 500 - xpIntoLevel;

/* =====================================
   STREAK
===================================== */

const streakElement =
    document.getElementById(
        "streakValue"
    );

if (streakElement) {

    streakElement.textContent =
        `${streak}d`;

}
    /* =====================================
       UPDATE XP
    ===================================== */

    const xpElements = [
        document.getElementById("currentXP"),
        document.getElementById("totalXP"),
        document.getElementById("metricXP")
    ];
    const metricStreak =
    document.getElementById("metricStreak");

if (metricStreak) {
    metricStreak.textContent = `${streak}d`;
}

    xpElements.forEach(element => {

        if (element) {
            element.textContent =
                totalXP;
        }

    });


    /* =====================================
       LEVEL
    ===================================== */

    const levelElements = [
        document.getElementById("levelNumber"),
        document.getElementById("progressLevel"),
        document.getElementById("statLevel")
    ];

    levelElements.forEach(element => {

        if (element) {
            element.textContent =
                level;
        }

    });


    /* =====================================
       XP PROGRESS
    ===================================== */

    const progressFill =
        document.getElementById(
            "xpProgressFill"
        );

    if (progressFill) {

        progressFill.style.width =
            `${progress}%`;

    }


    /* =====================================
       XP TO NEXT LEVEL
    ===================================== */

    const xpToNextElement =
        document.getElementById("xpToNext");

    if (xpToNextElement) {

        xpToNextElement.textContent =
            `${xpToNext} XP to next`;

    }


    /* =====================================
       MOBILE MENU
    ===================================== */

    const menuButton =
        document.getElementById("menuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");


    if (menuButton && mobileMenu) {

        menuButton.addEventListener(
            "click",
            () => {

                mobileMenu.classList.toggle(
                    "open"
                );

            }
        );

    }

});