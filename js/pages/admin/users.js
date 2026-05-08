/**
 * User Management Logic
 */
document.addEventListener('DOMContentLoaded', function() {
    initUserManagement();
});

let selectedUserId = null;

function initUserManagement() {
    renderUsersTable();
    initSearch();
    injectCustomModal();
    injectDeleteModal();
}

function renderUsersTable(searchTerm = '') {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    let users = window.adminApp.getStudents(); // Filter to only students as requested
    
    // Filter out searching
    if (searchTerm) {
        users = users.filter(u => 
            `${u.fname} ${u.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (document.getElementById('count-visible')) {
        document.getElementById('count-visible').innerText = users.length;
    }

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">No students found matching your criteria.</td></tr>';
        return;
    }

    tableBody.innerHTML = users.map(user => `
        <tr>
            <td class="px-4 py-3">
                <div class="d-flex align-items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=${user.fname}+${user.lname}&background=f2f5f3&color=014d34" class="rounded-circle" width="35">
                    <div class="fw-bold text-dark-green smaller">${user.fname} ${user.lname}</div>
                </div>
            </td>
            <td class="px-4 py-3 smaller text-muted">${user.email}</td>
            <td class="px-4 py-3 smaller text-muted">${user.phone || 'N/A'}</td>
            <td class="px-4 py-3">
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-light text-dark-green shadow-sm" title="Change to Trainer" onclick="promoteToTrainer('${user.email}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-light text-danger shadow-sm" title="Delete Student" onclick="deleteUser('${user.email}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}


function initSearch() {
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderUsersTable(e.target.value);
        });
    }
}

let promotionEmail = null;

function injectCustomModal() {
    const modalHTML = `
    <div class="modal fade" id="promoteModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div class="modal-header border-0 pb-0 pt-4 px-4">
                    <h5 class="modal-title fw-bold text-dark-green heading-font" id="promoteModalLabel">User Role Change</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body px-4 pt-3 pb-4">
                    <div class="d-flex align-items-center gap-4 mb-4 p-3 bg-light-green rounded-3">
                        <div class="icon-box bg-white text-orange rounded-circle shadow-sm">
                            <i class="bi bi-person-badge fs-3"></i>
                        </div>
                        <div>
                            <p class="text-muted smaller mb-0">Target Student</p>
                            <h6 class="fw-bold text-dark-green mb-0" id="promote-user-name">Student Name</h6>
                        </div>
                    </div>
                    <div id="promote-step-1">
                        <p class="mb-0 text-dark-green fw-medium">Do you want to change student to trainer?</p>
                    </div>
                    <div id="promote-step-2" class="d-none">
                        <div class="alert alert-warning border-0 shadow-sm rounded-3 py-2 px-3 mb-0 d-flex align-items-center gap-2">
                            <i class="bi bi-exclamation-triangle-fill"></i>
                            <span class="fw-bold">Are you sure?</span>
                        </div>
                    </div>
                    <div id="promote-step-success" class="d-none text-center py-3">
                        <div class="success-check-wrapper mb-3">
                            <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h5 class="fw-bold text-dark-green mb-1">Role Updated Successfully!</h5>
                        <p class="text-muted smaller mb-0"><span id="success-user-name" class="fw-bold">User</span> is now a trainer.</p>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0 pb-4 px-4">
                    <button type="button" id="promote-btn-cancel" class="btn btn-light btn-rounded px-4 fw-bold" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" id="promote-btn-action" class="btn btn-primary btn-rounded px-4 fw-bold hover-lift">Change</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    if (!document.getElementById('promoteModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const actionBtn = document.getElementById('promote-btn-action');
    const cancelBtn = document.getElementById('promote-btn-cancel');
    const step1 = document.getElementById('promote-step-1');
    const step2 = document.getElementById('promote-step-2');
    const stepSuccess = document.getElementById('promote-step-success');
    
    actionBtn.addEventListener('click', () => {
        if (!stepSuccess.classList.contains('d-none')) {
            // Already success, just close
            const modalEl = document.getElementById('promoteModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
        } else if (!step2.classList.contains('d-none')) {
            // Second step: Final action
            performPromotion();
        } else {
            // First step: Transition to second step
            step1.classList.add('d-none');
            step2.classList.remove('d-none');
            actionBtn.innerText = 'Change Now';
            actionBtn.classList.replace('btn-primary', 'btn-orange');
        }
    });

    // Reset modal on close
    document.getElementById('promoteModal').addEventListener('hidden.bs.modal', () => {
        step1.classList.remove('d-none');
        step2.classList.add('d-none');
        stepSuccess.classList.add('d-none');
        cancelBtn.classList.remove('d-none');
        actionBtn.innerText = 'Change';
        actionBtn.classList.remove('btn-orange', 'btn-dark-green');
        actionBtn.classList.add('btn-primary');
    });
}

function promoteToTrainer(email) {
    const users = window.adminApp.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) return;

    promotionEmail = email;
    document.getElementById('promote-user-name').innerText = `${user.fname} ${user.lname}`;
    document.getElementById('success-user-name').innerText = `${user.fname} ${user.lname}`;
    
    const modal = new bootstrap.Modal(document.getElementById('promoteModal'));
    modal.show();
}

function performPromotion() {
    const users = window.adminApp.getUsers();
    const userIndex = users.findIndex(u => u.email === promotionEmail);
    
    if (userIndex !== -1) {
        // Update role
        users[userIndex].role = 'trainer';
        
        // Save to "database" (localStorage)
        window.adminApp.saveUsers(users);
        
        // Refresh table
        renderUsersTable();
        
        // Show Success Step
        document.getElementById('promote-step-2').classList.add('d-none');
        document.getElementById('promote-step-success').classList.remove('d-none');
        document.getElementById('promote-btn-cancel').classList.add('d-none');
        
        const actionBtn = document.getElementById('promote-btn-action');
        actionBtn.innerText = 'Got it!';
        actionBtn.classList.remove('btn-orange');
        actionBtn.classList.add('btn-dark-green');
    }
}

let deleteEmail = null;

function injectDeleteModal() {
    const modalHTML = `
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div class="modal-header border-0 pb-0 pt-4 px-4">
                    <h5 class="modal-title fw-bold text-danger heading-font" id="deleteModalLabel">Remove User</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body px-4 pt-3 pb-4">
                    <div id="delete-step-confirm">
                        <div class="d-flex align-items-center gap-4 mb-4 p-3 bg-light-green rounded-3 border-start border-4 border-danger">
                            <div class="icon-box bg-white text-danger rounded-circle shadow-sm">
                                <i class="bi bi-trash-fill fs-3"></i>
                            </div>
                            <div>
                                <p class="text-muted smaller mb-0">Student to Remove</p>
                                <h6 class="fw-bold text-dark-green mb-0" id="delete-user-name">Student Name</h6>
                            </div>
                        </div>
                        <p class="mb-2 text-dark-green fw-medium">Are you sure you want to delete this user?</p>
                        <p class="text-muted smaller mb-0"><i class="bi bi-info-circle me-1"></i> This action cannot be undone and will remove all their data.</p>
                    </div>
                    
                    <div id="delete-step-success" class="d-none text-center py-3">
                        <div class="success-check-wrapper mb-3">
                            <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h5 class="fw-bold text-dark-green mb-1">User Removed</h5>
                        <p class="text-muted smaller mb-0">The student account has been permanently deleted.</p>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0 pb-4 px-4">
                    <button type="button" id="delete-btn-cancel" class="btn btn-light btn-rounded px-4 fw-bold" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" id="delete-btn-action" class="btn btn-danger btn-rounded px-4 fw-bold hover-lift">Delete User</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    if (!document.getElementById('deleteModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const actionBtn = document.getElementById('delete-btn-action');
    const cancelBtn = document.getElementById('delete-btn-cancel');
    const stepConfirm = document.getElementById('delete-step-confirm');
    const stepSuccess = document.getElementById('delete-step-success');
    
    actionBtn.addEventListener('click', () => {
        if (!stepSuccess.classList.contains('d-none')) {
            const modalEl = document.getElementById('deleteModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
        } else {
            performDeletion();
        }
    });

    document.getElementById('deleteModal').addEventListener('hidden.bs.modal', () => {
        stepConfirm.classList.remove('d-none');
        stepSuccess.classList.add('d-none');
        cancelBtn.classList.remove('d-none');
        actionBtn.innerText = 'Delete User';
        actionBtn.classList.remove('btn-dark-green');
        actionBtn.classList.add('btn-danger');
    });
}

function deleteUser(email) {
    const users = window.adminApp.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) return;

    deleteEmail = email;
    document.getElementById('delete-user-name').innerText = `${user.fname} ${user.lname}`;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

function performDeletion() {
    let users = window.adminApp.getUsers();
    users = users.filter(u => u.email !== deleteEmail);
    
    // Save to "database"
    window.adminApp.saveUsers(users);
    
    // Refresh table
    renderUsersTable();
    
    // Show Success Step
    document.getElementById('delete-step-confirm').classList.add('d-none');
    document.getElementById('delete-step-success').classList.remove('d-none');
    document.getElementById('delete-btn-cancel').classList.add('d-none');
    
    const actionBtn = document.getElementById('delete-btn-action');
    actionBtn.innerText = 'Done';
    actionBtn.classList.remove('btn-danger');
    actionBtn.classList.add('btn-dark-green');
}

// Global exposure for onclick handlers
window.promoteToTrainer = promoteToTrainer;
window.deleteUser = deleteUser;
