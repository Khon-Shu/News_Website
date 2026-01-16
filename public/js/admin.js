// Admin Panel JavaScript
const API_BASE = window.location.origin;

// Check admin authentication
function checkAdminAuth() {
    const currentUser = localStorage.getItem('currentUser');
    const isAdmin = localStorage.getItem('isAdmin');
    
    if (!currentUser || isAdmin !== 'true') {
        showNotification('Access denied. Admin login required.', 'error');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return false;
    }
    
    return true;
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;
    
    loadDashboardStats();
    loadUsers();
    loadAdmins();
    loadMessages();
});

// Show different sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for the section
    switch(sectionId) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'users':
            loadUsers();
            break;
        case 'admins':
            loadAdmins();
            break;
        case 'messages':
            loadMessages();
            break;
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const [usersResponse, adminsResponse, messagesResponse] = await Promise.all([
            fetch(API_BASE + '/users/api'),
            fetch(API_BASE + '/admin/api'),
            fetch(API_BASE + '/message/api')
        ]);
        
        const usersData = await usersResponse.json();
        const adminsData = await adminsResponse.json();
        const messagesData = await messagesResponse.json();
        
        // Update statistics
        document.getElementById('totalUsers').textContent = 
            usersData.successful ? usersData.length || 0 : 0;
        document.getElementById('totalAdmins').textContent = 
            adminsData.successful ? adminsData.length || 0 : 0;
        document.getElementById('totalMessages').textContent = 
            messagesData.successful ? messagesData.length || 0 : 0;
        
        // Get today's news count
        const newsResponse = await fetch(API_BASE + '/news/api');
        const newsData = await newsResponse.json();
        document.getElementById('todayNews').textContent = 
            newsData.successful ? newsData.totalResults || 0 : 0;
            
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showNotification('Error loading statistics', 'error');
    }
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch(API_BASE + '/users/api');
        const data = await response.json();
        
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        if (data.successful && Array.isArray(data)) {
            data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user._id || 'N/A'}</td>
                    <td>${user.username || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>
                        <button class="action-btn" onclick="editUser('${user._id}')">Edit</button>
                        <button class="action-btn danger" onclick="deleteUser('${user._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4">No users found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error loading users', 'error');
    }
}

// Load admins
async function loadAdmins() {
    try {
        const response = await fetch(API_BASE + '/admin/api');
        const data = await response.json();
        
        const tbody = document.getElementById('adminsTableBody');
        tbody.innerHTML = '';
        
        if (data.successful && Array.isArray(data)) {
            data.forEach(admin => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${admin._id || 'N/A'}</td>
                    <td>${admin.name || 'N/A'}</td>
                    <td>${admin.email || 'N/A'}</td>
                    <td>
                        <button class="action-btn" onclick="editAdmin('${admin._id}')">Edit</button>
                        <button class="action-btn danger" onclick="deleteAdmin('${admin._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4">No admins found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading admins:', error);
        showNotification('Error loading admins', 'error');
    }
}

// Load messages
async function loadMessages() {
    try {
        const response = await fetch(API_BASE + '/message/api');
        const data = await response.json();
        
        const tbody = document.getElementById('messagesTableBody');
        tbody.innerHTML = '';
        
        if (data.successful && Array.isArray(data)) {
            data.forEach(message => {
                const row = document.createElement('tr');
                const messageText = message.message ? 
                    (message.message.length > 50 ? message.message.substring(0, 50) + '...' : message.message) 
                    : 'N/A';
                const date = message.createdAt ? 
                    new Date(message.createdAt).toLocaleDateString() : 'N/A';
                
                row.innerHTML = `
                    <td>${message._id || 'N/A'}</td>
                    <td>${message.name || 'N/A'}</td>
                    <td>${message.email || 'N/A'}</td>
                    <td>${messageText}</td>
                    <td>${date}</td>
                    <td>
                        <button class="action-btn" onclick="viewMessage('${message._id}')">View</button>
                        <button class="action-btn danger" onclick="deleteMessage('${message._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6">No messages found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        showNotification('Error loading messages', 'error');
    }
}

// Search users
function searchUsers(query) {
    const rows = document.querySelectorAll('#usersTableBody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const response = await fetch(API_BASE + `/users/api/${userId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('User deleted successfully', 'success');
            loadUsers();
            loadDashboardStats();
        } else {
            showNotification(data.message || 'Error deleting user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user', 'error');
    }
}

// Delete admin
async function deleteAdmin(adminId) {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    
    try {
        const response = await fetch(API_BASE + `/admin/api/${adminId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Admin deleted successfully', 'success');
            loadAdmins();
            loadDashboardStats();
        } else {
            showNotification(data.message || 'Error deleting admin', 'error');
        }
    } catch (error) {
        console.error('Error deleting admin:', error);
        showNotification('Error deleting admin', 'error');
    }
}

// Delete message
async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
        const response = await fetch(API_BASE + `/message/api/${messageId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Message deleted successfully', 'success');
            loadMessages();
            loadDashboardStats();
        } else {
            showNotification(data.message || 'Error deleting message', 'error');
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        showNotification('Error deleting message', 'error');
    }
}

// View message
function viewMessage(messageId) {
    // This would open a modal with full message details
    showNotification('Message view feature coming soon', 'info');
}

// Edit user
function editUser(userId) {
    // This would open an edit modal
    showNotification('User edit feature coming soon', 'info');
}

// Edit admin
function editAdmin(adminId) {
    // This would open an edit modal
    showNotification('Admin edit feature coming soon', 'info');
}

// Refresh statistics
function refreshStats() {
    loadDashboardStats();
    showNotification('Statistics refreshed', 'success');
}

// Show profile
function showProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    showNotification(`Logged in as: ${currentUser.email}`, 'info');
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
}

// Show notification (reuse from main script)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
