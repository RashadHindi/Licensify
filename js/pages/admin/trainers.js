/**
 * Trainer Management Logic
 */
document.addEventListener('DOMContentLoaded', function() {
    renderTrainersTable();
});

function renderTrainersTable() {
    const tableBody = document.getElementById('trainers-table-body');
    if (!tableBody) return;

    const trainers = window.adminApp.getTrainers();

    if (trainers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">No trainers found.</td></tr>';
        return;
    }

    tableBody.innerHTML = trainers.map(trainer => `
        <tr>
            <td class="px-4 py-3">
                <div class="d-flex align-items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=${trainer.fname}+${trainer.lname}&background=014d34&color=fff" class="rounded-circle" width="35">
                    <div class="fw-bold text-dark-green smaller">${trainer.fname} ${trainer.lname}</div>
                </div>
            </td>
            <td class="px-4 py-3 smaller text-muted">${trainer.email}</td>
            <td class="px-4 py-3">
                <div class="text-warning smaller">
                    <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-half"></i>
                </div>
            </td>
            <td class="px-4 py-3">
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-light text-dark-green" title="View Schedule"><i class="bi bi-calendar3"></i></button>
                    <button class="btn btn-sm btn-light text-danger" title="Remove"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

