/**
 * Admin Dashboard Logic
 */
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

function initDashboard() {
    fetch('backend/admin/get_dashboard_stats.php')
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Failed to load dashboard stats:', data.message);
            return;
        }

        // Update Stats UI
        document.getElementById('stat-students').innerText = data.stats.students;
        document.getElementById('stat-trainers').innerText = data.stats.trainers;
        document.getElementById('stat-reservations').innerText = data.stats.reservations;
        if (document.getElementById('stat-exams')) {
            document.getElementById('stat-exams').innerText = data.stats.exams || 0;
        }

        renderRecentReservations(data.recent_reservations);
        renderTrainerDistribution(data.trainer_distribution, data.stats.reservations);
    })
    .catch(err => console.error('Error fetching admin dashboard:', err));
}

function renderRecentReservations(reservations) {
    const tableBody = document.getElementById('recent-reservations-table');
    if (!tableBody) return;

    if (!reservations || reservations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">No recent reservations found.</td></tr>';
        return;
    }

    tableBody.innerHTML = reservations.map(res => {
        let statusBadgeClass = 'bg-light-green text-dark-green'; // Default/Upcoming
        if (res.status === 'Completed') statusBadgeClass = 'bg-primary-subtle text-primary-emphasis fw-semibold';
        else if (res.status === 'Cancelled') statusBadgeClass = 'bg-danger-subtle text-danger-emphasis fw-semibold';

        return `
        <tr>
            <td class="px-4 py-3">
                <div class="fw-bold text-dark-green smaller">${res.studentName || 'Student'}</div>
            </td>
            <td class="px-4 py-3 smaller text-muted">${res.trainerName || 'Trainer'}</td>
            <td class="px-4 py-3">
                <span class="badge ${statusBadgeClass} smaller">
                    ${res.status || 'Reserved'}
                </span>
            </td>
        </tr>
    `}).join('');
}

function renderTrainerDistribution(trainerDistribution, totalReservations) {
    const container = document.getElementById('trainer-distribution-list');
    if (!container) return;

    if (!trainerDistribution || trainerDistribution.length === 0) {
        container.innerHTML = '<p class="text-center text-muted smaller py-3">No booking data available yet.</p>';
        return;
    }

    const total = totalReservations || 1;

    container.innerHTML = trainerDistribution.map(trainer => {
        const percent = Math.round((trainer.count / total) * 100);
        return `
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold text-dark-green smaller">${trainer.name}</span>
                    <span class="text-muted smaller">${percent}% (${trainer.completed_count} completed, ${trainer.upcoming_count} upcoming)</span>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-dark-green" role="progressbar" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

