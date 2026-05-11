/**
 * Trainer Dashboard Logic - Summary View
 * Connected to PHP backend for persistent data.
 */
document.addEventListener('DOMContentLoaded', function() {
    const user = window.authApp.getCurrentUser();
    if (!user || user.role !== 'trainer') {
        window.location.href = 'index.html';
        return;
    }

    initTrainerDashboard(user);
});

function initTrainerDashboard(user) {
    document.getElementById('trainer-name').innerText = user.fname;

    // Fetch dashboard data from backend
    fetch('backend/schedule/get_trainer_dashboard.php')
    .then(res => res.json())
    .then(data => {
        if (!data.success) return;

        // Stats
        document.getElementById('total-students-count').innerText = data.total_students;
        document.getElementById('lessons-today-count').innerText = data.lessons_today;

        const nextTimeEl = document.getElementById('next-lesson-time');
        if (nextTimeEl) {
            if (data.next_lesson_time) {
                const today = new Date().toISOString().split('T')[0];
                if (data.next_lesson_date && data.next_lesson_date !== today) {
                    const d = new Date(data.next_lesson_date + 'T00:00:00');
                    const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    nextTimeEl.innerText = `${data.next_lesson_time} (${dateLabel})`;
                } else {
                    nextTimeEl.innerText = data.next_lesson_time;
                }
            } else {
                nextTimeEl.innerText = '--:--';
            }
        }

        // Avg rating from DB
        const avgRatingEl = document.getElementById('avg-rating');
        if (avgRatingEl) {
            avgRatingEl.innerText = data.avg_rating ? data.avg_rating.toFixed(1) : '0.0';
        }

        // Today's schedule table
        renderTodaySummary(data.today_lessons);

        // Student select for feedback
        populateStudentSelect(data.all_students);
    })
    .catch(err => console.error('Dashboard load error:', err));

    // Feedback Form
    const feedbackForm = document.getElementById('trainer-feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }
}

function renderTodaySummary(lessons) {
    const tableBody = document.getElementById('today-schedule-table');
    if (!tableBody) return;

    if (!lessons || lessons.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="2" class="text-center py-4 text-muted small">No lessons scheduled for today.</td></tr>';
        return;
    }

    tableBody.innerHTML = lessons.map(l => `
        <tr>
            <td class="px-4 py-3"><span class="fw-bold text-dark-green smaller">${l.time}</span></td>
            <td class="px-4 py-3 text-dark-green fw-medium smaller">${l.studentName}</td>
        </tr>
    `).join('');
}

function populateStudentSelect(students) {
    const select = document.getElementById('student-select');
    if (!select) return;

    select.innerHTML = '<option value="">Select a student...</option>';
    if (students && students.length > 0) {
        students.forEach(student => {
            const opt = document.createElement('option');
            opt.value = student.id;
            opt.textContent = `${student.fname} ${student.lname}`;
            select.appendChild(opt);
        });
    }
}

function handleFeedbackSubmit(e) {
    e.preventDefault();
    const studentId = document.getElementById('student-select').value;
    const message = document.getElementById('feedback-message').value;
    const alertEl = document.getElementById('feedback-alert');

    if (!studentId || !message) return;

    fetch('backend/feedback/send_feedback.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, message: message })
    })
    .then(res => res.json())
    .then(data => {
        alertEl.classList.remove('d-none', 'alert-danger', 'alert-success');
        if (data.success) {
            alertEl.classList.add('alert-success');
            alertEl.innerText = data.message || 'Feedback sent successfully!';
            e.target.reset();
        } else {
            alertEl.classList.add('alert-danger');
            alertEl.innerText = data.message || 'Failed to send feedback.';
        }
        
        setTimeout(() => {
            alertEl.classList.add('d-none');
        }, 3000);
    })
    .catch(err => {
        console.error('Feedback submit error:', err);
        alertEl.classList.remove('d-none', 'alert-success');
        alertEl.classList.add('alert-danger');
        alertEl.innerText = 'Network error. Please try again.';
        
        setTimeout(() => {
            alertEl.classList.add('d-none');
        }, 3000);
    });
}
