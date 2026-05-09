/**
 * Trainer Students Logic
 */
document.addEventListener('DOMContentLoaded', function() {
    const user = window.authApp.getCurrentUser();
    if (!user || user.role !== 'trainer') {
        window.location.href = 'index.html';
        return;
    }

    initStudents(user);
});

function initStudents(user) {
    const trainerName = `${user.fname} ${user.lname}`;
    const searchInput = document.getElementById('student-search');

    const update = () => {
        renderStudents(trainerName, searchInput.value);
    };

    searchInput.addEventListener('input', update);
    update();
}

function renderStudents(trainerName, query) {
    const tableBody = document.getElementById('trainer-students-table');
    if (!tableBody) return;

    const reservations = JSON.parse(localStorage.getItem('licensify_reservations')) || [];
    const feedbacks = JSON.parse(localStorage.getItem('licensify_trainer_feedback')) || [];
    
    // Filter trainer's reservations
    const myReservations = reservations.filter(r => r.trainerName === trainerName);
    
    // Get unique student names
    let studentNames = [...new Set(myReservations.map(r => r.studentName))];
    
    if (query) {
        studentNames = studentNames.filter(name => name.toLowerCase().includes(query.toLowerCase()));
    }

    if (studentNames.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">No students found.</td></tr>';
        return;
    }

    tableBody.innerHTML = studentNames.map(name => {
        const studentLessons = myReservations.filter(r => r.studentName === name);
        const lastFeedback = feedbacks.filter(f => f.studentName === name && f.trainerName === trainerName)
                                     .sort((a, b) => b.timestamp - a.timestamp)[0];

        return `
            <tr>
                <td class="px-4 py-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="bg-light-green text-dark-green rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; font-weight: bold;">
                            ${name.charAt(0)}
                        </div>
                        <div class="fw-bold text-dark-green smaller">${name}</div>
                    </div>
                </td>
                <td class="px-4 py-4 smaller text-muted">
                    ${studentLessons.length} Lessons
                </td>
                <td class="px-4 py-4">
                    ${lastFeedback ? `
                        <div class="smaller text-dark-green fw-medium text-truncate" style="max-width: 250px;">"${lastFeedback.message}"</div>
                        <div class="text-muted" style="font-size: 0.7rem;">${lastFeedback.date}</div>
                    ` : '<span class="text-muted smaller italic">No feedback sent yet</span>'}
                </td>
                <td class="px-4 py-4 text-end">
                    <a href="trainer-dashboard.html" class="btn btn-sm btn-light-green text-dark-green rounded-pill px-3 fw-bold">Send Feedback</a>
                </td>
            </tr>
        `;
    }).join('');
}
