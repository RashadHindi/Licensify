/**
 * Dashboard logic for student portal
 */
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(sessionStorage.getItem('licensify_current_user'));
    if (!user) return;
    
    // Initialize Dashboard data
    initDashboard(user);

    function initDashboard(user) {
        document.getElementById('user-name-welcome').innerText = user.fname;

        // 1. Upcoming Lesson
        const reservations = window.authApp.getUserData('reservations') || {};
        const reservationKeys = Object.keys(reservations).sort();
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        let upcoming = null;
        for (let dateStr of reservationKeys) {
            if (dateStr >= todayStr) {
                upcoming = reservations[dateStr];
                break;
            }
        }

        if (upcoming) {
            document.getElementById('upcoming-lesson-title').innerText = `${upcoming.date}, ${upcoming.time}`;
            document.getElementById('upcoming-lesson-trainer').innerText = `With Trainer ${upcoming.trainer}`;
        }

        // 2. Latest Test Score
        const latestTest = window.authApp.getUserData('latest_test_score');
        if (latestTest) {
            document.getElementById('latest-score-val').innerText = `${latestTest.percentage}%`;
            document.getElementById('latest-score-desc').innerText = `${latestTest.date} • ${latestTest.score}/${latestTest.total}`;
        } else {
            document.getElementById('latest-score-val').innerText = 'No test results yet';
            document.getElementById('latest-score-desc').innerText = 'Complete your first practice test to track your progress.';
        }


        // 4. Progress Percentage
        const studyProgress = window.authApp.getUserData('study_progress') || {};
        const totalTopics = 5; 
        const completedTopics = Object.values(studyProgress).filter(s => s === 'completed').length;
        const progressPercent = Math.round((completedTopics / totalTopics) * 100);
        document.getElementById('progress-percent-val').innerText = `${progressPercent}%`;
        const fill = document.getElementById('progress-bar-fill');
        if (fill) {
            fill.style.width = `${progressPercent}%`;
            fill.setAttribute('aria-valuenow', progressPercent);
        }

        // 5. Notifications
        renderNotifications(reservations, progressPercent);

        // 6. Trainer Feedback
        renderTrainerFeedback(user);
    }

    function renderTrainerFeedback(user) {
        const feedbackContainer = document.getElementById('trainer-feedback-list');
        if (!feedbackContainer) return;

        const allFeedback = JSON.parse(localStorage.getItem('licensify_trainer_feedback')) || [];
        const myFeedback = allFeedback.filter(f => f.studentName === `${user.fname} ${user.lname}`)
                                     .sort((a, b) => b.timestamp - a.timestamp);

        if (myFeedback.length === 0) {
            feedbackContainer.innerHTML = '<p class="text-center text-muted py-4">No feedback received yet. Keep up the good work!</p>';
            return;
        }

        feedbackContainer.innerHTML = myFeedback.map(f => `
            <div class="feedback-item mb-4 pb-4 border-bottom last-child-border-0">
                <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="bg-dark-green text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; font-weight: bold;">
                        ${f.trainerName.charAt(0)}
                    </div>
                    <div>
                        <p class="fw-bold text-dark-green mb-0">${f.trainerName}</p>
                        <p class="text-muted smaller mb-0">${f.date}</p>
                    </div>
                </div>
                <div class="feedback-content bg-light-green p-3 rounded-3">
                    <p class="text-dark-green mb-0 italic">"${f.message}"</p>
                </div>
            </div>
        `).join('');
    }

    function renderNotifications(reservations, progressPercent) {
        const notifList = document.getElementById('notifications-list');
        const notifCount = document.getElementById('notif-count');
        if (!notifList) return;

        let notifications = [];
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        if (reservations[tomorrowStr]) {
            notifications.push({
                title: 'Lesson Reminder',
                text: `Your lesson is tomorrow at ${reservations[tomorrowStr].time} with Trainer ${reservations[tomorrowStr].trainer}.`,
                icon: 'bi-bell-fill',
                color: 'text-orange',
                bg: 'bg-light-green bg-opacity-50'
            });
        }

        if (progressPercent < 50) {
            notifications.push({
                title: 'New Study Material',
                text: '"Advanced Highway Rules" has been uploaded to your resources.',
                icon: 'bi-file-earmark-arrow-up-fill',
                color: 'text-primary',
                bg: ''
            });
        }

        if (notifications.length > 0) {
            notifList.innerHTML = '';
            notifCount.innerText = `${notifications.length} New`;
            notifications.forEach(n => {
                notifList.innerHTML += `
                    <div class="list-group-item border-0 py-3 px-4 ${n.bg}">
                        <div class="d-flex gap-3">
                            <div class="${n.color}">
                                <i class="bi ${n.icon} fs-5"></i>
                            </div>
                            <div>
                                <p class="fw-bold text-dark-green mb-1">${n.title}</p>
                                <p class="text-muted smaller mb-0">${n.text}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    }


});
