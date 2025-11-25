// ============================================
// PART 1 - SPLASH SCREEN & CONFIG
// ============================================

// SPLASH SCREEN MANAGER
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
    const mainApp = document.getElementById('mainAppContainer');
    
    if (splashScreen) splashScreen.classList.add('hidden');
    setTimeout(() => {
        if (mainApp) mainApp.classList.add('visible');
    }, 500);
}

function markAuthCheckComplete() {
    console.log("🔐 Auth check complete");
    authCheckComplete = true;
    checkReadyToShowApp();
}

// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
    authDomain: "smart-ai-chat-app.firebaseapp.com",
    projectId: "smart-ai-chat-app",
    databaseURL: "https://smart-ai-chat-app-default-rtdb.firebaseio.com"
};

// GROQ API CONFIG
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// APP VERSION
const APP_VERSION = '1.1.0';
const VERSION_KEY = 'smartai-version';

// STATE VARIABLES
let auth = null;
let database = null;
let isProcessing = false;
let chatSessions = [];
let currentSessionId = null;
let currentImage = null;
let currentLanguage = 'en';
let isGeneratingImage = false;
let isImageLoading = false;

console.log("✅ Part 1 loaded - Splash & Config");

// ============================================
// PART 2 - TRANSLATIONS
// ============================================

const translations = {
    en: {
        appTitle: "Smart AI",
        appSubtitle: "Powered by Groq AI",
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
        appSubtitle: "Groq AI මගින් බලගන්වා ඇත",
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

console.log("✅ Part 2 loaded - Translations");

// ============================================
// PART 3 - HELPER FUNCTIONS
// ============================================

function checkForUpdates() {
    const savedVersion = localStorage.getItem(VERSION_KEY);
    if (savedVersion !== APP_VERSION) {
        console.log('🔄 New version detected, clearing cache...');
        if ('caches' in window) {
            caches.keys().then(function(cacheNames) {
                cacheNames.forEach(function(cacheName) {
                    caches.delete(cacheName);
                });
            });
        }
        localStorage.setItem(VERSION_KEY, APP_VERSION);
        setTimeout(() => window.location.reload(), 1000);
    }
}

function getTranslation(key) {
    return translations[currentLanguage][key] || translations.en[key] || key;
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation) element.textContent = translation;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = getTranslation(key);
        if (translation) element.placeholder = translation;
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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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

console.log("✅ Part 3 loaded - Helper Functions");

// ============================================
// PART 4 - FIREBASE & AUTH
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

console.log("✅ Part 4 loaded - Firebase & Auth");

// ============================================
// PART 5 - GROQ AI FUNCTIONS
// ============================================

async function getGroqAIResponse(userMessage, conversationHistory = []) {
    console.log("🤖 Getting Groq AI response...");
    
    try {
        const messages = [];
        
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
            model: "llama-3.3-70b-versatile",
            messages: messages,
            temperature: 0.7,
            max_tokens: 8192,
            top_p: 0.9,
            stream: false
        };
        
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
            console.error('Groq API Error:', errorData);
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
        console.error('❌ Groq AI Error:', error);
        
        if (currentLanguage === 'si') {
            return 'මට කණගාටුයි, දෝෂයක් ඇතිවිය. කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න.';
        } else {
            return 'I apologize, but I encountered an error. Please try again in a moment.';
        }
    }
}

function isTextArtRequest(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    const textArtPatterns = [
        /text\s+(art|image|picture)/i,
        /ascii\s+(art|image)/i,
        /draw\s+(with|using)?\s*(text|ascii|characters)/i,
        /create.*using\s+(text|characters|ascii)/i,
        /make.*text\s+(art|image)/i,
        /අකුරු\s*(පින්තූර|කලාව)/i,
        /text\s*පින්තූර/i,
    ];
    
    return textArtPatterns.some(pattern => pattern.test(lowerMessage));
}

async function generateTextArt(prompt) {
    try {
        console.log("🎨 Generating text art for:", prompt);
        
        const loadingMsg = currentLanguage === 'si' ? 'Text art එක සාදමින්...' : 'Creating text art...';
        showLoading(loadingMsg);
        isGeneratingImage = true;

        const enhancedPrompt = `You are an expert ASCII/Text artist. Create a detailed text-based image/ASCII art of: "${prompt}"

IMPORTANT INSTRUCTIONS:
1. Use ASCII characters, Unicode box-drawing characters, or emojis
2. Make it visually appealing and detailed
3. The art should be at least 15-30 lines tall for good detail
4. Use creative spacing and characters
5. Add a title and description

Example format:

╔═══════════════════════════════════╗
║        [TITLE OF YOUR ART]        ║
╚═══════════════════════════════════╝

[Your ASCII/Text Art Here - Be Creative!]
Use characters like: ░▒▓█▀▄│─┌┐└┘├┤┬┴┼
Or emojis: 🌟✨💫⭐🌙☀️🌈🎨
Or traditional ASCII: @#$%&*()_+-=[]{}|;:'"<>,.?/

Description: [Brief description of what you created]

Be creative and make it beautiful! The more detailed, the better!`;

        const messages = [{ role: "user", content: enhancedPrompt }];
        
        const requestBody = {
            model: "llama-3.3-70b-versatile",
            messages: messages,
            temperature: 1.0,
            max_tokens: 8192,
            top_p: 0.95
        };

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Failed to generate text art');
        }

        const data = await response.json();
        const textArt = data.choices?.[0]?.message?.content;

        hideLoading();
        isGeneratingImage = false;
        
        if (textArt) {
            console.log("✅ Text art generated successfully!");
            return textArt;
        } else {
            throw new Error('Empty response from AI');
        }

    } catch (error) {
        console.error('❌ Text art generation error:', error);
        hideLoading();
        isGeneratingImage = false;
        
        const errorMsg = currentLanguage === 'si'
            ? 'මට කණගාටුයි, text art එක සෑදීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.'
            : 'Sorry, I could not generate the text art. Please try again.';
        
        showNotification(errorMsg, 'error');
        return null;
    }
}

async function handleTextArtFlow(userMessage) {
    const session = getCurrentSession();
    if (!session) {
        createNewChat();
        return;
    }

    const input = document.getElementById('messageInput');
    if (input) input.value = '';

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

    const typing = document.getElementById('typingIndicator');
    if (typing) typing.style.display = 'flex';

    let artPrompt = userMessage;
    const commandPatterns = [
        /^(create|generate|draw|make)\s+(a\s+)?text\s+(art|image|picture)\s+(of\s+)?/i,
        /^(create|generate|draw|make)\s+.*using\s+(text|ascii|characters)\s*:?\s*/i,
        /^ascii\s+art\s+(of\s+)?/i,
        /^අකුරු\s*පින්තූර\s*/i,
    ];
    
    for (const pattern of commandPatterns) {
        artPrompt = artPrompt.replace(pattern, '').trim();
    }

    const textArt = await generateTextArt(artPrompt);

    if (typing) typing.style.display = 'none';

    if (textArt) {
        const headerNote = currentLanguage === 'si'
            ? `## 🎨 Text Art - අකුරු පින්තූරය\n\n`
            : `## 🎨 Text Art Generated\n\n`;
        
        const fullResponse = headerNote + '```\n' + textArt + '\n```';
        
        displayTextArtMessage(textArt, artPrompt);
        
        session.messages.push({
            content: fullResponse,
            isUser: false,
            isTextArt: true,
            originalPrompt: artPrompt,
            timestamp: Date.now()
        });

        session.updatedAt = Date.now();
        saveChatSessions();
        
        showNotification(currentLanguage === 'si' ? 'Text art එක සාදන ලදී!' : 'Text art created!', 'success');
    } else {
        const errorMsg = currentLanguage === 'si' ? 'මට කණගාටුයි, text art එක සෑදීමට නොහැකි විය.' : 'Sorry, I could not generate the text art.';
        displayMessage(errorMsg, false);
        session.messages.push({ content: errorMsg, isUser: false, timestamp: Date.now() });
        saveChatSessions();
    }
}

console.log("✅ Part 5 loaded - Groq AI Functions");

// ============================================
// PART 6 - TEXT ART DISPLAY
// ============================================

function displayTextArtMessage(textArt, prompt) {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    const welcome = messagesDiv.querySelector('.welcome-screen');
    if (welcome) welcome.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message text-art-message';
    
    const copyBtnText = currentLanguage === 'si' ? 'පිටපත් කරන්න' : 'Copy Art';
    const downloadBtnText = currentLanguage === 'si' ? 'බාගන්න' : 'Download';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <span>Smart AI</span>
        </div>
        <div class="message-content">
            <div class="text-art-container">
                <div class="text-art-title">
                    🎨 ${currentLanguage === 'si' ? 'අකුරු පින්තූරය' : 'Text Art'}: ${escapeHtml(prompt)}
                </div>
                <pre class="text-art-display">${escapeHtml(textArt)}</pre>
            </div>
        </div>
        <div class="message-actions">
            <button class="action-btn copy-btn" onclick="copyTextArt(this, \`${textArt.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">
                <i class="fas fa-copy"></i> ${copyBtnText}
            </button>
            <button class="action-btn download-btn" onclick="downloadTextArt(\`${textArt.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, '${escapeHtml(prompt)}')">
                <i class="fas fa-download"></i> ${downloadBtnText}
            </button>
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function copyTextArt(button, textArt) {
    navigator.clipboard.writeText(textArt).then(() => {
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

function downloadTextArt(textArt, prompt) {
    try {
        const filename = `text-art-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
        const blob = new Blob([textArt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(currentLanguage === 'si' ? 'බාගත විය!' : 'Downloaded!', 'success');
    } catch (error) {
        console.error('Download failed:', error);
        showNotification('Download failed', 'error');
    }
}

console.log("✅ Part 6 loaded - Text Art Display");

// ============================================
// PART 7 - STORAGE FUNCTIONS
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
        console.log("⚡ Instantly saved to localStorage");
        
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
                console.log("📥 No localStorage, loading from Firebase...");
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

console.log("✅ Part 7 loaded - Storage Functions");

// ============================================
// PART 8 - MESSAGE DISPLAY
// ============================================

function formatAIResponse(text) {
    if (!text) return '';
    
    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        return `<pre><code class="code-block">${code.trim()}</code></pre>`;
    });
    text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    text = text.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    text = text.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    text = text.replace(/^### (.*$)/gm, '<h3 class="md-h3">$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2 class="md-h2">$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1 class="md-h1">$1</h1>');
    text = text.replace(/^\* (.*$)/gm, '<li class="md-li">$1</li>');
    text = text.replace(/^- (.*$)/gm, '<li class="md-li">$1</li>');
    text = text.replace(/^\d+\. (.*$)/gm, '<li class="md-li-ordered">$1</li>');
    text = text.replace(/(<li class="md-li">.*<\/li>\n?)+/g, '<ul class="md-ul">$&</ul>');
    text = text.replace(/(<li class="md-li-ordered">.*<\/li>\n?)+/g, '<ol class="md-ol">$&</ol>');
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" class="md-link">$1</a>');
    text = text.replace(/^&gt; (.*$)/gm, '<blockquote class="md-blockquote">$1</blockquote>');
    text = text.replace(/^---$/gm, '<hr class="md-hr">');
    text = text.replace(/^\*\*\*$/gm, '<hr class="md-hr">');
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

function displayMessage(content, isUser) {
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
    
    messageDiv.innerHTML = `
        <div class="message-header">
            ${avatarIcon}
            <span>${messageLabel}</span>
        </div>
        <div class="message-content">
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
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
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

console.log("✅ Part 8 loaded - Message Display");



// ============================================
// PART 9 - SEND MESSAGE FUNCTION
// ============================================

async function sendMessage() {
    if (isProcessing || isGeneratingImage) return;
    
    const input = document.getElementById('messageInput');
    const message = input ? input.value.trim() : '';
    
    if (!message) {
        showNotification('Please enter a message', 'error');
        return;
    }
    
    // Check for text art request
    if (isTextArtRequest(message)) {
        await handleTextArtFlow(message);
        return;
    }
    
    const session = getCurrentSession();
    if (!session) {
        createNewChat();
        return;
    }
    
    displayMessage(message, true);
    
    session.messages.push({
        content: message,
        isUser: true,
        timestamp: Date.now()
    });
    
    if (session.messages.filter(m => m.isUser).length === 1) {
        const titleText = message.replace(/<[^>]*>/g, '').substring(0, 30);
        session.title = titleText + (titleText.length >= 30 ? '...' : '');
    }
    
    session.updatedAt = Date.now();
    saveChatSessions();
    renderSessions();
    
    if (input) input.value = '';
    
    const sendBtn = document.getElementById('sendButton');
    const typing = document.getElementById('typingIndicator');
    
    isProcessing = true;
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.classList.add('processing');
    }
    if (typing) typing.style.display = 'flex';
    
    try {
        const historyForAI = session.messages.slice(-11, -1);
        const response = await getGroqAIResponse(message, historyForAI);
        
        if (typing) typing.style.display = 'none';
        
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

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (!isProcessing && !isGeneratingImage) {
            sendMessage();
        }
    }
}

function updateSendButtonState() {
    const sendBtn = document.getElementById('sendButton');
    const input = document.getElementById('messageInput');
    
    if (!sendBtn) return;
    
    const hasMessage = input && input.value.trim().length > 0;
    const shouldEnable = !isProcessing && !isGeneratingImage && hasMessage;
    
    sendBtn.disabled = !shouldEnable;
    
    if (!shouldEnable) {
        sendBtn.style.opacity = '0.5';
        sendBtn.style.cursor = 'not-allowed';
    } else {
        sendBtn.style.opacity = '1';
        sendBtn.style.cursor = 'pointer';
    }
}

function handleInputChange() {
    updateSendButtonState();
}

console.log("✅ Part 9 loaded - Send Message Function");

// ============================================
// PART 10 - SESSION MANAGEMENT & INIT
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
        if (msg.isTextArt) {
            const match = msg.content.match(/```\n([\s\S]*?)\n```/);
            if (match && match[1]) {
                displayTextArtMessage(match[1], msg.originalPrompt || 'Text Art');
            } else {
                displayMessage(msg.content, msg.isUser);
            }
        } else {
            displayMessage(msg.content, msg.isUser);
        }
    });
}

// INITIALIZE APP
window.addEventListener('load', function() {
    console.log("🎯 Page loaded - initializing app with splash screen");
    checkForUpdates();
    initializeFirebase();
    
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    
    console.log("✅ Smart AI App initialized - VERSION 1.1.0");
    console.log("⚡ Features: Groq API + Splash Screen + Text Art!");
    console.log("💡 Try: 'create text art of a cat' or 'What is AI?'");
});

console.log("✅ Part 10 loaded - Session Management & Init");
console.log("🎉 ALL PARTS COMPLETE! Copy all 10 parts into one JS file.");
