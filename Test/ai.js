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
    document.getElementById('welcomeTitle').textContent = `Hi ${userName}`;
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
        successMsg.textContent = 'Registration successful! Redirecting...';
        successMsg.style.display = 'block';
        
        document.getElementById('signupForm').reset();
        
        setTimeout(() => {
            showLogin();
        }, 2000);
    } catch (error) {
        const errorMsg = document.getElementById('signupError');
        if (error.code === 'auth/email-already-in-use') {
            errorMsg.textContent = 'This email is already registered.';
        } else if (error.code === 'auth/weak-password') {
            errorMsg.textContent = 'Password too weak. Use at least 6 characters.';
        } else {
            errorMsg.textContent = 'Registration failed. Try again.';
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
        currentImage = null;
        currentOCRText = '';
        showNotification('Logged out successfully!');
    } catch (error) {
        showNotification('Logout failed', 'error');
    }
}

// SESSION MANAGEMENT
function getStorageKey() {
    const userId = auth.currentUser?.uid || 'anonymous';
    return `gemini-sessions-${userId}`;
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
    const userName = auth.currentUser?.displayName || 'there';
    
    const newSession = {
        id: sessionId,
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    chatSessions.unshift(newSession);
    currentSessionId = sessionId;
    
    saveChatSessions();
    renderSessions();
    clearMessages();
    
    document.getElementById('welcomeTitle').textContent = `Hi ${userName}`;
    
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
            <div class="history-title">${escapeHtml(session.title)}</div>
            <div class="history-preview">${escapeHtml(lastMessage.substring(0, 40))}${lastMessage.length > 40 ? '...' : ''}</div>
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
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// CHAT MESSAGES
function clearMessages() {
    const messagesDiv = document.getElementById('chatMessages');
    const userName = auth.currentUser?.displayName || 'Sandun';
    
    messagesDiv.innerHTML = `
        <div class="welcome-screen">
            <div class="welcome-icon">✨</div>
            <h1 id="welcomeTitle">Hi ${userName}</h1>
            <h2 id="welcomeSubtitle">Where should we start?</h2>
            
            <div class="suggestion-cards">
                <div class="suggestion-card" onclick="useSuggestion('Create a stunning image for me')">
                    <div class="card-icon">🎨</div>
                    <div class="card-text">Create image</div>
                </div>
                <div class="suggestion-card" onclick="useSuggestion('Help me write a professional email')">
                    <div class="card-text">Write anything</div>
                </div>
                <div class="suggestion-card" onclick="useSuggestion('Help me develop an innovative idea')">
                    <div class="card-text">Build an idea</div>
                </div>
                <div class="suggestion-card" onclick="useSuggestion('Research a topic in depth for me')">
                    <div class="card-text">Deep Research</div>
                </div>
            </div>
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
    
    const avatarIcon = isUser ? '<i class="fas fa-user"></i>' : '✨';
    const messageLabel = isUser ? 'You' : 'Gemini';
    
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
                    <i class="fas fa-copy"></i> Copy
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

function clearCurrentChat() {
    if (!confirm('Clear this chat?')) return;
    
    const session = getCurrentSession();
    if (session) {
        session.messages = [];
        session.updatedAt = Date.now();
        saveChatSessions();
        renderChatHistory();
        renderSessions();
        showNotification('Chat cleared!');
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
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
        }, 2000);
    });
}

function useSuggestion(text) {
    document.getElementById('messageInput').value = text;
    document.getElementById('messageInput').focus();
}

// IMAGE UPLOAD
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image', 'error');
        return;
    }
    
    showLoading('Processing image...');
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        currentImage = e.target.result;
        
        const preview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        
        previewImage.src = currentImage;
        preview.style.display = 'block';
        
        hideLoading();
        showNotification('Image uploaded!');
        
        await performOCR(currentImage);
    };
    
    reader.readAsDataURL(file);
    event.target.value = '';
}

async function performOCR(imageData) {
    try {
        showLoading('Extracting text...');
        
        const result = await Tesseract.recognize(
            imageData,
            'eng+sin',
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        document.getElementById('loadingText').textContent = 
                            `Extracting text... ${progress}%`;
                    }
                }
            }
        );
        
        currentOCRText = result.data.text.trim();
        
        if (currentOCRText) {
            const ocrTextDiv = document.getElementById('ocrText');
            ocrTextDiv.textContent = `Text: ${currentOCRText}`;
            ocrTextDiv.style.display = 'block';
            showNotification('Text extracted!');
        }
        
        hideLoading();
    } catch (error) {
        console.error('OCR error:', error);
        hideLoading();
        showNotification('OCR failed', 'error');
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
                messageText = `Question: ${userMessage}\n\nText from image:\n${ocrText}\n\nAnswer based on the image text.`;
            } else {
                messageText = `Image contains:\n${ocrText}\n\nAnalyze this text.`;
            }
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
        return 'Sorry, an error occurred. Please try again.';
    }
}

async function sendMessage() {
    if (isProcessing) return;
    
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message && !currentImage) return;
    
    const messageToSend = message || '[Image sent]';
    const imageToSend = currentImage;
    const ocrTextToSend = currentOCRText;
    
    addMessage(messageToSend, true, imageToSend);
    
    input.value = '';
    input.style.height = 'auto';
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
        addMessage('Sorry, an error occurred.', false);
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

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// INITIALIZE
window.addEventListener('load', initializeFirebase);
