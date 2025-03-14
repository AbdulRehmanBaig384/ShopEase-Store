// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordLink = document.getElementById('forgotPassword');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// Event Listeners
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isAdminLogin = document.getElementById('adminCheck').checked;
    
    try {
        showLoading();
        
        // Sign in with email and password
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check if admin login is selected
        if (isAdminLogin) {
            const isUserAdmin = await isAdmin(user);
            
            if (!isUserAdmin) {
                // Sign out if not admin
                await auth.signOut();
                hideLoading();
                showLoginError('You do not have admin privileges.');
                return;
            }
            
            // Redirect to admin dashboard
            window.location.href = 'admin.html';
        } else {
            // Redirect to products page
            window.location.href = 'products.html';
        }
    } catch (error) {
        hideLoading();
        console.error('Login error:', error);
        
        let errorMessage = 'Failed to login. Please check your credentials.';
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid email or password.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed login attempts. Please try again later.';
        }
        
        showLoginError(errorMessage);
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('termsCheck').checked;
    
    // Validate form
    if (password !== confirmPassword) {
        showRegisterError('Passwords do not match.');
        return;
    }
    
    if (password.length < 6) {
        showRegisterError('Password must be at least 6 characters long.');
        return;
    }
    
    if (!termsAccepted) {
        showRegisterError('You must accept the Terms and Conditions.');
        return;
    }
    
    try {
        showLoading();
        
        // Create user with email and password
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update user profile
        await user.updateProfile({
            displayName: fullName
        });
        
        // Save additional user data to Firestore
        await db.collection('users').doc(user.uid).set({
            fullName: fullName,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            isAdmin: false
        });
        
        // Redirect to products page
        window.location.href = 'products.html';
    } catch (error) {
        hideLoading();
        console.error('Registration error:', error);
        
        let errorMessage = 'Failed to register. Please try again.';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email is already in use.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak.';
        }
        
        showRegisterError(errorMessage);
    }
}

// Handle Forgot Password
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = prompt('Please enter your email address:');
    
    if (!email) return;
    
    try {
        showLoading();
        
        // Send password reset email
        await auth.sendPasswordResetEmail(email);
        
        hideLoading();
        showToast('Password reset email sent. Please check your inbox.', 'info');
    } catch (error) {
        hideLoading();
        console.error('Forgot password error:', error);
        
        let errorMessage = 'Failed to send password reset email.';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No user found with this email address.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        }
        
        showToast(errorMessage, 'danger');
    }
}

// Show Login Error
function showLoginError(message) {
    if (loginError) {
        loginError.textContent = message;
        loginError.classList.remove('d-none');
    }
}

// Show Register Error
function showRegisterError(message) {
    if (registerError) {
        registerError.textContent = message;
        registerError.classList.remove('d-none');
    }
}

// Check if user is already logged in
auth.onAuthStateChanged(user => {
    if (user) {
        // Check if on login or register page
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
            // Check if admin
            isAdmin(user).then(isUserAdmin => {
                if (isUserAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'products.html';
                }
            });
        }
    }
}); 