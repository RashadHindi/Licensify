/**
 * Trainer Management Logic
 */
let loadedTrainers = [];

document.addEventListener('DOMContentLoaded', function() {
    fetchTrainers();
    injectDeleteModal();
    injectScheduleModal();
});

function fetchTrainers() {
    fetch('backend/admin/get_users.php?role=trainer')
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            loadedTrainers = data.users;
            renderTrainersTable();
        } else {
            console.error('Failed to load trainers', data.message);
        }
    })
    .catch(err => console.error('Error fetching trainers:', err));
}

function renderTrainersTable() {
    const tableBody = document.getElementById('trainers-table-body');
    if (!tableBody) return;

    if (loadedTrainers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">No trainers found.</td></tr>';
        return;
    }

    tableBody.innerHTML = loadedTrainers.map(trainer => `
        <tr>
            <td class="px-4 py-3">
                <div class="d-flex align-items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=${trainer.fname}+${trainer.lname}&background=014d34&color=fff" class="rounded-circle" width="35">
                    <div class="fw-bold text-dark-green smaller">${trainer.fname} ${trainer.lname}</div>
                </div>
            </td>
            <td class="px-4 py-3 smaller text-muted">${trainer.email}</td>
            <td class="px-4 py-3">
                <div class="text-warning smaller fw-bold">
                    <i class="bi bi-star-fill text-warning me-1"></i> ${trainer.rating ? parseFloat(trainer.rating).toFixed(1) : '0.0'}
                </div>
            </td>
            <td class="px-4 py-3">
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-light text-dark-green shadow-sm" title="View Schedule" onclick="viewSchedule('${trainer.email}')">
                        <i class="bi bi-calendar3"></i>
                    </button>
                    <button class="btn btn-sm btn-light text-danger shadow-sm" title="Remove Trainer" onclick="deleteTrainer('${trainer.email}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

let deleteEmail = null;
let scheduleEmail = null;

function injectDeleteModal() {
    // ... HTML injection ...
    const modalHTML = `
    <div class="modal fade" id="deleteTrainerModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div class="modal-header border-0 pb-0 pt-4 px-4">
                    <h5 class="modal-title fw-bold text-danger heading-font">Remove Trainer</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body px-4 pt-3 pb-4">
                    <div id="delete-trainer-step-confirm">
                        <div class="d-flex align-items-center gap-4 mb-4 p-3 bg-light-green rounded-3 border-start border-4 border-danger">
                            <div class="icon-box bg-white text-danger rounded-circle shadow-sm">
                                <i class="bi bi-person-x-fill fs-3"></i>
                            </div>
                            <div>
                                <p class="text-muted smaller mb-0">Trainer to Remove</p>
                                <h6 class="fw-bold text-dark-green mb-0" id="delete-trainer-name">Trainer Name</h6>
                            </div>
                        </div>
                        <p class="mb-2 text-dark-green fw-medium">Are you sure you want to remove this trainer?</p>
                        <p class="text-muted smaller mb-0"><i class="bi bi-info-circle me-1"></i> This will remove them from the system and cancel any pending assignments.</p>
                    </div>
                    
                    <div id="delete-trainer-step-success" class="d-none text-center py-3">
                        <div class="success-check-wrapper mb-3">
                            <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h5 class="fw-bold text-dark-green mb-1">Trainer Removed</h5>
                        <p class="text-muted smaller mb-0">The trainer account has been successfully deleted.</p>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0 pb-4 px-4">
                    <button type="button" id="delete-trainer-btn-cancel" class="btn btn-light btn-rounded px-4 fw-bold" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" id="delete-trainer-btn-action" class="btn btn-danger btn-rounded px-4 fw-bold hover-lift">Delete Trainer</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    if (!document.getElementById('deleteTrainerModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const actionBtn = document.getElementById('delete-trainer-btn-action');
    const cancelBtn = document.getElementById('delete-trainer-btn-cancel');
    const stepConfirm = document.getElementById('delete-trainer-step-confirm');
    const stepSuccess = document.getElementById('delete-trainer-step-success');
    
    actionBtn.addEventListener('click', () => {
        if (!stepSuccess.classList.contains('d-none')) {
            const modalEl = document.getElementById('deleteTrainerModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
        } else {
            performTrainerDeletion();
        }
    });

    document.getElementById('deleteTrainerModal').addEventListener('hidden.bs.modal', () => {
        stepConfirm.classList.remove('d-none');
        stepSuccess.classList.add('d-none');
        cancelBtn.classList.remove('d-none');
        actionBtn.innerText = 'Delete Trainer';
        actionBtn.classList.remove('btn-dark-green');
        actionBtn.classList.add('btn-danger');
    });
}

function injectScheduleModal() {
    const modalHTML = `
    <div class="modal fade" id="scheduleModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div class="modal-header border-0 pb-0 pt-4 px-4 bg-dark-green text-white">
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="icon-box bg-white text-dark-green rounded-circle shadow-sm">
                            <i class="bi bi-calendar-week fs-4"></i>
                        </div>
                        <div>
                            <h5 class="modal-title fw-bold heading-font mb-0">Trainer Schedule</h5>
                            <p class="text-white-50 smaller mb-0" id="schedule-trainer-name">Trainer Name</p>
                        </div>
                    </div>
                    <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4 bg-off-white">
                    <div id="schedule-content" class="row g-3">
                        <!-- Dynamic schedule items -->
                    </div>
                    <div id="schedule-empty" class="text-center py-5 d-none">
                        <i class="bi bi-calendar-x text-muted mb-3" style="font-size: 3rem;"></i>
                        <h6 class="text-muted">No reservations found for this trainer.</h6>
                    </div>
                </div>
                <div class="modal-footer border-0 py-3 px-4">
                    <button type="button" class="btn btn-primary btn-rounded px-4 fw-bold" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    if (!document.getElementById('scheduleModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

function deleteTrainer(email) {
    const user = loadedTrainers.find(u => u.email === email);
    if (!user) return;

    deleteEmail = email;
    document.getElementById('delete-trainer-name').innerText = `${user.fname} ${user.lname}`;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteTrainerModal'));
    modal.show();
}

function performTrainerDeletion() {
    const actionBtn = document.getElementById('delete-trainer-btn-action');
    const originalText = actionBtn.innerText;
    actionBtn.innerText = 'Deleting...';
    actionBtn.disabled = true;

    fetch('backend/admin/delete_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deleteEmail })
    })
    .then(res => res.json())
    .then(data => {
        actionBtn.disabled = false;
        if (data.success) {
            loadedTrainers = loadedTrainers.filter(u => u.email !== deleteEmail);
            renderTrainersTable();
            
            document.getElementById('delete-trainer-step-confirm').classList.add('d-none');
            document.getElementById('delete-trainer-step-success').classList.remove('d-none');
            document.getElementById('delete-trainer-btn-cancel').classList.add('d-none');
            
            actionBtn.innerText = 'Done';
            actionBtn.classList.remove('btn-danger');
            actionBtn.classList.add('btn-dark-green');
        } else {
            actionBtn.innerText = originalText;
            alert(data.message || 'Failed to delete trainer.');
        }
    })
    .catch(err => {
        console.error('Error deleting trainer:', err);
        actionBtn.disabled = false;
        actionBtn.innerText = originalText;
        alert('A network error occurred.');
    });
}

function viewSchedule(email) {
    const trainer = loadedTrainers.find(u => u.email === email);
    if (!trainer) return;

    document.getElementById('schedule-trainer-name').innerText = `${trainer.fname} ${trainer.lname}`;
    
    const content = document.getElementById('schedule-content');
    const empty = document.getElementById('schedule-empty');
    content.innerHTML = '<div class="text-center w-100"><div class="spinner-border text-dark-green" role="status"></div></div>';
    empty.classList.add('d-none');

    const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
    modal.show();

    fetch(`backend/admin/get_trainer_schedule.php?email=${encodeURIComponent(email)}`)
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            const trainerRes = data.reservations;
            if (trainerRes.length === 0) {
                content.innerHTML = '';
                empty.classList.remove('d-none');
            } else {
                empty.classList.add('d-none');
                content.innerHTML = trainerRes.map(res => `
                    <div class="col-md-6">
                        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white border-start border-4 ${res.status === 'Completed' ? 'border-primary' : 'border-success'}">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge ${res.status === 'Completed' ? 'bg-primary-subtle text-primary-emphasis' : 'bg-success-subtle text-success-emphasis'} rounded-pill px-3">${res.status}</span>
                                <div class="text-muted smaller"><i class="bi bi-clock me-1"></i>${res.time}</div>
                            </div>
                            <h6 class="fw-bold text-dark-green mb-1">${res.studentName}</h6>
                            <div class="smaller text-muted"><i class="bi bi-calendar-event me-1"></i>${res.date}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    });
}

// Global exposure
window.deleteTrainer = deleteTrainer;
window.viewSchedule = viewSchedule;

