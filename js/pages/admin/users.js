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
    initRoleChange();
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
                    <button class="btn btn-sm btn-light text-dark-green" title="Edit" onclick="alert('Feature coming soon')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-light text-danger" title="Delete" onclick="deleteUser('${user.email}')"><i class="bi bi-trash"></i></button>
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

function openRoleModal(email) {
    const users = window.adminApp.getUsers();
    const user = users.find(u => u.email === email);
    if (!user) return;

    selectedUserId = email;
    document.getElementById('modal-user-name').innerText = `${user.fname} ${user.lname}`;
    
    const modal = new bootstrap.Modal(document.getElementById('roleModal'));
    modal.show();
}

function initRoleChange() {
    const roleButtons = document.querySelectorAll('#roleModal [data-role]');
    roleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const newRole = btn.getAttribute('data-role');
            const users = window.adminApp.getUsers();
            const userIndex = users.findIndex(u => u.email === selectedUserId);
            
            if (userIndex !== -1) {
                users[userIndex].role = newRole;
                window.adminApp.saveUsers(users);
                renderUsersTable();
                
                // Hide modal
                const modalEl = document.getElementById('roleModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();

                // Alert (mocking toast)
                alert(`Role updated successfully for ${users[userIndex].fname}!`);
            }
        });
    });
}

function deleteUser(email) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        let users = window.adminApp.getUsers();
        users = users.filter(u => u.email !== email);
        window.adminApp.saveUsers(users);
        renderUsersTable();
    }
}

// Global exposure for onclick handlers
window.openRoleModal = openRoleModal;
window.deleteUser = deleteUser;
