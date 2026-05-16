/**
 * Admin Exams Analytics Logic
 */
document.addEventListener('DOMContentLoaded', function () {
    const examsTableBody = document.getElementById('exams-table-body');
    const chartCanvas = document.getElementById('examCreatorChart');
    let examChart = null;

    loadExamsStats();

    function loadExamsStats() {
        fetch('backend/admin/get_exams_stats.php')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderExamsTable(data.exams);
                    renderChart(data.distribution);
                } else {
                    console.error('Failed to load exam stats:', data.message);
                }
            })
            .catch(err => console.error('Error fetching exam stats:', err));
    }

    function renderExamsTable(exams) {
        if (!examsTableBody) return;
        examsTableBody.innerHTML = '';

        if (exams.length === 0) {
            examsTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No exams found in database.</td></tr>';
            return;
        }

        exams.forEach(exam => {
            const row = `
                <tr>
                    <td class="px-4 py-3 align-middle fw-semibold text-dark-green">${exam.title}</td>
                    <td class="px-4 py-3 align-middle">
                        <span class="badge bg-light-green text-dark-green px-3 py-2 rounded-pill fw-medium">${exam.category}</span>
                    </td>
                    <td class="px-4 py-3 align-middle text-muted">${exam.creator_name}</td>
                    <td class="px-4 py-3 align-middle smaller text-muted">${exam.created_at}</td>
                </tr>
            `;
            examsTableBody.innerHTML += row;
        });
    }

    function renderChart(distribution) {
        if (!chartCanvas) return;

        const labels = Object.keys(distribution);
        const values = Object.values(distribution);

        // Palette matching the site's design
        const colors = [
            '#064e3b', // Dark Green
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#3b82f6', // Blue
            '#ec4899', // Pink
            '#8b5cf6'  // Violet
        ];

        if (examChart) {
            examChart.destroy();
        }

        examChart = new Chart(chartCanvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.raw / total) * 100);
                                return `${context.label}: ${context.raw} Exams (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
});
