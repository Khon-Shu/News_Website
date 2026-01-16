// Authentication JavaScript for Login and Register pages
const API_BASE = window.location.origin;

// Global state
const authState = {
    isLoading: false
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
    authState.isLoading = loading;
    const submitBtn = document.querySelector('.auth-btn');
    const btnText = document.getElementById('btnText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (loading) {
        submitBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (loadingSpinner) loadingSpinner.style.display = 'block';
    } else {
        submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Login functionality
async function handleLogin(event) {
    event.preventDefault();
    
    if (authState.isLoading) return;
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const isAdmin = document.getElementById('isAdmin').checked;
    
    // Validation
    if (!email) {
        showMessage('Please enter your email address');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address');
        return;
    }
    
    if (!password) {
        showMessage('Please enter your password');
        return;
    }
    
    setLoading(true);
    showMessage('', 'success'); // Clear messages
    
    try {
        const endpoint = isAdmin ? '/admin/api/login' : '/users/api/login';
        const response = await fetch(API_BASE + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.successful) {
            // Store user session
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('isAdmin', isAdmin);
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect based on user role
            setTimeout(() => {
                if (isAdmin) {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/';
                }
            }, 1500);
            
        } else {
            showMessage(data.message || 'Login failed. Please check your credentials.');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Network error. Please try again later.');
    } finally {
        setLoading(false);
    }
}

// Register functionality
async function handleRegister(event) {
    event.preventDefault();
    
    if (authState.isLoading) return;
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!username) {
        showMessage('Please enter a username');
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
    
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address');
        return;
    }
    
    if (!password) {
        showMessage('Please enter a password');
        return;
    }
    
    if (!validatePassword(password)) {
        showMessage('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match');
        return;
    }
    
    setLoading(true);
    showMessage('', 'success'); // Clear messages
    
    try {
        const response = await fetch(API_BASE + '/users/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.successful) {
            showMessage('Registration successful! Redirecting to login...', 'success');
            
            // Clear form
            document.getElementById('registerForm').reset();
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            
        } else {
            showMessage(data.message || 'Registration failed. Please try again.');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Network error. Please try again later.');
    } finally {
        setLoading(false);
    }
}

// Check if user is already logged in
function checkExistingSession() {
    const currentUser = localStorage.getItem('currentUser');
    const isAdmin = localStorage.getItem('isAdmin');
    
    if (currentUser) {
        showMessage('You are already logged in. Redirecting...', 'success');
        
        setTimeout(() => {
            if (isAdmin === 'true') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/';
            }
        }, 1500);
        
        return true;
    }
    
    return false;
}

// Password visibility toggle (optional enhancement)
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
}

// Form input enhancements
function enhanceFormInputs() {
    // Add real-time validation feedback
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            if (emailInput.value && !validateEmail(emailInput.value)) {
                emailInput.style.borderColor = '#e74c3c';
            } else {
                emailInput.style.borderColor = '';
            }
        });
    }
    
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value && !validatePassword(passwordInput.value)) {
                passwordInput.style.borderColor = '#f39c12';
            } else {
                passwordInput.style.borderColor = '';
            }
        });
    }
    
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
                confirmPasswordInput.style.borderColor = '#e74c3c';
            } else {
                confirmPasswordInput.style.borderColor = '';
            }
        });
    }
}

// Initialize page based on current page
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (checkExistingSession()) {
        return;
    }
    
    // Enhance form inputs
    enhanceFormInputs();
    
    // Determine which page we're on and set up appropriate handlers
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        
        // Add enter key support for form fields
        loginForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleLogin(e);
                }
            });
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Add enter key support for form fields
        registerForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleRegister(e);
                }
            });
        });
    }
    
    // Add some nice animations on load
    document.querySelector('.auth-card').style.animation = 'slideUp 0.5s ease';
});

// Handle browser back/forward navigation
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Page was restored from back/forward cache
        checkExistingSession();
    }
});
