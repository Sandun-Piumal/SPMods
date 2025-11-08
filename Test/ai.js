// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
    authDomain: "smart-ai-chat-app.firebaseapp.com",
    projectId: "smart-ai-chat-app",
    databaseURL: "https://smart-ai-chat-app-default-rtdb.firebaseio.com"
};

// GEMINI API KEY
const GEMINI_API_KEY = 'AIzaSyAJhruzaSUiKhP8GP7ZLg2h25GBTSKq1gs';

// APP VERSION
const APP_VERSION = '1.0.1';
const VERSION_KEY = 'smartai-version';

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
        processingImage: "Processing image...",
        analyzingImage: "Analyzing image content...",
        imageAnalyzed: "Image analyzed!",
        checkUpdates: "Check for Updates",
        updatesAvailable: "New version available!",
        latestVersion: "You have the latest version!"
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
        processingImage: "පින්තූරය සකසමින්...",
        analyzingImage: "පින්තූරය විශ්ලේෂණය කරමින්...",
        imageAnalyzed: "පින්තූරය විශ්ලේෂණය කරන ලදී!",
        checkUpdates: "යාවත්කාලීන පරීක්ෂා කරන්න",
        updatesAvailable: "නව අනුවාදයක් තිබේ!",
        latestVersion: "ඔබට නවතම අනුවාදය තිබේ!"
    }
};

// VERSION CONTROL
function checkForUpdates() {
    const savedVersion = localStorage.getItem(VERSION_KEY);
    
    if (savedVersion !== APP_VERSION) {
        console.log('🔄 New version detected, clearing cache...');
        
        // Clear old caches
        if ('caches' in window) {
            caches.keys().then(function(cacheNames) {
                cacheNames.forEach(function(cacheName) {
                    caches.delete(cacheName);
                });
            });
        }
        
        // Clear localStorage if needed
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('smartai-')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Update version
        localStorage.setItem(VERSION_KEY, APP_VERSION);
        
        // Force reload
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

function checkForAppUpdates() {
    const currentVersion = localStorage.getItem(VERSION_KEY);
    if (currentVersion !== APP_VERSION) {
        showNotification(getTranslation('updatesAvailable'), 'info');
        setTimeout(() => {
            localStorage.setItem(VERSION_KEY, APP_VERSION);
            window.location.reload();
        }, 2000);
    } else {
        showNotification(getTranslation('latestVersion'), 'success');
    }
}

function setupAutoUpdateCheck() {
    // Check every 5 minutes for updates
    setInterval(() => {
        const currentVersion = localStorage.getItem(VERSION_KEY);
        if (currentVersion !== APP_VERSION) {
            showNotification(getTranslation('updatesAvailable'), 'info');
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    }, 5 * 60 * 1000);
}

// LANGUAGE FUNCTIONS
function getTranslation(key) {
    return translations[currentLanguage][key] || translations.en[key] || key;
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation) {
            element.textContent = translation;
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = getTranslation(key);
        if (translation) {
            element.placeholder = translation;
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        const translation = getTranslation(key);
        if (translation) {
            element.title = translation;
        }
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
    }
    updateLanguage();
}

// FIREBASE INITIALIZATION
function initializeFirebase() {
    try {
        console.log("🔄 Initializing Firebase...");
        
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not loaded');
            showNotification('Please check your internet connection', 'error');
            return;
        }

        // Initialize Firebase app
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        } else {
            firebase.app();
        }
        
        auth = firebase.auth();
        database = firebase.database();
        
        console.log("✅ Firebase initialized successfully");

        // Auth state listener
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

// UI FUNCTIONS
function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
    hideMessages();
}

function showSignup() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
    hideMessages();
}

function showAuthContainer() {
    const authContainer = document.getElementById('authContainer');
    const chatApp = document.getElementById('chatApp');
    
    if (authContainer) authContainer.style.display = 'flex';
    if (chatApp) chatApp.style.display = 'none';
}

function showChatApp() {
    const authContainer = document.getElementById('authContainer');
    const chatApp = document.getElementById('chatApp');
    
    if (authContainer) authContainer.style.display = 'none';
    if (chatApp) chatApp.style.display = 'block';
}

function hideMessages() {
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');
    const signupSuccess = document.getElementById('signupSuccess');
    
    if (loginError) loginError.style.display = 'none';
    if (signupError) signupError.style.display = 'none';
    if (signupSuccess) signupSuccess.style.display = 'none';
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    if (!notification || !text) return;
    
    const icon = notification.querySelector('i');
    notification.className = `notification ${type}`;
    text.textContent = message;
    
    if (icon) {
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
        } else {
            icon.className = 'fas fa-exclamation-circle';
        }
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showLoading(text) {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (overlay && loadingText) {
        loadingText.textContent = text;
        overlay.classList.add('show');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function updateUserProfile(user) {
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    
    if (userNameElement) {
        userNameElement.textContent = user.displayName || user.email.split('@')[0] || 'User';
    }
    if (userEmailElement) {
        userEmailElement.textContent = user.email || '';
    }
}

// FIREBASE DATABASE FUNCTIONS
async function saveUserToDatabase(userId, name, email) {
    try {
        const userData = {
            name: name,
            email: email,
            createdAt: Date.now(),
            lastLogin: Date.now(),
            chatSessions: []
        };
        
        const userRef = database.ref('users/' + userId);
        await userRef.set(userData);
        
        console.log("✅ User data saved to Firebase Database");
        return true;
        
    } catch (error) {
        console.error("❌ Error saving user to database:", error);
        throw error;
    }
}

async function updateUserInDatabase() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userRef = database.ref('users/' + user.uid);
        await userRef.update({
            lastLogin: Date.now()
        });
        
        console.log("✅ User last login updated");
        
    } catch (error) {
        console.error("❌ Error updating user in database:", error);
    }
}

// AUTH HANDLERS
async function handleLogin(event) {
    if (event) event.preventDefault();
    if (isProcessing) return;
    
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    const btn = document.getElementById('loginBtn');
    
    if (!email || !password || !email.value || !password.value) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    isProcessing = true;
    if (btn) {
        btn.disabled = true;
        const loader = btn.querySelector('.loader');
        const loginText = btn.querySelector('#loginText');
        if (loader) loader.style.display = 'block';
        if (loginText) loginText.textContent = 'Logging in...';
    }
    
    hideMessages();
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email.value, password.value);
        await updateUserInDatabase();
        showNotification(getTranslation('loginSuccess'));
        if (email) email.value = '';
        if (password) password.value = '';
        
    } catch (error) {
        console.error("Login error:", error);
        const errorMsg = document.getElementById('loginError');
        
        if (errorMsg) {
            if (error.code === 'auth/user-not-found') {
                errorMsg.textContent = 'No account found with this email. Please sign up.';
            } else if (error.code === 'auth/wrong-password') {
                errorMsg.textContent = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                errorMsg.textContent = 'Invalid email address.';
            } else {
                errorMsg.textContent = 'Login failed. Please check your credentials.';
            }
            errorMsg.style.display = 'block';
        }
    } finally {
        isProcessing = false;
        if (btn) {
            btn.disabled = false;
            const loader = btn.querySelector('.loader');
            const loginText = btn.querySelector('#loginText');
            if (loader) loader.style.display = 'none';
            if (loginText) loginText.textContent = getTranslation('login');
        }
    }
}

async function handleSignup(event) {
    if (event) event.preventDefault();
    if (isProcessing) return;
    
    const name = document.getElementById('signupName');
    const email = document.getElementById('signupEmail');
    const password = document.getElementById('signupPassword');
    const btn = document.getElementById('signupBtn');
    
    if (!name || !email || !password || !name.value || !email.value || !password.value) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    if (password.value.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    isProcessing = true;
    if (btn) {
        btn.disabled = true;
        const loader = btn.querySelector('.loader');
        const signupText = btn.querySelector('#signupText');
        if (loader) loader.style.display = 'block';
        if (signupText) signupText.textContent = 'Creating account...';
    }
    
    hideMessages();
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email.value, password.value);
        const user = userCredential.user;
        
        await user.updateProfile({ 
            displayName: name.value 
        });
        
        await saveUserToDatabase(user.uid, name.value, email.value);
        
        const successMsg = document.getElementById('signupSuccess');
        if (successMsg) {
            successMsg.textContent = 'Registration successful! Redirecting...';
            successMsg.style.display = 'block';
        }
        
        if (name) name.value = '';
        if (email) email.value = '';
        if (password) password.value = '';
        
        setTimeout(() => {
            showLogin();
        }, 2000);
        
    } catch (error) {
        console.error("Signup error:", error);
        const errorMsg = document.getElementById('signupError');
        
        if (errorMsg) {
            if (error.code === 'auth/email-already-in-use') {
                errorMsg.textContent = 'This email is already registered. Please login.';
            } else if (error.code === 'auth/weak-password') {
                errorMsg.textContent = 'Password is too weak. Please use a stronger password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMsg.textContent = 'Invalid email address.';
            } else {
                errorMsg.textContent = 'Registration failed. Please try again.';
            }
            errorMsg.style.display = 'block';
        }
    } finally {
        isProcessing = false;
        if (btn) {
            btn.disabled = false;
            const loader = btn.querySelector('.loader');
            const signupText = btn.querySelector('#signupText');
            if (loader) loader.style.display = 'none';
            if (signupText) signupText.textContent = getTranslation('signUp');
        }
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        chatSessions = [];
        currentSessionId = null;
        showNotification(getTranslation('logoutSuccess'));
    } catch (error) {
        console.error("Logout error:", error);
        showNotification('Logout failed', 'error');
    }
}

// GEMINI AI FUNCTIONS
async function getAIResponse(userMessage, imageData = null) {
    console.log("🤖 Getting AI response...", { userMessage, hasImage: !!imageData });
    
    try {
        let apiUrl, requestBody;

        if (imageData) {
            // Vision API
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            requestBody = {
                contents: [{
                    parts: [
                        { text: userMessage },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: imageData.split(',')[1]
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 2048,
                }
            };
        } else {
            // Text API
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            requestBody = {
                contents: [{
                    parts: [{ text: userMessage }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            };
        }
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiResponse) {
            throw new Error('Empty response from AI');
        }
        
        console.log("✅ AI API success");
        return aiResponse;
        
    } catch (error) {
        console.error('❌ AI Error:', error);
        
        if (currentLanguage === 'si') {
            return 'මට කණගාටුයි, දෝෂයක් ඇතිවිය. කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න.';
        } else {
            return 'I apologize, but I encountered an error. Please try again in a moment.';
        }
    }
}

// CHAT FUNCTIONS
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
    
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
    
    showNotification('New chat started');
}

function clearMessages() {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    messagesDiv.innerHTML = `
        <div class="welcome-screen">
            <div class="ai-logo">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="logoGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#357ABD;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <circle cx="40" cy="40" r="38" fill="url(#logoGrad3)"/>
                    <path d="M25 35 L40 20 L55 35 L48 35 L48 55 L32 55 L32 35 Z" fill="white" opacity="0.9"/>
                    <circle cx="40" cy="60" r="4" fill="white" opacity="0.9"/>
                </svg>
            </div>
            <h1>${getTranslation('welcomeTitle')}</h1>
            <p>${getTranslation('welcomeSubtitle')}</p>
        </div>
    `;
}

async function sendMessage() {
    if (isProcessing) return;
    
    const input = document.getElementById('messageInput');
    const message = input ? input.value.trim() : '';
    
    if (!message && !currentImage) {
        showNotification('Please enter a message or upload an image', 'error');
        return;
    }
    
    const messageToSend = message || (currentLanguage === 'si' ? 
        'මෙම පින්තූරය ගැන මට කියන්න' : 
        'Tell me about this image');
    
    addMessageToChat(messageToSend, true, currentImage);
    
    if (input) input.value = '';
    
    const sendBtn = document.getElementById('sendButton');
    const typing = document.getElementById('typingIndicator');
    
    isProcessing = true;
    if (sendBtn) sendBtn.disabled = true;
    if (typing) typing.style.display = 'flex';
    
    try {
        console.log("🔄 Getting AI response...");
        const response = await getAIResponse(messageToSend, currentImage);
        
        if (typing) typing.style.display = 'none';
        addMessageToChat(response, false);
        
        if (currentImage) {
            showNotification(getTranslation('imageAnalyzed'));
        }
        
    } catch (error) {
        console.error("❌ Error in sendMessage:", error);
        if (typing) typing.style.display = 'none';
        
        const errorMsg = currentLanguage === 'si' 
            ? 'මට කණගාටුයි, දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.'
            : 'Sorry, an error occurred. Please try again.';
        
        addMessageToChat(errorMsg, false);
    } finally {
        isProcessing = false;
        if (sendBtn) sendBtn.disabled = false;
        currentImage = null;
        removeImage();
        if (input) input.focus();
    }
}

function addMessageToChat(content, isUser, imageData = null) {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    const welcome = messagesDiv.querySelector('.welcome-screen');
    if (welcome) {
        welcome.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const avatarIcon = isUser ? 
        '<div class="message-avatar"><i class="fas fa-user"></i></div>' : 
        '<div class="message-avatar"><i class="fas fa-robot"></i></div>';
    
    const messageLabel = isUser ? 
        (currentLanguage === 'si' ? 'ඔබ' : 'You') : 
        'Smart AI';
    
    let imageHTML = '';
    if (imageData) {
        imageHTML = `
            <div class="image-container">
                <img src="${imageData}" alt="Uploaded image" class="message-image">
                <div class="image-caption">${currentLanguage === 'si' ? 'ඔබ උඩුගත කළ පින්තූරය' : 'Image you uploaded'}</div>
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="message-header">
            ${avatarIcon}
            <span>${messageLabel}</span>
        </div>
        <div class="message-content">
            ${imageHTML}
            <div class="message-text">${content.replace(/\n/g, '<br>')}</div>
        </div>
        ${!isUser ? `
            <div class="message-actions">
                <button class="action-btn copy-btn" onclick="copyMessage(this)">
                    <i class="fas fa-copy"></i> ${currentLanguage === 'si' ? 'පිටපත්' : 'Copy'}
                </button>
            </div>
        ` : ''}
    `;
    
    messagesDiv.appendChild(messageDiv);
    
    const session = getCurrentSession();
    if (session) {
        session.messages.push({
            content: content,
            isUser: isUser,
            imageData: imageData,
            timestamp: Date.now()
        });
        
        session.updatedAt = Date.now();
        
        if (isUser && session.messages.filter(m => m.isUser).length === 1) {
            const titleText = content.replace(/<[^>]*>/g, '').substring(0, 30);
            session.title = titleText + (titleText.length >= 30 ? '...' : '');
        }
        
        saveChatSessions();
        renderSessions();
    }
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function copyMessage(button) {
    const messageContent = button.closest('.message');
    if (!messageContent) return;
    
    const messageText = messageContent.querySelector('.message-text');
    if (!messageText) return;
    
    const textContent = messageText.textContent || messageText.innerText;
    
    navigator.clipboard.writeText(textContent).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = `<i class="fas fa-check"></i> ${currentLanguage === 'si' ? 'පිටපත් විය!' : 'Copied!'}`;
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

// IMAGE UPLOAD
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    showLoading(getTranslation('processingImage'));
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImage = e.target.result;
        
        const preview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        
        if (preview && previewImage) {
            previewImage.src = currentImage;
            preview.style.display = 'block';
        }
        
        hideLoading();
        showNotification(getTranslation('imageUploaded'));
        
        const messageInput = document.getElementById('messageInput');
        if (messageInput) messageInput.focus();
    };
    
    reader.onerror = function() {
        hideLoading();
        showNotification('Failed to load image', 'error');
    };
    
    reader.readAsDataURL(file);
    event.target.value = '';
}

function removeImage() {
    currentImage = null;
    const preview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    
    if (preview) preview.style.display = 'none';
    if (previewImage) previewImage.src = '';
}

// SESSION MANAGEMENT
function getStorageKey() {
    const userId = auth && auth.currentUser ? auth.currentUser.uid : 'anonymous';
    return `smartai-sessions-${userId}`;
}

async function saveChatSessions() {
    try {
        const userId = auth && auth.currentUser ? auth.currentUser.uid : null;
        const storageKey = getStorageKey();
        
        localStorage.setItem(storageKey, JSON.stringify(chatSessions));
        
        if (userId && database) {
            const userSessionsRef = database.ref('users/' + userId + '/chatSessions');
            await userSessionsRef.set(chatSessions);
            console.log("✅ Data saved to both localStorage and Firebase");
        }
        
    } catch (error) {
        console.error('❌ Save sessions error:', error);
    }
}

async function loadChatSessions() {
    try {
        const userId = auth && auth.currentUser ? auth.currentUser.uid : null;
        const storageKey = getStorageKey();
        
        let sessions = [];

        // Try to load from Firebase first
        if (userId && database) {
            try {
                const userSessionsRef = database.ref('users/' + userId + '/chatSessions');
                const snapshot = await userSessionsRef.once('value');
                
                if (snapshot.exists()) {
                    sessions = snapshot.val();
                    console.log("✅ Loaded from Firebase");
                }
            } catch (firebaseError) {
                console.log("⚠️ Firebase load failed:", firebaseError);
            }
        }

        // Fallback to localStorage
        if (!sessions || sessions.length === 0) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    sessions = JSON.parse(saved);
                    console.log("✅ Loaded from localStorage");
                } catch (parseError) {
                    console.error("❌ Failed to parse localStorage data:", parseError);
                    sessions = [];
                }
            }
        }

        chatSessions = Array.isArray(sessions) ? sessions : [];

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
    const historyContainer = document.getElementById('chatHistory');
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '';
    
    chatSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'history-item';
        if (session.id === currentSessionId) {
            item.classList.add('active');
        }
        
        const lastMessage = session.messages && session.messages.length > 0 
            ? session.messages[session.messages.length - 1].content 
            : (currentLanguage === 'si' ? 'තවම පණිවිඩ නැත' : 'No messages yet');
        
        const timeStr = getTimeString(session.updatedAt);
        
        item.innerHTML = `
            <div class="history-title">${escapeHtml(session.title || getTranslation('newChat'))}</div>
            <div class="history-preview">${escapeHtml((lastMessage || '').substring(0, 40))}${(lastMessage || '').length > 40 ? '...' : ''}</div>
            <div class="history-time">${timeStr}</div>
            <button class="delete-chat-btn" onclick="deleteChat('${session.id}', event)" title="${currentLanguage === 'si' ? 'මකන්න' : 'Delete'}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        item.onclick = () => switchToSession(session.id);
        historyContainer.appendChild(item);
    });
}

function getTimeString(timestamp) {
    if (!timestamp) return '';
    
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (currentLanguage === 'si') {
        if (days === 0) return 'අද';
        if (days === 1) return 'ඊයේ';
        if (days < 7) return `දින ${days}කට පෙර`;
        return new Date(timestamp).toLocaleDateString('si-LK');
    } else {
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return new Date(timestamp).toLocaleDateString();
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function switchToSession(sessionId) {
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
    if (event) event.stopPropagation();
    
    const confirmMsg = getTranslation('deleteConfirm');
    if (!confirm(confirmMsg)) return;
    
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

function getCurrentSession() {
    return chatSessions.find(s => s.id === currentSessionId);
}

function renderChatHistory() {
    const session = getCurrentSession();
    const messagesDiv = document.getElementById('chatMessages');
    
    if (!messagesDiv) return;
    messagesDiv.innerHTML = '';
    
    if (!session || !session.messages || session.messages.length === 0) {
        clearMessages();
        return;
    }
    
    session.messages.forEach(msg => {
        addMessageToChat(msg.content, msg.isUser, msg.imageData);
    });
}

// SETTINGS MENU
function toggleSettings() {
    const settingsMenu = document.querySelector('.settings-menu');
    if (settingsMenu) {
        settingsMenu.classList.toggle('active');
    }
}

function addUpdateButton() {
    const settingsMenu = document.querySelector('.settings-menu');
    if (!settingsMenu) return;
    
    const updateBtn = document.createElement('button');
    updateBtn.className = 'action-btn';
    updateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> ' + getTranslation('checkUpdates');
    updateBtn.onclick = checkForAppUpdates;
    
    settingsMenu.appendChild(updateBtn);
}

// INITIALIZE APP
window.addEventListener('load', function() {
    console.log("🎯 Page loaded - initializing app");
    checkForUpdates();
    initializeFirebase();
    
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    addUpdateButton();
    
    console.log("✅ App initialized");
});

// Add CSS for image display
const style = document.createElement('style');
style.textContent = `
    .image-container {
        margin-bottom: 10px;
        text-align: center;
    }
    .message-image {
        max-width: 300px;
        max-height: 300px;
        border-radius: 8px;
        border: 2px solid #4A90E2;
    }
    .image-caption {
        font-size: 12px;
        color: #888;
        margin-top: 5px;
    }
    .message-text {
        line-height: 1.5;
        word-wrap: break-word;
    }
    
    /* Settings menu update button */
    .settings-menu .action-btn {
        width: 100%;
        margin: 5px 0;
        text-align: left;
    }
`;
document.head.appendChild(style);
