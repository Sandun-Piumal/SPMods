import { getDatabase, ref, set } from "firebase/database";
// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
    authDomain: "smart-ai-chat-app.firebaseapp.com",
    projectId: "smart-ai-chat-app"
};

// GEMINI API KEY
const GEMINI_API_KEY = 'AIzaSyAJhruzaSUiKhP8GP7ZLg2h25GBTSKq1gs';

// STATE VARIABLES
let auth = null;
let isProcessing = false;
let chatSessions = [];
let currentSessionId = null;
let currentImage = null;
let currentOCRText = '';
let currentLanguage = 'en'; // Default language

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

// LANGUAGE FUNCTIONS
function getTranslation(key) {
    return translations[currentLanguage][key] || translations.en[key] || key;
}

function updateLanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = getTranslation(key);
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = getTranslation(key);
    });

    // Update titles
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = getTranslation(key);
    });

    // Save language preference
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

// INITIALIZE FIREBASE
function initializeFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            setTimeout(initializeFirebase, 100);
            return;
        }
        
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        auth = firebase.auth();
        
        auth.onAuthStateChanged((user) => {
            if (user) {
                showChatApp();
                loadChatSessions();
                updateUserProfile(user);
            } else {
                showAuthContainer();
            }
        });
        
        loadLanguagePreference();
        console.log("✅ Firebase initialized");
    } catch (error) {
        console.error("Firebase error:", error);
        showNotification("System error occurred", "error");
    }
}

// UPDATE USER PROFILE
function updateUserProfile(user) {
    const userName = user.displayName || user.email.split('@')[0];
    const userEmail = user.email;
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userEmail').textContent = userEmail;
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
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    loadingText.textContent = text;
    overlay.classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function toggleSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// AUTH HANDLERS
async function handleLogin(event) {
    event.preventDefault();
    if (isProcessing) return;
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    const loader = document.getElementById('loginLoader');
    const text = document.getElementById('loginText');
    
    isProcessing = true;
    btn.disabled = true;
    loader.style.display = 'block';
    text.textContent = currentLanguage === 'si' ? 'ඇතුල් වෙමින්...' : 'Logging in...';
    hideMessages();
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showNotification(getTranslation('loginSuccess'));
        document.getElementById('loginForm').reset();
    } catch (error) {
        const errorMsg = document.getElementById('loginError');
        errorMsg.textContent = currentLanguage === 'si' 
            ? 'පිවිසුම අසාර්ථකයි. ඔබගේ තොරතුරු පරීක්ෂා කරන්න.'
            : 'Login failed. Please check your credentials.';
        errorMsg.style.display = 'block';
    } finally {
        isProcessing = false;
        btn.disabled = false;
        loader.style.display = 'none';
        text.textContent = getTranslation('login');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    if (isProcessing) return;
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const btn = document.getElementById('signupBtn');
    const loader = document.getElementById('signupLoader');
    const text = document.getElementById('signupText');
    
    isProcessing = true;
    btn.disabled = true;
    loader.style.display = 'block';
    text.textContent = currentLanguage === 'si' ? 'ගිණුම සාදමින්...' : 'Creating account...';
    hideMessages();
    
    try {
    try {
    // 1. User account එක create කරනවා
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // 2. Display name එක update කරනවා
    await user.updateProfile({ 
        displayName: name 
    });
    
    // 3. 🔥 IMPORTANT: මේ NEW PART එක ADD කරන්න
    const db = getDatabase();
    await set(ref(db, 'users/' + user.uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString()
    });
    
    // 4. User profile reload කරනවා
    await user.reload();
    
    const successMsg = document.getElementById('signupSuccess');
    successMsg.textContent = currentLanguage === 'si' 
        ? 'ලියාපදිංචිය සාර්ථකයි! හරවනු ලැබේ...'
        : 'Registration successful! Redirecting...';
    successMsg.style.display = 'block';
    
    document.getElementById('signupForm').reset();
    
    setTimeout(() => {
        showLogin();
    }, 2000);
} catch (error) {
    // Error handling
        
        const errorMsg = document.getElementById('signupError');
        if (error.code === 'auth/email-already-in-use') {
            errorMsg.textContent = currentLanguage === 'si' 
                ? 'මෙම විද්‍යුත් ලිපිනය දැනටමත් ලියාපදිංචි වී ඇත.'
                : 'This email is already registered.';
        } else if (error.code === 'auth/weak-password') {
            errorMsg.textContent = currentLanguage === 'si' 
                ? 'මුරපදය දුර්වලයි. අවම අක්ෂර 6ක් භාවිතා කරන්න.'
                : 'Password too weak. Use at least 6 characters.';
        } else {
            errorMsg.textContent = currentLanguage === 'si' 
                ? 'ලියාපදිංචිය අසාර්ථකයි. නැවත උත්සාහ කරන්න.'
                : 'Registration failed. Try again.';
        }
        errorMsg.style.display = 'block';
    } finally {
        isProcessing = false;
        btn.disabled = false;
        loader.style.display = 'none';
        text.textContent = getTranslation('signUp');
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        chatSessions = [];
        currentSessionId = null;
        currentImage = null;
        currentOCRText = '';
        showNotification(getTranslation('logoutSuccess'));
    } catch (error) {
        showNotification(currentLanguage === 'si' ? 'ඉවත්වීම අසාර්ථකයි' : 'Logout failed', 'error');
    }
}

// SESSION MANAGEMENT
function getStorageKey() {
    const userId = auth.currentUser?.uid || 'anonymous';
    return `smartai-sessions-${userId}`;
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
        console.error('Load error:', error);
        createNewChat();
    }
}

function saveChatSessions() {
    try {
        const storageKey = getStorageKey();
        if (chatSessions.length > 50) {
            chatSessions = chatSessions.slice(0, 50);
        }
        localStorage.setItem(storageKey, JSON.stringify(chatSessions));
    } catch (error) {
        console.error('Save error:', error);
    }
}

function createNewChat() {
    const sessionId = generateSessionId();
    
    const newSession = {
        id: sessionId,
        title: currentLanguage === 'si' ? 'නව සංවාදය' : 'New Chat',
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
    event.stopPropagation();
    
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

function renderSessions() {
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
            : (currentLanguage === 'si' ? 'තවම පණිවිඩ නැත' : 'No messages yet');
        
        const timeStr = getTimeString(session.updatedAt);
        
        item.innerHTML = `
            <div class="history-title">${escapeHtml(session.title)}</div>
            <div class="history-preview">${escapeHtml(lastMessage.substring(0, 40))}${lastMessage.length > 40 ? '...' : ''}</div>
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
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// CHAT MESSAGES
function clearMessages() {
    const messagesDiv = document.getElementById('chatMessages');
    
    const logoSvg = `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#357ABD;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="38" fill="url(#logoGrad3)"/>
        <path d="M25 35 L40 20 L55 35 L48 35 L48 55 L32 55 L32 35 Z" fill="white" opacity="0.9"/>
        <circle cx="40" cy="60" r="4" fill="white" opacity="0.9"/>
        <path d="M18 40 Q18 28, 32 20" stroke="white" stroke-width="2.5" fill="none" opacity="0.5"/>
        <path d="M62 40 Q62 28, 48 20" stroke="white" stroke-width="2.5" fill="none" opacity="0.5"/>
    </svg>`;
    
    messagesDiv.innerHTML = `
        <div class="welcome-screen">
            <div class="ai-logo">${logoSvg}</div>
            <h1 id="welcomeTitle" data-i18n="welcomeTitle">${getTranslation('welcomeTitle')}</h1>
            <p id="welcomeSubtitle" data-i18n="welcomeSubtitle">${getTranslation('welcomeSubtitle')}</p>
        </div>
    `;
}

function renderChatHistory() {
    const session = getCurrentSession();
    if (!session) return;
    
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.innerHTML = '';
    
    if (session.messages.length === 0) {
        clearMessages();
        return;
    }
    
    session.messages.forEach(msg => {
        addMessageToDOM(msg.content, msg.isUser, msg.imageData, false);
    });
    
    scrollToBottom();
}

function addMessageToDOM(content, isUser, imageData = null, animate = true) {
    const messagesDiv = document.getElementById('chatMessages');
    
    const welcome = messagesDiv.querySelector('.welcome-screen');
    if (welcome) {
        welcome.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const avatarIcon = isUser ? '<i class="fas fa-user"></i>' : `<svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="msgLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#357ABD;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="19" fill="url(#msgLogo)"/>
        <path d="M13 17 L20 10 L27 17 L24 17 L24 27 L16 27 L16 17 Z" fill="white" opacity="0.9"/>
        <circle cx="20" cy="30" r="2" fill="white" opacity="0.9"/>
    </svg>`;
    
    const messageLabel = isUser 
        ? (currentLanguage === 'si' ? 'ඔබ' : 'You')
        : 'Smart AI';
    
    let imageHTML = '';
    if (imageData) {
        imageHTML = `<img src="${imageData}" alt="Uploaded" class="message-image">`;
    }
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">${avatarIcon}</div>
            ${messageLabel}
        </div>
        <div class="message-content">
            ${imageHTML}
            ${content.replace(/\n/g, '<br>')}
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
    
    if (animate) {
        scrollToBottom();
    }
}

function addMessage(content, isUser, imageData = null) {
    addMessageToDOM(content, isUser, imageData, true);
    
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
}

function scrollToBottom() {
    const messagesDiv = document.getElementById('chatMessages');
    setTimeout(() => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 100);
}

function copyMessage(button) {
    const messageContent = button.closest('.message').querySelector('.message-content');
    const textContent = messageContent.innerText || messageContent.textContent;
    
    navigator.clipboard.writeText(textContent).then(() => {
        const originalHTML = button.innerHTML;
        const copiedText = currentLanguage === 'si' ? 'පිටපත් විය!' : 'Copied!';
        button.innerHTML = `<i class="fas fa-check"></i> ${copiedText}`;
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
        }, 2000);
    });
}

// IMAGE UPLOAD
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification(currentLanguage === 'si' ? 'කරුණාකර පින්තූරයක් උඩුගත කරන්න' : 'Please upload an image', 'error');
        return;
    }
    
    showLoading(getTranslation('processingImage'));
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        currentImage = e.target.result;
        
        const preview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        
        previewImage.src = currentImage;
        preview.style.display = 'block';
        
        hideLoading();
        showNotification(getTranslation('imageUploaded'));
        
        await performOCR(currentImage);
    };
    
    reader.readAsDataURL(file);
    event.target.value = '';
}

async function performOCR(imageData) {
    try {
        showLoading(getTranslation('extractingText'));
        
        const result = await Tesseract.recognize(
            imageData,
            'eng+sin',
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        const text = currentLanguage === 'si' 
                            ? `පෙළ උපුටා ගනිමින්... ${progress}%`
                            : `Extracting text... ${progress}%`;
                        document.getElementById('loadingText').textContent = text;
                    }
                }
            }
        );
        
        currentOCRText = result.data.text.trim();
        
        if (currentOCRText) {
            const ocrTextDiv = document.getElementById('ocrText');
            const label = currentLanguage === 'si' ? 'පෙළ:' : 'Text:';
            ocrTextDiv.textContent = `${label} ${currentOCRText}`;
            ocrTextDiv.style.display = 'block';
            showNotification(getTranslation('textExtracted'));
        }
        
        hideLoading();
    } catch (error) {
        console.error('OCR error:', error);
        hideLoading();
        showNotification(currentLanguage === 'si' ? 'OCR අසාර්ථකයි' : 'OCR failed', 'error');
    }
}

function removeImage() {
    currentImage = null;
    currentOCRText = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('previewImage').src = '';
    document.getElementById('ocrText').textContent = '';
}

// GEMINI AI
async function getAIResponse(userMessage, imageData = null, ocrText = '') {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
        
        let messageText = userMessage;
        
        if (ocrText) {
            if (userMessage) {
                messageText = currentLanguage === 'si'
                    ? `ප්‍රශ්නය: ${userMessage}\n\nපින්තූරයේ පෙළ:\n${ocrText}\n\nපින්තූරයේ පෙළ මත පදනම්ව පිළිතුරු දෙන්න.`
                    : `Question: ${userMessage}\n\nText from image:\n${ocrText}\n\nAnswer based on the image text.`;
            } else {
                messageText = currentLanguage === 'si'
                    ? `පින්තූරයේ ඇත්තේ:\n${ocrText}\n\nමෙම පෙළ විශ්ලේෂණය කරන්න.`
                    : `Image contains:\n${ocrText}\n\nAnalyze this text.`;
            }
        }
        
        // Add language instruction
        if (currentLanguage === 'si') {
            messageText = `කරුණාකර සිංහලෙන් පිළිතුරු දෙන්න.\n\n${messageText}`;
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: messageText
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiResponse) {
            throw new Error('Empty response');
        }
        
        return aiResponse;
    } catch (error) {
        console.error('AI error:', error);
        return currentLanguage === 'si' 
            ? 'සමාවන්න, දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.'
            : 'Sorry, an error occurred. Please try again.';
    }
}

async function sendMessage() {
    if (isProcessing) return;
    
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message && !currentImage) return;
    
    const messageToSend = message || (currentLanguage === 'si' ? '[පින්තූරය යවන ලදී]' : '[Image sent]');
    const imageToSend = currentImage;
    const ocrTextToSend = currentOCRText;
    
    addMessage(messageToSend, true, imageToSend);
    
    input.value = '';
    removeImage();
    
    const sendBtn = document.getElementById('sendButton');
    const typing = document.getElementById('typingIndicator');
    
    isProcessing = true;
    sendBtn.disabled = true;
    typing.style.display = 'flex';
    
    try {
        const response = await getAIResponse(message, imageToSend, ocrTextToSend);
        typing.style.display = 'none';
        addMessage(response, false);
    } catch (error) {
        typing.style.display = 'none';
        const errorMsg = currentLanguage === 'si' 
            ? 'සමාවන්න, දෝෂයක් ඇතිවිය.'
            : 'Sorry, an error occurred.';
        addMessage(errorMsg, false);
    } finally {
        isProcessing = false;
        sendBtn.disabled = false;
        currentOCRText = '';
        input.focus();
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// INITIALIZE
window.addEventListener('load', initializeFirebase);
