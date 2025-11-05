// Firebase configuration - SIMPLIFIED CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
    authDomain: "smart-ai-chat-app.firebaseapp.com",
    projectId: "smart-ai-chat-app"
};

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
}

const auth = firebase.auth();

// Language content
const languageContent = {
    sinhala: {
        authTitle: "Smart AI",
        authSubtitle: "Powered by Gemini AI",
        emailLabel: "Email",
        passwordLabel: "Password",
        nameLabel: "Name",
        confirmPasswordLabel: "Confirm Password",
        loginButton: "Login",
        signupButton: "Sign Up",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        showSignup: "Sign Up",
        showLogin: "Login",
        forgotPassword: "Forgot Password?",
        resetPasswordButton: "Reset Password",
        backToLogin: "Back to Login",
        logoTitle: "Smart AI",
        headerSubtitle: "Powered by Gemini AI",
        username: "User",
        userStatus: "Online",
        logoutText: "Logout",
        welcomeTitle: "නව Model සාර්ථකව යාවත්කාලීන කරන ලදී! ✨",
        welcomeText: "Gemini AI Model සමඟ වැඩ කිරීමට සූදානම්!<br>ඔබගේ ප්‍රශ්නය පහතින් ටයිප් කරන්න 🚀",
        typingText: "Smart AI ප්‍රතිචාර සකසමින්",
        inputPlaceholder: "ඔබගේ ප්‍රශ්නය මෙතැන ටයිප් කරන්න...",
        themeLabelDark: "අඳුරු",
        themeLabelLight: "සැහැල්ලු",
        clearChatText: "සංවාදය හිස් කරන්න",
        exportChatText: "සංවාදය බාගන්න",
        suggestionsText: "යෝජනා",
        copyright: "Copyright © 2025 SPMods. All Rights Reserved.",
        designCredit: "Developed: Sandun Piumal",
        userLabel: "ඔබ",
        aiLabel: "Smart AI",
        historyTitle: "සංවාද ඉතිහාසය",
        historyToggleText: "ඉතිහාසය",
        currentSessionTitle: "වත්මන් සංවාදය",
        newChatText: "නව සංවාදය",
        importChatText: "ආයාත කරන්න"
    },
    english: {
        authTitle: "Smart AI",
        authSubtitle: "Powered by Gemini AI",
        emailLabel: "Email",
        passwordLabel: "Password",
        nameLabel: "Name",
        confirmPasswordLabel: "Confirm Password",
        loginButton: "Login",
        signupButton: "Sign Up",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        showSignup: "Sign Up",
        showLogin: "Login",
        forgotPassword: "Forgot Password?",
        resetPasswordButton: "Reset Password",
        backToLogin: "Back to Login",
        logoTitle: "Smart AI",
        headerSubtitle: "Powered by Gemini AI",
        username: "User",
        userStatus: "Online",
        logoutText: "Logout",
        welcomeTitle: "New Model Successfully Updated! ✨",
        welcomeText: "Ready to work with Gemini AI Model!<br>Type your question below 🚀",
        typingText: "Smart AI is preparing response",
        inputPlaceholder: "Type your question here...",
        themeLabelDark: "Dark",
        themeLabelLight: "Light",
        clearChatText: "Clear Chat",
        exportChatText: "Export Chat",
        suggestionsText: "Suggestions",
        copyright: "Copyright © 2025 SPMods. All Rights Reserved.",
        designCredit: "Developed: Sandun Piumal",
        userLabel: "You",
        aiLabel: "Smart AI",
        historyTitle: "Chat History",
        historyToggleText: "History",
        currentSessionTitle: "Current Session",
        newChatText: "New Chat",
        importChatText: "Import"
    }
};

// Current state
let currentLanguage = 'sinhala';
let currentTheme = 'dark';
let chatHistory = [];
let chatSessions = [];
let currentSessionId = null;
let isProcessing = false;

// Gemini API Key - USING FREE TIER
const GOOGLE_AI_API_KEY = 'AIzaSyAJhruzaSUiKhP8GP7ZLg2h25GBTSKq1gs';

// DOM Elements Cache
const elements = {
    authContainer: document.getElementById('authContainer'),
    chatApp: document.getElementById('chatApp'),
    loginForm: document.getElementById('loginForm'),
    signupForm: document.getElementById('signupForm'),
    forgotPasswordForm: document.getElementById('forgotPasswordForm'),
    loginError: document.getElementById('loginError'),
    signupError: document.getElementById('signupError'),
    signupSuccess: document.getElementById('signupSuccess'),
    forgotError: document.getElementById('forgotError'),
    forgotSuccess: document.getElementById('forgotSuccess'),
    chatMessages: document.getElementById('chatMessages'),
    messageInput: document.getElementById('messageInput'),
    sendButton: document.getElementById('sendButton'),
    typingIndicator: document.getElementById('typingIndicator'),
    themeToggle: document.getElementById('themeToggle'),
    themeLabel: document.getElementById('themeLabel'),
    clearChatBtn: document.getElementById('clearChatBtn'),
    exportChatBtn: document.getElementById('exportChatBtn'),
    suggestionsBtn: document.getElementById('suggestionsBtn'),
    notification: document.getElementById('notification'),
    notificationText: document.getElementById('notificationText'),
    chatSidebar: document.getElementById('chatSidebar'),
    chatSessionsContainer: document.getElementById('chatSessions'),
    historySearch: document.getElementById('historySearch'),
    newChatBtn: document.getElementById('newChatBtn')
};

// Performance optimized functions
const utils = {
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for performance
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Safe DOM element getter
    getElement(id) {
        return document.getElementById(id);
    },

    // Safe text content setter
    setText(id, text) {
        const element = this.getElement(id);
        if (element) element.textContent = text;
    }
};

// User-specific data handling
function getUserId() {
    const user = auth.currentUser;
    return user ? user.uid : 'anonymous';
}

function getStorageKey() {
    return `smartai-${getUserId()}-sessions`;
}

function generateSessionId() {
    return 'session_' + Date.now();
}

function createNewSession() {
    if (isProcessing) return;
    isProcessing = true;

    const sessionId = generateSessionId();
    const session = {
        id: sessionId,
        title: currentLanguage === 'sinhala' ? 'නව සංවාදය' : 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    chatSessions.unshift(session);
    currentSessionId = sessionId;
    chatHistory = [];
    
    saveChatSessions();
    renderChatSessions();
    clearChatMessages();
    updateSessionDisplay();
    
    showNotification(
        currentLanguage === 'sinhala' ? 'නව සංවාදය ආරම්භ කරන ලදී' : 'New chat started'
    );
    
    setTimeout(() => { isProcessing = false; }, 100);
}

function loadChatSessions() {
    const storageKey = getStorageKey();
    try {
        const savedSessions = localStorage.getItem(storageKey);
        chatSessions = savedSessions ? JSON.parse(savedSessions) : [];
        
        if (chatSessions.length === 0) {
            createNewSession();
        } else {
            currentSessionId = chatSessions[0].id;
            chatHistory = chatSessions[0].messages || [];
            renderChatHistory();
        }
        
        renderChatSessions();
        updateSessionDisplay();
    } catch (e) {
        console.error("Error loading sessions:", e);
        chatSessions = [];
        createNewSession();
    }
}

function saveChatSessions() {
    const storageKey = getStorageKey();
    try {
        // Limit sessions to prevent memory issues
        if (chatSessions.length > 50) {
            chatSessions = chatSessions.slice(0, 50);
        }
        localStorage.setItem(storageKey, JSON.stringify(chatSessions));
    } catch (e) {
        console.error("Error saving sessions:", e);
    }
}

function renderChatSessions() {
    if (!elements.chatSessionsContainer) return;
    
    const searchTerm = elements.historySearch ? elements.historySearch.value.toLowerCase() : '';
    const filteredSessions = chatSessions.filter(session => 
        session.title.toLowerCase().includes(searchTerm)
    ).slice(0, 20); // Limit displayed sessions
    
    elements.chatSessionsContainer.innerHTML = '';
    
    filteredSessions.forEach(session => {
        const sessionElement = document.createElement('div');
        sessionElement.className = 'chat-session';
        if (session.id === currentSessionId) {
            sessionElement.classList.add('active');
        }
        
        const lastMessage = session.messages.length > 0 ? 
            session.messages[session.messages.length - 1].content : 
            (currentLanguage === 'sinhala' ? 'සංවාදය ආරම්භ කරන්න' : 'Start conversation');
        
        sessionElement.innerHTML = `
            <div class="session-title">${session.title}</div>
            <div class="session-preview">${lastMessage.substring(0, 40)}${lastMessage.length > 40 ? '...' : ''}</div>
            <div class="session-meta">
                <span>${new Date(session.updatedAt).toLocaleDateString()}</span>
                <span>${session.messages.length} ${currentLanguage === 'sinhala' ? 'පණිවිඩ' : 'msgs'}</span>
            </div>
        `;
        
        sessionElement.addEventListener('click', () => {
            if (!isProcessing) {
                switchToSession(session.id);
            }
        });
        
        elements.chatSessionsContainer.appendChild(sessionElement);
    });
}

function switchToSession(sessionId) {
    if (isProcessing) return;
    isProcessing = true;

    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
        currentSessionId = sessionId;
        chatHistory = session.messages || [];
        renderChatHistory();
        renderChatSessions();
        updateSessionDisplay();
        
        if (window.innerWidth <= 768 && elements.chatSidebar) {
            elements.chatSidebar.classList.remove('active');
        }
    }
    
    setTimeout(() => { isProcessing = false; }, 50);
}

function updateSessionDisplay() {
    const currentSession = chatSessions.find(s => s.id === currentSessionId);
    if (currentSession) {
        utils.setText('currentSessionTitle', currentSession.title);
        utils.setText('sessionDate', new Date(currentSession.updatedAt).toLocaleDateString());
    }
}

// Authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        showChatApp();
        updateUserProfile(user);
        loadChatSessions();
    } else {
        showAuthContainer();
        chatSessions = [];
        currentSessionId = null;
        chatHistory = [];
    }
});

function updateUserProfile(user) {
    const username = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
    utils.setText('username', username);
}

// UI Management
function showAuthContainer() {
    if (elements.authContainer) elements.authContainer.style.display = 'block';
    if (elements.chatApp) elements.chatApp.style.display = 'none';
    showLoginForm();
}

function showChatApp() {
    if (elements.authContainer) elements.authContainer.style.display = 'none';
    if (elements.chatApp) elements.chatApp.style.display = 'flex';
    if (elements.messageInput) elements.messageInput.focus();
}

function showLoginForm() {
    if (elements.loginForm) elements.loginForm.style.display = 'flex';
    if (elements.signupForm) elements.signupForm.style.display = 'none';
    if (elements.forgotPasswordForm) elements.forgotPasswordForm.style.display = 'none';
    hideAllMessages();
}

function showSignupForm() {
    if (elements.loginForm) elements.loginForm.style.display = 'none';
    if (elements.signupForm) elements.signupForm.style.display = 'flex';
    if (elements.forgotPasswordForm) elements.forgotPasswordForm.style.display = 'none';
    hideAllMessages();
}

function showForgotPasswordForm() {
    if (elements.loginForm) elements.loginForm.style.display = 'none';
    if (elements.signupForm) elements.signupForm.style.display = 'none';
    if (elements.forgotPasswordForm) elements.forgotPasswordForm.style.display = 'flex';
    hideAllMessages();
}

function hideAllMessages() {
    const messages = [elements.loginError, elements.signupError, elements.signupSuccess, elements.forgotError, elements.forgotSuccess];
    messages.forEach(msg => {
        if (msg) msg.style.display = 'none';
    });
}

function showNotification(message, type = 'success') {
    if (!elements.notification || !elements.notificationText) return;
    
    elements.notification.className = `notification ${type}`;
    elements.notificationText.textContent = message;
    elements.notification.classList.add('show');
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 2000);
}

// Authentication handlers
function setupAuthHandlers() {
    // Login
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isProcessing) return;
            
            const email = utils.getElement('loginEmail').value;
            const password = utils.getElement('loginPassword').value;
            const button = utils.getElement('loginButton');
            const loader = utils.getElement('loginLoader');
            
            if (elements.loginError) elements.loginError.style.display = 'none';
            
            isProcessing = true;
            if (button) button.disabled = true;
            if (loader) loader.style.display = 'block';
            utils.setText('loginButtonText', 'Logging in...');
            
            try {
                await auth.signInWithEmailAndPassword(email, password);
                elements.loginForm.reset();
                showNotification(
                    currentLanguage === 'sinhala' ? 'සාර්ථකව පිවිසියා!' : 'Successfully logged in!'
                );
            } catch (error) {
                if (elements.loginError) {
                    elements.loginError.textContent = currentLanguage === 'sinhala' 
                        ? 'පිවිසුම අසාර්ථකයි. තොරතුරු පරීක්ෂා කරන්න.' 
                        : 'Login failed. Check your credentials.';
                    elements.loginError.style.display = 'block';
                }
            } finally {
                isProcessing = false;
                if (button) button.disabled = false;
                if (loader) loader.style.display = 'none';
                utils.setText('loginButtonText', languageContent[currentLanguage].loginButton);
            }
        });
    }

    // Signup
    if (elements.signupForm) {
        elements.signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isProcessing) return;
            
            const name = utils.getElement('signupName').value;
            const email = utils.getElement('signupEmail').value;
            const password = utils.getElement('signupPassword').value;
            const confirmPassword = utils.getElement('confirmPassword').value;
            const button = utils.getElement('signupButton');
            const loader = utils.getElement('signupLoader');
            
            hideAllMessages();
            
            if (password !== confirmPassword) {
                if (elements.signupError) {
                    elements.signupError.textContent = currentLanguage === 'sinhala' 
                        ? 'මුරපද ගැලපෙන්නේ නැත' 
                        : 'Passwords do not match';
                    elements.signupError.style.display = 'block';
                }
                return;
            }
            
            isProcessing = true;
            if (button) button.disabled = true;
            if (loader) loader.style.display = 'block';
            utils.setText('signupButtonText', 'Creating account...');
            
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                await userCredential.user.updateProfile({ displayName: name });
                
                if (elements.signupSuccess) {
                    elements.signupSuccess.textContent = currentLanguage === 'sinhala' 
                        ? 'ලියාපදිංචිය සාර්ථකයි!' 
                        : 'Registration successful!';
                    elements.signupSuccess.style.display = 'block';
                }
                elements.signupForm.reset();
                showNotification(
                    currentLanguage === 'sinhala' ? 'ලියාපදිංචිය සාර්ථකයි!' : 'Registration successful!'
                );
            } catch (error) {
                if (elements.signupError) {
                    elements.signupError.textContent = currentLanguage === 'sinhala' 
                        ? 'ලියාපදිංචිය අසාර්ථකයි. නැවත උත්සාහ කරන්න.' 
                        : 'Registration failed. Please try again.';
                    elements.signupError.style.display = 'block';
                }
            } finally {
                isProcessing = false;
                if (button) button.disabled = false;
                if (loader) loader.style.display = 'none';
                utils.setText('signupButtonText', languageContent[currentLanguage].signupButton);
            }
        });
    }

    // Forgot password
    if (elements.forgotPasswordForm) {
        elements.forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isProcessing) return;
            
            const email = utils.getElement('forgotEmail').value;
            const button = utils.getElement('resetPasswordButton');
            const loader = utils.getElement('resetLoader');
            
            hideAllMessages();
            
            isProcessing = true;
            if (button) button.disabled = true;
            if (loader) loader.style.display = 'block';
            utils.setText('resetButtonText', 'Sending...');
            
            try {
                await auth.sendPasswordResetEmail(email);
                
                if (elements.forgotSuccess) {
                    elements.forgotSuccess.textContent = currentLanguage === 'sinhala' 
                        ? 'මුරපද යළි සැකසුම් ඊමේල් එකක් යවන ලදී!' 
                        : 'Password reset email sent!';
                    elements.forgotSuccess.style.display = 'block';
                }
                elements.forgotPasswordForm.reset();
            } catch (error) {
                if (elements.forgotError) {
                    elements.forgotError.textContent = currentLanguage === 'sinhala' 
                        ? 'යළි සැකසුම් ඊමේල් යැවීම අසාර්ථකයි.' 
                        : 'Failed to send reset email.';
                    elements.forgotError.style.display = 'block';
                }
            } finally {
                isProcessing = false;
                if (button) button.disabled = false;
                if (loader) loader.style.display = 'none';
                utils.setText('resetButtonText', languageContent[currentLanguage].resetPasswordButton);
            }
        });
    }
}

// Theme and Language
function switchTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('smartai-theme', theme);
    
    const content = languageContent[currentLanguage];
    if (elements.themeLabel) {
        elements.themeLabel.textContent = theme === 'dark' ? content.themeLabelDark : content.themeLabelLight;
    }
}

function switchLanguage(lang) {
    currentLanguage = lang;
    const content = languageContent[lang];
    
    // Update all text content efficiently
    Object.keys(content).forEach(key => {
        const element = utils.getElement(key);
        if (element) {
            if (key === 'welcomeText') {
                element.innerHTML = content[key];
            } else {
                element.textContent = content[key];
            }
        }
    });
    
    // Update input placeholder
    if (elements.messageInput) {
        elements.messageInput.placeholder = content.inputPlaceholder;
    }
    
    // Update buttons
    if (elements.newChatBtn) {
        elements.newChatBtn.innerHTML = `<i class="fas fa-plus"></i><span>${content.newChatText}</span>`;
    }
    
    // Update language buttons
    const sinhalaBtn = utils.getElement('sinhalaBtn');
    const englishBtn = utils.getElement('englishBtn');
    if (sinhalaBtn && englishBtn) {
        sinhalaBtn.classList.toggle('active', lang === 'sinhala');
        englishBtn.classList.toggle('active', lang === 'english');
    }
    
    localStorage.setItem('smartai-language', lang);
}

// Chat functionality
function addMessage(message, isUser) {
    if (!elements.chatMessages) return;
    
    const welcomeMsg = elements.chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    const content = languageContent[currentLanguage];
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const messageContent = `
        <div class="message-header">
            <div class="message-avatar">
                <i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            ${isUser ? content.userLabel : content.aiLabel}
        </div>
        <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
        ${!isUser ? `
            <div class="message-actions">
                <button class="message-action-btn copy-btn">
                    <i class="fas fa-copy"></i> ${currentLanguage === 'sinhala' ? 'පිටපත් කරන්න' : 'Copy'}
                </button>
            </div>
        ` : ''}
    `;
    
    messageDiv.innerHTML = messageContent;
    
    // Add copy functionality
    const copyBtn = messageDiv.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(message).then(() => {
                showNotification(
                    currentLanguage === 'sinhala' ? 'පිළිතුරු පිටපත් කරන ලදී' : 'Response copied'
                );
            });
        });
    }
    
    elements.chatMessages.appendChild(messageDiv);
    
    // Add to history
    chatHistory.push({
        content: message,
        isUser: isUser,
        timestamp: Date.now()
    });
    
    // Update session
    const currentSession = chatSessions.find(s => s.id === currentSessionId);
    if (currentSession) {
        currentSession.messages = chatHistory;
        currentSession.updatedAt = Date.now();
        
        // Update title from first message
        if (isUser && currentSession.messages.filter(m => m.isUser).length === 1) {
            currentSession.title = message.substring(0, 25) + (message.length > 25 ? '...' : '');
        }
        
        saveChatSessions();
        renderChatSessions();
    }
    
    // Scroll to bottom
    setTimeout(() => {
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }, 50);
}

function renderChatHistory() {
    if (!elements.chatMessages) return;
    
    elements.chatMessages.innerHTML = '';
    
    if (chatHistory.length === 0) {
        const content = languageContent[currentLanguage];
        elements.chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-rocket"></i>
                </div>
                <h2>${content.welcomeTitle}</h2>
                <p>${content.welcomeText}</p>
                <div class="feature-buttons">
                    <button class="feature-btn" id="clearChatBtn">
                        <i class="fas fa-trash"></i>
                        <span>${content.clearChatText}</span>
                    </button>
                    <button class="feature-btn" id="exportChatBtn">
                        <i class="fas fa-download"></i>
                        <span>${content.exportChatText}</span>
                    </button>
                    <button class="feature-btn" id="suggestionsBtn">
                        <i class="fas fa-lightbulb"></i>
                        <span>${content.suggestionsText}</span>
                    </button>
                </div>
            </div>
        `;
    } else {
        chatHistory.forEach(msg => {
            addMessage(msg.content, msg.isUser);
        });
    }
}

function clearChatMessages() {
    if (!elements.chatMessages) return;
    
    const content = languageContent[currentLanguage];
    elements.chatMessages.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">
                <i class="fas fa-rocket"></i>
            </div>
            <h2>${content.welcomeTitle}</h2>
            <p>${content.welcomeText}</p>
            <div class="feature-buttons">
                <button class="feature-btn" id="clearChatBtn">
                    <i class="fas fa-trash"></i>
                    <span>${content.clearChatText}</span>
                </button>
                <button class="feature-btn" id="exportChatBtn">
                    <i class="fas fa-download"></i>
                    <span>${content.exportChatText}</span>
                </button>
                <button class="feature-btn" id="suggestionsBtn">
                    <i class="fas fa-lightbulb"></i>
                    <span>${content.suggestionsText}</span>
                </button>
            </div>
        </div>
    `;
}

// Gemini API - OPTIMIZED
async function getAIResponse(userMessage) {
    try {
        // This also works
// Check if this works for you
// This works 100%
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`;
        
        const languagePrompt = currentLanguage === 'sinhala' ? 
            "කරුණාකර සිංහල භාෂාවෙන් පමණක් පිළිතුරු දෙන්න. පිළිතුර සරල හා පැහැදිලි විය යුතුය." : 
            "Please respond in English only. Keep the response clear and concise.";
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${userMessage}\n\n${languagePrompt}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 
            (currentLanguage === 'sinhala' ? 
                "කණගාටුයි, පිළිතුරු ලබා ගැනීමට නොහැකි විය." : 
                "Sorry, couldn't get a response.");
    } catch (error) {
        console.error("API Error:", error);
        return currentLanguage === 'sinhala' ? 
            "කණගාටුයි, දෝෂයක් ඇති විය. පසුව උත්සාහ කරන්න." : 
            "Sorry, an error occurred. Please try again.";
    }
}

async function sendMessage() {
    if (!elements.messageInput || isProcessing) return;
    
    const message = elements.messageInput.value.trim();
    if (message === '') return;
    
    addMessage(message, true);
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    
    isProcessing = true;
    if (elements.sendButton) elements.sendButton.disabled = true;
    if (elements.typingIndicator) elements.typingIndicator.style.display = 'block';
    
    try {
        const response = await getAIResponse(message);
        if (elements.typingIndicator) elements.typingIndicator.style.display = 'none';
        addMessage(response, false);
    } catch (error) {
        if (elements.typingIndicator) elements.typingIndicator.style.display = 'none';
        const errorMessage = currentLanguage === 'sinhala' ? 
            "කණගාටුයි, දෝෂයක් ඇති විය." : 
            "Sorry, an error occurred.";
        addMessage(errorMessage, false);
    } finally {
        isProcessing = false;
        if (elements.sendButton) elements.sendButton.disabled = false;
        if (elements.messageInput) elements.messageInput.focus();
    }
}

// Event listeners setup
function setupEventListeners() {
    // Theme toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('change', function() {
            switchTheme(this.checked ? 'light' : 'dark');
        });
    }

    // Language switchers
    const sinhalaBtn = utils.getElement('sinhalaBtn');
    const englishBtn = utils.getElement('englishBtn');
    if (sinhalaBtn) sinhalaBtn.addEventListener('click', () => switchLanguage('sinhala'));
    if (englishBtn) englishBtn.addEventListener('click', () => switchLanguage('english'));

    // Form switchers
    const showSignup = utils.getElement('showSignup');
    const showLogin = utils.getElement('showLogin');
    const forgotPassword = utils.getElement('forgotPassword');
    const backToLogin = utils.getElement('backToLogin');
    
    if (showSignup) showSignup.addEventListener('click', showSignupForm);
    if (showLogin) showLogin.addEventListener('click', showLoginForm);
    if (forgotPassword) forgotPassword.addEventListener('click', showForgotPasswordForm);
    if (backToLogin) backToLogin.addEventListener('click', showLoginForm);

    // Logout
    const logoutBtn = utils.getElement('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                showNotification(
                    currentLanguage === 'sinhala' ? 'සාර්ථකව පිටවිය!' : 'Successfully logged out!'
                );
            });
        });
    }

    // Chat history
    const historyToggle = utils.getElement('historyToggle');
    const sidebarClose = utils.getElement('sidebarClose');
    
    if (historyToggle) {
        historyToggle.addEventListener('click', () => {
            if (elements.chatSidebar) {
                elements.chatSidebar.classList.toggle('active');
            }
        });
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            if (elements.chatSidebar) {
                elements.chatSidebar.classList.remove('active');
            }
        });
    }

    // New chat
    if (elements.newChatBtn) {
        elements.newChatBtn.addEventListener('click', createNewSession);
    }

    // Send message
    if (elements.sendButton) {
        elements.sendButton.addEventListener('click', sendMessage);
    }

    if (elements.messageInput) {
        elements.messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        elements.messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }

    // Clear chat
    if (elements.clearChatBtn) {
        elements.clearChatBtn.addEventListener('click', function() {
            if (chatHistory.length > 0) {
                chatHistory = [];
                const currentSession = chatSessions.find(s => s.id === currentSessionId);
                if (currentSession) {
                    currentSession.messages = [];
                    currentSession.updatedAt = Date.now();
                    saveChatSessions();
                    renderChatSessions();
                }
                clearChatMessages();
                showNotification(
                    currentLanguage === 'sinhala' ? 'සංවාදය හිස් කරන ලදී' : 'Chat cleared'
                );
            }
        });
    }

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            elements.chatSidebar && 
            elements.chatSidebar.classList.contains('active') &&
            !elements.chatSidebar.contains(e.target) &&
            !utils.getElement('historyToggle')?.contains(e.target)) {
            elements.chatSidebar.classList.remove('active');
        }
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Smart AI App Initialized - Optimized Version");
    
    // Load preferences
    const savedTheme = localStorage.getItem('smartai-theme') || 'dark';
    const savedLanguage = localStorage.getItem('smartai-language') || 'sinhala';
    
    switchTheme(savedTheme);
    switchLanguage(savedLanguage);
    
    if (elements.themeToggle && savedTheme === 'light') {
        elements.themeToggle.checked = true;
    }
    
    // Setup all handlers
    setupAuthHandlers();
    setupEventListeners();
    
    // Initialize UI
    showAuthContainer();
    
    // Initialize chat input height
    if (elements.messageInput) {
        elements.messageInput.style.height = 'auto';
    }
    
    console.log("✅ All systems ready - No lag guaranteed!");
});
