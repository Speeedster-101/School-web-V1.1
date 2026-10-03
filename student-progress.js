/* =========================================================
   MINI G INNOVA SPARK
   CENTRAL STUDENT PROGRESS SYSTEM
========================================================= */

window.MiniGProgress = (() => {

    const STORAGE_KEY = "miniGStudentProgress";

    const LEGACY_XP_KEY = "studentXP";

    const LOGIN_XP = 5;


    /* =====================================================
       DATE HELPERS
    ===================================================== */

    function getDateKey(date = new Date()) {

        const year = date.getFullYear();

        const month =
            String(date.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(date.getDate())
                .padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function getDateFromKey(key) {
        return new Date(`${key}T00:00:00`);
    }


    function getDayDifference(dateA, dateB) {

        const msPerDay =
            1000 * 60 * 60 * 24;

        return Math.round(
            (
                dateB.getTime() -
                dateA.getTime()
            ) / msPerDay
        );
    }


    /* =====================================================
       MONDAY WEEK KEY
    ===================================================== */

    function getWeekKey(date = new Date()) {

        const copy = new Date(date);

        const day = copy.getDay();

        const daysSinceMonday =
            day === 0 ? 6 : day - 1;

        copy.setDate(
            copy.getDate() -
            daysSinceMonday
        );

        return getDateKey(copy);
    }


    /* =====================================================
       DEFAULT STATE
    ===================================================== */

    function createDefaultState() {

        const legacyXP =
            Number(
                localStorage.getItem(
                    LEGACY_XP_KEY
                )
            );

        return {

            totalXP:
                Number.isFinite(legacyXP)
                    ? legacyXP
                    : 20,

            streak: 0,

            lastLoginDate: null,

            dailyXP: {},

            weeklyHistory: {},

            activities: []

        };
    }


    /* =====================================================
       LOAD STATE
    ===================================================== */

    function loadState() {

        let state;

        try {

            state =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE_KEY
                    )
                );

        } catch {

            state = null;

        }


        if (
            !state ||
            typeof state !== "object"
        ) {

            state =
                createDefaultState();

        }


        /* ---------------------------------------------
           Migrate old studentXP if it is higher
        --------------------------------------------- */

        const legacyXP =
            Number(
                localStorage.getItem(
                    LEGACY_XP_KEY
                )
            );


        if (
            Number.isFinite(legacyXP) &&
            legacyXP > state.totalXP
        ) {

            state.totalXP =
                legacyXP;

        }


        state.totalXP =
            Number(state.totalXP) || 0;

        state.streak =
            Number(state.streak) || 0;

        state.dailyXP =
            state.dailyXP || {};

        state.weeklyHistory =
            state.weeklyHistory || {};

        state.activities =
            Array.isArray(state.activities)
                ? state.activities
                : [];


        return state;
    }


    /* =====================================================
       SAVE STATE
    ===================================================== */

    function saveState(state) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );


        /*
         * Keep the old XP key synchronized
         * so older pages continue working.
         */

        localStorage.setItem(
            LEGACY_XP_KEY,
            String(state.totalXP)
        );

    }


    /* =====================================================
       GET STATE
    ===================================================== */

    function getState() {

        return loadState();

    }


    /* =====================================================
       ADD ACTIVITY
    ===================================================== */

    function addActivity(
        state,
        title,
        description,
        xp,
        icon = "⚡"
    ) {

        state.activities.unshift({

            title,

            description,

            xp,

            icon,

            timestamp:
                Date.now()

        });


        /* Keep last 20 */

        state.activities =
            state.activities.slice(
                0,
                20
            );

    }


    /* =====================================================
       AWARD XP
    ===================================================== */

    function awardXP(
        amount,
        title = "Learning activity",
        description = "Learning activity",
        icon = "⚡"
    ) {

        amount =
            Number(amount) || 0;


        if (amount <= 0) {

            return getState();

        }


        const state =
            loadState();

        const today =
            getDateKey();

        const week =
            getWeekKey();


        /* ---------------------------------------------
           Total XP
        --------------------------------------------- */

        state.totalXP += amount;


        /* ---------------------------------------------
           Daily XP
        --------------------------------------------- */

        state.dailyXP[today] =
            (state.dailyXP[today] || 0) +
            amount;


        /* ---------------------------------------------
           Weekly XP
        --------------------------------------------- */

        state.weeklyHistory[week] =
            (state.weeklyHistory[week] || 0) +
            amount;


        /* ---------------------------------------------
           Activity history
        --------------------------------------------- */

        addActivity(
            state,
            title,
            description,
            amount,
            icon
        );


        saveState(state);

        return state;

    }


    /* =====================================================
       DAILY LOGIN
    ===================================================== */

    function recordDailyLogin() {

        const state =
            loadState();

        const today =
            getDateKey();


        /*
         * Already logged in today.
         * Do NOT give another +5.
         */

        if (
            state.lastLoginDate ===
            today
        ) {

            return state;

        }


        let newStreak = 1;


        /* ---------------------------------------------
           Continue streak when yesterday was logged
        --------------------------------------------- */

        if (
            state.lastLoginDate
        ) {

            const lastLogin =
                getDateFromKey(
                    state.lastLoginDate
                );

            const todayDate =
                getDateFromKey(today);

            const difference =
                getDayDifference(
                    lastLogin,
                    todayDate
                );


            if (difference === 1) {

                newStreak =
                    state.streak + 1;

            }

        }


        state.streak =
            newStreak;

        state.lastLoginDate =
            today;


        /* ---------------------------------------------
           +5 XP daily login
        --------------------------------------------- */

        state.totalXP +=
            LOGIN_XP;


        state.dailyXP[today] =
            (state.dailyXP[today] || 0) +
            LOGIN_XP;


        const week =
            getWeekKey();


        state.weeklyHistory[week] =
            (state.weeklyHistory[week] || 0) +
            LOGIN_XP;


        addActivity(
            state,
            "Daily login",
            `Study streak: ${newStreak} day${newStreak === 1 ? "" : "s"}`,
            LOGIN_XP,
            "🔥"
        );


        saveState(state);

        return state;

    }


    /* =====================================================
       LEVEL
    ===================================================== */

    function getLevel(xp) {

        return (
            Math.floor(
                xp / 500
            ) + 1
        );

    }


    /* =====================================================
       XP TO NEXT LEVEL
    ===================================================== */

    function getXPIntoLevel(xp) {

        return xp % 500;

    }


    function getXPToNextLevel(xp) {

        return 500 -
            getXPIntoLevel(xp);

    }


    /* =====================================================
       CURRENT WEEK XP
    ===================================================== */

    function getCurrentWeekXP(state) {

        const week =
            getWeekKey();

        return (
            state.weeklyHistory[week] || 0
        );

    }


    /* =====================================================
       LAST 7 DAYS
    ===================================================== */

    function getLast7Days(state) {

        const results = [];

        const today =
            new Date();


        for (
            let i = 6;
            i >= 0;
            i--
        ) {

            const date =
                new Date(today);

            date.setDate(
                today.getDate() - i
            );


            const key =
                getDateKey(date);


            results.push({

                key,

                label:
                    date.toLocaleDateString(
                        "en-US",
                        {
                            weekday: "short"
                        }
                    ),

                xp:
                    state.dailyXP[key] || 0,

                isToday:
                    i === 0

            });

        }


        return results;

    }


    /* =====================================================
       ACTIVITY TIME
    ===================================================== */

    function getRelativeTime(timestamp) {

        const diff =
            Date.now() -
            timestamp;

        const minutes =
            Math.floor(
                diff / 60000
            );

        if (minutes < 1) {

            return "just now";

        }

        if (minutes < 60) {

            return `${minutes}m ago`;

        }


        const hours =
            Math.floor(
                minutes / 60
            );

        if (hours < 24) {

            return `${hours}h ago`;

        }


        const days =
            Math.floor(
                hours / 24
            );

        return `${days}d ago`;

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        getState,

        saveState,

        awardXP,

        recordDailyLogin,

        getLevel,

        getXPIntoLevel,

        getXPToNextLevel,

        getCurrentWeekXP,

        getLast7Days,

        getRelativeTime,

        getWeekKey,

        getDateKey

    };

})();