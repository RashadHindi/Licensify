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
        
        // Add Standard Categories
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
        const user = JSON.parse(sessionStorage.getItem('licensify_current_user'));
        const catData = quizData.categories.find(c => c.id === categoryId);
            
        document.getElementById('selected-category-name').textContent = catData.name;

        const quizList = document.getElementById('quiz-list');
        quizList.innerHTML = '';

        // 1. Add "Create" Box for Admins/Trainers
        if (user && (user.role === 'admin' || user.role === 'trainer')) {
            const createCol = document.createElement('div');
            createCol.className = 'col-md-4 col-sm-6';
            createCol.innerHTML = `
                <div class="quiz-item-card create-exam-card border-0 text-center d-flex flex-column justify-content-center align-items-center" style="background: linear-gradient(145deg, #ffffff, #f0fdf4); border: 2px dashed #a5d6a7 !important;">
                    <div class="icon-circle mb-3" style="width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #e8f5e9; color: #2e7d32;">
                        <i class="bi bi-plus-circle-fill fs-4"></i>
                    </div>
                    <h4 class="heading-font text-dark-green fs-5">Create Mock Exam</h4>
                    <p class="text-muted smaller mb-0 px-3">Add a new custom practice test to this category.</p>
                </div>
            `;
            createCol.querySelector('.quiz-item-card').addEventListener('click', () => {
                if (window.openExamBuilder) window.openExamBuilder(categoryId);
            });
            quizList.appendChild(createCol);
        }

        // Get exams data
        const availableStandard = quizData.questions[categoryId] || [];
        const customExams = (JSON.parse(localStorage.getItem('licensify_custom_exams')) || []).filter(e => e.category === categoryId);
        const deletedStandard = JSON.parse(localStorage.getItem('licensify_deleted_standard_exams')) || [];
        
        let globalIndex = 1;

        // 2. Render Available Standard Exams (Filter out those deleted by admin)
        availableStandard.forEach((quiz, idx) => {
            const standardId = `std_${categoryId}_${idx}`;
            if (!deletedStandard.includes(standardId)) {
                renderExamCard(quizList, 'Mock Theory Exam', `Practice ${globalIndex < 10 ? '0' + globalIndex : globalIndex}`, false, () => startQuiz(idx), false, standardId);
                globalIndex++;
            }
        });

        // 3. Render Custom Exams (Placed before Coming Soon)
        customExams.forEach((exam, idx) => {
            renderExamCard(quizList, exam.title, `Practice ${globalIndex < 10 ? '0' + globalIndex : globalIndex}`, false, () => startCustomQuiz(exam), true, exam.id);
            globalIndex++;
        });

        // 4. Render "Coming Soon" Standard Exams (up to a total of 5 or more)
        const totalStandardSlots = 5;
        for (let i = availableStandard.length; i < totalStandardSlots; i++) {
            renderExamCard(quizList, 'Coming Soon', `Practice ${globalIndex < 10 ? '0' + globalIndex : globalIndex}`, true);
            globalIndex++;
        }

        switchView('quizzes');
    }

    function renderExamCard(container, title, label, isComingSoon, onClick, isCustom = false, examId = null) {
        const user = JSON.parse(sessionStorage.getItem('licensify_current_user'));
        const isGuest = !window.authApp.isLoggedIn();
        const practiceNum = parseInt(label.replace('Practice ', ''));
        const isLockedForGuest = isGuest && practiceNum > 2;

        const quizCol = document.createElement('div');
        quizCol.className = 'col-md-4 col-sm-6';
        
        // Show delete button only for admins/trainers on custom OR standard exams (if it has an ID)
        const canDelete = !isComingSoon && examId && user && (user.role === 'admin' || user.role === 'trainer');

        quizCol.innerHTML = `
            <div class="quiz-item-card ${isComingSoon ? 'opacity-50' : ''} ${isLockedForGuest ? 'guest-locked' : ''} ${isCustom ? 'custom-quiz-card' : ''}" ${(isComingSoon) ? 'style="cursor: default;"' : ''}>
                <div class="d-flex justify-content-between align-items-start mb-1">
                    <div class="quiz-number">${label}</div>
                    ${canDelete ? `
                        <button class="btn btn-link text-danger p-0 border-0 shadow-none delete-exam-btn" title="Delete Exam" data-id="${examId}" data-custom="${isCustom}">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    ` : ''}
                </div>
                <h4 class="heading-font">${title}</h4>
                <p class="text-muted small mb-4">${isLockedForGuest ? 'Sign in to unlock all practice exams and track your progress.' : 'A complete set of randomized questions to test your readiness.'}</p>
                <div class="btn-start">
                    <i class="bi ${isComingSoon ? 'bi-lock-fill' : (isLockedForGuest ? 'bi-shield-lock' : 'bi-arrow-right')}"></i>
                </div>
            </div>
        `;

        if (canDelete) {
            quizCol.querySelector('.delete-exam-btn').addEventListener('click', (e) => {
                e.stopPropagation(); 
                confirmDeleteFullExam(examId, isCustom);
            });
        }

        if (!isComingSoon && onClick) {
            quizCol.querySelector('.quiz-item-card').addEventListener('click', () => {
                if (isLockedForGuest) {
                    window.authApp.openLogin();
                } else {
                    onClick();
                }
            });
        }
        
        container.appendChild(quizCol);
    }

    function confirmDeleteFullExam(examId, isCustom) {
        const deleteModal = new bootstrap.Modal(document.getElementById('builderDeleteConfirmModal'));
        const confirmBtn = document.getElementById('confirm-delete-q-btn');
        
        const modalTitle = document.querySelector('#builderDeleteConfirmModal h5');
        const modalBody = document.querySelector('#builderDeleteConfirmModal p');
        const originalTitle = modalTitle.textContent;
        const originalBody = modalBody.textContent;

        modalTitle.textContent = isCustom ? "Delete Custom Exam?" : "Remove Standard Exam?";
        modalBody.textContent = "Are you sure you want to remove this mock exam from the list? This action cannot be undone.";
        
        deleteModal.show();

        confirmBtn.onclick = () => {
            if (isCustom) {
                let customExams = JSON.parse(localStorage.getItem('licensify_custom_exams')) || [];
                customExams = customExams.filter(e => e.id !== examId);
                localStorage.setItem('licensify_custom_exams', JSON.stringify(customExams));
            } else {
                let deletedStandard = JSON.parse(localStorage.getItem('licensify_deleted_standard_exams')) || [];
                if (!deletedStandard.includes(examId)) {
                    deletedStandard.push(examId);
                    localStorage.setItem('licensify_deleted_standard_exams', JSON.stringify(deletedStandard));
                }
            }
            
            deleteModal.hide();
            
            setTimeout(() => {
                modalTitle.textContent = originalTitle;
                modalBody.textContent = originalBody;
            }, 500);

            if (window.refreshQuizzes) window.refreshQuizzes();
        };
    }

    // Expose refresh function to builder
    window.refreshQuizzes = () => {
        if (currentCategory) {
            selectCategory(currentCategory);
        }
    };

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
        setupQuizSession();
    }

    function startCustomQuiz(exam) {
        currentQuizIndex = -1;
        currentQuestions = [...exam.questions];
        setupQuizSession();
    }

    function setupQuizSession() {
        currentQuestionIndex = 0;
        userAnswers = new Array(currentQuestions.length).fill(null);

        timeLeft = 30 * 60;
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
        const scorePercentage = Math.round((correct / currentQuestions.length) * 100);

        // Save result for dashboard
        if (window.authApp) {
            // 1. Update Test Scores History
            const existingScores = window.authApp.getUserData('test_scores') || [];
            const newScoreRecord = {
                score: correct,
                total: currentQuestions.length,
                percentage: scorePercentage,
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                category: currentCategory
            };
            existingScores.unshift(newScoreRecord); // Add to beginning
            window.authApp.saveUserData('test_scores', existingScores.slice(0, 10)); // Keep last 10
            window.authApp.saveUserData('latest_test_score', newScoreRecord); // For immediate UI updates

            // 2. Track Mistakes for Progress Insights
            const mistakes = currentQuestions.filter((q, idx) => userAnswers[idx] !== q.correctAnswer).map(q => ({
                text: q.text,
                topic: q.topic || currentCategory, // Use specific topic if available
                explanation: q.explanation,
                correctAnswer: q.options[q.correctAnswer] // Save the actual answer text
            }));
            
            if (mistakes.length > 0) {
                const existingMistakes = window.authApp.getUserData('quiz_mistakes') || [];
                // Combine and keep unique recent mistakes (last 5)
                const updatedMistakes = [...mistakes, ...existingMistakes].filter((m, index, self) =>
                    index === self.findIndex((t) => t.text === m.text)
                ).slice(0, 5);
                window.authApp.saveUserData('quiz_mistakes', updatedMistakes);
            }
        }

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
        const quitModal = new bootstrap.Modal(document.getElementById('quitExamModal'));
        const confirmQuitBtn = document.getElementById('confirm-quit-btn');

        quitBtn.addEventListener('click', () => {
            quitModal.show();
        });

        confirmQuitBtn.addEventListener('click', () => {
            clearInterval(timerInterval);
            quitModal.hide();
            switchView('quizzes');
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
