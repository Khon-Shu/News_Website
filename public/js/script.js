// Global state management
const state = {
    currentUser: null,
    isAdmin: false,
    currentCategory: 'all',
    currentFilter: 'all',
    newsCache: new Map()
};

// API Base URL
const API_BASE = window.location.origin;

// Authentication functions
async function login(email, password, isAdmin = false) {
    try {
        const endpoint = isAdmin ? '/admin/api/login' : '/users/api/login';
        const response = await fetch(API_BASE + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.successful) {
            state.currentUser = data.user;
            state.isAdmin = isAdmin;
            localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
            localStorage.setItem('isAdmin', isAdmin);
            updateUIForAuth();
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Network error' };
    }
}

async function register(userData) {
    try {
        const response = await fetch(API_BASE + '/users/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.successful) {
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message || 'Registration failed' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Network error' };
    }
}

function logout() {
    state.currentUser = null;
    state.isAdmin = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    updateUIForAuth();
}

// Load user session from localStorage
function loadUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    const savedAdmin = localStorage.getItem('isAdmin');
    
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        state.isAdmin = savedAdmin === 'true';
        updateUIForAuth();
    }
}

// Update UI based on authentication state
function updateUIForAuth() {
    const profileBtn = document.querySelector('.profile-btn');
    const loginBtn = document.querySelector('.login-btn');
    
    if (state.currentUser) {
        loginBtn.textContent = 'Logout';
        loginBtn.onclick = logout;
        profileBtn.textContent = state.currentUser.username || state.currentUser.email || 'Profile';
        
        if (state.isAdmin) {
            profileBtn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            profileBtn.style.color = 'white';
        }
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = () => window.location.href = '/login.html';
        profileBtn.textContent = '👤 Profile';
        profileBtn.style.background = '';
        profileBtn.style.color = '';
    }
}

// Fetch and display news
async function fetchNews(category = null, query = null) {
    const loading = document.getElementById('loading');
    const newsGrid = document.getElementById('newsGrid');
    
    try {
        loading.style.display = 'block';
        newsGrid.innerHTML = '';
        
        let url = API_BASE + '/news/api';
        if (category && category !== 'all') {
            url += `/category/${category}`;
        } else if (query) {
            url += `/search?query=${encodeURIComponent(query)}`;
        }
        
        // Check cache first
        const cacheKey = url;
        if (state.newsCache.has(cacheKey)) {
            const cachedData = state.newsCache.get(cacheKey);
            displayNews(cachedData.articles);
            loading.style.display = 'none';
            return;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        loading.style.display = 'none';
        
        if (data.successful && data.articles && data.articles.length > 0) {
            // Cache the results
            state.newsCache.set(cacheKey, data);
            displayNews(data.articles);
        } else {
            newsGrid.innerHTML = `<p style="text-align: center; color: #666; padding: 2rem;">${data.message || 'No news available at the moment.'}</p>`;
        }
    } catch (error) {
        loading.style.display = 'none';
        newsGrid.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 2rem;">Error loading news. Please try again later.</p>';
        console.error('Error fetching news:', error);
    }
}

// Display news articles
function displayNews(articles) {
    const newsGrid = document.getElementById('newsGrid');
    
    articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'news-card';
        
        const image = article.urlToImage 
            ? `<img src="${article.urlToImage}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">`
            : `<div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">No Image</div>`;
        
        const publishedDate = article.publishedAt 
            ? new Date(article.publishedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            })
            : 'Date not available';
        
        const description = article.description 
            ? article.description.length > 150 
                ? article.description.substring(0, 150) + '...'
                : article.description
            : 'No description available';
        
        card.innerHTML = `
            ${image}
            <div class="news-card-content">
                <h3>${article.title || 'No title'}</h3>
                <p>${description}</p>
                <div class="news-card-meta">
                    <span class="source">${article.source?.name || 'Unknown source'}</span>
                    <span>${publishedDate}</span>
                </div>
                ${article.url ? `<a href="${article.url}" target="_blank">Read more →</a>` : ''}
            </div>
        `;
        
        newsGrid.appendChild(card);
    });
}

// Search functionality
async function performSearch(query) {
    if (!query.trim()) {
        fetchNews(state.currentCategory);
        return;
    }
    
    await fetchNews(null, query);
}

// Category filtering
function filterByCategory(category) {
    state.currentCategory = category;
    fetchNews(category);
    
    // Update active state
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
}

// Filter buttons functionality
function handleFilterClick(filter) {
    state.currentFilter = filter;
    
    // Update active state
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
    
    // Re-fetch news with current category
    fetchNews(state.currentCategory === 'all' ? null : state.currentCategory);
}

// Modal functions
function showLoginModal() {
    const modal = createLoginModal();
    document.body.appendChild(modal);
}

function createLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>Login</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" required>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="isAdmin"> Login as Admin
                        </label>
                    </div>
                    <button type="submit" class="btn-primary">Login</button>
                    <p class="switch-form">
                        Don't have an account? <a href="#" onclick="showRegisterModal(); this.closest('.modal-overlay').remove()">Register</a>
                    </p>
                </form>
            </div>
        </div>
    `;
    
    modal.querySelector('#loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const isAdmin = document.getElementById('isAdmin').checked;
        
        const result = await login(email, password, isAdmin);
        
        if (result.success) {
            modal.remove();
            showNotification('Login successful!', 'success');
        } else {
            showNotification(result.message, 'error');
        }
    });
    
    return modal;
}

function showRegisterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>Register</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <form id="registerForm">
                    <div class="form-group">
                        <label for="regName">Username:</label>
                        <input type="text" id="regName" required>
                    </div>
                    <div class="form-group">
                        <label for="regEmail">Email:</label>
                        <input type="email" id="regEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="regPassword">Password:</label>
                        <input type="password" id="regPassword" required>
                    </div>
                    <button type="submit" class="btn-primary">Register</button>
                    <p class="switch-form">
                        Already have an account? <a href="#" onclick="showLoginModal(); this.closest('.modal-overlay').remove()">Login</a>
                    </p>
                </form>
            </div>
        </div>
    `;
    
    modal.querySelector('#registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        
        const result = await register({ username, email, password });
        
        if (result.success) {
            modal.remove();
            showNotification('Registration successful! Please login.', 'success');
            showLoginModal();
        } else {
            showNotification(result.message, 'error');
        }
    });
    
    document.body.appendChild(modal);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize event listeners
function initializeEventListeners() {
    // Search functionality
    const searchBtn = document.querySelector('.search-btn');
    const searchBar = document.querySelector('.search-bar');
    
    searchBtn.addEventListener('click', () => {
        const query = searchBar.value.trim();
        performSearch(query);
    });
    
    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchBar.value.trim();
            performSearch(query);
        }
    });
    
    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            filterByCategory(category);
        });
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            handleFilterClick(filter);
        });
    });
    
    // Trending tags
    document.querySelectorAll('.trending-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const query = tag.textContent.replace('#', '');
            searchBar.value = query;
            performSearch(query);
        });
    });
    
    // Profile button
    const profileBtn = document.querySelector('.profile-btn');
    profileBtn.addEventListener('click', () => {
        if (state.currentUser) {
            if (state.isAdmin) {
                // Redirect to admin panel
                window.location.href = '/admin.html';
            } else {
                showNotification(`Logged in as: ${state.currentUser.email}`, 'info');
            }
        } else {
            showNotification('Please login first', 'warning');
        }
    });
}

// Load news when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadUserSession();
    initializeEventListeners();
    fetchNews();
});
