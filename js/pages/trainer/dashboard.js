/**
 * Trainer Dashboard Logic - Summary View
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

    const trainerName = `${user.fname} ${user.lname}`;
    const today = new Date().toISOString().split('T')[0];

    // Load Data
    const reservations = JSON.parse(localStorage.getItem('licensify_reservations')) || [];
    const myReservations = reservations.filter(r => r.trainerName === trainerName);
    
    // Stats
    document.getElementById('total-students-count').innerText = [...new Set(myReservations.map(r => r.studentName))].length;
    
    const allFeedback = JSON.parse(localStorage.getItem('licensify_feedback')) || [];
    const myFeedback = allFeedback.filter(f => f.trainerName === trainerName);
    const avgRating = myFeedback.length > 0 
        ? (myFeedback.reduce((sum, f) => sum + f.rating, 0) / myFeedback.length).toFixed(1)
        : "5.0";
    document.getElementById('avg-rating').innerText = avgRating;

    const todayLessons = myReservations.filter(r => r.date === today && r.status !== 'Cancelled');
    document.getElementById('lessons-today-count').innerText = todayLessons.length;

    // Render Today's Summary
    renderTodaySummary(todayLessons);
    populateStudentSelect(myReservations);

    // Feedback Form
    document.getElementById('trainer-feedback-form').addEventListener('submit', handleFeedbackSubmit);
}

function renderTodaySummary(lessons) {
    const tableBody = document.getElementById('today-schedule-table');
    if (!tableBody) return;

    if (lessons.length === 0) {
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

function populateStudentSelect(myReservations) {
    const select = document.getElementById('student-select');
    if (!select) return;

    const uniqueStudents = [...new Set(myReservations.map(r => r.studentName))];
    select.innerHTML = '<option value="">Select a student...</option>';
    uniqueStudents.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });
}

function handleFeedbackSubmit(e) {
    e.preventDefault();
    const studentName = document.getElementById('student-select').value;
    const message = document.getElementById('feedback-message').value;
    const alertEl = document.getElementById('feedback-alert');

    if (!studentName || !message) return;

    const trainer = window.authApp.getCurrentUser();
    const feedbackData = JSON.parse(localStorage.getItem('licensify_trainer_feedback')) || [];
    
    const newFeedback = {
        id: Date.now(),
        trainerName: `${trainer.fname} ${trainer.lname}`,
        studentName: studentName,
        message: message,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now()
    };

    feedbackData.push(newFeedback);
    localStorage.setItem('licensify_trainer_feedback', JSON.stringify(feedbackData));

    alertEl.classList.remove('d-none', 'alert-danger');
    alertEl.classList.add('alert-success');
    alertEl.innerText = `Feedback sent to ${studentName}!`;
    
    e.target.reset();
    
    setTimeout(() => {
        alertEl.classList.add('d-none');
    }, 3000);
}
