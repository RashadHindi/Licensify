/**
 * Progress page logic
 */
document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(sessionStorage.getItem('licensify_current_user'));
    if (!user) return;

    renderProgressView();

    function renderProgressView() {
        const container = document.getElementById('progress-content');
        if (!container) return;

        const studyProgress = window.authApp.getUserData('study_progress') || {};
        const testScores = window.authApp.getUserData('test_scores') || [];

        const topics = [
            { id: 'traffic-signs', name: 'Traffic Signs', total: 15 },
            { id: 'road-rules', name: 'Road Rules', total: 24 },
            { id: 'driving-situations', name: 'Driving Situations', total: 18 },
            { id: 'safety-basics', name: 'Vehicle Basics', total: 10 }
        ];

        // Calculate status counts
        const completedCount = topics.filter(t => {
            const completed = studyProgress[t.id + '_completed'] || 0;
            return completed === t.total || studyProgress[t.id] === 'completed';
        }).length;
        const inProgressCount = topics.filter(t => {
            const completed = studyProgress[t.id + '_completed'] || 0;
            return (completed > 0 && completed < t.total) || studyProgress[t.id] === 'in-progress';
        }).length;
        const unstartedCount = topics.length - completedCount - inProgressCount;

        // Calculate Overall Readiness (50% Study, 50% Exams)
        const totalLessons = topics.reduce((acc, t) => acc + t.total, 0);
        const lessonsDone = topics.reduce((acc, t) => {
            const c = studyProgress[t.id + '_completed'] || 0;
            return acc + (studyProgress[t.id] === 'completed' ? t.total : c);
        }, 0);
        
        const studyReadiness = (lessonsDone / totalLessons) * 50;
        const examReadiness = testScores.length > 0 ? (Math.max(...testScores.map(s => s.percentage)) / 100) * 50 : 0;
        const readiness = Math.round(studyReadiness + examReadiness);

        let scoresHTML = testScores.length > 0 ? testScores.slice(0, 5).map(s => `
            <div class="d-flex align-items-center justify-content-between py-3 border-bottom">
                <div class="d-flex align-items-center gap-3">
                    <div class="icon-box bg-light-green text-dark-green rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                        <i class="bi bi-journal-check"></i>
                    </div>
                    <div>
                        <p class="fw-bold text-dark-green mb-0">Practice Test</p>
                        <p class="text-muted smaller mb-0">${s.date}</p>
                    </div>
                </div>
                <div class="text-end">
                    <p class="fw-bold ${s.percentage >= 80 ? 'text-success' : 'text-orange'} mb-0">${s.percentage}%</p>
                    <p class="text-muted smaller mb-0">${s.score}/${s.total}</p>
                </div>
            </div>
        `).join('') : `
            <div class="text-center py-5">
                <i class="bi bi-clipboard-x fs-1 text-muted opacity-25 mb-3 d-block"></i>
                <p class="text-muted">No test results yet. <a href="exams.html" class="text-dark-green fw-bold">Take a test</a></p>
            </div>
        `;

        const mistakes = window.authApp.getUserData('quiz_mistakes') || [];
        let insightsHTML = '';
        if (mistakes.length > 0) {
            insightsHTML = mistakes.map((m, idx) => `
                <li class="d-flex align-items-start gap-3 mb-4 pb-3 border-bottom border-white border-opacity-10 position-relative group-hover">
                    <div class="bg-white bg-opacity-20 rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center" style="width: 28px; height: 28px;">
                        <i class="bi bi-exclamation-triangle-fill text-orange" style="font-size: 0.75rem;"></i>
                    </div>
                    <div class="flex-grow-1 pe-4">
                        <p class="fw-bold mb-1 smaller text-capitalize" style="letter-spacing: 0.5px; opacity: 0.9;">${m.topic.replace('-', ' ')}</p>
                        <p class="small opacity-75 mb-2 lh-base">${m.text}</p>
                        ${m.correctAnswer ? `
                        <div class="d-flex align-items-center gap-2 mt-2 pt-2 border-top border-white border-opacity-10">
                            <i class="bi bi-check-circle-fill text-light-green smaller"></i>
                            <p class="smaller fw-bold mb-0 text-light-green">Answer: ${m.correctAnswer}</p>
                        </div>
                        ` : ''}
                    </div>
                    <button class="btn btn-link text-white p-0 opacity-50 hover-opacity-100 transition-all" 
                            onclick="progressApp.dismissMistake('${m.text.replace(/'/g, "\\'")}')"
                            title="Mark as Mastered">
                        <i class="bi bi-check2-circle fs-5"></i>
                    </button>
                </li>
            `).join('');
        } else {
            insightsHTML = `
                <li class="text-center py-4">
                    <i class="bi bi-stars fs-3 mb-2 d-block text-warning"></i>
                    <p class="smaller opacity-75 mb-0">No recent mistakes found. You're mastering the theory!</p>
                </li>
            `;
        }

        container.innerHTML = `
            <!-- Status Summary Bar -->
            <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                        <h6 class="text-muted smaller fw-bold mb-1">COMPLETED</h6>
                        <h4 class="fw-bold text-success mb-0">${completedCount}</h4>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                        <h6 class="text-muted smaller fw-bold mb-1">IN PROGRESS</h6>
                        <h4 class="fw-bold text-primary mb-0">${inProgressCount}</h4>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                        <h6 class="text-muted smaller fw-bold mb-1">UNSTARTED</h6>
                        <h4 class="fw-bold text-muted mb-0">${unstartedCount}</h4>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                        <h6 class="text-muted smaller fw-bold mb-1">EXAMS SOLVED</h6>
                        <h4 class="fw-bold text-dark-green mb-0">${testScores.length}</h4>
                    </div>
                </div>
            </div>

            <!-- Exam Readiness Summary -->
            <div class="card border-0 shadow-sm rounded-4 p-4 mb-5 bg-white overflow-hidden position-relative">
                <div class="row align-items-center position-relative" style="z-index: 2;">
                    <div class="col-12">
                        <h4 class="fw-bold text-dark-green mb-3 heading-font">Exam Readiness Score</h4>
                        <p class="text-muted mb-4">This score is calculated based on your study completion and recent mock exam performance.</p>
                        <div class="d-flex align-items-center gap-4">
                            <div>
                                <h2 class="display-4 fw-bold text-dark-green mb-0">${readiness}%</h2>
                                <p class="smaller text-uppercase fw-bold text-muted mb-0 tracking-wider">Overall Ready</p>
                            </div>
                            <div class="vr opacity-10"></div>
                            <div class="flex-grow-1" style="max-width: 400px;">
                                <div class="progress mb-2" style="height: 10px; border-radius: 5px;">
                                    <div class="progress-bar bg-dark-green" style="width: ${readiness}%"></div>
                                </div>
                                <p class="smaller text-muted mb-0">
                                    ${readiness < 80 ? 'Keep studying! Aim for 80% to be exam-ready.' : 'You are ready for the real exam! Good luck!'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row g-4">
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h5 class="fw-bold text-dark-green heading-font mb-0">Recent Test Scores</h5>
                            <a href="exams.html" class="btn btn-sm btn-outline-dark-green rounded-pill px-3">New Test</a>
                        </div>
                        <div class="scores-list">
                            ${scoresHTML}
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm rounded-4 p-4 bg-dark-green text-white h-100">
                        <h5 class="fw-bold mb-3 heading-font">Mistake Review</h5>
                        <div class="mb-4">
                            <p class="opacity-75 smaller mb-3">Focus on these specific questions from your last quizzes. Once mastered, click the checkmark to clear them:</p>
                            
                            <!-- Scrollable Mistake Container -->
                            <div class="custom-scrollbar pe-2" style="max-height: 400px; overflow-y: auto;">
                                <ul class="list-unstyled d-flex flex-column mb-0">
                                    ${insightsHTML}
                                </ul>
                            </div>
                        </div>
                        
                        <div class="mt-auto pt-4 border-top border-white border-opacity-10">
                            <div class="d-flex align-items-center gap-3">
                                <div class="bg-light-green text-dark-green rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px;">
                                    <i class="bi bi-lightbulb-fill fs-4"></i>
                                </div>
                                <div>
                                    <p class="fw-bold mb-0">Study Tip</p>
                                    <p class="smaller opacity-75 mb-0">Reviewing your mistakes is the fastest way to learn.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>
                    /* Custom scrollbar for the mistake review */
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(255, 255, 255, 0.3);
                    }
                </style>
            </div>
        `;
    }

    // Expose functionality globally
    window.progressApp = {
        dismissMistake: function (text) {
            const mistakes = window.authApp.getUserData('quiz_mistakes') || [];
            const updated = mistakes.filter(m => m.text !== text);
            window.authApp.saveUserData('quiz_mistakes', updated);
            renderProgressView();
        }
    };
});
