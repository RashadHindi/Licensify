/**
 * Exam Management Logic
 */
document.addEventListener('DOMContentLoaded', function() {
    renderExams();
    initExamForm();
});

function renderExams() {
    const grid = document.getElementById('exams-grid');
    if (!grid) return;

    const exams = window.adminApp.getExams();

    if (exams.length === 0) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <i class="bi bi-journal-x text-muted display-1 mb-3"></i>
                    <h5 class="fw-bold text-dark-green">No Exams Found</h5>
                    <p class="text-muted">Start by creating your first mock exam.</p>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = exams.map(exam => `
        <div class="col-md-6 col-xl-4">
            <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <div class="p-4 border-bottom bg-light-green">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-white text-dark-green rounded-pill px-3 py-1 fw-bold smaller">
                            ${exam.questionCount || 0} Questions
                        </span>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-light rounded-circle p-0" style="width: 30px; height: 30px;" data-bs-toggle="dropdown">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-4">
                                <li><a class="dropdown-item py-2" href="#" onclick="editExam(${exam.id})"><i class="bi bi-pencil me-2"></i> Edit Details</a></li>
                                <li><a class="dropdown-item py-2" href="questions.html?examId=${exam.id}"><i class="bi bi-list-task me-2"></i> Manage Questions</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item py-2 text-danger fw-bold" href="#" onclick="deleteExam(${exam.id})"><i class="bi bi-trash me-2"></i> Delete</a></li>
                            </ul>
                        </div>
                    </div>
                    <h5 class="fw-bold text-dark-green mb-1 heading-font">${exam.title}</h5>
                    <div class="d-flex gap-3 mt-3">
                        <div class="smaller text-muted"><i class="bi bi-clock me-1"></i> ${exam.duration} mins</div>
                        <div class="smaller text-muted"><i class="bi bi-bar-chart me-1"></i> ${exam.attempts || 0} Attempts</div>
                    </div>
                </div>
                <div class="p-4 d-flex justify-content-between align-items-center bg-white">
                    <a href="questions.html?examId=${exam.id}" class="btn btn-sm btn-outline-dark-green rounded-pill px-3 fw-bold">Manage Questions</a>
                    <div class="text-dark-green fw-bold small">Active</div>
                </div>
            </div>
        </div>
    `).join('');
}

function initExamForm() {
    const form = document.getElementById('exam-form');
    const createBtn = document.getElementById('create-exam-btn');
    const modal = new bootstrap.Modal(document.getElementById('examModal'));

    if (createBtn) {
        createBtn.addEventListener('click', () => {
            document.getElementById('examModalTitle').innerText = 'Create New Mock Exam';
            document.getElementById('exam-id').value = '';
            form.reset();
            modal.show();
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('exam-id').value;
            const title = document.getElementById('exam-title').value;
            const duration = document.getElementById('exam-duration').value;
            const limit = document.getElementById('exam-limit').value;

            let exams = window.adminApp.getExams();

            if (id) {
                // Edit
                const idx = exams.findIndex(ex => ex.id == id);
                if (idx !== -1) {
                    exams[idx].title = title;
                    exams[idx].duration = duration;
                    exams[idx].questionCount = limit;
                }
            } else {
                // Create
                const newExam = {
                    id: Date.now(),
                    title: title,
                    duration: duration,
                    questionCount: limit,
                    attempts: 0
                };
                exams.push(newExam);
            }

            window.adminApp.saveExams(exams);
            renderExams();
            modal.hide();
        });
    }
}

function editExam(id) {
    const exams = window.adminApp.getExams();
    const exam = exams.find(ex => ex.id == id);
    if (!exam) return;

    document.getElementById('examModalTitle').innerText = 'Edit Mock Exam';
    document.getElementById('exam-id').value = exam.id;
    document.getElementById('exam-title').value = exam.title;
    document.getElementById('exam-duration').value = exam.duration;
    document.getElementById('exam-limit').value = exam.questionCount;

    const modal = new bootstrap.Modal(document.getElementById('examModal'));
    modal.show();
}

function deleteExam(id) {
    if (confirm('Are you sure you want to delete this exam? All related question associations will be removed.')) {
        let exams = window.adminApp.getExams();
        exams = exams.filter(ex => ex.id != id);
        window.adminApp.saveExams(exams);
        renderExams();
    }
}

window.editExam = editExam;
window.deleteExam = deleteExam;
