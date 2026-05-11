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
        fetch('backend/schedule/get_student_reservations.php')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.reservations && data.reservations.length > 0) {
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                let upcoming = null;
                
                const isTimePassedToday = (timeStr) => {
                    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (!match) return false;
                    let [_, hours, mins, modifier] = match;
                    hours = parseInt(hours);
                    mins = parseInt(mins);
                    if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
                    if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
                    
                    const lessonTime = new Date();
                    lessonTime.setHours(hours, mins, 0, 0);
                    return now > lessonTime;
                };

                const reversed = [...data.reservations].reverse();
                for (let res of reversed) {
                    if (res.status !== 'Completed') {
                        if (res.date > todayStr || (res.date === todayStr && !isTimePassedToday(res.time))) {
                            upcoming = res;
                            break;
                        }
                    }
                }

                if (upcoming) {
                    const prettyDate = new Date(upcoming.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    document.getElementById('upcoming-lesson-title').innerText = `${prettyDate}, ${upcoming.time}`;
                    document.getElementById('upcoming-lesson-trainer').innerText = `With Trainer ${upcoming.trainer}`;
                }
            }
        })
        .catch(err => console.error('Error fetching upcoming lesson:', err));

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
        renderNotifications();

        // 6. Trainer Feedback
        renderTrainerFeedback(user);
    }

    function renderTrainerFeedback() {
        const feedbackContainer = document.getElementById('trainer-feedback-list');
        if (!feedbackContainer) return;

        fetch('backend/feedback/get_student_feedback.php')
        .then(res => res.json())
        .then(data => {
            if (!data.success || !data.feedbacks || data.feedbacks.length === 0) {
                feedbackContainer.innerHTML = '<p class="text-center text-muted py-4">No feedback received yet. Keep up the good work!</p>';
                return;
            }

            feedbackContainer.innerHTML = data.feedbacks.map(f => {
                let avatarHtml = '';
                if (f.trainerPhoto) {
                    avatarHtml = `<img src="${f.trainerPhoto}" alt="${f.trainerName}" class="rounded-circle object-fit-cover" style="width: 40px; height: 40px;">`;
                } else {
                    avatarHtml = `<div class="bg-dark-green text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; font-weight: bold;">${f.trainerName.charAt(0)}</div>`;
                }

                return `
                    <div class="feedback-item mb-4 pb-4 border-bottom last-child-border-0">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            ${avatarHtml}
                            <div>
                                <p class="fw-bold text-dark-green mb-0">${f.trainerName}</p>
                                <p class="text-muted smaller mb-0">${f.date}</p>
                            </div>
                        </div>
                        <div class="feedback-content bg-light-green p-3 rounded-3">
                            <p class="text-dark-green mb-0 italic">"${f.message}"</p>
                        </div>
                    </div>
                `;
            }).join('');
        })
        .catch(err => {
            console.error('Failed to load feedback:', err);
            feedbackContainer.innerHTML = '<p class="text-center text-danger py-4">Failed to load feedback.</p>';
        });
    }

    function renderNotifications() {
        const notifList = document.getElementById('notifications-list');
        const notifCount = document.getElementById('notif-count');
        if (!notifList) return;

        fetch('backend/notifications/get_notifications.php')
        .then(res => res.json())
        .then(data => {
            if (!data.success) return;

            const notifications = data.notifications || [];
            
            if (notifications.length > 0) {
                notifList.innerHTML = '';
                notifCount.innerText = `${notifications.length} New`;
                
                notifications.forEach(n => {
                    notifList.innerHTML += `
                        <div class="list-group-item border-0 py-3 px-4 ${n.bg} position-relative" id="notif-${n.id}">
                            <button type="button" class="btn-close position-absolute top-0 end-0 mt-3 me-3" style="font-size: 0.6rem;" aria-label="Close" onclick="deleteNotification('${n.id}')"></button>
                            <div class="d-flex gap-3 pe-4">
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
            } else {
                notifList.innerHTML = '<div class="list-group-item border-0 py-4 px-4 text-center text-muted">No new notifications</div>';
                notifCount.innerText = '0 New';
            }
        })
        .catch(err => console.error('Failed to load notifications:', err));
    }
});

// Global function to delete notification
window.deleteNotification = function(id) {
    fetch('backend/notifications/delete_notification.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const el = document.getElementById(`notif-${id}`);
            if (el) {
                el.style.opacity = '0';
                setTimeout(() => {
                    el.remove();
                    // Update count
                    const notifCount = document.getElementById('notif-count');
                    const currentCount = parseInt(notifCount.innerText);
                    if (currentCount > 0) {
                        notifCount.innerText = `${currentCount - 1} New`;
                    }
                    if (currentCount - 1 === 0) {
                        document.getElementById('notifications-list').innerHTML = '<div class="list-group-item border-0 py-4 px-4 text-center text-muted">No new notifications</div>';
                    }
                }, 300);
            }
        } else {
            console.error('Failed to delete notification:', data.message);
        }
    })
    .catch(err => console.error('Delete error:', err));
};

