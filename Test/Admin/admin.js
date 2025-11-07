// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAP7X4CZh-E5S9Qfpi-hWxDO1R_PvXC8yg",
    authDomain: "smart-ai-chat-app.firebaseapp.com",
    projectId: "smart-ai-chat-app",
    databaseURL: "https://smart-ai-chat-app-default-rtdb.firebaseio.com"
};

let auth, database;

// Initialize Firebase
function initializeFirebase() {
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        database = firebase.database();
        
        console.log("✅ Admin Firebase initialized");
        
        // Show login form
        showLoginForm();
        
    } catch (error) {
        console.error("❌ Admin Firebase init error:", error);
        showMessage("Firebase initialization failed: " + error.message);
    }
}

// Show login form
function showLoginForm() {
    const email = prompt("Enter Admin Email:");
    const password = prompt("Enter Admin Password:");
    
    if (email && password) {
        loginAdmin(email, password);
    } else {
        showMessage("Email and password required");
    }
}

// Admin login
async function loginAdmin(email, password) {
    try {
        showMessage("Logging in...");
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log("✅ Admin logged in:", userCredential.user.email);
        
        showMessage("Login successful! Loading data...");
        loadAdminData();
        
    } catch (error) {
        console.error("❌ Admin login error:", error);
        showMessage("Login failed: " + error.message);
        setTimeout(showLoginForm, 2000);
    }
}

// Load all admin data
async function loadAdminData() {
    try {
        showMessage("Loading data...");
        
        await loadUserStats();
        await loadAllUsers();
        await setupUserSelector();
        
        showMessage("Data loaded successfully!");
        
        // Hide message after 3 seconds
        setTimeout(() => {
            const messageEl = document.getElementById('message');
            if (messageEl) messageEl.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error("❌ Error loading admin data:", error);
        showMessage("Error loading data: " + error.message);
    }
}

// Load user statistics
async function loadUserStats() {
    try {
        console.log("📊 Loading user stats...");
        
        const usersSnapshot = await database.ref('users').once('value');
        const chatsSnapshot = await database.ref('userChatSessions').once('value');
        
        const users = usersSnapshot.val() || {};
        const chats = chatsSnapshot.val() || {};
        
        console.log("Users data:", users);
        console.log("Chats data:", chats);
        
        const totalUsers = Object.keys(users).length;
        
        // Calculate total chats
        let totalChats = 0;
        Object.values(chats).forEach(userChats => {
            if (userChats && userChats.sessions) {
                totalChats += userChats.sessions.length;
            }
        });
        
        // Calculate active today (last 24 hours)
        const activeToday = Object.values(users).filter(user => {
            if (!user.lastLogin) return false;
            return (Date.now() - user.lastLogin) < (24 * 60 * 60 * 1000);
        }).length;
        
        // Update UI
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalChats').textContent = totalChats;
        document.getElementById('activeToday').textContent = activeToday;
        
        console.log(`📈 Stats: Users=${totalUsers}, Chats=${totalChats}, Active=${activeToday}`);
        
    } catch (error) {
        console.error("❌ Error loading stats:", error);
        throw error;
    }
}

// Load all registered users
async function loadAllUsers() {
    try {
        console.log("👥 Loading all users...");
        
        const usersSnapshot = await database.ref('users').once('value');
        const users = usersSnapshot.val() || {};
        
        console.log("Users found:", users);
        
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';
        
        if (Object.keys(users).length === 0) {
            usersList.innerHTML = '<p>No users found in database.</p>';
            return;
        }
        
        Object.entries(users).forEach(([userId, userData]) => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <strong>👤 ${userData.displayName || 'No Name'}</strong><br>
                📧 ${userData.email}<br>
                🆔 ${userId.substring(0, 8)}...<br>
                📅 Registered: ${userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}<br>
                🔐 Last Login: ${userData.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'Never'}<br>
                <button class="btn" onclick="viewUserChats('${userId}', '${userData.email}')">
                    <i class="fas fa-eye"></i> View Chats
                </button>
            `;
            usersList.appendChild(userItem);
        });
        
    } catch (error) {
        console.error("❌ Error loading users:", error);
        throw error;
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
            option.textContent = `${userData.displayName || 'No Name'} (${userData.email})`;
            selector.appendChild(option);
        });
        
    } catch (error) {
        console.error("❌ Error setting up selector:", error);
    }
}

// View user chats
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
        console.error("❌ Error viewing user chats:", error);
        alert("Error loading chats: " + error.message);
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
        console.error("❌ Error loading user chats:", error);
    }
}

// View chat details
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
        
        // Create popup
        const popup = window.open('', 'Chat Details', 'width=600,height=400');
        popup.document.write(`
            <html>
                <head><title>Chat Details</title></head>
                <body style="background: #0a0a0a; color: white; padding: 20px;">
                    ${messagesHTML}
                    <br><button onclick="window.close()">Close</button>
                </body>
            </html>
        `);
        
    } catch (error) {
        console.error("❌ Error viewing chat details:", error);
        alert("Error loading chat details: " + error.message);
    }
}

// Show message
function showMessage(message) {
    let messageEl = document.getElementById('message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'message';
        messageEl.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: #4A90E2; color: white; padding: 15px; 
            border-radius: 5px; z-index: 1000;
        `;
        document.body.appendChild(messageEl);
    }
    messageEl.textContent = message;
    messageEl.style.display = 'block';
}

// Logout
function logout() {
    auth.signOut().then(() => {
        window.location.reload();
    });
}

// Initialize
window.addEventListener('load', initializeFirebase);
