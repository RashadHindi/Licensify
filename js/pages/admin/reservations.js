/**
 * Reservations Management Logic
 */
let loadedReservations = [];

document.addEventListener('DOMContentLoaded', function () {
    fetchReservations();
    initFilters();
});

let trainerChart = null;

function fetchReservations() {
    fetch('backend/admin/get_all_reservations.php')
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            loadedReservations = data.reservations;
            renderReservations();
            renderChart();
        } else {
            console.error('Failed to load reservations:', data.message);
        }
    })
    .catch(err => console.error('Error fetching reservations:', err));
}

function renderChart() {
    const ctx = document.getElementById('trainerDistributionChart');
    if (!ctx) return;

    // Aggregate data
    const counts = {};
    loadedReservations.forEach(r => {
        counts[r.trainerName] = (counts[r.trainerName] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    // Destroy existing chart if it exists
    if (trainerChart) trainerChart.destroy();

    trainerChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#014d34', // dark green
                    '#037d55', // slightly lighter green
                    '#e6f0ec', // very light green
                    '#ff9f43', // orange
                    '#0d6efd'  // blue
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: { family: 'Inter', size: 12 },
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function renderReservations(filters = {}) {
    const tableBody = document.getElementById('reservations-table-body');
    if (!tableBody) return;

    let reservations = loadedReservations;

    // Apply filters
    if (filters.status && filters.status !== 'all') {
        reservations = reservations.filter(r => r.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (reservations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">No reservations found.</td></tr>';
        return;
    }

    tableBody.innerHTML = reservations.map(res => {
        let statusBadgeClass = 'bg-light-green text-dark-green'; // Default/Upcoming
        if (res.status === 'Completed') statusBadgeClass = 'bg-primary-subtle text-primary-emphasis fw-semibold';
        else if (res.status === 'Cancelled') statusBadgeClass = 'bg-danger-subtle text-danger-emphasis fw-semibold';

        const dateStr = window.adminApp && window.adminApp.formatDate ? window.adminApp.formatDate(res.date) : res.date;

        return `
        <tr>
            <td class="px-4 py-3"><div class="fw-bold text-dark-green smaller">${res.studentName}</div></td>
            <td class="px-4 py-3 smaller text-muted">${res.trainerName}</td>
            <td class="px-4 py-3">
                <div class="smaller fw-bold text-dark-green">${dateStr}</div>
                <div class="smaller text-muted">${res.time}</div>
            </td>
            <td class="px-4 py-3">
                <span class="badge ${statusBadgeClass} smaller">
                    ${res.status}
                </span>
            </td>
        </tr>
    `}).join('');
}


function initFilters() {
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('res-search');

    const update = () => {
        renderReservations({
            status: statusFilter ? statusFilter.value : 'all',
            search: searchInput ? searchInput.value : ''
        });
    };

    if (statusFilter) statusFilter.addEventListener('change', update);
    if (searchInput) searchInput.addEventListener('input', update);
}
