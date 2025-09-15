
const totalElement = document.getElementById('total');
const couponCode = document.getElementById('couponCode');
const applyCoupon = document.getElementById('applyCoupon');
const couponMessage = document.getElementById('couponMessage');
const confirmRemove = document.getElementById('confirmRemove');
const removeItemModal = document.getElementById('removeItemModal');
const clearCartBtn = document.getElementById('clearCartBtn');

let cart = [];
let itemToRemove = null;
let discount = 0;
const shippingCost = 5.99;
if (applyCoupon) {
    applyCoupon.addEventListener('click', handleApplyCoupon);
}
if (confirmRemove) {
    confirmRemove.addEventListener('click', confirmRemoveItem);
}
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
}
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartCount();
});

function loadCart() {
    if (!loadingCart || !emptyCart || !cartItems) return;
    
    try {
  
        loadingCart.classList.remove('d-none');
        emptyCart.classList.add('d-none');
        cartItems.classList.add('d-none');
        
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length > 0) {
            renderCartItems();
            calculateTotals();

            loadingCart.classList.add('d-none');
            emptyCart.classList.add('d-none');
            cartItems.classList.remove('d-none');
        } else {
            loadingCart.classList.add('d-none');
            emptyCart.classList.remove('d-none');
            cartItems.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        showToast('Failed to load cart. Please try again.', 'danger');

        loadingCart.classList.add('d-none');
        emptyCart.classList.remove('d-none');
        cartItems.classList.add('d-none');
    }
} 
function renderCartItems() {
    if (!cartItemsList) return;
    cartItemsList.innerHTML = '';

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-img rounded me-3">
                    <div>
                        <h6 class="mb-0">${item.name}</h6>
                        <small class="text-muted">Added: ${new Date().toLocaleDateString()}</small>
                    </div>
                </div>
            </td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
                <div class="input-group input-group-sm" style="width: 120px;">
                    <button class="btn btn-outline-secondary decrease-quantity" type="button" data-index="${index}">-</button>
                    <input type="number" class="form-control text-center item-quantity" value="${item.quantity}" min="1" max="10" data-index="${index}">
                    <button class="btn btn-outline-secondary increase-quantity" type="button" data-index="${index}">+</button>
                </div>
            </td>
            <td>$${itemTotal.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}" data-bs-toggle="modal" data-bs-target="#removeItemModal">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        cartItemsList.appendChild(tr);
    });
    
    addEventListeners();
}

function addEventListeners() {
    const decreaseButtons = document.querySelectorAll('.decrease-quantity');
    const increaseButtons = document.querySelectorAll('.increase-quantity');
    const quantityInputs = document.querySelectorAll('.item-quantity');
    const removeButtons = document.querySelectorAll('.remove-item');
    
    decreaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            updateItemQuantity(index, cart[index].quantity - 1);
        });
    });
    
    increaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            updateItemQuantity(index, cart[index].quantity + 1);
        });
    });
    
    quantityInputs.forEach(input => {
        input.addEventListener('change', () => {
            const index = parseInt(input.getAttribute('data-index'));
            const quantity = parseInt(input.value) || 1;
            updateItemQuantity(index, quantity);
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            itemToRemove = index;
        });
    });
}
function updateItemQuantity(index, quantity) {
    if (quantity < 1) quantity = 1;
    if (quantity > 10) quantity = 10;
    
    try {
        cart[index].quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
   
        renderCartItems();
        calculateTotals();
        updateCartCount();
        
        showToast('Cart updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating quantity:', error);
        showToast('Failed to update quantity. Please try again.', 'danger');
    }
}
function confirmRemoveItem() {
    if (itemToRemove === null) return;
    
    try {
        cart.splice(itemToRemove, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        const modal = bootstrap.Modal.getInstance(removeItemModal);
        modal.hide();
  
        updateCartCount();
        if (cart.length === 0) {
            loadingCart.classList.add('d-none');
            emptyCart.classList.remove('d-none');
            cartItems.classList.add('d-none');
        } else {
            renderCartItems();
            calculateTotals();
        }
        
        showToast('Item removed from cart.', 'success');
    } catch (error) {
        console.error('Error removing item:', error);
        showToast('Failed to remove item. Please try again.', 'danger');
    }
    itemToRemove = null;
}
function handleApplyCoupon() {
    const code = couponCode.value.trim().toUpperCase();
    
    if (!code) {
        showCouponMessage('Please enter a coupon code.', 'warning');
        return;
    }
    if (code === 'WELCOME10') {
        discount = 0.1; 
        showCouponMessage('Coupon applied: 10% discount', 'success');
        calculateTotals();
    } else if (code === 'SAVE20') {
        discount = 0.2; 
        showCouponMessage('Coupon applied: 20% discount', 'success');
        calculateTotals();
    } else {
        discount = 0;
        showCouponMessage('Invalid coupon code.', 'danger');
        calculateTotals();
    }
}
function showCouponMessage(message, type) {
    if (!couponMessage) return;
    
    couponMessage.textContent = message;
    couponMessage.className = `alert alert-${type} mt-2`;
    couponMessage.classList.remove('d-none');
}
function calculateTotals() {
    if (!subtotalElement || !discountElement || !shippingElement || !totalElement) return;
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount + shippingCost;
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    discountElement.textContent = `-$${discountAmount.toFixed(2)}`;
    shippingElement.textContent = `$${shippingCost.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
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
    
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => {
        toastContainer.remove();
    });
}
function clearCart() {
    try {
        cart = [];
        
        localStorage.setItem('cart', JSON.stringify(cart));

        if (loadingCart && emptyCart && cartItems) {
            loadingCart.classList.add('d-none');
            emptyCart.classList.remove('d-none');
            cartItems.classList.add('d-none');
        }
        updateCartCount();
        
        showToast('Your cart has been cleared.', 'success');
    } catch (error) {
        console.error('Error clearing cart:', error);
        showToast('Failed to clear cart. Please try again.', 'danger');
    }
} 
