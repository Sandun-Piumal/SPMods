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
        welcomeTitle: "Hello! I'm Smart AI Assistant",
        welcomeSubtitle: "I can help you with questions, analysis, creativity, and more!",
        messagePlaceholder: "Ask me anything...",
        uploadImage: "Upload Image",
        logout: "Logout",
        processing: "Processing...",
        imageUploaded: "Image uploaded!",
        loginSuccess: "Login successful!",
        logoutSuccess: "Logged out successfully!",
        chatDeleted: "Chat deleted!",
        deleteConfirm: "Delete this chat?",
        thinking: "Thinking...",
        errorOccurred: "An error occurred",
        tryAgain: "Please try again"
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
        welcomeTitle: "ආයුබෝවන්! මම Smart AI සහායකයා",
        welcomeSubtitle: "මට ප්‍රශ්න, විශ්ලේෂණ, නිර්මාණශීලිත්වය සහ තවත් බොහෝ දේ වලින් ඔබට උදව් කළ හැක!",
        messagePlaceholder: "මගෙන් ඕනෑම දෙයක් අහන්න...",
        uploadImage: "පින්තූරය උඩුගත කරන්න",
        logout: "ඉවත් වන්න",
        processing: "සැකසෙමින්...",
        imageUploaded: "පින්තූරය උඩුගත විය!",
        loginSuccess: "පිවිසුම සාර්ථකයි!",
        logoutSuccess: "සාර්ථකව ඉවත් විය!",
        chatDeleted: "සංවාදය මකා දමන ලදී!",
        deleteConfirm: "මෙම සංවාදය මකන්න ද?",
        thinking: "චින්තනය කරමින්...",
        errorOccurred: "දෝෂයක් ඇතිවිය",
        tryAgain: "කරුණාකර නැවත උත්සාහ කරන්න"
    }
};

// ==================== SYSTEM INITIALIZATION ====================

function initializeApp() {
    console.log('🚀 Starting Smart AI...');
    
    // Initialize Firebase first
    initializeFirebase();
    
    // Then initialize UI
    initializeUI();
    initializeEventListeners();
    loadUserPreferences();
}

function initializeFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.log('⚠️ Firebase not available');
            showChatApp();
            loadChatSessions();
            return;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        auth = firebase.auth();
        database = firebase.database();
        
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('🔐 User authenticated:', user.email);
                showChatApp();
                updateUserProfile(user);
                loadChatSessions();
            } else {
                console.log('🔐 No user');
                showAuthContainer();
            }
        });
        
    } catch (error) {
        console.log('⚠️ Firebase failed, using offline mode');
        showChatApp();
        loadChatSessions();
    }
}

// ==================== STORAGE MANAGEMENT ====================

function getStorageKey() {
    const userId = auth?.currentUser?.uid || 'anonymous';
    return `smartai-sessions-${userId}`;
}

function saveChatSessions() {
    try {
        const storageKey = getStorageKey();
        const data = {
            sessions: chatSessions,
            savedAt: Date.now()
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
        console.error('Save error:', error);
    }
}

function loadChatSessions() {
    try {
        const storageKey = getStorageKey();
        const saved = localStorage.getItem(storageKey);
        
        if (saved) {
            const data = JSON.parse(saved);
            chatSessions = data.sessions || [];
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

// ==================== AI SERVICE ====================

async function getAIResponse(userMessage, imageData = null) {
    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const contents = [];
        
        if (imageData) {
            contents.push({
                parts: [
                    { text: userMessage || "Describe this image" },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: imageData.split(',')[1]
                        }
                    }
                ]
            });
        } else {
            contents.push({
                parts: [{ text: userMessage }]
            });
        }
        
        const payload = {
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000
            }
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0].content.parts[0].text) {
            throw new Error('No response from AI');
        }
        
        return data.candidates[0].content.parts[0].text;
        
    } catch (error) {
        console.error('AI Error:', error);
        throw new Error('AI service error. Please try again');
    }
}

// ==================== CHAT FUNCTIONS ====================

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
}

async function sendMessage() {
    if (isProcessing) return;
    
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message && !currentImage) {
        showNotification('Please enter a message or upload an image', 'error');
        return;
    }
    
    // Add user message
    addMessageToChat(message, true, currentImage);
    input.value = '';
    
    // Show typing
    const sendBtn = document.getElementById('sendButton');
    const typing = document.getElementById('typingIndicator');
    
    isProcessing = true;
    sendBtn.disabled = true;
    typing.style.display = 'flex';
    
    try {
        const response = await getAIResponse(message, currentImage);
        typing.style.display = 'none';
        addMessageToChat(response, false);
    } catch (error) {
        typing.style.display = 'none';
        addMessageToChat(error.message, false);
    } finally {
        isProcessing = false;
        sendBtn.disabled = false;
        currentImage = null;
        removeImage();
        input.focus();
    }
}

function addMessageToChat(content, isUser, imageData = null) {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    // Remove welcome screen
    const welcome = messagesDiv.querySelector('.welcome-screen');
    if (welcome) welcome.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const avatar = isUser ? 
        '<div class="message-avatar user-avatar"><i class="fas fa-user"></i></div>' : 
        '<div class="message-avatar ai-avatar"><i class="fas fa-robot"></i></div>';
    
    const sender = isUser ? 
        (currentLanguage === 'si' ? 'ඔබ' : 'You') : 
        'Smart AI';
    
    let imageHTML = '';
    if (imageData) {
        imageHTML = `
            <div class="image-container">
                <img src="${imageData}" alt="Uploaded image" class="message-image">
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="message-header">
            ${avatar}
            <div class="message-sender">${sender}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>
        <div class="message-content">
            ${imageHTML}
            <div class="message-text">${content}</div>
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    
    // Save to session
    const session = getCurrentSession();
    if (session) {
        session.messages.push({
            content: content,
            isUser: isUser,
            imageData: imageData,
            timestamp: Date.now()
        });
        session.updatedAt = Date.now();
        
        if (isUser && session.messages.length === 1) {
            session.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        }
        
        saveChatSessions();
        renderSessions();
    }
    
    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ==================== SESSION MANAGEMENT ====================

function getCurrentSession() {
    return chatSessions.find(session => session.id === currentSessionId);
}

function renderSessions() {
    const chatHistory = document.getElementById('chatHistory');
    if (!chatHistory) return;
    
    chatHistory.innerHTML = '';
    
    chatSessions.forEach(session => {
        const sessionElement = document.createElement('div');
        sessionElement.className = `history-item ${session.id === currentSessionId ? 'active' : ''}`;
        sessionElement.innerHTML = `
            <div class="history-content" onclick="switchSession('${session.id}')">
                <div class="history-title">${session.title}</div>
                <div class="history-date">${new Date(session.updatedAt).toLocaleDateString()}</div>
            </div>
            <button class="history-delete" onclick="deleteSession('${session.id}', event)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        chatHistory.appendChild(sessionElement);
    });
}

function switchSession(sessionId) {
    currentSessionId = sessionId;
    renderChatHistory();
    renderSessions();
    closeSidebar();
}

function deleteSession(sessionId, event) {
    if (event) event.stopPropagation();
    if (!confirm(getTranslation('deleteConfirm'))) return;
    
    const sessionIndex = chatSessions.findIndex(session => session.id === sessionId);
    if (sessionIndex === -1) return;
    
    chatSessions.splice(sessionIndex, 1);
    
    if (chatSessions.length === 0) {
        createNewChat();
    } else if (currentSessionId === sessionId) {
        currentSessionId = chatSessions[0].id;
        renderChatHistory();
    }
    
    saveChatSessions();
    renderSessions();
    showNotification(getTranslation('chatDeleted'), 'success');
}

function renderChatHistory() {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    messagesDiv.innerHTML = '';
    
    const session = getCurrentSession();
    if (!session || session.messages.length === 0) {
        showWelcomeScreen();
        return;
    }
    
    session.messages.forEach(message => {
        addMessageToChat(message.content, message.isUser, message.imageData);
    });
}

function showWelcomeScreen() {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    messagesDiv.innerHTML = `
        <div class="welcome-screen">
            <div class="ai-logo">
                <i class="fas fa-robot"></i>
            </div>
            <h1>${getTranslation('welcomeTitle')}</h1>
            <p>${getTranslation('welcomeSubtitle')}</p>
        </div>
    `;
}

function clearMessages() {
    showWelcomeScreen();
}

// ==================== IMAGE HANDLING ====================

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImage = e.target.result;
        showImagePreview(currentImage);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(imageData) {
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    
    if (imagePreview && previewImage) {
        previewImage.src = imageData;
        imagePreview.style.display = 'block';
    }
}

function removeImage() {
    currentImage = null;
    const imagePreview = document.getElementById('imagePreview');
    const imageInput = document.getElementById('imageInput');
    
    if (imagePreview) imagePreview.style.display = 'none';
    if (imageInput) imageInput.value = '';
}

// ==================== AUTHENTICATION ====================

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showNotification(getTranslation('loginSuccess'), 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (!name || !email || !password) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        showNotification('Account created successfully!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        showNotification(getTranslation('logoutSuccess'), 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function showAuthContainer() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('chatApp').style.display = 'none';
}

function showChatApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('chatApp').style.display = 'flex';
}

function updateUserProfile(user) {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    if (userName) userName.textContent = user.displayName || 'User';
    if (userEmail) userEmail.textContent = user.email;
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

// ==================== UI FUNCTIONS ====================

function initializeUI() {
    updateLanguage();
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'si' : 'en';
    localStorage.setItem('smartai-language', currentLanguage);
    updateLanguage();
    renderSessions();
    renderChatHistory();
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
    
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.placeholder = getTranslation('messagePlaceholder');
    }
}

function getTranslation(key) {
    return translations[currentLanguage][key] || key;
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    if (!notification || !text) return;
    
    const icon = notification.querySelector('i');
    notification.className = `notification ${type}`;
    text.textContent = message;
    
    if (icon) {
        icon.className = type === 'success' ? 'fas fa-check-circle' : 
                        type === 'error' ? 'fas fa-exclamation-circle' :
                        'fas fa-info-circle';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function toggleSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function initializeEventListeners() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', handleKeyPress);
    }
    
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
}

function loadUserPreferences() {
    const savedLang = localStorage.getItem('smartai-language');
    if (savedLang) {
        currentLanguage = savedLang;
    }
    updateLanguage();
}

// ==================== START APPLICATION ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting Smart AI...');
    initializeApp();
});
