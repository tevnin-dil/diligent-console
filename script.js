// ============================================
// STATE MANAGEMENT
// ============================================

let currentView = 'hero'; // 'hero' or 'chat'
let chats = []; // Array of all chat sessions
let currentChatId = null;
let messageCounter = 0;

// ============================================
// HERO VIEW ELEMENTS
// ============================================

const heroView = document.getElementById('heroView');
const promptInput = document.getElementById('promptInput');
const sendBtn = document.getElementById('sendBtn');
const responseArea = document.getElementById('responseArea');
const responseContent = document.getElementById('responseContent');

// Quick action buttons
const criticalBtn = document.getElementById('criticalBtn');
const chatsBtn = document.getElementById('chatsBtn');
const appointBtn = document.getElementById('appointBtn');
const openAppBtn = document.getElementById('openAppBtn');

// ============================================
// CHAT VIEW ELEMENTS
// ============================================

const chatView = document.getElementById('chatView');
const chatSidebar = document.getElementById('chatSidebar');
const chatHistory = document.getElementById('chatHistory');
const chatMain = document.getElementById('chatMain');
const chatThread = document.getElementById('chatThread');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatTitle = document.getElementById('chatTitle');
const backToHeroBtn = document.getElementById('backToHeroBtn');
const newChatBtn = document.getElementById('newChatBtn');
const rightPanel = document.getElementById('rightPanel');
const rightPanelToggle = document.getElementById('rightPanelToggle');
const closeRightPanel = document.getElementById('closeRightPanel');

// Auto-resize textarea as user types
promptInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
});

// Handle Enter key (Shift+Enter for new line)
promptInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Send button click
sendBtn.addEventListener('click', sendMessage);

// Suggestion chips
document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', function() {
        promptInput.value = this.textContent;
        promptInput.focus();
        sendMessage();
    });
});

// Quick action button handlers
criticalBtn.addEventListener('click', function() {
    const count = document.getElementById('criticalCount').textContent;
    setPromptAndSend(`Show me the ${count} critical notifications that need my attention.`);
});

chatsBtn.addEventListener('click', function() {
    const count = document.getElementById('chatsCount').textContent;
    setPromptAndSend(`Show me the ${count} updated chats with recent activity.`);
});

appointBtn.addEventListener('click', function() {
    setPromptAndSend('I need to appoint a new director. What is the process and what documents do I need?');
});

openAppBtn.addEventListener('click', function() {
    setPromptAndSend('I need to open an application. Show me my recent applications or help me start a new one.');
});

// Helper function to set prompt and send (transitions to chat view)
function setPromptAndSend(message) {
    transitionToChatView(message);
}

// Send message function (from hero view - transitions to chat)
function sendMessage() {
    const message = promptInput.value.trim();
    if (!message) return;
    
    transitionToChatView(message);
    
    // Clear input
    promptInput.value = '';
    promptInput.style.height = 'auto';
}

// ============================================
// VIEW TRANSITION
// ============================================

function transitionToChatView(initialMessage) {
    // Hide hero view
    heroView.style.display = 'none';
    
    // Show chat view
    chatView.style.display = 'grid';
    currentView = 'chat';
    
    // Create new chat
    createNewChat(initialMessage);
}

function transitionToHeroView() {
    // Show hero view
    heroView.style.display = 'flex';
    
    // Hide chat view
    chatView.style.display = 'none';
    currentView = 'hero';
    
    // Clear response area
    responseArea.style.display = 'none';
}

// ============================================
// CHAT MANAGEMENT
// ============================================

function createNewChat(initialMessage) {
    const chatId = 'chat-' + Date.now();
    currentChatId = chatId;
    
    const chat = {
        id: chatId,
        title: initialMessage.substring(0, 50) + (initialMessage.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        preview: initialMessage.substring(0, 60)
    };
    
    chats.unshift(chat);
    
    // Update UI
    updateChatHistoryDisplay();
    updateChatTitle(chat.title);
    clearChatThread();
    
    // Add user message and get AI response
    addMessageToChat(chatId, 'user', initialMessage);
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateResponse(initialMessage);
        addMessageToChat(chatId, 'assistant', response);
    }, 800);
}

function addMessageToChat(chatId, role, content) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    const message = {
        id: 'msg-' + messageCounter++,
        role: role,
        content: content,
        timestamp: new Date()
    };
    
    chat.messages.push(message);
    
    // Update preview
    if (role === 'user' && chat.messages.length === 1) {
        chat.preview = content.substring(0, 60);
    }
    
    // If this is the current chat, update the thread
    if (chatId === currentChatId) {
        appendMessageToThread(message);
    }
    
    updateChatHistoryDisplay();
}

function appendMessageToThread(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.role}`;
    messageEl.innerHTML = `
        <div class="message-avatar">${message.role === 'user' ? 'S' : 'AI'}</div>
        <div class="message-content">
            <div class="message-role">${message.role === 'user' ? 'You' : 'Assistant'}</div>
            <div class="message-text">${message.content}</div>
        </div>
    `;
    
    chatThread.appendChild(messageEl);
    
    // Scroll to bottom
    chatThread.scrollTop = chatThread.scrollHeight;
}

function clearChatThread() {
    chatThread.innerHTML = '';
}

function loadChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChatId = chatId;
    updateChatTitle(chat.title);
    clearChatThread();
    
    // Load all messages
    chat.messages.forEach(message => {
        appendMessageToThread(message);
    });
    
    updateChatHistoryDisplay();
}

function updateChatHistoryDisplay() {
    chatHistory.innerHTML = '';
    
    chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = `chat-history-item ${chat.id === currentChatId ? 'active' : ''}`;
        item.innerHTML = `
            <div class="chat-history-title">${chat.title}</div>
            <div class="chat-history-preview">${chat.preview}</div>
            <div class="chat-history-time">${formatTime(chat.createdAt)}</div>
        `;
        item.addEventListener('click', () => loadChat(chat.id));
        chatHistory.appendChild(item);
    });
}

function updateChatTitle(title) {
    chatTitle.textContent = title;
}

function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

// ============================================
// CHAT INPUT HANDLERS
// ============================================

function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message || !currentChatId) return;
    
    // Add user message
    addMessageToChat(currentChatId, 'user', message);
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateResponse(message);
        addMessageToChat(currentChatId, 'assistant', response);
    }, 800);
}

// Auto-resize chat input
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
});

// Handle Enter key in chat input
chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
});

// Chat send button
chatSendBtn.addEventListener('click', sendChatMessage);

// ============================================
// PANEL CONTROLS
// ============================================

// Back to hero view
backToHeroBtn.addEventListener('click', transitionToHeroView);

// New chat
newChatBtn.addEventListener('click', () => {
    chatInput.focus();
});

// Toggle right panel
rightPanelToggle.addEventListener('click', () => {
    chatView.classList.toggle('show-right-panel');
});

closeRightPanel.addEventListener('click', () => {
    chatView.classList.remove('show-right-panel');
});

// ============================================
// HERO VIEW HANDLERS (existing)
// ============================================

// Generate mock response based on message
function generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('critical notification')) {
        return `
            <h3 style="margin-bottom: var(--space-3); color: var(--color-gray-900);">Critical Notifications (3)</h3>
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                <div style="padding: var(--space-3); background: var(--color-gray-50); border-left: 3px solid var(--color-gray-800); border-radius: var(--radius-md);">
                    <strong style="color: var(--color-gray-900);">Board Meeting Approval Required</strong>
                    <p style="margin-top: var(--space-1); color: var(--color-gray-600); font-size: var(--text-sm);">Q4 Financial report needs approval before January 25th</p>
                </div>
                <div style="padding: var(--space-3); background: var(--color-gray-50); border-left: 3px solid var(--color-gray-800); border-radius: var(--radius-md);">
                    <strong style="color: var(--color-gray-900);">Compliance Deadline Approaching</strong>
                    <p style="margin-top: var(--space-1); color: var(--color-gray-600); font-size: var(--text-sm);">Annual compliance filing due in 5 days</p>
                </div>
                <div style="padding: var(--space-3); background: var(--color-gray-50); border-left: 3px solid var(--color-gray-800); border-radius: var(--radius-md);">
                    <strong style="color: var(--color-gray-900);">Director Signature Needed</strong>
                    <p style="margin-top: var(--space-1); color: var(--color-gray-600); font-size: var(--text-sm);">3 documents awaiting your signature</p>
                </div>
            </div>
        `;
    } else if (lowerMessage.includes('updated chat')) {
        return `
            <h3 style="margin-bottom: var(--space-3); color: var(--color-gray-900);">Updated Chats (7)</h3>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                <div style="padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-md); border: 1px solid var(--color-gray-200);">
                    <strong style="color: var(--color-gray-900);">Board Members Group</strong> <span style="color: var(--color-gray-500); font-size: var(--text-sm);">• 12 new messages</span>
                </div>
                <div style="padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-md); border: 1px solid var(--color-gray-200);">
                    <strong style="color: var(--color-gray-900);">Legal Team</strong> <span style="color: var(--color-gray-500); font-size: var(--text-sm);">• 5 new messages</span>
                </div>
                <div style="padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-md); border: 1px solid var(--color-gray-200);">
                    <strong style="color: var(--color-gray-900);">Finance Committee</strong> <span style="color: var(--color-gray-500); font-size: var(--text-sm);">• 3 new messages</span>
                </div>
                <div style="padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-md); border: 1px solid var(--color-gray-200);">
                    <strong style="color: var(--color-gray-900);">Audit Team</strong> <span style="color: var(--color-gray-500); font-size: var(--text-sm);">• 2 new messages</span>
                </div>
            </div>
        `;
    } else if (lowerMessage.includes('appoint') && lowerMessage.includes('director')) {
        return `
            <h3 style="margin-bottom: var(--space-3); color: var(--color-gray-900);">Appointing a Director</h3>
            <p style="margin-bottom: var(--space-4); line-height: var(--leading-normal); color: var(--color-gray-700);">Here's what you need to appoint a new director:</p>
            <ol style="padding-left: var(--space-6); line-height: var(--leading-relaxed); color: var(--color-gray-700);">
                <li style="margin-bottom: var(--space-2);"><strong style="color: var(--color-gray-900);">Board Resolution:</strong> Draft and approve a board resolution for the appointment</li>
                <li style="margin-bottom: var(--space-2);"><strong style="color: var(--color-gray-900);">Consent to Act:</strong> Obtain signed consent from the director candidate</li>
                <li style="margin-bottom: var(--space-2);"><strong style="color: var(--color-gray-900);">Conflict of Interest Declaration:</strong> Complete the COI form</li>
                <li style="margin-bottom: var(--space-2);"><strong style="color: var(--color-gray-900);">Identity Verification:</strong> Provide government-issued ID and proof of address</li>
                <li style="margin-bottom: var(--space-2);"><strong style="color: var(--color-gray-900);">File with Registry:</strong> Submit forms to the corporate registry within 15 days</li>
            </ol>
            <p style="margin-top: var(--space-4); padding: var(--space-3); background: var(--color-gray-100); border-radius: var(--radius-md); color: var(--color-gray-800); border: 1px solid var(--color-gray-200);">
                💡 I can help you prepare these documents. Would you like to start the process?
            </p>
        `;
    } else if (lowerMessage.includes('open') && lowerMessage.includes('application')) {
        return `
            <h3 style="margin-bottom: var(--space-3); color: var(--color-gray-900);">Recent Applications</h3>
            <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-4);">
                <div style="padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-md); cursor: pointer; border: 1px solid var(--color-gray-200);" onmouseover="this.style.background='var(--color-gray-100)'" onmouseout="this.style.background='var(--color-gray-50)'">
                    <strong style="color: var(--color-gray-900);">Director Appointment - John Smith</strong>
                    <p style="margin-top: var(--space-1); color: var(--color-gray-600); font-size: var(--text-sm);">Status: In Progress • Updated 2 days ago</p>
                </div>
                <div style="padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-md); cursor: pointer; border: 1px solid var(--color-gray-200);" onmouseover="this.style.background='var(--color-gray-100)'" onmouseout="this.style.background='var(--color-gray-50)'">
                    <strong style="color: var(--color-gray-900);">Annual Return Filing 2025</strong>
                    <p style="margin-top: var(--space-1); color: var(--color-gray-600); font-size: var(--text-sm);">Status: Pending Review • Updated 1 week ago</p>
                </div>
            </div>
            <button style="padding: var(--space-2) var(--space-4); background: var(--color-gray-800); color: var(--color-white); border: 1px solid var(--color-gray-800); border-radius: var(--radius-md); cursor: pointer; font-weight: 500; font-size: var(--text-sm);">
                + Start New Application
            </button>
        `;
    } else {
        return `
            <p style="color: var(--color-gray-700);">I understand you're asking about: "<em>${message}</em>"</p>
            <p style="margin-top: var(--space-3); line-height: var(--leading-normal); color: var(--color-gray-700);">
                I'm here to help you with board governance, compliance, document management, and administrative tasks. 
                You can ask me about critical notifications, chat updates, director appointments, applications, or any other governance matters.
            </p>
            <p style="margin-top: var(--space-3); padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-md); color: var(--color-gray-700); border: 1px solid var(--color-gray-200);">
                💡 Try clicking one of the quick action buttons above, or ask me something specific about your board or organization.
            </p>
        `;
    }
}

// Add some visual feedback on button clicks
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});

// ============================================
// LOADING ANIMATION STYLES
// ============================================

// Add loading animation style once
if (!document.getElementById('loading-style')) {
    const style = document.createElement('style');
    style.id = 'loading-style';
    style.textContent = `
        .loading {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            color: var(--color-gray-500);
            font-style: italic;
        }
        .loading::after {
            content: '';
            width: 20px;
            height: 20px;
            border: 2px solid var(--color-gray-200);
            border-top-color: var(--color-gray-800);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}
