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
        processingImage: "Processing image...",
        analyzingImage: "Analyzing image content...",
        imageAnalyzed: "Image analyzed!"
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
        imageAnalyzed: "පින්තූරය විශ්ලේෂණය කරන ලදී!"
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

// FIREBASE INITIALIZATION
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

function updateUserProfile(user) {
    const userName = user.displayName || user.email.split('@')[0];
    const userEmail = user.email;
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userEmail').textContent = userEmail;
}

// AUTH HANDLERS
async function handleLogin(event) {
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
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        showNotification(getTranslation('loginSuccess'));
        document.getElementById('loginForm').reset();
    } catch (error) {
        console.error("Login error:", error);
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
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        
        const successMsg = document.getElementById('signupSuccess');
        successMsg.textContent = 'Registration successful! Redirecting...';
        successMsg.style.display = 'block';
        
        document.getElementById('signupForm').reset();
        
        setTimeout(() => {
            showLogin();
        }, 2000);
        
    } catch (error) {
        console.error("Signup error:", error);
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

// GEMINI AI - UNIVERSAL FUNCTION (Text + Images)
async function getAIResponse(userMessage, imageData = null) {
    console.log("🤖 Getting AI response...", { userMessage, hasImage: !!imageData });
    
    try {
        // If there's an image, use Gemini Pro Vision
        if (imageData) {
            const visionUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            
            const visionBody = {
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
            
            console.log("📤 Sending to Gemini Vision API...");
            const visionResponse = await fetch(visionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(visionBody)
            });
            
            if (visionResponse.ok) {
                const visionData = await visionResponse.json();
                if (visionData.candidates?.[0]?.content?.parts?.[0]?.text) {
                    console.log("✅ Vision API success");
                    return visionData.candidates[0].content.parts[0].text;
                }
            }
        }
        
        // Fallback to text-only Gemini Pro (for text messages or if vision fails)
        const textUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const textBody = {
            contents: [{
                parts: [{ text: userMessage }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            }
        };
        
        console.log("📤 Sending to Gemini Text API...");
        const textResponse = await fetch(textUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(textBody)
        });
        
        if (!textResponse.ok) throw new Error('Text API failed');
        
        const textData = await textResponse.json();
        const aiResponse = textData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiResponse) throw new Error('Empty response');
        
        console.log("✅ Text API success");
        return aiResponse;
        
    } catch (error) {
        console.error('❌ AI Error:', error);
        
        // User-friendly error messages
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
    const message = input.value.trim();
    
    if (!message && !currentImage) {
        showNotification('Please enter a message or upload an image', 'error');
        return;
    }
    
    const messageToSend = message || (currentLanguage === 'si' ? 
        'මෙම පින්තූරය ගැන මට කියන්න' : 
        'Tell me about this image');
    
    // Add user message to chat
    addMessageToChat(messageToSend, true, currentImage);
    
    input.value = '';
    
    const sendBtn = document.getElementById('sendButton');
    const typing = document.getElementById('typingIndicator');
    
    isProcessing = true;
    sendBtn.disabled = true;
    typing.style.display = 'flex';
    
    try {
        console.log("🔄 Getting AI response...");
        const response = await getAIResponse(messageToSend, currentImage);
        
        typing.style.display = 'none';
        addMessageToChat(response, false);
        
        if (currentImage) {
            showNotification(getTranslation('imageAnalyzed'));
        }
        
    } catch (error) {
        console.error("❌ Error in sendMessage:", error);
        typing.style.display = 'none';
        
        const errorMsg = currentLanguage === 'si' 
            ? 'මට කණගාටුයි, දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.'
            : 'Sorry, an error occurred. Please try again.';
        
        addMessageToChat(errorMsg, false);
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
    
    // Remove welcome screen if present
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
        
        // Update session title with first user message
        if (isUser && session.messages.filter(m => m.isUser).length === 1) {
            const titleText = content.replace(/<[^>]*>/g, '').substring(0, 30);
            session.title = titleText + (titleText.length >= 30 ? '...' : '');
        }
        
        saveChatSessions();
        renderSessions();
    }
    
    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function copyMessage(button) {
    const messageContent = button.closest('.message').querySelector('.message-text');
    const textContent = messageContent.textContent || messageContent.innerText;
    
    navigator.clipboard.writeText(textContent).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = `<i class="fas fa-check"></i> ${currentLanguage === 'si' ? 'පිටපත් විය!' : 'Copied!'}`;
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 2000);
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
        
        previewImage.src = currentImage;
        preview.style.display = 'block';
        
        hideLoading();
        showNotification(getTranslation('imageUploaded'));
        
        // Auto-focus on message input after image upload
        document.getElementById('messageInput').focus();
    };
    
    reader.readAsDataURL(file);
    event.target.value = '';
}

function removeImage() {
    currentImage = null;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('previewImage').src = '';
}

// SESSION MANAGEMENT
function getStorageKey() {
    const userId = auth.currentUser?.uid || 'anonymous';
    return `smartai-sessions-${userId}`;
}

function saveChatSessions() {
    try {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(chatSessions));
    } catch (error) {
        console.error('Save sessions error:', error);
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
        console.error('Load sessions error:', error);
        createNewChat();
    }
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
    if (!session) return;
    
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.innerHTML = '';
    
    if (session.messages.length === 0) {
        clearMessages();
        return;
    }
    
    session.messages.forEach(msg => {
        addMessageToChat(msg.content, msg.isUser, msg.imageData);
    });
}

// INITIALIZE APP
window.addEventListener('load', function() {
    console.log("🎯 Page loaded - initializing app");
    initializeFirebase();
    
    // Add event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    console.log("✅ All event listeners attached");
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
`;
document.head.appendChild(style);
