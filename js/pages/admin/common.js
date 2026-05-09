/**
 * Shared Admin logic
 */
(function () {
    // 1. Authorization Check
    const user = JSON.parse(sessionStorage.getItem('licensify_current_user'));
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderSidebar();
        initSidebarToggle();
        handleLogout();
    });


    function renderSidebar() {
        const sidebarContainer = document.getElementById('sidebar-container');
        if (!sidebarContainer) return;

        const currentPath = window.location.pathname;

        const navItems = [
            { id: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2', link: 'admin-dashboard.html' },
            { id: 'students', label: 'Students', icon: 'bi-people', link: 'admin-students.html' },
            { id: 'trainers', label: 'Trainers', icon: 'bi-person-badge', link: 'admin-trainers.html' },
            { id: 'reservations', label: 'Reservations', icon: 'bi-calendar-check', link: 'admin-reservations.html' },
            { id: 'feedback', label: 'Feedback & Reports', icon: 'bi-chat-left-text', link: 'admin-feedback.html' },
            { id: 'settings', label: 'Settings', icon: 'bi-gear', link: 'admin-settings.html' }
        ];


        let sidebarHTML = `
            <div class="portal-sidebar">
                <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
                    <h6 class="text-muted text-uppercase smaller fw-bold px-3 mb-3" style="letter-spacing: 1px;">Admin Portal</h6>
                    <nav class="nav flex-column">
        `;

        navItems.forEach(item => {
            const isActive = currentPath.includes(item.link);
            sidebarHTML += `
                <a class="portal-nav-link ${isActive ? 'active' : ''}" href="${item.link}">
                    <i class="bi ${item.icon}"></i> ${item.label}
                </a>
            `;
        });

        sidebarHTML += `
                        <hr class="my-3 mx-3 opacity-10">
                        <a class="portal-nav-link text-danger" href="#" id="sidebar-logout">
                            <i class="bi bi-box-arrow-right"></i> Logout
                        </a>
                    </nav>
                </div>
            </div>
        `;

        sidebarContainer.innerHTML = sidebarHTML;
    }

    function initSidebarToggle() {
        // Not needed for student-style sidebar as it's not a fixed overlay
    }


    function handleLogout() {
        const logoutLinks = ['sidebar-logout'];
        logoutLinks.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    sessionStorage.removeItem('licensify_current_user');
                    window.location.href = 'index.html';
                });
            }
        });
    }


    // Export helper for data persistence in demo
    window.adminApp = {
        getUsers: () => JSON.parse(localStorage.getItem('licensify_users')) || [],
        getTrainers: () => {
            const users = JSON.parse(localStorage.getItem('licensify_users')) || [];
            return users.filter(u => u.role === 'trainer');
        },
        getStudents: () => {
            const users = JSON.parse(localStorage.getItem('licensify_users')) || [];
            return users.filter(u => u.role === 'student' || !u.role);
        },
        getReservations: () => JSON.parse(localStorage.getItem('licensify_reservations')) || [],
        getExams: () => JSON.parse(localStorage.getItem('licensify_exams')) || [],
        getQuestions: () => JSON.parse(localStorage.getItem('licensify_questions')) || [],
        getFeedback: () => JSON.parse(localStorage.getItem('licensify_feedback')) || [],

        saveUsers: (users) => localStorage.setItem('licensify_users', JSON.stringify(users)),
        saveReservations: (res) => localStorage.setItem('licensify_reservations', JSON.stringify(res)),
        saveExams: (exams) => localStorage.setItem('licensify_exams', JSON.stringify(exams)),
        saveQuestions: (q) => localStorage.setItem('licensify_questions', JSON.stringify(q)),

        formatDate: (dateStr) => {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        },

        initMockData: function () {
            // 1. Mock Users
            let users = JSON.parse(localStorage.getItem('licensify_users')) || [];
            if (users.length < 5) {
                const mockUsers = [
                    { fname: 'Rashad', lname: 'Hindi', email: 'rashadhindi2004@gmail.com', password: 'Password123!', role: 'admin', phone: '+1 234 567 890' },
                    { fname: 'Sarah', lname: 'Johnson', email: 'sarah.trainer@licensify.com', password: 'Password123!', role: 'trainer', phone: '+1 555 0101' },
                    { fname: 'Michael', lname: 'Chen', email: 'michael.trainer@licensify.com', password: 'Password123!', role: 'trainer', phone: '+1 555 0102' },
                    { fname: 'Ahmad', lname: 'Hassan', email: 'ahmad.student@gmail.com', password: 'Password123!', role: 'student', phone: '+1 555 0201' },
                    { fname: 'Emma', lname: 'Wilson', email: 'emma.student@gmail.com', password: 'Password123!', role: 'student', phone: '+1 555 0202' }
                ];
                localStorage.setItem('licensify_users', JSON.stringify(mockUsers));
            }

            // 2. Mock Reservations
            let reservations = JSON.parse(localStorage.getItem('licensify_reservations')) || [];
            if (reservations.length === 0) {
                const today = new Date().toISOString().split('T')[0];
                const mockRes = [
                    { id: 1, studentName: 'Ahmad Hassan', trainerName: 'Sarah Johnson', date: today, time: '09:00 AM', status: 'Reserved' },
                    { id: 2, studentName: 'Emma Wilson', trainerName: 'Michael Chen', date: today, time: '11:00 AM', status: 'Completed' },
                    { id: 3, studentName: 'Ahmad Hassan', trainerName: 'Michael Chen', date: today, time: '02:00 PM', status: 'Reserved' }
                ];
                localStorage.setItem('licensify_reservations', JSON.stringify(mockRes));
            }

            // 3. Mock Exams
            let exams = JSON.parse(localStorage.getItem('licensify_exams')) || [];
            if (exams.length === 0) {
                const mockExams = [
                    { id: 1, title: 'Basic Theory Test', questionCount: 30, duration: 45, attempts: 124 },
                    { id: 2, title: 'Road Signs Mastery', questionCount: 20, duration: 30, attempts: 89 }
                ];
                localStorage.setItem('licensify_exams', JSON.stringify(mockExams));
            }
            // 4. Mock Feedback
            let feedback = JSON.parse(localStorage.getItem('licensify_feedback')) || [];
            if (feedback.length === 0) {
                const mockFeedback = [
                    { id: 1, studentName: 'Ahmad Hassan', trainerName: 'Sarah Johnson', rating: 5, comment: 'Excellent trainer! Very patient and explains everything clearly.', date: '2026-05-01' },
                    { id: 2, studentName: 'Emma Wilson', trainerName: 'Michael Chen', rating: 4, comment: 'Good lesson, but we started 5 mins late.', date: '2026-05-03' },
                    { id: 3, studentName: 'Ahmad Hassan', trainerName: 'Michael Chen', rating: 5, comment: 'Finally mastered the reverse parking thanks to Michael!', date: '2026-05-05' },
                    { id: 4, studentName: 'John Doe', trainerName: 'Sarah Johnson', rating: 2, comment: 'The car was a bit messy and the trainer was late.', date: '2026-05-06' },
                    { id: 5, studentName: 'Jane Smith', trainerName: 'Sarah Johnson', rating: 5, comment: 'Amazing experience, highly recommended!', date: '2026-05-07' }
                ];
                localStorage.setItem('licensify_feedback', JSON.stringify(mockFeedback));
            }
        }
    };

    // Auto-init mock data for demo
    window.adminApp.initMockData();

})();

