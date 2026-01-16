// Contact Form JavaScript
const API_BASE = window.location.origin;

// Global state
const contactState = {
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
    contactState.isLoading = loading;
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'block';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loadingSpinner.style.display = 'none';
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Character counter
function updateCharCounter() {
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    
    messageTextarea.addEventListener('input', () => {
        const currentLength = messageTextarea.value.length;
        charCount.textContent = currentLength;
        
        if (currentLength > 450) {
            charCount.style.color = '#e74c3c';
        } else if (currentLength > 400) {
            charCount.style.color = '#f39c12';
        } else {
            charCount.style.color = '#666';
        }
    });
}

// Handle contact form submission
async function handleContactSubmit(event) {
    event.preventDefault();
    
    if (contactState.isLoading) return;
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const type = document.getElementById('type').value;
    const message = document.getElementById('message').value.trim();
    
    // Validation
    if (!name) {
        showMessage('Please enter your name');
        return;
    }
    
    if (name.length < 2) {
        showMessage('Name must be at least 2 characters long');
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
    
    if (!type) {
        showMessage('Please select a feedback type');
        return;
    }
    
    if (!message) {
        showMessage('Please enter your message');
        return;
    }
    
    if (message.length < 10) {
        showMessage('Message must be at least 10 characters long');
        return;
    }
    
    setLoading(true);
    showMessage('', 'success'); // Clear messages
    
    try {
        // Check if user is logged in
        const currentUser = localStorage.getItem('currentUser');
        const userData = currentUser ? JSON.parse(currentUser) : null;
        
        const messageData = {
            name: name,
            email: email,
            message: message,
            type: type
        };
        
        // Add user ID if logged in
        if (userData) {
            messageData.user = userData.id || userData._id;
        }
        
        const response = await fetch(API_BASE + '/message/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.successful) {
            showMessage('Your message has been sent successfully! We\'ll get back to you soon.', 'success');
            
            // Clear form
            document.getElementById('contactForm').reset();
            document.getElementById('charCount').textContent = '0';
            
            // Redirect to home after 3 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
            
        } else {
            showMessage(data.message || 'Failed to send message. Please try again.');
        }
        
    } catch (error) {
        console.error('Contact form error:', error);
        showMessage('Network error. Please try again later.');
    } finally {
        setLoading(false);
    }
}

// Form input enhancements
function enhanceFormInputs() {
    // Add real-time validation feedback
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageTextarea = document.getElementById('message');
    
    if (nameInput) {
        nameInput.addEventListener('blur', () => {
            if (nameInput.value && nameInput.value.length < 2) {
                nameInput.style.borderColor = '#e74c3c';
            } else if (nameInput.value) {
                nameInput.style.borderColor = '#27ae60';
            } else {
                nameInput.style.borderColor = '';
            }
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            if (emailInput.value && !validateEmail(emailInput.value)) {
                emailInput.style.borderColor = '#e74c3c';
            } else if (emailInput.value) {
                emailInput.style.borderColor = '#27ae60';
            } else {
                emailInput.style.borderColor = '';
            }
        });
    }
    
    if (messageTextarea) {
        messageTextarea.addEventListener('blur', () => {
            if (messageTextarea.value && messageTextarea.value.length < 10) {
                messageTextarea.style.borderColor = '#e74c3c';
            } else if (messageTextarea.value) {
                messageTextarea.style.borderColor = '#27ae60';
            } else {
                messageTextarea.style.borderColor = '';
            }
        });
    }
}

// Check if user is logged in and pre-fill form
function prefillUserData() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        
        // Pre-fill name and email if available
        if (userData.username) {
            document.getElementById('name').value = userData.username;
        }
        
        if (userData.email) {
            document.getElementById('email').value = userData.email;
            // Make email read-only if logged in
            document.getElementById('email').readOnly = true;
            document.getElementById('email').style.background = 'rgba(102, 126, 234, 0.05)';
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Set up form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Initialize character counter
    updateCharCounter();
    
    // Enhance form inputs
    enhanceFormInputs();
    
    // Pre-fill user data if logged in
    prefillUserData();
    
    // Add enter key support for form fields
    contactForm.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                handleContactSubmit(e);
            }
        });
    });
    
    // Add nice animation on load
    document.querySelector('.contact-card').style.animation = 'slideUp 0.5s ease';
});

// Handle browser back/forward navigation
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Page was restored from back/forward cache
        prefillUserData();
    }
});
