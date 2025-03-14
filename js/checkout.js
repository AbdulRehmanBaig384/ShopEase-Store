// DOM Elements
const shippingForm = document.getElementById('shippingForm');
const paymentForm = document.getElementById('paymentForm');
const paymentCard = document.getElementById('paymentCard');
const confirmationCard = document.getElementById('confirmationCard');
const loadingOrderSummary = document.getElementById('loadingOrderSummary');
const orderItems = document.getElementById('orderItems');
const subtotalElement = document.getElementById('subtotal');
const discountElement = document.getElementById('discount');
const shippingElement = document.getElementById('shipping');
const totalElement = document.getElementById('total');
const orderNumber = document.getElementById('orderNumber');
const confirmationEmail = document.getElementById('confirmationEmail');

// Variables
let currentUser = null;
let cart = null;
let discount = 0;
const shippingCost = 5.99;

// Event Listeners
if (shippingForm) {
    shippingForm.addEventListener('submit', handleShippingSubmit);
}

if (paymentForm) {
    paymentForm.addEventListener('change', handlePaymentMethodChange);
    paymentForm.addEventListener('submit', handlePaymentSubmit);
}

// Initialize
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        loadOrderSummary();
    }
});

// Load Order Summary
async function loadOrderSummary() {
    if (!loadingOrderSummary || !orderItems) return;
    
    try {
        // Show loading
        loadingOrderSummary.classList.remove('d-none');
        
        // Get cart from Firestore
        const cartRef = db.collection('carts').doc(currentUser.uid);
        const cartSnapshot = await cartRef.get();
        
        if (cartSnapshot.exists) {
            cart = cartSnapshot.data();
            
            if (cart.items && cart.items.length > 0) {
                // Render order items
                renderOrderItems();
                
                // Calculate totals
                calculateTotals();
                
                // Hide loading
                loadingOrderSummary.classList.add('d-none');
            } else {
                // Redirect to cart page if cart is empty
                window.location.href = 'cart.html';
            }
        } else {
            // Redirect to cart page if cart is empty
            window.location.href = 'cart.html';
        }
    } catch (error) {
        console.error('Error loading order summary:', error);
        showToast('Failed to load order summary. Please try again.', 'danger');
        
        // Redirect to cart page
        window.location.href = 'cart.html';
    }
}

// Render Order Items
function renderOrderItems() {
    if (!orderItems) return;
    
    // Clear container
    orderItems.innerHTML = '';
    
    // Create order items list
    const orderItemsList = document.createElement('div');
    orderItemsList.className = 'list-group list-group-flush';
    
    // Render items
    cart.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        listItem.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-img rounded me-3" style="width: 50px; height: 50px;">
                <div>
                    <h6 class="mb-0">${item.name}</h6>
                    <small class="text-muted">Qty: ${item.quantity} x ${formatCurrency(item.price)}</small>
                </div>
            </div>
            <span>${formatCurrency(itemTotal)}</span>
        `;
        
        orderItemsList.appendChild(listItem);
    });
    
    // Append to order items
    orderItems.appendChild(orderItemsList);
}

// Calculate Totals
function calculateTotals() {
    if (!subtotalElement || !discountElement || !shippingElement || !totalElement) return;
    
    // Calculate subtotal
    const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Calculate discount amount
    const discountAmount = subtotal * discount;
    
    // Calculate total
    const total = subtotal - discountAmount + shippingCost;
    
    // Update elements
    subtotalElement.textContent = formatCurrency(subtotal);
    discountElement.textContent = `-${formatCurrency(discountAmount)}`;
    shippingElement.textContent = formatCurrency(shippingCost);
    totalElement.textContent = formatCurrency(total);
}

// Handle Shipping Submit
function handleShippingSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zipCode = document.getElementById('zipCode').value;
    const country = document.getElementById('country').value;
    const saveInfo = document.getElementById('saveInfo').checked;
    
    // Save shipping info to session storage
    const shippingInfo = {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        saveInfo
    };
    
    sessionStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
    
    // Show payment card
    if (paymentCard) {
        paymentCard.classList.remove('d-none');
    }
    
    // Scroll to payment card
    if (paymentCard) {
        paymentCard.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update checkout steps
    updateCheckoutSteps(2);
}

// Handle Payment Method Change
function handlePaymentMethodChange() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const creditCardForm = document.getElementById('creditCardForm');
    const paypalForm = document.getElementById('paypalForm');
    
    if (paymentMethod === 'creditCard') {
        creditCardForm.classList.remove('d-none');
        paypalForm.classList.add('d-none');
    } else if (paymentMethod === 'paypal') {
        creditCardForm.classList.add('d-none');
        paypalForm.classList.remove('d-none');
    }
}

// Handle Payment Submit
async function handlePaymentSubmit(e) {
    e.preventDefault();
    
    try {
        showLoading();
        
        // Get shipping info from session storage
        const shippingInfo = JSON.parse(sessionStorage.getItem('shippingInfo'));
        
        // Get payment method
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        // Get payment details
        let paymentDetails = {};
        
        if (paymentMethod === 'creditCard') {
            paymentDetails = {
                cardName: document.getElementById('cardName').value,
                cardNumber: document.getElementById('cardNumber').value,
                expiryDate: document.getElementById('expiryDate').value,
                cvv: document.getElementById('cvv').value
            };
        }
        
        // Calculate totals
        const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const discountAmount = subtotal * discount;
        const total = subtotal - discountAmount + shippingCost;
        
        // Create order
        const orderRef = db.collection('orders').doc();
        
        await orderRef.set({
            userId: currentUser.uid,
            items: cart.items,
            shippingInfo,
            paymentMethod,
            paymentDetails,
            subtotal,
            discount: discountAmount,
            shipping: shippingCost,
            total,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Clear cart
        await db.collection('carts').doc(currentUser.uid).update({
            items: [],
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update cart count
        updateCartCount(currentUser.uid);
        
        // Show confirmation
        if (confirmationCard) {
            confirmationCard.classList.remove('d-none');
        }
        
        // Hide payment card
        if (paymentCard) {
            paymentCard.classList.add('d-none');
        }
        
        // Update order number and email
        if (orderNumber) {
            orderNumber.textContent = orderRef.id;
        }
        
        if (confirmationEmail) {
            confirmationEmail.textContent = shippingInfo.email;
        }
        
        // Scroll to confirmation card
        if (confirmationCard) {
            confirmationCard.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Update checkout steps
        updateCheckoutSteps(3);
        
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('Error processing payment:', error);
        showToast('Failed to process payment. Please try again.', 'danger');
    }
}

// Update Checkout Steps
function updateCheckoutSteps(activeStep) {
    const steps = document.querySelectorAll('.step');
    
    if (!steps.length) return;
    
    steps.forEach((step, index) => {
        if (index + 1 === activeStep) {
            step.classList.add('active');
        } else if (index + 1 < activeStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
} 