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
const APP_VERSION = '2.0.0';
const VERSION_KEY = 'smartai-version';

// STATE VARIABLES
let auth = null;
let database = null;
let isProcessing = false;
let chatSessions = [];
let currentSessionId = null;
let currentImage = null;
let currentLanguage = 'en';

// AI MODEL CONFIG
const AI_CONFIG = {
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.8,
    topK: 40
};

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
        latestVersion: "You have the latest version!",
        thinking: "Thinking...",
        generating: "Generating response...",
        errorOccurred: "An error occurred",
        tryAgain: "Please try again",
        noInternet: "No internet connection"
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
        latestVersion: "ඔබට නවතම අනුවාදය තිබේ!",
        thinking: "චින්තනය කරමින්...",
        generating: "ප්‍රතිචාරය ජනනය කරමින්...",
        errorOccurred: "දෝෂයක් ඇතිවිය",
        tryAgain: "කරුණාකර නැවත උත්සාහ කරන්න",
        noInternet: "අන්තර්ජාල සම්බන්ධතාවයක් නැත"
    }
};

// ==================== SYSTEM INITIALIZATION ====================

function initializeApp() {
    try {
        console.log('🚀 Initializing Smart AI System...');
        
        // Check system requirements
        if (!checkSystemRequirements()) {
            return;
        }

        // Initialize core systems
        initializeFirebase();
        initializeUI();
        initializeEventListeners();
        loadUserPreferences();
        
        console.log('✅ Smart AI System initialized successfully');
        
    } catch (error) {
        console.error('❌ System initialization failed:', error);
        showSystemError('System initialization failed');
    }
}

function checkSystemRequirements() {
    const requirements = {
        fetch: typeof fetch === 'function',
        localStorage: typeof localStorage !== 'undefined',
        firebase: typeof firebase !== 'undefined',
        internet: navigator.onLine
    };

    if (!requirements.internet) {
        showNotification(getTranslation('noInternet'), 'error');
        return false;
    }

    if (!requirements.fetch) {
        showSystemError('Browser does not support fetch API');
        return false;
    }

    return true;
}

// ==================== AI CORE ENGINE ====================

class AICoreEngine {
    constructor() {
        this.isProcessing = false;
        this.conversationHistory = [];
        this.maxHistoryLength = 10;
    }

    async generateResponse(userMessage, imageData = null, conversationContext = []) {
        if (this.isProcessing) {
            throw new Error('AI is already processing a request');
        }

        this.isProcessing = true;
        
        try {
            console.log('🧠 AI Engine: Processing request...');
            
            const requestPayload = this.buildRequestPayload(userMessage, imageData, conversationContext);
            const response = await this.makeAPIRequest(requestPayload);
            const aiResponse = this.processAIResponse(response);
            
            // Update conversation history
            this.updateConversationHistory(userMessage, aiResponse);
            
            console.log('✅ AI Engine: Response generated successfully');
            return aiResponse;
            
        } catch (error) {
            console.error('❌ AI Engine Error:', error);
            throw this.handleAIError(error);
        } finally {
            this.isProcessing = false;
        }
    }

    buildRequestPayload(userMessage, imageData, conversationContext = []) {
        const payload = {
            contents: [],
            generationConfig: {
                temperature: AI_CONFIG.temperature,
                maxOutputTokens: AI_CONFIG.maxTokens,
                topP: AI_CONFIG.topP,
                topK: AI_CONFIG.topK
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH", 
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        // Add conversation context if available
        if (conversationContext.length > 0) {
            conversationContext.forEach(msg => {
                payload.contents.push({
                    parts: [{ text: msg.content }],
                    role: msg.isUser ? 'user' : 'model'
                });
            });
        }

        // Add current message
        const currentContent = {
            parts: [{ text: userMessage }]
        };

        // Add image data if present
        if (imageData) {
            currentContent.parts.push({
                inline_data: {
                    mime_type: "image/jpeg",
                    data: imageData.split(',')[1]
                }
            });
        }

        payload.contents.push(currentContent);
        
        return payload;
    }

    async makeAPIRequest(payload) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model}:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
        }

        return await response.json();
    }

    processAIResponse(apiResponse) {
        if (!apiResponse.candidates || !apiResponse.candidates[0]) {
            throw new Error('No response generated from AI');
        }

        const candidate = apiResponse.candidates[0];
        
        // Check for safety blocks
        if (candidate.finishReason === 'SAFETY') {
            throw new Error('Response blocked due to safety concerns');
        }

        if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
            throw new Error('Invalid response format from AI');
        }

        return candidate.content.parts[0].text;
    }

    updateConversationHistory(userMessage, aiResponse) {
        this.conversationHistory.push(
            { content: userMessage, isUser: true },
            { content: aiResponse, isUser: false }
        );

        // Keep only recent history
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }
    }

    handleAIError(error) {
        const errorMessage = error.message || 'Unknown AI error';
        
        if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
            return new Error(
                currentLanguage === 'si' 
                    ? 'මෙම ප්‍රශ්නය සුරක්ෂිතතා හේතූන් මත පිළිතුරු දීමට මට නොහැකි විය' 
                    : 'I cannot respond to this question due to safety concerns'
            );
        }
        
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            return new Error(
                currentLanguage === 'si'
                    ? 'ජාලකරණ දෝෂයක්. කරුණාකර ඔබගේ අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කරන්න'
                    : 'Network error. Please check your internet connection'
            );
        }

        return new Error(
            currentLanguage === 'si'
                ? 'AI සේවාවෙන් දෝෂයක් ඇතිවිය. කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න'
                : 'Error from AI service. Please try again in a moment'
        );
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    getHistory() {
        return [...this.conversationHistory];
    }
}

// Initialize AI Engine
const aiEngine = new AICoreEngine();

// ==================== ENHANCED AI RESPONSE FUNCTION ====================

async function getAIResponse(userMessage, imageData = null) {
    console.log('🤖 Smart AI: Processing request...');
    
    try {
        // Get conversation context from current session
        const currentSession = getCurrentSession();
        const conversationContext = currentSession ? 
            currentSession.messages.slice(-4) : []; // Last 2 exchanges
        
        showNotification(getTranslation('thinking'), 'info');
        
        const response = await aiEngine.generateResponse(
            userMessage, 
            imageData, 
            conversationContext
        );
        
        console.log('✅ Smart AI: Response generated');
        return response;
        
    } catch (error) {
        console.error('❌ Smart AI Error:', error);
        throw error;
    }
}

// ==================== ENHANCED CHAT FUNCTIONS ====================

function createNewChat() {
    const sessionId = 'session_' + Date.now();
    
    const newSession = {
        id: sessionId,
        title: getTranslation('newChat'),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: {
            messageCount: 0,
            hasImages: false,
            language: currentLanguage
        }
    };
    
    chatSessions.unshift(newSession);
    currentSessionId = sessionId;
    
    // Clear AI conversation history for new chat
    aiEngine.clearHistory();
    
    saveChatSessions();
    renderSessions();
    clearMessages();
    
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
    
    showNotification('New chat session started', 'success');
}

async function sendMessage() {
    if (isProcessing) return;
    
    const input = document.getElementById('messageInput');
    const message = input ? input.value.trim() : '';
    
    if (!message && !currentImage) {
        showNotification('Please enter a message or upload an image', 'error');
        return;
    }
    
    // Add user message to chat
    addMessageToChat(message, true, currentImage);
    
    // Clear input
    if (input) input.value = '';
    
    // Show typing indicator
    const sendBtn = document.getElementById('sendButton');
    const typing = document.getElementById('typingIndicator');
    
    isProcessing = true;
    if (sendBtn) sendBtn.disabled = true;
    if (typing) typing.style.display = 'flex';
    
    try {
        console.log('🔄 Smart AI: Generating response...');
        
        const response = await getAIResponse(
            message || (currentLanguage === 'si' ? 
                'මෙම පින්තූරය ගැන මට කියන්න' : 
                'Tell me about this image'),
            currentImage
        );
        
        // Hide typing indicator
        if (typing) typing.style.display = 'none';
        
        // Add AI response to chat
        addMessageToChat(response, false);
        
        if (currentImage) {
            showNotification(getTranslation('imageAnalyzed'), 'success');
        }
        
    } catch (error) {
        console.error('❌ Chat Error:', error);
        if (typing) typing.style.display = 'none';
        
        // Add error message to chat
        addMessageToChat(error.message, false);
        
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
    
    // Remove welcome screen if present
    const welcome = messagesDiv.querySelector('.welcome-screen');
    if (welcome) {
        welcome.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const avatarIcon = isUser ? 
        '<div class="message-avatar user-avatar"><i class="fas fa-user"></i></div>' : 
        '<div class="message-avatar ai-avatar"><i class="fas fa-robot"></i></div>';
    
    const messageLabel = isUser ? 
        (currentLanguage === 'si' ? 'ඔබ' : 'You') : 
        'Smart AI';
    
    let imageHTML = '';
    if (imageData) {
        imageHTML = `
            <div class="image-container">
                <img src="${imageData}" alt="Uploaded image" class="message-image" onload="this.style.opacity='1'" onerror="this.style.display='none'">
                <div class="image-caption">${currentLanguage === 'si' ? 'ඔබ උඩුගත කළ පින්තූරය' : 'Image you uploaded'}</div>
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="message-header">
            ${avatarIcon}
            <div class="message-info">
                <span class="message-sender">${messageLabel}</span>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
        </div>
        <div class="message-content">
            ${imageHTML}
            <div class="message-text">${formatMessageContent(content)}</div>
        </div>
        ${!isUser ? `
            <div class="message-actions">
                <button class="action-btn copy-btn" onclick="copyMessage(this)" title="${currentLanguage === 'si' ? 'පිටපත් කරන්න' : 'Copy'}">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn regenerate-btn" onclick="regenerateLastResponse()" title="${currentLanguage === 'si' ? 'නැවත උත්පාදනය කරන්න' : 'Regenerate'}">
                    <i class="fas fa-redo"></i>
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
        
        // Update session metadata
        session.metadata.messageCount = session.messages.length;
        session.metadata.hasImages = session.metadata.hasImages || !!imageData;
        
        // Update session title with first user message
        if (isUser && session.messages.filter(m => m.isUser).length === 1) {
            const titleText = content.replace(/<[^>]*>/g, '').substring(0, 30);
            session.title = titleText + (titleText.length >= 30 ? '...' : '');
        }
        
        saveChatSessions();
        renderSessions();
    }
    
    // Smooth scroll to bottom
    messagesDiv.scrollTo({
        top: messagesDiv.scrollHeight,
        behavior: 'smooth'
    });
}

function formatMessageContent(content) {
    if (!content) return '';
    
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    content = content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    
    // Format code blocks
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Format inline code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert line breaks
    content = content.replace(/\n/g, '<br>');
    
    return content;
}

async function regenerateLastResponse() {
    const session = getCurrentSession();
    if (!session || session.messages.length < 2) return;
    
    // Get last user message
    const lastUserMessage = session.messages.filter(msg => msg.isUser).pop();
    if (!lastUserMessage) return;
    
    // Remove last AI response
    session.messages = session.messages.slice(0, -1);
    
    // Regenerate response
    await sendMessage();
}

function copyMessage(button) {
    const messageText = button.closest('.message').querySelector('.message-text').textContent;
    navigator.clipboard.writeText(messageText).then(() => {
        showNotification('Message copied to clipboard', 'success');
    });
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
                <div class="history-title">${session.title || getTranslation('newChat')}</div>
                <div class="history-meta">
                    <span class="history-date">${formatDate(session.updatedAt)}</span>
                    <span class="history-count">${session.messages ? session.messages.length : 0} messages</span>
                </div>
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
    
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
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
    if (!session || !session.messages || session.messages.length === 0) {
        showWelcomeScreen();
        return;
    }
    
    session.messages.forEach(message => {
        addMessageToChat(message.content, message.isUser, message.imageData);
    });
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showWelcomeScreen() {
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
                    <path d="M18 40 Q18 28, 32 20" stroke="white" stroke-width="2.5" fill="none" opacity="0.5"/>
                    <path d="M62 40 Q62 28, 48 20" stroke="white" stroke-width="2.5" fill="none" opacity="0.5"/>
                </svg>
            </div>
            <h1 data-i18n="welcomeTitle">Hi, I'm Smart AI.</h1>
            <p data-i18n="welcomeSubtitle">How can I help you today?</p>
        </div>
    `;
}

function clearMessages() {
    const messagesDiv = document.getElementById('chatMessages');
    if (messagesDiv) {
        messagesDiv.innerHTML = '';
    }
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
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImage = e.target.result;
        showNotification(getTranslation('imageUploaded'), 'success');
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
    if (e) e.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        showNotification(getTranslation('loginSuccess'), 'success');
        return userCredential;
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

async function handleSignup(e) {
    if (e) e.preventDefault();
    
    const name = document.getElementById('signupName')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;
    
    if (!name || !email || !password) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        showNotification('Account created successfully!', 'success');
        return userCredential;
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        showNotification(getTranslation('logoutSuccess'), 'success');
        chatSessions = [];
        currentSessionId = null;
    } catch (error) {
        console.error('Logout error:', error);
        showNotification(error.message, 'error');
    }
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
    if (chatApp) chatApp.style.display = 'flex';
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
    checkForUpdates();
    setupRealTimeFeatures();
}

function setupRealTimeFeatures() {
    // Auto-save every 30 seconds
    setInterval(() => {
        if (chatSessions.length > 0) {
            saveChatSessions();
        }
    }, 30000);
    
    // Check for connectivity
    window.addEventListener('online', () => {
        showNotification('Connection restored', 'success');
    });
    
    window.addEventListener('offline', () => {
        showNotification('No internet connection', 'error');
    });
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
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLanguage][key]) {
            element.placeholder = translations[currentLanguage][key];
        }
    });
    
    // Update titles
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (translations[currentLanguage][key]) {
            element.title = translations[currentLanguage][key];
        }
    });
}

function getTranslation(key) {
    return translations[currentLanguage][key] || key;
}

function showNotification(message, type = 'success', duration = 4000) {
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
    }, duration);
}

function showSystemError(message) {
    const errorHtml = `
        <div class="system-error">
            <div class="error-icon">⚠️</div>
            <div class="error-content">
                <h3>System Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">Reload App</button>
            </div>
        </div>
    `;
    
    document.body.innerHTML = errorHtml;
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

// ==================== FIREBASE FUNCTIONS ====================

function initializeFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded');
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        auth = firebase.auth();
        database = firebase.database();
        
        // Enhanced auth state handling
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('🔐 User authenticated:', user.email);
                showChatApp();
                loadChatSessions();
                updateUserProfile(user);
                trackUserActivity('login');
            } else {
                console.log('🔐 No user authenticated');
                showAuthContainer();
                trackUserActivity('logout');
            }
        });
        
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        // Continue without Firebase for offline functionality
        showAuthContainer();
    }
}

function trackUserActivity(action) {
    if (!auth?.currentUser || !database) return;
    
    try {
        const userRef = database.ref('userActivities/' + auth.currentUser.uid);
        userRef.push({
            action: action,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            language: currentLanguage
        });
    } catch (error) {
        console.log('Activity tracking failed:', error);
    }
}

// ==================== STORAGE MANAGEMENT ====================

function getStorageKey() {
    const userId = auth?.currentUser?.uid || 'anonymous';
    return `smartai-sessions-${userId}-v2`;
}

async function saveChatSessions() {
    try {
        const storageKey = getStorageKey();
        const dataToSave = {
            sessions: chatSessions,
            version: APP_VERSION,
            savedAt: Date.now()
        };
        
        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        
        // Sync to Firebase if available
        if (auth?.currentUser && database) {
            const userRef = database.ref('users/' + auth.currentUser.uid + '/chatData');
            await userRef.set(dataToSave);
        }
        
    } catch (error) {
        console.error('❌ Save sessions error:', error);
    }
}

async function loadChatSessions() {
    try {
        const storageKey = getStorageKey();
        let sessionsData = null;
        
        // Try to load from Firebase first
        if (auth?.currentUser && database) {
            try {
                const userRef = database.ref('users/' + auth.currentUser.uid + '/chatData');
                const snapshot = await userRef.once('value');
                if (snapshot.exists()) {
                    sessionsData = snapshot.val();
                }
            } catch (firebaseError) {
                console.log('Firebase load failed, trying localStorage...');
            }
        }
        
        // Fallback to localStorage
        if (!sessionsData) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                sessionsData = JSON.parse(saved);
            }
        }
        
        if (sessionsData?.sessions) {
            chatSessions = sessionsData.sessions;
            
            // Migrate old session format if needed
            chatSessions = chatSessions.map(session => {
                if (!session.metadata) {
                    session.metadata = {
                        messageCount: session.messages?.length || 0,
                        hasImages: session.messages?.some(m => m.imageData) || false,
                        language: currentLanguage
                    };
                }
                return session;
            });
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

// ==================== UTILITY FUNCTIONS ====================

function loadUserPreferences() {
    // Load language preference
    const savedLang = localStorage.getItem('smartai-language');
    if (savedLang && (savedLang === 'en' || savedLang === 'si')) {
        currentLanguage = savedLang;
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem('smartai-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    updateLanguage();
}

function initializeEventListeners() {
    // Message input handling
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
    
    // Image upload handling
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
    
    // Language toggle
    const languageBtn = document.querySelector('.language-btn');
    if (languageBtn) {
        languageBtn.addEventListener('click', toggleLanguage);
    }
    
    // Auth form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

function checkForUpdates() {
    const savedVersion = localStorage.getItem(VERSION_KEY);
    if (savedVersion !== APP_VERSION) {
        console.log('🔄 New version detected, clearing old data...');
        // Clear old data and migrate if needed
        localStorage.setItem(VERSION_KEY, APP_VERSION);
    }
}

// ==================== START APPLICATION ====================

window.addEventListener('load', function() {
    console.log('🚀 Starting Smart AI Application...');
    initializeApp();
});

console.log('🤖 Smart AI System Code Loaded Successfully');
