// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const loginPanel = document.getElementById('loginPanel');
const registerPanel = document.getElementById('registerPanel');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const passwordStrength = document.getElementById('passwordStrength');
const registerPassword = document.getElementById('registerPassword');
const confirmPassword = document.getElementById('confirmPassword');

function getApiBase() {
    const fromConfig = typeof window.API_BASE === 'string' ? window.API_BASE : '';
    if (fromConfig) return fromConfig.replace(/\/$/, '');
    return 'http://localhost:5000/api';
}

function saveAuthSession(token, user, rememberMe) {
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    storage.setItem('token', token);
    storage.setItem('authToken', token);
    if (user) storage.setItem('user', JSON.stringify(user));

    otherStorage.removeItem('token');
    otherStorage.removeItem('authToken');
    otherStorage.removeItem('user');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Show login panel by default
    showLoginPanel();
    
    // Add event listeners
    showRegisterBtn.addEventListener('click', showRegisterPanel);
    showLoginBtn.addEventListener('click', showLoginPanel);
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    registerPassword.addEventListener('input', checkPasswordStrength);
    confirmPassword.addEventListener('input', checkPasswordMatch);
    
    // Social login handlers
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', handleSocialLogin);
    });
});

// Panel Switching
function showLoginPanel() {
    loginPanel.style.display = 'flex';
    registerPanel.style.display = 'none';
    
    // Update active state
    showLoginBtn.classList.add('active');
    showRegisterBtn.classList.remove('active');
}

function showRegisterPanel() {
    loginPanel.style.display = 'none';
    registerPanel.style.display = 'flex';
    
    // Update active state
    showRegisterBtn.classList.add('active');
    showLoginBtn.classList.remove('active');
}

// Form Handlers
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    // Show loading
    const loginBtn = loginForm.querySelector('.auth-btn');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
    
    try {
        const response = await fetch(`${getApiBase()}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.message || 'Login failed');
        }

        if (!data?.token) {
            throw new Error('Login succeeded but token missing');
        }

        saveAuthSession(data.token, data.user || null, rememberMe);
        
        // Store login info
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('userEmail', email);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('userEmail');
        }
        
        showSuccess('Login successful! Redirecting to dashboard...');
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = '../admindashboard/admin.html';
        }, 2000);
        
    } catch (error) {
        showError(error.message || 'Login failed. Please check your credentials.');
    } finally {
        // Reset button
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPasswordValue = confirmPassword.value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validate
    if (!firstName || !lastName) {
        showError('Please enter your full name');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (!validatePhone(phone)) {
        showError('Please enter a valid phone number');
        return;
    }
    
    if (password.length < 8) {
        showError('Password must be at least 8 characters');
        return;
    }
    
    if (password !== confirmPasswordValue) {
        showError('Passwords do not match');
        return;
    }
    
    if (!agreeTerms) {
        showError('Please agree to the terms and conditions');
        return;
    }
    
    // Check password strength
    const strength = getPasswordStrength(password);
    if (strength.score < 2) {
        showError('Password is too weak. Please include uppercase, lowercase, numbers, and special characters');
        return;
    }
    
    // Show loading
    const registerBtn = registerForm.querySelector('.auth-btn');
    const originalText = registerBtn.innerHTML;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    registerBtn.disabled = true;
    
    try {
        // Simulate API call
        await simulateApiCall();
        
        showSuccess('Account created successfully! Please check your email to verify your account.');
        
        // Reset form
        registerForm.reset();
        passwordStrength.classList.remove('weak', 'medium', 'strong');
        
        // Switch to login panel after delay
        setTimeout(() => {
            showLoginPanel();
        }, 3000);
        
    } catch (error) {
        showError('Registration failed. Please try again.');
    } finally {
        // Reset button
        registerBtn.innerHTML = originalText;
        registerBtn.disabled = false;
    }
}

// Password Strength Checker
function checkPasswordStrength() {
    const password = registerPassword.value;
    const strength = getPasswordStrength(password);
    
    // Update UI
    const strengthFill = passwordStrength.querySelector('.strength-fill');
    const strengthText = passwordStrength.querySelector('.strength-text');
    
    passwordStrength.classList.remove('weak', 'medium', 'strong');
    strengthFill.style.width = '0%';
    
    if (password.length > 0) {
        passwordStrength.classList.add(strength.class);
        strengthFill.style.width = strength.percentage + '%';
        strengthText.textContent = strength.text;
        strengthText.style.color = strength.color;
    } else {
        strengthText.textContent = 'Password strength';
        strengthText.style.color = '#6b7280';
    }
}

function getPasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score++;
    else feedback.push('8+ characters');
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('uppercase');
    
    // Lowercase check
    if (/[a-z]/.test(password)) score++;
    else feedback.push('lowercase');
    
    // Numbers check
    if (/[0-9]/.test(password)) score++;
    else feedback.push('numbers');
    
    // Special characters check
    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('special characters');
    
    // Return strength object
    if (score <= 2) {
        return {
            score: score,
            class: 'weak',
            text: 'Weak password',
            percentage: 33,
            color: '#ef4444'
        };
    } else if (score <= 4) {
        return {
            score: score,
            class: 'medium',
            text: 'Medium password',
            percentage: 66,
            color: '#f59e0b'
        };
    } else {
        return {
            score: score,
            class: 'strong',
            text: 'Strong password',
            percentage: 100,
            color: '#10b981'
        };
    }
}

function checkPasswordMatch() {
    const password = registerPassword.value;
    const confirmValue = confirmPassword.value;
    
    if (confirmValue.length > 0) {
        if (password !== confirmValue) {
            confirmPassword.style.borderColor = '#ef4444';
        } else {
            confirmPassword.style.borderColor = '#10b981';
        }
    } else {
        confirmPassword.style.borderColor = '#e5e7eb';
    }
}

// Validation Functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.length >= 10;
}

// Social Login
function handleSocialLogin(e) {
    const provider = e.currentTarget.classList[1]; // google, facebook, github
    
    showSuccess(`Redirecting to ${provider} login...`);
    
    // Simulate social login
    setTimeout(() => {
        window.location.href = '../admindashboard/admin.html';
    }, 2000);
}

// Password Toggle
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Message Functions
function showSuccess(message) {
    successText.textContent = message;
    successMessage.classList.add('show');
}

function showError(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1001;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        animation: slideIn 0.3s ease;
    `;
    
    // Add close button styles
    errorDiv.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

function closeSuccess() {
    successMessage.classList.remove('show');
}

// Utility Functions
function simulateApiCall() {
    return new Promise((resolve) => {
        setTimeout(resolve, 1500);
    });
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .error-message i {
        font-size: 16px;
    }
`;
document.head.appendChild(style);

// Check for remembered user on load
window.addEventListener('load', function() {
    const rememberMe = localStorage.getItem('rememberMe');
    const userEmail = localStorage.getItem('userEmail');
    
    if (rememberMe === 'true' && userEmail) {
        document.getElementById('loginEmail').value = userEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

// Phone number formatting
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    // Format phone number (simple formatting)
    if (value.length > 0) {
        if (value.length <= 3) {
            value = value;
        } else if (value.length <= 6) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length <= 10) {
            value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
        } else {
            value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
        }
    }
    
    e.target.value = value;
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
