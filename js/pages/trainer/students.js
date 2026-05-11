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
    const searchInput = document.getElementById('student-search');

    fetch('backend/schedule/get_trainer_students.php')
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Failed to load students');
            return;
        }

        const allStudents = data.students || [];

        const update = () => {
            renderStudents(allStudents, searchInput.value);
        };

        if (searchInput) {
            searchInput.addEventListener('input', update);
        }
        update();
    })
    .catch(err => console.error('Error fetching students:', err));
}

function renderStudents(students, query) {
    const tableBody = document.getElementById('trainer-students-table');
    if (!tableBody) return;

    let filteredStudents = students;
    
    if (query) {
        filteredStudents = filteredStudents.filter(s => s.studentName.toLowerCase().includes(query.toLowerCase()));
    }

    if (filteredStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">No students found.</td></tr>';
        return;
    }

    tableBody.innerHTML = filteredStudents.map(student => {
        return `
            <tr>
                <td class="px-4 py-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="bg-light-green text-dark-green rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; font-weight: bold;">
                            ${student.studentName.charAt(0)}
                        </div>
                        <div class="fw-bold text-dark-green smaller">${student.studentName}</div>
                    </div>
                </td>
                <td class="px-4 py-4 smaller text-muted">
                    ${student.totalLessons} Lessons
                </td>
                <td class="px-4 py-4">
                    ${student.lastFeedback ? `
                        <div class="smaller text-dark-green fw-medium text-truncate" style="max-width: 250px;">"${student.lastFeedback}"</div>
                        <div class="text-muted" style="font-size: 0.7rem;">${student.lastFeedbackDate}</div>
                    ` : '<span class="text-muted smaller italic">No feedback sent yet</span>'}
                </td>
                <td class="px-4 py-4 text-end">
                    <a href="trainer-dashboard.html" class="btn btn-sm btn-light-green text-dark-green rounded-pill px-3 fw-bold">Send Feedback</a>
                </td>
            </tr>
        `;
    }).join('');
}
