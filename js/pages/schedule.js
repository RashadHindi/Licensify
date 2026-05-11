/**
 * Schedule page logic
 */
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(sessionStorage.getItem('licensify_current_user'));
    if (!user) return;
    
    renderScheduleView();

    function renderScheduleView() {
        const container = document.getElementById('schedule-content');
        if (!container) return;

        fetch('backend/schedule/get_student_reservations.php')
        .then(res => res.json())
        .then(data => {
            if (!data.success) return;

            const reservations = data.reservations || [];
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            let upcomingHTML = '';
            let pastHTML = '';

            const isTimePassedToday = (timeStr) => {
                const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (!match) return false;
                let [_, hours, mins, modifier] = match;
                hours = parseInt(hours);
                mins = parseInt(mins);
                if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
                if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
                
                const lessonTime = new Date();
                lessonTime.setHours(hours, mins, 0, 0);
                return now > lessonTime;
            };

            reservations.forEach(res => {
                const isPast = res.date < todayStr || res.status === 'Completed' || (res.date === todayStr && isTimePassedToday(res.time));
                const dateObj = new Date(res.date);
                const dayName = dateObj.toLocaleDateString('default', { weekday: 'short' });
                const monthName = dateObj.toLocaleDateString('default', { month: 'short' });
                const dayNum = res.date.split('-')[2];

                const itemHTML = `
                    <div class="card border-0 shadow-sm rounded-4 p-3 mb-3 hover-lift">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <div class="bg-light-green text-dark-green rounded-3 p-2 text-center" style="min-width: 70px;">
                                    <p class="smaller text-uppercase fw-bold mb-0" style="font-size: 0.7rem; opacity: 0.7;">${dayName}</p>
                                    <p class="fs-4 fw-bold mb-0">${dayNum}</p>
                                    <p class="smaller text-uppercase mb-0" style="font-size: 0.7rem; opacity: 0.7;">${monthName}</p>
                                </div>
                            </div>
                            <div class="col">
                                <div class="d-flex align-items-center gap-2 mb-1">
                                    <span class="badge ${isPast ? 'bg-light text-muted' : 'bg-primary bg-opacity-10 text-primary'} rounded-pill" style="font-size: 0.7rem;">
                                        ${isPast ? 'Completed' : 'Upcoming'}
                                    </span>
                                    <h6 class="fw-bold text-dark-green mb-0">${res.time} • Practical Lesson</h6>
                                </div>
                                <p class="text-muted smaller mb-0">
                                    <i class="bi bi-person-circle me-1"></i> Trainer ${res.trainer} 
                                </p>
                            </div>
                            <div class="col-md-auto mt-3 mt-md-0">
                                ${isPast ? `
                                    <button class="btn btn-sm btn-outline-dark-green rounded-pill px-3 d-flex align-items-center gap-2" onclick="scheduleApp.openRateModal('${res.trainer}', ${res.trainer_id})">
                                        <i class="bi bi-star-fill text-warning"></i> Rate Trainer
                                    </button>
                                ` : `
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="scheduleApp.cancelReservation(${res.id})">Cancel</button>
                                        <button class="btn btn-sm btn-primary rounded-pill px-3" onclick="window.location.href='reservation.html?reschedule_id=${res.id}'">Reschedule</button>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                `;
                if (isPast) pastHTML += itemHTML; else upcomingHTML += itemHTML;
            });

            container.innerHTML = `
                <div class="row g-4">
                    <div class="col-lg-8">
                        <div class="mb-5">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h5 class="fw-bold text-dark-green heading-font mb-0">Upcoming Sessions</h5>
                                <span class="badge bg-light-green text-dark-green rounded-pill px-3 py-2">
                                    ${upcomingHTML ? 'Active' : 'No Sessions'}
                                </span>
                            </div>
                            ${upcomingHTML || `
                                <div class="text-center py-5 bg-white rounded-4 shadow-sm border-dashed">
                                    <div class="icon-box bg-light-green text-dark-green rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                                        <i class="bi bi-calendar-plus fs-3"></i>
                                    </div>
                                    <p class="text-muted mb-4">You don't have any lessons scheduled.</p>
                                    <a href="reservation.html" class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm">Book Your First Lesson</a>
                                </div>
                            `}
                        </div>
                        
                        <div>
                            <h5 class="fw-bold text-dark-green heading-font mb-4">Past Sessions</h5>
                            ${pastHTML || '<p class="text-muted opacity-50 py-4 text-center">No past lessons recorded yet.</p>'}
                        </div>
                    </div>
                    
                    <div class="col-lg-4 mt-4 mt-lg-0">
                        <div class="card border-0 shadow-sm rounded-4 p-4 text-center bg-white sticky-top" style="top: 100px;">
                            <div class="icon-box bg-light-green text-dark-green rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                                <i class="bi bi-plus-lg fs-3"></i>
                            </div>
                            <h5 class="fw-bold text-dark-green">Need more practice?</h5>
                            <p class="text-muted smaller mb-4">Accelerate your learning by booking extra sessions with our top-rated trainers.</p>
                            <a href="reservation.html" class="btn btn-primary rounded-pill w-100 py-3 fw-bold shadow-sm">Book New Lesson</a>
                        </div>
                    </div>
                </div>
            `;
        })
        .catch(err => console.error('Error fetching schedule:', err));
    }

    // State for cancellation
    let idToCancel = null;
    const cancelModal = new bootstrap.Modal(document.getElementById('cancelModal'));
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', () => {
            if (idToCancel) {
                fetch('backend/schedule/cancel_student_reservation.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: idToCancel })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        cancelModal.hide();
                        renderScheduleView();
                    } else {
                        alert(data.message || 'Failed to cancel reservation.');
                    }
                    idToCancel = null;
                })
                .catch(err => {
                    console.error('Cancel error:', err);
                    idToCancel = null;
                });
            }
        });
    }

    // Rate Modal instance
    const rateModal = new bootstrap.Modal(document.getElementById('rateModal'));
    const rateTrainerName = document.getElementById('rate-trainer-name');
    const submitRatingBtn = document.getElementById('submit-rating-btn');
    const ratingStars = document.querySelectorAll('.rating-star');
    let selectedRating = 0;

    // Handle Star Clicks
    ratingStars.forEach((star, index) => {
        // Initialize as empty stars first
        star.className = 'bi bi-star rating-star inactive';
        
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStars(selectedRating);
        });
    });

    function updateStars(rating) {
        ratingStars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'bi bi-star-fill rating-star active';
            } else {
                star.className = 'bi bi-star rating-star inactive';
            }
        });
    }

    let rateTrainerId = null;

    if (submitRatingBtn) {
        submitRatingBtn.addEventListener('click', () => {
            if (selectedRating === 0) {
                alert("Please select a star rating first!");
                return;
            }
            if (!rateTrainerId) return;

            const textarea = document.querySelector('#rateModal textarea');
            const reviewText = textarea ? textarea.value.trim() : '';

            fetch('backend/feedback/rate_trainer.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trainer_id: rateTrainerId,
                    rating: selectedRating,
                    review: reviewText
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Close rating modal and open success modal
                    rateModal.hide();
                    const successModal = new bootstrap.Modal(document.getElementById('ratingSuccessModal'));
                    successModal.show();
                    
                    // Reset form
                    selectedRating = 0;
                    updateStars(0);
                    if (textarea) textarea.value = '';
                } else {
                    alert(data.message || 'Failed to submit rating.');
                }
            })
            .catch(err => console.error('Rating error:', err));
        });
    }

    // Expose functionality globally
    window.scheduleApp = {
        cancelReservation: function(id) {
            idToCancel = id;
            cancelModal.show();
        },
        openRateModal: function(trainerName, trainerId) {
            rateTrainerId = trainerId;
            if (rateTrainerName) rateTrainerName.innerText = `Trainer ${trainerName}`;
            selectedRating = 0;
            updateStars(0);
            rateModal.show();
        }
    };
});
