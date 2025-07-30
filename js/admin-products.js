const productsList = document.getElementById('productsList');
const productsPagination = document.getElementById('productsPagination');
const searchProduct = document.getElementById('searchProduct');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const stockFilter = document.getElementById('stockFilter');
const resetFiltersBtn = document.getElementById('resetFilters');
const selectAllProducts = document.getElementById('selectAllProducts');
const bulkActionsContainer = document.getElementById('bulkActionsContainer');
const bulkPublish = document.getElementById('bulkPublish');
const bulkDraft = document.getElementById('bulkDraft');
const bulkDelete = document.getElementById('bulkDelete');
const addProductForm = document.getElementById('addProductForm');
const saveProductBtn = document.getElementById('saveProductBtn');
const productImageUpload = document.getElementById('productImageUpload');
const editProductForm = document.getElementById('editProductForm');
const editProductId = document.getElementById('editProductId');
const updateProductBtn = document.getElementById('updateProductBtn');
const editProductImageUpload = document.getElementById('editProductImageUpload');
const currentProductImage = document.getElementById('currentProductImage');

const deleteProductId = document.getElementById('deleteProductId');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

let products = [];
let filteredProducts = [];
let selectedProducts = [];
let currentPage = 1;
const productsPerPage = 10;

if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);}
if (searchProduct) {
    searchProduct.addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}
if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
}
if (stockFilter) {
    stockFilter.addEventListener('change', applyFilters);
}
if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetFilters);
}
if (selectAllProducts) {
    selectAllProducts.addEventListener('change', handleSelectAll);
}

if (bulkPublish) {
    bulkPublish.addEventListener('click', () => handleBulkAction('published'));
}
if (bulkDraft) {
    bulkDraft.addEventListener('click', () => handleBulkAction('draft'));
}
if (bulkDelete) {
    bulkDelete.addEventListener('click', handleBulkDelete);
}
if (saveProductBtn) {
    saveProductBtn.addEventListener('click', handleAddProduct);
}
if (updateProductBtn) {
    updateProductBtn.addEventListener('click', handleUpdateProduct);
}
if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', handleDeleteProduct);
}

auth.onAuthStateChanged(async user => {
    if (user) {
        const isUserAdmin = await isAdmin(user);
        
        if (isUserAdmin) {
            loadProducts();
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            
            if (productId) {
                loadProductForEdit(productId);
            }
        }
    }
});

async function loadProducts() {
    try {
        showLoading();
        const productsSnapshot = await db.collection('products').get();
        products = [];
        productsSnapshot.forEach(doc => {
            const product = {
                id: doc.id,
                ...doc.data()
            };
            products.push(product);
        });
        applyFilters();
        
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('Error loading products:', error);
        showToast('Failed to load products. Please try again.', 'danger');
    }
}

function applyFilters() {
    const searchTerm = searchProduct ? searchProduct.value.toLowerCase().trim() : '';
    const category = categoryFilter ? categoryFilter.value : '';
    const stockStatus = stockFilter ? stockFilter.value : '';
    
    filteredProducts = products.filter(product => {

        if (searchTerm && !product.name.toLowerCase().includes(searchTerm) && 
            !product.description.toLowerCase().includes(searchTerm)) {
            return false;
        }
        if (category && product.category !== category) {
            return false;
        }
        if (stockStatus) {
            if (stockStatus === 'in-stock' && product.stock <= 0) {
                return false;
            } else if (stockStatus === 'low-stock' && (product.stock <= 0 || product.stock > 10)) {
                return false;
            } else if (stockStatus === 'out-of-stock' && product.stock > 0) {
                return false;
            }
        }
        return true;
    });
    currentPage = 1;
    selectedProducts = [];
    if (selectAllProducts) {
        selectAllProducts.checked = false;
    }
    if (bulkActionsContainer) {
        bulkActionsContainer.classList.add('d-none');
    }
    renderProducts();
    renderPagination();
}

function handleSearch() {
    applyFilters();
}
function resetFilters() {
    if (searchProduct) searchProduct.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (stockFilter) stockFilter.value = '';
    
    applyFilters();
}

function renderProducts() {
    if (!productsList) return;

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    productsList.innerHTML = '';

    if (filteredProducts.length === 0) {
        productsList.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <i class="fas fa-box fa-3x mb-3 text-muted"></i>
                    <h5>No products found</h5>
                    <p>Try adjusting your search or filter criteria.</p>
                </td>
            </tr>
        `;
        
        return;
    }
    paginatedProducts.forEach(product => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>
                <div class="form-check">
                    <input class="form-check-input product-checkbox" type="checkbox" value="${product.id}" aria-label="Select product">
                </div>
            </td>
            <td>
                <img src="${product.imageUrl}" alt="${product.name}" class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>
                <span class="badge ${getStockBadgeClass(product.stock)}">${product.stock}</span>
            </td>
            <td>
                <span class="status-badge ${product.status}">${product.status}</span>
            </td>
            <td>
                <div class="d-flex">
                    <a href="#" class="action-btn view" data-product-id="${product.id}" title="View Product">
                        <i class="fas fa-eye"></i>
                    </a>
                    <a href="#" class="action-btn edit" data-product-id="${product.id}" data-bs-toggle="modal" data-bs-target="#editProductModal" title="Edit Product">
                        <i class="fas fa-edit"></i>
                    </a>
                    <a href="#" class="action-btn delete" data-product-id="${product.id}" data-bs-toggle="modal" data-bs-target="#deleteProductModal" title="Delete Product">
                        <i class="fas fa-trash-alt"></i>
                    </a>
                </div>
            </td>
        `;
        
        productsList.appendChild(tr);
    });

    const productCheckboxes = document.querySelectorAll('.product-checkbox');
    const viewButtons = document.querySelectorAll('.action-btn.view');
    const editButtons = document.querySelectorAll('.action-btn.edit');
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    
    productCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleProductSelection);
    });
    
    viewButtons.forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
            const productId = button.getAttribute('data-product-id');
            viewProduct(productId);
        });
    });
    
    editButtons.forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
            const productId = button.getAttribute('data-product-id');
            loadProductForEdit(productId);
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
            const productId = button.getAttribute('data-product-id');
            if (deleteProductId) {
                deleteProductId.value = productId;
            }
        });
    });
}

function renderPagination() {
    if (!productsPagination) return;
    productsPagination.innerHTML = '';
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
        }
    });
    
    nextLi.appendChild(nextLink);
    pagination.appendChild(nextLi);
    productsPagination.appendChild(pagination);
}

function handleProductSelection() {
    const productCheckboxes = document.querySelectorAll('.product-checkbox');
    selectedProducts = [];
    productCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedProducts.push(checkbox.value);
        }
    });
    if (selectAllProducts) {
        selectAllProducts.checked = selectedProducts.length > 0 && selectedProducts.length === productCheckboxes.length;
    }
    if (bulkActionsContainer) {
        if (selectedProducts.length > 0) {
            bulkActionsContainer.classList.remove('d-none');
        } else {
            bulkActionsContainer.classList.add('d-none');
        }
    }
}
function handleSelectAll() {
    const productCheckboxes = document.querySelectorAll('.product-checkbox');
    productCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllProducts.checked;
    });
    handleProductSelection();
}
async function handleBulkAction(status) {
    if (selectedProducts.length === 0) return;
    
    try {
        showLoading();
        const batch = db.batch();
        
        selectedProducts.forEach(productId => {
            const productRef = db.collection('products').doc(productId);
            batch.update(productRef, { status });
        });
        
        await batch.commit();
        products = products.map(product => {
            if (selectedProducts.includes(product.id)) {
                return { ...product, status };
            }
            return product;
        });
        applyFilters();
        
        hideLoading();
        showToast(`${selectedProducts.length} products updated successfully.`, 'success');
    } catch (error) {
        hideLoading();
        console.error('Error updating products:', error);
        showToast('Failed to update products. Please try again.', 'danger');
    }
}
async function handleBulkDelete() {
    if (selectedProducts.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
        return;
    }
    
    try {
        showLoading();
        const batch = db.batch();
        
        selectedProducts.forEach(productId => {
            const productRef = db.collection('products').doc(productId);
            batch.delete(productRef);
        });
        
        await batch.commit();
        products = products.filter(product => !selectedProducts.includes(product.id));
        applyFilters();
        hideLoading();
        showToast(`${selectedProducts.length} products deleted successfully.`, 'success');
    } catch (error) {
        hideLoading();
        console.error('Error deleting products:', error);
        showToast('Failed to delete products. Please try again.', 'danger');
    }
}
function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    window.open(`../products.html?product=${productId}`, '_blank');
}

async function loadProductForEdit(productId) {
    if (!editProductForm || !editProductId) return;
    
    try {
        showLoading();
        
        // Get product from Firestore
        const productDoc = await db.collection('products').doc(productId).get();
        
        if (!productDoc.exists) {
            hideLoading();
            showToast('Product not found.', 'danger');
            return;
        }
        
        const product = {
            id: productDoc.id,
            ...productDoc.data()
        };
        editProductId.value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductStock').value = product.stock;
        document.getElementById('editProductStatus').value = product.status;
        document.getElementById('editProductDescription').value = product.description;
        document.getElementById('editProductImage').value = product.imageUrl;
        
        // Set current image
        if (currentProductImage) {
            currentProductImage.src = product.imageUrl;
        }
        
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('Error loading product:', error);
        showToast('Failed to load product. Please try again.', 'danger');
    }
}
async function handleAddProduct() {
    if (!addProductForm) return;
    
    // Validate form
    if (!addProductForm.checkValidity()) {
        addProductForm.reportValidity();
        return;
    }
    
    try {
        showLoading();
        const name = document.getElementById('productName').value;
        const category = document.getElementById('productCategory').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const status = document.getElementById('productStatus').value;
        const description = document.getElementById('productDescription').value;
        let imageUrl = document.getElementById('productImage').value;
        if (productImageUpload && productImageUpload.files.length > 0) {
            const file = productImageUpload.files[0];
            const storageRef = storage.ref(`products/${Date.now()}_${file.name}`);
            const uploadTask = await storageRef.put(file);
            imageUrl = await uploadTask.ref.getDownloadURL();
        }
        const productRef = db.collection('products').doc();
        
        await productRef.set({
            name,category,price,stock, status,description,imageUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        const newProduct = {
            id: productRef.id,name,category,price,stock,status,description,
            imageUrl,
            createdAt: new Date()
        };
        products.push(newProduct);
        addProductForm.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        applyFilters();
        
        hideLoading();
        showToast('Product added successfully.', 'success');
    } catch (error) {
        hideLoading();
        console.error('Error adding product:', error);
        showToast('Failed to add product. Please try again.', 'danger');
    }
}

async function handleUpdateProduct() {
    if (!editProductForm || !editProductId) return;
    if (!editProductForm.checkValidity()) {
        editProductForm.reportValidity();
        return;
    }
    try {
        showLoading();
        const productId = editProductId.value;
        const name = document.getElementById('editProductName').value;
        const category = document.getElementById('editProductCategory').value;
        const price = parseFloat(document.getElementById('editProductPrice').value);
        const stock = parseInt(document.getElementById('editProductStock').value);
        const status = document.getElementById('editProductStatus').value;
        const description = document.getElementById('editProductDescription').value;
        let imageUrl = document.getElementById('editProductImage').value;
    
        if (editProductImageUpload && editProductImageUpload.files.length > 0) {
            const file = editProductImageUpload.files[0];
            const storageRef = storage.ref(`products/${Date.now()}_${file.name}`);
            const uploadTask = await storageRef.put(file);
            imageUrl = await uploadTask.ref.getDownloadURL();
        }
        const productRef = db.collection('products').doc(productId);
        await productRef.update({name,category,price,stock,status,description,imageUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        products = products.map(product => {
            if (product.id === productId) {
                return {
                    ...product, name, category, price,stock, status, description,imageUrl,
                    updatedAt: new Date()
                };
            }
            return product;
        });
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
        modal.hide();
        applyFilters();
        hideLoading();
        showToast('Product updated successfully.', 'success');
    } catch (error) {
        hideLoading();
        console.error('Error updating product:', error);
        showToast('Failed to update product. Please try again.', 'danger');
    }
}

async function handleDeleteProduct() {
    if (!deleteProductId) return;
    
    try {
        showLoading();
        const productId = deleteProductId.value;
        await db.collection('products').doc(productId).delete();
        products = products.filter(product => product.id !== productId);
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteProductModal'));
        modal.hide();
        applyFilters();
        hideLoading();
        showToast('Product deleted successfully.', 'success');
    } catch (error) {
        hideLoading();
        console.error('Error deleting product:', error);
        showToast('Failed to delete product. Please try again.', 'danger');
    }
}
function getStockBadgeClass(stock) {
    if (stock <= 0) {
        return 'bg-danger';
    } else if (stock < 5) {
        return 'bg-warning';
    } else if (stock < 10) {
        return 'bg-info';
    } else {
        return 'bg-success';
    }
} 
