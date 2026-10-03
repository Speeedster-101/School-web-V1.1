document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* =====================================================
       SETTINGS
    ===================================================== */

    const QUESTIONS_PER_QUIZ = 10;
    const QUICK_DRILL_COUNT = 5;

    const XP_PER_CORRECT = 10;
    const XP_PER_SHORT_ANSWER = 15;


    /* =====================================================
       QUIZ STATE
    ===================================================== */

    let currentSubject = "";
    let currentMode = "";
    let currentSelection = "";

    let currentQuestions = [];
    let currentQuestionIndex = 0;

    let score = 0;
    let earnedXP = 0;

    let answered = false;
    let sessionFinished = false;


    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const subjectGrid =
        document.getElementById("subjectGrid");

    const selectionArea =
        document.getElementById("subjectSelection");

    const subjectOptions =
        document.getElementById("subjectOptions");

    const topicSelection =
        document.getElementById("topicSelection");

    const testSelection =
        document.getElementById("testSelection");

    const quizArea =
        document.getElementById("quizArea");

    const resultArea =
        document.getElementById("quizResult");

    const questionText =
        document.getElementById("questionText");

    const questionTopic =
        document.getElementById("questionTopic");

    const questionType =
        document.getElementById("questionType");

    const questionNumber =
        document.getElementById("questionNumber");

    const questionCounter =
        document.getElementById("questionCounter");

    const answerOptions =
        document.getElementById("answerOptions");

    const questionFeedback =
        document.getElementById("questionFeedback");

    const nextButton =
        document.getElementById("nextButton");


    /* =====================================================
       SUBJECT CATALOG
    ===================================================== */

    const subjects = [

        {
            name: "Mathematics",
            icon: "∑",
            description:
                "Algebra, geometry, statistics and problem solving."
        },

        {
            name: "English",
            icon: "Aa",
            description:
                "Grammar, comprehension, writing and literature."
        },

        {
            name: "Kiswahili",
            icon: "文",
            description:
                "Sarufi, fasihi, lugha na ufahamu."
        },

        {
            name: "Physics",
            icon: "⚡",
            description:
                "Motion, forces, energy, electricity and waves."
        },

        {
            name: "Chemistry",
            icon: "⚗",
            description:
                "Atoms, reactions, equations and matter."
        },

        {
            name: "Biology",
            icon: "🧬",
            description:
                "Cells, genetics, ecology and human biology."
        },

        {
            name: "Geography",
            icon: "🌍",
            description:
                "Maps, climate, landforms and environment."
        },

        {
            name: "History",
            icon: "🏛",
            description:
                "Historical events, societies and civilizations."
        },

        {
            name: "CRE",
            icon: "✝",
            description:
                "Christian Religious Education."
        }

    ];


    /* =====================================================
       PROGRESS / LOGIN
    ===================================================== */

    if (window.MiniGProgress) {

        window.MiniGProgress.recordDailyLogin();

    }


    function getProgressState() {

        return window.MiniGProgress

            ? window.MiniGProgress.getState()

            : {
                totalXP: 0,
                streak: 0
            };

    }


    function updateXPDisplay() {

        const state =
            getProgressState();


        const xp =
            Number(state.totalXP) || 0;


        const level =
            window.MiniGProgress

                ? window.MiniGProgress
                    .getLevel(xp)

                : Math.floor(
                    xp / 500
                ) + 1;


        const xpIntoLevel =
            window.MiniGProgress

                ? window.MiniGProgress
                    .getXPIntoLevel(xp)

                : xp % 500;


        const progress =
            (xpIntoLevel / 500) * 100;


        const xpAmount =
            document.getElementById(
                "xpAmount"
            );

        const xpBar =
            document.getElementById(
                "xpBar"
            );

        const levelName =
            document.getElementById(
                "levelName"
            );

        const xpProgress =
            document.getElementById(
                "xpProgress"
            );

        const streak =
            document.getElementById(
                "streak"
            );


        if (xpAmount) {

            xpAmount.textContent =
                xp.toLocaleString();

        }


        if (xpBar) {

            xpBar.style.width =
                `${progress}%`;

        }


        if (levelName) {

            levelName.textContent =
                `Level ${level} Scholar`;

        }


        if (xpProgress) {

            xpProgress.textContent =
                `${xpIntoLevel} / 500 XP`;

        }


        if (streak) {

            streak.textContent =
                Number(state.streak) || 0;

        }

    }


    /* =====================================================
       QUESTION DATA ADAPTER
       
       Supports:

       1. Old format:
          questionsData[subject] = []

       2. Structured format:
          questionsData[subject] = {
              topics: {},
              papers: {}
          }
    ===================================================== */

    function getSubjectData(subject) {

        if (
            typeof questionsData ===
            "undefined"
        ) {

            return null;

        }


        return questionsData[subject] || null;

    }


    function isStructuredSubject(data) {

        return (
            data &&
            !Array.isArray(data) &&
            typeof data === "object"
        );

    }


    function getTopicMap(subject) {

        const data =
            getSubjectData(subject);


        if (!isStructuredSubject(data)) {

            return {};

        }


        if (
            data.topics &&
            typeof data.topics === "object"
        ) {

            return data.topics;

        }


        const topicKeys =
            Object.keys(data)
                .filter(
                    key =>
                        ![
                            "papers",
                            "mixed",
                            "random"
                        ].includes(key)
                        &&
                        Array.isArray(
                            data[key]
                        )
                );


        return Object.fromEntries(
            topicKeys.map(
                key =>
                    [
                        key,
                        data[key]
                    ]
            )
        );

    }


    function getPaperMap(subject) {

        const data =
            getSubjectData(subject);


        if (!isStructuredSubject(data)) {

            return {};

        }


        return (
            data.papers &&
            typeof data.papers ===
            "object"
        )

            ? data.papers

            : {};

    }


    function getAllQuestions(subject) {

        const data =
            getSubjectData(subject);


        if (!data) {

            return [];

        }


        if (Array.isArray(data)) {

            return [
                ...data
            ];

        }


        const topicMap =
            getTopicMap(subject);


        return Object.values(
            topicMap
        )
            .flat()
            .filter(Boolean);

    }


    function getQuestionCount(subject) {

        const data =
            getSubjectData(subject);


        if (!data) {

            return 0;

        }


        if (Array.isArray(data)) {

            return data.length;

        }


        const topicCount =
            Object.values(
                getTopicMap(subject)
            )
            .reduce(

                (
                    sum,
                    list
                ) =>

                    sum +
                    (
                        Array.isArray(list)
                            ? list.length
                            : 0
                    ),

                0

            );


        const paperCount =
            Object.values(
                getPaperMap(subject)
            )
            .reduce(

                (
                    sum,
                    list
                ) =>

                    sum +
                    (
                        Array.isArray(list)
                            ? list.length
                            : 0
                    ),

                0

            );


        return (
            topicCount +
            paperCount
        );

    }


    /* =====================================================
       SHUFFLE
    ===================================================== */

    function shuffle(array) {

        const copy =
            [...array];


        for (
            let i =
                copy.length - 1;

            i > 0;

            i -= 1

        ) {

            const j =
                Math.floor(
                    Math.random() *
                    (i + 1)
                );


            [
                copy[i],
                copy[j]
            ] =
            [
                copy[j],
                copy[i]
            ];

        }


        return copy;

    }


    /* =====================================================
       NORMALIZE QUESTIONS
    ===================================================== */

    function normalizeQuestion(
        rawQuestion
    ) {

        if (
            !rawQuestion ||
            typeof rawQuestion !==
            "object"
        ) {

            return null;

        }


        const options =
            Array.isArray(
                rawQuestion.options
            )

                ? [
                    ...rawQuestion.options
                ]

                : [];


        let correct =
            rawQuestion.correct ??
            rawQuestion.answer;


        /*
         * Some of the older question data
         * stores the correct answer as an
         * option index.
         */

        if (
            typeof correct ===
            "number" &&

            options[correct] !==
            undefined
        ) {

            correct =
                options[correct];

        }


        return {

            id:
                rawQuestion.id ||
                cryptoSafeId(),

            type:
                rawQuestion.type ||
                (
                    options.length
                        ? "mcq"
                        : "shortanswer"
                ),

            difficulty:
                rawQuestion.difficulty ||
                "medium",

            topic:
                rawQuestion.topic ||
                currentSelection ||
                "Mixed Practice",

            paper:
                rawQuestion.paper ||
                null,

            question:
                String(
                    rawQuestion.question ||
                    "Question unavailable"
                ),

            options,

            correct:
                correct == null
                    ? ""
                    : String(correct),

            explanation:
                rawQuestion.explanation ||
                ""

        };

    }


    function cryptoSafeId() {

        return (
            `Q-${Date.now()}-` +
            `${Math.random()
                .toString(36)
                .slice(2, 8)}`
        );

    }


    /* =====================================================
       SUBJECT HOME
    ===================================================== */

    function renderSubjects() {

        if (!subjectGrid) return;


        subjectGrid.innerHTML =
            "";


        subjects.forEach(
            subject => {

                const card =
                    document.createElement(
                        "button"
                    );


                card.type =
                    "button";


                card.className =
                    "subject-card";


                const count =
                    getQuestionCount(
                        subject.name
                    );


                card.innerHTML = `

                    <div
                        class="subject-content"
                    >

                        <div
                            class="subject-icon"
                        >
                            ${subject.icon}
                        </div>

                        <h3>
                            ${subject.name}
                        </h3>

                        <p>
                            ${subject.description}
                        </p>

                    </div>

                    <span class="count">

                        ${
                            count
                                ? `${count} questions`
                                : "Question bank coming soon"
                        }

                        →

                    </span>
                `;


                card.addEventListener(
                    "click",
                    () =>
                        selectSubject(
                            subject.name
                        )
                );


                subjectGrid.appendChild(
                    card
                );

            }
        );

    }


    function selectSubject(subject) {

        currentSubject =
            subject;


        const info =
            subjects.find(
                item =>
                    item.name ===
                    subject
            );


        const selectedName =
            document.getElementById(
                "selectedSubjectName"
            );


        const selectedDescription =
            document.getElementById(
                "selectedSubjectDescription"
            );


        const selectedIcon =
            document.getElementById(
                "selectedSubjectIcon"
            );


        if (selectedName) {

            selectedName.textContent =
                subject;

        }


        if (selectedDescription) {

            selectedDescription.textContent =
                info

                    ? info.description

                    : "Choose how you want to practise.";

        }


        if (selectedIcon) {

            selectedIcon.textContent =
                info

                    ? info.icon

                    : "∑";

        }


        selectionArea?.classList.add(
            "hidden"
        );

        subjectOptions?.classList.remove(
            "hidden"
        );

        topicSelection?.classList.add(
            "hidden"
        );

        testSelection?.classList.add(
            "hidden"
        );

        quizArea?.classList.add(
            "hidden"
        );

        resultArea?.classList.add(
            "hidden"
        );

    }


    /* =====================================================
       MODE BUTTONS
    ===================================================== */

    document
        .getElementById("topicMode")
        ?.addEventListener(
            "click",
            () => {

                currentMode =
                    "topic";

                renderTopics();

            }
        );


    document
        .getElementById("randomMode")
        ?.addEventListener(
            "click",
            () => {

                currentMode =
                    "random";

                startRandomQuiz();

            }
        );


    document
        .getElementById("testMode")
        ?.addEventListener(
            "click",
            () => {

                currentMode =
                    "paper";

                renderPaperChoices();

            }
        );


    /* =====================================================
       TOPIC SELECTION
    ===================================================== */

    function renderTopics() {

        const topicGrid =
            document.getElementById(
                "topicGrid"
            );


        if (!topicGrid) return;


        const topicMap =
            getTopicMap(
                currentSubject
            );


        topicGrid.innerHTML =
            "";


        const topics =
            Object.keys(
                topicMap
            );


        if (!topics.length) {

            topicGrid.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No topic bank available yet
                    </h3>

                    <p>
                        Add structured topic questions
                        to questions.js.
                    </p>

                </div>
            `;

            subjectOptions?.classList.add(
                "hidden"
            );

            topicSelection?.classList.remove(
                "hidden"
            );

            return;

        }


        topics.forEach(
            topic => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "topic-card";


                button.innerHTML = `

                    <span
                        class="topic-card-icon"
                    >
                        📚
                    </span>

                    <span>
                        ${escapeHTML(topic)}
                    </span>

                    <small>
                        ${
                            Array.isArray(
                                topicMap[topic]
                            )

                                ? topicMap[
                                    topic
                                ].length

                                : 0
                        }
                        questions
                    </small>

                `;


                button.addEventListener(
                    "click",
                    () =>
                        startTopicQuiz(
                            topic
                        )
                );


                topicGrid.appendChild(
                    button
                );

            }
        );


        const heading =
            document.getElementById(
                "topicHeading"
            );


        if (heading) {

            heading.textContent =
                `${currentSubject} Topics`;

        }


        subjectOptions?.classList.add(
            "hidden"
        );

        topicSelection?.classList.remove(
            "hidden"
        );

    }


    /* =====================================================
       TEST / PAPER SELECTION
    ===================================================== */

    function renderPaperChoices() {

        const paperGrid =
            document.querySelector(
                ".paper-grid"
            );


        if (!paperGrid) return;


        const papers =
            getPaperMap(
                currentSubject
            );


        /*
         * If your database does not yet have
         * structured papers, we still show
         * Paper 1 / 2 / 3 so the UI is ready.
         */

        paperGrid
            .querySelectorAll(
                ".paper-card"
            )
            .forEach(
                card => {

                    const paper =
                        card.dataset.paper;

                    const oldClone =
                        card.cloneNode(true);

                    card.replaceWith(
                        oldClone
                    );


                    oldClone.addEventListener(
                        "click",
                        () =>
                            startPaperQuiz(
                                paper
                            )
                    );

                    /*
                     * Optional visual availability.
                     */

                    if (
                        !papers[paper]
                    ) {

                        oldClone.classList.add(
                            "paper-unavailable"
                        );

                    }

                }
            );


        const heading =
            testSelection?.querySelector(
                ".quiz-heading h2"
            );


        if (heading) {

            heading.textContent =
                "Choose your paper";

        }


        subjectOptions?.classList.add(
            "hidden"
        );

        topicSelection?.classList.add(
            "hidden"
        );

        testSelection?.classList.remove(
            "hidden"
        );

    }


    /* =====================================================
       TOPIC QUIZ
    ===================================================== */

    function startTopicQuiz(topic) {

        currentSelection =
            topic;


        const topicMap =
            getTopicMap(
                currentSubject
            );


        const source =
            Array.isArray(
                topicMap[topic]
            )

                ? topicMap[topic]

                : [];


        const questions =
            shuffle(
                source
                    .map(
                        normalizeQuestion
                    )
                    .filter(Boolean)
            )
            .slice(
                0,
                QUESTIONS_PER_QUIZ
            );


        if (!questions.length) {

            alert(
                `No ${topic} questions are available yet.`
            );

            return;

        }


        startQuizSession(
            questions,
            `${currentSubject} • ${topic}`
        );

    }


    /* =====================================================
       RANDOM MIXED QUIZ
    ===================================================== */

    function startRandomQuiz() {

        const questions =
            shuffle(
                getAllQuestions(
                    currentSubject
                )
                    .map(
                        normalizeQuestion
                    )
                    .filter(Boolean)
            )
            .slice(
                0,
                QUESTIONS_PER_QUIZ
            );


        if (!questions.length) {

            alert(
                `No questions are available for ${currentSubject} yet.`
            );

            return;

        }


        startQuizSession(
            questions,
            `${currentSubject} • Random Mixed`
        );

    }


    /* =====================================================
       QUICK DRILL
       
       Note:
       Your current HTML does not yet contain
       a Quick Drill button.

       This function is ready for when
       we add it to the HTML.
    ===================================================== */

    function startQuickDrill() {

        currentMode =
            "quick";


        const questions =
            shuffle(
                getAllQuestions(
                    currentSubject
                )
                    .map(
                        normalizeQuestion
                    )
                    .filter(Boolean)
            )
            .slice(
                0,
                QUICK_DRILL_COUNT
            );


        if (!questions.length) {

            alert(
                `No questions are available for ${currentSubject} yet.`
            );

            return;

        }


        startQuizSession(
            questions,
            `${currentSubject} • Quick Drill`
        );

    }


    /* =====================================================
       PAPER QUIZ
    ===================================================== */

    function startPaperQuiz(paper) {

        currentSelection =
            paper;


        const papers =
            getPaperMap(
                currentSubject
            );


        const source =
            papers[paper];


        if (
            !Array.isArray(source) ||
            source.length === 0
        ) {

            alert(
                `${currentSubject} ${paper} is not loaded yet.`
            );

            return;

        }


        const questions =
            source
                .map(
                    normalizeQuestion
                )
                .filter(Boolean);


        startQuizSession(
            questions,
            `${currentSubject} • ${paper}`
        );

    }


    /* =====================================================
       START QUIZ SESSION
    ===================================================== */

    function startQuizSession(
        questions,
        label
    ) {

        currentQuestions =
            questions;


        currentQuestionIndex =
            0;


        score =
            0;


        earnedXP =
            0;


        answered =
            false;


        sessionFinished =
            false;


        selectionArea?.classList.add(
            "hidden"
        );

        subjectOptions?.classList.add(
            "hidden"
        );

        topicSelection?.classList.add(
            "hidden"
        );

        testSelection?.classList.add(
            "hidden"
        );

        resultArea?.classList.add(
            "hidden"
        );

        quizArea?.classList.remove(
            "hidden"
        );


        const currentSubjectElement =
            document.getElementById(
                "currentSubject"
            );


        if (
            currentSubjectElement
        ) {

            currentSubjectElement.textContent =
                label;

        }


        const liveXP =
            document.getElementById(
                "liveXP"
            );


        if (liveXP) {

            liveXP.textContent =
                "0";

        }


        showQuestion();

    }


    /* =====================================================
       SHOW QUESTION
    ===================================================== */

    function showQuestion() {

        answered =
            false;


        const question =
            normalizeQuestion(
                currentQuestions[
                    currentQuestionIndex
                ]
            );


        currentQuestions[
            currentQuestionIndex
        ] =
            question;


        if (!question) {

            finishQuiz();

            return;

        }


        if (questionTopic) {

            questionTopic.textContent =
                question.topic ||
                currentSubject;

        }


        if (questionType) {

            questionType.textContent =
                formatQuestionType(
                    question.type
                );

        }


        if (questionNumber) {

            questionNumber.textContent =
                String(
                    currentQuestionIndex + 1
                ).padStart(
                    2,
                    "0"
                );

        }


        if (questionCounter) {

            questionCounter.textContent =
                `Question ${
                    currentQuestionIndex + 1
                } of ${
                    currentQuestions.length
                }`;

        }


        if (questionText) {

            questionText.textContent =
                question.question;

        }


        if (questionFeedback) {

            questionFeedback.innerHTML =
                "";

            questionFeedback.className =
                "question-feedback";

        }


        answerOptions.innerHTML =
            "";


        nextButton.disabled =
            true;


        nextButton.classList.remove(
            "ready"
        );


        nextButton.textContent =
            "Choose an answer";


        const type =
            question.type
                .toLowerCase();


        if (
            type === "shortanswer" ||
            type === "short-answer" ||
            type === "short"
        ) {

            renderShortAnswer(
                question
            );

            return;

        }


        if (
            type === "tfquestion" ||
            type === "truefalse" ||
            type === "true/false" ||
            type === "tf"
        ) {

            renderChoiceQuestion(
                question,
                question.options.length
                    ? question.options
                    : [
                        "True",
                        "False"
                    ]
            );

            return;

        }


        renderChoiceQuestion(
            question
        );

    }


    /* =====================================================
       QUESTION TYPE LABEL
    ===================================================== */

    function formatQuestionType(
        type
    ) {

        const map = {

            mcq:
                "Multiple Choice",

            short:
                "Short Answer",

            shortanswer:
                "Short Answer",

            "short-answer":
                "Short Answer",

            tf:
                "True / False",

            tfquestion:
                "True / False",

            truefalse:
                "True / False"

        };


        return (
            map[
                String(type)
                    .toLowerCase()
            ] ||
            "Question"
        );

    }


    /* =====================================================
       CHOICE QUESTION
    ===================================================== */

    function renderChoiceQuestion(
        question,
        providedOptions = null
    ) {

        const options =
            shuffle(
                providedOptions ||
                question.options ||
                []
            );


        if (!options.length) {

            answerOptions.innerHTML = `

                <div class="empty-state">

                    No answer choices available.

                </div>

            `;

            return;

        }


        options.forEach(
            (
                answer,
                index
            ) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "answer-button";


                button.innerHTML = `

                    <span
                        class="answer-letter"
                    >
                        ${
                            String
                                .fromCharCode(
                                    65 + index
                                )
                        }
                    </span>

                    <span>
                        ${escapeHTML(answer)}
                    </span>

                `;


                button.addEventListener(
                    "click",
                    () =>
                        selectChoiceAnswer(
                            button,
                            answer,
                            question
                        )
                );


                answerOptions.appendChild(
                    button
                );

            }
        );

    }


    /* =====================================================
       SHORT ANSWER
    ===================================================== */

    function renderShortAnswer(
        question
    ) {

        const wrap =
            document.createElement(
                "div"
            );


        wrap.className =
            "short-answer-wrap";


        wrap.innerHTML = `

            <input
                class="short-answer-input"
                id="shortAnswerInput"
                type="text"
                autocomplete="off"
                placeholder="Type your answer..."
            >

        `;


        answerOptions.appendChild(
            wrap
        );


        const input =
            wrap.querySelector(
                "input"
            );


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    checkShortAnswer(
                        question
                    );

                }

            }
        );


        const submit =
            document.createElement(
                "button"
            );


        submit.type =
            "button";


        submit.className =
            "next-button ready";


        submit.textContent =
            "Check Answer";


        submit.style.marginTop =
            ".5rem";


        submit.addEventListener(
            "click",
            () =>
                checkShortAnswer(
                    question
                )
        );


        wrap.appendChild(
            submit
        );

    }


    /* =====================================================
       SELECT CHOICE
    ===================================================== */

    function selectChoiceAnswer(
        button,
        selectedAnswer,
        question
    ) {

        if (answered) return;


        answered =
            true;


        document
            .querySelectorAll(
                ".answer-button"
            )
            .forEach(
                item => {

                    item.disabled =
                        true;

                }
            );


        const isCorrect =
            normalizeAnswer(
                selectedAnswer
            ) ===
            normalizeAnswer(
                question.correct
            );


        if (isCorrect) {

            button.classList.add(
                "correct"
            );


            handleCorrect(
                question
            );

        } else {

            button.classList.add(
                "wrong"
            );


            revealCorrectAnswer(
                question
            );


            handleIncorrect(
                question
            );

        }


        prepareNextButton();

    }


    /* =====================================================
       SHORT ANSWER CHECK
    ===================================================== */

    function checkShortAnswer(
        question
    ) {

        if (answered) return;


        answered =
            true;


        const input =
            document.getElementById(
                "shortAnswerInput"
            );


        const value =
            input
                ? input.value
                : "";


        const isCorrect =
            compareShortAnswer(
                value,
                question.correct
            );


        if (input) {

            input.disabled =
                true;

        }


        const submit =
            answerOptions.querySelector(
                "button"
            );


        if (submit) {

            submit.disabled =
                true;

        }


        if (isCorrect) {

            handleCorrect(
                question,
                XP_PER_SHORT_ANSWER
            );

        } else {

            handleIncorrect(
                question
            );


            showFeedback(

                `<strong>Not quite.</strong>
                 Correct answer:
                 <strong>
                    ${escapeHTML(
                        question.correct
                    )}
                 </strong>
                 ${
                    question.explanation
                        ? `<br>${escapeHTML(
                            question.explanation
                        )}`
                        : ""
                 }`,

                "error"

            );

        }


        prepareNextButton();

    }


    /* =====================================================
       CORRECT ANSWER
    ===================================================== */

    function handleCorrect(
        question,
        xpOverride =
            XP_PER_CORRECT
    ) {

        score +=
            1;


        earnedXP +=
            xpOverride;


        showFeedback(

            `<strong>✓ Correct!</strong>
             +${xpOverride} XP
             ${
                question.explanation
                    ? `<br>${escapeHTML(
                        question.explanation
                    )}`
                    : ""
             }`,

            "success"

        );


        const liveXP =
            document.getElementById(
                "liveXP"
            );


        if (liveXP) {

            liveXP.textContent =
                earnedXP;

        }

    }


    /* =====================================================
       INCORRECT ANSWER
    ===================================================== */

    function handleIncorrect(
        question
    ) {

        revealCorrectAnswer(
            question
        );


        const explanation =
            question.explanation

                ? `<br>${escapeHTML(
                    question.explanation
                )}`

                : "";


        showFeedback(

            `<strong>Not quite.</strong>
             Correct answer:
             <strong>
                ${escapeHTML(
                    question.correct
                )}
             </strong>
             ${explanation}`,

            "error"

        );

    }


    /* =====================================================
       REVEAL CORRECT ANSWER
    ===================================================== */

    function revealCorrectAnswer(
        question
    ) {

        document
            .querySelectorAll(
                ".answer-button"
            )
            .forEach(
                button => {

                    const text =
                        button
                            .querySelector(
                                "span:last-child"
                            )
                            ?.textContent
                            ?.trim();


                    if (
                        text &&
                        normalizeAnswer(
                            text
                        ) ===
                        normalizeAnswer(
                            question.correct
                        )
                    ) {

                        button.classList.add(
                            "correct"
                        );

                    }

                }
            );

    }


    /* =====================================================
       FEEDBACK
    ===================================================== */

    function showFeedback(
        message,
        type
    ) {

        if (!questionFeedback) {

            return;

        }


        questionFeedback.innerHTML =
            message;


        questionFeedback.className =
            `question-feedback ${type}`;

    }


    /* =====================================================
       NEXT BUTTON
    ===================================================== */

    function prepareNextButton() {

        nextButton.disabled =
            false;


        nextButton.classList.add(
            "ready"
        );


        nextButton.textContent =

            currentQuestionIndex ===
            currentQuestions.length - 1

                ? "Finish Quiz →"

                : "Next Question →";

    }


    /* =====================================================
       ANSWER HELPERS
    ===================================================== */

    function normalizeAnswer(
        value
    ) {

        return String(
            value ?? ""
        )
            .toLowerCase()
            .trim()
            .replace(
                /\s+/g,
                " "
            );

    }


    function compareShortAnswer(
        user,
        correct
    ) {

        const a =
            normalizeAnswer(
                user
            );


        const b =
            normalizeAnswer(
                correct
            );


        if (a === b) {

            return true;

        }


        const numericA =
            Number(
                a
                    .replace(
                        /,/g,
                        ""
                    )
            );


        const numericB =
            Number(
                b
                    .replace(
                        /,/g,
                        ""
                    )
            );


        return (

            Number.isFinite(
                numericA
            )

            &&

            Number.isFinite(
                numericB
            )

            &&

            Math.abs(
                numericA -
                numericB
            ) < 0.000001

        );

    }


    function escapeHTML(
        value
    ) {

        return String(value)

            .replaceAll(
                "&",
                "&amp;"
            )

            .replaceAll(
                "<",
                "&lt;"
            )

            .replaceAll(
                ">",
                "&gt;"
            )

            .replaceAll(
                '"',
                "&quot;"
            )

            .replaceAll(
                "'",
                "&#039;"
            );

    }


    /* =====================================================
       FINISH QUIZ
    ===================================================== */

    function finishQuiz() {

        if (sessionFinished) {

            return;

        }


        sessionFinished =
            true;


        if (
            window.MiniGProgress &&
            earnedXP > 0
        ) {

            window.MiniGProgress.awardXP(

                earnedXP,

                `Completed ${currentSubject} quiz`,

                `${score}/${currentQuestions.length} correct`,

                "🧠"

            );

        }


        const accuracy =
            currentQuestions.length

                ? Math.round(
                    (
                        score /
                        currentQuestions.length
                    ) * 100
                )

                : 0;


        quizArea?.classList.add(
            "hidden"
        );


        resultArea?.classList.remove(
            "hidden"
        );


        const correctAnswers =
            document.getElementById(
                "correctAnswers"
            );


        const earnedXPElement =
            document.getElementById(
                "earnedXP"
            );


        const accuracyElement =
            document.getElementById(
                "accuracy"
            );


        if (correctAnswers) {

            correctAnswers.textContent =
                score;

        }


        if (earnedXPElement) {

            earnedXPElement.textContent =
                `+${earnedXP}`;

        }


        if (accuracyElement) {

            accuracyElement.textContent =
                `${accuracy}%`;

        }


        const resultTitle =
            document.getElementById(
                "resultTitle"
            );


        const resultMessage =
            document.getElementById(
                "resultMessage"
            );


        if (resultTitle) {

            if (accuracy >= 90) {

                resultTitle.textContent =
                    "Excellent work!";

            } else if (
                accuracy >= 70
            ) {

                resultTitle.textContent =
                    "Strong performance!";

            } else if (
                accuracy >= 50
            ) {

                resultTitle.textContent =
                    "Good start!";

            } else {

                resultTitle.textContent =
                    "Keep practising!";

            }

        }


        if (resultMessage) {

            resultMessage.textContent =
                `${score} of ${
                    currentQuestions.length
                } questions correct.`;

        }


        updateXPDisplay();

    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    document
        .getElementById(
            "backToSubjects"
        )
        ?.addEventListener(
            "click",
            () => {

                subjectOptions?.classList.add(
                    "hidden"
                );

                topicSelection?.classList.add(
                    "hidden"
                );

                testSelection?.classList.add(
                    "hidden"
                );

                selectionArea?.classList.remove(
                    "hidden"
                );

            }
        );


    document
        .getElementById(
            "backToOptions"
        )
        ?.addEventListener(
            "click",
            () => {

                topicSelection?.classList.add(
                    "hidden"
                );

                subjectOptions?.classList.remove(
                    "hidden"
                );

            }
        );


    document
        .getElementById(
            "backFromTest"
        )
        ?.addEventListener(
            "click",
            () => {

                testSelection?.classList.add(
                    "hidden"
                );

                subjectOptions?.classList.remove(
                    "hidden"
                );

            }
        );


    nextButton?.addEventListener(
        "click",
        () => {

            if (!answered) return;


            if (
                currentQuestionIndex <
                currentQuestions.length - 1
            ) {

                currentQuestionIndex +=
                    1;


                showQuestion();

            } else {

                finishQuiz();

            }

        }
    );


    document
        .getElementById(
            "backButton"
        )
        ?.addEventListener(
            "click",
            () => {

                quizArea?.classList.add(
                    "hidden"
                );

                resultArea?.classList.add(
                    "hidden"
                );

                subjectOptions?.classList.remove(
                    "hidden"
                );

            }
        );


    /* =====================================================
       PLAY AGAIN
    ===================================================== */

    document
        .getElementById(
            "playAgain"
        )
        ?.addEventListener(
            "click",
            () => {

                resultArea?.classList.add(
                    "hidden"
                );


                if (
                    currentMode ===
                    "topic"
                ) {

                    startTopicQuiz(
                        currentSelection
                    );


                    return;

                }


                if (
                    currentMode ===
                    "random"
                ) {

                    startRandomQuiz();

                    return;

                }


                if (
                    currentMode ===
                    "quick"
                ) {

                    startQuickDrill();

                    return;

                }


                if (
                    currentMode ===
                    "paper"
                ) {

                    startPaperQuiz(
                        currentSelection
                    );

                    return;

                }

            }
        );


    /* =====================================================
       CHOOSE SUBJECT
    ===================================================== */

    document
        .getElementById(
            "chooseSubject"
        )
        ?.addEventListener(
            "click",
            () => {

                resultArea?.classList.add(
                    "hidden"
                );

                quizArea?.classList.add(
                    "hidden"
                );

                subjectOptions?.classList.add(
                    "hidden"
                );

                topicSelection?.classList.add(
                    "hidden"
                );

                testSelection?.classList.add(
                    "hidden"
                );

                selectionArea?.classList.remove(
                    "hidden"
                );

            }
        );


    /* =====================================================
       STORAGE SYNC
       
       If Dashboard changes XP while the
       Quizzes tab is open, refresh the
       displayed XP/streak.
    ===================================================== */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key ===
                "miniGStudentProgress"
            ) {

                updateXPDisplay();

            }

        }
    );


    /* =====================================================
       STARTUP
    ===================================================== */

    renderSubjects();

    updateXPDisplay();

});