const productsContainer = document.getElementById('productsContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const sortFilter = document.getElementById('sortFilter');
const resetFiltersBtn = document.getElementById('resetFilters');
const paginationContainer = document.getElementById('pagination');
const productModal = document.getElementById('productModal');
const modalProductTitle = document.getElementById('modalProductTitle');
const modalProductImage = document.getElementById('modalProductImage');
const modalProductPrice = document.getElementById('modalProductPrice');
const modalProductDescription = document.getElementById('modalProductDescription');
const modalQuantity = document.getElementById('modalQuantity');
const modalAddToCart = document.getElementById('modalAddToCart');
const modalAddToFavorites = document.getElementById('modalAddToFavorites');
const cartToast = document.getElementById('cartToast');

let currentUser = null;
let products = [];
let filteredProducts = [];
let currentProduct = null;
let currentPage = 1;
const productsPerPage = 12;
if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
}
if (searchInput) {
    searchInput.addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            handleSearch();}
    });
}
if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
}
if (priceFilter) {
    priceFilter.addEventListener('change', applyFilters);
}
if (sortFilter) {
    sortFilter.addEventListener('change', applyFilters);
}
if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetFilters);
}

if (modalAddToCart) {
    modalAddToCart.addEventListener('click', addToCart);
}
if (modalAddToFavorites) {
    modalAddToFavorites.addEventListener('click', toggleFavorite);
}
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        setupHardcodedProducts();
        if (localStorage.getItem('favorites_cleaned') !== 'true') {
            localStorage.setItem('favorites', JSON.stringify([]));
            localStorage.setItem('favorites_cleaned', 'true');
            console.log('Favorites reset: Only items you explicitly add to favorites will appear here.');
        }
    }
});
function setupHardcodedProducts() {
    console.log('Setting up hardcoded products');
    products = [
        {
            id: '1',
            name: 'Black Tracksuit side lion face',
            description: 'Black Tracksuit side lion face printed summer track Men\'s Clothing Summer Breathable T-Shirt and Black Shorts Gym wear and comfortable',
            price: 300.00,
            imageUrl: 'images/pubgshirts.avif',
            category: 'fashion',
            stock: 45,
            status: 'published',
            isFavorite: false
        },
        {
            id: '2',
            name: 'Plain Black T-Shirt For Men',
            description: 'Plain White T-Shirt for men- Half Sleeve/Round Neck With Premium Excellent Quality Plan Basic T-Shirts For Boy\'s & Men\'s. Its a awesome Product',
            price: 125.00,
            imageUrl: 'images/tshirt4.avif',
            category: 'fashion',
            stock: 50,
            status: 'published',
            isFavorite: false
        },
        {
            id: '3',
            name: 'Party Track suits T-shirt & Trouser',
            description: 'This Party Track suits T-shirt & Trouser For Men is a perfect blend of sport and street style. The stripe pattern adds a touch of uniqueness to the outfit.',
            price: 220.00,
            imageUrl: 'images/tshirt3.avif',
            category: 'fashion',
            stock: 30,
            status: 'published',
            isFavorite: false
        },
        {
            id: '4',
            name: 'Samsung Galaxy S25 Ultra',
            description: 'Samsung Galaxy S25 Ultra 12 GB RAM + 512 GB ROM. Display 6.9" Dynamic AMOLED 2x QHD+, Performance 7 Years OS & Security upgrade',
            price: 6000.00,
            imageUrl: 'images/sumsung.avif',
            category: 'electronics',
            stock: 15,
            status: 'published',
            isFavorite: false
        },
        {
            id: '5',
            name: 'Apple Iphone 16 Pro Max',
            description: 'Apple Iphone 16 Pro Max - 6.9" Inch Display - Factory locked - 1 Year Official Warranty. High Contrast Ratio: 2,000,000:1 for deep blacks and bright whites.',
            price: 6500.00,
            imageUrl: 'images/iphone1.avif',
            category: 'electronics',
            stock: 10,
            status: 'published',
            isFavorite: false
        },
        {
            id: '6',
            name: 'Apple IPhone 12 Pro Max',
            description: 'Apple IPhone 12 Pro Max - 256GB - PTA APPROVED - Brand New Condition - 85+ Battery Health - (WITH FREE CHARGER & COVER) - like new phones',
            price: 3500.00,
            imageUrl: 'images/iphone2.avif',
            category: 'electronics',
            stock: 20,
            status: 'published',
            isFavorite: false
        },
        {
            id: '7',
            name: 'Airpods Air Pro',
            description: 'Airpods Air Pro 3rd Gen TWS (True Wireless Stereo) Bluetooth Earbuds Dual Earphones Headset (Connect With All Bluetooth Devices). BLUETOOTH handfree',
            price: 200.00,
            imageUrl: 'images/earbuds1.avif',
            category: 'electronics',
            stock: 35,
            status: 'published',
            isFavorite: false
        },
        {
            id: '8',
            name: 'Airpods_Pro Wireless',
            description: 'Airpods_Pro Wireless Earbuds Bluetooth 5.0 Compatible with IOS and Android. Battery capacity of the storage box: 2000MAH 8. Transmission distance: > 10M.',
            price: 270.00,
            imageUrl: 'images/earbuds2.avif',
            category: 'electronics',
            stock: 25,
            status: 'published',
            isFavorite: false
        },
        {
            id: '9',
            name: 'Original AirPod Pro',
            description: 'Original AirPod Pro (2nd Generation) Headset Wireless Bluetooth Connection-Durable Top Quality ANC Active Noise Cancellation Airbuds.',
            price: 250.00,
            imageUrl: 'images/airpods3.jpg',
            category: 'electronics',
            stock: 18,
            status: 'published',
            isFavorite: false
        },
        // New products (10-18)
        {
            id: '10',
            name: 'Ultra-Slim Performance Laptop',
            description: '15.6" FHD Display, 12th Gen Intel Core i7, 16GB RAM, 1TB SSD, NVIDIA GeForce RTX 3060, Windows 11 Pro - Perfect for work and gaming.',
            price: 1299.99,
            imageUrl: 'images/laptop1.jpg',
            category: 'electronics',
            stock: 12,
            status: 'published',
            isFavorite: false
        },
        {
            id: '11',
            name: 'Smart Health Watch Pro',
            description: 'Advanced fitness tracker with heart rate monitoring, ECG, GPS, sleep tracking, 7-day battery life, and water resistance up to 50 meters.',
            price: 249.99,
            imageUrl: 'images/smartwatch1.avif',
            category: 'electronics',
            stock: 30,
            status: 'published',
            isFavorite: false
        },
        {
            id: '12',
            name: 'Premium Noise Cancelling Headphones',
            description: 'Studio-quality sound with advanced noise cancellation, 30-hour battery life, comfortable over-ear design, and multipoint Bluetooth connection.',
            price: 329.99,
            imageUrl: 'images/noiseheadphone.jpeg',
            category: 'electronics',
            stock: 22,
            status: 'published',
            isFavorite: false
        },
        {
            id: '13',
            name: 'Ultra Comfort Running Shoes',
            description: 'Lightweight athletic sneakers with responsive cushioning, breathable mesh upper, and durable rubber outsole. Perfect for running and everyday wear.',
            price: 129.99,
            imageUrl: 'images/sneakers.webp',
            category: 'fashion',
            stock: 40,
            status: 'published',
            isFavorite: false
        },
        {
            id: '14',
            name: 'Professional Digital Camera',
            description: '24.2MP full-frame sensor, 4K video recording, 5-axis image stabilization, weather-sealed body, and dual SD card slots for professional photography.',
            price: 1899.99,
            imageUrl: 'images/camera.jpg',
            category: 'electronics',
            stock: 8,
            status: 'published',
            isFavorite: false
        },
        {
            id: '15',
            name: 'Smart Home Speaker System',
            description: 'Voice-controlled smart speaker with premium sound, built-in virtual assistant, multi-room audio support, and smart home device integration.',
            price: 199.99,
            imageUrl: 'images/homespeaker.avif',
            category: 'electronics',
            stock: 25,
            status: 'published',
            isFavorite: false
        },
        {
            id: '16',
            name: 'Premium Travel Backpack',
            description: 'Durable 40L travel backpack with laptop compartment, anti-theft features, USB charging port, water-resistant material, and comfortable padded straps.',
            price: 89.99,
            imageUrl: 'images/priemier.avif',
            category: 'fashion',
            stock: 35,
            status: 'published',
            isFavorite: false
        },
        {
            id: '17',
            name: 'HP M27f Monitor 27" IPS LED FHD',
            description: '11-inch Liquid Retina display, powerful chipset, 256GB storage, all-day battery life, and support for stylus input. Perfect for productivity and entertainment.',
            price: 649.99,
            imageUrl: 'images/monitor.jpg',
            category: 'electronics',
            stock: 15,
            status: 'published',
            isFavorite: false
        },
        {
            id: '18',
            name: 'AOC 24G4 23.8" IPS Gaming Monitor',
            description: '4K camera with 3-axis gimbal, 30-minute flight time, 7km transmission range, obstacle avoidance, intelligent flight modes, and compact foldable design.',
            price: 799.99,
            imageUrl: 'images/gaming.jpg',
            category: 'electronics',
            stock: 10,
            status: 'published',
            isFavorite: false
        },
        // Home & Living Products (19-21)
        {
            id: '19',
            name: 'Modern L-Shaped Sectional Sofa',
            description: 'Elegant contemporary sectional sofa with chaise lounge, premium fabric upholstery, sturdy wooden frame, and comfortable high-density foam cushions.',
            price: 1299.99,
            imageUrl: 'images/sofa1.avif',
            category: 'home',
            stock: 5,
            status: 'published',
            isFavorite: false
        },
        {
            id: '20',
            name: 'Smart LED Floor Lamp',
            description: 'Wi-Fi enabled floor lamp with adjustable brightness, color temperature control, voice assistant compatibility, scheduling features, and modern minimalist design.',
            price: 149.99,
            imageUrl: 'images/lamp1.avif',
            category: 'home',
            stock: 20,
            status: 'published',
            isFavorite: false
        },
        {
            id: '21',
            name: 'Premium Cotton Bedding Set',
            description: 'Luxury 100% Egyptian cotton 1000 thread count bedding set including duvet cover, fitted sheet, flat sheet, and 4 pillowcases with elegant embroidered details.',
            price: 189.99,
            imageUrl: 'images/bedsheet.avif',
            category: 'home',
            stock: 15,
            status: 'published',
            isFavorite: false
        }
    ];
    updateFavoriteStatus();
    setupEventListeners();
}
function setupEventListeners() {
    const viewButtons = document.querySelectorAll('.view-product-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product-id');
            openProductModal(productId);
        });
    });
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product-id');
            addToCartDirect(productId, 1);
        });
    });
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product-id');
            toggleFavoriteDirect(productId, btn);
        });
    });
    setupFilters();
}
function updateFavoriteStatus() {
    const favoritesList = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteIds = favoritesList.map(item => item.id);
    products.forEach(product => {
        product.isFavorite = favoriteIds.includes(product.id);
    });
}
function setupFilters() {
    filteredProducts = [...products];
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', e => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            applyFilters();
        });
    }

    if (priceFilter) {
        priceFilter.addEventListener('change', () => {
            applyFilters();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            applyFilters();
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
}
function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const category = categoryFilter ? categoryFilter.value : '';
    const priceRange = priceFilter ? priceFilter.value : '';
    const sortBy = sortFilter ? sortFilter.value : 'default';
    const productCards = document.querySelectorAll('#productsContainer > div[data-product-id]');
    productCards.forEach(card => {
        card.style.display = 'none';
    });
    filteredProducts = products.filter(product => {
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm) && 
            !product.description.toLowerCase().includes(searchTerm)) {
            return false;
        }
        if (category && product.category !== category) {
            return false;
        }
        if (priceRange) {
            const [min, max] = priceRange.split('-');
            
            if (min && max) {
                if (product.price < parseFloat(min) || product.price > parseFloat(max)) {
                    return false;
                }
            } else if (min) {
                if (product.price < parseFloat(min)) {
                    return false;
                }
            }
        }
        
        return true;
    });
    if (sortBy !== 'default') {
        const [field, direction] = sortBy.split('-');
        
        filteredProducts.sort((a, b) => {
            if (field === 'price') {
                return direction === 'asc' ? a.price - b.price : b.price - a.price;
            } else if (field === 'name') {
                return direction === 'asc' ? 
                    a.name.localeCompare(b.name) : 
                    b.name.localeCompare(a.name);
            }
            
            return 0;
        });
    }
    filteredProducts.forEach(product => {
        const productCard = document.querySelector(`#productsContainer > div[data-product-id="${product.id}"]`);
        if (productCard) {
            productCard.style.display = 'block';
        }
    });
    if (filteredProducts.length === 0) {
        const productsContainer = document.getElementById('productsContainer');
        const noProductsMessage = document.createElement('div');
        noProductsMessage.className = 'col-12 text-center py-5';
        noProductsMessage.id = 'noProductsMessage';
        noProductsMessage.innerHTML = `
            <i class="fas fa-search fa-3x mb-3 text-muted"></i>
            <h4>No products found</h4>
            <p>Try adjusting your search or filter criteria.</p>
            <button class="btn btn-primary mt-3" id="clearFiltersBtn">Clear Filters</button>
        `;
        const existingMessage = document.getElementById('noProductsMessage');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        productsContainer.appendChild(noProductsMessage);
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', resetFilters);
        }
    } else {
        const noProductsMessage = document.getElementById('noProductsMessage');
        if (noProductsMessage) {
            noProductsMessage.remove();
        }
    }
}
function handleSearch() {
    applyFilters();
}
function resetFilters() {
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    if (sortFilter) sortFilter.value = 'default';
    const productCards = document.querySelectorAll('#productsContainer > div[data-product-id]');
    productCards.forEach(card => {
        card.style.display = 'block';
    });
    filteredProducts = [...products];
    const noProductsMessage = document.getElementById('noProductsMessage');
    if (noProductsMessage) {
        noProductsMessage.remove();
    }
}
function renderProducts() {
    if (!productsContainer) return;
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    productsContainer.innerHTML = '';
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x mb-3 text-muted"></i>
                <h4>No products found</h4>
                <p>Try adjusting your search or filter criteria.</p>
                <button class="btn btn-primary mt-3" id="clearFiltersBtn">Clear Filters</button>
            </div>
        `;
        
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', resetFilters);
        }
        
        return;
    }
    paginatedProducts.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'col-md-4 col-lg-3 mb-4';
        productCard.style.animationDelay = `${index * 0.1}s`;
        productCard.classList.add('fade-in');
        
        productCard.innerHTML = renderProductCard(product);
        
        productsContainer.appendChild(productCard);
    });
    const viewProductBtns = document.querySelectorAll('.view-product-btn');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    
    viewProductBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product-id');
            openProductModal(productId);
        });
    });
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product-id');
            addToCartDirect(productId, 1);
        });
    });
    
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product-id');
            toggleFavoriteDirect(productId, btn);
        });
    });
}

function renderProductCard(product) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorite = favorites.some(item => item.id === product.id && item.isFavorite);
    
    return `
        <div class="card product-card h-100">
            <button class="favorite-btn" onclick="toggleFavorite(${JSON.stringify(product)})" data-product-id="${product.id}">
                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
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
}
function renderPagination() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (totalPages <= 1) return;
    const pagination = document.createElement('ul');
    pagination.className = 'pagination';
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.innerHTML = '&laquo;';
    prevLink.setAttribute('aria-label', 'Previous');
    
    prevLink.addEventListener('click', e => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
            renderPagination();
            window.scrollTo(0, 0);
        }
    });
    prevLi.appendChild(prevLink);
    pagination.appendChild(prevLi);
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        
        pageLink.addEventListener('click', e => {
            e.preventDefault();
            currentPage = i;
            renderProducts();
            renderPagination();
            window.scrollTo(0, 0);
        });
        
        pageLi.appendChild(pageLink);
        pagination.appendChild(pageLi);
    }
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.innerHTML = '&raquo;';
    nextLink.setAttribute('aria-label', 'Next');
    
    nextLink.addEventListener('click', e => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
            renderPagination();
            window.scrollTo(0, 0);
        }
    });
    
    nextLi.appendChild(nextLink);
    pagination.appendChild(nextLi);
    paginationContainer.appendChild(pagination);
}
function openProductModal(productId) {
    currentProduct = products.find(product => product.id === productId);
    if (!currentProduct) return;
    modalProductTitle.textContent = currentProduct.name;
    modalProductImage.src = currentProduct.imageUrl;
    modalProductImage.alt = currentProduct.name;
    modalProductPrice.textContent = formatCurrency(currentProduct.price);
    modalProductDescription.textContent = currentProduct.description;
    modalQuantity.value = 1;
    
    if (currentProduct.isFavorite) {
        modalAddToFavorites.innerHTML = '<i class="fas fa-heart me-2"></i>Remove from Favorites';
        modalAddToFavorites.classList.add('btn-danger');
        modalAddToFavorites.classList.remove('btn-outline-danger');
    } else {
        modalAddToFavorites.innerHTML = '<i class="far fa-heart me-2"></i>Add to Favorites';
        modalAddToFavorites.classList.remove('btn-danger');
        modalAddToFavorites.classList.add('btn-outline-danger');
    }
    const modal = new bootstrap.Modal(productModal);
    modal.show();
}
async function addToCart() {
    if (!currentProduct) return;
    
    const quantity = parseInt(modalQuantity.value) || 1;
    
    try {
        showLoading();
        const cartRef = db.collection('carts').doc(currentUser.uid);
        const cartSnapshot = await cartRef.get();
        
        if (cartSnapshot.exists) {
            const cartData = cartSnapshot.data();
            const cartItems = cartData.items || [];
            const existingItemIndex = cartItems.findIndex(item => item.productId === currentProduct.id);
            
            if (existingItemIndex !== -1) {
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                cartItems.push({
                    productId: currentProduct.id,
                    name: currentProduct.name,
                    price: currentProduct.price,
                    imageUrl: currentProduct.imageUrl,
                    quantity: quantity,
                    addedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            await cartRef.update({
                items: cartItems,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
   
            await cartRef.set({
                userId: currentUser.uid,
                items: [{
                    productId: currentProduct.id,
                    name: currentProduct.name,
                    price: currentProduct.price,
                    imageUrl: currentProduct.imageUrl,
                    quantity: quantity,
                    addedAt: firebase.firestore.FieldValue.serverTimestamp()
                }],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        hideLoading();
        const toast = new bootstrap.Toast(cartToast);
        toast.show();
        updateCartCount(currentUser.uid);
        const modal = bootstrap.Modal.getInstance(productModal);
        modal.hide();
    } catch (error) {
        hideLoading();
        console.error('Error adding to cart:', error);
        showToast('Failed to add product to cart. Please try again.', 'danger');
    }
}
async function addToCartDirect(productId, quantity) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    try {
        showLoading();
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: quantity
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        
        hideLoading();
        showToast('Product added to cart successfully!', 'success');
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    } catch (error) {
        hideLoading();
        console.error('Error adding to cart:', error);
        showToast('Failed to add product to cart. Please try again.', 'danger');
    }
}
async function toggleFavorite() {
    if (!currentProduct) return;
    
    try {
        showLoading();
        const favoritesRef = db.collection('favorites').doc(currentUser.uid);
        const favoritesSnapshot = await favoritesRef.get();
        
        if (favoritesSnapshot.exists) {
            const favoritesData = favoritesSnapshot.data();
            let productIds = favoritesData.productIds || [];
            
            if (currentProduct.isFavorite) {
                productIds = productIds.filter(id => id !== currentProduct.id);
            } else {
                productIds.push(currentProduct.id);
            }
            await favoritesRef.update({
                productIds: productIds,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await favoritesRef.set({
                userId: currentUser.uid,
                productIds: [currentProduct.id],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        currentProduct.isFavorite = !currentProduct.isFavorite;
        const productIndex = products.findIndex(p => p.id === currentProduct.id);
        if (productIndex !== -1) {
            products[productIndex].isFavorite = currentProduct.isFavorite;
        }
        const filteredProductIndex = filteredProducts.findIndex(p => p.id === currentProduct.id);
        if (filteredProductIndex !== -1) {
            filteredProducts[filteredProductIndex].isFavorite = currentProduct.isFavorite;
        }
        
        hideLoading();
        if (currentProduct.isFavorite) {
            modalAddToFavorites.innerHTML = '<i class="fas fa-heart me-2"></i>Remove from Favorites';
            modalAddToFavorites.classList.add('btn-danger');
            modalAddToFavorites.classList.remove('btn-outline-danger');
            showToast('Product added to favorites!', 'success');
        } else {
            modalAddToFavorites.innerHTML = '<i class="far fa-heart me-2"></i>Add to Favorites';
            modalAddToFavorites.classList.remove('btn-danger');
            modalAddToFavorites.classList.add('btn-outline-danger');
            showToast('Product removed from favorites.', 'info');
        }
        renderProducts();
    } catch (error) {
        hideLoading();
        console.error('Error toggling favorite:', error);
        showToast('Failed to update favorites. Please try again.', 'danger');
    }
}
async function toggleFavoriteDirect(productId, buttonElement) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    try {
        showLoading();
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const existingIndex = favorites.findIndex(fav => fav.id === product.id);
        const isCurrentlyFavorite = existingIndex !== -1;
        
        if (isCurrentlyFavorite) {
            favorites = favorites.filter(fav => fav.id !== product.id);
            product.isFavorite = false;
        } else {
            favorites.push({
                ...product,
                isFavorite: true,
                addedAt: new Date().toISOString()
            });
            product.isFavorite = true;
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        if (buttonElement) {
            const icon = buttonElement.querySelector('i');
            if (icon) {
                if (product.isFavorite) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    buttonElement.classList.add('active');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    buttonElement.classList.remove('active');
                }
            }
        }
        
        hideLoading();
        if (product.isFavorite) {
            showToast('Product added to favorites!', 'success');
        } else {
            showToast('Product removed from favorites.', 'info');
        }
    } catch (error) {
        hideLoading();
        console.error('Error toggling favorite:', error);
        showToast('Failed to update favorites. Please try again.', 'danger');
    }
} 