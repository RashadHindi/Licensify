/**
 * Feedback & Reports Logic
 */
document.addEventListener('DOMContentLoaded', function() {
    renderFeedback();
    populateTrainerFilter();
});

function renderFeedback(trainerFilter = 'all') {
    const tableBody = document.getElementById('feedback-table-body');
    if (!tableBody) return;

    let feedbacks = [
        { id: 1, studentName: 'Ahmad Hassan', trainerName: 'Sarah Johnson', rating: 5, comment: 'Excellent trainer! Very patient and explains everything clearly.', date: '2026-05-01' },
        { id: 2, studentName: 'Emma Wilson', trainerName: 'Michael Chen', rating: 4, comment: 'Good lesson, but we started 5 mins late.', date: '2026-05-03' },
        { id: 3, studentName: 'Ahmad Hassan', trainerName: 'Michael Chen', rating: 5, comment: 'Finally mastered the reverse parking thanks to Michael!', date: '2026-05-05' }
    ];

    if (trainerFilter !== 'all') {
        feedbacks = feedbacks.filter(f => f.trainerName === trainerFilter);
    }

    tableBody.innerHTML = feedbacks.map(f => `
        <tr>
            <td class="fw-bold text-dark-green">${f.studentName}</td>
            <td>${f.trainerName}</td>
            <td>
                <div class="text-warning">
                    ${'<i class="bi bi-star-fill"></i>'.repeat(f.rating)}${'<i class="bi bi-star"></i>'.repeat(5-f.rating)}
                </div>
            </td>
            <td><p class="mb-0 text-muted smaller" style="max-width: 300px;">${f.comment}</p></td>
            <td><span class="smaller text-muted">${window.adminApp.formatDate(f.date)}</span></td>
        </tr>
    `).join('');
}

function populateTrainerFilter() {
    const filter = document.getElementById('trainer-feedback-filter');
    const trainers = window.adminApp.getTrainers();
    
    trainers.forEach(t => {
        const opt = document.createElement('option');
        const name = `${t.fname} ${t.lname}`;
        opt.value = name;
        opt.textContent = name;
        filter.appendChild(opt);
    });

    filter.addEventListener('change', (e) => {
        renderFeedback(e.target.value);
    });
}
