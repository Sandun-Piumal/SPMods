// FIREBASE CONFIG (Same as main app)
const firebaseConfig = {
    apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
    authDomain: "smart-ai-chat-app.firebaseapp.com",
    projectId: "smart-ai-chat-app",
    databaseURL: "https://smart-ai-chat-app-default-rtdb.firebaseio.com/"
};

let auth, database;

// ADMIN CREDENTIALS - Change this to your admin email
const ADMIN_EMAIL = "spmodsofficial@gmail.com";

// Initialize Firebase
function initializeFirebase() {
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        database = firebase.database();
        
        auth.onAuthStateChanged(handleAuthState);
        
        // Auto login for admin (you can remove this and add proper login)
        signInAdmin();
        
    } catch (error) {
        console.error("Admin Firebase init error:", error);
    }
}

// Admin sign in
async function signInAdmin() {
    try {
        // You can implement proper admin login here
        // For now, using simple approach
        const adminEmail = prompt("Enter Admin Email:");
        const adminPassword = prompt("Enter Admin Password:");
        
        if (adminEmail && adminPassword) {
            await auth.signInWithEmailAndPassword(adminEmail, adminPassword);
        }
    } catch (error) {
        console.error("Admin login error:", error);
        alert("Admin login failed. Check console for details.");
    }
}

function handleAuthState(user) {
    if (user) {
        if (user.email === ADMIN_EMAIL) {
            console.log("✅ Admin logged in:", user.email);
            loadAdminData();
        } else {
            alert("Access Denied. Admin only.");
            logout();
        }
    } else {
        console.log("❌ No admin user");
    }
}

// Load all admin data
async function loadAdminData() {
    await loadUserStats();
    await loadAllUsers();
    await setupUserSelector();
}

// Load user statistics
async function loadUserStats() {
    try {
        const usersSnapshot = await database.ref('users').once('value');
        const chatsSnapshot = await database.ref('userChatSessions').once('value');
        
        const users = usersSnapshot.val() || {};
        const chats = chatsSnapshot.val() || {};
        
        const totalUsers = Object.keys(users).length;
        const totalChats = Object.values(chats).reduce((acc, userChats) => 
            acc + (userChats.sessions ? userChats.sessions.length : 0), 0
        );
        
        // Calculate active today (users who logged in last 24 hours)
        const activeToday = Object.values(users).filter(user => 
            user.lastLogin && (Date.now() - user.lastLogin) < 24 * 60 * 60 * 1000
        ).length;
        
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalChats').textContent = totalChats;
        document.getElementById('activeToday').textContent = activeToday;
        
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

// Load all registered users
async function loadAllUsers() {
    try {
        const usersSnapshot = await database.ref('users').once('value');
        const users = usersSnapshot.val() || {};
        
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';
        
        Object.entries(users).forEach(([userId, userData]) => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <strong>👤 ${userData.displayName || 'No Name'}</strong><br>
                📧 ${userData.email}<br>
                🆔 ${userId}<br>
                📅 Registered: ${new Date(userData.createdAt).toLocaleDateString()}<br>
                🔐 Last Login: ${new Date(userData.lastLogin).toLocaleDateString()}<br>
                <button class="btn" onclick="viewUserChats('${userId}', '${userData.email}')">
                    <i class="fas fa-eye"></i> View Chats
                </button>
            `;
            usersList.appendChild(userItem);
        });
        
    } catch (error) {
        console.error("Error loading users:", error);
    }
}

// Setup user selector dropdown
async function setupUserSelector() {
    try {
        const usersSnapshot = await database.ref('users').once('value');
        const users = usersSnapshot.val() || {};
        const selector = document.getElementById('userSelector');
        
        selector.innerHTML = '<option value="">Select User</option>';
        
        Object.entries(users).forEach(([userId, userData]) => {
            const option = document.createElement('option');
            option.value = userId;
            option.textContent = `${userData.displayName} (${userData.email})`;
            selector.appendChild(option);
        });
        
    } catch (error) {
        console.error("Error setting up selector:", error);
    }
}

// Load chats for selected user
async function loadUserChats(userId) {
    if (!userId) {
        document.getElementById('chatsList').innerHTML = '';
        return;
    }
    
    try {
        const chatsSnapshot = await database.ref('userChatSessions/' + userId).once('value');
        const userChats = chatsSnapshot.val();
        
        const chatsList = document.getElementById('chatsList');
        chatsList.innerHTML = '<h3>Chat Sessions</h3>';
        
        if (userChats && userChats.sessions) {
            userChats.sessions.forEach((session, index) => {
                const chatItem = document.createElement('div');
                chatItem.className = 'chat-item';
                chatItem.innerHTML = `
                    <strong>💬 ${session.title}</strong><br>
                    📅 Created: ${new Date(session.createdAt).toLocaleString()}<br>
                    ✏️ Updated: ${new Date(session.updatedAt).toLocaleString()}<br>
                    💭 Messages: ${session.messages.length}<br>
                    <button class="btn" onclick="viewChatDetails('${userId}', ${index})">
                        <i class="fas fa-search"></i> View Details
                    </button>
                `;
                chatsList.appendChild(chatItem);
            });
        } else {
            chatsList.innerHTML += '<p>No chat sessions found for this user.</p>';
        }
        
    } catch (error) {
        console.error("Error loading user chats:", error);
    }
}

// View detailed chat messages
async function viewChatDetails(userId, sessionIndex) {
    try {
        const chatsSnapshot = await database.ref('userChatSessions/' + userId).once('value');
        const userChats = chatsSnapshot.val();
        const session = userChats.sessions[sessionIndex];
        
        let messagesHTML = '<h4>Chat Messages:</h4>';
        session.messages.forEach(msg => {
            messagesHTML += `
                <div style="margin: 10px 0; padding: 10px; background: #1a1a1a; border-radius: 5px;">
                    <strong>${msg.isUser ? '👤 User' : '🤖 AI'}:</strong><br>
                    ${msg.content}<br>
                    <small>🕒 ${new Date(msg.timestamp).toLocaleString()}</small>
                </div>
            `;
        });
        
        alert(`Chat Details:\n\n${messagesHTML}`);
        
    } catch (error) {
        console.error("Error viewing chat details:", error);
    }
}

// View user chats in popup
async function viewUserChats(userId, userEmail) {
    try {
        const chatsSnapshot = await database.ref('userChatSessions/' + userId).once('value');
        const userChats = chatsSnapshot.val();
        
        let chatInfo = `Chats for: ${userEmail}\n\n`;
        
        if (userChats && userChats.sessions) {
            userChats.sessions.forEach(session => {
                chatInfo += `💬 ${session.title}\n`;
                chatInfo += `   Messages: ${session.messages.length}\n`;
                chatInfo += `   Last: ${new Date(session.updatedAt).toLocaleDateString()}\n\n`;
            });
        } else {
            chatInfo += "No chat sessions found.";
        }
        
        alert(chatInfo);
        
    } catch (error) {
        console.error("Error viewing user chats:", error);
    }
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        window.location.reload();
    });
}

// Auto refresh data every 30 seconds
setInterval(() => {
    if (auth.currentUser) {
        loadAdminData();
    }
}, 30000);

// Initialize admin app
window.addEventListener('load', initializeFirebase);
