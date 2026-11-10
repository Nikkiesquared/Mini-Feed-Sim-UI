
let feed = [];

function generateUniqueId() {
    return 'post_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function createPost(username, content) {
    let post = {
        id: generateUniqueId(), 
        username: username.trim().toLowerCase(),
        content: content,
        likes: 0,
        timestamp: new Date().toISOString() 
    };
    feed.push(post);
    return post;
}


function likePost(postId){
    const post = feed.find(post => post.id === postId);
    if (post) {
        post.likes += 1;
        return post;
    }
    return null;
}


function sortByNewest(targetArray = feed) {
    return [...targetArray].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

function sortByLikes(targetArray = feed) {
    return [...targetArray].sort((a, b) => b.likes - a.likes);
}

function getPostsByUser(username) {
    const normalizedUsername = username.trim().replace(/^@/, '').toLowerCase();
    return feed.filter(post => post.username === normalizedUsername);
}

// UI and Event Handlers 

// Current filter state for sorting
let currentSortMode = 'newest'; 

// Elements from HTML structure
const feedContainer = document.getElementById('feed-container');
const userPostsContainer = document.getElementById('user-posts-container');
const postForm = document.getElementById('post-form');
const userPostsForm = document.getElementById('user-posts-form');

const btnSortNewest = document.getElementById('sort-by-newest');
const btnSortLikes = document.getElementById('sort-by-likes');

// Initial Setup
function init() {
    // Generate initial test data
    createPost('Nikkie', 'Welcome to NikiGSquared! Thanks for stopping by.');
    createPost('Rowan', 'Icecream for breakfast!');
    createPost('Nick', 'No Icecream for breakfast!');
    
    // Wire up events
    postForm.addEventListener('submit', handleCreatePost);
    userPostsForm.addEventListener('submit', handleSearchUserPosts);
    btnSortNewest.addEventListener('click', () => { currentSortMode = 'newest'; renderFeed(); });
    btnSortLikes.addEventListener('click', () => { currentSortMode = 'likes'; renderFeed(); });

    renderFeed();
}

// Global Feed Renderer
function renderFeed() {
    let sortedPosts = currentSortMode === 'newest' ? sortByNewest() : sortByLikes();

    // Toggle active classes on sort container buttons
    if (currentSortMode === 'newest') {
        btnSortNewest.classList.add('active');
        btnSortLikes.classList.remove('active');
    } else {
        btnSortLikes.classList.add('active');
        btnSortNewest.classList.remove('active');
    }
    if (sortedPosts.length === 0) {
        feedContainer.innerHTML = `<div class="empty-msg">No posts available. Be the first to add one below!</div>`;
        return;
    }

    feedContainer.innerHTML = sortedPosts.map(post => generatePostHTML(post)).join('');
}

// HTML Generator helper for cards
function generatePostHTML(post) {
    const formattedTime = new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `
        <div class="post-card" data-id="${post.id}">
            <div class="post-header">
                <span class="post-user">@${escapeHTML(post.username)}</span>
                <span class="post-time">${formattedTime}</span>
            </div>
            <div class="post-content">${escapeHTML(post.content)}</div>
            <div class="post-footer">
                <button class="like-action-btn ${post.likes > 0 ? 'liked' : ''}" onclick="handleLikeClick('${post.id}')">
                    👍 <span>${post.likes}</span>
                </button>
            </div>
        </div>
    `;
}

// Action: Submit Create Post
function handleCreatePost(e) {
    e.preventDefault();
    const usernameVal = document.getElementById('username').value;
    const contentVal = document.getElementById('content').value;

    createPost(usernameVal, contentVal);

    // Clear content input text field after execution
    document.getElementById('content').value = '';
    
    renderFeed();
}

// Action: View user metrics inside target container
function handleSearchUserPosts(e) {
    e.preventDefault();
    const searchUsername = document.getElementById('user-posts-username').value.trim().replace(/^@/, '');
    const userFilteredPosts = getPostsByUser(searchUsername);

    if (userFilteredPosts.length === 0) {
        userPostsContainer.innerHTML = `
            <div class="user-search-header">Posts by @${escapeHTML(searchUsername.toLowerCase())}</div>
            <div class="empty-msg">No posts found for this user yet.</div>
        `;
        return;
    }

    const sortedUserPosts = currentSortMode === 'newest'
        ? sortByNewest(userFilteredPosts)
        : sortByLikes(userFilteredPosts);
    userPostsContainer.innerHTML = `
        <div class="user-search-header">Posts by @${escapeHTML(userFilteredPosts[0].username)}</div>
        ${sortedUserPosts.map(post => generatePostHTML(post)).join('')}
    `;
}

// Action: Handle Global Like execution
function handleLikeClick(postId) {
    likePost(postId);
    renderFeed();
    
    // Refresh user-specific pane if they are looking at specific metrics
    const userSearchInput = document.getElementById('user-posts-username').value.trim();
    if(userSearchInput) {
        const userFilteredPosts = getPostsByUser(userSearchInput);
        const sortedUserPosts = currentSortMode === 'newest'
            ? sortByNewest(userFilteredPosts)
            : sortByLikes(userFilteredPosts);
        userPostsContainer.innerHTML = userFilteredPosts.length > 0
            ? `<div class="user-search-header">Posts by @${escapeHTML(userFilteredPosts[0].username)}</div>${sortedUserPosts.map(post => generatePostHTML(post)).join('')}`
            : `<div class="user-search-header">Posts by @${escapeHTML(userSearchInput.replace(/^@/, '').toLowerCase())}</div><div class="empty-msg">No posts found for this user yet.</div>`;
    }
}

// Guard script injection strings 
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Start application
window.onload = init;


