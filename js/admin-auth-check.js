const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminNameElement = document.getElementById('adminName');
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', handleAdminLogout);
}
async function handleAdminLogout(e) {
    e.preventDefault();   
    try {
        showLoading();
        await auth.signOut();
        window.location.href = 'login.html';
    } catch (error) {
        hideLoading();
        console.error('Admin logout error:', error);
        showToast('Failed to logout. Please try again.', 'danger');
    }
}
auth.onAuthStateChanged(async user => {
    if (user) {
        const isUserAdmin = await isAdmin(user);
        
        if (isUserAdmin) {
       
            if (adminNameElement) {
                adminNameElement.textContent = user.displayName || 'Admin';
            }
        } else {
            await auth.signOut();
            window.location.href = 'login.html';
        }
    } else {
        window.location.href = 'login.html';
    }
}); 
