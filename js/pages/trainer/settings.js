/**
 * Trainer Settings Logic
 */
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(sessionStorage.getItem('licensify_current_user'));
    if (!user || user.role !== 'trainer') return;
    
    renderSettingsView();

    function renderSettingsView() {
        const container = document.getElementById('settings-content');
        if (!container) return;

        const profilePhoto = window.authApp.getUserData('profile_photo');
        const user = JSON.parse(sessionStorage.getItem('licensify_current_user'));

        container.innerHTML = `
            <div class="row g-4">
                <div class="col-lg-4 mb-4">
                    <div class="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <div class="position-relative d-inline-block mx-auto mb-3">
                            <div id="profile-img-container" class="bg-orange text-white rounded-circle d-flex align-items-center justify-content-center overflow-hidden" style="width: 120px; height: 120px; font-size: 3rem; font-weight: bold;">
                                ${profilePhoto ? `<img src="${profilePhoto}" class="w-100 h-100 object-fit-cover">` : user.fname.charAt(0).toUpperCase()}
                            </div>
                            <button id="change-photo-btn" class="btn btn-dark-green btn-sm rounded-circle position-absolute bottom-0 end-0 d-flex align-items-center justify-content-center shadow-lg border-2 border-white" style="width: 40px; height: 40px;" title="Change Photo">
                                <i class="bi bi-camera-fill text-white"></i>
                            </button>
                            ${profilePhoto ? `
                                <button id="delete-photo-btn" class="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 d-flex align-items-center justify-content-center shadow-lg border-2 border-white" style="width: 32px; height: 32px;" title="Delete Photo">
                                    <i class="bi bi-trash-fill text-white smaller"></i>
                                </button>
                            ` : ''}
                            <input type="file" id="profile-photo-input" class="d-none" accept="image/*">
                        </div>
                        <h5 class="fw-bold text-dark-green mb-1 heading-font">${user.fname} ${user.lname}</h5>
                        <p class="text-muted smaller mb-3">${user.email}</p>
                        <span class="badge bg-light-green text-dark-green rounded-pill px-3 py-2 fw-medium">Verified Instructor</span>
                        
                        <div class="mt-4 pt-4 border-top text-start">
                            <p class="smaller text-muted mb-2 text-uppercase fw-bold opacity-50" style="letter-spacing: 1px;">Shift Hours</p>
                            <div class="p-2 bg-light rounded-3 smaller text-dark-green fw-medium">
                                <i class="bi bi-clock-fill me-2"></i> 9:00 AM - 5:00 PM
                            </div>
                            <div class="p-2 bg-light rounded-3 smaller text-dark-green fw-medium mt-2">
                                <i class="bi bi-calendar-check-fill me-2"></i> Mon - Fri
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5 class="fw-bold text-dark-green mb-4 heading-font">Profile Information</h5>
                        <form id="settings-profile-form">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label smaller fw-bold text-muted">First Name</label>
                                    <input type="text" id="settings-fname" class="form-control rounded-3 py-2" value="${user.fname}">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label smaller fw-bold text-muted">Last Name</label>
                                    <input type="text" id="settings-lname" class="form-control rounded-3 py-2" value="${user.lname}">
                                </div>
                                <div class="col-12">
                                    <label class="form-label smaller fw-bold text-muted">Email Address</label>
                                    <input type="email" class="form-control rounded-3 py-2 bg-light" value="${user.email}" disabled>
                                    <div class="form-text smaller text-muted">Trainer emails are managed by administration.</div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label smaller fw-bold text-muted">Phone Number</label>
                                    <input type="tel" id="settings-phone" class="form-control rounded-3 py-2" value="${user.phone || ''}" placeholder="+1 234 567 890">
                                </div>
                                <div class="col-12 text-end mt-4">
                                    <button type="button" class="btn btn-dark-green rounded-pill px-4 py-2 fw-bold text-white shadow-sm" id="save-profile-btn">Save Changes</button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5 class="fw-bold text-dark-green mb-4 heading-font">Security</h5>
                        <form>
                            <div class="mb-3">
                                <label class="form-label smaller fw-bold text-muted">Current Password</label>
                                <input type="password" id="settings-current-pass" class="form-control rounded-3 py-2" placeholder="••••••••">
                            </div>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label smaller fw-bold text-muted">New Password</label>
                                    <input type="password" id="settings-new-pass" class="form-control rounded-3 py-2" placeholder="Enter new password">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label smaller fw-bold text-muted">Confirm New Password</label>
                                    <input type="password" id="settings-confirm-pass" class="form-control rounded-3 py-2" placeholder="Repeat new password">
                                </div>
                            </div>
                            <div class="text-end mt-4">
                                <button type="button" class="btn btn-dark-green rounded-pill px-4 py-2 fw-bold text-white shadow-sm" id="update-password-btn">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Handle Photo Upload Logic
        const changePhotoBtn = document.getElementById('change-photo-btn');
        const deletePhotoBtn = document.getElementById('delete-photo-btn');
        const photoInput = document.getElementById('profile-photo-input');
        const imgContainer = document.getElementById('profile-img-container');

        if (changePhotoBtn && photoInput) {
            const previewModal = new bootstrap.Modal(document.getElementById('photoPreviewModal'));
            const previewImg = document.getElementById('preview-photo-img');
            const confirmBtn = document.getElementById('confirm-photo-btn');
            let pendingDataUrl = '';

            changePhotoBtn.addEventListener('click', () => photoInput.click());

            photoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        pendingDataUrl = event.target.result;
                        previewImg.src = pendingDataUrl;
                        previewModal.show();
                    };
                    reader.readAsDataURL(file);
                }
            });

            if (confirmBtn) {
                confirmBtn.onclick = () => {
                    if (pendingDataUrl) {
                        imgContainer.innerHTML = `<img src="${pendingDataUrl}" class="w-100 h-100 object-fit-cover">`;
                        window.authApp.saveUserData('profile_photo', pendingDataUrl);
                        window.authApp.updateNavbar();
                        previewModal.hide();
                        const successModal = new bootstrap.Modal(document.getElementById('photoSuccessModal'));
                        successModal.show();
                        
                        setTimeout(() => renderSettingsView(), 500);
                    }
                };
            }
        }

        // Handle Delete Photo
        if (deletePhotoBtn) {
            deletePhotoBtn.addEventListener('click', () => {
                const deleteModal = new bootstrap.Modal(document.getElementById('photoDeleteModal'));
                const confirmDeleteBtn = document.getElementById('confirm-delete-photo-btn');
                
                deleteModal.show();

                confirmDeleteBtn.onclick = () => {
                    window.authApp.saveUserData('profile_photo', null);
                    window.authApp.updateNavbar();
                    
                    deleteModal.hide();
                    
                    const successModal = new bootstrap.Modal(document.getElementById('photoSuccessModal'));
                    document.querySelector('#photoSuccessModal .modal-body p').textContent = 'Your profile photo has been removed.';
                    successModal.show();

                    renderSettingsView();
                };
            });
        }

        // Helper to show error modal
        function showError(title, msg) {
            const errorModal = new bootstrap.Modal(document.getElementById('settingsErrorModal'));
            document.getElementById('settings-error-title').textContent = title;
            document.getElementById('settings-error-msg').textContent = msg;
            errorModal.show();
        }

        // Real-time Validation Logic
        const fnameInput = document.getElementById('settings-fname');
        const lnameInput = document.getElementById('settings-lname');
        const phoneInput = document.getElementById('settings-phone');
        const currentPassInput = document.getElementById('settings-current-pass');
        const newPassInput = document.getElementById('settings-new-pass');
        const confirmPassInput = document.getElementById('settings-confirm-pass');

        const nameRegex = /^[a-zA-Z\s]+$/;
        const phoneRegex = /^[0-9\+\-\s\(\)]+$/;
        const strongPassRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        const validateName = (input) => {
            if (input.value && !nameRegex.test(input.value)) {
                input.classList.add('is-invalid-custom');
                return false;
            } else {
                input.classList.remove('is-invalid-custom');
                return true;
            }
        };

        const validatePhone = (input) => {
            if (input.value && !phoneRegex.test(input.value)) {
                input.classList.add('is-invalid-custom');
                return false;
            } else {
                input.classList.remove('is-invalid-custom');
                return true;
            }
        };

        const validatePass = (input) => {
            if (input.value && !strongPassRegex.test(input.value)) {
                input.classList.add('is-invalid-custom');
                return false;
            } else {
                input.classList.remove('is-invalid-custom');
                return true;
            }
        };

        const validateConfirm = (input, original) => {
            if (input.value && input.value !== original.value) {
                input.classList.add('is-invalid-custom');
                return false;
            } else {
                input.classList.remove('is-invalid-custom');
                return true;
            }
        };

        if (currentPassInput) currentPassInput.addEventListener('input', () => {
            if (currentPassInput.value) currentPassInput.classList.remove('is-invalid-custom');
        });
        if (fnameInput) fnameInput.addEventListener('input', () => validateName(fnameInput));
        if (lnameInput) lnameInput.addEventListener('input', () => validateName(lnameInput));
        if (phoneInput) phoneInput.addEventListener('input', () => validatePhone(phoneInput));
        if (newPassInput) newPassInput.addEventListener('input', () => validatePass(newPassInput));
        if (confirmPassInput) confirmPassInput.addEventListener('input', () => validateConfirm(confirmPassInput, newPassInput));

        // Handle Profile Save
        const saveProfileBtn = document.getElementById('save-profile-btn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                const user = JSON.parse(sessionStorage.getItem('licensify_current_user'));
                const fname = fnameInput.value.trim();
                const lname = lnameInput.value.trim();
                const phone = phoneInput.value.trim();
                
                if (!validateName(fnameInput)) {
                    showError('Invalid Name', 'First name should not contain numbers.');
                    return;
                }
                if (!validateName(lnameInput)) {
                    showError('Invalid Name', 'Last name should not contain numbers.');
                    return;
                }
                if (phone && !validatePhone(phoneInput)) {
                    showError('Invalid Phone', 'Please enter a valid phone number.');
                    return;
                }

                // Update Logic
                user.fname = fname;
                user.lname = lname;
                user.phone = phone;
                sessionStorage.setItem('licensify_current_user', JSON.stringify(user));

                const users = JSON.parse(localStorage.getItem('licensify_users')) || [];
                const uIndex = users.findIndex(u => u.email === user.email);
                if (uIndex !== -1) {
                    users[uIndex].fname = fname;
                    users[uIndex].lname = lname;
                    users[uIndex].phone = phone;
                    localStorage.setItem('licensify_users', JSON.stringify(users));
                }

                window.authApp.updateNavbar();
                const successModal = new bootstrap.Modal(document.getElementById('settingsSuccessModal'));
                document.getElementById('settings-success-title').textContent = 'Profile Updated!';
                document.getElementById('settings-success-msg').textContent = 'Your profile information has been successfully updated.';
                successModal.show();
                
                setTimeout(() => renderSettingsView(), 500);
            });
        }

        // Handle Password Update
        const updatePasswordBtn = document.getElementById('update-password-btn');
        if (updatePasswordBtn) {
            updatePasswordBtn.addEventListener('click', () => {
                const user = JSON.parse(sessionStorage.getItem('licensify_current_user'));
                const currentPass = currentPassInput ? currentPassInput.value : '';
                const newPass = newPassInput.value;
                const confirmPass = confirmPassInput.value;

                if (!currentPass || !newPass || !confirmPass) {
                    showError('Empty Fields', 'Please fill in all password fields.');
                    return;
                }

                if (currentPass !== user.password) {
                    showError('Incorrect Password', 'The current password you entered is incorrect.');
                    return;
                }

                if (!validatePass(newPassInput)) {
                    showError('Weak Password', 'Password must be at least 8 characters with a mix of cases, numbers, and symbols.');
                    return;
                }

                if (!validateConfirm(confirmPassInput, newPassInput)) {
                    showError('Mismatch', 'New passwords do not match.');
                    return;
                }

                user.password = newPass;
                sessionStorage.setItem('licensify_current_user', JSON.stringify(user));
                const users = JSON.parse(localStorage.getItem('licensify_users')) || [];
                const uIndex = users.findIndex(u => u.email === user.email);
                if (uIndex !== -1) {
                    users[uIndex].password = newPass;
                    localStorage.setItem('licensify_users', JSON.stringify(users));
                }

                const successModal = new bootstrap.Modal(document.getElementById('settingsSuccessModal'));
                document.getElementById('settings-success-title').textContent = 'Password Changed!';
                document.getElementById('settings-success-msg').textContent = 'Your password has been successfully updated.';
                successModal.show();
                
                currentPassInput.value = '';
                newPassInput.value = '';
                confirmPassInput.value = '';
            });
        }
    }
});
