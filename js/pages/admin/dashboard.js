/**
 * Admin Dashboard Logic
 */
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

function initDashboard() {
    const stats = {
        students: window.adminApp.getStudents().length,
        trainers: window.adminApp.getTrainers().length,
        reservations: window.adminApp.getReservations().length
    };

    // Update Stats UI
    document.getElementById('stat-students').innerText = stats.students;
    document.getElementById('stat-trainers').innerText = stats.trainers;
    document.getElementById('stat-reservations').innerText = stats.reservations;

    renderRecentReservations();
    renderTrainerDistribution();
}

function renderRecentReservations() {
    const tableBody = document.getElementById('recent-reservations-table');
    if (!tableBody) return;

    const reservations = window.adminApp.getReservations().slice(-5).reverse();
    
    if (reservations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">No recent reservations found.</td></tr>';
        return;
    }

    tableBody.innerHTML = reservations.map(res => `
        <tr>
            <td class="px-4 py-3">
                <div class="fw-bold text-dark-green smaller">${res.studentName || 'Student'}</div>
            </td>
            <td class="px-4 py-3 smaller text-muted">${res.trainerName || 'Trainer'}</td>
            <td class="px-4 py-3">
                <span class="badge bg-light-green text-dark-green smaller">
                    ${res.status || 'Reserved'}
                </span>
            </td>
        </tr>
    `).join('');
}

function renderTrainerDistribution() {
    const reservations = window.adminApp.getReservations();
    const trainerCounts = {};
    
    reservations.forEach(r => {
        trainerCounts[r.trainerName] = (trainerCounts[r.trainerName] || 0) + 1;
    });

    const total = reservations.length || 1;
    const sortedTrainers = Object.entries(trainerCounts).sort((a, b) => b[1] - a[1]);
    
    const container = document.getElementById('trainer-distribution-list');
    if (!container) return;

    if (sortedTrainers.length === 0) {
        container.innerHTML = '<p class="text-center text-muted smaller py-3">No booking data available yet.</p>';
        return;
    }

    container.innerHTML = sortedTrainers.map(([name, count]) => {
        const percent = Math.round((count / total) * 100);
        return `
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold text-dark-green smaller">${name}</span>
                    <span class="text-muted smaller">${percent}% (${count} lessons)</span>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-dark-green" role="progressbar" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

