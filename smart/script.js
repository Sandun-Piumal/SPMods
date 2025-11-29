// ============================================
// SMART AI - 100% REAL AI CHAT APP - FIXED
// script.js - Part 1/10: Configuration & Initialization
// ============================================

// ============================================
// API CONFIGURATIONS - WORKING API KEYS
// ============================================

// Groq API - Free & Working
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Alternative Groq API Keys (if first fails)
const GROQ_API_KEYS = [
    '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',
    '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',
];

let currentApiKeyIndex = 0;

// Groq Vision Model - Real Image Analysis
const GROQ_VISION_MODEL = 'llama-3.2-11b-vision-preview';
const GROQ_CHAT_MODEL = 'llama-3.3-70b-versatile';

// Pollinations AI - Real Image Generation
const POLLINATIONS_API = 'https://image.pollinations.ai/prompt/';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
    authDomain: "smart-ai-chat-app.firebaseapp.com",
    projectId: "smart-ai-chat-app",
    databaseURL: "https://smart-ai-chat-app-default-rtdb.firebaseio.com"
};

// ============================================
// GLOBAL STATE VARIABLES
// ============================================

let auth = null;
let database = null;
let isProcessing = false;
let chatSessions = [];
let currentSessionId = null;
let currentImage = null;
let currentImageBase64 = null;
let currentLanguage = 'en';
let isGeneratingImage = false;
let isAnalyzingImage = false;

// ============================================
// SPLASH SCREEN MANAGEMENT
// ============================================

(function() {
    const particlesContainer = document.getElementById('splashParticles');
    if (particlesContainer) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'splash-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particlesContainer.appendChild(particle);
        }
    }
})();

let minSplashTimeElapsed = false;
let authCheckComplete = false;
const MIN_SPLASH_DURATION = 2500;

setTimeout(() => {
    console.log("⏱️ Minimum splash time elapsed");
    minSplashTimeElapsed = true;
    checkReadyToShowApp();
}, MIN_SPLASH_DURATION);

function checkReadyToShowApp() {
    if (minSplashTimeElapsed && authCheckComplete) {
        console.log("✅ Ready to show app!");
        showMainApp();
    }
}

function showMainApp() {
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
        splashScreen.classList.add('hidden');
    }
}

function markAuthCheckComplete() {
    console.log("🔐 Auth check complete");
    authCheckComplete = true;
    checkReadyToShowApp();
}

// ============================================
// TRANSLATIONS
// ============================================

const translations = {
    en: {
        appTitle: "Smart AI",
        appSubtitle: "100% Real AI Assistant",
        welcomeTitle: "Hi, I'm Smart AI",
        welcomeSubtitle: "100% Real AI Assistant",
        messagePlaceholder: "Ask me anything... (Coding, Image Analysis, AI Art)",
        newChat: "New Chat",
        processing: "Processing...",
        analyzing: "Analyzing image...",
        generating: "Generating AI art...",
        imageUploaded: "Image uploaded!",
        chatDeleted: "Chat deleted!",
        loginSuccess: "Login successful!",
        logoutSuccess: "Logged out successfully!",
        email: "Email",
        password: "Password",
        name: "Name",
        login: "Login",
        signUp: "Sign Up"
    },
    si: {
        appTitle: "Smart AI",
        appSubtitle: "100% සැබෑ AI සහායක",
        welcomeTitle: "හායි, මම Smart AI",
        welcomeSubtitle: "100% සැබෑ AI සහායක",
        messagePlaceholder: "ඕනෑම දෙයක් අහන්න... (Coding, පින්තූර විශ්ලේෂණය, AI කලාව)",
        newChat: "නව සංවාදය",
        processing: "සැකසෙමින්...",
        analyzing: "පින්තූරය විශ්ලේෂණය කරමින්...",
        generating: "AI කලාව සාදමින්...",
        imageUploaded: "පින්තූරය උඩුගත විය!",
        chatDeleted: "සංවාදය මකා දමන ලදී!",
        loginSuccess: "පිවිසුම සාර්ථකයි!",
        logoutSuccess: "සාර්ථකව ඉවත් විය!",
        email: "විද්‍යුත් ලිපිනය",
        password: "මුරපදය",
        name: "නම",
        login: "ඇතුල් වන්න",
        signUp: "ලියාපදිංචි වන්න"
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTranslation(key) {
    return translations[currentLanguage][key] || translations.en[key] || key;
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    if (!notification || !text) return;
    
    const icon = notification.querySelector('i');
    notification.className = `notification ${type}`;
    text.textContent = message;
    
    if (icon) {
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    }
    
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
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
    if (overlay) overlay.classList.remove('show');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'si' : 'en';
    updateLanguage();
    showNotification(currentLanguage === 'en' ? 'Language changed to English' : 'භාෂාව සිංහලට වෙනස් විය');
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation) element.textContent = translation;
    });
    localStorage.setItem('smartai-language', currentLanguage);
}

function loadLanguagePreference() {
    const savedLang = localStorage.getItem('smartai-language');
    if (savedLang && (savedLang === 'en' || savedLang === 'si')) {
        currentLanguage = savedLang;
    }
    updateLanguage();
}

// ============================================
// API KEY ROTATION (If one fails, try next)
// ============================================

function getNextApiKey() {
    currentApiKeyIndex = (currentApiKeyIndex + 1) % GROQ_API_KEYS.length;
    return GROQ_API_KEYS[currentApiKeyIndex];
}

function getCurrentApiKey() {
    return GROQ_API_KEYS[currentApiKeyIndex];
}

console.log("✅ Part 1 loaded - Config & Init (FIXED)");

// ============================================
// FIREBASE INITIALIZATION
// ============================================

function initializeFirebase() {
    try {
        console.log("🔄 Initializing Firebase...");
        
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not loaded');
            showNotification('Please check your internet connection', 'error');
            markAuthCheckComplete();
            return;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        } else {
            firebase.app();
        }
        
        auth = firebase.auth();
        database = firebase.database();
        
        console.log("✅ Firebase initialized successfully");

        auth.onAuthStateChanged((user) => {
            console.log("🔐 Auth state changed:", user ? user.email : "No user");
            markAuthCheckComplete();
            
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
        markAuthCheckComplete();
        showNotification("Failed to initialize app", "error");
    }
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

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
        await auth.signInWithEmailAndPassword(email.value, password.value);
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
        
        await user.updateProfile({ displayName: name.value });
        await saveUserToDatabase(user.uid, name.value, email.value);
        
        const successMsg = document.getElementById('signupSuccess');
        if (successMsg) {
            successMsg.textContent = 'Registration successful! Redirecting...';
            successMsg.style.display = 'block';
        }
        
        if (name) name.value = '';
        if (email) email.value = '';
        if (password) password.value = '';
        
        setTimeout(() => showLogin(), 2000);
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

// ============================================
// DATABASE FUNCTIONS
// ============================================

async function saveUserToDatabase(userId, name, email) {
    try {
        const userData = {
            name: name,
            email: email,
            createdAt: Date.now(),
            lastLogin: Date.now()
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
        await userRef.update({ lastLogin: Date.now() });
        console.log("✅ User last login updated");
    } catch (error) {
        console.error("❌ Error updating user in database:", error);
    }
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================

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

console.log("✅ Part 2 loaded - Firebase & Auth");

// ============================================
// script.js FIXED - Part 3/10: Real AI Chat with Error Handling
// ============================================

// ============================================
// GROQ AI CHAT - WITH BETTER ERROR HANDLING
// ============================================

async function getGroqAIResponse(userMessage, conversationHistory = []) {
    console.log("🤖 Getting REAL Groq AI response...");
    
    let attempts = 0;
    const maxAttempts = GROQ_API_KEYS.length;
    
    while (attempts < maxAttempts) {
        try {
            const messages = [];
            
            // System prompt
            messages.push({
                role: "system",
                content: `You are Smart AI, a highly intelligent and helpful AI assistant. You excel at:
- Writing and explaining code in multiple programming languages
- Solving complex problems
- Clear and detailed explanations
- Being friendly and professional

Always provide accurate, helpful, and well-structured responses.`
            });
            
            // Add conversation history
            for (let i = 0; i < conversationHistory.length; i++) {
                const msg = conversationHistory[i];
                messages.push({
                    role: msg.isUser ? "user" : "assistant",
                    content: msg.content
                });
            }
            
            // Add current message
            messages.push({
                role: "user",
                content: userMessage
            });
            
            const requestBody = {
                model: GROQ_CHAT_MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: 4096,
                top_p: 0.9,
                stream: false
            };
            
            console.log(`📤 Attempt ${attempts + 1}: Sending to Groq API...`);
            
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCurrentApiKey()}`
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`❌ Groq API Error (Attempt ${attempts + 1}):`, errorData);
                
                // If rate limited or auth error, try next key
                if (response.status === 429 || response.status === 401) {
                    console.log('⚠️ Trying next API key...');
                    getNextApiKey();
                    attempts++;
                    continue;
                }
                
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            const aiResponse = data.choices?.[0]?.message?.content;
            
            if (!aiResponse) {
                throw new Error('Empty response from AI');
            }
            
            console.log("✅ Groq AI response successful");
            return aiResponse;
            
        } catch (error) {
            console.error(`❌ Groq AI Error (Attempt ${attempts + 1}):`, error);
            attempts++;
            
            // If last attempt, return error message
            if (attempts >= maxAttempts) {
                console.error('❌ All API keys failed');
                
                if (currentLanguage === 'si') {
                    return 'මට කණගාටුයි, දැන් AI service එක ලබා ගත නොහැක. කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න.\n\nඔබට:\n- නැවත උත්සාහ කළ හැක\n- මොහොතකින් පසු උත්සාහ කරන්න\n- විවිධ ප්‍රශ්නයක් අහන්න';
                } else {
                    return 'I apologize, the AI service is temporarily unavailable. Please try again in a moment.\n\nYou can:\n- Try again\n- Wait a moment and retry\n- Ask a different question';
                }
            }
            
            // Try next API key
            getNextApiKey();
        }
    }
}

// ============================================
// IMAGE TO BASE64 CONVERSION
// ============================================

function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================
// MESSAGE FORMATTING WITH MARKDOWN
// ============================================

function formatAIResponse(text) {
    if (!text) return '';
    
    // Use marked.js if available
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            highlight: function(code, lang) {
                if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (e) {
                        console.error('Highlight error:', e);
                    }
                }
                return code;
            },
            breaks: true,
            gfm: true
        });
        
        try {
            return marked.parse(text);
        } catch (e) {
            console.error('Markdown parse error:', e);
        }
    }
    
    // Fallback simple formatting
    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
    });
    
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    text = text.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    text = text.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    
    // Headers
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Lists
    text = text.replace(/^\* (.*$)/gm, '<li>$1</li>');
    text = text.replace(/^- (.*$)/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// ============================================
// DISPLAY MESSAGE FUNCTION
// ============================================

function displayMessage(content, isUser, imageUrl = null) {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    const welcome = messagesDiv.querySelector('.welcome-screen');
    if (welcome) welcome.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const avatarIcon = isUser ? 
        '<div class="message-avatar"><i class="fas fa-user"></i></div>' : 
        '<div class="message-avatar"><i class="fas fa-robot"></i></div>';
    
    const messageLabel = isUser ? 
        (currentLanguage === 'si' ? 'ඔබ' : 'You') : 
        'Smart AI';
    
    const formattedContent = isUser ? content.replace(/\n/g, '<br>') : formatAIResponse(content);
    
    let imageHTML = '';
    if (imageUrl) {
        imageHTML = `<img src="${imageUrl}" class="message-image" alt="Image" onclick="showImageModal('${imageUrl}')">`;
    }
    
    messageDiv.innerHTML = `
        <div class="message-header">
            ${avatarIcon}
            <span>${messageLabel}</span>
        </div>
        <div class="message-content">
            ${imageHTML}
            <div class="message-text">${formattedContent}</div>
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
    
    // Highlight code blocks
    if (typeof hljs !== 'undefined') {
        messageDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ============================================
// COPY MESSAGE FUNCTION
// ============================================

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
        showNotification('Copy failed', 'error');
    });
}

console.log("✅ Part 3 loaded - Real AI Chat (FIXED)");

// ============================================
// script.js - Part 4/10: Real AI Vision (Image Analysis)
// ============================================

// ============================================
// GROQ VISION API - REAL IMAGE ANALYSIS
// ============================================

async function analyzeImageWithGroqVision(base64Image, userPrompt = "What's in this image? Describe it in detail.") {
    console.log("👁️ Analyzing image with Groq Vision AI...");
    
    try {
        const messages = [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: userPrompt
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${base64Image}`
                        }
                    }
                ]
            }
        ];
        
        const requestBody = {
            model: GROQ_VISION_MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 0.9
        };
        
        console.log("📤 Sending image to Groq Vision API...");
        
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Groq Vision API Error:', errorData);
            throw new Error(`Vision API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        const analysis = data.choices?.[0]?.message?.content;
        
        if (!analysis) {
            throw new Error('Empty response from Vision AI');
        }
        
        console.log("✅ Image analysis successful");
        return analysis;
        
    } catch (error) {
        console.error('❌ Groq Vision Error:', error);
        
        if (currentLanguage === 'si') {
            return 'මට කණගාටුයි, පින්තූරය විශ්ලේෂණය කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.';
        } else {
            return 'I apologize, but I could not analyze the image. Please try again.';
        }
    }
}

// ============================================
// IMAGE UPLOAD HANDLER
// ============================================

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    if (file.size > 20 * 1024 * 1024) {
        showNotification('Image size must be less than 20MB', 'error');
        return;
    }
    
    try {
        // Show image preview
        const reader = new FileReader();
        reader.onload = async (e) => {
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImage');
            
            if (preview && previewImg) {
                previewImg.src = e.target.result;
                preview.style.display = 'block';
                currentImage = e.target.result;
                
                // Convert to base64 for API
                currentImageBase64 = await imageToBase64(file);
                
                showNotification(getTranslation('imageUploaded'));
            }
        };
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Image upload error:', error);
        showNotification('Failed to upload image', 'error');
    }
}

// ============================================
// REMOVE IMAGE
// ============================================

function removeImage() {
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImage');
    const fileInput = document.getElementById('imageInput');
    
    if (preview) preview.style.display = 'none';
    if (previewImg) previewImg.src = '';
    if (fileInput) fileInput.value = '';
    
    currentImage = null;
    currentImageBase64 = null;
}

// ============================================
// IMAGE MODAL
// ============================================

function showImageModal(imageUrl) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        modal.innerHTML = `
            <button class="image-modal-close" onclick="closeImageModal()">
                <i class="fas fa-times"></i>
            </button>
            <img src="" alt="Full size image">
        `;
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeImageModal();
            }
        });
    }
    
    const modalImg = modal.querySelector('img');
    if (modalImg) {
        modalImg.src = imageUrl;
    }
    
    modal.classList.add('show');
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// ============================================
// DETECT IF MESSAGE IS IMAGE ANALYSIS REQUEST
// ============================================

function isImageAnalysisRequest(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    const analysisPatterns = [
        /what'?s?\s+(in|on)\s+(this|the)\s+image/i,
        /describe\s+(this|the)\s+image/i,
        /analyze\s+(this|the)\s+(image|picture|photo)/i,
        /what\s+do\s+you\s+see/i,
        /tell\s+me\s+about\s+(this|the)\s+image/i,
        /explain\s+(this|the)\s+image/i,
        /පින්තූරය.*විස්තර/i,
        /මෙහි.*මොනවද/i,
        /පින්තූරය.*විශ්ලේෂණය/i
    ];
    
    return analysisPatterns.some(pattern => pattern.test(lowerMessage)) && currentImageBase64;
}

// ============================================
// HANDLE IMAGE ANALYSIS FLOW
// ============================================

async function handleImageAnalysisFlow(userMessage) {
    const session = getCurrentSession();
    if (!session) {
        createNewChat();
        return;
    }
    
    const input = document.getElementById('messageInput');
    if (input) input.value = '';
    
    // Display user message with image
    displayMessage(userMessage, true, currentImage);
    
    session.messages.push({
        content: userMessage,
        isUser: true,
        hasImage: true,
        imageUrl: currentImage,
        timestamp: Date.now()
    });
    
    if (session.messages.filter(m => m.isUser).length === 1) {
        const titleText = userMessage.replace(/<[^>]*>/g, '').substring(0, 30);
        session.title = titleText + (titleText.length >= 30 ? '...' : '');
    }
    
    session.updatedAt = Date.now();
    saveChatSessions();
    renderSessions();
    
    // Show analyzing indicator
    const typing = document.getElementById('typingIndicator');
    if (typing) {
        typing.style.display = 'flex';
        typing.innerHTML = `
            <div class="analyzing-image">
                <i class="fas fa-eye"></i>
                <span>${getTranslation('analyzing')}</span>
            </div>
        `;
    }
    
    isAnalyzingImage = true;
    
    try {
        // Analyze image with Groq Vision
        const analysis = await analyzeImageWithGroqVision(currentImageBase64, userMessage);
        
        if (typing) typing.style.display = 'none';
        
        // Display AI response
        displayMessage(analysis, false);
        
        session.messages.push({
            content: analysis,
            isUser: false,
            isImageAnalysis: true,
            timestamp: Date.now()
        });
        
        session.updatedAt = Date.now();
        saveChatSessions();
        
        showNotification(currentLanguage === 'si' ? 'පින්තූරය විශ්ලේෂණය කරන ලදී!' : 'Image analyzed successfully!');
        
    } catch (error) {
        console.error('❌ Image analysis error:', error);
        if (typing) typing.style.display = 'none';
        
        const errorMsg = currentLanguage === 'si' 
            ? 'පින්තූරය විශ්ලේෂණය කිරීමේදී දෝෂයක් සිදුවිය.'
            : 'An error occurred while analyzing the image.';
        
        displayMessage(errorMsg, false);
        
        session.messages.push({
            content: errorMsg,
            isUser: false,
            timestamp: Date.now()
        });
        
        saveChatSessions();
    } finally {
        isAnalyzingImage = false;
        removeImage();
        updateSendButtonState();
    }
}

console.log("✅ Part 4 loaded - Real AI Vision");

// ============================================
// script.js - Part 5/10: Real AI Image Generation
// ============================================

// ============================================
// POLLINATIONS AI - REAL IMAGE GENERATION
// ============================================

async function generateAIImage(prompt) {
    console.log("🎨 Generating AI image with Pollinations AI...");
    
    try {
        // Enhance prompt for better results
        const enhancedPrompt = `${prompt}, high quality, detailed, professional, 4k`;
        
        // Pollinations AI URL format
        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        const imageUrl = `${POLLINATIONS_API}${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true&enhance=true`;
        
        console.log("🖼️ Generated image URL:", imageUrl);
        
        // Verify image loads
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                console.log("✅ AI image generated successfully");
                resolve(imageUrl);
            };
            img.onerror = () => {
                console.error("❌ Failed to load generated image");
                reject(new Error('Failed to generate image'));
            };
            img.src = imageUrl;
        });
        
    } catch (error) {
        console.error('❌ AI Image Generation Error:', error);
        throw error;
    }
}

// ============================================
// DETECT IF MESSAGE IS IMAGE GENERATION REQUEST
// ============================================

function isImageGenerationRequest(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    const generationPatterns = [
        /generate\s+(an?\s+)?image/i,
        /create\s+(an?\s+)?image/i,
        /make\s+(an?\s+)?image/i,
        /draw\s+(an?\s+)?image/i,
        /generate\s+(an?\s+)?(picture|photo)/i,
        /create\s+(an?\s+)?(picture|photo)/i,
        /ai\s+art\s+of/i,
        /paint\s+(an?\s+)?image/i,
        /show\s+me\s+(an?\s+)?image\s+of/i,
        /පින්තූරයක්\s+සාදන්න/i,
        /පින්තූරයක්\s+හදන්න/i,
        /ai\s+පින්තූරය/i
    ];
    
    return generationPatterns.some(pattern => pattern.test(lowerMessage));
}

// ============================================
// EXTRACT IMAGE PROMPT FROM MESSAGE
// ============================================

function extractImagePrompt(message) {
    let prompt = message;
    
    // Remove common generation command phrases
    const commandPatterns = [
        /^(generate|create|make|draw|paint|show\s+me)\s+(an?\s+)?(image|picture|photo)\s+(of\s+)?/i,
        /^ai\s+art\s+(of\s+)?/i,
        /^පින්තූරයක්\s+(සාදන්න|හදන්න)\s*/i,
        /^ai\s+පින්තූරය\s*/i
    ];
    
    for (const pattern of commandPatterns) {
        prompt = prompt.replace(pattern, '').trim();
    }
    
    return prompt || message;
}

// ============================================
// HANDLE IMAGE GENERATION FLOW
// ============================================

async function handleImageGenerationFlow(userMessage) {
    const session = getCurrentSession();
    if (!session) {
        createNewChat();
        return;
    }
    
    const input = document.getElementById('messageInput');
    if (input) input.value = '';
    
    // Display user message
    displayMessage(userMessage, true);
    
    session.messages.push({
        content: userMessage,
        isUser: true,
        timestamp: Date.now()
    });
    
    if (session.messages.filter(m => m.isUser).length === 1) {
        const titleText = userMessage.replace(/<[^>]*>/g, '').substring(0, 30);
        session.title = titleText + (titleText.length >= 30 ? '...' : '');
    }
    
    session.updatedAt = Date.now();
    saveChatSessions();
    renderSessions();
    
    // Show generating indicator
    const typing = document.getElementById('typingIndicator');
    if (typing) {
        typing.style.display = 'flex';
        typing.innerHTML = `
            <div class="generating-art">
                <div class="art-spinner"></div>
                <p>${getTranslation('generating')}</p>
            </div>
        `;
    }
    
    isGeneratingImage = true;
    
    try {
        // Extract the actual image prompt
        const imagePrompt = extractImagePrompt(userMessage);
        console.log("🎨 Extracted prompt:", imagePrompt);
        
        // Generate image with Pollinations AI
        const imageUrl = await generateAIImage(imagePrompt);
        
        if (typing) typing.style.display = 'none';
        
        // Display generated image
        displayGeneratedImage(imageUrl, imagePrompt);
        
        session.messages.push({
            content: `Generated AI image: ${imagePrompt}`,
            isUser: false,
            isGeneratedImage: true,
            imageUrl: imageUrl,
            prompt: imagePrompt,
            timestamp: Date.now()
        });
        
        session.updatedAt = Date.now();
        saveChatSessions();
        
        showNotification(currentLanguage === 'si' ? 'AI පින්තූරය සාදන ලදී!' : 'AI image generated successfully!');
        
    } catch (error) {
        console.error('❌ Image generation error:', error);
        if (typing) typing.style.display = 'none';
        
        const errorMsg = currentLanguage === 'si' 
            ? 'පින්තූරය සෑදීමේදී දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සාහ කරන්න.'
            : 'An error occurred while generating the image. Please try again.';
        
        displayMessage(errorMsg, false);
        
        session.messages.push({
            content: errorMsg,
            isUser: false,
            timestamp: Date.now()
        });
        
        saveChatSessions();
    } finally {
        isGeneratingImage = false;
        updateSendButtonState();
    }
}

// ============================================
// DISPLAY GENERATED IMAGE
// ============================================

function displayGeneratedImage(imageUrl, prompt) {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    
    const downloadText = currentLanguage === 'si' ? 'බාගන්න' : 'Download';
    const viewText = currentLanguage === 'si' ? 'විශාල කරන්න' : 'View Full Size';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <span>Smart AI</span>
        </div>
        <div class="message-content">
            <p><strong>🎨 ${currentLanguage === 'si' ? 'AI පින්තූරය සාදන ලදී' : 'Generated AI Image'}</strong></p>
            <p style="color: var(--text-gray); font-size: 14px; margin: 8px 0;">${escapeHtml(prompt)}</p>
            <img src="${imageUrl}" class="ai-generated-image" alt="${escapeHtml(prompt)}" onclick="showImageModal('${imageUrl}')">
        </div>
        <div class="message-actions">
            <button class="action-btn" onclick="downloadImage('${imageUrl}', '${escapeHtml(prompt)}')">
                <i class="fas fa-download"></i> ${downloadText}
            </button>
            <button class="action-btn" onclick="showImageModal('${imageUrl}')">
                <i class="fas fa-expand"></i> ${viewText}
            </button>
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ============================================
// DOWNLOAD IMAGE
// ============================================

async function downloadImage(imageUrl, filename) {
    try {
        showLoading('Downloading image...');
        
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        hideLoading();
        showNotification(currentLanguage === 'si' ? 'පින්තූරය බාගත විය!' : 'Image downloaded!');
        
    } catch (error) {
        console.error('Download error:', error);
        hideLoading();
        showNotification('Download failed', 'error');
    }
}

console.log("✅ Part 5 loaded - Real AI Image Generation");

// ============================================
// script.js - Part 6/10: Send Message Handler
// ============================================

// ============================================
// MAIN SEND MESSAGE FUNCTION
// ============================================

async function sendMessage() {
    if (isProcessing || isGeneratingImage || isAnalyzingImage) return;
    
    const input = document.getElementById('messageInput');
    const message = input ? input.value.trim() : '';
    
    if (!message && !currentImage) {
        showNotification('Please enter a message or upload an image', 'error');
        return;
    }
    
    const session = getCurrentSession();
    if (!session) {
        createNewChat();
        return;
    }
    
    // Check if it's an image generation request
    if (isImageGenerationRequest(message)) {
        await handleImageGenerationFlow(message);
        return;
    }
    
    // Check if it's an image analysis request
    if (currentImageBase64 && (isImageAnalysisRequest(message) || message)) {
        await handleImageAnalysisFlow(message || "What's in this image? Describe it in detail.");
        return;
    }
    
    // Regular chat message
    await handleRegularChat(message);
}

// ============================================
// HANDLE REGULAR CHAT
// ============================================

async function handleRegularChat(message) {
    const session = getCurrentSession();
    const input = document.getElementById('messageInput');
    
    if (input) input.value = '';
    
    // Display user message
    displayMessage(message, true);
    
    session.messages.push({
        content: message,
        isUser: true,
        timestamp: Date.now()
    });
    
    // Update session title from first message
    if (session.messages.filter(m => m.isUser).length === 1) {
        const titleText = message.replace(/<[^>]*>/g, '').substring(0, 30);
        session.title = titleText + (titleText.length >= 30 ? '...' : '');
    }
    
    session.updatedAt = Date.now();
    saveChatSessions();
    renderSessions();
    
    const sendBtn = document.getElementById('sendButton');
    const typing = document.getElementById('typingIndicator');
    
    isProcessing = true;
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.classList.add('processing');
    }
    if (typing) typing.style.display = 'flex';
    
    try {
        // Get conversation history (last 10 messages for context)
        const historyForAI = session.messages.slice(-11, -1);
        
        // Get AI response
        const response = await getGroqAIResponse(message, historyForAI);
        
        if (typing) typing.style.display = 'none';
        
        // Display AI response
        displayMessage(response, false);
        
        session.messages.push({
            content: response,
            isUser: false,
            timestamp: Date.now()
        });
        
        session.updatedAt = Date.now();
        saveChatSessions();
        renderSessions();
        
    } catch (error) {
        console.error("❌ Error in sendMessage:", error);
        if (typing) typing.style.display = 'none';
        
        const errorMsg = currentLanguage === 'si' 
            ? 'මට කණගාටුයි, දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.'
            : 'Sorry, an error occurred. Please try again.';
        
        displayMessage(errorMsg, false);
        
        session.messages.push({
            content: errorMsg,
            isUser: false,
            timestamp: Date.now()
        });
        
        saveChatSessions();
    } finally {
        isProcessing = false;
        if (sendBtn) sendBtn.classList.remove('processing');
        updateSendButtonState();
        if (input) input.focus();
    }
}

// ============================================
// INPUT HANDLERS
// ============================================

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (!isProcessing && !isGeneratingImage && !isAnalyzingImage) {
            sendMessage();
        }
    }
}

function handleInputChange() {
    updateSendButtonState();
}

function updateSendButtonState() {
    const sendBtn = document.getElementById('sendButton');
    const input = document.getElementById('messageInput');
    
    if (!sendBtn) return;
    
    const hasMessage = input && input.value.trim().length > 0;
    const hasImage = currentImageBase64 !== null;
    const shouldEnable = !isProcessing && !isGeneratingImage && !isAnalyzingImage && (hasMessage || hasImage);
    
    sendBtn.disabled = !shouldEnable;
    
    if (!shouldEnable) {
        sendBtn.style.opacity = '0.5';
        sendBtn.style.cursor = 'not-allowed';
    } else {
        sendBtn.style.opacity = '1';
        sendBtn.style.cursor = 'pointer';
    }
}

// ============================================
// STORAGE FUNCTIONS
// ============================================

function getStorageKey() {
    const userId = auth && auth.currentUser ? auth.currentUser.uid : 'anonymous';
    return `smartai-sessions-${userId}`;
}

async function saveChatSessions() {
    try {
        const userId = auth && auth.currentUser ? auth.currentUser.uid : null;
        const storageKey = getStorageKey();
        
        // Save to localStorage instantly
        localStorage.setItem(storageKey, JSON.stringify(chatSessions));
        console.log("⚡ Saved to localStorage");
        
        // Sync to Firebase in background
        if (userId && database) {
            const sessionsArray = chatSessions.map((session, index) => ({
                ...session,
                index: index
            }));
            
            database.ref('users/' + userId + '/chatSessions')
                .set(sessionsArray)
                .then(() => console.log("☁️ Synced to Firebase"))
                .catch(err => console.log("⚠️ Firebase sync failed:", err));
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
        let loadedFromLocalStorage = false;

        // Load from localStorage first
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                sessions = JSON.parse(saved);
                loadedFromLocalStorage = true;
                console.log("⚡ Loaded from localStorage:", sessions.length, "chats");
            } catch (parseError) {
                console.error("❌ Failed to parse localStorage:", parseError);
                sessions = [];
            }
        }

        // Check Firebase if no localStorage
        if (userId && database) {
            if (!loadedFromLocalStorage) {
                console.log("📥 Loading from Firebase...");
                try {
                    const snapshot = await database.ref('users/' + userId + '/chatSessions').once('value');
                    
                    if (snapshot.exists()) {
                        const firebaseData = snapshot.val();
                        sessions = Array.isArray(firebaseData) ? firebaseData : Object.values(firebaseData);
                        localStorage.setItem(storageKey, JSON.stringify(sessions));
                        console.log("☁️ Loaded from Firebase:", sessions.length, "chats");
                    }
                } catch (firebaseError) {
                    console.log("⚠️ Firebase load failed:", firebaseError);
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

console.log("✅ Part 6 loaded - Send Message Handler");

// ============================================
// script.js - Part 7/10: Session Management
// ============================================

// ============================================
// CREATE NEW CHAT
// ============================================

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

// ============================================
// CLEAR MESSAGES DISPLAY
// ============================================

function clearMessages() {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    messagesDiv.innerHTML = `
        <div class="welcome-screen">
            <div class="ai-logo">
                <svg width="80" height="80" viewBox="0 0 80 80">
                    <defs>
                        <linearGradient id="logoGrad3">
                            <stop offset="0%" style="stop-color:#4A90E2"/>
                            <stop offset="100%" style="stop-color:#357ABD"/>
                        </linearGradient>
                    </defs>
                    <circle cx="40" cy="40" r="38" fill="url(#logoGrad3)"/>
                    <text x="40" y="52" text-anchor="middle" fill="white" font-size="32" font-weight="bold">AI</text>
                </svg>
            </div>
            <h1>${getTranslation('welcomeTitle')}</h1>
            <p>${getTranslation('welcomeSubtitle')}</p>
            <div class="feature-badges">
                <span class="badge"><i class="fas fa-code"></i> Real Coding</span>
                <span class="badge"><i class="fas fa-image"></i> Image Analysis</span>
                <span class="badge"><i class="fas fa-magic"></i> AI Art</span>
            </div>
        </div>
    `;
}

// ============================================
// RENDER SESSIONS IN SIDEBAR
// ============================================

function getTimeString(timestamp) {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
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

// ============================================
// SWITCH TO SESSION
// ============================================

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

// ============================================
// DELETE CHAT
// ============================================

function deleteChat(sessionId, event) {
    if (event) event.stopPropagation();
    
    const confirmMsg = currentLanguage === 'si' ? 'මෙම සංවාදය මකන්න ද?' : 'Delete this chat?';
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

// ============================================
// GET CURRENT SESSION
// ============================================

function getCurrentSession() {
    return chatSessions.find(s => s.id === currentSessionId);
}

// ============================================
// RENDER CHAT HISTORY
// ============================================

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
        if (msg.isGeneratedImage) {
            // Display generated AI image
            displayGeneratedImage(msg.imageUrl, msg.prompt);
        } else if (msg.hasImage) {
            // Display message with uploaded image
            displayMessage(msg.content, msg.isUser, msg.imageUrl);
        } else {
            // Regular message
            displayMessage(msg.content, msg.isUser);
        }
    });
}

// ============================================
// INITIALIZE APP ON LOAD
// ============================================

window.addEventListener('load', function() {
    console.log("🎯 Page loaded - initializing Smart AI");
    
    initializeFirebase();
    
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    
    // Initialize send button state
    updateSendButtonState();
    
    console.log("✅ Smart AI App initialized - VERSION 2.0.0");
    console.log("⚡ Features: 100% Real AI");
    console.log("🤖 Real Chat with Groq");
    console.log("👁️ Real Image Analysis with Vision AI");
    console.log("🎨 Real Image Generation with Pollinations AI");
    console.log("💻 Real Coding Help");
});

console.log("✅ Part 7 loaded - Session Management");

// ============================================
// script.js - Part 8/8 FINAL: Complete & Ready
// ============================================

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + K = New Chat
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        createNewChat();
    }
    
    // Ctrl/Cmd + L = Toggle Language
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault();
        toggleLanguage();
    }
    
    // Escape = Close Sidebar
    if (event.key === 'Escape') {
        closeSidebar();
        closeImageModal();
    }
});

// ============================================
// SERVICE WORKER FOR PWA (Optional)
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('✅ Service Worker registered'))
            .catch(err => console.log('❌ Service Worker registration failed:', err));
    });
}

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', function(event) {
    console.error('❌ Global error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Unhandled promise rejection:', event.reason);
});

// ============================================
// VISIBILITY CHANGE - SAVE ON TAB CLOSE
// ============================================

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        saveChatSessions();
    }
});

// ============================================
// BEFORE UNLOAD - SAVE BEFORE CLOSE
// ============================================

window.addEventListener('beforeunload', function() {
    saveChatSessions();
});

// ============================================
// RESIZE HANDLER
// ============================================

let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    }, 250);
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if user is online
window.addEventListener('online', function() {
    showNotification('Back online', 'success');
});

window.addEventListener('offline', function() {
    showNotification('You are offline', 'error');
});

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================

console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║           SMART AI - v2.0.0               ║
║        100% Real AI Assistant             ║
║                                           ║
║  Features:                                ║
║  ✅ Real AI Chat (Groq API)              ║
║  ✅ Real Image Analysis (Vision AI)      ║
║  ✅ Real Image Generation (AI Art)       ║
║  ✅ Real Coding Help                     ║
║  ✅ Firebase Authentication              ║
║  ✅ Cloud Storage                        ║
║  ✅ Sinhala + English Support            ║
║                                           ║
║  Developed by: Sandun Piumal              ║
║  © SPMods 2025                            ║
║                                           ║
╚═══════════════════════════════════════════╝

🚀 App Status: Ready
📡 APIs Connected: 
   - Groq AI (Chat & Vision)
   - Pollinations AI (Image Gen)
   - Firebase (Auth & DB)

💡 Try these commands:
   - "Write a Python function to..."
   - "Generate an image of a sunset"
   - Upload an image and ask "What's in this?"
   - "Explain how React works"

⌨️ Keyboard Shortcuts:
   - Ctrl/Cmd + K: New Chat
   - Ctrl/Cmd + L: Toggle Language
   - Escape: Close Sidebar/Modal

Happy chatting! 🎉
`);

// ============================================
// EXPORT FOR TESTING (Optional)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getGroqAIResponse,
        analyzeImageWithGroqVision,
        generateAIImage,
        formatAIResponse,
        createNewChat,
        sendMessage
    };
}

// ============================================
// APP VERSION INFO
// ============================================

const APP_INFO = {
    name: 'Smart AI',
    version: '2.0.0',
    description: '100% Real AI Assistant',
    author: 'Sandun Piumal',
    company: 'SPMods',
    year: 2025,
    features: [
        'Real AI Chat with Groq',
        'Real Image Analysis with Vision AI',
        'Real Image Generation with Pollinations AI',
        'Real Coding Help',
        'Firebase Authentication',
        'Cloud Storage',
        'Sinhala + English Support'
    ],
    apis: {
        chat: 'Groq AI (llama-3.3-70b-versatile)',
        vision: 'Groq Vision AI (llama-3.2-90b-vision-preview)',
        imageGen: 'Pollinations AI (Flux)',
        database: 'Firebase Realtime Database',
        auth: 'Firebase Authentication'
    }
};

console.log('📊 App Info:', APP_INFO);

// ============================================
// FINAL STATUS
// ============================================

console.log("✅ Part 8 loaded - Final");
console.log("✅✅✅ ALL PARTS COMPLETE! ✅✅✅");
console.log("🎉 Smart AI is 100% Ready!");
console.log("📝 Instructions:");
console.log("1. Copy all HTML parts (1-4) → save as index.html");
console.log("2. Copy all CSS parts (1-5) → save as styles.css");
console.log("3. Copy all JS parts (1-8) → save as script.js");
console.log("4. Upload to GitHub");
console.log("5. Deploy and enjoy 100% Real AI! 🚀");

// ============================================
// END OF SMART AI JAVASCRIPT
// ============================================
