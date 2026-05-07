/**
 * Reservations Management Logic
 */
document.addEventListener('DOMContentLoaded', function() {
    renderReservations();
    initFilters();
});

function renderReservations(filters = {}) {
    const tableBody = document.getElementById('reservations-table-body');
    if (!tableBody) return;

    let reservations = window.adminApp.getReservations();

    // Apply filters
    if (filters.status && filters.status !== 'all') {
        reservations = reservations.filter(r => r.status === filters.status);
    }

    if (reservations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">No reservations found.</td></tr>';
        return;
    }

    tableBody.innerHTML = reservations.map(res => `
        <tr>
            <td class="px-4 py-3"><div class="fw-bold text-dark-green smaller">${res.studentName}</div></td>
            <td class="px-4 py-3 smaller text-muted">${res.trainerName}</td>
            <td class="px-4 py-3">
                <div class="smaller fw-bold text-dark-green">${window.adminApp.formatDate(res.date)}</div>
                <div class="smaller text-muted">${res.time}</div>
            </td>
            <td class="px-4 py-3">
                <span class="badge bg-light-green text-dark-green smaller">
                    ${res.status}
                </span>
            </td>
        </tr>
    `).join('');
}


function initFilters() {
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('res-search');

    const update = () => {
        renderReservations({
            status: statusFilter.value,
            search: searchInput.value
        });
    };

    if (statusFilter) statusFilter.addEventListener('change', update);
    if (searchInput) searchInput.addEventListener('input', update);
}

function cancelReservation(id) {
    if (confirm('Are you sure you want to cancel this reservation?')) {
        let reservations = window.adminApp.getReservations();
        const resIndex = reservations.findIndex(r => r.id === id);
        if (resIndex !== -1) {
            reservations[resIndex].status = 'Cancelled';
            window.adminApp.saveReservations(reservations);
            renderReservations();
        }
    }
}

window.cancelReservation = cancelReservation;
