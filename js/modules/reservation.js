document.addEventListener('DOMContentLoaded', () => {

    // Mock Data: Trainers Array
    const trainers = [
        {
            id: 1,
            name: "John Smith",
            experience: "10 Years",
            carType: "Manual",
            rating: "4.9",
            reviews: "128"
        },
        {
            id: 2,
            name: "Sarah Jenkins",
            experience: "6 Years",
            carType: "Automatic",
            rating: "4.8",
            reviews: "95"
        },
        {
            id: 3,
            name: "Michael Chang",
            experience: "15 Years",
            carType: "Both (Manual & Auto)",
            rating: "5.0",
            reviews: "340"
        }
    ];

    // Mock Data: Available Timeslots (same for all for brevity)
    const availableSlots = ["09:00 AM", "11:00 AM", "01:30 PM", "03:00 PM", "04:30 PM"];

    // State: Mock user reservations { '2026-03-15': { ...details } }
    const defaultReservations = {
        '2026-03-15': { date: 'March 15, 2026', time: '09:00 AM', trainer: 'John Smith', car: 'Manual' },
        '2026-03-22': { date: 'March 22, 2026', time: '01:30 PM', trainer: 'Sarah Jenkins', car: 'Automatic' }
    };
    const reservations = window.authApp.getUserData('reservations') || defaultReservations;

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

    // 1. Render Trainers
    function renderTrainers(trainersList = trainers) {
        trainersContainer.innerHTML = '';

        if (trainersList.length === 0) {
            trainersContainer.innerHTML = '<div class="col-12 text-muted mt-2">No trainers found matching your search.</div>';
            return;
        }

        trainersList.forEach(trainer => {
            const col = document.createElement('div');
            col.className = 'col-md-6 mb-4';

            col.innerHTML = `
                <div class="trainer-card">
                    <div class="trainer-photo-placeholder">
                        <i class="bi bi-person-bounding-box"></i>
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

                    // Render slots
                    slotsContainer.innerHTML = '';
                    availableSlots.forEach(slot => {
                        // Check if this slot on this date is already booked
                        const isBooked = reservations[dateStr] && reservations[dateStr].time === slot;
                        
                        const slotEl = document.createElement('div');
                        slotEl.className = 'timeslot';
                        slotEl.innerText = slot;
                        
                        if (isBooked) {
                            slotEl.classList.add('disabled');
                            slotEl.title = 'Already Reserved';
                        } else {
                            slotEl.addEventListener('click', () => {
                                // remove selected from others
                                slotsContainer.querySelectorAll('.timeslot').forEach(el => el.classList.remove('selected'));
                                slotEl.classList.add('selected');
                                selectedSlot = slot;
                                bookBtn.classList.remove('d-none');
                            });
                        }

                        slotsContainer.appendChild(slotEl);
                    });
                }
            });

            // Handle Booking
            bookBtn.addEventListener('click', () => {
                if (!window.authApp.isLoggedIn()) {
                    window.authApp.openLogin();
                    return;
                }

                const dateVal = dateInput.value; // YYYY-MM-DD
                if (dateVal && selectedSlot) {
                    // Check if duplicate
                    if (reservations[dateVal] && reservations[dateVal].time === selectedSlot) {
                        alert("This time slot is already reserved. Please choose a different one.");
                        return;
                    }

                    // Save mock reservation
                    const prettyDate = new Date(dateVal).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    reservations[dateVal] = {
                        date: prettyDate,
                        time: selectedSlot,
                        trainer: trainer.name,
                        car: trainer.carType
                    };
                    window.authApp.saveUserData('reservations', reservations);

                    showToast(`Successfully booked ${trainer.name} on ${prettyDate} at ${selectedSlot}.`);

                    // Reset form
                    dateInput.value = '';
                    dateInput._flatpickr.clear();
                    slotsContainer.innerHTML = `<div class="text-muted small">Select a date to view slots</div>`;
                    bookBtn.classList.add('d-none');
                    selectedSlot = null;

                    // Re-render Calendar to show new reservation
                    renderCalendar();
                }
            });

        });
    }

    // 2. Render Calendar
    function renderCalendar() {
        calendarDays.innerHTML = '';

        const firstDay = new Date(currentCalYear, currentCalMonth, 1);
        const startDayOffset = firstDay.getDay(); 
        const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
        
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (calendarHeaderTitle) calendarHeaderTitle.innerText = `${monthNames[currentCalMonth]} ${currentCalYear}`;

        // Fill empty days initially if month doesn't start on Sunday
        for (let i = 0; i < startDayOffset; i++) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'cal-date empty';
            calendarDays.appendChild(emptyEl);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'cal-date';
            dayEl.innerText = i;

            // Format check (YYYY-MM-DD)
            const m = String(currentCalMonth + 1).padStart(2, '0');
            const dStr = String(i).padStart(2, '0');
            const dateStr = `${currentCalYear}-${m}-${dStr}`;

            if (reservations[dateStr]) {
                dayEl.classList.add('reserved');
                dayEl.addEventListener('click', () => {
                    showReservationDetails(reservations[dateStr]);

                    // Highlight selected day
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
        rdCar.innerText = data.car;
        rdPanel.classList.add('active');
    }

    function hideReservationDetails() {
        rdPanel.classList.remove('active');
    }

    // 3. User Feedback Toast
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

        // Trigger reflow for animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 4000);
    }

    // Add Search functionality
    if (trainerSearchInput) {
        trainerSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filteredTrainers = trainers.filter(trainer =>
                trainer.name.toLowerCase().includes(searchTerm)
            );
            renderTrainers(filteredTrainers);
        });
    }

    // Initialize
    renderTrainers();
    renderCalendar();

});
