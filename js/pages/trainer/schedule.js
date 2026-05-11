/**
 * Trainer Schedule Logic - Enhanced with Hourly Agenda & Availability
 * Connected to PHP backend for persistent storage.
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
            const selectedDate = agendaDatePicker.value;

            // Fetch both availability and reservations from backend
            Promise.all([
                fetch(`backend/schedule/get_availability.php?date=${selectedDate}`).then(r => r.json()),
                fetch(`backend/schedule/get_trainer_reservations.php?date=${selectedDate}`).then(r => r.json())
            ])
            .then(([availData, resData]) => {
                const isDayOff = availData.success ? availData.is_day_off : false;
                const unavailableSlots = availData.success ? availData.unavailable_slots : [];
                const dayLessons = resData.success ? resData.reservations : [];

                renderHourlyAgenda(selectedDate, dayLessons, isDayOff, unavailableSlots);
            })
            .catch(err => {
                console.error('Schedule load error:', err);
                renderHourlyAgenda(selectedDate, [], false, []);
            });
        };

        agendaDatePicker.addEventListener('change', updateAgenda);
        
        // Day Off Button
        const dayOffBtn = document.getElementById('mark-day-off-btn');
        if (dayOffBtn) {
            dayOffBtn.addEventListener('click', () => {
                const selectedDate = agendaDatePicker.value;
                const isCurrentlyDayOff = dayOffBtn.dataset.isDayOff === 'true';

                if (isCurrentlyDayOff) {
                    // Remove day off via backend
                    fetch('backend/schedule/set_day_off.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: selectedDate, day_off: false })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) updateAgenda();
                    })
                    .catch(err => console.error('Day off toggle error:', err));
                } else {
                    showConfirmModal(
                        "Set Day Off", 
                        `Mark ${selectedDate} as a full day off?`,
                        () => {
                            fetch('backend/schedule/set_day_off.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ date: selectedDate, day_off: true })
                            })
                            .then(res => res.json())
                            .then(data => {
                                if (data.success) updateAgenda();
                            })
                            .catch(err => console.error('Day off toggle error:', err));
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

function renderHourlyAgenda(date, lessons, isDayOff, unavailableSlots) {
    const tableBody = document.getElementById('hourly-agenda-table');
    if (!tableBody) return;

    const dayOffBtn = document.getElementById('mark-day-off-btn');
    
    if (dayOffBtn) {
        dayOffBtn.dataset.isDayOff = isDayOff ? 'true' : 'false';
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

    tableBody.innerHTML = hours.map(h => {
        const lesson = lessons.find(l => l.time === h);
        const isUnavailable = unavailableSlots.includes(h);

        let statusHtml = '';
        let actionHtml = '';
        let rowClass = '';

        if (lesson && lesson.status === 'Completed') {
            rowClass = 'bg-light';
            statusHtml = `
                <div class="d-flex align-items-center gap-3">
                    <div class="bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-1 smaller fw-bold"><i class="bi bi-check-circle me-1"></i>COMPLETED</div>
                    <div class="fw-medium text-muted">${lesson.studentName}</div>
                </div>
            `;
            actionHtml = `
                <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold" onclick="updateLessonStatus(${lesson.id}, 'Upcoming')" title="Undo completion">
                    <i class="bi bi-arrow-counterclockwise"></i> Undo
                </button>
            `;
        } else if (lesson) {
            rowClass = 'bg-light-green bg-opacity-10';
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
            rowClass = 'bg-light';
            statusHtml = `<div class="text-danger fw-bold smaller"><i class="bi bi-slash-circle me-1"></i> UNAVAILABLE</div>`;
            actionHtml = `<button class="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold" onclick="toggleHourAvailability('${h}', false)">Make Available</button>`;
        } else {
            statusHtml = `<div class="text-muted smaller">Available Slot</div>`;
            actionHtml = `<button class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" onclick="toggleHourAvailability('${h}', true)">Make Unavailable</button>`;
        }

        return `
            <tr class="${rowClass}">
                <td class="px-4 py-3"><span class="fw-bold ${lesson && lesson.status === 'Completed' ? 'text-muted' : 'text-dark-green'} smaller">${h}</span></td>
                <td class="px-4 py-3">${statusHtml}</td>
                <td class="px-4 py-3 text-end">${actionHtml}</td>
            </tr>
        `;
    }).join('');
}


function toggleHourAvailability(hour, setUnavailable) {
    const date = document.getElementById('agenda-date-picker').value;
    
    fetch('backend/schedule/set_slot.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, slot_hour: hour, unavailable: setUnavailable })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Re-trigger the agenda update without a full page reload
            document.getElementById('agenda-date-picker').dispatchEvent(new Event('change'));
        } else {
            console.error('Slot toggle failed:', data.message);
        }
    })
    .catch(err => console.error('Slot toggle error:', err));
}

function updateLessonStatus(id, newStatus) {
    showConfirmModal(
        "Update Status",
        `Mark this lesson as ${newStatus}?`,
        () => {
            fetch('backend/schedule/update_reservation.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservation_id: id, status: newStatus })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('agenda-date-picker').dispatchEvent(new Event('change'));
                } else {
                    console.error('Status update failed:', data.message);
                }
            })
            .catch(err => console.error('Status update error:', err));
        }
    );
}

window.toggleHourAvailability = toggleHourAvailability;
window.updateLessonStatus = updateLessonStatus;
