// Place this inside a <script type="module"> ... </script> in your HTML

// ----------------- FIREBASE v9 (MODULAR) - FIXED FILE -----------------

// Imports (CDN URLs used here; change versions if needed)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ----------------- CONFIG -----------------
const firebaseConfig = {
  apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
  authDomain: "smart-ai-chat-app.firebaseapp.com",
  projectId: "smart-ai-chat-app",
  storageBucket: "smart-ai-chat-app.appspot.com",
  messagingSenderId: "105978571931",
  appId: "1:105978571931:web:3c8d5c7d9d8c8f5c8a5b9f"
};

// GEMINI API KEY (keep secure in production!)
const GEMINI_API_KEY = 'AIzaSyAJhruzaSUiKhP8GP7ZLg2h25GBTSKq1gs';

// ----------------- STATE -----------------
let auth = null;
let db = null;
let isProcessing = false;
let chatSessions = [];
let currentSessionId = null;
let currentImage = null;
let currentOCRText = '';
let currentLanguage = 'en';

// (keep your translations object unchanged — omitted here for brevity; paste the same translations)
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
    processingImage: "Processing image..."
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
    processingImage: "පින්තූරය සකසමින්..."
  }
};

// ----------------- INIT FIREBASE -----------------
function initializeFirebase() {
  try {
    console.log("🔄 Initializing Firebase v9 (modular)...");
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      if (user) {
        showChatApp();
        loadChatSessions(user.uid);
        updateUserProfile(user);
      } else {
        showAuthContainer();
      }
    });

    loadLanguagePreference();
    console.log("✅ Firebase initialized");
  } catch (error) {
    console.error("Firebase init error:", error);
    showNotification('Firebase setup failed. ' + (error.message || error), 'error');
  }
}

// ----------------- TRANSLATIONS & LANGUAGE -----------------
function getTranslation(key) {
  return translations[currentLanguage][key] || translations.en[key] || key;
}

function updateLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = getTranslation(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = getTranslation(key);
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
    updateLanguage();
  }
}

// ----------------- USER PROFILE -----------------
function updateUserProfile(user) {
  const userName = user.displayName || user.email.split('@')[0];
  const userEmail = user.email;

  const userNameElement = document.getElementById('userName');
  const userEmailElement = document.getElementById('userEmail');

  if (userNameElement) userNameElement.textContent = userName;
  if (userEmailElement) userEmailElement.textContent = userEmail;
}

// ----------------- UI HELPERS -----------------
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

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  const text = document.getElementById('notificationText');

  if (!notification || !text) {
    console.log("Notification:", message);
    return;
  }

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

// ----------------- AUTH HANDLERS (modular) -----------------
async function handleLogin(event) {
  if (event) event.preventDefault();
  if (isProcessing) return;

  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;

  if (!email || !password) {
    showNotification('Please fill all fields', 'error');
    return;
  }

  isProcessing = true;
  showLoading('Logging in...');
  hideMessages();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showNotification(getTranslation('loginSuccess'));
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Login failed. Please try again.';

    if (error.code === 'auth/user-not-found') {
      errorMessage = 'User not found. Please check your email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    }

    showNotification(errorMessage, 'error');
  } finally {
    isProcessing = false;
    hideLoading();
  }
}

async function handleSignup(event) {
  if (event) event.preventDefault();
  if (isProcessing) return;

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

  isProcessing = true;
  showLoading('Creating account...');
  hideMessages();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });

    showNotification('Registration successful! Redirecting...');

    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.reset();

    setTimeout(() => {
      showLogin();
    }, 1500);
  } catch (error) {
    console.error('Signup error:', error);
    let errorMessage = 'Registration failed. Please try again.';

    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email already registered. Please use a different email.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Use at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    }

    showNotification(errorMessage, 'error');
  } finally {
    isProcessing = false;
    hideLoading();
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
    chatSessions = [];
    currentSessionId = null;
    showNotification(getTranslation('logoutSuccess'));
  } catch (error) {
    console.error('Logout error:', error);
    showNotification('Logout failed', 'error');
  }
}

// ----------------- FIRESTORE (modular) FUNCTIONS -----------------
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function loadChatSessions(userId) {
  try {
    if (!userId || !db) return;

    console.log("🔄 Loading sessions from Firestore (modular) ...");

    const sessionsCol = collection(db, 'users', userId, 'chatSessions');
    const q = query(sessionsCol, orderBy('updatedAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);

    chatSessions = [];
    snapshot.forEach(docSnap => {
      const sessionData = docSnap.data();
      chatSessions.push({
        id: docSnap.id,
        ...sessionData
      });
    });

    console.log("✅ Loaded from Firestore:", chatSessions.length, "sessions");

    if (chatSessions.length === 0) {
      await createNewChat();
    } else {
      currentSessionId = chatSessions[0].id;
      renderChatHistory();
    }

    renderSessions();
  } catch (error) {
    console.error('Firestore load error:', error);
    // fallback to localStorage
    const userObj = auth.currentUser;
    if (userObj) loadFromLocalStorage(userObj.uid);
  }
}

async function saveChatSession(session) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId || !db) return;

    const sessionData = {
      title: session.title,
      messages: session.messages,
      createdAt: session.createdAt ? Timestamp.fromDate(new Date(session.createdAt)) : serverTimestamp(),
      updatedAt: session.updatedAt ? Timestamp.fromDate(new Date(session.updatedAt)) : serverTimestamp()
    };

    const docRef = doc(db, 'users', userId, 'chatSessions', session.id);
    await setDoc(docRef, sessionData, { merge: true });
    console.log("✅ Saved to Firestore:", session.id);
  } catch (error) {
    console.error('Firestore save error:', error);
    throw error;
  }
}

async function deleteChatSession(sessionId) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId || !db) return;

    const docRef = doc(db, 'users', userId, 'chatSessions', sessionId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Firestore delete error:', error);
    throw error;
  }
}

// ----------------- LOCALSTORAGE FALLBACK -----------------
function getStorageKey(userId) {
  return `smartai-sessions-${userId}`;
}

function loadFromLocalStorage(userId) {
  try {
    const storageKey = getStorageKey(userId);
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      chatSessions = JSON.parse(saved);
      console.log("✅ Loaded from localStorage:", chatSessions.length, "sessions");
    }

    if (chatSessions.length === 0) {
      createNewChat();
    } else {
      currentSessionId = chatSessions[0].id;
      renderChatHistory();
    }

    renderSessions();
  } catch (error) {
    console.error('LocalStorage load error:', error);
    createNewChat();
  }
}

// ----------------- SESSION OPERATIONS -----------------
async function createNewChat() {
  const sessionId = generateSessionId();

  const newSession = {
    id: sessionId,
    title: currentLanguage === 'si' ? 'නව සංවාදය' : 'New Chat',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  chatSessions.unshift(newSession);
  currentSessionId = sessionId;

  try {
    await saveChatSession(newSession);
  } catch (error) {
    console.error('Failed to save new chat:', error);
    // fallback: save to localStorage
    const userId = auth.currentUser?.uid;
    if (userId) {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(chatSessions));
    }
  }

  renderSessions();
  clearMessages();

  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

async function switchToSession(sessionId) {
  if (currentSessionId === sessionId) {
    closeSidebar();
    return;
  }

  currentSessionId = sessionId;
  renderChatHistory();
  renderSessions();
  closeSidebar();
}

async function deleteChat(sessionId, event) {
  if (event) event.stopPropagation();

  const confirmMsg = getTranslation('deleteConfirm');
  if (!confirm(confirmMsg)) return;

  const index = chatSessions.findIndex(s => s.id === sessionId);
  if (index === -1) return;

  try {
    await deleteChatSession(sessionId);
    chatSessions.splice(index, 1);

    if (currentSessionId === sessionId) {
      if (chatSessions.length > 0) {
        currentSessionId = chatSessions[0].id;
        renderChatHistory();
      } else {
        await createNewChat();
      }
    }

    renderSessions();
    showNotification(getTranslation('chatDeleted'));
  } catch (error) {
    console.error('Delete failed:', error);
    showNotification('Failed to delete chat', 'error');
  }
}

function getCurrentSession() {
  return chatSessions.find(s => s.id === currentSessionId);
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
            <div class="history-title">${escapeHtml(session.title)}</div>
            <div class="history-preview">${escapeHtml((lastMessage || '').substring(0, 40))}${(lastMessage && lastMessage.length > 40) ? '...' : ''}</div>
            <div class="history-time">${timeStr}</div>
            <button class="delete-chat-btn" onclick="deleteChat('${session.id}', event)" title="${currentLanguage === 'si' ? 'මකන්න' : 'Delete'}">
                <i class="fas fa-trash"></i>
            </button>
        `;

    item.onclick = () => switchToSession(session.id);
    historyContainer.appendChild(item);
  });
}

function getTimeString(timestamp) {
  if (timestamp instanceof Date) {
    timestamp = timestamp.getTime();
  } else if (timestamp && typeof timestamp.toDate === 'function') {
    timestamp = timestamp.toDate().getTime();
  } else if (typeof timestamp !== 'number') {
    timestamp = new Date(timestamp).getTime();
  }

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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ----------------- CHAT UI & MESSAGES (unchanged, kept same logic) -----------------
function clearMessages() {
  const messagesDiv = document.getElementById('chatMessages');
  if (!messagesDiv) return;

  const logoSvg = `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`;

  messagesDiv.innerHTML = `
        <div class="welcome-screen">
            <div class="ai-logo">${logoSvg}</div>
            <h1 id="welcomeTitle" data-i18n="welcomeTitle">${getTranslation('welcomeTitle')}</h1>
            <p id="welcomeSubtitle" data-i18n="welcomeSubtitle">${getTranslation('welcomeSubtitle')}</p>
        </div>
    `;
}

function renderChatHistory() {
  const session = getCurrentSession();
  if (!session) return;

  const messagesDiv = document.getElementById('chatMessages');
  if (!messagesDiv) return;

  messagesDiv.innerHTML = '';

  if (!session.messages || session.messages.length === 0) {
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
  if (!messagesDiv) return;

  const welcome = messagesDiv.querySelector('.welcome-screen');
  if (welcome) {
    welcome.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

  const avatarIcon = isUser ? '<i class="fas fa-user"></i>' : `<svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="msgLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#357ABD;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="19" fill="url(#msgLogo)"/>
        <path d="M13 17 L20 10 L27 17 L24 17 L24 27 L16 27 L16 17 Z" fill="white" opacity="0.9"/>
        <circle cx="20" cy="30" r="2" fill="white" opacity="0.9"/>
    </svg>`;

  const messageLabel = isUser
    ? (currentLanguage === 'si' ? 'ඔබ' : 'You')
    : 'Smart AI';

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
                    <i class="fas fa-copy"></i> ${currentLanguage === 'si' ? 'පිටපත්' : 'Copy'}
                </button>
            </div>
        ` : ''}
    `;

  messagesDiv.appendChild(messageDiv);

  if (animate) {
    scrollToBottom();
  }
}

async function addMessage(content, isUser, imageData = null) {
  addMessageToDOM(content, isUser, imageData, true);

  const session = getCurrentSession();
  if (session) {
    session.messages.push({
      content: content,
      isUser: isUser,
      imageData: imageData,
      timestamp: new Date()
    });

    session.updatedAt = new Date();

    if (isUser && session.messages.filter(m => m.isUser).length === 1) {
      const titleText = content.replace(/<[^>]*>/g, '').substring(0, 30);
      session.title = titleText + (titleText.length >= 30 ? '...' : '');
    }

    try {
      await saveChatSession(session);
    } catch (error) {
      console.error('Failed to save message:', error);
      // fallback save to localStorage
      const userId = auth.currentUser?.uid;
      if (userId) localStorage.setItem(getStorageKey(userId), JSON.stringify(chatSessions));
    }

    renderSessions();
  }
}

function scrollToBottom() {
  const messagesDiv = document.getElementById('chatMessages');
  if (!messagesDiv) return;

  setTimeout(() => {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 100);
}

function copyMessage(button) {
  const messageContent = button.closest('.message').querySelector('.message-content');
  const textContent = messageContent.innerText || messageContent.textContent;

  navigator.clipboard.writeText(textContent).then(() => {
    const originalHTML = button.innerHTML;
    const copiedText = currentLanguage === 'si' ? 'පිටපත් විය!' : 'Copied!';
    button.innerHTML = `<i class="fas fa-check"></i> ${copiedText}`;

    setTimeout(() => {
      button.innerHTML = originalHTML;
    }, 2000);
  });
}

// ----------------- IMAGE UPLOAD & OCR (unchanged logic) -----------------
async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showNotification(currentLanguage === 'si' ? 'කරුණාකර පින්තූරයක් උඩුගත කරන්න' : 'Please upload an image', 'error');
    return;
  }

  showLoading(getTranslation('processingImage'));

  const reader = new FileReader();
  reader.onload = async function (e) {
    currentImage = e.target.result;

    const preview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');

    if (preview && previewImage) {
      previewImage.src = currentImage;
      preview.style.display = 'block';
    }

    hideLoading();
    showNotification(getTranslation('imageUploaded'));

    await performOCR(currentImage);
  };

  reader.readAsDataURL(file);
  event.target.value = '';
}

async function performOCR(imageData) {
  try {
    showLoading(getTranslation('extractingText'));

    // assumes Tesseract is loaded in page as global `Tesseract`
    const result = await Tesseract.recognize(
      imageData,
      'eng+sin',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            const text = currentLanguage === 'si'
              ? `පෙළ උපුටා ගනිමින්... ${progress}%`
              : `Extracting text... ${progress}%`;
            const loadingText = document.getElementById('loadingText');
            if (loadingText) loadingText.textContent = text;
          }
        }
      }
    );

    currentOCRText = result.data.text.trim();

    if (currentOCRText) {
      const ocrTextDiv = document.getElementById('ocrText');
      if (ocrTextDiv) {
        const label = currentLanguage === 'si' ? 'පෙළ:' : 'Text:';
        ocrTextDiv.textContent = `${label} ${currentOCRText}`;
        ocrTextDiv.style.display = 'block';
      }
      showNotification(getTranslation('textExtracted'));
    }

    hideLoading();
  } catch (error) {
    console.error('OCR error:', error);
    hideLoading();
    showNotification(currentLanguage === 'si' ? 'OCR අසාර්ථකයි' : 'OCR failed', 'error');
  }
}

function removeImage() {
  currentImage = null;
  currentOCRText = '';
  const preview = document.getElementById('imagePreview');
  const ocrTextDiv = document.getElementById('ocrText');

  if (preview) preview.style.display = 'none';
  if (ocrTextDiv) ocrTextDiv.textContent = '';
}

// ----------------- GEMINI AI REQUEST (unchanged logic, using fetch) -----------------
async function getAIResponse(userMessage, imageData = null, ocrText = '') {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

    let messageText = userMessage;

    if (ocrText) {
      if (userMessage) {
        messageText = currentLanguage === 'si'
          ? `ප්‍රශ්නය: ${userMessage}\n\nපින්තූරයේ පෙළ:\n${ocrText}\n\nපින්තූරයේ පෙළ මත පදනම්ව පිළිතුරු දෙන්න.`
          : `Question: ${userMessage}\n\nText from image:\n${ocrText}\n\nAnswer based on the image text.`;
      } else {
        messageText = currentLanguage === 'si'
          ? `පින්තූරයේ ඇත්තේ:\n${ocrText}\n\nමෙම පෙළ විශ්ලේෂණය කරන්න.`
          : `Image contains:\n${ocrText}\n\nAnalyze this text.`;
      }
    }

    // Add language instruction
    if (currentLanguage === 'si') {
      messageText = `කරුණාකර සිංහලෙන් පිළිතුරු දෙන්න.\n\n${messageText}`;
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
    return currentLanguage === 'si'
      ? 'සමාවන්න, දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.'
      : 'Sorry, an error occurred. Please try again.';
  }
}

// ----------------- SEND MESSAGE FLOW -----------------
async function sendMessage() {
  if (isProcessing) return;

  const input = document.getElementById('messageInput');
  const message = input?.value.trim();

  if (!message && !currentImage) return;

  const messageToSend = message || (currentLanguage === 'si' ? '[පින්තූරය යවන ලදී]' : '[Image sent]');
  const imageToSend = currentImage;
  const ocrTextToSend = currentOCRText;

  await addMessage(messageToSend, true, imageToSend);

  if (input) input.value = '';
  removeImage();

  const sendBtn = document.getElementById('sendButton');
  const typing = document.getElementById('typingIndicator');

  isProcessing = true;
  if (sendBtn) sendBtn.disabled = true;
  if (typing) typing.style.display = 'flex';

  try {
    const response = await getAIResponse(message, imageToSend, ocrTextToSend);
    if (typing) typing.style.display = 'none';
    await addMessage(response, false);
  } catch (error) {
    if (typing) typing.style.display = 'none';
    const errorMsg = currentLanguage === 'si'
      ? 'සමාවන්න, දෝෂයක් ඇතිවිය.'
      : 'Sorry, an error occurred.';
    await addMessage(errorMsg, false);
  } finally {
    isProcessing = false;
    if (sendBtn) sendBtn.disabled = false;
    currentOCRText = '';
    if (input) input.focus();
  }
}

function handleKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// ----------------- BOOTSTRAP -----------------
window.addEventListener('load', initializeFirebase);

// ----------------- GLOBAL ACCESSORS (for inline HTML onClick handlers) -----------------
window.toggleLanguage = toggleLanguage;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.showLogin = showLogin;
window.showSignup = showSignup;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.createNewChat = createNewChat;
window.deleteChat = deleteChat;
window.handleImageUpload = handleImageUpload;
window.removeImage = removeImage;
window.sendMessage = sendMessage;
window.handleKeyPress = handleKeyPress;
window.copyMessage = copyMessage;

// ------------------------------------------------------------------------
