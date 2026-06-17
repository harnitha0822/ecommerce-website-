// Define base API URLs (relative paths because frontend is served by the backend server)
const USERS_API = '/users';
const PRODUCTS_API = '/products';
const ORDERS_API = '/orders';

// Run when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initial load of all dashboard data
  loadAllData();

  // Attach Event Listeners to Forms
  setupFormListeners();
});

// Helper function to call load functions for all three collections
function loadAllData() {
  fetchUsers();
  fetchProducts();
  fetchOrders();
}

// ==========================================
// 1. READ OPERATIONS (Fetch & Render)
// ==========================================

// Fetch and display Users
async function fetchUsers() {
  try {
    const response = await fetch(USERS_API);
    const users = await response.json();
    
    // Render the table rows
    renderUsersTable(users);
    
    // Populate the user selection dropdown in the Order Form
    populateUserDropdown(users);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

// Fetch and display Products
async function fetchProducts() {
  try {
    const response = await fetch(PRODUCTS_API);
    const products = await response.json();
    
    renderProductsTable(products);
    populateProductDropdown(products);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

// Fetch and display Orders
async function fetchOrders() {
  try {
    const response = await fetch(ORDERS_API);
    const orders = await response.json();
    
    renderOrdersTable(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

// ==========================================
// 2. RENDER FUNCTIONS (HTML Injection)
// ==========================================

// Render Users Table
function renderUsersTable(users) {
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = ''; // Clear existing records

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No users registered yet.</td></tr>`;
    return;
  }

  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHTML(user.name)}</td>
      <td>${escapeHTML(user.email)}</td>
      <td>
        <button class="btn btn-edit" onclick="editUser('${user._id}', '${escapeHTML(user.name)}', '${escapeHTML(user.email)}')">Edit</button>
        <button class="btn btn-delete" onclick="deleteRecord('${USERS_API}/${user._id}', fetchUsers)">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Render Products Table
function renderProductsTable(products) {
  const tbody = document.getElementById('products-table-body');
  tbody.innerHTML = '';

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No products in inventory.</td></tr>`;
    return;
  }

  products.forEach(product => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHTML(product.name)}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td>${product.stock}</td>
      <td>
        <button class="btn btn-edit" onclick="editProduct('${product._id}', '${escapeHTML(product.name)}', ${product.price}, ${product.stock})">Edit</button>
        <button class="btn btn-delete" onclick="deleteRecord('${PRODUCTS_API}/${product._id}', fetchProducts)">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Render Orders Table
function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-table-body');
  tbody.innerHTML = '';

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No orders placed yet.</td></tr>`;
    return;
  }

  orders.forEach(order => {
    // Graceful checks in case populated refs are missing (e.g., if target user or product was deleted)
    const userName = order.userId ? order.userId.name : '<span class="text-danger">Deleted User</span>';
    const productName = order.productId ? order.productId.name : '<span class="text-danger">Deleted Product</span>';
    const productPrice = order.productId ? order.productId.price : 0;
    
    // Calculate total price: price * quantity ordered
    const totalCost = productPrice * order.quantity;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${userName}</td>
      <td>${productName}</td>
      <td>${order.quantity}</td>
      <td>$${totalCost.toFixed(2)}</td>
      <td>
        <button class="btn btn-edit" onclick="editOrder('${order._id}', '${order.userId?._id || ''}', '${order.productId?._id || ''}', ${order.quantity})">Edit</button>
        <button class="btn btn-delete" onclick="deleteRecord('${ORDERS_API}/${order._id}', fetchOrders)">Cancel</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Populate the select option for Users in Order Form
function populateUserDropdown(users) {
  const select = document.getElementById('order-user-select');
  // Keep the placeholder, clear rest
  select.innerHTML = '<option value="">-- Choose User --</option>';
  
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user._id;
    option.textContent = `${user.name} (${user.email})`;
    select.appendChild(option);
  });
}

// Populate the select option for Products in Order Form
function populateProductDropdown(products) {
  const select = document.getElementById('order-product-select');
  select.innerHTML = '<option value="">-- Choose Product --</option>';
  
  products.forEach(product => {
    const option = document.createElement('option');
    option.value = product._id;
    option.textContent = `${product.name} - $${product.price.toFixed(2)} (Stock: ${product.stock})`;
    select.appendChild(option);
  });
}

// ==========================================
// 3. WRITE OPERATIONS (Create / Update / Delete)
// ==========================================

// Setup all submit and cancel listeners
function setupFormListeners() {
  
  // User Form Submission Handler
  const userForm = document.getElementById('user-form');
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    
    const payload = { name, email };
    
    let url = USERS_API;
    let method = 'POST';
    
    // If id is populated, we are in update mode
    if (id) {
      url = `${USERS_API}/${id}`;
      method = 'PUT';
    }
    
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error saving User');
      }
      
      // Reset state and reload
      resetUserForm();
      fetchUsers();
      fetchOrders(); // Reload orders in case username changes
    } catch (error) {
      alert(`⚠️ Error: ${error.message}`);
    }
  });

  // User Cancel Edit Listener
  document.getElementById('user-cancel-btn').addEventListener('click', resetUserForm);

  // Product Form Submission Handler
  const productForm = document.getElementById('product-form');
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    
    const payload = { name, price, stock };
    
    let url = PRODUCTS_API;
    let method = 'POST';
    
    if (id) {
      url = `${PRODUCTS_API}/${id}`;
      method = 'PUT';
    }
    
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error saving Product');
      }
      
      resetProductForm();
      fetchProducts();
      fetchOrders(); // Reload orders in case pricing changes
    } catch (error) {
      alert(`⚠️ Error: ${error.message}`);
    }
  });

  document.getElementById('product-cancel-btn').addEventListener('click', resetProductForm);

  // Order Form Submission Handler
  const orderForm = document.getElementById('order-form');
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('order-id').value;
    const userId = document.getElementById('order-user-select').value;
    const productId = document.getElementById('order-product-select').value;
    const quantity = parseInt(document.getElementById('order-quantity').value);
    
    const payload = { userId, productId, quantity };
    
    let url = ORDERS_API;
    let method = 'POST';
    
    if (id) {
      url = `${ORDERS_API}/${id}`;
      method = 'PUT';
    }
    
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error processing Order');
      }
      
      resetOrderForm();
      fetchOrders();
      fetchProducts(); // Reload products to display updated stock counts!
    } catch (error) {
      alert(`⚠️ Error: ${error.message}`);
    }
  });

  document.getElementById('order-cancel-btn').addEventListener('click', resetOrderForm);
}

// Generic Delete handler
async function deleteRecord(url, reloadCallback) {
  if (confirm('Are you sure you want to delete this record?')) {
    try {
      const response = await fetch(url, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete record');
      }
      
      // Trigger table refresh
      reloadCallback();
      // Reload orders and products as actions might trigger stock restocking or order changes
      fetchProducts();
      fetchOrders();
    } catch (error) {
      alert(`⚠️ Error: ${error.message}`);
    }
  }
}

// ==========================================
// 4. EDIT STATE SETUP (Form Populate)
// ==========================================

// Trigger edit state for User
function editUser(id, name, email) {
  document.getElementById('user-id').value = id;
  document.getElementById('user-name').value = name;
  document.getElementById('user-email').value = email;
  
  // Customize button labels
  document.getElementById('user-submit-btn').textContent = 'Update User';
  document.getElementById('user-cancel-btn').classList.remove('hidden');
}

// Revert User form to default creation state
function resetUserForm() {
  document.getElementById('user-id').value = '';
  document.getElementById('user-form').reset();
  document.getElementById('user-submit-btn').textContent = 'Add User';
  document.getElementById('user-cancel-btn').classList.add('hidden');
}

// Trigger edit state for Product
function editProduct(id, name, price, stock) {
  document.getElementById('product-id').value = id;
  document.getElementById('product-name').value = name;
  document.getElementById('product-price').value = price;
  document.getElementById('product-stock').value = stock;
  
  document.getElementById('product-submit-btn').textContent = 'Update Product';
  document.getElementById('product-cancel-btn').classList.remove('hidden');
}

function resetProductForm() {
  document.getElementById('product-id').value = '';
  document.getElementById('product-form').reset();
  document.getElementById('product-submit-btn').textContent = 'Add Product';
  document.getElementById('product-cancel-btn').classList.add('hidden');
}

// Trigger edit state for Order
function editOrder(id, userId, productId, quantity) {
  document.getElementById('order-id').value = id;
  document.getElementById('order-user-select').value = userId;
  document.getElementById('order-product-select').value = productId;
  document.getElementById('order-quantity').value = quantity;
  
  document.getElementById('order-submit-btn').textContent = 'Update Order';
  document.getElementById('order-cancel-btn').classList.remove('hidden');
}

function resetOrderForm() {
  document.getElementById('order-id').value = '';
  document.getElementById('order-form').reset();
  document.getElementById('order-submit-btn').textContent = 'Place Order';
  document.getElementById('order-cancel-btn').classList.add('hidden');
}

// ==========================================
// 5. HELPER UTILITIES
// ==========================================

// Prevents cross-site scripting (XSS) in dynamically inserted HTML tags
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
