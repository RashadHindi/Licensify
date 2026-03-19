/**
 * Shared logic for all pages
 */
document.addEventListener('DOMContentLoaded', function () {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        if (!navbar) return;

        // Navbar scrolled state (glass effect)
        if (window.scrollY > 30) {
            navbar.classList.add('navbar-scrolled', 'shadow-sm');
        } else {
            // Only remove if it's not the exams page (which has it by default in HTML)
            // But we can check for a specific class or just let the script handle it
            if (!document.body.classList.contains('bg-light-green') || window.location.pathname.includes('index.html')) {
                if (!window.location.pathname.includes('exams.html')) {
                    navbar.classList.remove('navbar-scrolled', 'shadow-sm');
                }
            }
        }

        // Section tracking for active state (navigation highlight)
        if (sections.length > 0) {
            let currentSection = "";
            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= (sectionTop - 150)) {
                    currentSection = section.getAttribute("id");
                }
            });

            // Ensure Home is active if at top
            if (window.scrollY < 10 && document.getElementById('home')) {
                currentSection = "home";
            }

            if (currentSection) {
                navLinks.forEach((link) => {
                    const href = link.getAttribute("href");

                    // If on exams page, keep Practice Test active
                    if (window.location.pathname.includes('exams.html')) {
                        link.classList.remove("active");
                        if (href.includes("#practice-test")) {
                            link.classList.add("active");
                        }
                        return;
                    }

                    // If on study page, keep Study active
                    if (window.location.pathname.includes('study.html')) {
                        link.classList.remove("active");
                        if (href.includes("#topics")) {
                            link.classList.add("active");
                        }
                        return;
                    }

                    // On other pages (like index), follow scroll position
                    link.classList.remove("active");
                    if (href === `#${currentSection}` || href === `index.html#${currentSection}`) {
                        link.classList.add("active");
                    }
                });
            } else if (window.location.pathname.includes('exams.html')) {
                // Special case for exams page if no sections are found/visible
                navLinks.forEach((link) => {
                    link.classList.remove("active");
                    if (link.getAttribute("href").includes("#practice-test")) {
                        link.classList.add("active");
                    }
                });
            } else if (window.location.pathname.includes('study.html')) {
                // Special case for study page
                navLinks.forEach((link) => {
                    link.classList.remove("active");
                    if (link.getAttribute("href").includes("#topics")) {
                        link.classList.add("active");
                    }
                });
            }
        }
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-fade, .fade-up-element, .fade-in-element').forEach((el) => {
        observer.observe(el);
    });
});

// Modern Auth Modal Logic Setup
document.addEventListener('DOMContentLoaded', function () {
    // 1. Inject Modal HTML into body to avoid merge conflicts and repetition
    const modalHTML = `
    <div class="auth-modal-overlay" id="auth-modal">
        <div class="auth-modal-container">
            <button class="auth-modal-close" id="auth-modal-close">
                <i class="bi bi-x-lg"></i>
            </button>
            <div class="auth-modal-header">
                <h2 class="fw-bold heading-font text-dark-green mb-0" id="auth-modal-title">Welcome Back</h2>
                <p class="text-muted mt-2 mb-0" id="auth-modal-subtitle">Log in to continue your learning journey.</p>
            </div>
            <div class="auth-modal-body">
                <div id="auth-alert" class="auth-message"></div>

                <!-- Login Form -->
                <form id="login-form" class="auth-form active">
                    <button type="button" class="social-auth-btn">
                        <i class="bi bi-google text-danger fs-5"></i> Continue with Google
                    </button>
                    <button type="button" class="social-auth-btn">
                        <i class="bi bi-facebook text-primary fs-5"></i> Continue with Facebook
                    </button>

                    <div class="auth-divider"><span>or log in with email</span></div>

                    <div class="auth-input-group">
                        <label>Email Address</label>
                        <input type="email" id="login-email" class="auth-input" placeholder="you@example.com" required>
                    </div>
                    <div class="auth-input-group">
                        <label class="d-flex justify-content-between">
                            <span>Password</span>
                            <a href="#" class="text-orange text-decoration-none fw-normal">Forgot Password?</a>
                        </label>
                        <input type="password" id="login-password" class="auth-input" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-rounded w-100 py-3 fw-bold mt-2 hover-lift">Log In</button>
                    
                    <div class="auth-footer-text">
                        Don't have an account? <a href="#" id="link-to-signup">Sign up</a>
                    </div>
                </form>

                <!-- Signup Form -->
                <form id="signup-form" class="auth-form">
                    <button type="button" class="social-auth-btn">
                        <i class="bi bi-google text-danger fs-5"></i> Continue with Google
                    </button>
                    <button type="button" class="social-auth-btn">
                        <i class="bi bi-facebook text-primary fs-5"></i> Continue with Facebook
                    </button>

                    <div class="auth-divider"><span>or sign up with email</span></div>

                    <div class="row">
                        <div class="col-6 auth-input-group">
                            <label>First Name</label>
                            <input type="text" id="signup-fname" class="auth-input" placeholder="First Name" required>
                        </div>
                        <div class="col-6 auth-input-group">
                            <label>Last Name</label>
                            <input type="text" id="signup-lname" class="auth-input" placeholder="Last Name" required>
                        </div>
                    </div>
                    <div class="auth-input-group">
                        <label>Email Address</label>
                        <input type="email" id="signup-email" class="auth-input" placeholder="you@example.com" required>
                    </div>
                    <div class="auth-input-group">
                        <label>Password</label>
                        <input type="password" id="signup-password" class="auth-input" placeholder="Create a strong password" required>
                    </div>
                    <div class="auth-input-group">
                        <label>Confirm Password</label>
                        <input type="password" id="signup-confirm" class="auth-input" placeholder="Confirm your password" required>
                    </div>
                    
                    <div class="auth-checkbox-group mt-3">
                        <input type="checkbox" id="signup-terms" required>
                        <label for="signup-terms">I agree to the <a href="#">Privacy Policy</a>, <a href="#">Terms of Use</a> and <a href="#">Terms of Service</a>.</label>
                    </div>
                    <div class="auth-checkbox-group mb-4">
                        <input type="checkbox" id="signup-marketing">
                        <label for="signup-marketing">I agree to receive marketing notifications with offers and news.</label>
                    </div>

                    <button type="submit" class="btn btn-primary btn-rounded w-100 py-3 fw-bold hover-lift">Create Account</button>
                    
                    <div class="auth-footer-text">
                        Already have an account? <a href="#" id="link-to-login">Log in</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 2. Auth Modal Logic
    const modal = document.getElementById('auth-modal');
    const closeBtn = document.getElementById('auth-modal-close');
    const modalTitle = document.getElementById('auth-modal-title');
    const modalSubtitle = document.getElementById('auth-modal-subtitle');
    const alertBox = document.getElementById('auth-alert');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    const linkToSignup = document.getElementById('link-to-signup');
    const linkToLogin = document.getElementById('link-to-login');

    function openModal(defaultView = 'login') {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        switchView(defaultView);
        hideAlert();
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        loginForm.reset();
        signupForm.reset();
        hideAlert();
    }

    function switchView(viewName) {
        hideAlert();
        if (viewName === 'login') {
            signupForm.classList.remove('active');
            loginForm.classList.add('active');
            modalTitle.innerText = 'Welcome Back';
            modalSubtitle.innerText = 'Log in to continue your learning journey.';
        } else {
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
            modalTitle.innerText = 'Create an Account';
            modalSubtitle.innerText = 'Join Licensify to master your driving theory.';
        }
    }

    function showAlert(message, type = 'error') {
        alertBox.innerText = message;
        alertBox.style.display = 'block';
        alertBox.className = `auth-message \${type}`;
    }

    function hideAlert() {
        alertBox.style.display = 'none';
        alertBox.className = 'auth-message';
    }

    // Event Listeners for UI
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    linkToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('signup');
    });
    linkToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('login');
    });

    // Link triggers (Auto-binding to navbar buttons globally)
    const initAuthTriggers = () => {
        document.querySelectorAll('a, button').forEach(el => {
            const text = el.innerText.trim().toLowerCase();
            if (text === 'login' || text === 'student portal') {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    openModal('login');
                });
            } else if (text === 'sign up') {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    openModal('signup');
                });
            }
        });
    };
    initAuthTriggers();

    // Expose functionality globally for later UI modules
    window.authApp = {
        openLogin: () => openModal('login'),
        openSignup: () => openModal('signup'),
        requireAuth: (callback) => {
            const users = JSON.parse(localStorage.getItem('licensify_users')) || [];
            if (users.length > 0) {
                // Pseudo logged in state for demo
                callback();
            } else {
                openModal('login');
            }
        }
    };

    // 3. Fake Auth Logic using localStorage
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-password').value;

        if (!email || !pass) {
            return showAlert('Please fill in all fields.');
        }

        const users = JSON.parse(localStorage.getItem('licensify_users')) || [];
        const user = users.find(u => u.email === email && u.password === pass);

        if (user) {
            showAlert(`Welcome back, \${user.fname}! Logging you in...`, 'success');
            setTimeout(() => {
                closeModal();
            }, 1000);
        } else {
            showAlert('Invalid email or password.');
        }
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fname = document.getElementById('signup-fname').value.trim();
        const lname = document.getElementById('signup-lname').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const pass = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        const terms = document.getElementById('signup-terms').checked;

        if (!fname || !lname || !email || !pass || !confirm) {
            return showAlert('Please fill in all required fields.');
        }

        if (pass !== confirm) {
            return showAlert('Passwords do not match.');
        }

        if (!terms) {
            return showAlert('You must agree to the terms to continue.');
        }

        const users = JSON.parse(localStorage.getItem('licensify_users')) || [];
        if (users.find(u => u.email === email)) {
            return showAlert('An account with this email already exists.');
        }

        users.push({ fname, lname, email, password: pass });
        localStorage.setItem('licensify_users', JSON.stringify(users));

        showAlert('Account created successfully! Logging you in...', 'success');

        setTimeout(() => {
            closeModal();
            loginForm.reset();
            signupForm.reset();
        }, 1000);
    });
});
