const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordLink = document.getElementById('forgotPassword');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}
if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
}

async function handleLogin(e) {
    e.preventDefault();    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isAdminLogin = document.getElementById('adminCheck').checked;
    
    try {
        showLoading();
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        if (isAdminLogin) {
            const isUserAdmin = await isAdmin(user);
            
            if (!isUserAdmin) {
                await auth.signOut();
                hideLoading();
                showLoginError('You do not have admin privileges.');
                return;
            }
            window.location.href = 'admin.html';
        } else {
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
async function handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('termsCheck').checked;
 
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
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        await user.updateProfile({
            displayName: fullName
        });
        await db.collection('users').doc(user.uid).set({
            fullName: fullName,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            isAdmin: false
        });
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
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = prompt('Please enter your email address:');
    
    if (!email) return;
    
    try {
        showLoading();
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
function showLoginError(message) {
    if (loginError) {
        loginError.textContent = message;
        loginError.classList.remove('d-none');
    }
}
function showRegisterError(message) {
    if (registerError) {
        registerError.textContent = message;
        registerError.classList.remove('d-none');
    }
}
auth.onAuthStateChanged(user => {
    if (user) {
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
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