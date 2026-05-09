/**
 * Exam Builder Logic
 * Allows Admin/Trainers to create custom mock exams
 */
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(sessionStorage.getItem('licensify_current_user'));
    if (!user || (user.role !== 'admin' && user.role !== 'trainer')) return;

    let questions = [];
    let editingIndex = null;
    let pendingDeleteIndex = null;
    let currentCategoryId = null;

    const modal = new bootstrap.Modal(document.getElementById('createExamModal'));
    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('builderDeleteConfirmModal'));
    const alertModal = new bootstrap.Modal(document.getElementById('builderAlertModal'));

    // DOM Elements
    const elements = {
        qText: document.getElementById('builder-q-text'),
        options: [
            document.getElementById('builder-opt-0'),
            document.getElementById('builder-opt-1'),
            document.getElementById('builder-opt-2'),
            document.getElementById('builder-opt-3')
        ],
        correct: document.getElementById('builder-correct'),
        explanation: document.getElementById('builder-explanation'),
        addBtn: document.getElementById('builder-add-q-btn'),
        cancelEditBtn: document.getElementById('builder-cancel-edit-btn'),
        publishBtn: document.getElementById('builder-publish-btn'),
        counter: document.getElementById('builder-counter'),
        list: document.getElementById('builder-question-list'),
        emptyState: document.getElementById('builder-empty-state'),
        stepTitle: document.getElementById('builder-step-title'),
        confirmDeleteBtn: document.getElementById('confirm-delete-q-btn'),
        alertMsg: document.getElementById('builder-alert-msg')
    };

    // Initialize UI
    window.openExamBuilder = function(categoryId) {
        currentCategoryId = categoryId;
        resetForm();
        questions = [];
        renderQuestionList();
        modal.show();
    };

    function resetForm() {
        elements.qText.value = '';
        elements.options.forEach(opt => opt.value = '');
        elements.correct.value = '';
        elements.explanation.value = '';
        elements.addBtn.textContent = 'Add Question to Exam';
        elements.stepTitle.textContent = 'Add Question';
        elements.cancelEditBtn.classList.add('d-none');
        editingIndex = null;
    }

    elements.addBtn.addEventListener('click', () => {
        const qData = {
            text: elements.qText.value.trim(),
            options: elements.options.map(opt => opt.value.trim()),
            correctAnswer: parseInt(elements.correct.value),
            explanation: elements.explanation.value.trim()
        };

        // Validation
        if (!qData.text || qData.options.some(opt => !opt) || isNaN(qData.correctAnswer) || !qData.explanation) {
            elements.alertMsg.textContent = 'Please fill in all fields for the question.';
            alertModal.show();
            return;
        }

        if (editingIndex !== null) {
            questions[editingIndex] = qData;
        } else {
            if (questions.length >= 30) {
                elements.alertMsg.textContent = 'Maximum limit reached. A mock exam can only contain 30 questions.';
                alertModal.show();
                return;
            }
            questions.push(qData);
        }

        resetForm();
        renderQuestionList();
    });

    elements.cancelEditBtn.addEventListener('click', resetForm);

    function renderQuestionList() {
        elements.list.innerHTML = '';
        elements.counter.textContent = `${questions.length} / 30 Questions`;

        if (questions.length === 0) {
            elements.emptyState.classList.remove('d-none');
        } else {
            elements.emptyState.classList.add('d-none');
            questions.forEach((q, index) => {
                const item = document.createElement('div');
                item.className = 'card border-0 shadow-sm rounded-4 p-3 builder-item animate-fade';
                item.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center gap-3">
                            <div class="rounded-circle bg-dark-green text-white d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; font-size: 14px;">
                                ${index + 1}
                            </div>
                            <div>
                                <p class="mb-0 fw-bold text-dark-green text-truncate" style="max-width: 300px;">${q.text}</p>
                                <small class="text-muted">Correct: Option ${String.fromCharCode(65 + q.correctAnswer)}</small>
                            </div>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-light rounded-circle shadow-none builder-action-btn" onclick="moveQuestion(${index}, -1)" ${index === 0 ? 'disabled' : ''} title="Move Up">
                                <i class="bi bi-arrow-up"></i>
                            </button>
                            <button class="btn btn-sm btn-light rounded-circle shadow-none builder-action-btn" onclick="moveQuestion(${index}, 1)" ${index === questions.length - 1 ? 'disabled' : ''} title="Move Down">
                                <i class="bi bi-arrow-down"></i>
                            </button>
                            <button class="btn btn-sm btn-light rounded-circle shadow-none builder-action-btn text-primary" onclick="editQuestion(${index})" title="Edit">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button class="btn btn-sm btn-light rounded-circle shadow-none builder-action-btn text-danger" onclick="confirmDeleteQuestion(${index})" title="Delete">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </div>
                    </div>
                `;
                elements.list.appendChild(item);
            });
        }
    }

    window.editQuestion = function(index) {
        const q = questions[index];
        elements.qText.value = q.text;
        q.options.forEach((opt, i) => elements.options[i].value = opt);
        elements.correct.value = q.correctAnswer;
        elements.explanation.value = q.explanation;
        
        elements.addBtn.textContent = 'Update Question';
        elements.stepTitle.textContent = `Editing Question ${index + 1}`;
        elements.cancelEditBtn.classList.remove('d-none');
        editingIndex = index;
        
        // Scroll to form on mobile
        if (window.innerWidth < 992) {
            elements.qText.scrollIntoView({ behavior: 'smooth' });
        }
    };

    window.confirmDeleteQuestion = function(index) {
        pendingDeleteIndex = index;
        deleteConfirmModal.show();
    };

    elements.confirmDeleteBtn.addEventListener('click', () => {
        if (pendingDeleteIndex !== null) {
            questions.splice(pendingDeleteIndex, 1);
            if (editingIndex === pendingDeleteIndex) resetForm();
            renderQuestionList();
            deleteConfirmModal.hide();
            pendingDeleteIndex = null;
        }
    });

    window.moveQuestion = function(index, direction) {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= questions.length) return;
        
        const temp = questions[index];
        questions[index] = questions[targetIndex];
        questions[targetIndex] = temp;
        
        renderQuestionList();
    };

    elements.publishBtn.addEventListener('click', () => {
        if (questions.length === 0) {
            elements.alertMsg.textContent = 'Please add at least one question to the exam.';
            alertModal.show();
            return;
        }

        const newExam = {
            id: 'custom_' + Date.now(),
            title: 'Mock Theory Exam',
            questions: questions,
            creator_id: user.email, 
            creator_role: user.role,
            category: currentCategoryId || 'private',
            dateCreated: new Date().toISOString()
        };

        // Save to LocalStorage
        const customExams = JSON.parse(localStorage.getItem('licensify_custom_exams')) || [];
        customExams.push(newExam);
        localStorage.setItem('licensify_custom_exams', JSON.stringify(customExams));

        // Toast success
        showSuccessToast('Mock exam created successfully.');

        modal.hide();
        
        // Refresh the quiz list if we are in the custom category view
        if (window.refreshQuizzes) window.refreshQuizzes();
    });

    function showSuccessToast(msg) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'custom-toast success show';
        toast.innerHTML = `
            <div class="toast-icon bg-success text-white">
                <i class="bi bi-check-lg"></i>
            </div>
            <div class="toast-content">
                <h6>Success!</h6>
                <p>${msg}</p>
            </div>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});
