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
    model: 'gemini-2.5-flash',
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

    buildRequestPayload(userMessage, imageData, conversationContext) {
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

// ==================== ENHANCED UI FUNCTIONS ====================

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

// ==================== FIREBASE ENHANCEMENTS ====================

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

// ==================== SESSION MANAGEMENT ENHANCEMENTS ====================

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

// ==================== APP INITIALIZATION ====================

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
        
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
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

// ==================== START APPLICATION ====================

window.addEventListener('load', function() {
    console.log('🚀 Starting Smart AI Application...');
    initializeApp();
});

// Add enhanced CSS
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    .message {
        margin-bottom: 1.5rem;
        animation: messageSlideIn 0.3s ease-out;
    }
    
    @keyframes messageSlideIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .message-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
    }
    
    .message-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
    }
    
    .message-sender {
        font-weight: 600;
        font-size: 0.875rem;
    }
    
    .message-time {
        font-size: 0.75rem;
        color: #6b7280;
    }
    
    .message-avatar {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
    }
    
    .user-avatar {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
    }
    
    .ai-avatar {
        background: linear-gradient(135deg, #4A90E2, #357ABD);
        color: white;
    }
    
    .message-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }
    
    .action-btn {
        padding: 0.375rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        background: white;
        color: #6b7280;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.75rem;
    }
    
    .action-btn:hover {
        background: #f9fafb;
        color: #374151;
    }
    
    .system-error {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 2rem;
    }
    
    .error-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .error-content {
        text-align: center;
        max-width: 400px;
    }
    
    .message-text code {
        background: #f3f4f6;
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
        font-family: 'Courier New', monospace;
        font-size: 0.875em;
    }
    
    .message-text pre {
        background: #1f2937;
        color: #f9fafb;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 0.5rem 0;
    }
    
    .message-text a {
        color: #4A90E2;
        text-decoration: underline;
    }
    
    .message-text a:hover {
        color: #357ABD;
    }
`;
document.head.appendChild(enhancedStyles);

console.log('🤖 Smart AI System Code Loaded Successfully');
