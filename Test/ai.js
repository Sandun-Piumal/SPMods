// ============================================
// SPLASH SCREEN MANAGER
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
    } else {
        console.log("⏳ Waiting...");
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

// ============================================
// FIREBASE CONFIG & VARIABLES
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
    authDomain: "smart-ai-chat-app.firebaseapp.com",
    projectId: "smart-ai-chat-app",
    databaseURL: "https://smart-ai-chat-app-default-rtdb.firebaseio.com"
};

const GEMINI_API_KEY = 'AIzaSyCsT-cCQ8eQDN7YNvTCGNTMJu-9dE-HjU8';
const APP_VERSION = '2.0.0';
const VERSION_KEY = 'smartai-version';

let auth = null;
let database = null;
let isProcessing = false;
let chatSessions = [];
let currentSessionId = null;
let currentImage = null;
let currentLanguage = 'en';
let isGeneratingImage = false;
let isImageLoading = false;
let currentMode = 'chat';

const translations = {
    en: {
        appTitle: "Smart AI Pro",
        chatMode: "Chat",
        codeMode: "Code",
        generate: "Generate",
        explain: "Explain",
        fix: "Fix Bugs",
        optimize: "Optimize",
        download: "Download",
        copied: "Copied!",
        loginSuccess: "Login successful!",
        logoutSuccess: "Logged out successfully!",
    },
    si: {
        appTitle: "Smart AI Pro",
        chatMode: "චැට්",
        codeMode: "කෝඩ්",
        generate: "සාදන්න",
        explain: "පැහැදිලි කරන්න",
        fix: "දෝෂ හරවන්න",
        optimize: "වැඩිදියුණු කරන්න",
        download: "බාගන්න",
        copied: "පිටපත් විය!",
        loginSuccess: "පිවිසුම සාර්ථකයි!",
        logoutSuccess: "සාර්ථකව ඉවත් විය!",
    }
};

console.log("✅ Smart AI Pro - Initialized");

// ============================================
// MODE SWITCHING - CHAT & CODE
// ============================================

function switchToMode(mode) {
    console.log("🔄 Switching to mode:", mode);
    currentMode = mode;
    
    const chatModeBtn = document.getElementById('chatModeBtn');
    const codeModeBtn = document.getElementById('codeModeBtn');
    const chatMessages = document.getElementById('chatMessages');
    const codePanel = document.getElementById('codePanel');
    const chatInput = document.querySelector('.chat-input-container');
    
    if (mode === 'chat') {
        if (chatModeBtn) {
            chatModeBtn.classList.add('active');
            codeModeBtn.classList.remove('active');
        }
        if (chatMessages) chatMessages.style.display = 'block';
        if (codePanel) codePanel.style.display = 'none';
        if (chatInput) chatInput.style.display = 'block';
    } else if (mode === 'code') {
        if (codeModeBtn) {
            codeModeBtn.classList.add('active');
            chatModeBtn.classList.remove('active');
        }
        if (chatMessages) chatMessages.style.display = 'none';
        if (codePanel) codePanel.style.display = 'flex';
        if (chatInput) chatInput.style.display = 'none';
    }
}

// ============================================
// CODE EDITOR FUNCTIONS
// ============================================

async function generateCode() {
    const editor = document.getElementById('codeEditor');
    const language = document.getElementById('languageSelect').value;
    const prompt = editor.value.trim();
    
    if (!prompt) {
        showNotification('Please describe what code you want to generate', 'error');
        return;
    }
    
    showLoading('Generating code...');
    
    try {
        const enhancedPrompt = `Generate clean, well-commented ${language} code for: ${prompt}
        
        Requirements:
        - Write production-ready code
        - Include comments
        - Follow best practices
        - Make it efficient and readable
        
        Output ONLY the code, no explanations.`;
        
        const response = await callGeminiAPI(enhancedPrompt);
        
        hideLoading();
        
        const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
        const code = codeMatch ? codeMatch[1] : response;
        
        editor.value = code.trim();
        
        showNotification('Code generated successfully!', 'success');
        highlightCode();
        
    } catch (error) {
        console.error('Generate code error:', error);
        hideLoading();
        showNotification('Failed to generate code', 'error');
    }
}

async function explainCode() {
    const editor = document.getElementById('codeEditor');
    const code = editor.value.trim();
    
    if (!code) {
        showNotification('Please write or paste some code first', 'error');
        return;
    }
    
    showLoading('Analyzing code...');
    
    try {
        const prompt = `Explain this code in detail:

\`\`\`
${code}
\`\`\`

Provide:
1. What the code does
2. How it works (step by step)
3. Key concepts used
4. Potential improvements`;
        
        const explanation = await callGeminiAPI(prompt);
        
        hideLoading();
        showCodeOutput(explanation);
        showNotification('Code explained!', 'success');
        
    } catch (error) {
        console.error('Explain code error:', error);
        hideLoading();
        showNotification('Failed to explain code', 'error');
    }
}

async function fixCode() {
    const editor = document.getElementById('codeEditor');
    const code = editor.value.trim();
    
    if (!code) {
        showNotification('Please write or paste some code first', 'error');
        return;
    }
    
    showLoading('Finding and fixing bugs...');
    
    try {
        const prompt = `Analyze this code for bugs and fix them:

\`\`\`
${code}
\`\`\`

Provide:
1. List of bugs found
2. Fixed code
3. Explanation of fixes

Output the fixed code in a code block.`;
        
        const response = await callGeminiAPI(prompt);
        
        hideLoading();
        
        const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
        if (codeMatch) {
            editor.value = codeMatch[1].trim();
            showCodeOutput(response);
        } else {
            showCodeOutput(response);
        }
        
        showNotification('Code analyzed and fixed!', 'success');
        highlightCode();
        
    } catch (error) {
        console.error('Fix code error:', error);
        hideLoading();
        showNotification('Failed to fix code', 'error');
    }
}

async function optimizeCode() {
    const editor = document.getElementById('codeEditor');
    const code = editor.value.trim();
    
    if (!code) {
        showNotification('Please write or paste some code first', 'error');
        return;
    }
    
    showLoading('Optimizing code...');
    
    try {
        const prompt = `Optimize this code for better performance and readability:

\`\`\`
${code}
\`\`\`

Provide:
1. Optimized code
2. What was improved
3. Performance benefits

Output the optimized code in a code block.`;
        
        const response = await callGeminiAPI(prompt);
        
        hideLoading();
        
        const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
        if (codeMatch) {
            editor.value = codeMatch[1].trim();
            showCodeOutput(response);
        } else {
            showCodeOutput(response);
        }
        
        showNotification('Code optimized!', 'success');
        highlightCode();
        
    } catch (error) {
        console.error('Optimize code error:', error);
        hideLoading();
        showNotification('Failed to optimize code', 'error');
    }
}

function downloadCode() {
    const editor = document.getElementById('codeEditor');
    const code = editor.value.trim();
    const language = document.getElementById('languageSelect').value;
    
    if (!code) {
        showNotification('No code to download', 'error');
        return;
    }
    
    const extensions = {
        javascript: 'js',
        python: 'py',
        java: 'java',
        cpp: 'cpp',
        html: 'html',
        css: 'css'
    };
    
    const ext = extensions[language] || 'txt';
    const filename = `code-${Date.now()}.${ext}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Code downloaded!', 'success');
}

function showCodeOutput(content) {
    const outputDiv = document.getElementById('codeOutput');
    const outputContent = document.getElementById('outputContent');
    
    if (outputDiv && outputContent) {
        outputContent.innerHTML = formatAIResponse(content);
        outputDiv.style.display = 'flex';
        
        if (typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(outputContent);
        }
    }
}

function closeCodeOutput() {
    const outputDiv = document.getElementById('codeOutput');
    if (outputDiv) {
        outputDiv.style.display = 'none';
    }
}

function highlightCode() {
    if (typeof Prism !== 'undefined') {
        const editor = document.getElementById('codeEditor');
        if (editor && editor.value) {
            console.log('✨ Code highlighted');
        }
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

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

// ============================================
// AUTH HANDLERS
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
        showNotification(getTranslation('loginSuccess'));
        if (email) email.value = '';
        if (password) password.value = '';
        
    } catch (error) {
        console.error("Login error:", error);
        const errorMsg = document.getElementById('loginError');
        
        if (errorMsg) {
            if (error.code === 'auth/user-not-found') {
                errorMsg.textContent = 'No account found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMsg.textContent = 'Incorrect password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMsg.textContent = 'Invalid email address.';
            } else {
                errorMsg.textContent = 'Login failed. Please try again.';
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
            if (loginText) loginText.textContent = 'Login';
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
        
        const successMsg = document.getElementById('signupSuccess');
        if (successMsg) {
            successMsg.textContent = 'Registration successful!';
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
                errorMsg.textContent = 'This email is already registered.';
            } else if (error.code === 'auth/weak-password') {
                errorMsg.textContent = 'Password is too weak.';
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
            if (signupText) signupText.textContent = 'Sign Up';
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
// GEMINI AI API CALLS
// ============================================

async function callGeminiAPI(prompt, imageData = null) {
    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        let requestBody;
        
        if (imageData) {
            requestBody = {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: imageData.split(',')[1]
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            };
        } else {
            requestBody = {
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            };
        }
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiResponse) {
            throw new Error('Empty response from AI');
        }
        
        return aiResponse;
        
    } catch (error) {
        console.error('❌ Gemini API Error:', error);
        throw error;
    }
}

async function getAIResponse(userMessage, imageData = null, conversationHistory = []) {
    console.log("🤖 Getting AI response...");
    
    try {
        let prompt = userMessage;
        
        if (conversationHistory.length > 0) {
            const historyText = conversationHistory.map(msg => 
                `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`
            ).join('\n');
            prompt = historyText + '\n\nCurrent question:\n' + userMessage;
        }
        
        const response = await callGeminiAPI(prompt, imageData);
        
        console.log("✅ AI response successful");
        return response;
        
    } catch (error) {
        console.error('❌ AI Error:', error);
        
        if (currentLanguage === 'si') {
            return 'මට කණගාටුයි, දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.';
        } else {
            return 'I apologize, but I encountered an error. Please try again.';
        }
    }
}
// ============================================
// TEXT ART FUNCTIONS
// ============================================

function isTextArtRequest(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    const textArtPatterns = [
        /text\s+(art|image|picture)/i,
        /ascii\s+(art|image)/i,
        /draw\s+(with|using)?\s*(text|ascii|characters)/i,
        /create.*using\s+(text|characters|ascii)/i,
        /make.*text\s+(art|image)/i,
        /අකුරු\s*(පින්තූර|කලාව)/i,
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

IMPORTANT:
1. Use ASCII characters, Unicode box-drawing characters, or emojis
2. Make it visually appealing and detailed
3. The art should be at least 15-30 lines tall
4. Use creative spacing and characters
5. Add a title and description

Be creative and make it beautiful!`;

        const textArt = await callGeminiAPI(enhancedPrompt);

        hideLoading();
        isGeneratingImage = false;
        
        if (textArt) {
            console.log("✅ Text art generated!");
            return textArt;
        } else {
            throw new Error('Empty response');
        }

    } catch (error) {
        console.error('❌ Text art error:', error);
        hideLoading();
        isGeneratingImage = false;
        
        const errorMsg = currentLanguage === 'si'
            ? 'මට කණගාටුයි, text art එක සෑදීමට නොහැකි විය.'
            : 'Sorry, I could not generate the text art.';
        
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
        const titleText = userMessage.substring(0, 30);
        session.title = titleText + (titleText.length >= 30 ? '...' : '');
    }

    session.updatedAt = Date.now();
    saveChatSessions();
    renderSessions();

    const typing = document.getElementById('typingIndicator');
    if (typing) typing.style.display = 'flex';

    let artPrompt = userMessage.replace(/^(create|generate|draw|make)\s+(a\s+)?text\s+(art|image)\s+(of\s+)?/i, '').trim();

    const textArt = await generateTextArt(artPrompt);

    if (typing) typing.style.display = 'none';

    if (textArt) {
        displayTextArtMessage(textArt, artPrompt);
        
        session.messages.push({
            content: textArt,
            isUser: false,
            isTextArt: true,
            originalPrompt: artPrompt,
            timestamp: Date.now()
        });

        session.updatedAt = Date.now();
        saveChatSessions();
        
        showNotification(currentLanguage === 'si' ? 'Text art එක සාදන ලදී!' : 'Text art created!', 'success');
    }
}

function displayTextArtMessage(textArt, prompt) {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    const welcome = messagesDiv.querySelector('.welcome-screen');
    if (welcome) welcome.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message text-art-message';
    
    const copyBtnText = currentLanguage === 'si' ? 'පිටපත්' : 'Copy';
    const downloadBtnText = currentLanguage === 'si' ? 'බාගන්න' : 'Download';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <span>Smart AI</span>
        </div>
        <div class="message-content">
            <div class="text-art-container">
                <div class="text-art-title">
                    🎨 Text Art: ${escapeHtml(prompt)}
                </div>
                <pre class="text-art-display">${escapeHtml(textArt)}</pre>
            </div>
        </div>
        <div class="message-actions">
            <button class="action-btn" onclick="copyTextArt(this, \`${textArt.replace(/`/g, '\\`')}\`)">
                <i class="fas fa-copy"></i> ${copyBtnText}
            </button>
            <button class="action-btn" onclick="downloadTextArt(\`${textArt.replace(/`/g, '\\`')}\`, '${escapeHtml(prompt)}')">
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
        button.innerHTML = `<i class="fas fa-check"></i> ${getTranslation('copied')}`;
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 2000);
    });
}

function downloadTextArt(textArt, prompt) {
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
    
    showNotification('Downloaded!', 'success');
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
        
        localStorage.setItem(storageKey, JSON.stringify(chatSessions));
        console.log("⚡ Saved to localStorage");
        
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
        console.error('❌ Save error:', error);
    }
}

async function loadChatSessions() {
    try {
        const userId = auth && auth.currentUser ? auth.currentUser.uid : null;
        const storageKey = getStorageKey();
        
        let sessions = [];
        let loadedFromLocalStorage = false;

        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                sessions = JSON.parse(saved);
                loadedFromLocalStorage = true;
                console.log("⚡ Loaded from localStorage:", sessions.length, "chats");
            } catch (parseError) {
                console.error("❌ Parse error:", parseError);
                sessions = [];
            }
        }

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
        console.error('❌ Load error:', error);
        createNewChat();
    }
}


// ============================================
// MESSAGE FORMATTING
// ============================================

function formatAIResponse(text) {
    if (!text) return '';
    
    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
    });
    text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    text = text.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    text = text.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    text = text.replace(/^\* (.*$)/gm, '<li>$1</li>');
    text = text.replace(/^- (.*$)/gm, '<li>$1</li>');
    text = text.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

function displayMessage(content, isUser, imageData = null) {
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
        'Smart AI Pro';
    
    let imageHTML = '';
    if (imageData) {
        imageHTML = `
            <div class="image-container">
                <img src="${imageData}" alt="Uploaded image" class="message-image">
            </div>
        `;
    }
    
    const formattedContent = isUser ? content.replace(/\n/g, '<br>') : formatAIResponse(content);
    
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
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(messageDiv);
    }
}

function copyMessage(button) {
    const messageContent = button.closest('.message');
    if (!messageContent) return;
    
    const messageText = messageContent.querySelector('.message-text');
    if (!messageText) return;
    
    const textContent = messageText.textContent || messageText.innerText;
    
    navigator.clipboard.writeText(textContent).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = `<i class="fas fa-check"></i> ${getTranslation('copied')}`;
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

// ============================================
// SEND MESSAGE FUNCTION
// ============================================

async function sendMessage() {
    if (isProcessing || isImageLoading || isGeneratingImage) return;
    
    const input = document.getElementById('messageInput');
    const message = input ? input.value.trim() : '';
    
    if (!message && !currentImage) {
        showNotification('Please enter a message or upload an image', 'error');
        return;
    }
    
    if (message && !currentImage) {
        if (isTextArtRequest(message)) {
            await handleTextArtFlow(message);
            return;
        }
    }
    
    const messageToSend = message || (currentLanguage === 'si' ? 
        'මෙම පින්තූරය ගැන මට කියන්න' : 
        'Tell me about this image');
    
    const session = getCurrentSession();
    if (!session) {
        createNewChat();
        return;
    }
    
    displayMessage(messageToSend, true, currentImage);
    
    session.messages.push({
        content: messageToSend,
        isUser: true,
        imageData: currentImage,
        timestamp: Date.now()
    });
    
    if (session.messages.filter(m => m.isUser).length === 1) {
        const titleText = messageToSend.substring(0, 30);
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
    
    const imageToSend = currentImage;
    currentImage = null;
    removeImage();
    
    try {
        const historyForAI = session.messages.slice(-11, -1);
        const response = await getAIResponse(messageToSend, imageToSend, historyForAI);
        
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
        
        if (imageToSend) {
            showNotification('Image analyzed!');
        }
        
    } catch (error) {
        console.error("❌ Error in sendMessage:", error);
        if (typing) typing.style.display = 'none';
        
        const errorMsg = currentLanguage === 'si' 
            ? 'මට කණගාටුයි, දෝෂයක් ඇතිවිය.'
            : 'Sorry, an error occurred.';
        
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
        if (!isProcessing && !isImageLoading && !isGeneratingImage) {
            sendMessage();
        }
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    isImageLoading = true;
    updateSendButtonState();
    showLoading('Processing image...');
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        currentImage = e.target.result;
        
        const preview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        
        if (preview && previewImage) {
            previewImage.src = currentImage;
            preview.style.display = 'block';
            
            const img = new Image();
            img.onload = function() {
                isImageLoading = false;
                hideLoading();
                updateSendButtonState();
                showNotification('Image uploaded!');
                
                const messageInput = document.getElementById('messageInput');
                if (messageInput) messageInput.focus();
            };
            
            img.onerror = function() {
                isImageLoading = false;
                currentImage = null;
                preview.style.display = 'none';
                hideLoading();
                updateSendButtonState();
                showNotification('Failed to load image', 'error');
            };
            
            img.src = currentImage;
        }
    };
    
    reader.onerror = function() {
        isImageLoading = false;
        updateSendButtonState();
        hideLoading();
        showNotification('Failed to read image', 'error');
    };
    
    reader.readAsDataURL(file);
    event.target.value = '';
}

function removeImage() {
    currentImage = null;
    isImageLoading = false;
    
    const preview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    
    if (preview) {
        preview.style.display = 'none';
    }
    if (previewImage) previewImage.src = '';
    
    updateSendButtonState();
}

function updateSendButtonState() {
    const sendBtn = document.getElementById('sendButton');
    const input = document.getElementById('messageInput');
    
    if (!sendBtn) return;
    
    const hasMessage = input && input.value.trim().length > 0;
    const hasImage = currentImage !== null;
    
    const shouldEnable = !isProcessing && !isImageLoading && !isGeneratingImage && (hasMessage || hasImage);
    
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

// ============================================
// SESSION MANAGEMENT
// ============================================

function createNewChat() {
    const sessionId = 'session_' + Date.now();
    
    const newSession = {
        id: sessionId,
        title: 'New chat',
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
            <h1>Hi, I'm Smart AI Pro</h1>
            <p>Chat or Code - Your choice!</p>
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
            <div class="history-title">${escapeHtml(session.title || 'New chat')}</div>
            <div class="history-preview">${escapeHtml((lastMessage || '').substring(0, 40))}${(lastMessage || '').length > 40 ? '...' : ''}</div>
            <div class="history-time">${timeStr}</div>
            <button class="delete-chat-btn" onclick="deleteChat('${session.id}', event)" title="Delete">
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
    
    const confirmMsg = 'Delete this chat?';
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
    showNotification('Chat deleted!');
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
        if (msg.isTextArt && msg.originalPrompt) {
            displayTextArtMessage(msg.content, msg.originalPrompt);
        } else {
            displayMessage(msg.content, msg.isUser, msg.imageData);
        }
    });
}

// ============================================
// APP INITIALIZATION
// ============================================

window.addEventListener('load', function() {
    console.log("🎯 Smart AI Pro - Loading...");
    
    initializeFirebase();
    
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('input', handleInputChange);
        messageInput.addEventListener('keydown', handleKeyPress);
    }
    
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
    
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', highlightCode);
    }
    
    switchToMode('chat');
    
    console.log("✅ Smart AI Pro v2.0.0 - Ready!");
    console.log("💬 Chat Mode + 💻 Code Mode");
    console.log("🎨 Text Art Support");
    console.log("🚀 Powered by Gemini AI");
});

console.log("🎉 Smart AI Pro - Complete!");
