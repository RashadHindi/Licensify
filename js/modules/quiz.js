document.addEventListener('DOMContentLoaded', function () {
    // State management
    let currentCategory = null;
    let currentQuizIndex = null;
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let userAnswers = []; // Store indices of selected answers
    let timerInterval = null;
    let timeLeft = 40 * 60; // 40 minutes in seconds

    // DOM Elements
    const views = {
        categories: document.getElementById('view-categories'),
        quizzes: document.getElementById('view-quizzes'),
        quiz: document.getElementById('view-quiz'),
        results: document.getElementById('view-results'),
        review: document.getElementById('view-review')
    };

    // Push initial state
    if (!history.state) {
        history.replaceState({ view: 'categories' }, '', window.location.pathname);
    }
    
    // Ensure we start at the top of the page
    window.scrollTo(0, 0);

    // Initialize Categories
    function initCategories() {
        const grid = document.getElementById('categories-grid');
        if (!grid) return;

        grid.innerHTML = '';
        quizData.categories.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'col-md-4 col-sm-6 mb-4';
            card.innerHTML = `
                <div class="card h-100 border-0 p-4 category-card rounded-4 shadow-sm" data-id="${cat.id}">
                    <div class="icon-box mb-3 text-dark-green">
                        <i class="bi ${cat.icon} fs-2"></i>
                    </div>
                    <h4 class="fw-bold heading-font mb-2">${cat.name}</h4>
                    <p class="text-muted small mb-0">${cat.description}</p>
                </div>
            `;
            card.addEventListener('click', () => selectCategory(cat.id));
            grid.appendChild(card);
        });
    }

    function switchView(viewName, updateHistory = true) {
        // Simple fade out
        Object.keys(views).forEach(key => {
            if (views[key]) {
                views[key].classList.add('d-none');
                views[key].classList.remove('animate-fade');
            }
        });

        // Update Header Content
        const titleEl = document.getElementById('main-title');
        const subtitleEl = document.getElementById('main-subtitle');
        const headerSection = document.querySelector('.quiz-header');
        
        // Reset header states
        headerSection.classList.remove('header-minimal', 'header-hidden', 'd-none');

        switch (viewName) {
            case 'categories':  
                titleEl.textContent = "Theory Practice";
                subtitleEl.textContent = "Choose your license category and begin your journey toward a successful driving test.";
                break;
            case 'quizzes':
                headerSection.classList.add('header-hidden'); // Smooth collapse
                break;
            case 'quiz':
                headerSection.classList.add('header-hidden');
                break;
            case 'results':
                titleEl.textContent = "Exam Results";
                subtitleEl.textContent = "See how well you performed on this theory test.";
                headerSection.classList.add('header-minimal');
                break;
            case 'review':
                titleEl.textContent = "Question Review";
                subtitleEl.textContent = "Review correct answers and explanations for your mistakes.";
                headerSection.classList.add('header-minimal');
                break;
        }

        // Update browser history for back button support
        if (updateHistory) {
            history.pushState({ view: viewName }, '', `#view-${viewName}`);
        }

        if (views[viewName]) {
            // Tiny delay to let the previous view fade out slightly and feel smoother
            setTimeout(() => {
                views[viewName].classList.remove('d-none');
                // Trigger animation
                setTimeout(() => {
                    views[viewName].classList.add('animate-fade');
                }, 10);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 50);
        }
    }

    // Handle Browser Back Button
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.view) {
            switchView(event.state.view, false);
        } else {
            switchView('categories', false);
        }
    });

    function selectCategory(categoryId) {
        currentCategory = categoryId;
        const catData = quizData.categories.find(c => c.id === categoryId);
        document.getElementById('selected-category-name').textContent = catData.name;

        const quizList = document.getElementById('quiz-list');
        quizList.innerHTML = '';

        // Show available quizzes (mocking 5 quizzes per category)
        const availableQuizzes = quizData.questions[categoryId] || [];

        for (let i = 0; i < 5; i++) {
            const quizCol = document.createElement('div');
            quizCol.className = 'col-md-4 col-sm-6';
            
            const isLocked = i >= availableQuizzes.length;
            
            quizCol.innerHTML = `
                <div class="quiz-item-card ${isLocked ? 'opacity-50' : ''}" ${isLocked ? 'style="cursor: default;"' : ''}>
                    <div class="quiz-number">Practice 0${i + 1}</div>
                    <h4 class="heading-font">${isLocked ? 'Coming Soon' : 'Mock Theory Exam'}</h4>
                    <p class="text-muted small mb-4">A complete set of 30 randomized questions to test your readiness.</p>
                    <div class="btn-start">
                        <i class="bi ${isLocked ? 'bi-lock-fill' : 'bi-arrow-right'}"></i>
                    </div>
                </div>
            `;

            if (!isLocked) {
                quizCol.querySelector('.quiz-item-card').addEventListener('click', () => startQuiz(i));
            }
            
            quizList.appendChild(quizCol);
        }

        switchView('quizzes');
    }

    // Add listener for back to categories button
    const backToCatBtn = document.getElementById('btn-back-to-categories');
    if (backToCatBtn) {
        backToCatBtn.addEventListener('click', () => switchView('categories'));
    }

    function startQuiz(index) {
        currentQuizIndex = index;
        const rawQuestions = quizData.questions[currentCategory][index];

        // Randomize questions as requested
        currentQuestions = [...rawQuestions].sort(() => Math.random() - 0.5);
        currentQuestionIndex = 0;
        userAnswers = new Array(currentQuestions.length).fill(null);

        timeLeft = 40 * 60;
        startTimer();
        initQuestionNav();
        renderQuestion();
        switchView('quiz');
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);

        const timerDisplay = document.getElementById('timer-display');

        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                submitQuiz();
            }

            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function initQuestionNav() {
        const navGrid = document.getElementById('question-nav');
        navGrid.innerHTML = '';
        currentQuestions.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            dot.textContent = i + 1;
            dot.id = `nav-dot-${i}`;
            dot.addEventListener('click', () => goToQuestion(i));
            navGrid.appendChild(dot);
        });
        updateNavDots();
    }

    function updateNavDots() {
        currentQuestions.forEach((_, i) => {
            const dot = document.getElementById(`nav-dot-${i}`);
            dot.classList.remove('current', 'answered');
            if (i === currentQuestionIndex) dot.classList.add('current');
            else if (userAnswers[i] !== null) dot.classList.add('answered');
        });
    }

    function renderQuestion() {
        const q = currentQuestions[currentQuestionIndex];
        const qTextEl = document.getElementById('question-text');
        const qContainer = qTextEl.closest('.card');

        // Animation trigger
        qContainer.classList.remove('animate-fade');
        void qContainer.offsetWidth; // force reflow
        qContainer.classList.add('animate-fade');

        qTextEl.textContent = q.text;
        document.getElementById('current-q-num').textContent = currentQuestionIndex + 1;
        document.getElementById('total-q-num').textContent = currentQuestions.length;

        // Handle Image
        const imgContainer = document.getElementById('question-image-container');
        if (q.image) {
            imgContainer.innerHTML = `<img src="${q.image}" class="img-fluid rounded-4 mb-4 shadow-sm" alt="Question visual">`;
            imgContainer.classList.remove('d-none');
        } else {
            imgContainer.classList.add('d-none');
        }

        // Options
        const optionsList = document.getElementById('options-list');
        optionsList.innerHTML = '';
        q.options.forEach((opt, i) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = `answer-option mb-3 ${userAnswers[currentQuestionIndex] === i ? 'selected' : ''}`;
            optionDiv.innerHTML = `
                <div class="option-letter shadow-sm">${String.fromCharCode(65 + i)}</div>
                <div class="option-text fw-medium">${opt}</div>
            `;
            optionDiv.addEventListener('click', () => {
                selectAnswer(i);
                optionDiv.style.transform = 'scale(0.98)';
                setTimeout(() => optionDiv.style.transform = '', 100);
            });
            optionsList.appendChild(optionDiv);
        });

        // Progress Bar
        const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
        document.getElementById('quiz-progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-percent').textContent = `${Math.round(progress)}% Complete`;

        // Buttons
        document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;
        const nextBtn = document.getElementById('next-btn');
        if (currentQuestionIndex === currentQuestions.length - 1) {
            nextBtn.innerHTML = 'Finish Exam <i class="bi bi-check2-circle ms-2"></i>';
            nextBtn.className = 'btn btn-orange btn-rounded px-5 py-3 fw-bold';
        } else {
            nextBtn.innerHTML = 'Next Question <i class="bi bi-arrow-right ms-2"></i>';
            nextBtn.className = 'btn btn-dark-green btn-rounded px-5 py-3 fw-bold';
        }

        updateNavDots();
    }

    function selectAnswer(index) {
        userAnswers[currentQuestionIndex] = index;
        const options = document.querySelectorAll('.answer-option');
        options.forEach((opt, i) => {
            if (i === index) opt.classList.add('selected');
            else opt.classList.remove('selected');
        });
        updateNavDots();
    }

    function goToQuestion(index) {
        currentQuestionIndex = index;
        renderQuestion();
    }

    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            submitQuiz();
        }
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    });

    function submitQuiz() {
        clearInterval(timerInterval);

        let correct = 0;
        userAnswers.forEach((ans, i) => {
            if (ans === currentQuestions[i].correctAnswer) correct++;
        });

        const wrong = currentQuestions.length - correct;

        document.getElementById('score-value').textContent = `${correct} / ${currentQuestions.length}`;
        document.getElementById('correct-count').textContent = correct;
        document.getElementById('wrong-count').textContent = wrong;

        switchView('results');
    }

    // Results/Review Actions
    document.getElementById('btn-review').addEventListener('click', showReview);
    document.getElementById('btn-back-categories').addEventListener('click', () => {
        // Just go back to quiz list for the current category
        switchView('quizzes');
    });
    document.getElementById('btn-back-categories-2').addEventListener('click', () => switchView('results'));
    
    // Quit Quiz
    const quitBtn = document.getElementById('btn-quit-quiz');
    if (quitBtn) {
        quitBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to quit this exam? Your progress will be lost.")) {
                clearInterval(timerInterval);
                switchView('quizzes');
            }
        });
    }

    function showReview() {
        const reviewList = document.getElementById('review-list');
        reviewList.innerHTML = '';

        currentQuestions.forEach((q, i) => {
            const userAns = userAnswers[i];
            const isCorrect = userAns === q.correctAnswer;

            const reviewItem = document.createElement('div');
            reviewItem.className = 'card border-0 shadow-sm rounded-4 p-4 mb-4';
            reviewItem.innerHTML = `
                <div class="d-flex justify-content-between mb-3">
                    <span class="badge ${isCorrect ? 'bg-success' : 'bg-danger'} rounded-pill px-3">Question ${i + 1}</span>
                    <span class="fw-bold ${isCorrect ? 'text-success' : 'text-danger'}">${isCorrect ? 'Correct' : 'Incorrect'}</span>
                </div>
                <h5 class="fw-bold mb-4">${q.text}</h5>
                <div class="vstack gap-2 mb-4">
                    <div class="p-3 rounded-3 border ${userAns === q.correctAnswer ? 'border-success bg-light' : (userAns !== null ? 'border-danger bg-light' : 'border-secondary opacity-50')}">
                        <small class="text-muted d-block mb-1">Your Answer:</small>
                        <span class="fw-bold">${userAns !== null ? q.options[userAns] : 'Not Answered'}</span>
                    </div>
                    ${!isCorrect ? `
                    <div class="p-3 rounded-3 border border-success bg-light">
                        <small class="text-muted d-block mb-1">Correct Answer:</small>
                        <span class="fw-bold text-success">${q.options[q.correctAnswer]}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="p-3 rounded-3 bg-light-green border border-light">
                    <h6 class="fw-bold text-dark-green mb-2"><i class="bi bi-info-circle me-2"></i>Explanation</h6>
                    <p class="small text-muted mb-0">${q.explanation}</p>
                </div>
            `;
            reviewList.appendChild(reviewItem);
        });

        switchView('review');
    }

    // Initialize
    initCategories();
    switchView('categories', false);
});
