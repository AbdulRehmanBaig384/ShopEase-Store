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
        await auth.signOut();
        window.location.href = 'login.html';
    } catch (error) {
        hideLoading();
        console.error('Logout error:', error);
        showToast('Failed to logout. Please try again.', 'danger');
    }
}
auth.onAuthStateChanged(async user => {
    if (user) {
        if (userNameElement) {
            userNameElement.textContent = user.displayName || 'User';
        }
  
        updateCartCount(user.uid);
    } else {
        window.location.href = 'login.html';
    }
});
async function updateCartCount(userId) {
    if (!cartCountElement) return;
    
    try {
        const cartSnapshot = await db.collection('carts').doc(userId).get();
        
        if (cartSnapshot.exists) {
            const cartData = cartSnapshot.data();
            const cartItems = cartData.items || [];
            cartCountElement.textContent = cartItems.length;
            if (cartItems.length > 0) {
                cartCountElement.classList.remove('d-none');
            } else {
                cartCountElement.classList.add('d-none');
            }
        } else {
            cartCountElement.textContent = '0';
            cartCountElement.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
} 