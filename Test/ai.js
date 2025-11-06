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
let currentLanguage = 'english';

// LANGUAGE CONTENT
const lang = {
    english: {
        welcomeTitle: 'Welcome to Smart AI!',
        welcomeText: 'Ready to chat with Gemini AI. Ask me anything!',
        typing: 'Smart AI is typing...',
        placeholder: 'Type your message here...',
        you: 'You',
        ai: 'Smart AI',
        copy: 'Copy',
        copied: 'Copied!',
        newChat: 'New Chat',
        clearConfirm: 'Are you sure you want to clear this chat?',
        cleared: 'Chat cleared successfully!',
        loggedOut: 'Logged out successfully!',
        messageCopied: 'Message copied to clipboard!',
        today: 'Today',
        yesterday: 'Yesterday'
    },
    sinhala: {
        welcomeTitle: 'Smart AI වෙත සාදරයෙන් පිළිගනිමු!',
        welcomeText: 'Gemini AI සමඟ සංවාදයට සූදානම්. මට ඕනෑම දෙයක් අහන්න!',
        typing: 'Smart AI ප්‍රතිචාර සකසමින්...',
        placeholder: 'ඔබගේ පණිවිඩය මෙහි ටයිප් කරන්න...',
        you: 'ඔබ',
        ai: 'Smart AI',
        copy: 'පිටපත්',
        copied: 'පිටපත් විය!',
        newChat: 'නව සංවාදය',
        clearConfirm: 'ඔබට මෙම සංවාදය මකා දැමීමට අවශ්‍ය බව විශ්වාසද?',
        cleared: 'සංවාදය සාර්ථකව මකා දමන ලදී!',
        loggedOut: 'සාර්ථකව පිටව ගියා!',
        messageCopied: 'පණිවිඩය පිටපත් කරන ලදී!',
        today: 'අද',
        yesterday: 'ඊයේ'
    }
};

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
        
        // Auth state listener
        auth.onAuthStateChanged((user) => {
            if (user) {
                showChatApp();
                loadChatSessions();
            } else {
                showAuthContainer();
            }
        });
        
        console.log("✅ Firebase initialized successfully");
    } catch (error) {
        console.error("Firebase initialization error:", error);
        showNotification("System error occurred", "error");
    }
}

// UI DISPLAY FUNCTIONS
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

function toggleSidebar() {
    document.getElementById('chatSidebar').classList.toggle('active');
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
    text.textContent = 'Logging in...';
    hideMessages();
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showNotification('Login successful!');
        document.getElementById('loginForm').reset();
    } catch (error) {
        const errorMsg = document.getElementById('loginError');
        errorMsg.textContent = 'Login failed. Please check your credentials.';
        errorMsg.style.display = 'block';
    } finally {
        isProcessing = false;
        btn.disabled = false;
        loader.style.display = 'none';
        text.textContent = 'Login';
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
    text.textContent = 'Creating account...';
    hideMessages();
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        
        const successMsg = document.getElementById('signupSuccess');
        successMsg.textContent = 'Registration successful! Redirecting to login...';
        successMsg.style.display = 'block';
        
        document.getElementById('signupForm').reset();
        
        setTimeout(() => {
            showLogin();
        }, 2000);
    } catch (error) {
        const errorMsg = document.getElementById('signupError');
        if (error.code === 'auth/email-already-in-use') {
            errorMsg.textContent = 'This email is already registered. Please login.';
        } else if (error.code === 'auth/weak-password') {
            errorMsg.textContent = 'Password is too weak. Use at least 6 characters.';
        } else {
            errorMsg.textContent = 'Registration failed. Please try again.';
        }
        errorMsg.style.display = 'block';
    } finally {
        isProcessing = false;
        btn.disabled = false;
        loader.style.display = 'none';
        text.textContent = 'Sign Up';
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        chatSessions = [];
        currentSessionId = null;
        showNotification(lang[currentLanguage].loggedOut);
    } catch (error) {
        showNotification('Logout failed', 'error');
    }
}

// CHAT SESSION MANAGEMENT
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
        console.error('Error loading sessions:', error);
        createNewChat();
    }
}

function saveChatSessions() {
    try {
        const storageKey = getStorageKey();
        // Keep only last 50 sessions
        if (chatSessions.length > 50) {
            chatSessions = chatSessions.slice(0, 50);
        }
        localStorage.setItem(storageKey, JSON.stringify(chatSessions));
    } catch (error) {
        console.error('Error saving sessions:', error);
    }
}

function createNewChat() {
    const sessionId = generateSessionId();
    const newSession = {
        id: sessionId,
        title: lang[currentLanguage].newChat,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    chatSessions.unshift(newSession);
    currentSessionId = sessionId;
    
    saveChatSessions();
    renderSessions();
    clearMessages();
    
    showNotification('New chat created!');
}

function switchToSession(sessionId) {
    currentSessionId = sessionId;
    renderChatHistory();
    renderSessions();
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('chatSidebar').classList.remove('active');
    }
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
            : 'No messages yet';
        
        const timeStr = getTimeString(session.updatedAt);
        
        item.innerHTML = `
            <div class="history-title">${session.title}</div>
            <div class="history-preview">${lastMessage.substring(0, 40)}${lastMessage.length > 40 ? '...' : ''}</div>
            <div class="history-time">${timeStr}</div>
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
    
    if (days === 0) {
        return lang[currentLanguage].today;
    } else if (days === 1) {
        return lang[currentLanguage].yesterday;
    } else if (days < 7) {
        return `${days} days ago`;
    } else {
        return new Date(timestamp).toLocaleDateString();
    }
}

// CHAT MESSAGE FUNCTIONS
function clearMessages() {
    const messagesDiv = document.getElementById('chatMessages');
    const content = lang[currentLanguage];
    
    messagesDiv.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">🚀</div>
            <h2 id="welcomeTitle">${content.welcomeTitle}</h2>
            <p id="welcomeText">${content.welcomeText}</p>
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
        addMessageToDOM(msg.content, msg.isUser, false);
    });
    
    scrollToBottom();
}

function addMessageToDOM(content, isUser, animate = true) {
    const messagesDiv = document.getElementById('chatMessages');
    
    // Remove welcome message if exists
    const welcome = messagesDiv.querySelector('.welcome-message');
    if (welcome) {
        welcome.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const avatarIcon = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    const messageLabel = isUser ? lang[currentLanguage].you : lang[currentLanguage].ai;
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">${avatarIcon}</div>
            ${messageLabel}
        </div>
        <div class="message-content">${content.replace(/\n/g, '<br>')}</div>
        ${!isUser ? `
            <div class="message-actions">
                <button class="action-btn copy-btn" onclick="copyMessage(this)">
                    <i class="fas fa-copy"></i> ${lang[currentLanguage].copy}
                </button>
            </div>
        ` : ''}
    `;
    
    messagesDiv.appendChild(messageDiv);
    
    if (animate) {
        scrollToBottom();
    }
}

function addMessage(content, isUser) {
    addMessageToDOM(content, isUser, true);
    
    const session = getCurrentSession();
    if (session) {
        session.messages.push({
            content: content,
            isUser: isUser,
            timestamp: Date.now()
        });
        
        session.updatedAt = Date.now();
        
        // Update title from first user message
        if (isUser && session.messages.filter(m => m.isUser).length === 1) {
            session.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        }
        
        saveChatSessions();
        renderSessions();
    }
}

function clearCurrentChat() {
    if (!confirm(lang[currentLanguage].clearConfirm)) return;
    
    const session = getCurrentSession();
    if (session) {
        session.messages = [];
        session.updatedAt = Date.now();
        saveChatSessions();
        renderChatHistory();
        renderSessions();
        showNotification(lang[currentLanguage].cleared);
    }
}

function scrollToBottom() {
    const messagesDiv = document.getElementById('chatMessages');
    setTimeout(() => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 100);
}

function copyMessage(button) {
    const messageContent = button.closest('.message').querySelector('.message-content').innerText;
    
    navigator.clipboard.writeText(messageContent).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = `<i class="fas fa-check"></i> ${lang[currentLanguage].copied}`;
        
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
        
        showNotification(lang[currentLanguage].messageCopied);
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

// GEMINI AI INTEGRATION
async function getAIResponse(userMessage) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
        
        const languageInstruction = currentLanguage === 'sinhala' 
            ? 'කරුණාකර සිංහල භාෂාවෙන් පමණක් පිළිතුරු දෙන්න. පිළිතුර සරල හා පැහැදිලි විය යුතුය.'
            : 'Please respond in English only. Keep the response clear and helpful.';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${userMessage}\n\n${languageInstruction}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                    topP: 0.9,
                    topK: 40
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiResponse) {
            throw new Error('Empty response from API');
        }
        
        return aiResponse;
    } catch (error) {
        console.error('AI API Error:', error);
        return currentLanguage === 'sinhala'
            ? 'කණගාටුයි, දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.'
            : 'Sorry, an error occurred. Please try again.';
    }
}

async function sendMessage() {
    if (isProcessing) return;
    
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessage(message, true);
    input.value = '';
    input.style.height = 'auto';
    
    const sendBtn = document.getElementById('sendButton');
    const typing = document.getElementById('typingIndicator');
    
    isProcessing = true;
    sendBtn.disabled = true;
    typing.style.display = 'block';
    
    try {
        const response = await getAIResponse(message);
        typing.style.display = 'none';
        addMessage(response, false);
    } catch (error) {
        typing.style.display = 'none';
        const errorMsg = currentLanguage === 'sinhala'
            ? 'කණගාටුයි, දෝෂයක් ඇති විය.'
            : 'Sorry, an error occurred.';
        addMessage(errorMsg, false);
    } finally {
        isProcessing = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// LANGUAGE SWITCHING
function switchLanguage(language) {
    currentLanguage = language;
    
    const englishBtn = document.getElementById('englishBtn');
    const sinhalaBtn = document.getElementById('sinhalaBtn');
    
    if (language === 'english') {
        englishBtn.classList.add('active');
        sinhalaBtn.classList.remove('active');
    } else {
        sinhalaBtn.classList.add('active');
        englishBtn.classList.remove('active');
    }
    
    // Update UI text
    const content = lang[language];
    document.getElementById('welcomeTitle').textContent = content.welcomeTitle;
    document.getElementById('welcomeText').textContent = content.welcomeText;
    document.getElementById('typingText').textContent = content.typing;
    document.getElementById('messageInput').placeholder = content.placeholder;
    
    // Update new chat button
    const newChatBtn = document.querySelector('.new-chat-btn span');
    if (newChatBtn) {
        newChatBtn.textContent = content.newChat;
    }
    
    // Re-render sessions with updated language
    renderSessions();
}

// AUTO-RESIZE TEXTAREA
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
});

// INITIALIZE APP
window.addEventListener('load', initializeFirebase);
