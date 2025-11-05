// Firebase configuration - UPDATED WITH WORKING CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
    authDomain: "smart-ai-chat-app.firebaseapp.com",
    projectId: "smart-ai-chat-app",
    storageBucket: "smart-ai-chat-app.appspot.com",
    messagingSenderId: "195723763663",
    appId: "1:195723763663:web:0892e6392eb77c15813cba"
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
        rememberPassword: "Remember your password?",
        logoTitle: "Smart AI",
        headerSubtitle: "Powered by Gemini AI",
        username: "User",
        userStatus: "Online",
        logoutText: "Logout",
        welcomeTitle: "නව Model සාර්ථකව යාවත්කාලීන කරන ලදී! ✨",
        welcomeText: "Gemini AI Model සමඟ වැඩ කිරීමට සූදානම්!<br>ඔබගේ ප්‍රශ්නය පහතින් ටයිප් කර Enter කරන්න. 🚀",
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
        importChatText: "Import",
        systemPrompt: `ඔබ Smart AI නම් උපකාරක AI වේ. සියලුම ප්‍රශ්නවලට සිංහල භාෂාවෙන් පිළිතුරු දෙන්න. 
        පිළිතුරු සවිස්තරාත්මක, උපයෝගී සහ මිත්‍රශීලී විය යුතුය. 
        කේතය, තාක්ෂණය, විද්‍යාව, ඉතිහාසය සහ සාමාන්‍ය දැනුම පිළිබඳ ප්‍රශ්න සඳහා විස්තරාත්මක පිළිතුරු දෙන්න.`
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
        rememberPassword: "Remember your password?",
        logoTitle: "Smart AI",
        headerSubtitle: "Powered by Gemini AI",
        username: "User",
        userStatus: "Online",
        logoutText: "Logout",
        welcomeTitle: "New Model Successfully Updated! ✨",
        welcomeText: "Ready to work with Gemini AI Model!<br>Type your question below and press Enter 🚀",
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
        importChatText: "Import",
        systemPrompt: `You are Smart AI, a helpful AI assistant. Respond to all questions in English.
        Responses should be detailed, helpful and friendly.
        Provide detailed answers for questions about code, technology, science, history and general knowledge.`
    }
};

// Current state
let currentLanguage = 'sinhala';
let currentTheme = 'dark';
let chatHistory = [];
let chatSessions = [];
let currentSessionId = null;

// Gemini API Key - FIXED API KEY
const GOOGLE_AI_API_KEY = 'AIzaSyAJhruzaSUiKhP8GP7ZLg2h25GBTSKq1gs';

// DOM Elements
const authContainer = document.getElementById('authContainer');
const chatApp = document.getElementById('chatApp');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const forgotPassword = document.getElementById('forgotPassword');
const backToLogin = document.getElementById('backToLogin');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const signupSuccess = document.getElementById('signupSuccess');
const forgotError = document.getElementById('forgotError');
const forgotSuccess = document.getElementById('forgotSuccess');
const logoutBtn = document.getElementById('logoutBtn');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');
const sinhalaBtn = document.getElementById('sinhalaBtn');
const englishBtn = document.getElementById('englishBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const exportChatBtn = document.getElementById('exportChatBtn');
const suggestionsBtn = document.getElementById('suggestionsBtn');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// New Chat History Elements
const chatSidebar = document.getElementById('chatSidebar');
const historyToggle = document.getElementById('historyToggle');
const sidebarClose = document.getElementById('sidebarClose');
const chatSessionsContainer = document.getElementById('chatSessions');
const historySearch = document.getElementById('historySearch');
const newChatBtn = document.getElementById('newChatBtn');
const importChatBtn = document.getElementById('importChatBtn');
const saveSessionBtn = document.getElementById('saveSessionBtn');
const renameSessionBtn = document.getElementById('renameSessionBtn');
const currentSessionTitle = document.getElementById('currentSessionTitle');
const sessionDate = document.getElementById('sessionDate');

// User-specific data handling functions
function getUserId() {
    const user = auth.currentUser;
    if (!user) return 'anonymous';
    return user.uid;
}

function getStorageKey() {
    return `neura-user-${getUserId()}-sessions`;
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function createNewSession() {
    const sessionId = generateSessionId();
    const session = {
        id: sessionId,
        title: currentLanguage === 'sinhala' ? 'නව සංවාදය' : 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: getUserId()
    };
    
    chatSessions.unshift(session);
    currentSessionId = sessionId;
    chatHistory = [];
    
    saveChatSessions();
    renderChatSessions();
    clearChatMessages();
    updateSessionDisplay();
    
    showNotification(
        currentLanguage === 'sinhala' ? 'නව සංවාදය ආරම්භ කරන ලදී' : 'New chat started',
        'success'
    );
}

function loadChatSessions() {
    const storageKey = getStorageKey();
    const savedSessions = localStorage.getItem(storageKey);
    
    if (savedSessions) {
        try {
            chatSessions = JSON.parse(savedSessions);
        } catch (e) {
            console.error("Error parsing sessions:", e);
            chatSessions = [];
        }
    } else {
        chatSessions = [];
    }
    
    if (chatSessions.length === 0) {
        createNewSession();
    } else {
        currentSessionId = chatSessions[0].id;
        chatHistory = chatSessions[0].messages || [];
        renderChatHistory();
    }
    
    renderChatSessions();
    updateSessionDisplay();
}

function saveChatSessions() {
    const storageKey = getStorageKey();
    try {
        localStorage.setItem(storageKey, JSON.stringify(chatSessions));
    } catch (e) {
        console.error("Error saving sessions:", e);
    }
}

function renderChatSessions() {
    if (!chatSessionsContainer) return;
    
    chatSessionsContainer.innerHTML = '';
    
    const searchTerm = historySearch.value.toLowerCase();
    const filteredSessions = chatSessions.filter(session => 
        session.title.toLowerCase().includes(searchTerm) ||
        session.messages.some(msg => msg.content.toLowerCase().includes(searchTerm))
    );
    
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
            <div class="session-preview">${lastMessage.substring(0, 50)}${lastMessage.length > 50 ? '...' : ''}</div>
            <div class="session-meta">
                <span>${new Date(session.updatedAt).toLocaleDateString()}</span>
                <span>${session.messages.length} ${currentLanguage === 'sinhala' ? 'පණිවිඩ' : 'messages'}</span>
            </div>
        `;
        
        sessionElement.addEventListener('click', () => {
            switchToSession(session.id);
        });
        
        chatSessionsContainer.appendChild(sessionElement);
    });
}

function switchToSession(sessionId) {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
        currentSessionId = sessionId;
        chatHistory = session.messages || [];
        renderChatHistory();
        renderChatSessions();
        updateSessionDisplay();
        
        if (window.innerWidth <= 768) {
            chatSidebar.classList.remove('active');
        }
    }
}

function updateSessionDisplay() {
    const currentSession = chatSessions.find(s => s.id === currentSessionId);
    if (currentSession) {
        currentSessionTitle.textContent = currentSession.title;
        sessionDate.textContent = new Date(currentSession.updatedAt).toLocaleDateString();
    }
}

function saveCurrentSession() {
    const currentSession = chatSessions.find(s => s.id === currentSessionId);
    if (currentSession) {
        currentSession.messages = chatHistory;
        currentSession.updatedAt = new Date().toISOString();
        saveChatSessions();
        renderChatSessions();
        
        showNotification(
            currentLanguage === 'sinhala' ? 'සංවාදය සුරකින ලදී' : 'Chat saved successfully',
            'success'
        );
    }
}

function renameCurrentSession() {
    const currentSession = chatSessions.find(s => s.id === currentSessionId);
    if (currentSession) {
        const newTitle = prompt(
            currentLanguage === 'sinhala' ? 'සංවාදයේ නම ඇතුලත් කරන්න:' : 'Enter chat title:',
            currentSession.title
        );
        
        if (newTitle && newTitle.trim() !== '') {
            currentSession.title = newTitle.trim();
            currentSession.updatedAt = new Date().toISOString();
            saveChatSessions();
            renderChatSessions();
            updateSessionDisplay();
            
            showNotification(
                currentLanguage === 'sinhala' ? 'සංවාදයේ නම වෙනස් කරන ලදී' : 'Chat renamed successfully',
                'success'
            );
        }
    }
}

// Check authentication state - FIXED AUTH LISTENER
auth.onAuthStateChanged((user) => {
    console.log("Auth state changed:", user);
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

// Update user profile
function updateUserProfile(user) {
    const usernameElement = document.getElementById('username');
    if (user.displayName) {
        usernameElement.textContent = user.displayName;
    } else if (user.email) {
        usernameElement.textContent = user.email.split('@')[0];
    } else {
        usernameElement.textContent = languageContent[currentLanguage].username;
    }
}

// Show auth container
function showAuthContainer() {
    if (authContainer) authContainer.style.display = 'block';
    if (chatApp) chatApp.style.display = 'none';
    showLoginForm();
}

// Show chat app
function showChatApp() {
    if (authContainer) authContainer.style.display = 'none';
    if (chatApp) chatApp.style.display = 'flex';
    if (messageInput) messageInput.focus();
}

// Show login form
function showLoginForm() {
    if (loginForm) loginForm.style.display = 'flex';
    if (signupForm) signupForm.style.display = 'none';
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
    if (loginError) loginError.style.display = 'none';
    if (signupError) signupError.style.display = 'none';
    if (signupSuccess) signupSuccess.style.display = 'none';
    if (forgotError) forgotError.style.display = 'none';
    if (forgotSuccess) forgotSuccess.style.display = 'none';
}

// Show signup form
function showSignupForm() {
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'flex';
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
    if (loginError) loginError.style.display = 'none';
    if (signupError) signupError.style.display = 'none';
    if (signupSuccess) signupSuccess.style.display = 'none';
    if (forgotError) forgotError.style.display = 'none';
    if (forgotSuccess) forgotSuccess.style.display = 'none';
}

// Show forgot password form
function showForgotPasswordForm() {
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'none';
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'flex';
    if (loginError) loginError.style.display = 'none';
    if (signupError) signupError.style.display = 'none';
    if (signupSuccess) signupSuccess.style.display = 'none';
    if (forgotError) forgotError.style.display = 'none';
    if (forgotSuccess) forgotSuccess.style.display = 'none';
}

// Show notification
function showNotification(message, type = 'success') {
    if (!notification || !notificationText) return;
    
    notification.className = 'notification';
    notification.classList.add(type);
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Login form - FIXED AUTH
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (loginError) loginError.style.display = 'none';
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            loginForm.reset();
            showNotification(
                currentLanguage === 'sinhala' ? 'සාර්ථකව පිවිසියා!' : 'Successfully logged in!',
                'success'
            );
        })
        .catch((error) => {
            console.error("Login error:", error);
            if (loginError) {
                loginError.textContent = currentLanguage === 'sinhala' 
                    ? 'පිවිසුම අසාර්ථකයි. කරුණාකර ඔබගේ තොරතුරු පරීක්ෂා කරන්න.' 
                    : 'Login failed. Please check your credentials.';
                loginError.style.display = 'block';
            }
        });
});

// Signup form - FIXED AUTH
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (signupError) signupError.style.display = 'none';
    if (signupSuccess) signupSuccess.style.display = 'none';
    
    if (password !== confirmPassword) {
        if (signupError) {
            signupError.textContent = currentLanguage === 'sinhala' 
                ? 'මුරපද ගැලපෙන්නේ නැත' 
                : 'Passwords do not match';
            signupError.style.display = 'block';
        }
        return;
    }
    
    if (password.length < 6) {
        if (signupError) {
            signupError.textContent = currentLanguage === 'sinhala' 
                ? 'මුරපදය අවම වශයෙන් අකුරු 6ක් විය යුතුය' 
                : 'Password must be at least 6 characters';
            signupError.style.display = 'block';
        }
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return userCredential.user.updateProfile({
                displayName: name
            });
        })
        .then(() => {
            if (signupSuccess) {
                signupSuccess.textContent = currentLanguage === 'sinhala' 
                    ? 'ලියාපදිංචිය සාර්ථකයි!' 
                    : 'Registration successful!';
                signupSuccess.style.display = 'block';
            }
            signupForm.reset();
            showNotification(
                currentLanguage === 'sinhala' ? 'ලියාපදිංචිය සාර්ථකයි!' : 'Registration successful!',
                'success'
            );
        })
        .catch((error) => {
            console.error("Signup error:", error);
            if (signupError) {
                signupError.textContent = currentLanguage === 'sinhala' 
                    ? 'ලියාපදිංචිය අසාර්ථකයි. කරුණාකර නැවත උත්සාහ කරන්න.' 
                    : 'Registration failed. Please try again.';
                signupError.style.display = 'block';
            }
        });
});

// Forgot password form - FIXED AUTH
forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    
    if (forgotError) forgotError.style.display = 'none';
    if (forgotSuccess) forgotSuccess.style.display = 'none';
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            if (forgotSuccess) {
                forgotSuccess.textContent = currentLanguage === 'sinhala' 
                    ? 'මුරපද යළි සැකසුම් ඊමේල් එකක් යවන ලදී! ඔබගේ ඊමේල් පරීක්ෂා කරන්න.' 
                    : 'Password reset email sent! Check your inbox.';
                forgotSuccess.style.display = 'block';
            }
            forgotPasswordForm.reset();
        })
        .catch((error) => {
            console.error("Password reset error:", error);
            if (forgotError) {
                forgotError.textContent = currentLanguage === 'sinhala' 
                    ? 'යළි සැකසුම් ඊමේල් යැවීම අසාර්ථකයි. කරුණාකර ඔබගේ ඊමේල් ලිපිනය පරීක්ෂා කරන්න.' 
                    : 'Failed to send reset email. Please check your email address.';
                forgotError.style.display = 'block';
            }
        });
});

// Form switching
if (showSignup) showSignup.addEventListener('click', showSignupForm);
if (showLogin) showLogin.addEventListener('click', showLoginForm);
if (forgotPassword) forgotPassword.addEventListener('click', showForgotPasswordForm);
if (backToLogin) backToLogin.addEventListener('click', showLoginForm);

// Logout button
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            showNotification(
                currentLanguage === 'sinhala' ? 'සාර්ථකව පිටවිය!' : 'Successfully logged out!',
                'success'
            );
        }).catch((error) => {
            console.error("Logout error:", error);
        });
    });
}

// Theme switching
function switchTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('neura-theme', theme);
    
    const content = languageContent[currentLanguage];
    if (themeLabel) {
        themeLabel.textContent = theme === 'dark' ? content.themeLabelDark : content.themeLabelLight;
    }
}

// Language switching
function switchLanguage(lang) {
    currentLanguage = lang;
    const content = languageContent[lang];
    
    // Update all text content
    const elements = {
        'authTitle': content.authTitle,
        'authSubtitle': content.authSubtitle,
        'emailLabel': content.emailLabel,
        'passwordLabel': content.passwordLabel,
        'nameLabel': content.nameLabel,
        'signupEmailLabel': content.emailLabel,
        'signupPasswordLabel': content.passwordLabel,
        'confirmPasswordLabel': content.confirmPasswordLabel,
        'loginButton': content.loginButton,
        'signupButton': content.signupButton,
        'noAccount': content.noAccount,
        'haveAccount': content.haveAccount,
        'showSignup': content.showSignup,
        'showLogin': content.showLogin,
        'forgotPassword': content.forgotPassword,
        'resetPasswordButton': content.resetPasswordButton,
        'backToLogin': content.backToLogin,
        'logoTitle': content.logoTitle,
        'headerSubtitle': content.headerSubtitle,
        'username': content.username,
        'userStatus': content.userStatus,
        'logoutText': content.logoutText,
        'welcomeTitle': content.welcomeTitle,
        'welcomeText': content.welcomeText,
        'typingText': content.typingText,
        'clearChatText': content.clearChatText,
        'exportChatText': content.exportChatText,
        'suggestionsText': content.suggestionsText,
        'copyrightText': content.copyright,
        'designCredit': content.designCredit,
        'footerCopyright': content.copyright,
        'footerDesign': content.designCredit,
        'historyTitle': content.historyTitle,
        'historyToggleText': content.historyToggleText,
        'currentSessionTitle': content.currentSessionTitle
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'welcomeText') {
                element.innerHTML = elements[id];
            } else {
                element.textContent = elements[id];
            }
        }
    });
    
    // Update input placeholder
    if (messageInput) {
        messageInput.placeholder = content.inputPlaceholder;
    }
    
    // Update new chat and import buttons
    if (newChatBtn) {
        newChatBtn.innerHTML = `<i class="fas fa-plus"></i><span>${content.newChatText}</span>`;
    }
    if (importChatBtn) {
        importChatBtn.innerHTML = `<i class="fas fa-upload"></i><span>${content.importChatText}</span>`;
    }
    
    // Update theme label
    if (themeLabel) {
        themeLabel.textContent = currentTheme === 'dark' ? content.themeLabelDark : content.themeLabelLight;
    }
    
    // Update language buttons
    if (sinhalaBtn && englishBtn) {
        if (lang === 'sinhala') {
            sinhalaBtn.classList.add('active');
            englishBtn.classList.remove('active');
        } else {
            englishBtn.classList.add('active');
            sinhalaBtn.classList.remove('active');
        }
    }
    
    localStorage.setItem('neura-language', lang);
}

// Load saved preferences
const savedTheme = localStorage.getItem('neura-theme') || 'dark';
const savedLanguage = localStorage.getItem('neura-language') || 'sinhala';

switchTheme(savedTheme);
switchLanguage(savedLanguage);

if (themeToggle && savedTheme === 'light') {
    themeToggle.checked = true;
}

// Event listeners
if (themeToggle) {
    themeToggle.addEventListener('change', function() {
        switchTheme(this.checked ? 'light' : 'dark');
    });
}

if (sinhalaBtn) sinhalaBtn.addEventListener('click', () => switchLanguage('sinhala'));
if (englishBtn) englishBtn.addEventListener('click', () => switchLanguage('english'));

// Chat History Event Listeners
if (historyToggle) {
    historyToggle.addEventListener('click', () => {
        chatSidebar.classList.toggle('active');
    });
}

if (sidebarClose) {
    sidebarClose.addEventListener('click', () => {
        chatSidebar.classList.remove('active');
    });
}

if (newChatBtn) {
    newChatBtn.addEventListener('click', createNewSession);
}

if (importChatBtn) {
    importChatBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.txt';
        
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (Array.isArray(importedData.messages)) {
                        const sessionId = generateSessionId();
                        const session = {
                            id: sessionId,
                            title: importedData.title || (currentLanguage === 'sinhala' ? 'ආයාත කළ සංවාදය' : 'Imported Chat'),
                            messages: importedData.messages,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            userId: getUserId()
                        };
                        
                        chatSessions.unshift(session);
                        saveChatSessions();
                        renderChatSessions();
                        
                        showNotification(
                            currentLanguage === 'sinhala' ? 'සංවාදය ආයාත කරන ලදී' : 'Chat imported successfully',
                            'success'
                        );
                    }
                } catch (error) {
                    showNotification(
                        currentLanguage === 'sinhala' ? 'ආයාත කිරීම අසාර්ථකයි' : 'Import failed',
                        'error'
                    );
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    });
}

if (saveSessionBtn) saveSessionBtn.addEventListener('click', saveCurrentSession);
if (renameSessionBtn) renameSessionBtn.addEventListener('click', renameCurrentSession);

if (historySearch) historySearch.addEventListener('input', renderChatSessions);

// Chat functionality
if (messageInput) {
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

function addMessage(message, isUser) {
    const welcomeMsg = chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    const content = languageContent[currentLanguage];
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
    
    const messageHeader = document.createElement('div');
    messageHeader.classList.add('message-header');
    messageHeader.innerHTML = isUser ? 
        `<div class="message-avatar"><i class="fas fa-user"></i></div> ${content.userLabel}` : 
        `<div class="message-avatar"><i class="fas fa-robot"></i></div> ${content.aiLabel}`;
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = message.replace(/\n/g, '<br>');
    
    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    messageTime.textContent = new Date().toLocaleTimeString();
    
    // Add message actions for AI messages
    if (!isUser) {
        const messageActions = document.createElement('div');
        messageActions.classList.add('message-actions');
        
        const copyBtn = document.createElement('button');
        copyBtn.classList.add('message-action-btn');
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> ' + (currentLanguage === 'sinhala' ? 'පිටපත් කරන්න' : 'Copy');
        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(message).then(() => {
                showNotification(
                    currentLanguage === 'sinhala' ? 'පිළිතුරු පිටපත් කරන ලදී' : 'Response copied to clipboard',
                    'success'
                );
            });
        });
        
        messageActions.appendChild(copyBtn);
        messageDiv.appendChild(messageActions);
    }
    
    messageDiv.appendChild(messageHeader);
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    
    chatMessages.appendChild(messageDiv);
    
    // Add to chat history and current session
    const messageObj = {
        content: message,
        isUser: isUser,
        timestamp: new Date().toISOString()
    };
    
    chatHistory.push(messageObj);
    
    // Update current session
    const currentSession = chatSessions.find(s => s.id === currentSessionId);
    if (currentSession) {
        currentSession.messages = chatHistory;
        currentSession.updatedAt = new Date().toISOString();
        
        // Update session title based on first user message
        if (isUser && currentSession.messages.filter(m => m.isUser).length === 1) {
            currentSession.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
        }
        
        saveChatSessions();
        renderChatSessions();
    }
    
    // Scroll to bottom
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function renderChatHistory() {
    if (!chatMessages) return;
    
    chatMessages.innerHTML = '';
    
    if (chatHistory.length === 0) {
        const welcomeMsg = document.createElement('div');
        welcomeMsg.classList.add('welcome-message');
        welcomeMsg.innerHTML = `
            <div class="welcome-icon">
                <i class="fas fa-rocket"></i>
            </div>
            <h2 id="welcome-title">${languageContent[currentLanguage].welcomeTitle}</h2>
            <p id="welcome-text">${languageContent[currentLanguage].welcomeText}</p>
            <div class="feature-buttons">
                <button class="feature-btn" id="clearChatBtn">
                    <i class="fas fa-trash"></i>
                    <span id="clear-chat-text">${languageContent[currentLanguage].clearChatText}</span>
                </button>
                <button class="feature-btn" id="exportChatBtn">
                    <i class="fas fa-download"></i>
                    <span id="export-chat-text">${languageContent[currentLanguage].exportChatText}</span>
                </button>
                <button class="feature-btn" id="suggestionsBtn">
                    <i class="fas fa-lightbulb"></i>
                    <span id="suggestions-text">${languageContent[currentLanguage].suggestionsText}</span>
                </button>
            </div>
        `;
        chatMessages.appendChild(welcomeMsg);
    } else {
        chatHistory.forEach(msg => {
            addMessage(msg.content, msg.isUser);
        });
    }
}

function clearChatMessages() {
    if (!chatMessages) return;
    
    chatMessages.innerHTML = '';
    const welcomeMsg = document.createElement('div');
    welcomeMsg.classList.add('welcome-message');
    welcomeMsg.innerHTML = `
        <div class="welcome-icon">
            <i class="fas fa-rocket"></i>
        </div>
        <h2 id="welcome-title">${languageContent[currentLanguage].welcomeTitle}</h2>
        <p id="welcome-text">${languageContent[currentLanguage].welcomeText}</p>
        <div class="feature-buttons">
            <button class="feature-btn" id="clearChatBtn">
                <i class="fas fa-trash"></i>
                <span id="clear-chat-text">${languageContent[currentLanguage].clearChatText}</span>
            </button>
            <button class="feature-btn" id="exportChatBtn">
                <i class="fas fa-download"></i>
                <span id="export-chat-text">${languageContent[currentLanguage].exportChatText}</span>
            </button>
            <button class="feature-btn" id="suggestionsBtn">
                <i class="fas fa-lightbulb"></i>
                <span id="suggestions-text">${languageContent[currentLanguage].suggestionsText}</span>
            </button>
        </div>
    `;
    chatMessages.appendChild(welcomeMsg);
}

// Gemini API Integration - FIXED API CALL
async function getAIResponse(userMessage) {
    try {
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`;
        
        const languagePrompt = currentLanguage === 'sinhala' ? 
            "කරුණාකර සිංහල භාෂාවෙන් පමණක් පිළිතුරු දෙන්න. පිළිතුර සරල හා පැහැදිලි විය යුතුය. මානව ආකාරයේ ස්වභාවික සංවාද භාෂාව භාවිතා කරන්න." : 
            "Please respond in English only. Keep the response clear, concise and use natural conversational language.";
        
        const prompt = `${userMessage}\n\n${languagePrompt}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format from Gemini API');
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        return currentLanguage === 'sinhala' ? 
            "කණගාටුයි, දෝෂයක් ඇති විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න." : 
            "Sorry, an error occurred. Please try again later.";
    }
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') return;
    
    addMessage(message, true);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    sendButton.disabled = true;
    typingIndicator.style.display = 'block';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        const response = await getAIResponse(message);
        typingIndicator.style.display = 'none';
        addMessage(response, false);
    } catch (error) {
        typingIndicator.style.display = 'none';
        const errorMessage = currentLanguage === 'sinhala' ? 
            "කණගාටුයි, දෝෂයක් ඇති විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න." : 
            "Sorry, an error occurred. Please try again later.";
        addMessage(errorMessage, false);
    } finally {
        sendButton.disabled = false;
        messageInput.focus();
    }
}

if (sendButton) sendButton.addEventListener('click', sendMessage);

if (messageInput) {
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Clear chat function
if (clearChatBtn) {
    clearChatBtn.addEventListener('click', function() {
        if (chatHistory.length > 0) {
            chatHistory = [];
            
            // Update current session
            const currentSession = chatSessions.find(s => s.id === currentSessionId);
            if (currentSession) {
                currentSession.messages = [];
                currentSession.updatedAt = new Date().toISOString();
                saveChatSessions();
                renderChatSessions();
            }
            
            clearChatMessages();
            
            showNotification(
                currentLanguage === 'sinhala' ? 'සංවාදය හිස් කරන ලදී' : 'Chat cleared successfully',
                'success'
            );
        }
    });
}

// Export chat function
if (exportChatBtn) {
    exportChatBtn.addEventListener('click', function() {
        if (chatHistory.length === 0) {
            showNotification(
                currentLanguage === 'sinhala' ? 'අප export කිරීමට සංවාදයක් නොමැත' : 'No chat history to export',
                'warning'
            );
            return;
        }
        
        const currentSession = chatSessions.find(s => s.id === currentSessionId);
        const exportData = {
            title: currentSession ? currentSession.title : 'Exported Chat',
            messages: chatHistory,
            exportedAt: new Date().toISOString(),
            language: currentLanguage
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smart-ai-chat-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(
            currentLanguage === 'sinhala' ? 'සංවාදය බාගත කරන ලදී' : 'Chat exported successfully',
            'success'
        );
    });
}

// Suggestions function
if (suggestionsBtn) {
    suggestionsBtn.addEventListener('click', function() {
        const suggestions = currentLanguage === 'sinhala' ? [
            "AI ගැන මට තව දැනගන්න ඕන",
            "කොහොමද කේතයක් ලියන්නේ?",
            "මට උදව් කරන්න වර්තමාන තාක්ෂණ ප්‍රවණතා ගැන",
            "මට ඉගෙන ගැනීමට හොඳම ක්‍රමය කුමක්ද?"
        ] : [
            "Tell me more about AI",
            "How do I write code?",
            "Help me with current technology trends",
            "What's the best way to learn?"
        ];
        
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        messageInput.value = randomSuggestion;
        messageInput.focus();
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
        
        showNotification(
            currentLanguage === 'sinhala' ? 'යෝජනාවක් ඇතුලත් කරන ලදී' : 'Suggestion added to input',
            'success'
        );
    });
}

// Enter key for form submission
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeForm = document.querySelector('.auth-form[style*="display: flex"]');
        if (activeForm) {
            const submitButton = activeForm.querySelector('.auth-button');
            if (submitButton) {
                submitButton.click();
            }
        }
    }
});

// Initialize chat input height
if (messageInput) {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768 && 
        chatSidebar && 
        !chatSidebar.contains(e.target) && 
        historyToggle &&
        !historyToggle.contains(e.target) &&
        chatSidebar.classList.contains('active')) {
        chatSidebar.classList.remove('active');
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log("Smart AI App Initialized");
    showAuthContainer();
});
