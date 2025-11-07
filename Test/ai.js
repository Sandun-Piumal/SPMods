// FIREBASE CONFIG - CORRECT URL
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
        logout: "Logout",
        loginSuccess: "Login successful!",
        logoutSuccess: "Logged out successfully!",
        chatDeleted: "Chat deleted!",
        deleteConfirm: "Delete this chat?"
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
        logout: "ඉවත් වන්න",
        loginSuccess: "පිවිසුම සාර්ථකයි!",
        logoutSuccess: "සාර්ථකව ඉවත් විය!",
        chatDeleted: "සංවාදය මකා දමන ලදී!",
        deleteConfirm: "මෙම සංවාදය මකන්න ද?"
    }
};

// LANGUAGE FUNCTIONS
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

    localStorage.setItem('smartai-language', currentLanguage);
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'si' : 'en';
    updateLanguage();
}

function loadLanguagePreference() {
    const savedLang = localStorage.getItem('smartai-language');
    if (savedLang && (savedLang === 'en' || savedLang === 'si')) {
        currentLanguage = savedLang;
        updateLanguage();
    }
}

// FIREBASE INITIALIZATION
function initializeFirebase() {
    try {
        console.log("🔄 Starting Firebase initialization...");
        
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not loaded');
            showNotification('Please check internet connection', 'error');
            return;
        }

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase App initialized");
        
        // Initialize services
        auth = firebase.auth();
        database = firebase.database();
        console.log("✅ Auth & Database services ready");

        // Auth state listener
        auth.onAuthStateChanged((user) => {
            console.log("🔐 Auth state changed:", user ? user.email : "No user");
            if (user) {
                showChatApp();
                loadChatSessions();
                updateUserProfile(user);
                saveUserToDatabase(user);
            } else {
                showAuthContainer();
            }
        });

        loadLanguagePreference();
        console.log("🚀 App ready!");
        
    } catch (error) {
        console.error('❌ Init error:', error);
        showNotification('App load failed. Refresh page.', 'error');
    }
}

// DATABASE FUNCTIONS
async function saveUserToDatabase(user) {
    try {
        if (!database) {
            console.log("ℹ️ Database not available");
            return;
        }
        
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            lastLogin: Date.now()
        };
        
        await database.ref('users/' + user.uid).set(userData);
        console.log("✅ User data saved to database");
    } catch (error) {
        console.error("❌ User save error:", error);
    }
}

async function saveChatSessionsToDatabase() {
    try {
        const user = auth.currentUser;
        if (!user || !database) {
            saveChatSessionsToLocal();
            return;
        }
        
        await database.ref('userChatSessions/' + user.uid).set({
            sessions: chatSessions,
            lastUpdated: Date.now()
        });
        console.log("✅ Chat sessions saved to database");
    } catch (error) {
        console.error("❌ Sessions save error:", error);
        saveChatSessionsToLocal();
    }
}

async function loadChatSessionsFromDatabase() {
    try {
        const user = auth.currentUser;
        if (!user || !database) return false;
        
        const snapshot = await database.ref('userChatSessions/' + user.uid).once('value');
        const data = snapshot.val();
        
        if (data && data.sessions) {
            chatSessions = data.sessions;
            console.log("✅ Chat sessions loaded from database");
            return true;
        }
        return false;
    } catch (error) {
        console.error("❌ Sessions load error:", error);
        return false;
    }
}

// AUTH HANDLERS
async function handleLogin(event) {
    event.preventDefault();
    if (isProcessing) return;
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    isProcessing = true;
    updateButtonState('loginBtn', 'Logging in...', true);
    hideMessages();

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        showNotification(getTranslation('loginSuccess'));
        document.getElementById('loginForm').reset();
    } catch (error) {
        console.error('Login error:', error);
        const errorMsg = getAuthErrorMessage(error);
        document.getElementById('loginError').textContent = errorMsg;
        document.getElementById('loginError').style.display = 'block';
    } finally {
        isProcessing = false;
        updateButtonState('loginBtn', getTranslation('login'), false);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    if (isProcessing) return;
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    isProcessing = true;
    updateButtonState('signupBtn', 'Creating account...', true);
    hideMessages();

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        
        await saveUserToDatabase(userCredential.user);
        
        document.getElementById('signupSuccess').textContent = 'Account created successfully!';
        document.getElementById('signupSuccess').style.display = 'block';
        document.getElementById('signupForm').reset();
        
        setTimeout(() => {
            showLogin();
        }, 2000);
        
    } catch (error) {
        console.error('Signup error:', error);
        const errorMsg = getAuthErrorMessage(error);
        document.getElementById('signupError').textContent = errorMsg;
        document.getElementById('signupError').style.display = 'block';
    } finally {
        isProcessing = false;
        updateButtonState('signupBtn', getTranslation('signUp'), false);
    }
}

// HELPER FUNCTIONS
function updateButtonState(buttonId, text, loading) {
    const btn = document.getElementById(buttonId);
    const loader = btn.querySelector('.loader');
    const textSpan = btn.querySelector('span:last-child');
    
    btn.disabled = loading;
    loader.style.display = loading ? 'block' : 'none';
    textSpan.textContent = text;
}

function getAuthErrorMessage(error) {
    const messages = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already registered',
        'auth/weak-password': 'Password should be at least 6 characters'
    };
    return messages[error.code] || 'Authentication failed';
}

// UI FUNCTIONS
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    hideMessages();
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    hideMessages();
}

function showAuthContainer() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('chatApp').style.display = 'none';
}

function showChatApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('chatApp').style.display = 'block';
}

function hideMessages() {
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('signupError').style.display = 'none';
    document.getElementById('signupSuccess').style.display = 'none';
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    notification.className = `notification ${type}`;
    text.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function updateUserProfile(user) {
    document.getElementById('userName').textContent = user.displayName || user.email.split('@')[0];
    document.getElementById('userEmail').textContent = user.email;
}

// SESSION MANAGEMENT
function getStorageKey() {
    const userId = auth.currentUser?.uid || 'anonymous';
    return `smartai-sessions-${userId}`;
}

function saveChatSessionsToLocal() {
    try {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(chatSessions));
    } catch (error) {
        console.error('Local save error:', error);
    }
}

function loadChatSessionsFromLocal() {
    try {
        const storageKey = getStorageKey();
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            chatSessions = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Local load error:', error);
    }
}

function loadChatSessions() {
    loadChatSessionsFromDatabase().then(success => {
        if (!success) {
            loadChatSessionsFromLocal();
        }
        
        if (chatSessions.length === 0) {
            createNewChat();
        } else {
            currentSessionId = chatSessions[0].id;
            renderChatHistory();
        }
        renderSessions();
    });
}

function saveChatSessions() {
    saveChatSessionsToDatabase();
    saveChatSessionsToLocal();
}

function createNewChat() {
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
}

function clearMessages() {
    document.getElementById('chatMessages').innerHTML = `
        <div class="welcome-screen">
            <div class="ai-logo">🤖</div>
            <h1>${getTranslation('welcomeTitle')}</h1>
            <p>${getTranslation('welcomeSubtitle')}</p>
        </div>
    `;
}

// BASIC CHAT FUNCTIONS
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        addMessage("I'm your Smart AI assistant. How can I help you?", false);
    }, 1000);
}

function addMessage(content, isUser) {
    const messagesDiv = document.getElementById('chatMessages');
    const welcome = messagesDiv.querySelector('.welcome-screen');
    if (welcome) welcome.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// INITIALIZE APP
window.addEventListener('load', initializeFirebase);
