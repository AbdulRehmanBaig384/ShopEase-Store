// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const userNameElement = document.getElementById('userName');
const cartCountElement = document.getElementById('cartCount');


if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

async function handleLogout(e) {
    e.preventDefault();
    
    try {
        showLoading();
        
        // Sign out
        await auth.signOut();
        
        // Redirect to login page
        window.location.href = 'login.html';
    } catch (error) {
        hideLoading();
        console.error('Logout error:', error);
        showToast('Failed to logout. Please try again.', 'danger');
    }
}

// Check if user is authenticated
auth.onAuthStateChanged(async user => {
    if (user) {
        // User is signed in
        if (userNameElement) {
            userNameElement.textContent = user.displayName || 'User';
        }
        
        // Update cart count
        updateCartCount(user.uid);
    } else {
        // User is signed out, redirect to login page
        window.location.href = 'login.html';
    }
});

// Update cart count
async function updateCartCount(userId) {
    if (!cartCountElement) return;
    
    try {
        const cartSnapshot = await db.collection('carts').doc(userId).get();
        
        if (cartSnapshot.exists) {
            const cartData = cartSnapshot.data();
            const cartItems = cartData.items || [];
            
            // Update cart count
            cartCountElement.textContent = cartItems.length;
            
            // Show cart count if there are items
            if (cartItems.length > 0) {
                cartCountElement.classList.remove('d-none');
            } else {
                cartCountElement.classList.add('d-none');
            }
        } else {
            // No cart exists yet
            cartCountElement.textContent = '0';
            cartCountElement.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
} 