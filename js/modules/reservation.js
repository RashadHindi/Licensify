document.addEventListener('DOMContentLoaded', () => {

    // All valid time slots (9 AM to 4 PM = 8 one-hour slots)
    const allSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

    // State
    let trainers = [];
    let myReservations = {}; // keyed by date string (YYYY-MM-DD)

    const todayObj = new Date();
    const todayStr = todayObj.getFullYear() + '-' + String(todayObj.getMonth() + 1).padStart(2, '0') + '-' + String(todayObj.getDate()).padStart(2, '0');
    let currentCalMonth = todayObj.getMonth();
    let currentCalYear = todayObj.getFullYear();

    const trainersContainer = document.getElementById('trainers-container');
    const calendarDays = document.getElementById('calendar-days');
    const rdPanel = document.getElementById('reservation-details-panel');
    const rdDate = document.getElementById('rd-date');
    const rdTime = document.getElementById('rd-time');
    const rdTrainer = document.getElementById('rd-trainer');
    const rdCar = document.getElementById('rd-car');
    const toastContainer = document.getElementById('toast-container');
    const trainerSearchInput = document.getElementById('trainer-search');

    const calendarHeaderTitle = document.querySelector('.calendar-header h4');
    const prevMonthBtn = document.querySelectorAll('.calendar-header button')[0];
    const nextMonthBtn = document.querySelectorAll('.calendar-header button')[1];

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentCalMonth--;
            if (currentCalMonth < 0) {
                currentCalMonth = 11;
                currentCalYear--;
            }
            renderCalendar();
            hideReservationDetails();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentCalMonth++;
            if (currentCalMonth > 11) {
                currentCalMonth = 0;
                currentCalYear++;
            }
            renderCalendar();
            hideReservationDetails();
        });
    }

    // ========================
    // Load trainers from backend
    // ========================
    function loadTrainers() {
        fetch('backend/schedule/get_trainers.php')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                trainers = data.trainers.map(t => ({
                    id: t.id,
                    name: `${t.fname} ${t.lname}`,
                    profile_photo: t.profile_photo,
                    phone: t.phone,
                    experience: t.experience || 'New Trainer',
                    carType: t.car_type || 'General',
                    rating: t.rating || '0.0',
                    reviews: t.reviews || '0'
                }));
                renderTrainers(trainers);
            }
        })
        .catch(err => console.error('Failed to load trainers:', err));
    }

    // ========================
    // Load student reservations from backend
    // ========================
    function loadReservations() {
        if (!window.authApp.isLoggedIn()) {
            myReservations = {};
            renderCalendar();
            return;
        }

        fetch('backend/schedule/get_student_reservations.php')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                myReservations = {};
                data.reservations.forEach(r => {
                    if (r.status === 'Upcoming') {
                        const prettyDate = new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        myReservations[r.date] = {
                            id: r.id,
                            date: prettyDate,
                            time: r.time,
                            trainer: r.trainer,
                            status: r.status
                        };
                    }
                });
                renderCalendar();
            }
        })
        .catch(err => console.error('Failed to load reservations:', err));
    }

    // ========================
    // 1. Render Trainers
    // ========================
    function renderTrainers(trainersList = trainers) {
        trainersContainer.innerHTML = '';

        if (trainersList.length === 0) {
            trainersContainer.innerHTML = '<div class="col-12 text-muted mt-2">No trainers found matching your search.</div>';
            return;
        }

        trainersList.forEach(trainer => {
            const col = document.createElement('div');
            col.className = 'col-md-6 mb-4';

            const initial = trainer.name.charAt(0).toUpperCase();
            const photoHtml = trainer.profile_photo 
                ? `<img src="${trainer.profile_photo}" class="w-100 h-100 object-fit-cover">`
                : `<i class="bi bi-person-bounding-box"></i>`;

            col.innerHTML = `
                <div class="trainer-card">
                    <div class="trainer-photo-placeholder">
                        ${photoHtml}
                    </div>
                    <div class="trainer-info">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="trainer-name">${trainer.name}</h5>
                            <div class="trainer-rating">
                                <i class="bi bi-star-fill"></i> ${trainer.rating} <span>(${trainer.reviews})</span>
                            </div>
                        </div>
                        
                        <div class="trainer-badges">
                            <span class="t-badge"><i class="bi bi-award me-1"></i>${trainer.experience}</span>
                            <span class="t-badge"><i class="bi bi-car-front me-1"></i>${trainer.carType}</span>
                        </div>
                        
                        <div class="booking-form">
                            <label class="b-form-label">Select Date:</label>
                            <input type="text" class="b-form-control mb-3" placeholder="Select Date..." id="date-${trainer.id}">
                            
                            <label class="b-form-label">Available Timeslots:</label>
                            <div class="timeslots-container mb-3" id="slots-${trainer.id}">
                                <div class="text-muted small">Select a date to view slots</div>
                            </div>
                            
                            <button class="btn btn-primary w-100 fw-bold d-none" id="book-btn-${trainer.id}">Confirm Booking</button>
                        </div>
                    </div>
                </div>
            `;
            trainersContainer.appendChild(col);

            const dateInput = document.getElementById(`date-${trainer.id}`);
            const slotsContainer = document.getElementById(`slots-${trainer.id}`);
            const bookBtn = document.getElementById(`book-btn-${trainer.id}`);

            let selectedSlot = null;

            // Initialize Flatpickr for beautiful calendar
            flatpickr(dateInput, {
                minDate: "today",
                dateFormat: "Y-m-d",
                onChange: function(selectedDates, dateStr, instance) {
                    if (!dateStr) {
                        slotsContainer.innerHTML = `<div class="text-muted small">Select a date to view slots</div>`;
                        bookBtn.classList.add('d-none');
                        return;
                    }

                    // Fetch this trainer's availability for the selected date from backend
                    slotsContainer.innerHTML = `<div class="text-muted small"><i class="bi bi-hourglass-split me-1"></i>Loading slots...</div>`;
                    bookBtn.classList.add('d-none');
                    selectedSlot = null;

                    fetch(`backend/schedule/get_trainer_slots.php?trainer_id=${trainer.id}&date=${dateStr}`)
                    .then(res => res.json())
                    .then(data => {
                        if (!data.success) {
                            slotsContainer.innerHTML = `<div class="text-danger small">Failed to load slots.</div>`;
                            return;
                        }

                        if (data.is_day_off) {
                            slotsContainer.innerHTML = `<div class="text-danger small fw-bold"><i class="bi bi-calendar-x me-1"></i>Trainer is off on this day</div>`;
                            return;
                        }

                        const blocked = [...data.unavailable_slots, ...data.booked_slots];

                        // Only show slots that are truly available and in the future
                        const now = new Date();
                        const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
                        
                        const availableSlots = allSlots.filter(s => {
                            if (blocked.includes(s)) return false;
                            
                            // If booking for today, make sure the slot hasn't already passed
                            if (dateStr === todayStr) {
                                const match = s.match(/(\d+):(\d+)\s*(AM|PM)/i);
                                if (match) {
                                    let [_, hours, mins, modifier] = match;
                                    hours = parseInt(hours);
                                    if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
                                    if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
                                    
                                    const slotTime = new Date();
                                    slotTime.setHours(hours, parseInt(mins), 0, 0);
                                    if (now > slotTime) return false;
                                }
                            }
                            return true;
                        });

                        if (availableSlots.length === 0) {
                            slotsContainer.innerHTML = `<div class="text-warning small fw-bold"><i class="bi bi-exclamation-circle me-1"></i>No available slots on this day</div>`;
                            return;
                        }

                        slotsContainer.innerHTML = '';
                        availableSlots.forEach(slot => {
                            const slotEl = document.createElement('div');
                            slotEl.className = 'timeslot';
                            slotEl.innerText = slot;

                            slotEl.addEventListener('click', () => {
                                slotsContainer.querySelectorAll('.timeslot').forEach(el => el.classList.remove('selected'));
                                slotEl.classList.add('selected');
                                selectedSlot = slot;
                                bookBtn.classList.remove('d-none');
                            });

                            slotsContainer.appendChild(slotEl);
                        });
                    })
                    .catch(err => {
                        console.error('Slot fetch error:', err);
                        slotsContainer.innerHTML = `<div class="text-danger small">Connection error. Please try again.</div>`;
                    });
                }
            });

            // Reschedule logic check
            const urlParams = new URLSearchParams(window.location.search);
            const rescheduleId = urlParams.get('reschedule_id');
            if (rescheduleId) {
                bookBtn.innerText = "Confirm Reschedule";
                bookBtn.classList.remove('btn-primary');
                bookBtn.classList.add('btn-dark-green', 'text-white');
            }

            // Handle Booking
            bookBtn.addEventListener('click', () => {
                if (!window.authApp.isLoggedIn()) {
                    window.authApp.openLogin();
                    return;
                }

                const dateVal = dateInput.value; // YYYY-MM-DD
                if (dateVal && selectedSlot) {
                    const prettyDate = new Date(dateVal + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

                    const endpoint = rescheduleId ? 'backend/schedule/reschedule.php' : 'backend/schedule/book.php';
                    const payload = { trainer_id: trainer.id, date: dateVal, time: selectedSlot };
                    if (rescheduleId) payload.reservation_id = rescheduleId;

                    // Book via backend
                    fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            showToast(rescheduleId ? `Successfully rescheduled with ${trainer.name} to ${prettyDate} at ${selectedSlot}.` : `Successfully booked ${trainer.name} on ${prettyDate} at ${selectedSlot}.`);

                            // Reset form
                            dateInput.value = '';
                            dateInput._flatpickr.clear();
                            slotsContainer.innerHTML = `<div class="text-muted small">Select a date to view slots</div>`;
                            bookBtn.classList.add('d-none');
                            selectedSlot = null;

                            // If rescheduled, redirect back to schedule
                            if (rescheduleId) {
                                setTimeout(() => window.location.href = 'schedule.html', 1500);
                            }

                            // Reload reservations to update calendar
                            loadReservations();
                        } else {
                            showToastError(data.message || 'Booking failed. Please try again.');
                        }
                    })
                    .catch(err => {
                        console.error('Booking error:', err);
                        showToastError('A connection error occurred. Please try again.');
                    });
                }
            });
        });
    }

    // ========================
    // 2. Render Calendar
    // ========================
    function renderCalendar() {
        calendarDays.innerHTML = '';

        const firstDay = new Date(currentCalYear, currentCalMonth, 1);
        const startDayOffset = firstDay.getDay(); 
        const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
        
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (calendarHeaderTitle) calendarHeaderTitle.innerText = `${monthNames[currentCalMonth]} ${currentCalYear}`;

        for (let i = 0; i < startDayOffset; i++) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'cal-date empty';
            calendarDays.appendChild(emptyEl);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'cal-date';
            dayEl.innerText = i;

            const m = String(currentCalMonth + 1).padStart(2, '0');
            const dStr = String(i).padStart(2, '0');
            const dateStr = `${currentCalYear}-${m}-${dStr}`;

            if (myReservations[dateStr]) {
                dayEl.classList.add('reserved');
                dayEl.addEventListener('click', () => {
                    showReservationDetails(myReservations[dateStr]);
                    document.querySelectorAll('.cal-date').forEach(el => el.style.border = 'none');
                    dayEl.style.border = '2px solid white';
                });
            } else {
                dayEl.addEventListener('click', () => {
                    hideReservationDetails();
                    document.querySelectorAll('.cal-date').forEach(el => el.style.border = 'none');
                });
            }

            calendarDays.appendChild(dayEl);
        }
    }

    function showReservationDetails(data) {
        rdDate.innerText = data.date;
        rdTime.innerText = data.time;
        rdTrainer.innerText = data.trainer;
        if (rdCar) rdCar.innerText = data.status || 'Upcoming';
        rdPanel.classList.add('active');
    }

    function hideReservationDetails() {
        rdPanel.classList.remove('active');
    }

    // ========================
    // 3. User Feedback Toasts
    // ========================
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="bi bi-check-lg"></i>
            </div>
            <div class="toast-content">
                <h6>Booking Confirmed!</h6>
                <p>${message}</p>
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => { toastContainer.removeChild(toast); }, 300);
        }, 4000);
    }

    function showToastError(message) {
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.innerHTML = `
            <div class="toast-icon" style="background: #fee2e2; color: #dc3545;">
                <i class="bi bi-x-lg"></i>
            </div>
            <div class="toast-content">
                <h6>Booking Failed</h6>
                <p>${message}</p>
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => { toastContainer.removeChild(toast); }, 300);
        }, 4000);
    }

    // Search functionality
    if (trainerSearchInput) {
        trainerSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filteredTrainers = trainers.filter(trainer =>
                trainer.name.toLowerCase().includes(searchTerm)
            );
            renderTrainers(filteredTrainers);
        });
    }

    // ========================
    // Initialize
    // ========================
    loadTrainers();
    loadReservations();

});