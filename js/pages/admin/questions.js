/**
 * Question Bank Logic
 */
document.addEventListener('DOMContentLoaded', function() {
    initQuestions();
});

function initQuestions() {
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('examId');
    
    if (examId) {
        document.getElementById('exam-filter').value = examId;
        const exam = window.adminApp.getExams().find(ex => ex.id == examId);
        if (exam) document.getElementById('question-list-title').innerText = `Questions for: ${exam.title}`;
    }

    populateExamFilter();
    renderQuestions();
    initQuestionForm();
}

function populateExamFilter() {
    const filter = document.getElementById('exam-filter');
    const exams = window.adminApp.getExams();
    
    exams.forEach(ex => {
        const opt = document.createElement('option');
        opt.value = ex.id;
        opt.textContent = ex.title;
        filter.appendChild(opt);
    });

    filter.addEventListener('change', () => renderQuestions());
}

function renderQuestions() {
    const tableBody = document.getElementById('questions-table-body');
    const filterId = document.getElementById('exam-filter').value;
    
    let questions = window.adminApp.getQuestions();
    
    // Initial mock if empty
    if (questions.length === 0) {
        questions = [
            { id: 1, text: "What does a circular sign with a red border mean?", options: { A: "Warning", B: "Prohibition", C: "Information", D: "Direction" }, correct: "B", exams: [] },
            { id: 2, text: "When approaching a STOP sign, you must:", options: { A: "Slow down", B: "Stop only if traffic is coming", C: "Stop completely", D: "Honk your horn" }, correct: "C", exams: [] }
        ];
        window.adminApp.saveQuestions(questions);
    }

    if (filterId !== 'all') {
        questions = questions.filter(q => q.exams && q.exams.includes(parseInt(filterId)));
    }

    if (questions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-muted">No questions found for this selection.</td></tr>';
        return;
    }

    const examsList = window.adminApp.getExams();

    tableBody.innerHTML = questions.map(q => `
        <tr>
            <td class="fw-bold text-muted">#${q.id}</td>
            <td>
                <div class="fw-bold text-dark-green mb-1">${q.text}</div>
                <div class="row g-2 mt-1">
                    <div class="col-6 smaller text-muted">A: ${q.options.A}</div>
                    <div class="col-6 smaller text-muted">B: ${q.options.B}</div>
                    <div class="col-6 smaller text-muted">C: ${q.options.C}</div>
                    <div class="col-6 smaller text-muted">D: ${q.options.D}</div>
                </div>
            </td>
            <td><span class="badge bg-success-subtle text-success">Option ${q.correct}</span></td>
            <td>
                ${(q.exams || []).map(exId => {
                    const ex = examsList.find(e => e.id == exId);
                    return ex ? `<span class="badge bg-light-green text-dark-green smaller mb-1 d-inline-block">${ex.title}</span>` : '';
                }).join(' ')}
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn-action" title="Edit" onclick="editQuestion(${q.id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn-action delete" title="Delete" onclick="deleteQuestion(${q.id})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function initQuestionForm() {
    const form = document.getElementById('question-form');
    const addBtn = document.getElementById('add-question-btn');
    const modal = new bootstrap.Modal(document.getElementById('questionModal'));

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('questionModalTitle').innerText = 'Add New Question';
            document.getElementById('q-id').value = '';
            form.reset();
            renderExamCheckboxes([]);
            modal.show();
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('q-id').value;
            const text = document.getElementById('q-text').value;
            const options = {
                A: document.getElementById('q-opt-a').value,
                B: document.getElementById('q-opt-b').value,
                C: document.getElementById('q-opt-c').value,
                D: document.getElementById('q-opt-d').value
            };
            const correct = document.getElementById('q-correct').value;
            
            // Get selected exams
            const selectedExams = Array.from(document.querySelectorAll('.exam-check:checked')).map(cb => parseInt(cb.value));

            let questions = window.adminApp.getQuestions();

            if (id) {
                const idx = questions.findIndex(q => q.id == id);
                if (idx !== -1) {
                    questions[idx] = { ...questions[idx], text, options, correct, exams: selectedExams };
                }
            } else {
                questions.push({
                    id: Date.now(),
                    text, options, correct, exams: selectedExams
                });
            }

            window.adminApp.saveQuestions(questions);
            renderQuestions();
            modal.hide();
        });
    }
}

function renderExamCheckboxes(selectedExams = []) {
    const container = document.getElementById('exam-checkboxes');
    const exams = window.adminApp.getExams();
    
    container.innerHTML = exams.map(ex => `
        <div class="col-md-6">
            <div class="form-check">
                <input class="form-check-input exam-check" type="checkbox" value="${ex.id}" id="ex-check-${ex.id}" ${selectedExams.includes(ex.id) ? 'checked' : ''}>
                <label class="form-check-label smaller" for="ex-check-${ex.id}">${ex.title}</label>
            </div>
        </div>
    `).join('');
}

function editQuestion(id) {
    const questions = window.adminApp.getQuestions();
    const q = questions.find(item => item.id == id);
    if (!q) return;

    document.getElementById('questionModalTitle').innerText = 'Edit Question';
    document.getElementById('q-id').value = q.id;
    document.getElementById('q-text').value = q.text;
    document.getElementById('q-opt-a').value = q.options.A;
    document.getElementById('q-opt-b').value = q.options.B;
    document.getElementById('q-opt-c').value = q.options.C;
    document.getElementById('q-opt-d').value = q.options.D;
    document.getElementById('q-correct').value = q.correct;
    
    renderExamCheckboxes(q.exams || []);

    const modal = new bootstrap.Modal(document.getElementById('questionModal'));
    modal.show();
}

function deleteQuestion(id) {
    if (confirm('Are you sure you want to delete this question?')) {
        let questions = window.adminApp.getQuestions();
        questions = questions.filter(q => q.id != id);
        window.adminApp.saveQuestions(questions);
        renderQuestions();
    }
}

window.editQuestion = editQuestion;
window.deleteQuestion = deleteQuestion;
