/**
 * Settings page logic
 */
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(sessionStorage.getItem('licensify_current_user'));
    if (!user) return;
    
    renderSettingsView();

    function renderSettingsView() {
        const container = document.getElementById('settings-content');
        if (!container) return;

        const profilePhoto = window.authApp.getUserData('profile_photo');

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
                            <input type="file" id="profile-photo-input" class="d-none" accept="image/*">
                        </div>
                        <h5 class="fw-bold text-dark-green mb-1 heading-font">${user.fname} ${user.lname}</h5>
                        <p class="text-muted smaller mb-3">${user.email}</p>
                        <span class="badge bg-light-green text-dark-green rounded-pill px-3 py-2 fw-medium">Verified Student</span>
                        
                        <div class="mt-4 pt-4 border-top text-start">
                            <p class="smaller text-muted mb-2 text-uppercase fw-bold opacity-50" style="letter-spacing: 1px;">Quick Actions</p>
                            <button class="btn btn-sm btn-light w-100 text-start py-2 mb-2 rounded-3 d-flex align-items-center gap-2">
                                <i class="bi bi-shield-lock text-dark-green"></i> 2FA Settings
                            </button>
                            <button class="btn btn-sm btn-light w-100 text-start py-2 rounded-3 d-flex align-items-center gap-2">
                                <i class="bi bi-download text-dark-green"></i> Export Data
                            </button>
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
                                    <input type="text" class="form-control rounded-3 py-2" value="${user.fname}">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label smaller fw-bold text-muted">Last Name</label>
                                    <input type="text" class="form-control rounded-3 py-2" value="${user.lname}">
                                </div>
                                <div class="col-12">
                                    <label class="form-label smaller fw-bold text-muted">Email Address</label>
                                    <input type="email" class="form-control rounded-3 py-2 bg-light" value="${user.email}" disabled>
                                    <div class="form-text smaller text-muted">Contact support to change your registered email.</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label smaller fw-bold text-muted">Phone Number</label>
                                    <input type="tel" class="form-control rounded-3 py-2" value="${user.phone || ''}" placeholder="+1 234 567 890">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label smaller fw-bold text-muted">Location</label>
                                    <select class="form-select rounded-3 py-2">
                                        <option selected>Main City Campus</option>
                                        <option>North Suburb Center</option>
                                        <option>West Side Facility</option>
                                    </select>
                                </div>
                                <div class="col-12 text-end mt-4">
                                    <button type="button" class="btn btn-dark-green rounded-pill px-4 py-2 fw-bold text-white shadow-sm" onclick="alert('Profile updated successfully!')">Save Changes</button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5 class="fw-bold text-dark-green mb-4 heading-font">Security</h5>
                        <form>
                            <div class="mb-3">
                                <label class="form-label smaller fw-bold text-muted">Current Password</label>
                                <input type="password" class="form-control rounded-3 py-2" placeholder="••••••••">
                            </div>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label smaller fw-bold text-muted">New Password</label>
                                    <input type="password" class="form-control rounded-3 py-2" placeholder="Enter new password">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label smaller fw-bold text-muted">Confirm New Password</label>
                                    <input type="password" class="form-control rounded-3 py-2" placeholder="Repeat new password">
                                </div>
                            </div>
                            <div class="text-end mt-4">
                                <button type="button" class="btn btn-outline-dark-green rounded-pill px-4 py-2 fw-bold" onclick="alert('Password updated successfully!')">Update Password</button>
                            </div>
                        </form>
                    </div>

                    <div class="card border-0 shadow-sm rounded-4 p-4">
                        <h5 class="fw-bold text-dark-green mb-4 heading-font">Notification Preferences</h5>
                        <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                            <div>
                                <h6 class="fw-bold mb-0">Email Notifications</h6>
                                <p class="text-muted smaller mb-0">Receive lesson reminders and updates via email.</p>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" checked>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                            <div>
                                <h6 class="fw-bold mb-0">SMS Alerts</h6>
                                <p class="text-muted smaller mb-0">Get urgent booking changes sent to your phone.</p>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox">
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <div>
                                <h6 class="fw-bold mb-0">Marketing News</h6>
                                <p class="text-muted smaller mb-0">Stay updated with new courses and discounts.</p>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" checked>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Handle Photo Upload Logic
        const changePhotoBtn = document.getElementById('change-photo-btn');
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
                confirmBtn.addEventListener('click', () => {
                    if (pendingDataUrl) {
                        imgContainer.innerHTML = `<img src="${pendingDataUrl}" class="w-100 h-100 object-fit-cover">`;
                        window.authApp.saveUserData('profile_photo', pendingDataUrl);
                        
                        // Immediate Navbar Update
                        window.authApp.updateNavbar();
                        
                        previewModal.hide();
                        
                        // Show Success Modal
                        const successModal = new bootstrap.Modal(document.getElementById('photoSuccessModal'));
                        successModal.show();
                    }
                });
            }
        }
    }
});
