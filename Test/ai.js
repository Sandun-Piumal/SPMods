// ============================================
// SMART AI CHAT APP - PART 1/5
// Firebase Config & Core Variables
// ============================================

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
const APP_VERSION = '1.0.4';
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
        imageAnalyzed: "Image analyzed!",
        checkUpdates: "Check for Updates",
        updatesAvailable: "New version available!",
        latestVersion: "You have the latest version!",
        generateImage: "Generate Image",
        generatingImage: "Generating image...",
        imageGenerated: "Image generated!",
        downloadImage: "Download Image",
        imageDownloaded: "Image downloaded!",
        describeImage: "Describe the image you want",
        createImagePrompt: "Example: A sunset over mountains..."
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
        imageAnalyzed: "පින්තූරය විශ්ලේෂණය කරන ලදී!",
        checkUpdates: "යාවත්කාලීන පරීක්ෂා කරන්න",
        updatesAvailable: "නව අනුවාදයක් තිබේ!",
        latestVersion: "ඔබට නවතම අනුවාදය තිබේ!",
        generateImage: "පින්තූරය සාදන්න",
        generatingImage: "පින්තූරය සාදමින්...",
        imageGenerated: "පින්තූරය සාදන ලදී!",
        downloadImage: "පින්තූරය බාගන්න",
        imageDownloaded: "පින්තූරය බාගත විය!",
        describeImage: "ඔබට අවශ්‍ය පින්තූරය විස්තර කරන්න",
        createImagePrompt: "උදාහරණය: කඳු මත හිරු බැස යෑම..."
    }
};

// ============================================
// SMART AI CHAT APP - PART 2/5
// Helper Functions & Language Management
// ============================================

// VERSION CONTROL
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
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

function checkForAppUpdates() {
    const currentVersion = localStorage.getItem(VERSION_KEY);
    if (currentVersion !== APP_VERSION) {
        showNotification(getTranslation('updatesAvailable'), 'info');
        setTimeout(() => {
            localStorage.setItem(VERSION_KEY, APP_VERSION);
            window.location.reload();
        }, 2000);
    } else {
        showNotification(getTranslation('latestVersion'), 'success');
    }
}

// LANGUAGE FUNCTIONS
function getTranslation(key) {
    return translations[currentLanguage][key] || translations.en[key] || key;
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation) {
            element.textContent = translation;
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = getTranslation(key);
        if (translation) {
            element.placeholder = translation;
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        const translation = getTranslation(key);
        if (translation) {
            element.title = translation;
        }
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

// UI HELPER FUNCTIONS
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    if (!notification || !text) return;
    
    const icon = notification.querySelector('i');
    notification.className = `notification ${type}`;
    text.textContent = message;
    
    if (icon) {
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
        } else {
            icon.className = 'fas fa-exclamation-circle';
        }
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
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
    if (overlay) {
        overlay.classList.remove('show');
    }
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

function toggleSettings() {
    const settingsMenu = document.querySelector('.settings-menu');
    if (settingsMenu) {
        settingsMenu.classList.toggle('active');
    }
}

function addUpdateButton() {
    const settingsMenu = document.querySelector('.settings-menu');
    if (!settingsMenu) return;
    
    const updateBtn = document.createElement('button');
    updateBtn.className = 'action-btn';
    updateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> ' + getTranslation('checkUpdates');
    updateBtn.onclick = checkForAppUpdates;
    
    settingsMenu.appendChild(updateBtn);
}

// ============================================
// SMART AI CHAT APP - PART 3/5
// Firebase Initialization & Authentication
// ============================================

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
        } else {
            firebase.app();
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

// FIREBASE DATABASE FUNCTIONS
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
        await userRef.update({
            lastLogin: Date.now()
        });
        
        console.log("✅ User last login updated");
        
    } catch (error) {
        console.error("❌ Error updating user in database:", error);
    }
}

// AUTH HANDLERS
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
        const userCredential = await auth.signInWithEmailAndPassword(email.value, password.value);
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
        
        await user.updateProfile({ 
            displayName: name.value 
        });
        
        await saveUserToDatabase(user.uid, name.value, email.value);
        
        const successMsg = document.getElementById('signupSuccess');
        if (successMsg) {
            successMsg.textContent = 'Registration successful! Redirecting...';
            successMsg.style.display = 'block';
        }
        
        if (name) name.value = '';
        if (email) email.value = '';
        if (password) password.value = '';
        
        setTimeout(() => {
            showLogin();
        }, 2000);
        
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
// SMART AI CHAT APP - PART 4/5
// AI Functions & Image Generation - FIXED VERSION
// ============================================

// ============================================
// IMAGE GENERATION DETECTION - IMPROVED
// ============================================
function isImageGenerationRequest(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Remove common prefixes
    const cleaned = lowerMessage
        .replace(/^(can you|could you|please|i want to|i need to|help me)\s+/i, '')
        .trim();
    
    // English patterns - more specific
    const englishPatterns = [
        /^create\s+(an?\s+)?(image|picture|photo|illustration)/i,
        /^generate\s+(an?\s+)?(image|picture|photo|illustration)/i,
        /^draw\s+(me\s+)?(an?\s+)?(image|picture)/i,
        /^make\s+(me\s+)?(an?\s+)?(image|picture|photo)/i,
        /^design\s+(an?\s+)?(image|picture)/i,
        /^paint\s+(an?\s+)?(image|picture)/i,
        /^illustrate/i,
        /^sketch\s+(an?\s+)?(image|picture)/i,
        /image\s+of\s+.*\s+(for\s+me|please)$/i
    ];
    
    // Sinhala patterns
    const sinhalaPatterns = [
        /පින්තූරයක්\s+(හදන්න|සාදන්න|ඇඳන්න)/i,
        /පින්තූරය\s+(හදන්න|සාදන්න|ඇඳන්න)/i,
        /(හදන්න|සාදන්න)\s+පින්තූරයක්/i
    ];
    
    // Check patterns
    const matchesEnglish = englishPatterns.some(pattern => pattern.test(cleaned));
    const matchesSinhala = sinhalaPatterns.some(pattern => pattern.test(lowerMessage));
    
    return matchesEnglish || matchesSinhala;
}

// ============================================
// IMAGE GENERATION API CALL - FIXED
// ============================================
async function generateImageWithAI(prompt) {
    if (!prompt || !prompt.trim()) {
        showNotification('Please enter a description', 'error');
        return null;
    }

    try {
        console.log("🎨 Generating image for:", prompt);
        
        const loadingMsg = currentLanguage === 'si' 
            ? 'පින්තූරය සාදමින්... කරුණාකර රැඳී සිටින්න (මිනිත්තු 1-2ක් ගත විය හැක)' 
            : 'Generating image... Please wait (may take 1-2 minutes)';
        
        showLoading(loadingMsg);
        isGeneratingImage = true;

        // Enhanced prompt for better results
        const enhancedPrompt = `High quality, detailed image: ${prompt}`;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${GEMINI_API_KEY}`;
        
        const requestBody = {
            prompt: enhancedPrompt,
            number_of_images: 1,
            aspect_ratio: "1:1",
            safety_filter_level: "block_some",
            person_generation: "allow_adult"
        };

        console.log("📤 Sending image generation request...");

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("❌ Image API Error:", errorData);
            
            // Better error messages
            if (response.status === 400) {
                throw new Error('Invalid request - please try a different description');
            } else if (response.status === 403) {
                throw new Error('API access denied - please check API key');
            } else if (response.status === 429) {
                throw new Error('Too many requests - please wait a moment');
            }
            
            throw new Error(`Image generation failed: ${response.status}`);
        }

        const data = await response.json();
        console.log("📥 Received response from Image API");
        
        if (data.generatedImages && data.generatedImages.length > 0) {
            const imageData = data.generatedImages[0].image.imageBytes;
            const imageBase64 = `data:image/png;base64,${imageData}`;
            
            console.log("✅ Image generated successfully!");
            hideLoading();
            return imageBase64;
        } else {
            throw new Error('No image data in response');
        }

    } catch (error) {
        console.error('❌ Image generation error:', error);
        hideLoading();
        
        let errorMsg;
        if (currentLanguage === 'si') {
            errorMsg = 'පින්තූරය සෑදීමට අසමර්ථ විය. කරුණාකර විස්තරය වෙනස් කර නැවත උත්සාහ කරන්න.';
        } else {
            errorMsg = `Failed to generate image: ${error.message}. Please try with a different description.`;
        }
        
        showNotification(errorMsg, 'error');
        return null;
    } finally {
        isGeneratingImage = false;
    }
}

// ============================================
// IMAGE GENERATION FLOW - IMPROVED
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

    // Update session title
    if (session.messages.filter(m => m.isUser).length === 1) {
        const titleText = userMessage.replace(/<[^>]*>/g, '').substring(0, 30);
        session.title = titleText + (titleText.length >= 30 ? '...' : '');
    }

    session.updatedAt = Date.now();
    saveChatSessions();
    renderSessions();

    // Show typing indicator
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.style.display = 'flex';

    // Extract the actual image description
    let imagePrompt = userMessage;
    
    // Remove command words
    const commandPatterns = [
        /^(create|generate|draw|make|design|paint|sketch)\s+(an?\s+)?(image|picture|photo)\s+(of\s+)?/i,
        /^(හදන්න|සාදන්න|ඇඳන්න)\s+පින්තූරයක්\s+/i,
        /^පින්තූරයක්\s+(හදන්න|සාදන්න|ඇඳන්න)\s+/i
    ];
    
    for (const pattern of commandPatterns) {
        imagePrompt = imagePrompt.replace(pattern, '').trim();
    }

    console.log("🎨 Extracted prompt:", imagePrompt);

    // Generate image
    const generatedImage = await generateImageWithAI(imagePrompt);

    if (typing) typing.style.display = 'none';

    if (generatedImage) {
        displayGeneratedImageMessage(generatedImage, imagePrompt);
        
        const responseMsg = currentLanguage === 'si' 
            ? 'මෙන්න ඔබගේ පින්තූරය! ඔබට එය බාගත කළ හැක.' 
            : 'Here is your generated image! You can download it.';
        
        session.messages.push({
            content: responseMsg,
            isUser: false,
            imageData: generatedImage,
            isGeneratedImage: true,
            imagePrompt: imagePrompt,
            timestamp: Date.now()
        });

        session.updatedAt = Date.now();
        saveChatSessions();
        
        showNotification(getTranslation('imageGenerated'));
    } else {
        const errorMsg = currentLanguage === 'si' 
            ? 'මට කණගාටුයි, පින්තූරය සෑදීමට නොහැකි විය. කරුණාකර වෙනත් විස්තරයක් උත්සාහ කරන්න.'
            : 'Sorry, I could not generate the image. Please try a different description.';
        
        displayMessage(errorMsg, false);
        
        session.messages.push({
            content: errorMsg,
            isUser: false,
            timestamp: Date.now()
        });
        
        saveChatSessions();
    }
}

// ============================================
// DOWNLOAD GENERATED IMAGE
// ============================================
function downloadGeneratedImage(imageBase64, prompt) {
    try {
        const link = document.createElement('a');
        
        const sanitizedPrompt = prompt
            .substring(0, 30)
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();
        
        const timestamp = Date.now();
        const filename = `smartai_${sanitizedPrompt}_${timestamp}.png`;
        
        link.href = imageBase64;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification(getTranslation('imageDownloaded'), 'success');
        
        console.log("✅ Image downloaded:", filename);
        
    } catch (error) {
        console.error('❌ Download error:', error);
        showNotification(
            currentLanguage === 'si' ? 'බාගත කිරීමේ දෝෂයක්!' : 'Download failed!',
            'error'
        );
    }
}

// ============================================
// GEMINI AI TEXT RESPONSE
// ============================================
async function getAIResponse(userMessage, imageData = null, conversationHistory = []) {
    console.log("🤖 Getting AI response...", { userMessage, hasImage: !!imageData });
    
    try {
        let apiUrl, requestBody;

        if (imageData) {
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
            
            const parts = [];
            
            if (conversationHistory.length > 0) {
                const historyText = conversationHistory.map(msg => 
                    `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`
                ).join('\n');
                parts.push({ text: historyText + '\n\n' });
            }
            
            parts.push({ text: userMessage });
            parts.push({
                inline_data: {
                    mime_type: "image/jpeg",
                    data: imageData.split(',')[1]
                }
            });
            
            requestBody = {
                contents: [{ parts: parts }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            };
        } else {
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
            
            const contents = [];
            
            for (let i = 0; i < conversationHistory.length; i++) {
                const msg = conversationHistory[i];
                contents.push({
                    role: msg.isUser ? "user" : "model",
                    parts: [{ text: msg.content }]
                });
            }
            
            contents.push({
                role: "user",
                parts: [{ text: userMessage }]
            });
            
            requestBody = {
                contents: contents,
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            };
        }
        
        console.log("📤 Sending request to Gemini API...");
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("API Error:", errorData);
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📥 Received response from API");
        
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiResponse) {
            throw new Error('Empty response from AI');
        }
        
        console.log("✅ AI response successful");
        return aiResponse;
        
    } catch (error) {
        console.error('❌ AI Error:', error);
        
        if (currentLanguage === 'si') {
            return 'මට කණගාටුයි, දෝෂයක් ඇතිවිය. කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න.';
        } else {
            return 'I apologize, but I encountered an error. Please try again in a moment.';
        }
    }
}
