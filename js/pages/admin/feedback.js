/**
 * Feedback & Reports Logic
 */
let ratingChart = null;
let loadedFeedback = [];
let loadedTrainers = [];

document.addEventListener('DOMContentLoaded', function() {
    fetchFeedbackData();
});

function fetchFeedbackData() {
    fetch('backend/admin/get_feedback.php')
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            loadedFeedback = data.feedback;
            loadedTrainers = data.trainers;
            initFeedbackPage();
            populateTrainerFilter();
        } else {
            console.error('Failed to load feedback', data.message);
        }
    })
    .catch(err => console.error('Error fetching feedback:', err));
}

function initFeedbackPage() {
    const feedback = loadedFeedback;
    
    // 1. Calculate Stats
    const totalReviews = feedback.length;
    const avgRating = totalReviews > 0 
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(1) 
        : "0.0";
    const criticalAlerts = feedback.filter(f => f.rating <= 2).length;

    // 2. Update UI Cards
    document.getElementById('avg-rating').innerText = avgRating;
    document.getElementById('total-reviews').innerText = totalReviews;
    document.getElementById('critical-alerts').innerText = criticalAlerts;

    // Render stars for avg rating
    const starsContainer = document.getElementById('avg-stars');
    if (starsContainer) {
        const fullStars = Math.floor(avgRating);
        const halfStar = avgRating % 1 >= 0.5;
        let starHTML = '';
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) starHTML += '<i class="bi bi-star-fill"></i>';
            else if (i === fullStars && halfStar) starHTML += '<i class="bi bi-star-half"></i>';
            else starHTML += '<i class="bi bi-star"></i>';
        }
        starsContainer.innerHTML = starHTML;
    }

    // 3. Render Chart
    renderRatingChart(feedback);

    // 4. Render Table
    renderFeedbackTable(feedback);
}

function renderRatingChart(feedback) {
    const ctx = document.getElementById('ratingChart');
    if (!ctx) return;

    const distribution = [0, 0, 0, 0, 0]; // 1 to 5 stars
    feedback.forEach(f => {
        if (f.rating >= 1 && f.rating <= 5) {
            distribution[f.rating - 1]++;
        }
    });

    if (ratingChart) {
        ratingChart.destroy();
    }

    ratingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
                label: 'Number of Reviews',
                data: distribution,
                backgroundColor: [
                    '#ff4d4d', // 1 star - Red
                    '#ffa366', // 2 star - Orange
                    '#ffd633', // 3 star - Yellow
                    '#99cc33', // 4 star - Light Green
                    '#014d34'  // 5 star - Dark Green
                ],
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, precision: 0 }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function renderFeedbackTable(feedbacks) {
    const tableBody = document.getElementById('feedback-table-body');
    if (!tableBody) return;

    if (feedbacks.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No feedback found.</td></tr>';
        return;
    }

    tableBody.innerHTML = feedbacks.map(f => {
        const dateStr = window.adminApp && window.adminApp.formatDate ? window.adminApp.formatDate(f.date) : f.date;
        return `
        <tr>
            <td class="px-4 py-3">
                <div class="fw-bold text-dark-green smaller">${f.studentName}</div>
                <div class="text-muted smaller" style="font-size: 0.7rem;">${dateStr}</div>
            </td>
            <td class="px-4 py-3 smaller">${f.trainerName}</td>
            <td class="px-4 py-3">
                <div class="text-warning smaller">
                    ${'<i class="bi bi-star-fill"></i>'.repeat(f.rating)}${'<i class="bi bi-star"></i>'.repeat(5-f.rating)}
                </div>
            </td>
            <td class="px-4 py-3">
                <p class="mb-0 text-muted smaller" style="max-width: 400px; line-height: 1.4;">${f.comment}</p>
            </td>
        </tr>
    `}).join('');
}

function populateTrainerFilter() {
    const filter = document.getElementById('trainer-feedback-filter');
    if (!filter) return;

    filter.innerHTML = '<option value="all">All Trainers</option>';
    
    loadedTrainers.forEach(t => {
        const opt = document.createElement('option');
        const name = `${t.fname} ${t.lname}`;
        opt.value = name;
        opt.textContent = name;
        filter.appendChild(opt);
    });

    filter.addEventListener('change', (e) => {
        const selectedTrainer = e.target.value;
        const allFeedback = loadedFeedback;
        const filteredFeedback = selectedTrainer === 'all' 
            ? allFeedback 
            : allFeedback.filter(f => f.trainerName === selectedTrainer);
        
        renderFeedbackTable(filteredFeedback);
    });
}
