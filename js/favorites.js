// DOM Elements
const loadingFavorites = document.getElementById('loadingFavorites');
const emptyFavorites = document.getElementById('emptyFavorites');
const favoritesList = document.getElementById('favoritesList');
const confirmRemoveFavorite = document.getElementById('confirmRemoveFavorite');
const removeFavoriteModal = document.getElementById('removeFavoriteModal');

// Variables
let currentUser = null;
let favorites = [];
let productToRemove = null;

// Event Listeners
if (confirmRemoveFavorite) {
    confirmRemoveFavorite.addEventListener('click', confirmRemoveFavoriteItem);
}

// Initialize
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        loadFavorites();
    } else {
        // If user is not logged in, redirect to login page
        window.location.href = 'login.html';
    }
});

// Add to favorites function
function addToFavorites(product) {
    // Check if user is logged in
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Get current favorites
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        // Check if product is already in favorites
        const existingProductIndex = favorites.findIndex(item => item.id === product.id);
        
        if (existingProductIndex === -1) {
            // Add new product to favorites
            favorites.push({
                ...product,
                isFavorite: true,
                addedAt: new Date().toISOString()
            });
            
            // Save to localStorage
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            // Show success message
            showToast('Product added to favorites!', 'success');
            
            // Update favorite icon if it exists
            const favoriteBtn = document.querySelector(`.favorite-btn[data-product-id="${product.id}"]`);
            if (favoriteBtn) {
                const icon = favoriteBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                }
            }
        } else {
            showToast('Product is already in favorites!', 'info');
        }
    } catch (error) {
        console.error('Error adding to favorites:', error);
        showToast('Failed to add product to favorites. Please try again.', 'danger');
    }
}

// Remove from favorites function
function removeFromFavorites(productId) {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        // Remove product
        favorites = favorites.filter(product => product.id !== productId);
        
        // Save to localStorage
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Remove product card
        const productCard = document.querySelector(`.col-md-4[data-product-id="${productId}"]`);
        if (productCard) {
            productCard.remove();
        }
        
        // Show success toast
        showToast('Product removed from favorites.', 'success');
        
        // Update favorite icon if it exists
        const favoriteBtn = document.querySelector(`.favorite-btn[data-product-id="${productId}"]`);
        if (favoriteBtn) {
            const icon = favoriteBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        }
        
        // Show empty message if no favorites left
        if (favorites.length === 0) {
            emptyFavorites.classList.remove('d-none');
            favoritesList.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error removing from favorites:', error);
        showToast('Failed to remove product from favorites. Please try again.', 'danger');
    }
}

// Toggle favorite status
function toggleFavorite(product) {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorite = favorites.some(item => item.id === product.id && item.isFavorite);

    if (isFavorite) {
        removeFromFavorites(product.id);
    } else {
        addToFavorites(product);
    }
}

// Load Favorites
function loadFavorites() {
    if (!loadingFavorites || !emptyFavorites || !favoritesList) return;
    
    try {
        // Show loading
        loadingFavorites.classList.remove('d-none');
        emptyFavorites.classList.add('d-none');
        favoritesList.innerHTML = '';
        
        // Get favorites from localStorage
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        // Only display valid favorites that have been explicitly added by the user
        const validFavorites = favorites.filter(favorite => 
            favorite && 
            favorite.id && 
            favorite.name && 
            favorite.price && 
            favorite.imageUrl &&
            favorite.isFavorite === true // Only show explicitly added favorites
        );
        
        if (validFavorites.length > 0) {
            // Render favorites
            renderFavorites(validFavorites);
            
            // Hide loading, show favorites
            loadingFavorites.classList.add('d-none');
            emptyFavorites.classList.add('d-none');
            favoritesList.classList.remove('d-none');
        } else {
            // Show empty favorites
            loadingFavorites.classList.add('d-none');
            emptyFavorites.classList.remove('d-none');
            favoritesList.classList.add('d-none');
            
            // Clear invalid favorites from localStorage
            localStorage.setItem('favorites', JSON.stringify([]));
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        showToast('Failed to load favorites. Please try again.', 'danger');
        
        // Show empty favorites
        loadingFavorites.classList.add('d-none');
        emptyFavorites.classList.remove('d-none');
        favoritesList.classList.add('d-none');
    }
}

// Render Favorites
function renderFavorites(favorites) {
    if (!favoritesList) return;
    
    // Clear container
    favoritesList.innerHTML = '';
    
    // Render favorites
    favorites.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'col-md-4 col-lg-3 mb-4';
        productCard.dataset.productId = product.id;
        
        productCard.innerHTML = `
            <div class="card product-card h-100">
                <button class="favorite-btn active" onclick="removeFromFavorites('${product.id}')" data-product-id="${product.id}">
                    <i class="fas fa-heart"></i>
                </button>
                <img src="${product.imageUrl}" class="card-img-top product-image" alt="${product.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title text-truncate">${product.name}</h5>
                    <p class="card-text text-truncate-2">${product.description || ''}</p>
                    <p class="card-text fw-bold">$${product.price.toFixed(2)}</p>
                </div>
                <div class="card-footer">
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary view-product-btn" data-product-id="${product.id}">
                            View Details
                        </button>
                        <button class="btn btn-outline-primary add-to-cart-btn" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus me-2"></i>Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        favoritesList.appendChild(productCard);
    });
    
    // Add event listeners
    addEventListeners();
}

// Add event listeners
function addEventListeners() {
    const viewButtons = document.querySelectorAll('.view-product-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product-id');
            window.location.href = `products.html?product=${productId}`;
        });
    });
    
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product-id');
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const product = favorites.find(p => p.id === productId);
            
            if (product) {
                addToCart(product);
            }
        });
    });
}

// Add to cart function
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex !== -1) {
        // Update quantity
        cart[existingProductIndex].quantity += 1;
    } else {
        // Add new product
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success toast
    showToast('Product added to cart successfully!', 'success');
}

// Update cart count function
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
        cartCount.classList.toggle('d-none', count === 0);
    }
}

// Show toast function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    const toastContainer = document.querySelector('.toast-container');
    if (toastContainer) {
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove toast after it's hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

// Confirm Remove Favorite Item
async function confirmRemoveFavoriteItem() {
    if (!productToRemove) return;
    
    try {
        showLoading();
        
        // Get favorites from localStorage
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        if (favorites.length > 0) {
            // Remove product from favorites
            favorites = favorites.filter(product => product.id !== productToRemove);
            
            // Save to localStorage
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(removeFavoriteModal);
            modal.hide();
            
            // Check if favorites is empty
            if (favorites.length === 0) {
                loadingFavorites.classList.add('d-none');
                emptyFavorites.classList.remove('d-none');
                favoritesList.innerHTML = '';
            } else {
                // Re-render favorites
                renderFavorites(favorites);
            }
            
            hideLoading();
            showToast('Product removed from favorites.', 'success');
        }
    } catch (error) {
        hideLoading();
        console.error('Error removing favorite:', error);
        showToast('Failed to remove product from favorites. Please try again.', 'danger');
    }
    
    // Reset product to remove
    productToRemove = null;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
    updateCartCount();
}); 