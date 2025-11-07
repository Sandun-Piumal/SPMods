// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
    authDomain: "smart-ai-chat-app.firebaseapp.com",
    projectId: "smart-ai-chat-app",
    databaseURL: "https://smart-ai-chat-app-default-rtdb.asia-southeast1.firebasedatabase.app"
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

// SIMPLIFIED FIREBASE INITIALIZATION
function initializeFirebase() {
    try {
        console.log("🔄 Initializing Firebase...");
        
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not loaded');
            showNotification('Please check your internet connection and refresh the page.', 'error');
            return;
        }

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase App initialized");
        
        // Initialize services
        auth = firebase.auth();
        database = firebase.database();
        console.log("✅ Auth & Database initialized");

        // Set up auth state listener
        auth.onAuthStateChanged((user) => {
            console.log("🔐 Auth state:", user ? `User: ${user.email}` : "No user");
            if (user) {
                showChatApp();
                loadChatSessions();
                updateUserProfile(user);
            } else {
                showAuthContainer();
            }
        });

        loadLanguagePreference();
        console.log("🚀 App initialized successfully");
        
    } catch (error) {
        console.error('❌ Firebase init error:', error);
        showNotification('App initialization failed. Please refresh.', 'error');
    }
}

// SIMPLE DATABASE FUNCTIONS
async function saveUserToDatabase(user, name) {
    try {
        if (!database) {
            console.log("📝 Database not available, skipping user save");
            return true;
        }
        
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: name,
            createdAt: Date.now(),
            lastLogin: Date.now()
        };
        
        await database.ref('users/' + user.uid).set(userData);
        console.log("✅ User saved to database");
        return true;
    } catch (error) {
        console.error("❌ User save error:", error);
        return true; // Continue even if database fails
    }
}

// SIMPLE AUTH HANDLERS
async function handleLogin(event) {
    event.preventDefault();
    if (isProcessing) return;
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    isProcessing = true;
    updateButtonState('loginBtn', 'Logging in...', true);
    hideMessages();

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        showNotification('Login successful!', 'success');
        document.getElementById('loginForm').reset();
    } catch (error) {
        console.error('Login error:', error);
        const errorMsg = getAuthErrorMessage(error);
        document.getElementById('loginError').textContent = errorMsg;
        document.getElementById('loginError').style.display = 'block';
    } finally {
        isProcessing = false;
        updateButtonState('loginBtn', 'Login', false);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    if (isProcessing) return;
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (!name || !email || !password) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    isProcessing = true;
    updateButtonState('signupBtn', 'Creating account...', true);
    hideMessages();

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        
        // Try to save to database (but don't block if it fails)
        await saveUserToDatabase(userCredential.user, name);
        
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
        updateButtonState('signupBtn', 'Sign Up', false);
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
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/network-request-failed': 'Network error. Check your connection'
    };
    return messages[error.code] || 'Authentication failed. Please try again.';
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
    document.getElementById('userName').textContent = user.displayName || user.email;
    document.getElementById('userEmail').textContent = user.email;
}

// LANGUAGE FUNCTIONS
function getTranslation(key) {
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
            createAccount: "Create Your Account"
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
            createAccount: "ඔබගේ ගිණුම සාදන්න"
        }
    };
    
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

// BASIC CHAT FUNCTIONALITY (කෝඩ් එක කෙටි කිරීම)
function createNewChat() {
    const sessionId = 'session_' + Date.now();
    const newSession = {
        id: sessionId,
        title: currentLanguage === 'si' ? 'නව සංවාදය' : 'New Chat',
        messages: [],
        createdAt: Date.now()
    };
    
    chatSessions.unshift(newSession);
    currentSessionId = sessionId;
    clearMessages();
    showNotification('New chat started');
}

function clearMessages() {
    document.getElementById('chatMessages').innerHTML = `
        <div class="welcome-screen">
            <div class="ai-logo">🤖</div>
            <h1>Hi, I'm Smart AI</h1>
            <p>How can I help you today?</p>
        </div>
    `;
}

// INITIALIZE APP
window.addEventListener('load', function() {
    console.log("🎯 Page loaded, starting initialization...");
    initializeFirebase();
});

// Add basic error handling for other functions
async function handleLogout() {
    try {
        await auth.signOut();
        showNotification('Logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    }
}

function toggleSidebar() {
    document.getElementById('chatSidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('chatSidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
}
