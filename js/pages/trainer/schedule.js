/**
 * Trainer Schedule Logic - Enhanced with Hourly Agenda & Availability
 */
document.addEventListener('DOMContentLoaded', function() {
    const user = window.authApp.getCurrentUser();
    if (!user || user.role !== 'trainer') {
        window.location.href = 'index.html';
        return;
    }

    initSchedule(user);
});

function initSchedule(user) {
    const trainerName = `${user.fname} ${user.lname}`;
    const agendaDatePicker = document.getElementById('agenda-date-picker');
    const today = new Date().toISOString().split('T')[0];
    
    if (agendaDatePicker) {
        agendaDatePicker.value = today;

        const updateAgenda = () => {
            const reservations = JSON.parse(localStorage.getItem('licensify_reservations')) || [];
            const myReservations = reservations.filter(r => r.trainerName === trainerName);
            const availability = JSON.parse(localStorage.getItem('licensify_trainer_availability')) || {};
            const myAvailability = availability[trainerName] || {};

            const selectedDate = agendaDatePicker.value;
            const dayLessons = myReservations.filter(r => r.date === selectedDate && r.status !== 'Cancelled');

            renderHourlyAgenda(selectedDate, dayLessons, myAvailability);
        };

        agendaDatePicker.addEventListener('change', updateAgenda);
        
        // Day Off Button
        const dayOffBtn = document.getElementById('mark-day-off-btn');
        if (dayOffBtn) {
            dayOffBtn.addEventListener('click', () => {
                const selectedDate = agendaDatePicker.value;
                const availability = JSON.parse(localStorage.getItem('licensify_trainer_availability')) || {};
                if (!availability[trainerName]) availability[trainerName] = {};
                
                const current = availability[trainerName][selectedDate];
                if (current === 'FULL_DAY_OFF') {
                    delete availability[trainerName][selectedDate];
                    localStorage.setItem('licensify_trainer_availability', JSON.stringify(availability));
                    updateAgenda();
                } else {
                    showConfirmModal(
                        "Set Day Off", 
                        `Mark ${selectedDate} as a full day off?`,
                        () => {
                            availability[trainerName][selectedDate] = 'FULL_DAY_OFF';
                            localStorage.setItem('licensify_trainer_availability', JSON.stringify(availability));
                            updateAgenda();
                        }
                    );
                }
            });
        }

        updateAgenda();
    }
}

function showConfirmModal(title, message, onConfirm) {
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const titleEl = document.getElementById('confirmModalTitle');
    const msgEl = document.getElementById('confirmModalMessage');
    const actionBtn = document.getElementById('confirmModalActionBtn');

    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerText = message;

    if (actionBtn) {
        actionBtn.onclick = () => {
            onConfirm();
            modal.hide();
        };
    }

    modal.show();
}

function renderHourlyAgenda(date, lessons, myAvailability) {
    const tableBody = document.getElementById('hourly-agenda-table');
    if (!tableBody) return;

    const dayOffBtn = document.getElementById('mark-day-off-btn');
    const isDayOff = myAvailability[date] === 'FULL_DAY_OFF';
    
    if (dayOffBtn) {
        dayOffBtn.innerText = isDayOff ? "Remove Day Off" : "Set Day Off";
        dayOffBtn.className = isDayOff ? "btn btn-sm btn-danger rounded-pill px-3 fw-bold" : "btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold";
    }

    const hours = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
    ];

    if (isDayOff) {
        tableBody.innerHTML = `<tr><td colspan="3" class="text-center py-5 bg-light-red text-danger fw-bold">DAY OFF - NO LESSONS</td></tr>`;
        return;
    }

    const unavailableHours = Array.isArray(myAvailability[date]) ? myAvailability[date] : [];

    tableBody.innerHTML = hours.map(h => {
        const lesson = lessons.find(l => l.time === h);
        const isUnavailable = unavailableHours.includes(h);

        let statusHtml = '';
        let actionHtml = '';

        if (lesson) {
            statusHtml = `
                <div class="d-flex align-items-center gap-3">
                    <div class="bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 smaller fw-bold">RESERVED</div>
                    <div class="fw-medium text-dark-green">${lesson.studentName}</div>
                </div>
            `;
            actionHtml = `
                <button class="btn btn-sm btn-light-green text-dark-green rounded-pill px-3 fw-bold me-1" onclick="updateLessonStatus(${lesson.id}, 'Completed')">Complete</button>
                <button class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" onclick="updateLessonStatus(${lesson.id}, 'Cancelled')">Cancel</button>
            `;
        } else if (isUnavailable) {
            statusHtml = `<div class="text-danger fw-bold smaller"><i class="bi bi-slash-circle me-1"></i> UNAVAILABLE</div>`;
            actionHtml = `<button class="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold" onclick="toggleHourAvailability('${h}', false)">Make Available</button>`;
        } else {
            statusHtml = `<div class="text-muted smaller">Available Slot</div>`;
            actionHtml = `<button class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" onclick="toggleHourAvailability('${h}', true)">Make Unavailable</button>`;
        }

        return `
            <tr class="${lesson ? 'bg-light-green bg-opacity-10' : ''} ${isUnavailable ? 'bg-light' : ''}">
                <td class="px-4 py-3"><span class="fw-bold text-dark-green smaller">${h}</span></td>
                <td class="px-4 py-3">${statusHtml}</td>
                <td class="px-4 py-3 text-end">${actionHtml}</td>
            </tr>
        `;
    }).join('');
}

function toggleHourAvailability(hour, setUnavailable) {
    const user = window.authApp.getCurrentUser();
    const trainerName = `${user.fname} ${user.lname}`;
    const date = document.getElementById('agenda-date-picker').value;
    
    const availability = JSON.parse(localStorage.getItem('licensify_trainer_availability')) || {};
    if (!availability[trainerName]) availability[trainerName] = {};
    if (!availability[trainerName][date]) availability[trainerName][date] = [];
    
    if (setUnavailable) {
        if (!availability[trainerName][date].includes(hour)) {
            availability[trainerName][date].push(hour);
        }
    } else {
        availability[trainerName][date] = availability[trainerName][date].filter(h => h !== hour);
    }
    
    localStorage.setItem('licensify_trainer_availability', JSON.stringify(availability));
    location.reload();
}

function updateLessonStatus(id, newStatus) {
    showConfirmModal(
        "Update Status",
        `Mark this lesson as ${newStatus}?`,
        () => {
            const reservations = JSON.parse(localStorage.getItem('licensify_reservations')) || [];
            const index = reservations.findIndex(r => r.id === id);
            if (index !== -1) {
                reservations[index].status = newStatus;
                localStorage.setItem('licensify_reservations', JSON.stringify(reservations));
                location.reload();
            }
        }
    );
}

window.toggleHourAvailability = toggleHourAvailability;
window.updateLessonStatus = updateLessonStatus;
