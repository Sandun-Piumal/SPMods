// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
    authDomain: "smart-ai-chat-app.firebaseapp.com",
    projectId: "smart-ai-chat-app",
    storageBucket: "smart-ai-chat-app.firebasestorage.app",
    messagingSenderId: "195723763663",
    appId: "1:195723763663:web:0892e6392eb77c15813cba",
    measurementId: "G-SWRB896B6Y"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Language content
const languageContent = {
    sinhala: {
        // Previous content remains the same
        logoTitle: "Smart AI",
        headerSubtitle: "Powered by Gemini AI",
        username: "පරිශීලක",
        userStatus: "Online",
        statusText: "Online",
        welcomeTitle: "නව Model සාර්ථකව යාවත්කාලීන කරන ලදී! ✨",
        welcomeText: "Gemini AI Model සමඟ වැඩ කිරීමට සූදානම්!<br>ඔබගේ ප්‍රශ්නය පහතින් ටයිප් කර Enter ඔබන්න 🚀",
        typingText: "Smart AI ප්‍රතිචාර සකසමින්",
        inputPlaceholder: "ඔබගේ ප්‍රශ්නය මෙතැන ටයිප් කරන්න...",
        themeLabelDark: "අඳුරු",
        themeLabelLight: "ආලෝක",
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
        logoutText: "පිටවීම",
        // Footer content
        telegram: "Telegram",
        whatsapp: "WhatsApp",
        email: "Email",
        copyright: "Copyright © 2025 SPMods. All Rights Reserved.",
        designCredit: "Design: Sandun Piurnal",
        systemPrompt: `ඔබ Smart AI නම් උපකාරක AI වේ. සියලුම ප්‍රශ්නවලට සිංහල භාෂාවෙන් පිළිතුරු දෙන්න. 
        පිළිතුරු සවිස්තරාත්මක, උපයෝගී සහ මිත්‍රශීලී විය යුතුය. 
        කේතය, තාක්ෂණය, විද්‍යාව, ඉතිහාසය සහ සාමාන්‍ය දැනුම පිළිබඳ ප්‍රශ්න සඳහා විස්තරාත්මක පිළිතුරු දෙන්න.`
    },
    english: {
        // Previous content remains the same
        logoTitle: "Smart AI",
        headerSubtitle: "Powered by Gemini AI",
        username: "User",
        userStatus: "Online",
        statusText: "Online",
        welcomeTitle: "New Model Successfully Updated! ✨",
        welcomeText: "Ready to work with Gemini AI Model!<br>Type your question below and press Enter 🚀",
        typingText: "Smart AI is preparing response",
        inputPlaceholder: "Type your question here...",
        themeLabelDark: "Dark",
        themeLabelLight: "Light",
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
        logoutText: "Logout",
        // Footer content
        telegram: "Telegram",
        whatsapp: "WhatsApp",
        email: "Email",
        copyright: "Copyright © 2025 SPMods. All Rights Reserved.",
        designCredit: "Design: Sandun Piurnal",
        systemPrompt: `You are Smart AI, a helpful AI assistant. Respond to all questions in English.
        Responses should be detailed, helpful and friendly.
        Provide detailed answers for questions about code, technology, science, history and general knowledge.`
    }
};

// Current language and theme
let currentLanguage = 'sinhala';
let currentTheme = 'dark';
let currentUser = null;

// 🛑 SECURITY WARNING: API keys should not be exposed in client-side code
// This is for demonstration purposes only
const GOOGLE_AI_API_KEY = 'AIzaSyAJhruzaSUiKhP8GP7ZLg2h25GBTSKq1gs';

document.addEventListener('DOMContentLoaded', function() {
    // Previous DOM elements remain the same
    const authContainer = document.getElementById('authContainer');
    const chatApp = document.getElementById('chatApp');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');
    const signupSuccess = document.getElementById('signupSuccess');
    const userProfile = document.getElementById('userProfile');
    const logoutMenu = document.getElementById('logoutMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('theme-label');
    const sinhalaBtn = document.getElementById('sinhalaBtn');
    const englishBtn = document.getElementById('englishBtn');
    
    // Footer elements
    const footerLinks = document.querySelectorAll('.footer-link span');
    const copyrightText = document.querySelectorAll('.footer-copyright p:first-child');
    const designCredit = document.querySelectorAll('.design-credit');

    // Check if user is already logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            showChatApp();
        } else {
            // User is signed out
            currentUser = null;
            showAuthContainer();
        }
    });
    
    // Show auth container
    function showAuthContainer() {
        authContainer.style.display = 'block';
        chatApp.style.display = 'none';
    }
    
    // Show chat app
    function showChatApp() {
        authContainer.style.display = 'none';
        chatApp.style.display = 'flex';
        
        // Update user info
        const content = languageContent[currentLanguage];
        document.getElementById('username').textContent = currentUser.displayName || content.username;
        
        // Focus on input
        messageInput.focus();
    }
    
    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        loginError.style.display = 'none';
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in successfully
                loginForm.reset();
            })
            .catch((error) => {
                // Handle errors
                const errorCode = error.code;
                let errorMessage = '';
                
                if (errorCode === 'auth/user-not-found') {
                    errorMessage = 'No account found with this email';
                } else if (errorCode === 'auth/wrong-password') {
                    errorMessage = 'Incorrect password';
                } else {
                    errorMessage = 'An error occurred during login';
                }
                
                loginError.textContent = errorMessage;
                loginError.style.display = 'block';
            });
    });
    
    // Signup form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        signupError.style.display = 'none';
        signupSuccess.style.display = 'none';
        
        // Check if passwords match
        if (password !== confirmPassword) {
            signupError.textContent = 'Passwords do not match';
            signupError.style.display = 'block';
            return;
        }
        
        // Create user with email and password
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Update user profile with name
                return userCredential.user.updateProfile({
                    displayName: name
                });
            })
            .then(() => {
                // Show success message
                signupSuccess.textContent = 'Registration successful! You can now login';
                signupSuccess.style.display = 'block';
                signupForm.reset();
                
                // Switch to login form after a delay
                setTimeout(() => {
                    showLoginForm();
                }, 2000);
            })
            .catch((error) => {
                // Handle errors
                const errorCode = error.code;
                let errorMessage = '';
                
                if (errorCode === 'auth/email-already-in-use') {
                    errorMessage = 'This email is already in use';
                } else if (errorCode === 'auth/weak-password') {
                    errorMessage = 'Password should be stronger';
                } else {
                    errorMessage = 'An error occurred during registration';
                }
                
                signupError.textContent = errorMessage;
                signupError.style.display = 'block';
            });
    });
    
    // Show signup form
    showSignup.addEventListener('click', () => {
        showSignupForm();
    });
    
    // Show login form
    showLogin.addEventListener('click', () => {
        showLoginForm();
    });
    
    // Show signup form
    function showSignupForm() {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        loginError.style.display = 'none';
        signupError.style.display = 'none';
        signupSuccess.style.display = 'none';
    }
    
    // Show login form
    function showLoginForm() {
        signupForm.style.display = 'none';
        loginForm.style.display = 'flex';
        loginError.style.display = 'none';
        signupError.style.display = 'none';
        signupSuccess.style.display = 'none';
    }
    
    // User profile menu toggle
    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        logoutMenu.style.display = logoutMenu.style.display === 'block' ? 'none' : 'block';
    });
    
    // Logout button
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
        logoutMenu.style.display = 'none';
    });
    
    // Close logout menu when clicking outside
    document.addEventListener('click', () => {
        logoutMenu.style.display = 'none';
    });
    
    // Theme switcher
    function switchTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('smart-ai-theme', theme);
        
        // Update theme label
        const content = languageContent[currentLanguage];
        themeLabel.textContent = theme === 'dark' ? content.themeLabelDark : content.themeLabelLight;
    }
    
    // Language switcher
    function switchLanguage(lang) {
        currentLanguage = lang;
        const content = languageContent[lang];
        
        // Update all text content
        document.getElementById('logo-title').textContent = content.logoTitle;
        document.getElementById('header-subtitle').textContent = content.headerSubtitle;
        document.getElementById('username').textContent = currentUser ? (currentUser.displayName || content.username) : content.username;
        document.getElementById('user-status').textContent = content.userStatus;
        document.getElementById('status-text').textContent = content.statusText;
        document.getElementById('welcome-title').textContent = content.welcomeTitle;
        document.getElementById('welcome-text').innerHTML = content.welcomeText;
        document.getElementById('typing-text').textContent = content.typingText;
        document.getElementById('messageInput').placeholder = content.inputPlaceholder;
        themeLabel.textContent = currentTheme === 'dark' ? content.themeLabelDark : content.themeLabelLight;
        
        // Update auth page content
        document.getElementById('auth-title').textContent = content.authTitle;
        document.getElementById('auth-subtitle').textContent = content.authSubtitle;
        document.getElementById('email-label').textContent = content.emailLabel;
        document.getElementById('password-label').textContent = content.passwordLabel;
        document.getElementById('name-label').textContent = content.nameLabel;
        document.getElementById('signup-email-label').textContent = content.emailLabel;
        document.getElementById('signup-password-label').textContent = content.passwordLabel;
        document.getElementById('confirm-password-label').textContent = content.confirmPasswordLabel;
        document.getElementById('login-button').textContent = content.loginButton;
        document.getElementById('signup-button').textContent = content.signupButton;
        document.getElementById('no-account').textContent = content.noAccount;
        document.getElementById('have-account').textContent = content.haveAccount;
        document.getElementById('show-signup').textContent = content.showSignup;
        document.getElementById('show-login').textContent = content.showLogin;
        document.getElementById('logout-text').textContent = content.logoutText;
        
        // Update footer content
        footerLinks[0].textContent = content.telegram;
        footerLinks[1].textContent = content.whatsapp;
        footerLinks[2].textContent = content.email;
        copyrightText.forEach(el => el.textContent = content.copyright);
        designCredit.forEach(el => el.textContent = content.designCredit);
        
        // Update active button
        if (lang === 'sinhala') {
            sinhalaBtn.classList.add('active');
            englishBtn.classList.remove('active');
        } else {
            englishBtn.classList.add('active');
            sinhalaBtn.classList.remove('active');
        }
        
        localStorage.setItem('smart-ai-language', lang);
    }
    
    // Load saved preferences
    const savedTheme = localStorage.getItem('smart-ai-theme') || 'dark';
    const savedLanguage = localStorage.getItem('smart-ai-language') || 'sinhala';
    
    switchTheme(savedTheme);
    switchLanguage(savedLanguage);
    
    if (savedTheme === 'light') {
        themeToggle.checked = true;
    }
    
    // Theme toggle event
    themeToggle.addEventListener('change', function() {
        switchTheme(this.checked ? 'light' : 'dark');
    });
    
    // Language button events
    sinhalaBtn.addEventListener('click', () => switchLanguage('sinhala'));
    englishBtn.addEventListener('click', () => switchLanguage('english'));
    
    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Fixed Gemini API Call function
    async function callGeminiAPI(userMessage) {
        const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`;
        
        try {
            const response = await fetch(GEMINI_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: userMessage }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    },
                    systemInstruction: {
                        parts: [{ text: languageContent[currentLanguage].systemPrompt }]
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error?.message || `API Error: ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || 
                (currentLanguage === 'sinhala' 
                    ? 'පිළිතුරු ලබා ගැනීමට නොහැක' 
                    : 'Unable to get response');

        } catch (error) {
            console.error('Gemini API Error:', error);
            return currentLanguage === 'sinhala' 
                ? `මට කණගාටුයි! පිළිතුරු දීමේදී දෝෂයක් ඇති විය. (දෝෂය: ${error.message})`
                : `Sorry! There was an error responding. (Error: ${error.message})`;
        }
    }
    
    // Add message to chat with animation
    function addMessage(message, isUser) {
        const welcomeMsg = chatMessages.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
        
        const messageHeader = document.createElement('div');
        messageHeader.classList.add('message-header');
        messageHeader.innerHTML = isUser ? 
            '<div class="message-avatar"><i class="fas fa-user"></i></div> ' + (currentLanguage === 'sinhala' ? 'ඔබ' : 'You') : 
            '<div class="message-avatar"><i class="fas fa-robot"></i></div> Smart AI';
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = formatMessage(message);
        
        const messageTime = document.createElement('div');
        messageTime.classList.add('message-time');
        messageTime.textContent = new Date().toLocaleTimeString(currentLanguage === 'sinhala' ? 'si-LK' : 'en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.appendChild(messageHeader);
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        chatMessages.appendChild(messageDiv);
        // Scroll to bottom
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
    
    // Format message with markdown-like syntax
    function formatMessage(message) {
        let formatted = message;
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    }
    
    // Handle sending message
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
            const aiResponse = await callGeminiAPI(message); 
            typingIndicator.style.display = 'none';
            addMessage(aiResponse, false);
        } catch (error) {
            typingIndicator.style.display = 'none';
            const errorMsg = currentLanguage === 'sinhala' 
                ? 'මට කණගාටුයි! පිළිතුරු දීමේදී දෝෂයක් ඇති විය. කරුණාකර යලින් උත්සාහ කරන්න.'
                : 'Sorry! There was an error responding. Please try again.';
            addMessage(errorMsg, false);
        } finally {
            sendButton.disabled = false;
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});