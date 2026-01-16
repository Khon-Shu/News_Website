// Profile Management JavaScript
const API_BASE = window.location.origin;

// Global state
const profileState = {
    currentUser: null,
    isLoading: false,
    originalData: null
};

// Utility functions
function showMessage(message, type = 'error') {
    const errorEl = document.getElementById('errorMessage');
    const successEl = document.getElementById('successMessage');
    
    // Hide both messages first
    errorEl.style.display = 'none';
    successEl.style.display = 'none';
    
    if (type === 'error') {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    } else {
        successEl.textContent = message;
        successEl.style.display = 'block';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorEl.style.display = 'none';
        successEl.style.display = 'none';
    }, 5000);
}

function setLoading(loading) {
    profileState.isLoading = loading;
    const saveBtn = document.getElementById('saveBtn');
    const btnText = document.getElementById('btnText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (loading) {
        saveBtn.disabled = true;
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'block';
    } else {
        saveBtn.disabled = false;
        btnText.style.display = 'inline';
        loadingSpinner.style.display = 'none';
    }
}

// Check if user is logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        showMessage('Please login to access your profile', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return false;
    }
    
    profileState.currentUser = JSON.parse(currentUser);
    return true;
}

// Load user profile data
function loadProfileData() {
    const user = profileState.currentUser;
    
    if (!user) return;
    
    // Load form fields
    document.getElementById('username').value = user.username || '';
    document.getElementById('email').value = user.email || '';
    
    // Load avatar
    const avatarContainer = document.getElementById('avatarContainer');
    if (user.image) {
        avatarContainer.innerHTML = `<img src="${user.image}" alt="Profile" class="avatar-img">`;
    } else {
        avatarContainer.innerHTML = `<div class="avatar-placeholder">👤</div>`;
    }
    
    // Store original data for comparison
    profileState.originalData = {
        username: user.username || '',
        email: user.email || '',
        image: user.image || null
    };
}

// Handle profile image upload
function setupImageUpload() {
    const imageInput = document.getElementById('profileImage');
    const imagePreview = document.getElementById('imagePreview');
    
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            // Validate file
            if (!file.type.startsWith('image/')) {
                showMessage('Please select a valid image file');
                imageInput.value = '';
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB
                showMessage('Image size must be less than 5MB');
                imageInput.value = '';
                return;
            }
            
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewImg = imagePreview.querySelector('img');
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
        }
    });
}

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    if (profileState.isLoading) return;
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const imageFile = document.getElementById('profileImage').files[0];
    
    // Validation
    if (!username) {
        showMessage('Please enter your username');
        return;
    }
    
    if (username.length < 3) {
        showMessage('Username must be at least 3 characters long');
        return;
    }
    
    if (!email) {
        showMessage('Please enter your email address');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address');
        return;
    }
    
    // Check if anything changed
    const hasChanges = username !== profileState.originalData.username ||
                       email !== profileState.originalData.email ||
                       imageFile;
    
    if (!hasChanges) {
        showMessage('No changes to save', 'info');
        return;
    }
    
    setLoading(true);
    showMessage('', 'success'); // Clear messages
    
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        const userId = profileState.currentUser.id || profileState.currentUser._id;
        const response = await fetch(API_BASE + `/users/api/${userId}`, {
            method: 'PUT',
            body: formData // Don't set Content-Type header, let browser set it for FormData
        });
        
        const data = await response.json();
        
        if (response.ok && data.successful) {
            // Update localStorage with new user data
            const updatedUser = {
                ...profileState.currentUser,
                username: username,
                email: email,
                image: imageFile ? `/uploads/${imageFile.name}` : profileState.originalData.image
            };
            
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            profileState.currentUser = updatedUser;
            
            showMessage('Profile updated successfully!', 'success');
            
            // Reload profile data after a short delay
            setTimeout(() => {
                loadProfileData();
            }, 1000);
            
        } else {
            showMessage(data.message || 'Failed to update profile', 'error');
        }
        
    } catch (error) {
        console.error('Profile update error:', error);
        showMessage('Network error. Please try again later.', 'error');
    } finally {
        setLoading(false);
    }
}

// Handle password change
async function handlePasswordChange(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage('Please fill in all password fields');
        return;
    }
    
    if (newPassword.length < 6) {
        showMessage('New password must be at least 6 characters long');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match');
        return;
    }
    
    try {
        const response = await fetch(API_BASE + '/users/api/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                userId: profileState.currentUser.id || profileState.currentUser._id
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.successful) {
            showMessage('Password changed successfully!', 'success');
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            showMessage(data.message || 'Failed to change password', 'error');
        }
        
    } catch (error) {
        console.error('Password change error:', error);
        showMessage('Network error. Please try again later.', 'error');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!checkAuth()) return;
    
    // Load profile data
    loadProfileData();
    
    // Setup image upload
    setupImageUpload();
    
    // Setup form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Add nice animation on load
    document.querySelector('.profile-card').style.animation = 'slideUp 0.5s ease';
});

// Handle browser back/forward navigation
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Page was restored from back/forward cache
        if (checkAuth()) {
            loadProfileData();
        }
    }
});
