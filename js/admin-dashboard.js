const totalProductsElement = document.getElementById('totalProducts');

const totalOrdersElement = document.getElementById('totalOrders');

const totalUsersElement = document.getElementById('totalUsers');

const totalRevenueElement = document.getElementById('totalRevenue');

const recentOrdersList = document.getElementById('recentOrdersList');

const lowStockList = document.getElementById('lowStockList');
auth.onAuthStateChanged(async user => {
    if (user) {
       const isUserAdmin = await isAdmin(user);
         if (isUserAdmin) {
          loadDashboardStats();
            loadRecentOrders();
            loadLowStockProducts();
        }
    }
});
async function loadDashboardStats() {
    try {
       const productsSnapshot = await db.collection('products').get();
        const totalProducts = productsSnapshot.size;
        if (totalProductsElement) {
            totalProductsElement.textContent = totalProducts;
        }
        const ordersSnapshot = await db.collection('orders').get();
        const totalOrders = ordersSnapshot.size;
        
        if (totalOrdersElement) {
            totalOrdersElement.textContent = totalOrders;
        }
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        
        if (totalUsersElement) {
            totalUsersElement.textContent = totalUsers;
        }
        
        let totalRevenue = 0;
        
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            totalRevenue += order.total || 0;
        });
        if (totalRevenueElement) {
            totalRevenueElement.textContent = formatCurrency(totalRevenue);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showToast('Failed to load dashboard statistics.', 'danger');
    }
}
async function loadRecentOrders() {
    if (!recentOrdersList) return;
    try {
        const ordersSnapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        recentOrdersList.innerHTML = '';
        if (ordersSnapshot.empty) {
            recentOrdersList.innerHTML = '<tr><td colspan="6" class="text-center">No orders found.</td></tr>';
            return;
        }
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            const orderId = doc.id;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${orderId.substring(0, 8)}...</td>
                <td>${order.shippingInfo ? `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}` : 'N/A'}</td>
                <td>${formatDate(order.createdAt)}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
                </td>
                <td>${formatCurrency(order.total)}</td>
                <td>
                    <a href="admin-order-details.html?id=${orderId}" class="btn btn-sm btn-primary">
                        <i class="fas fa-eye"></i>
                    </a>
                </td>
            `;
            
            recentOrdersList.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading recent orders:', error);
        recentOrdersList.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading orders.</td></tr>';
    }
}
async function loadLowStockProducts() {
    if (!lowStockList) return;
    
    try {
    const productsSnapshot = await db.collection('products')
            .where('stock', '<', 10)
            .orderBy('stock', 'asc')
            .limit(5)
            .get();
        lowStockList.innerHTML = '';
        
        if (productsSnapshot.empty) {
            lowStockList.innerHTML = '<tr><td colspan="6" class="text-center">No low stock products found.</td></tr>';
            return;
        }
        productsSnapshot.forEach(doc => {
            const product = doc.data();
            const productId = doc.id;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${productId.substring(0, 8)}...</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>
                    <span class="badge ${getStockBadgeClass(product.stock)}">${product.stock}</span>
                </td>
                <td>
                    <a href="admin-products.html?id=${productId}" class="btn btn-sm btn-primary">
                        <i class="fas fa-edit"></i>
                    </a>
                </td>
            `;
            
            lowStockList.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading low stock products:', error);
        lowStockList.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading products.</td></tr>';
    }
}

function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-warning';
        case 'processing':
            return 'bg-info';
        case 'shipped':
            return 'bg-primary';
        case 'delivered':
            return 'bg-success';
        case 'cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
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
