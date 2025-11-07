// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
    authDomain: "smart-ai-chat-app.firebaseapp.com",
    projectId: "smart-ai-chat-app",
    databaseURL: "https://smart-ai-chat-app-default-rtdb.firebaseio.com"
};

// GEMINI API KEY
const GEMINI_API_KEY = 'AIzaSyAJhruzaSUiKhP8GP7ZLg2h25GBTSKq1gs';

// STATE VARIABLES
let auth = null;
let database = null;
let isProcessing = false;
let chatSessions = [];
let currentSessionId = null;
let currentImage = null;
let currentOCRText = '';
let currentLanguage = 'en';

// TRANSLATIONS
const translations = {
    en: {
        appTitle: "Smart AI",
        appSubtitle: "Powered by Gemini AI",
        email: "Email",
        password: "Password",
        name: "Name",
        login: "Login",
        signUp: "Sign Up",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        enterEmail: "Enter your email",
        enterPassword: "Enter your password",
        enterName: "Enter your name",
        createPassword: "Create a password (min 6 characters)",
        createAccount: "Create Your Account",
        newChat: "New chat",
        welcomeTitle: "Hi, I'm Smart AI.",
        welcomeSubtitle: "How can I help you today?",
        messagePlaceholder: "Message Smart AI",
        uploadImage: "Upload Image",
        moreOptions: "More options",
        deepThink: "DeepThink",
        search: "Search",
        logout: "Logout",
        processing: "Processing...",
        imageUploaded: "Image uploaded!",
        textExtracted: "Text extracted!",
        chatCleared: "Chat cleared!",
        loginSuccess: "Login successful!",
        logoutSuccess: "Logged out successfully!",
        chatDeleted: "Chat deleted!",
        deleteConfirm: "Delete this chat?",
        extractingText: "Extracting text...",
        processingImage: "Processing image..."
    },
    si: {
        appTitle: "Smart AI",
        appSubtitle: "Gemini AI මගින් බලගන්වා ඇත",
        email: "විද්‍යුත් ලිපිනය",
        password: "මුරපදය",
        name: "නම",
        login: "ඇතුල් වන්න",
        signUp: "ලියාපදිංචි වන්න",
        noAccount: "ගිණුමක් නැද්ද?",
        haveAccount: "දැනටමත් ගිණුමක් තිබේද?",
        enterEmail: "ඔබගේ විද්‍යුත් ලිපිනය ඇතුළත් කරන්න",
        enterPassword: "ඔබගේ මුරපදය ඇතුළත් කරන්න",
        enterName: "ඔබගේ නම ඇතුළත් කරන්න",
        createPassword: "මුරපදයක් සාදන්න (අවම අක්ෂර 6ක්)",
        createAccount: "ඔබගේ ගිණුම සාදන්න",
        newChat: "නව සංවාදය",
        welcomeTitle: "හායි, මම Smart AI.",
        welcomeSubtitle: "අද මට ඔබට උදව් කරන්නේ කෙසේද?",
        messagePlaceholder: "Smart AI වෙත පණිවිඩයක්",
        uploadImage: "පින්තූරය උඩුගත කරන්න",
        moreOptions: "තවත් විකල්ප",
        deepThink: "ගැඹුරු චින්තනය",
        search: "සොයන්න",
        logout: "ඉවත් වන්න",
        processing: "සැකසෙමින්...",
        imageUploaded: "පින්තූරය උඩුගත විය!",
        textExtracted: "පෙළ උපුටා ගන්නා ලදී!",
        chatCleared: "සංවාදය මකා දමන ලදී!",
        loginSuccess: "පිවිසුම සාර්ථකයි!",
        logoutSuccess: "සාර්ථකව ඉවත් විය!",
        chatDeleted: "සංවාදය මකා දමන ලදී!",
        deleteConfirm: "මෙම සංවාදය මකන්න ද?",
        extractingText: "පෙළ උපුටා ගනිමින්...",
        processingImage: "පින්තූරය සකසමින්..."
    }
};

// ==================== LANGUAGE FUNCTIONS ====================
function getTranslation(key) {
    return translations[currentLanguage][key] || translations.en[key] || key;
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = getTranslation(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = getTranslation(key);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = getTranslation(key);
    });

    localStorage.setItem('smartai-language', currentLanguage);
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'si' : 'en';
    updateLanguage();
    showNotification(currentLanguage === 'en' ? 'Language changed to English' : 'භාෂාව සිංහලට වෙනස් විය');
}

function loadLanguagePreference() {
    const savedLang = localStorage.getItem('smartai-language');
    if (savedLang && (savedLang === 'en' || savedLang === 'si')) {
        currentLanguage = savedLang;
        updateLanguage();
    }
}

// ==================== FIREBASE INITIALIZATION ====================
function initializeFirebase() {
    try {
        console.log("🔄 Initializing Firebase...");
        
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not loaded');
            showNotification('Please check your internet connection', 'error');
            return;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        auth = firebase.auth();
        database = firebase.database();
        
        console.log("✅ Firebase initialized successfully");

        auth.onAuthStateChanged((user) => {
            console.log("🔐 Auth state changed:", user ? user.email : "No user");
            if (user) {
                showChatApp();
                loadChatSessions();
                updateUserProfile(user);
            } else {
                showAuthContainer();
            }
        });

        loadLanguagePreference();
        
    } catch (error) {
        console.error("❌ Firebase init error:", error);
        showNotification("Failed to initialize app", "error");
    }
}

// ==================== UI FUNCTIONS ====================
function showLogin() {
    console.log("🔹 Showing login form");
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    hideMessages();
}

function showSignup() {
    console.log("🔹 Showing signup form");
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    hideMessages();
}

function showAuthContainer() {
    console.log("🔹 Showing auth container");
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('chatApp').style.display = 'none';
}

function showChatApp() {
    console.log("🔹 Showing chat app");
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('chatApp').style.display = 'block';
}

function hideMessages() {
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('signupError').style.display = 'none';
    document.getElementById('signupSuccess').style.display = 'none';
}

function showNotification(message, type = 'success') {
    console.log("🔹 Showing notification:", message);
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    const icon = notification.querySelector('i');
    
    notification.className = `notification ${type}`;
    text.textContent = message;
    
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else {
        icon.className = 'fas fa-exclamation-circle';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showLoading(text) {
    console.log("🔹 Showing loading:", text);
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    loadingText.textContent = text;
    overlay.classList.add('show');
}

function hideLoading() {
    console.log("🔹 Hiding loading");
    document.getElementById('loadingOverlay').classList.remove('show');
}

function toggleSidebar() {
    console.log("🔹 Toggling sidebar");
    const sidebar = document.getElementById('chatSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    console.log("🔹 Closing sidebar");
    const sidebar = document.getElementById('chatSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

function updateUserProfile(user) {
    console.log("🔹 Updating user profile:", user.email);
    const userName = user.displayName || user.email.split('@')[0];
    const userEmail = user.email;
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userEmail').textContent = userEmail;
}

// ==================== AUTH HANDLERS ====================
async function handleLogin(event) {
    console.log("🔹 Login function called");
    if (event) event.preventDefault();
    if (isProcessing) return;
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    
    if (!email || !password) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    isProcessing = true;
    btn.disabled = true;
    btn.querySelector('.loader').style.display = 'block';
    btn.querySelector('#loginText').textContent = 'Logging in...';
    hideMessages();
    
    try {
        console.log("🔹 Attempting login for:", email);
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log("✅ Login successful");
        showNotification(getTranslation('loginSuccess'));
        document.getElementById('loginForm').reset();
    } catch (error) {
        console.error("❌ Login error:", error);
        const errorMsg = document.getElementById('loginError');
        errorMsg.textContent = 'Login failed. Please check your credentials.';
        errorMsg.style.display = 'block';
    } finally {
        isProcessing = false;
        btn.disabled = false;
        btn.querySelector('.loader').style.display = 'none';
        btn.querySelector('#loginText').textContent = getTranslation('login');
    }
}

async function handleSignup(event) {
    console.log("🔹 Signup function called");
    if (event) event.preventDefault();
    if (isProcessing) return;
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const btn = document.getElementById('signupBtn');
    
    if (!name || !email || !password) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    isProcessing = true;
    btn.disabled = true;
    btn.querySelector('.loader').style.display = 'block';
    btn.querySelector('#signupText').textContent = 'Creating account...';
    hideMessages();
    
    try {
        console.log("🔹 Attempting signup for:", email);
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        
        console.log("✅ Signup successful");
        const successMsg = document.getElementById('signupSuccess');
        successMsg.textContent = 'Registration successful! Redirecting...';
        successMsg.style.display = 'block';
        
        document.getElementById('signupForm').reset();
        
        setTimeout(() => {
            showLogin();
        }, 2000);
        
    } catch (error) {
        console.error("❌ Signup error:", error);
        const errorMsg = document.getElementById('signupError');
        errorMsg.textContent = 'Registration failed. Please try again.';
        errorMsg.style.display = 'block';
    } finally {
        isProcessing = false;
        btn.disabled = false;
        btn.querySelector('.loader').style.display = 'none';
        btn.querySelector('#signupText').textContent = getTranslation('signUp');
    }
}

async function handleLogout() {
    console.log("🔹 Logout function called");
    try {
        await auth.signOut();
        chatSessions = [];
        currentSessionId = null;
        showNotification(getTranslation('logoutSuccess'));
    } catch (error) {
        console.error("❌ Logout error:", error);
        showNotification('Logout failed', 'error');
    }
}

// ==================== CHAT FUNCTIONS ====================
function createNewChat() {
    console.log("🔹 Creating new chat");
    const sessionId = 'session_' + Date.now();
    
    const newSession = {
        id: sessionId,
        title: getTranslation('newChat'),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    chatSessions.unshift(newSession);
    currentSessionId = sessionId;
    
    saveChatSessions();
    renderSessions();
    clearMessages();
    
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
    
    showNotification('New chat started');
}

function clearMessages() {
    console.log("🔹 Clearing messages");
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.innerHTML = `
        <div class="welcome-screen">
            <div class="ai-logo">🤖</div>
            <h1>${getTranslation('welcomeTitle')}</h1>
            <p>${getTranslation('welcomeSubtitle')}</p>
        </div>
    `;
}

async function sendMessage() {
    console.log("🔹 Send message function called");
    if (isProcessing) return;
    
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) {
        showNotification('Please enter a message', 'error');
        return;
    }
    
    // Add user message
    addMessage(message, true);
    input.value = '';
    
    // Show typing indicator
    const typing = document.getElementById('typingIndicator');
    typing.style.display = 'flex';
    isProcessing = true;
    
    try {
        // Simulate AI response (replace with actual AI later)
        setTimeout(() => {
            typing.style.display = 'none';
            addMessage("I'm your Smart AI assistant. How can I help you today?", false);
            isProcessing = false;
        }, 2000);
        
    } catch (error) {
        console.error("❌ Send message error:", error);
        typing.style.display = 'none';
        addMessage("Sorry, I encountered an error. Please try again.", false);
        isProcessing = false;
    }
}

function addMessage(content, isUser) {
    console.log("🔹 Adding message:", content.substring(0, 50));
    const messagesDiv = document.getElementById('chatMessages');
    
    // Remove welcome screen if present
    const welcome = messagesDiv.querySelector('.welcome-screen');
    if (welcome) {
        welcome.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${content.replace(/\n/g, '<br>')}
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// ==================== IMAGE UPLOAD ====================
function handleImageUpload(event) {
    console.log("🔹 Image upload function called");
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    showLoading('Uploading image...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImage = e.target.result;
        
        const preview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        
        previewImage.src = currentImage;
        preview.style.display = 'block';
        
        hideLoading();
        showNotification('Image uploaded successfully!');
    };
    
    reader.readAsDataURL(file);
    event.target.value = '';
}

function removeImage() {
    console.log("🔹 Removing image");
    currentImage = null;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('previewImage').src = '';
}

// ==================== SESSION MANAGEMENT ====================
function getStorageKey() {
    const userId = auth.currentUser?.uid || 'anonymous';
    return `smartai-sessions-${userId}`;
}

function saveChatSessions() {
    try {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(chatSessions));
    } catch (error) {
        console.error('❌ Save sessions error:', error);
    }
}

function loadChatSessions() {
    try {
        const storageKey = getStorageKey();
        const saved = localStorage.getItem(storageKey);
        
        if (saved) {
            chatSessions = JSON.parse(saved);
        }
        
        if (chatSessions.length === 0) {
            createNewChat();
        } else {
            currentSessionId = chatSessions[0].id;
            renderChatHistory();
        }
        
        renderSessions();
        
    } catch (error) {
        console.error('❌ Load sessions error:', error);
        createNewChat();
    }
}

function renderSessions() {
    console.log("🔹 Rendering sessions");
    const historyContainer = document.getElementById('chatHistory');
    historyContainer.innerHTML = '';
    
    chatSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'history-item';
        if (session.id === currentSessionId) {
            item.classList.add('active');
        }
        
        const lastMessage = session.messages.length > 0 
            ? session.messages[session.messages.length - 1].content 
            : 'No messages yet';
        
        item.innerHTML = `
            <div class="history-title">${session.title}</div>
            <div class="history-preview">${lastMessage.substring(0, 40)}${lastMessage.length > 40 ? '...' : ''}</div>
            <button class="delete-chat-btn" onclick="deleteChat('${session.id}', event)" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        item.onclick = () => switchToSession(session.id);
        historyContainer.appendChild(item);
    });
}

function switchToSession(sessionId) {
    console.log("🔹 Switching to session:", sessionId);
    if (currentSessionId === sessionId) {
        closeSidebar();
        return;
    }
    
    currentSessionId = sessionId;
    renderChatHistory();
    renderSessions();
    closeSidebar();
}

function deleteChat(sessionId, event) {
    console.log("🔹 Deleting chat:", sessionId);
    if (event) event.stopPropagation();
    
    if (!confirm(getTranslation('deleteConfirm'))) return;
    
    const index = chatSessions.findIndex(s => s.id === sessionId);
    if (index === -1) return;
    
    chatSessions.splice(index, 1);
    
    if (currentSessionId === sessionId) {
        if (chatSessions.length > 0) {
            currentSessionId = chatSessions[0].id;
            renderChatHistory();
        } else {
            createNewChat();
        }
    }
    
    saveChatSessions();
    renderSessions();
    showNotification(getTranslation('chatDeleted'));
}

function renderChatHistory() {
    console.log("🔹 Rendering chat history");
    const session = chatSessions.find(s => s.id === currentSessionId);
    if (!session) return;
    
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.innerHTML = '';
    
    if (session.messages.length === 0) {
        clearMessages();
        return;
    }
    
    session.messages.forEach(msg => {
        addMessage(msg.content, msg.isUser);
    });
}

// ==================== INITIALIZATION ====================
window.addEventListener('load', function() {
    console.log("🎯 Page loaded - initializing app");
    initializeFirebase();
    
    // Add event listeners for form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    console.log("✅ All event listeners attached");
});
