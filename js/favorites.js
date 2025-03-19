const loadingFavorites = document.getElementById('loadingFavorites');
const emptyFavorites = document.getElementById('emptyFavorites');
const favoritesList = document.getElementById('favoritesList');
const confirmRemoveFavorite = document.getElementById('confirmRemoveFavorite');
const removeFavoriteModal = document.getElementById('removeFavoriteModal');
let currentUser = null;
let favorites = [];
let productToRemove = null;
if (confirmRemoveFavorite) {
    confirmRemoveFavorite.addEventListener('click', confirmRemoveFavoriteItem);
}

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        loadFavorites();
    } else {
        window.location.href = 'login.html';
    }
});
function addToFavorites(product) {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    try {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const existingProductIndex = favorites.findIndex(item => item.id === product.id);
        if (existingProductIndex === -1) {
        
            favorites.push({
                ...product,
                isFavorite: true,
                addedAt: new Date().toISOString()
            });
            localStorage.setItem('favorites', JSON.stringify(favorites));
            showToast('Product added to favorites!', 'success');
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
function removeFromFavorites(productId) {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites = favorites.filter(product => product.id !== productId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        const productCard = document.querySelector(`.col-md-4[data-product-id="${productId}"]`);
        if (productCard) {
            productCard.remove();
        }
        showToast('Product removed from favorites.', 'success');
        const favoriteBtn = document.querySelector(`.favorite-btn[data-product-id="${productId}"]`);
        if (favoriteBtn) {
            const icon = favoriteBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        }
        if (favorites.length === 0) {
            emptyFavorites.classList.remove('d-none');
            favoritesList.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error removing from favorites:', error);
        showToast('Failed to remove product from favorites. Please try again.', 'danger');
    }
}
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
function loadFavorites() {
    if (!loadingFavorites || !emptyFavorites || !favoritesList) return;
    
    try {
        loadingFavorites.classList.remove('d-none');
        emptyFavorites.classList.add('d-none');
        favoritesList.innerHTML = '';
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const validFavorites = favorites.filter(favorite => 
            favorite && 
            favorite.id && 
            favorite.name && 
            favorite.price && 
            favorite.imageUrl &&
            favorite.isFavorite === true 
        );
        
        if (validFavorites.length > 0) {
            renderFavorites(validFavorites);
            loadingFavorites.classList.add('d-none');
            emptyFavorites.classList.add('d-none');
            favoritesList.classList.remove('d-none');
        } else {
            loadingFavorites.classList.add('d-none');
            emptyFavorites.classList.remove('d-none');
            favoritesList.classList.add('d-none');
            localStorage.setItem('favorites', JSON.stringify([]));
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        showToast('Failed to load favorites. Please try again.', 'danger');
        loadingFavorites.classList.add('d-none');
        emptyFavorites.classList.remove('d-none');
        favoritesList.classList.add('d-none');
    }
}
function renderFavorites(favorites) {
    if (!favoritesList) return;
    favoritesList.innerHTML = '';
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
    addEventListeners();
}
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
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Product added to cart successfully!', 'success');
}
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
        cartCount.classList.toggle('d-none', count === 0);
    }
}
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
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}
async function confirmRemoveFavoriteItem() {
    if (!productToRemove) return;
    
    try {
        showLoading();
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        if (favorites.length > 0) {
            favorites = favorites.filter(product => product.id !== productToRemove);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            const modal = bootstrap.Modal.getInstance(removeFavoriteModal);
            modal.hide();
            if (favorites.length === 0) {
                loadingFavorites.classList.add('d-none');
                emptyFavorites.classList.remove('d-none');
                favoritesList.innerHTML = '';
            } else {
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
    productToRemove = null;
}
document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
    updateCartCount();
}); 