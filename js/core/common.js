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
                <form id="login-form" class="auth-form active" novalidate>
                    <button type="button" class="social-auth-btn social-not-configured">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" class="social-icon"> Continue with Google
                    </button>
                    <button type="button" class="social-auth-btn social-not-configured">
                        <i class="bi bi-facebook text-primary fs-5"></i> Continue with Facebook
                    </button>

                    <div class="auth-divider"><span>or log in with email</span></div>

                    <div class="auth-input-group">
                        <label>Email Address</label>
                        <input type="email" id="login-email" class="auth-input" placeholder="you@example.com">
                        <div class="error-text">This Field is Required</div>
                    </div>
                    <div class="auth-input-group">
                        <label>Password</label>
                        <input type="password" id="login-password" class="auth-input" placeholder="Enter your password">
                        <div class="error-text">This Field is Required</div>
                        <div class="text-end mt-1">
                            <a href="#" id="link-forgot-password" class="text-orange text-decoration-none fw-normal" style="font-size: 0.85rem;">Forgot Password?</a>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-rounded w-100 py-3 fw-bold mt-2 hover-lift">Log In</button>
                    
                    <div class="auth-footer-text">
                        Don't have an account? <a href="#" id="link-to-signup">Sign up</a>
                    </div>
                </form>

                <!-- Forgot Password (Email Form) -->
                <form id="forgot-email-form" class="auth-form" novalidate>
                    <div class="auth-input-group">
                        <label>Enter your Email Address</label>
                        <input type="email" id="forgot-email" class="auth-input" placeholder="you@example.com">
                        <div class="error-text">This Field is Required</div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-rounded w-100 py-3 fw-bold mt-2 hover-lift">Send Code</button>
                    <div class="auth-footer-text">
                        <a href="#" class="link-back-login">Back to Login</a>
                    </div>
                </form>

                <!-- Forgot Password (Verify Code) -->
                <form id="forgot-verify-form" class="auth-form" novalidate>
                    <div class="auth-input-group">
                        <label>Verification Code</label>
                        <input type="text" id="forgot-verify-code" class="auth-input text-center fs-4 letter-spacing-1" placeholder="• • • • • •" maxlength="6">
                        <div class="error-text text-center">This Field is Required</div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-rounded w-100 py-3 fw-bold mt-2 hover-lift">Verify Code</button>
                    <div class="auth-footer-text mt-3 text-center">
                        Didn't receive it? <a href="#" class="resend-code">Resend Code</a>
                    </div>
                </form>

                <!-- Forgot Password (Reset) -->
                <form id="forgot-reset-form" class="auth-form" novalidate>
                    <div class="auth-input-group">
                        <label>New Password</label>
                        <input type="password" id="forgot-new-pass" class="auth-input" placeholder="Create new password">
                        <div class="error-text">This Field is Required</div>
                    </div>
                    <div class="auth-input-group">
                        <label>Confirm Password</label>
                        <input type="password" id="forgot-confirm-pass" class="auth-input" placeholder="Confirm new password">
                        <div class="error-text">This Field is Required</div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-rounded w-100 py-3 fw-bold mt-2 hover-lift">Reset Password</button>
                </form>

                <!-- Signup Step 1 Form -->
                <form id="signup-step1" class="auth-form" novalidate>
                    <button type="button" class="social-auth-btn social-not-configured">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" class="social-icon"> Continue with Google
                    </button>
                    <button type="button" class="social-auth-btn social-not-configured">
                        <i class="bi bi-facebook text-primary fs-5"></i> Continue with Facebook
                    </button>

                    <div class="auth-divider"><span>or sign up with email</span></div>

                    <div class="auth-input-group">
                        <label>Email Address</label>
                        <input type="email" id="signup-email" class="auth-input" placeholder="you@example.com">
                        <div class="error-text">This Field is Required</div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-rounded w-100 py-3 fw-bold mt-2 hover-lift">Continue</button>
                    
                    <div class="auth-footer-text">
                        Already have an account? <a href="#" id="link-to-login">Log in</a>
                    </div>
                </form>

                <!-- Signup Step 2 Form -->
                <form id="signup-step2" class="auth-form" novalidate>
                    <div class="row">
                        <div class="col-6 auth-input-group">
                            <label>First Name</label>
                            <input type="text" id="signup-fname" class="auth-input" placeholder="First Name">
                            <div class="error-text">This Field is Required</div>
                        </div>
                        <div class="col-6 auth-input-group">
                            <label>Last Name</label>
                            <input type="text" id="signup-lname" class="auth-input" placeholder="Last Name">
                            <div class="error-text">This Field is Required</div>
                        </div>
                    </div>
                    <div class="auth-input-group">
                        <label>Password</label>
                        <input type="password" id="signup-password" class="auth-input" placeholder="Create a strong password">
                        <div class="error-text">This Field is Required</div>
                    </div>
                    <div class="auth-input-group">
                        <label>Confirm Password</label>
                        <input type="password" id="signup-confirm" class="auth-input" placeholder="Confirm your password">
                        <div class="error-text">This Field is Required</div>
                    </div>
                    
                    <div class="auth-checkbox-group flex-column mt-3">
                        <div class="d-flex w-100">
                            <input type="checkbox" id="signup-terms" class="me-2">
                            <label for="signup-terms" class="m-0 mt-1">I agree to the <a href="#">Privacy Policy</a>, <a href="#">Terms of Use</a> and <a href="#">Terms of Service</a>.</label>
                        </div>
                        <div class="error-text w-100">This Field is Required</div>
                    </div>
                    <div class="auth-checkbox-group flex-column mb-4">
                        <div class="d-flex w-100">
                            <input type="checkbox" id="signup-marketing" class="me-2">
                            <label for="signup-marketing" class="m-0 mt-1">I agree to receive marketing notifications with offers and news.</label>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-rounded w-100 py-3 fw-bold hover-lift">Create Account</button>
                    <div class="auth-footer-text mt-2">
                        <a href="#" class="link-back-step1" style="font-weight: 500;">Back</a>
                    </div>
                </form>

                <!-- Signup Verify Form -->
                <form id="signup-verify" class="auth-form" novalidate>
                    <div class="text-center mb-4 text-muted" style="font-size: 0.9rem;">
                        We've sent a code to your email.<br>
                        Time remaining: <span id="verify-timer" class="fw-bold text-dark-green">02:00</span>
                    </div>
                    <div class="auth-input-group">
                        <label>Verification Code</label>
                        <input type="text" id="signup-verify-code" class="auth-input text-center fs-4 letter-spacing-1" placeholder="• • • • • •" maxlength="6">
                        <div class="error-text text-center">This Field is Required</div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-rounded w-100 py-3 fw-bold hover-lift mt-3">Verify & Complete</button>
                    <div class="auth-footer-text mt-3 text-center">
                        Didn't receive it? <a href="#" class="resend-code">Resend Code</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('auth-modal');
    const closeBtn = document.getElementById('auth-modal-close');
    const modalTitle = document.getElementById('auth-modal-title');
    const modalSubtitle = document.getElementById('auth-modal-subtitle');
    const alertBox = document.getElementById('auth-alert');

    const forms = {
        login: document.getElementById('login-form'),
        signupStep1: document.getElementById('signup-step1'),
        signupStep2: document.getElementById('signup-step2'),
        signupVerify: document.getElementById('signup-verify'),
        forgotEmail: document.getElementById('forgot-email-form'),
        forgotVerify: document.getElementById('forgot-verify-form'),
        forgotReset: document.getElementById('forgot-reset-form')
    };

    let timerInterval = null;
    let expectedVerifyCode = '';
    let signupEmailPending = '';
    let resendTimerInterval = null;

    function openModal(defaultView = 'login') {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        switchView(defaultView);
        hideAlert();
        clearAllErrors();
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        Object.values(forms).forEach(f => f && f.reset());
        hideAlert();
        clearAllErrors();
        if (timerInterval) clearInterval(timerInterval);
        if (resendTimerInterval) clearInterval(resendTimerInterval);
    }

    function switchView(viewName) {
        hideAlert();
        clearAllErrors();
        Object.values(forms).forEach(f => {
            if (f) f.classList.remove('active');
        });

        document.querySelectorAll('.resend-code').forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.color = '';
            btn.style.textDecoration = '';
            btn.innerText = 'Resend Code';
        });
        if (resendTimerInterval) clearInterval(resendTimerInterval);

        if (viewName === 'login') {
            forms.login.classList.add('active');
            modalTitle.innerText = 'Welcome Back';
            modalSubtitle.innerText = 'Log in to continue your learning journey.';
        } else if (viewName === 'signup1') {
            forms.signupStep1.classList.add('active');
            modalTitle.innerText = 'Create an Account';
            modalSubtitle.innerText = 'Join Licensify to master your driving theory.';
        } else if (viewName === 'signup2') {
            forms.signupStep2.classList.add('active');
            modalTitle.innerText = 'Provide Details';
            modalSubtitle.innerText = 'Complete your profile information.';
        } else if (viewName === 'signup-verify') {
            forms.signupVerify.classList.add('active');
            modalTitle.innerText = 'Verify Email';
            modalSubtitle.innerText = 'Check your inbox for the code.';
        } else if (viewName === 'forgot-email') {
            forms.forgotEmail.classList.add('active');
            modalTitle.innerText = 'Forgot Password';
            modalSubtitle.innerText = 'Enter your email to receive a code.';
        } else if (viewName === 'forgot-verify') {
            forms.forgotVerify.classList.add('active');
            modalTitle.innerText = 'Verify Code';
            modalSubtitle.innerText = 'Check your inbox for the reset code.';
        } else if (viewName === 'forgot-reset') {
            forms.forgotReset.classList.add('active');
            modalTitle.innerText = 'Reset Password';
            modalSubtitle.innerText = 'Create a new secure password.';
        }
    }

    function showAlert(message, type = 'error') {
        if (!message) {
            hideAlert();
            return;
        }
        alertBox.innerText = message;
        alertBox.style.display = 'block';
        alertBox.className = `auth-message ${type}`;
    }

    function hideAlert() {
        if(alertBox) {
            alertBox.style.display = 'none';
            alertBox.className = 'auth-message';
        }
    }

    function validateField(inputEl, conditionFunc, customErrorMsg = "This Field is Required") {
        const parent = inputEl.closest('.auth-input-group') || inputEl.closest('.auth-checkbox-group');
        let errorText = parent ? parent.querySelector('.error-text') : null;
        
        const isInvalid = !conditionFunc();

        if (isInvalid) {
            inputEl.classList.add('input-error');
            if(errorText) {
                errorText.innerText = customErrorMsg;
                errorText.classList.add('active');
            }
            return false;
        } else {
            inputEl.classList.remove('input-error');
            if(errorText) errorText.classList.remove('active');
            return true;
        }
    }

    function checkEmailFormat(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    }

    function clearAllErrors() {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.querySelectorAll('.error-text.active').forEach(el => el.classList.remove('active'));
    }

    function startTimer(durationSeconds, displayEl) {
        if (timerInterval) clearInterval(timerInterval);
        let timer = durationSeconds;
        
        displayEl.innerText = formatTime(timer);
        timerInterval = setInterval(() => {
            timer--;
            if (timer < 0) {
                clearInterval(timerInterval);
                displayEl.innerText = "00:00";
            } else {
                displayEl.innerText = formatTime(timer);
            }
        }, 1000);
    }
    
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // Event Listeners for UI
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    document.getElementById('link-to-signup').addEventListener('click', (e) => {
        e.preventDefault();
        switchView('signup1');
    });
    document.getElementById('link-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        switchView('login');
    });
    document.getElementById('link-forgot-password').addEventListener('click', (e) => {
        e.preventDefault();
        switchView('forgot-email');
    });
    document.querySelectorAll('.link-back-login').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('login');
        });
    });
    document.querySelectorAll('.link-back-step1').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('signup1');
        });
    });

    document.querySelectorAll('.social-not-configured').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            showAlert('Social login requires a backend database to securely map users.', 'error');
        });
    });

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
                    openModal('signup1');
                });
            } else if (text.includes('book your first lesson')) {
                el.addEventListener('click', (e) => {
                    if (!window.authApp.isLoggedIn()) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.authApp.openLogin('reservation.html');
                    }
                });
            }
        });
    };
    initAuthTriggers();
    function updateNavbarForUser(user) {
        const userWrapper = document.querySelector('.navbar-auth-user-wrapper');
        if (userWrapper) {
            userWrapper.innerHTML = `
        <div class="dropdown">
            <button class="btn btn-outline-dark btn-rounded d-flex align-items-center gap-2 dropdown-toggle shadow-sm" type="button" id="userProfileDropdown" data-bs-toggle="dropdown" aria-expanded="false" style="padding: 6px 16px; background-color: var(--color-white); border: 1.5px solid #d0d7d4;">
                <div class="bg-orange text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-weight: bold; font-size: 0.9rem;">
                    ${user.fname.charAt(0).toUpperCase()}
                </div>
                <span class="fw-bold text-dark-green" style="font-size: 0.95rem;">${user.fname}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 mt-2" aria-labelledby="userProfileDropdown" style="min-width: 220px; z-index: 1050; padding: 12px 0;">
                <li><h6 class="dropdown-header text-muted text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px;">Account Menu</h6></li>
                <li><a class="dropdown-item py-2 fw-medium text-dark-green d-flex align-items-center gap-3" href="#"><i class="bi bi-person fs-5"></i> Profile</a></li>
                <li><a class="dropdown-item py-2 fw-medium text-dark-green d-flex align-items-center gap-3" href="#"><i class="bi bi-graph-up-arrow fs-5"></i> Performance Stats</a></li>
                <li><a class="dropdown-item py-2 fw-medium text-dark-green d-flex align-items-center gap-3" href="#"><i class="bi bi-clock-history fs-5"></i> Activities</a></li>
                <li><a class="dropdown-item py-2 fw-medium text-dark-green d-flex align-items-center gap-3" href="#"><i class="bi bi-gear fs-5"></i> Settings</a></li>
                <li><hr class="dropdown-divider my-2"></li>
                <li><a class="dropdown-item py-2 fw-bold text-danger d-flex align-items-center gap-3" href="#" id="logout-btn" style="font-size: 0.9rem;"><i class="bi bi-box-arrow-right fs-5"></i> Logout</a></li>
            </ul>
        </div>`;
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    sessionStorage.removeItem('licensify_current_user');
                    // Clear guest data on logout as requested
                    localStorage.removeItem('licensify_guest_data');
                    window.location.reload();
                });
            }
        }
    }

    const currentUser = JSON.parse(sessionStorage.getItem('licensify_current_user'));
    if (currentUser) {
        updateNavbarForUser(currentUser);
        document.documentElement.classList.add('auth-resolved');
    } else {
        document.documentElement.classList.add('auth-resolved');
    }

    window.authApp = {
        openLogin: (redirectUrl = null) => {
            if (redirectUrl) sessionStorage.setItem('auth_redirect', redirectUrl);
            openModal('login');
        },
        openSignup: (redirectUrl = null) => {
            if (redirectUrl) sessionStorage.setItem('auth_redirect', redirectUrl);
            openModal('signup1');
        },
        getCurrentUser: () => JSON.parse(sessionStorage.getItem('licensify_current_user')),
        isLoggedIn: () => !!sessionStorage.getItem('licensify_current_user'),
        requireAuth: (callback, redirectUrl = null) => {
            if (sessionStorage.getItem('licensify_current_user')) {
                callback();
            } else {
                if (redirectUrl) sessionStorage.setItem('auth_redirect', redirectUrl);
                openModal('login');
            }
        },
        saveUserData: function(key, data) {
            const user = this.getCurrentUser();
            if (user) {
                const users = JSON.parse(localStorage.getItem('licensify_users')) || [];
                const uIndex = users.findIndex(u => u.email === user.email);
                if (uIndex !== -1) {
                    if (!users[uIndex].data) users[uIndex].data = {};
                    users[uIndex].data[key] = data;
                    localStorage.setItem('licensify_users', JSON.stringify(users));
                    user.data = users[uIndex].data;
                    sessionStorage.setItem('licensify_current_user', JSON.stringify(user));
                }
            } else {
                const guestData = JSON.parse(localStorage.getItem('licensify_guest_data')) || {};
                guestData[key] = data;
                localStorage.setItem('licensify_guest_data', JSON.stringify(guestData));
            }
        },
        getUserData: function(key) {
            const user = this.getCurrentUser();
            if (user && user.data && user.data[key]) return user.data[key];
            const guestData = JSON.parse(localStorage.getItem('licensify_guest_data')) || {};
            return guestData[key];
        }
    };

    function handlePostAuthRedirect() {
        const redirect = sessionStorage.getItem('auth_redirect');
        if (redirect) {
            sessionStorage.removeItem('auth_redirect');
            window.location.href = redirect;
            return true;
        }
        return false;
    }

    // FORM SUBMISSIONS
    forms.login.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailEl = document.getElementById('login-email');
        const passEl = document.getElementById('login-password');
        
        let isEmailValid = validateField(emailEl, () => emailEl.value.trim() !== '');
        if (isEmailValid) {
            isEmailValid = validateField(emailEl, () => checkEmailFormat(emailEl.value.trim()), "Please enter a valid email address.");
        }
        const isPassValid = validateField(passEl, () => passEl.value !== '');
        if (!isEmailValid || !isPassValid) return;

        const email = emailEl.value.trim();
        const pass = passEl.value;
        const users = JSON.parse(localStorage.getItem('licensify_users')) || [];
        const user = users.find(u => u.email === email && u.password === pass);

        if (user) {
            sessionStorage.setItem('licensify_current_user', JSON.stringify(user));
            showAlert(`Welcome back, ${user.fname}! Logging you in...`, 'success');
            updateNavbarForUser(user);
            setTimeout(() => {
                if (!handlePostAuthRedirect()) window.location.reload();
            }, 1000);
        } else {
            showAlert('Invalid email or password.');
        }
    });

    // Signup Step 1
    forms.signupStep1.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert();
        const emailEl = document.getElementById('signup-email');
        
        let isEmailValid = validateField(emailEl, () => emailEl.value.trim() !== '');
        if (isEmailValid) {
            isEmailValid = validateField(emailEl, () => checkEmailFormat(emailEl.value.trim()), "Please enter a valid email address.");
        }
        
        if (isEmailValid) {
            const email = emailEl.value.trim();
            const users = JSON.parse(localStorage.getItem('licensify_users')) || [];
            
            if (users.find(u => u.email === email)) {
                showAlert('An account with this email already exists.', 'error');
                return;
            }

            signupEmailPending = email;
            switchView('signup2');
        }
    });

    // Signup Step 2
    forms.signupStep2.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert();
        const fnameEl = document.getElementById('signup-fname');
        const lnameEl = document.getElementById('signup-lname');
        const passEl = document.getElementById('signup-password');
        const confEl = document.getElementById('signup-confirm');
        const termsEl = document.getElementById('signup-terms');

        const vFname = validateField(fnameEl, () => fnameEl.value.trim() !== '');
        const vLname = validateField(lnameEl, () => lnameEl.value.trim() !== '');
        const vPass = validateField(passEl, () => passEl.value !== '');
        const vConf = validateField(confEl, () => confEl.value !== '');
        const vTerms = validateField(termsEl, () => termsEl.checked);
        
        if (!vFname || !vLname || !vPass || !vConf || !vTerms) return;
        
        if (passEl.value !== confEl.value) {
            showAlert('Passwords do not match.', 'error');
            return;
        }

        // Send logic
        expectedVerifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[LICENSIFY DEMO] Signup code sent to ${signupEmailPending}: ${expectedVerifyCode}`);
        
        switchView('signup-verify');
        startTimer(120, document.getElementById('verify-timer'));
    });

    // Signup Verify
    forms.signupVerify.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert();
        const codeEl = document.getElementById('signup-verify-code');
        const vCode = validateField(codeEl, () => codeEl.value.trim() !== '');

        if (!vCode) return;

        if (codeEl.value.trim() === expectedVerifyCode) {
            const fname = document.getElementById('signup-fname').value.trim();
            const lname = document.getElementById('signup-lname').value.trim();
            const pass = document.getElementById('signup-password').value;
            
            const users = JSON.parse(localStorage.getItem('licensify_users')) || [];
            const newUser = { fname, lname, email: signupEmailPending, password: pass };
            users.push(newUser);
            localStorage.setItem('licensify_users', JSON.stringify(users));
            sessionStorage.setItem('licensify_current_user', JSON.stringify(newUser));

            showAlert('Account Created Successfully!', 'success');
            updateNavbarForUser(newUser);
            if (timerInterval) clearInterval(timerInterval);
            forms.signupVerify.querySelector('button[type="submit"]').disabled = true;

            setTimeout(() => {
                if (!handlePostAuthRedirect()) window.location.reload();
                forms.signupVerify.querySelector('button[type="submit"]').disabled = false;
            }, 1500);
        } else {
            showAlert('Invalid verification code.', 'error');
        }
    });

    // Forgot Password - Send Code
    forms.forgotEmail.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert();
        const emailEl = document.getElementById('forgot-email');
        let isEmailValid = validateField(emailEl, () => emailEl.value.trim() !== '');
        if (isEmailValid) {
            isEmailValid = validateField(emailEl, () => checkEmailFormat(emailEl.value.trim()), "Please enter a valid email address.");
        }
        
        if (!isEmailValid) return;

        signupEmailPending = emailEl.value.trim();
        expectedVerifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[LICENSIFY DEMO] Forgot Password code for ${signupEmailPending}: ${expectedVerifyCode}`);

        switchView('forgot-verify');
    });

    // Forgot Password - Verify Code
    forms.forgotVerify.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert();
        const codeEl = document.getElementById('forgot-verify-code');
        const vCode = validateField(codeEl, () => codeEl.value.trim() !== '');
        if (!vCode) return;

        if (codeEl.value.trim() === expectedVerifyCode) {
            switchView('forgot-reset');
        } else {
            showAlert('Invalid code.', 'error');
        }
    });

    // Forgot Password - Reset
    forms.forgotReset.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert();
        const newPassEl = document.getElementById('forgot-new-pass');
        const confPassEl = document.getElementById('forgot-confirm-pass');

        const vNew = validateField(newPassEl, () => newPassEl.value !== '');
        const vConf = validateField(confPassEl, () => confPassEl.value !== '');

        if (!vNew || !vConf) return;

        if (newPassEl.value !== confPassEl.value) {
            showAlert('Passwords do not match.', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('licensify_users')) || [];
        const userIndex = users.findIndex(u => u.email === signupEmailPending);

        if (userIndex !== -1) {
            users[userIndex].password = newPassEl.value;
            localStorage.setItem('licensify_users', JSON.stringify(users));
        }

        showAlert('Password reset successfully! Redirecting to login...', 'success');
        setTimeout(() => {
            switchView('login');
        }, 1500);
    });

    // Resend Code Logic
    document.querySelectorAll('.resend-code').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (btn.style.pointerEvents === 'none') return;
            
            // Generate new code
            expectedVerifyCode = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`[LICENSIFY DEMO] New Verification Code sent to ${signupEmailPending}: ${expectedVerifyCode}`);
            showAlert('A new code has been sent to your email.', 'success');

            // Disable for 60 seconds
            let timeLeft = 60;
            btn.style.pointerEvents = 'none';
            btn.style.color = '#cbd5e1';
            btn.style.textDecoration = 'none';
            btn.innerText = `Wait ${timeLeft}s`;
            
            if (resendTimerInterval) clearInterval(resendTimerInterval);
            resendTimerInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    clearInterval(resendTimerInterval);
                    if(btn.closest('.auth-form').classList.contains('active')) {
                        btn.style.pointerEvents = 'auto';
                        btn.style.color = '';
                        btn.style.textDecoration = '';
                        btn.innerText = 'Resend Code';
                    }
                } else {
                    btn.innerText = `Wait ${timeLeft}s`;
                }
            }, 1000);
        });
    });

});
