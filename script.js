// ============================================
// STATE MANAGEMENT
// ============================================

let currentView = 'hero'; // 'hero' or 'chat'
let chats = []; // Array of all chat sessions
let currentChatId = null;
let messageCounter = 0;
let chatSortMode = 'recent_updates'; // 'most_recent' or 'recent_updates'

// Process tracking state
let processRunning = false;
let processPaused = false;
let currentAppointment = null; // Stores current appointment details
let processSteps = []; // Stores current workflow steps with statuses

// Panel navigation state
let currentPanelType = null; // 'appointment', 'process', 'completion', 'document'
let currentDocumentId = null;

// ============================================
// HERO VIEW ELEMENTS
// ============================================

const heroView = document.getElementById('heroView');
const promptInput = document.getElementById('promptInput');
const sendBtn = document.getElementById('sendBtn');
const responseArea = document.getElementById('responseArea');
const responseContent = document.getElementById('responseContent');

// Quick action buttons (TEMPORARILY HIDDEN)
// const chatsBtn = document.getElementById('chatsBtn');
// const appointBtn = document.getElementById('appointBtn');
// const openAppBtn = document.getElementById('openAppBtn');
// const appDropdown = document.getElementById('appDropdown');

// Navigation rail buttons
const navHome = document.getElementById('navHome');
const navConsole = document.getElementById('navConsole');

// Top header
const topHeader = document.getElementById('topHeader');

// What Can I Do
const whatCanIDoBtn = document.getElementById('whatCanIDoBtn');
const assistCapabilities = document.getElementById('assistCapabilities');
const closeCapabilitiesBtn = document.getElementById('closeCapabilitiesBtn');

// View All Chats Link
const viewAllChatsLink = document.getElementById('viewAllChatsLink');

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
// rightPanelToggle removed - replaced by dynamic header actions
const closeRightPanel = document.getElementById('closeRightPanel');

// Auto-resize textarea as user types
if (promptInput) {
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
}

// Send button click
if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
}

// Suggestion chips
document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', function() {
        if (promptInput) {
            promptInput.value = this.textContent;
            promptInput.focus();
            sendMessage();
        }
    });
});

// Quick action button handlers (TEMPORARILY HIDDEN)
/*
chatsBtn.addEventListener('click', function() {
    // Transition to chat view showing recent chats
    transitionToChatView();
});

appointBtn.addEventListener('click', function() {
    setPromptAndSend('Appoint a Director');
});

openAppBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    // Toggle dropdown
    const isVisible = appDropdown.style.display === 'block';
    appDropdown.style.display = isVisible ? 'none' : 'block';
});

// App dropdown item handlers
document.querySelectorAll('.app-dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
        const appName = this.textContent;
        appDropdown.style.display = 'none';
        setPromptAndSend(`Open ${appName}`);
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (appDropdown && !openAppBtn.contains(e.target) && !appDropdown.contains(e.target)) {
        appDropdown.style.display = 'none';
    }
});
*/

// What Can I Do toggle
if (whatCanIDoBtn && assistCapabilities) {
    whatCanIDoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const isVisible = assistCapabilities.style.display === 'block';
        if (isVisible) {
            assistCapabilities.style.display = 'none';
        } else {
            assistCapabilities.style.display = 'block';
        }
    });
}

// Close capabilities button
if (closeCapabilitiesBtn && assistCapabilities) {
    closeCapabilitiesBtn.addEventListener('click', function() {
        assistCapabilities.style.display = 'none';
    });
}

// View All Chats link
if (viewAllChatsLink) {
    viewAllChatsLink.addEventListener('click', function(e) {
        e.preventDefault();
        transitionToChatView();
    });
}

// Alert items (Attention Needed)
document.querySelectorAll('.alert-item').forEach(item => {
    item.addEventListener('click', function() {
        transitionToChatView();
    });
});

// Recent chat items
document.querySelectorAll('.recent-chat-item').forEach(item => {
    item.addEventListener('click', function() {
        transitionToChatView();
    });
});

// Capability Try button
document.querySelectorAll('.capability-try-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const example = this.getAttribute('data-example');
        
        if (example) {
            // Hide capabilities and transition to chat view with the example prompt
            if (assistCapabilities) {
                assistCapabilities.style.display = 'none';
            }
            transitionToChatView(example);
        }
    });
});

// Navigation rail handlers
if (navHome) {
    navHome.addEventListener('click', function() {
        transitionToHeroView();
        updateNavRailActive('navHome');
    });
}

if (navConsole) {
    navConsole.addEventListener('click', function() {
        transitionToChatView();
        updateNavRailActive('navConsole');
    });
}

function updateNavRailActive(activeId) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-rail-item').forEach(item => {
        item.classList.remove('active');
    });
    // Add active class to selected item
    const activeElement = document.getElementById(activeId);
    if (activeElement) {
        activeElement.classList.add('active');
    }
}

// Helper function to set prompt and send (transitions to chat view)
function setPromptAndSend(message) {
    transitionToChatView(message);
}

// Send message function (from hero view - transitions to chat)
function sendMessage() {
    if (!promptInput) return;
    
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
    // Hide hero view and header
    heroView.style.display = 'none';
    topHeader.style.display = 'none';
    
    // Show chat view
    chatView.style.display = 'grid';
    currentView = 'chat';
    
    // Update navigation rail
    updateNavRailActive('navConsole');
    
    // If initial message provided, create new chat; otherwise just show chat history
    if (initialMessage) {
        createNewChat(initialMessage);
    } else if (chats.length > 0) {
        // Load the most recent chat
        loadChat(chats[0].id);
    } else {
        // No chats exist, create a welcome chat
        createNewChat();
    }
}

function transitionToHeroView() {
    // Show hero view and header
    heroView.style.display = 'flex';
    topHeader.style.display = 'flex';
    
    // Hide chat view
    chatView.style.display = 'none';
    currentView = 'hero';
    
    // Update navigation rail
    updateNavRailActive('navHome');
    
    // Clear response area
    responseArea.style.display = 'none';
}

// ============================================
// CHAT MANAGEMENT
// ============================================

function createNewChat(initialMessage) {
    // Hide any header actions from previous workflow
    updateChatHeaderActions(null);
    
    if (!initialMessage) {
        // No initial message, just show empty chat
        const chatId = 'chat-' + Date.now();
        currentChatId = chatId;
        
        const chat = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date(),
            preview: 'New conversation',
            hasUpdate: false,
            hasWorkflow: false,
            workflowType: null,
            lastUpdate: null
        };
        
        chats.unshift(chat);
        
        // Update UI
        updateChatHistoryDisplay();
        updateChatTitle(chat.title);
        clearChatThread();
        
        // Focus the chat input
        chatInput.focus();
        return;
    }
    
    const chatId = 'chat-' + Date.now();
    currentChatId = chatId;
    
    const chat = {
        id: chatId,
        title: initialMessage.substring(0, 50) + (initialMessage.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        preview: initialMessage.substring(0, 60),
        hasUpdate: false,
        hasWorkflow: false,
        workflowType: null,
        lastUpdate: null
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

// Initialize mock chats for corporate governance
function initializeMockChats() {
    const now = new Date();
    
    const mockChats = [
        {
            id: 'mock-1',
            title: 'Director Appointment - Wei Chen',
            preview: 'Replace director David Chen at Pacific Polymer Logistics',
            createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            lastUpdate: new Date(now - 3 * 60 * 60 * 1000), // 3 hours ago
            hasUpdate: true,
            hasWorkflow: true,
            workflowType: 'Director Appointment',
            messages: []
        },
        {
            id: 'mock-2',
            title: 'Board Resolution Review',
            preview: 'Review the draft resolution for the Q1 strategic initiative',
            createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-3',
            title: 'Entity Formation - Delaware LLC',
            preview: 'Set up a new Delaware LLC for our real estate holdings',
            createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            lastUpdate: new Date(now - 1 * 60 * 60 * 1000), // 1 hour ago
            hasUpdate: true,
            hasWorkflow: true,
            workflowType: 'Entity Formation',
            messages: []
        },
        {
            id: 'mock-4',
            title: 'Corporate Governance Best Practices',
            preview: 'What are the latest ESG reporting requirements for public companies?',
            createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-5',
            title: 'Annual Compliance Filing - Singapore',
            preview: 'File annual return and financial statements for Pacific Polymer',
            createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            workflowType: 'Compliance Filing',
            messages: []
        },
        {
            id: 'mock-6',
            title: 'Board Meeting Preparation',
            preview: 'Help me prepare materials for next week\'s board meeting',
            createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000), // 12 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-7',
            title: 'Officer Appointment - CFO',
            preview: 'Appoint Sarah Martinez as Chief Financial Officer',
            createdAt: new Date(now - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            workflowType: 'Officer Appointment',
            messages: []
        },
        {
            id: 'mock-8',
            title: 'Fiduciary Duties Research',
            preview: 'Explain the fiduciary duties of directors under Delaware law',
            createdAt: new Date(now - 18 * 24 * 60 * 60 * 1000), // 18 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-9',
            title: 'Board Resolution - M&A Transaction',
            preview: 'Draft board resolution approving the acquisition of TechCorp',
            createdAt: new Date(now - 21 * 24 * 60 * 60 * 1000), // 21 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            workflowType: 'Board Resolution',
            messages: []
        },
        {
            id: 'mock-10',
            title: 'Insider Trading Policy Update',
            preview: 'Review our insider trading policy for compliance with new SEC rules',
            createdAt: new Date(now - 24 * 24 * 60 * 60 * 1000), // 24 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-11',
            title: 'Share Transfer - Private Sale',
            preview: 'Process share transfer between John Smith and ABC Holdings',
            createdAt: new Date(now - 27 * 24 * 60 * 60 * 1000), // 27 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            workflowType: 'Share Transfer',
            messages: []
        },
        {
            id: 'mock-12',
            title: 'D&O Insurance Research',
            preview: 'Compare D&O insurance options for our board coverage',
            createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        }
    ];
    
    chats = [...mockChats];
    
    // Initial display
    if (currentView === 'chat') {
        updateChatHistoryDisplay();
    }
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
    
    // Update last update time
    chat.lastUpdate = new Date();
    
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
    
    // Initialize form if present
    if (message.content.includes('appointDirectorForm')) {
        setTimeout(() => initializeAppointDirectorForm(), 100);
    }
    if (message.content.includes('addPersonForm')) {
        setTimeout(() => initializeAddPersonForm(), 100);
    }
    if (message.content.includes('replacementAppointeeSearchField')) {
        setTimeout(() => initializeReplacementAppointeeSearch(), 100);
    }
    
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
    
    // Sort chats based on selected mode
    let sortedChats = [...chats];
    if (chatSortMode === 'recent_updates') {
        sortedChats.sort((a, b) => {
            // Workflow in progress always on top
            if (a.hasWorkflow && !b.hasWorkflow) return -1;
            if (!a.hasWorkflow && b.hasWorkflow) return 1;
            
            // Then by recent updates
            if (a.hasUpdate && !b.hasUpdate) return -1;
            if (!a.hasUpdate && b.hasUpdate) return 1;
            
            // Then by last update time
            const aTime = a.lastUpdate || a.createdAt;
            const bTime = b.lastUpdate || b.createdAt;
            return bTime - aTime;
        });
    } else {
        // Most recent: sort by creation date
        sortedChats.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    sortedChats.forEach(chat => {
        const item = document.createElement('div');
        item.className = `chat-history-item ${chat.id === currentChatId ? 'active' : ''}`;
        
        // Build badges and tags HTML
        let badgesHTML = '';
        let workflowTagHTML = '';
        
        // Show workflow tag for any chat with a workflow type
        if (chat.workflowType) {
            workflowTagHTML = `<span class="workflow-type-tag">${chat.workflowType}</span>`;
        }
        
        // Show appropriate badge
        if (chat.hasWorkflow) {
            // In-progress workflow - pulsing dot
            badgesHTML = '<span class="chat-badge workflow-badge"><span class="workflow-pulse"></span></span>';
        } else if (chat.workflowType) {
            // Completed workflow - checkmark
            badgesHTML = `<span class="chat-badge completed-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </span>`;
        } else if (chat.hasUpdate) {
            // Regular update - static dot
            badgesHTML = '<span class="chat-badge update-badge"></span>';
        }
        
        item.innerHTML = `
            <div class="chat-history-header">
                <div class="chat-history-title">${chat.title}</div>
                ${badgesHTML}
            </div>
            ${workflowTagHTML}
            <div class="chat-history-preview">${chat.preview}</div>
            <div class="chat-history-time">${formatTime(chat.lastUpdate || chat.createdAt)}</div>
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
if (chatInput) {
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
}

// Chat send button
if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
}

// ============================================
// PANEL CONTROLS
// ============================================

// New chat
if (newChatBtn && chatInput) {
    newChatBtn.addEventListener('click', () => {
        chatInput.focus();
    });
}

// Chat sort control
const chatSortSelect = document.getElementById('chatSortSelect');
if (chatSortSelect) {
    chatSortSelect.addEventListener('change', (e) => {
        chatSortMode = e.target.value;
        updateChatHistoryDisplay();
    });
}

// Close right panel (toggle is now replaced by dynamic header actions)
if (closeRightPanel && chatView) {
    closeRightPanel.addEventListener('click', () => {
        chatView.classList.remove('show-right-panel');
    });
}

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
    } else if (lowerMessage.includes('replace') && lowerMessage.includes('director') && (lowerMessage.includes('david') || lowerMessage.includes('chen'))) {
        // Handle "Replace director David Chen" pattern with disambiguation
        return generateDirectorDisambiguation();
    } else if (lowerMessage.includes('appoint') && lowerMessage.includes('director')) {
        // Check if user is specifying replace or add
        if (lowerMessage.includes('replace')) {
            return generateAppointDirectorForm('replace');
        } else if (lowerMessage.includes('add')) {
            return generateAppointDirectorForm('add');
        } else {
            return generateAppointmentTypeSelection();
        }
    } else if ((lowerMessage.includes('replace') || lowerMessage.includes('add')) && (lowerMessage.includes('director') || lowerMessage.includes('board'))) {
        // Handle direct "replace a director" or "add a director" messages
        if (lowerMessage.includes('replace')) {
            return generateAppointDirectorForm('replace');
        } else if (lowerMessage.includes('add')) {
            return generateAppointDirectorForm('add');
        }
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
// HYBRID FORM: APPOINT DIRECTOR
// ============================================

// Mock data for search
const mockCompanies = [
    { 
        id: 'c1', 
        name: 'Acme Feedstock & Monomer, LLC', 
        location: 'Houston, Texas',
        country: 'USA',
        flag: '🇺🇸'
    },
    { 
        id: 'c2', 
        name: 'VitaPlast Solutions, Ltd.', 
        location: 'Cork',
        country: 'Ireland',
        flag: '🇮🇪'
    },
    { 
        id: 'c3', 
        name: 'DuraFlow Composites, Inc.', 
        location: 'Auburn Hills, Michigan',
        country: 'USA',
        flag: '🇺🇸'
    },
    { 
        id: 'c4', 
        name: 'Acme Circular Technologies B.V.', 
        location: 'Rotterdam',
        country: 'Netherlands',
        flag: '🇳🇱'
    },
    { 
        id: 'c5', 
        name: 'Pacific Polymer Logistics Pte. Ltd.', 
        location: 'Singapore',
        country: 'Singapore',
        flag: '🇸🇬'
    },
    { 
        id: 'c6', 
        name: 'Acme Advanced Materials Holdings, LLC', 
        location: 'Wilmington, Delaware',
        country: 'USA',
        flag: '🇺🇸'
    }
];

const mockPeople = [
    { id: 'p1', name: 'Wei "David" Chen', title: 'Vice President, Commercial Operations (APAC)', company: 'Pacific Polymer Logistics Pte. Ltd.' },
    { id: 'p2', name: 'Priya Nair', title: 'Regional Finance Director, APAC', company: 'Pacific Polymer Logistics Pte. Ltd.' },
    { id: 'p3', name: 'James "Jim" Sterling', title: 'Senior Director, Supply Chain & Logistics', company: 'Acme Feedstock & Monomer, LLC' },
    { id: 'p4', name: 'Elena Rossi', title: 'General Counsel, Asia Pacific', company: 'VitaPlast Solutions, Ltd.' },
    { id: 'p5', name: 'Lim Pei Shan', title: 'Director of Risk Management & Trade Compliance', company: 'Pacific Polymer Logistics Pte. Ltd.' },
    { id: 'p6', name: 'Kenji Tanaka', title: 'Head of Digital Transformation, APAC', company: 'Pacific Polymer Logistics Pte. Ltd.' },
    { id: 'p7', name: 'Siti Nurhaliza', title: 'Human Resources Director, APAC', company: 'Pacific Polymer Logistics Pte. Ltd.' },
    { id: 'p8', name: 'Michael O\'Connell', title: 'Plant Manager - Jurong Island Compounding Facility', company: 'Pacific Polymer Logistics Pte. Ltd.' },
    { id: 'p9', name: 'David Chenney', title: 'Vice President, Manufacturing Operations', company: 'DuraFlow Composites, Inc.' }
];

// Use same dataset for both directors and appointees
const mockDirectors = mockPeople;
const mockAppointees = mockPeople;

function generateAppointmentTypeSelection() {
    return `
        <h3 style="margin-bottom: var(--space-3); color: var(--color-gray-900);">Appoint a Director</h3>
        <p style="margin-bottom: var(--space-5); line-height: var(--leading-normal); color: var(--color-gray-700);">
            Are you replacing an existing director or adding a new director to the board?
        </p>
        
        <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-4);">
            <button 
                class="appointment-type-btn" 
                onclick="selectAppointmentType('replace')"
                style="padding: var(--space-4); background: var(--color-white); border: 2px solid var(--color-gray-300); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s ease; text-align: left;"
                onmouseover="this.style.background='var(--color-gray-50)'; this.style.borderColor='var(--color-gray-400)';"
                onmouseout="this.style.background='var(--color-white)'; this.style.borderColor='var(--color-gray-300)';"
            >
                <div style="font-weight: 600; font-size: var(--text-base); color: var(--color-gray-900); margin-bottom: var(--space-1);">
                    Replace an Existing Director
                </div>
                <div style="font-size: var(--text-sm); color: var(--color-gray-600);">
                    Appoint a new director to replace someone who is resigning or being removed
                </div>
            </button>
            
            <button 
                class="appointment-type-btn" 
                onclick="selectAppointmentType('add')"
                style="padding: var(--space-4); background: var(--color-white); border: 2px solid var(--color-gray-300); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s ease; text-align: left;"
                onmouseover="this.style.background='var(--color-gray-50)'; this.style.borderColor='var(--color-gray-400)';"
                onmouseout="this.style.background='var(--color-white)'; this.style.borderColor='var(--color-gray-300)';"
            >
                <div style="font-weight: 600; font-size: var(--text-base); color: var(--color-gray-900); margin-bottom: var(--space-1);">
                    Add a New Director
                </div>
                <div style="font-size: var(--text-sm); color: var(--color-gray-600);">
                    Expand the board by appointing an additional director
                </div>
            </button>
        </div>
        
        <div style="padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-md); border: 1px solid var(--color-gray-200);">
            <p style="font-size: var(--text-xs); color: var(--color-gray-600); line-height: var(--leading-normal);">
                💡 You can also type "replace a director" or "add a director" to make your selection.
            </p>
        </div>
    `;
}

function selectAppointmentType(type) {
    if (!currentChatId) return;
    
    const typeText = type === 'replace' ? 'Replace an existing director' : 'Add a new director';
    
    // Add user's selection as a message
    addMessageToChat(currentChatId, 'user', typeText);
    
    // Show the appropriate form
    setTimeout(() => {
        const response = generateAppointDirectorForm(type);
        addMessageToChat(currentChatId, 'assistant', response);
    }, 400);
}

function showAddPersonForm(appointmentType) {
    if (!currentChatId) return;
    
    // Store current form state before switching to add person form
    const companyId = document.getElementById('selectedCompanyId')?.value || '';
    const directorId = document.getElementById('selectedDirectorId')?.value || '';
    
    window.tempAppointmentFormState = {
        appointmentType: appointmentType,
        companyId: companyId,
        directorId: directorId
    };
    
    // Add user message
    addMessageToChat(currentChatId, 'user', 'I need to add a new appointee');
    
    // Show add person form
    setTimeout(() => {
        const response = generateAddPersonForm();
        addMessageToChat(currentChatId, 'assistant', response);
    }, 400);
}

function generateAddPersonForm() {
    return `
        <h3 style="margin-bottom: var(--space-3); color: var(--color-gray-900);">Add New Person to Entities</h3>
        <p style="margin-bottom: var(--space-5); line-height: var(--leading-normal); color: var(--color-gray-700);">
            This person will be added to the Entities system and available for future appointments.
        </p>
        
        <form id="addPersonForm" class="hybrid-form">
            <!-- First Name -->
            <div class="form-field">
                <label class="form-label">First Name <span style="color: #dc2626;">*</span></label>
                <input 
                    type="text" 
                    id="personFirstName" 
                    class="search-input"
                    placeholder="Enter first name..."
                    autocomplete="off"
                    required
                />
            </div>

            <!-- Last Name -->
            <div class="form-field">
                <label class="form-label">Last Name <span style="color: #dc2626;">*</span></label>
                <input 
                    type="text" 
                    id="personLastName" 
                    class="search-input"
                    placeholder="Enter last name..."
                    autocomplete="off"
                    required
                />
            </div>

            <!-- Title -->
            <div class="form-field">
                <label class="form-label">Title <span style="color: #dc2626;">*</span></label>
                <input 
                    type="text" 
                    id="personTitle" 
                    class="search-input"
                    placeholder="e.g., Chief Financial Officer"
                    autocomplete="off"
                    required
                />
            </div>

            <!-- Company -->
            <div class="form-field">
                <label class="form-label">Company <span style="color: #dc2626;">*</span></label>
                <div class="search-field-wrapper">
                    <input 
                        type="text" 
                        id="personCompanySearch" 
                        class="search-input"
                        placeholder="Search for company..."
                        autocomplete="off"
                    />
                    <div class="search-results" id="personCompanyResults"></div>
                    <input type="hidden" id="selectedPersonCompanyId" />
                </div>
                <div class="selected-item" id="selectedPersonCompany" style="display: none;"></div>
            </div>

            <!-- Email -->
            <div class="form-field">
                <label class="form-label">Email <span style="color: #dc2626;">*</span></label>
                <input 
                    type="email" 
                    id="personEmail" 
                    class="search-input"
                    placeholder="email@example.com"
                    autocomplete="off"
                    required
                />
            </div>

            <div class="form-actions">
                <button type="button" class="form-btn-secondary" id="cancelAddPersonBtn">Cancel</button>
                <button type="submit" class="form-btn-primary" id="submitAddPersonBtn" disabled>Add Person</button>
            </div>
        </form>
    `;
}

function generateAppointDirectorForm(appointmentType = 'replace', savedState = {}, newlyAddedPerson = null) {
    const isReplacement = appointmentType === 'replace';
    
    // Get pre-selected data
    const preSelectedCompany = savedState.companyId ? mockCompanies.find(c => c.id === savedState.companyId) : null;
    const preSelectedDirector = savedState.directorId ? mockDirectors.find(d => d.id === savedState.directorId) : null;
    const preSelectedAppointee = newlyAddedPerson;
    
    // Determine which fields should be enabled
    // For replacement: director is enabled by default, appointee after director selected
    // For add: company first, then appointee
    const directorEnabled = isReplacement; // Always enabled for replacement
    const appointeeEnabled = (isReplacement && preSelectedDirector) || (!isReplacement && preSelectedCompany);
    
    return `
        <h3 style="margin-bottom: var(--space-3); color: var(--color-gray-900);">
            ${isReplacement ? 'Replace a Director' : 'Add a New Director'}
        </h3>
        <p style="margin-bottom: var(--space-5); line-height: var(--leading-normal); color: var(--color-gray-700);">
            Let's start by identifying the key parties involved in this appointment.
        </p>
        
        <form id="appointDirectorForm" class="hybrid-form" data-appointment-type="${appointmentType}" data-saved-company="${savedState.companyId || ''}" data-saved-director="${savedState.directorId || ''}" data-newly-added="${newlyAddedPerson ? newlyAddedPerson.id : ''}">
            ${isReplacement ? `
            <!-- Hidden company field for replacement workflow -->
            <input type="hidden" id="selectedCompanyId" value="" />
            ` : ''}
            
            ${isReplacement ? `
            <!-- Director to Replace (shown first for replacement) -->
            <div class="form-field">
                <label class="form-label">Director to Replace</label>
                <div class="search-field-wrapper">
                    <input 
                        type="text" 
                        id="directorSearch" 
                        class="search-input"
                        placeholder="Search for director..."
                        autocomplete="off"
                        style="${preSelectedDirector ? 'display: none;' : ''}"
                    />
                    <div class="search-results" id="directorResults"></div>
                    <input type="hidden" id="selectedDirectorId" value="${preSelectedDirector ? preSelectedDirector.id : ''}" />
                </div>
                <div class="selected-item" id="selectedDirector" style="display: ${preSelectedDirector ? 'block' : 'none'};">
                    ${preSelectedDirector ? `
                        <div class="selected-chip">
                            <span>${preSelectedDirector.name}</span>
                            <button type="button" class="remove-chip" onclick="clearSelection('selectedDirector', 'directorSearch', 'directorResults')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            ` : `
            <!-- Company Search (only for add new director) -->
            <div class="form-field">
                <label class="form-label">Company</label>
                <div class="search-field-wrapper">
                    <input 
                        type="text" 
                        id="companySearch" 
                        class="search-input"
                        placeholder="Search for company..."
                        autocomplete="off"
                        style="${preSelectedCompany ? 'display: none;' : ''}"
                    />
                    <div class="search-results" id="companyResults"></div>
                    <input type="hidden" id="selectedCompanyId" value="${preSelectedCompany ? preSelectedCompany.id : ''}" />
                </div>
                <div class="selected-item" id="selectedCompany" style="display: ${preSelectedCompany ? 'block' : 'none'};">
                    ${preSelectedCompany ? `
                        <div class="selected-chip">
                            <span>${preSelectedCompany.flag} ${preSelectedCompany.name}</span>
                            <button type="button" class="remove-chip" onclick="clearSelection('selectedCompany', 'companySearch', 'companyResults')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            `}

            <!-- Appointee -->
            <div class="form-field">
                <label class="form-label">Appointee (New Director)</label>
                <div class="search-field-wrapper">
                    <input 
                        type="text" 
                        id="appointeeSearch" 
                        class="search-input"
                        placeholder="Search for appointee..."
                        autocomplete="off"
                        ${!appointeeEnabled ? 'disabled' : ''}
                        style="${preSelectedAppointee ? 'display: none;' : ''}"
                    />
                    <div class="search-results" id="appointeeResults"></div>
                    <input type="hidden" id="selectedAppointeeId" value="${preSelectedAppointee ? preSelectedAppointee.id : ''}" />
                </div>
                <div class="selected-item" id="selectedAppointee" style="display: ${preSelectedAppointee ? 'block' : 'none'};">
                    ${preSelectedAppointee ? `
                        <div class="selected-chip">
                            <span>${preSelectedAppointee.name}</span>
                            <button type="button" class="remove-chip" onclick="clearSelection('selectedAppointee', 'appointeeSearch', 'appointeeResults')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <a href="#" class="add-person-link" onclick="event.preventDefault(); showAddPersonForm('${appointmentType}');">
                    Need to add this appointee?
                </a>
            </div>

            <div class="form-actions">
                <button type="button" class="form-btn-secondary" id="cancelFormBtn">Cancel</button>
                <button type="submit" class="form-btn-primary" id="submitFormBtn" ${(isReplacement && preSelectedDirector && preSelectedAppointee) || (!isReplacement && preSelectedCompany && preSelectedAppointee) ? '' : 'disabled'}>Continue</button>
            </div>
        </form>
    `;
}

function initializeAppointDirectorForm() {
    const companySearch = document.getElementById('companySearch');
    const directorSearch = document.getElementById('directorSearch');
    const appointeeSearch = document.getElementById('appointeeSearch');
    const form = document.getElementById('appointDirectorForm');
    const submitBtn = document.getElementById('submitFormBtn');
    
    if (!form) return;
    
    const appointmentType = form.getAttribute('data-appointment-type');
    const isReplacement = appointmentType === 'replace';
    const savedCompanyId = form.getAttribute('data-saved-company');
    const savedDirectorId = form.getAttribute('data-saved-director');
    const newlyAddedId = form.getAttribute('data-newly-added');

    // Company search (only for "add" workflow)
    if (!isReplacement && companySearch) {
        setupSearchField(
            companySearch,
            document.getElementById('companyResults'),
            mockCompanies,
            (item) => `
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <span style="font-size: var(--text-lg);">${item.flag}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: 500; color: var(--color-gray-900);">${item.name}</div>
                        <div style="font-size: var(--text-xs); color: var(--color-gray-500);">${item.location}, ${item.country}</div>
                    </div>
                </div>
            `,
            (item) => {
                document.getElementById('selectedCompanyId').value = item.id;
                showSelectedItem('selectedCompany', `${item.flag} ${item.name}`, 'companySearch', 'companyResults');
                
                // Enable appointee search
                if (appointeeSearch) {
                    appointeeSearch.disabled = false;
                    appointeeSearch.focus();
                }
                checkFormCompletion();
            }
        );
    }

    // Director search (only for replacement workflow)
    if (isReplacement && directorSearch) {
        setupSearchField(
            directorSearch,
            document.getElementById('directorResults'),
            mockDirectors,
            (item) => `
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <div style="font-weight: 500; color: var(--color-gray-900);">${item.name}</div>
                    <div style="font-size: var(--text-xs); color: var(--color-gray-500);">${item.title}</div>
                    ${item.company ? `<div style="font-size: var(--text-xs); color: var(--color-gray-400);">${item.company}</div>` : ''}
                </div>
            `,
            (item) => {
                document.getElementById('selectedDirectorId').value = item.id;
                showSelectedItem('selectedDirector', item.name, 'directorSearch', 'directorResults');
                // Enable appointee search
                if (appointeeSearch) {
                    appointeeSearch.disabled = false;
                    appointeeSearch.focus();
                }
                checkFormCompletion();
            }
        );
    }

    // Appointee search
    setupSearchField(
        appointeeSearch,
        document.getElementById('appointeeResults'),
        mockAppointees,
        (item) => `
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <div style="font-weight: 500; color: var(--color-gray-900);">${item.name}</div>
                <div style="font-size: var(--text-xs); color: var(--color-gray-500);">${item.title}</div>
            </div>
        `,
        (item) => {
            document.getElementById('selectedAppointeeId').value = item.id;
            showSelectedItem('selectedAppointee', item.name, 'appointeeSearch', 'appointeeResults');
            checkFormCompletion();
        }
    );

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAppointDirectorFormSubmit();
    });

    // Cancel button
    document.getElementById('cancelFormBtn').addEventListener('click', () => {
        if (currentChatId) {
            addMessageToChat(currentChatId, 'assistant', 'No problem. Let me know if you need help with anything else.');
        }
    });

    function checkFormCompletion() {
        const appointeeId = document.getElementById('selectedAppointeeId').value;
        
        if (isReplacement) {
            const directorId = document.getElementById('selectedDirectorId').value;
            submitBtn.disabled = !(directorId && appointeeId);
        } else {
            const companyId = document.getElementById('selectedCompanyId').value;
            submitBtn.disabled = !(companyId && appointeeId);
        }
    }
}

function setupSearchField(input, resultsDiv, data, formatItem, onSelect) {
    input.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length === 0) {
            resultsDiv.innerHTML = '';
            resultsDiv.style.display = 'none';
            return;
        }

        const filtered = data.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(query);
            const locationMatch = item.location && item.location.toLowerCase().includes(query);
            const countryMatch = item.country && item.country.toLowerCase().includes(query);
            const titleMatch = item.title && item.title.toLowerCase().includes(query);
            return nameMatch || locationMatch || countryMatch || titleMatch;
        });

        if (filtered.length === 0) {
            resultsDiv.innerHTML = '<div class="search-result-item no-results">No results found</div>';
            resultsDiv.style.display = 'block';
            return;
        }

        resultsDiv.innerHTML = filtered.map(item => 
            `<div class="search-result-item" data-id="${item.id}">${formatItem(item)}</div>`
        ).join('');
        resultsDiv.style.display = 'block';

        // Add click handlers
        resultsDiv.querySelectorAll('.search-result-item:not(.no-results)').forEach(el => {
            el.addEventListener('click', () => {
                const itemId = el.getAttribute('data-id');
                const item = data.find(d => d.id === itemId);
                if (item) {
                    onSelect(item);
                }
            });
        });
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !resultsDiv.contains(e.target)) {
            resultsDiv.style.display = 'none';
        }
    });
}

function showSelectedItem(containerId, text, inputId, resultsId) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    const results = document.getElementById(resultsId);
    
    container.innerHTML = `
        <div class="selected-chip">
            <span>${text}</span>
            <button type="button" class="remove-chip" onclick="clearSelection('${containerId}', '${inputId}', '${resultsId}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;
    container.style.display = 'block';
    input.style.display = 'none';
    results.style.display = 'none';
}

function clearSelection(containerId, inputId, resultsId) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    
    if (!container || !input) return;
    
    container.style.display = 'none';
    input.style.display = 'block';
    input.value = '';
    
    // Clear hidden input (convert selectedCompany -> selectedCompanyId)
    const hiddenInputId = containerId + 'Id';
    const hiddenInput = document.getElementById(hiddenInputId);
    if (hiddenInput) hiddenInput.value = '';
    
    // Only focus if not recursively clearing
    const isRecursive = !event || event.isTrusted === false;
    if (!isRecursive) {
        input.focus();
    }
    
    // Disable subsequent fields if clearing early fields
    const directorSearch = document.getElementById('directorSearch');
    const appointeeSearch = document.getElementById('appointeeSearch');
    
    if (inputId === 'companySearch') {
        if (directorSearch) {
            directorSearch.disabled = true;
            clearSelection('selectedDirector', 'directorSearch', 'directorResults');
        }
        if (appointeeSearch) {
            appointeeSearch.disabled = true;
            clearSelection('selectedAppointee', 'appointeeSearch', 'appointeeResults');
        }
    } else if (inputId === 'directorSearch') {
        if (appointeeSearch) {
            appointeeSearch.disabled = true;
            clearSelection('selectedAppointee', 'appointeeSearch', 'appointeeResults');
        }
    }
    
    // Update form state
    const submitBtn = document.getElementById('submitFormBtn');
    if (submitBtn) submitBtn.disabled = true;
}

function initializeAddPersonForm() {
    const personCompanySearch = document.getElementById('personCompanySearch');
    const firstName = document.getElementById('personFirstName');
    const lastName = document.getElementById('personLastName');
    const title = document.getElementById('personTitle');
    const email = document.getElementById('personEmail');
    const form = document.getElementById('addPersonForm');
    const submitBtn = document.getElementById('submitAddPersonBtn');
    
    if (!personCompanySearch || !form) return;

    // Company search for add person form
    setupSearchField(
        personCompanySearch,
        document.getElementById('personCompanyResults'),
        mockCompanies,
        (item) => `
            <div style="display: flex; align-items: center; gap: var(--space-2);">
                <span style="font-size: var(--text-lg);">${item.flag}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: var(--color-gray-900);">${item.name}</div>
                    <div style="font-size: var(--text-xs); color: var(--color-gray-500);">${item.location}, ${item.country}</div>
                </div>
            </div>
        `,
        (item) => {
            document.getElementById('selectedPersonCompanyId').value = item.id;
            showSelectedItem('selectedPersonCompany', `${item.flag} ${item.name}`, 'personCompanySearch', 'personCompanyResults');
            checkAddPersonFormCompletion();
        }
    );

    // Add input listeners to check form completion
    [firstName, lastName, title, email].forEach(input => {
        if (input) {
            input.addEventListener('input', checkAddPersonFormCompletion);
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAddPersonFormSubmit();
    });

    // Cancel button
    document.getElementById('cancelAddPersonBtn').addEventListener('click', () => {
        // Return to appointment form with previous state
        returnToAppointmentForm();
    });

    function checkAddPersonFormCompletion() {
        const companyId = document.getElementById('selectedPersonCompanyId').value;
        const firstNameVal = firstName.value.trim();
        const lastNameVal = lastName.value.trim();
        const titleVal = title.value.trim();
        const emailVal = email.value.trim();
        
        submitBtn.disabled = !(companyId && firstNameVal && lastNameVal && titleVal && emailVal);
    }
}

function handleAddPersonFormSubmit() {
    const firstName = document.getElementById('personFirstName').value.trim();
    const lastName = document.getElementById('personLastName').value.trim();
    const title = document.getElementById('personTitle').value.trim();
    const email = document.getElementById('personEmail').value.trim();
    const companyId = document.getElementById('selectedPersonCompanyId').value;
    
    const company = mockCompanies.find(c => c.id === companyId);
    
    if (!firstName || !lastName || !title || !email || !company) return;
    
    // Generate new person ID
    const newId = 'p' + (mockPeople.length + 1);
    
    // Create full name (handle nicknames/quotes if any)
    const fullName = `${firstName} ${lastName}`;
    
    // Create new person object
    const newPerson = {
        id: newId,
        name: fullName,
        title: title,
        email: email,
        company: company.name
    };
    
    // Add to mockPeople array
    mockPeople.push(newPerson);
    
    // Add user message
    if (currentChatId) {
        addMessageToChat(currentChatId, 'user', `Added ${fullName} to the Entities system`);
        
        // Show success message
        setTimeout(() => {
            addMessageToChat(currentChatId, 'assistant', 
                `Great! I've added <strong>${fullName}</strong> (${title}) to the Entities system. Now let's complete the appointment.`
            );
            
            // Return to appointment form with the new person selected
            setTimeout(() => {
                returnToAppointmentForm(newPerson);
            }, 600);
        }, 400);
    }
}

function returnToAppointmentForm(newlyAddedPerson = null) {
    const savedState = window.tempAppointmentFormState || {};
    const appointmentType = savedState.appointmentType || 'replace';
    
    // Show the appointment form again
    const response = generateAppointDirectorForm(appointmentType, savedState, newlyAddedPerson);
    
    if (currentChatId) {
        addMessageToChat(currentChatId, 'assistant', response);
    }
}

function handleAppointDirectorFormSubmit() {
    const form = document.getElementById('appointDirectorForm');
    const appointmentType = form.getAttribute('data-appointment-type');
    const isReplacement = appointmentType === 'replace';
    
    const appointeeId = document.getElementById('selectedAppointeeId').value;
    const appointee = mockAppointees.find(a => a.id === appointeeId);
    
    let director = null;
    let company = null;
    
    if (isReplacement) {
        const directorId = document.getElementById('selectedDirectorId').value;
        director = mockDirectors.find(d => d.id === directorId);
        if (!director) return;
        
        // Derive company from director's company property or default to Pacific Polymer Logistics
        if (director.company) {
            company = mockCompanies.find(c => c.name === director.company);
        }
        // Default to Pacific Polymer Logistics if no company found
        if (!company) {
            company = mockCompanies[4]; // Pacific Polymer Logistics Pte. Ltd.
        }
    } else {
        const companyId = document.getElementById('selectedCompanyId').value;
        company = mockCompanies.find(c => c.id === companyId);
    }
    
    if (!company || !appointee) return;
    
    // Store selection for later use
    window.selectedAppointment = { 
        company, 
        director: director, 
        appointee,
        isReplacement 
    };
    
    // Create summary message from user
    let userSummary;
    if (isReplacement) {
        userSummary = `I've selected ${company.name}, replacing ${director.name} with ${appointee.name}`;
    } else {
        userSummary = `I've selected ${company.name}, adding ${appointee.name} to the board`;
    }
    
    if (currentChatId) {
        addMessageToChat(currentChatId, 'user', userSummary);
        
        // Simulate AI response acknowledging the selection
        setTimeout(() => {
            const response = `
                <div>
                    <p style="margin-bottom: var(--space-3);">Perfect. I'm preparing the appointment workflow for ${company.name}.</p>
                    <button class="preview-panel-btn" onclick="openAppointmentPanel()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--space-1);">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="3" x2="9" y2="21"></line>
                        </svg>
                        Preview Appointment Details
                    </button>
                </div>
            `;
            addMessageToChat(currentChatId, 'assistant', response);
            
            // Open right panel with appointment details
            openAppointmentPanel();
        }, 400);
    }
}

function openAppointmentPanel() {
    // Reset workflow state
    window.appointmentWorkflowState = {
        approversSelected: false,
        documentsReviewed: false,
        selectedApprovers: []
    };
    
    // Show the right panel
    chatView.classList.add('show-right-panel');
    
    // Set panel type
    currentPanelType = 'appointment';
    
    // Update panel title
    const { isReplacement } = window.selectedAppointment || {};
    document.querySelector('.right-panel-title').textContent = isReplacement ? 'Replace Director' : 'Add Director';
    
    // Populate the panel content
    const panelContent = document.querySelector('.right-panel-content');
    panelContent.innerHTML = generateAppointmentPanelContent();
    
    // Show Preview button in header
    updateChatHeaderActions('preview');
    
    // Initialize panel interactions
    setTimeout(() => initializeAppointmentPanel(), 100);
}

// Update chat header actions based on workflow state
function updateChatHeaderActions(state) {
    const actionsContainer = document.getElementById('chatHeaderActions');
    if (!actionsContainer) return;
    
    if (state === 'preview') {
        // Show Preview button
        actionsContainer.innerHTML = `
            <button class="header-preview-btn" onclick="reopenPreviewPanel()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--space-1);">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
                Preview
            </button>
        `;
        actionsContainer.style.display = 'flex';
    } else if (state === 'preview-ready') {
        // Show Preview button with Ready tag
        actionsContainer.innerHTML = `
            <button class="header-preview-btn" onclick="reopenPreviewPanel()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--space-1);">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
                Preview
            </button>
            <span class="workflow-ready-tag">Ready</span>
        `;
        actionsContainer.style.display = 'flex';
    } else if (state === 'process-running') {
        // Show View Status button with Running indicator
        actionsContainer.innerHTML = `
            <button class="header-status-btn" onclick="reopenStatusPanel()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--space-1);">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
                View Status
            </button>
            <span class="workflow-running-tag">
                <span class="running-dot"></span>
                Running
            </span>
        `;
        actionsContainer.style.display = 'flex';
    } else {
        // Hide header actions
        actionsContainer.style.display = 'none';
    }
}

// Reopen preview panel
function reopenPreviewPanel() {
    // Show the right panel
    chatView.classList.add('show-right-panel');
    
    // If we're not already showing the appointment panel, regenerate it
    if (currentPanelType !== 'appointment') {
        currentPanelType = 'appointment';
        const { isReplacement } = window.selectedAppointment || {};
        document.querySelector('.right-panel-title').textContent = isReplacement ? 'Replace Director' : 'Add Director';
        const panelContent = document.querySelector('.right-panel-content');
        panelContent.innerHTML = generateAppointmentPanelContent();
    }
}

// Reopen status panel
function reopenStatusPanel() {
    if (currentPanelType === 'process' || currentPanelType === 'completion') {
        chatView.classList.add('show-right-panel');
    }
}

function generateAppointmentPanelContent() {
    const { company, director, appointee, isReplacement } = window.selectedAppointment || {};
    
    if (!company || !appointee) {
        return '<p>Error: Appointment data not found</p>';
    }
    
    // Initialize workflow state if not exists
    if (!window.appointmentWorkflowState) {
        window.appointmentWorkflowState = {
            approversSelected: false,
            documentsReviewed: false,
            selectedApprovers: []
        };
    }
    
    return `
        <div class="appointment-panel">
            <!-- Summary Section -->
            <section class="panel-section">
                <h4 class="panel-section-title">Appointment Summary</h4>
                
                <div class="summary-card">
                    <div class="summary-item">
                        <label class="summary-label">Company</label>
                        <div class="summary-value">${company.flag} ${company.name}</div>
                        <div class="summary-meta">Domiciled in ${company.location}, ${company.country}</div>
                    </div>
                    
                    ${isReplacement && director ? `
                    <div class="summary-divider"></div>
                    
                    <div class="summary-item">
                        <label class="summary-label">Resigning Director</label>
                        <div class="summary-value">${director.name}</div>
                        <div class="summary-meta">${director.title}</div>
                    </div>
                    ` : ''}
                    
                    <div class="summary-divider"></div>
                    
                    <div class="summary-item">
                        <label class="summary-label">${isReplacement ? 'Appointee' : 'New Director'}</label>
                        <div class="summary-value">${appointee.name}</div>
                        <div class="summary-meta">${appointee.title}</div>
                    </div>
                </div>
            </section>

            <!-- Approvers Section (placeholder) -->
            <section class="panel-section" id="approversSection">
                <h4 class="panel-section-title">Approvers</h4>
                <div class="empty-state" id="approversEmptyState" style="padding: var(--space-4); text-align: center; color: var(--color-gray-500); font-size: var(--text-sm);">
                    Awaiting approver selection...
                </div>
                <div class="approvers-list" id="approversList" style="display: none;"></div>
            </section>

            <!-- Documents Section (placeholder) -->
            <section class="panel-section" id="documentsSection">
                <h4 class="panel-section-title">Required Documents</h4>
                <div class="empty-state" id="documentsEmptyState" style="padding: var(--space-4); text-align: center; color: var(--color-gray-500); font-size: var(--text-sm);">
                    Awaiting document review...
                </div>
                <div class="document-list" id="documentsList" style="display: none;"></div>
            </section>

            <!-- Workflow Section -->
            <section class="panel-section">
                <h4 class="panel-section-title">Automated Workflow</h4>
                <p class="panel-description">
                    When you start the process, our concierge agent will coordinate the following steps:
                </p>
                
                <div class="workflow-steps">
                    <div class="workflow-step">
                        <div class="workflow-step-number">1</div>
                        <div class="workflow-step-content">
                            <div class="workflow-step-title">Board Approval</div>
                            <div class="workflow-step-description">
                                Submit Board Resolution to the <strong>Boards</strong> system for asynchronous approval by board members.
                            </div>
                        </div>
                    </div>
                    
                    <div class="workflow-step">
                        <div class="workflow-step-number">2</div>
                        <div class="workflow-step-content">
                            <div class="workflow-step-title">Email Regulatory Forms</div>
                            <div class="workflow-step-description">
                                Send Consent to Act and regulatory forms to <strong>${appointee.name}</strong> for signature. Monitor inbox for signed documents. You will need to file ${company.location === 'Singapore' ? '<strong>Form 45</strong>' : 'the required forms'} with the ${company.location}, ${company.country} regulatory agency after receiving signed documents.
                            </div>
                        </div>
                    </div>
                    
                    <div class="workflow-step">
                        <div class="workflow-step-number">3</div>
                        <div class="workflow-step-content">
                            <div class="workflow-step-title">Update Entity Records</div>
                            <div class="workflow-step-description">
                                Update <strong>Entities</strong> system to reflect ${isReplacement && director ? `${director.name}'s resignation and ` : ''}${appointee.name}'s appointment to the board.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Action Section -->
            <section class="panel-section panel-actions" id="panelActions">
                <button class="panel-btn-secondary" onclick="closeAppointmentPanel()">Cancel</button>
            </section>
        </div>
    `;
}

function initializeAppointmentPanel() {
    // Panel is already interactive via onclick handlers
    // After panel opens, prompt for approver selection
    setTimeout(() => {
        if (currentChatId) {
            addMessageToChat(currentChatId, 'assistant', generateApproverSelectionUI());
        }
    }, 500);
}

// Generate approver selection UI in chat
function generateApproverSelectionUI() {
    return `
        <h4 style="margin-bottom: var(--space-3); color: var(--color-gray-900);">Select Approvers</h4>
        <p style="margin-bottom: var(--space-4); line-height: var(--leading-normal); color: var(--color-gray-700);">
            Please select the board members who need to approve this director appointment:
        </p>
        
        <form id="approverSelectionForm" style="background: var(--color-gray-50); padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-3);">
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer;">
                    <input type="checkbox" name="approver" value="robert-johnson" data-name="Robert Johnson" data-initials="RJ" data-role="Board Chair" style="cursor: pointer;">
                    <span style="flex: 1; font-size: var(--text-sm); color: var(--color-gray-900);">
                        <strong>Robert Johnson</strong> &mdash; Board Chair
                    </span>
                </label>
                
                <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer;">
                    <input type="checkbox" name="approver" value="margaret-sullivan" data-name="Margaret Sullivan" data-initials="MS" data-role="Chief Executive Officer" style="cursor: pointer;">
                    <span style="flex: 1; font-size: var(--text-sm); color: var(--color-gray-900);">
                        <strong>Margaret Sullivan</strong> &mdash; Chief Executive Officer
                    </span>
                </label>
                
                <div style="display: flex; flex-direction: column; gap: var(--space-1);">
                    <label style="display: flex; align-items: center; gap: var(--space-2); cursor: not-allowed; opacity: 0.5;">
                        <input type="checkbox" name="approver" value="james-davidson" data-name="James Davidson" data-initials="JD" data-role="Lead Independent Director" disabled style="cursor: not-allowed;">
                        <span style="flex: 1; font-size: var(--text-sm); color: var(--color-gray-600);">
                            <strong>James Davidson</strong> &mdash; Lead Independent Director
                        </span>
                    </label>
                    <div style="margin-left: var(--space-6); font-size: var(--text-xs); color: var(--color-gray-500); font-style: italic;">
                        Missing a saved signature template
                    </div>
                </div>
                
                <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer;">
                    <input type="checkbox" name="approver" value="linda-williams" data-name="Linda Williams" data-initials="LW" data-role="Audit Committee Chair" style="cursor: pointer;">
                    <span style="flex: 1; font-size: var(--text-sm); color: var(--color-gray-900);">
                        <strong>Linda Williams</strong> &mdash; Audit Committee Chair
                    </span>
                </label>
                
                <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer;">
                    <input type="checkbox" name="approver" value="david-martinez" data-name="David Martinez" data-initials="DM" data-role="Compensation Committee Chair" style="cursor: pointer;">
                    <span style="flex: 1; font-size: var(--text-sm); color: var(--color-gray-900);">
                        <strong>David Martinez</strong> &mdash; Compensation Committee Chair
                    </span>
                </label>
            </div>
            
            <button type="button" class="panel-btn-primary" onclick="confirmApprovers()" style="margin-top: var(--space-4); width: 100%;">
                Confirm Approvers
            </button>
        </form>
    `;
}

// Handle approver confirmation
function confirmApprovers() {
    const form = document.getElementById('approverSelectionForm');
    if (!form) return;
    
    const checkboxes = form.querySelectorAll('input[name="approver"]:checked');
    const selectedApprovers = Array.from(checkboxes).map(cb => ({
        name: cb.dataset.name,
        initials: cb.dataset.initials,
        role: cb.dataset.role
    }));
    
    if (selectedApprovers.length === 0) {
        if (currentChatId) {
            addMessageToChat(currentChatId, 'assistant', 
                '<p style="color: var(--color-gray-700);">Please select at least one approver.</p>'
            );
        }
        return;
    }
    
    // Store selected approvers
    window.appointmentWorkflowState.selectedApprovers = selectedApprovers;
    
    // Add to preview panel
    addApproversToPanel(selectedApprovers);
    
    // Acknowledge in chat
    if (currentChatId) {
        const approverNames = selectedApprovers.map(a => a.name).join(', ');
        addMessageToChat(currentChatId, 'assistant', 
            `<p style="color: var(--color-gray-700); margin-bottom: var(--space-3);">
                <strong>${selectedApprovers.length} approver${selectedApprovers.length > 1 ? 's' : ''} confirmed:</strong> ${approverNames}
            </p>`
        );
        
        // Add documents to panel and prompt for review
        setTimeout(() => {
            addDocumentsToPanel();
            addMessageToChat(currentChatId, 'assistant', generateDocumentReviewUI());
        }, 500);
    }
}

// Generate document review UI in chat
function generateDocumentReviewUI() {
    const { company } = window.selectedAppointment || {};
    const regulatoryFormName = company && company.location === 'Singapore' ? 'Form 45' : 'Regulatory Filing Form';
    
    return `
        <h4 style="margin-bottom: var(--space-3); color: var(--color-gray-900);">Review Documents</h4>
        <p style="margin-bottom: var(--space-4); line-height: var(--leading-normal); color: var(--color-gray-700);">
            Please review the documents that will be used in this appointment process. These documents have been added to the preview panel on the right.
        </p>
        
        <div style="background: var(--color-gray-50); padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-3);">
            <ul style="list-style: none; padding: 0; margin: 0 0 var(--space-4) 0; display: flex; flex-direction: column; gap: var(--space-2);">
                <li style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-700);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span>Board Resolution</span>
                </li>
                <li style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-700);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span>Consent to Act as Director</span>
                </li>
                <li style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-700);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span>${regulatoryFormName}</span>
                </li>
            </ul>
            
            <button type="button" class="panel-btn-primary" onclick="confirmDocumentsReviewed()" style="width: 100%;">
                I've Reviewed the Documents
            </button>
        </div>
    `;
}

// Handle document review confirmation
function confirmDocumentsReviewed() {
    // Mark documents as reviewed
    window.appointmentWorkflowState.documentsReviewed = true;
    
    // Enable Start Process button if both conditions are met
    updateStartProcessButton();
    
    // Acknowledge in chat
    if (currentChatId) {
        addMessageToChat(currentChatId, 'assistant', 
            `<p style="color: var(--color-gray-700); margin-bottom: var(--space-3);">
                <strong>Documents confirmed.</strong> You're now ready to start the appointment process. Click "Start Process" in the preview panel when you're ready to proceed.
            </p>`
        );
    }
}

// New function to add approvers section to panel
function addApproversToPanel(approvers) {
    const emptyState = document.getElementById('approversEmptyState');
    const approversList = document.getElementById('approversList');
    if (!emptyState || !approversList) return;
    
    // Hide empty state
    emptyState.style.display = 'none';
    
    // Populate and show approvers list
    approversList.innerHTML = approvers.map(approver => `
        <div class="approver-item">
            <div class="approver-avatar">${approver.initials}</div>
            <div class="approver-info">
                <div class="approver-name">${approver.name}</div>
                <div class="approver-role">${approver.role}</div>
            </div>
        </div>
    `).join('');
    approversList.style.display = 'block';
    
    window.appointmentWorkflowState.approversSelected = true;
    
    // Check if we should enable Start Process button
    updateStartProcessButton();
}

// New function to add documents section to panel
function addDocumentsToPanel() {
    const { appointee, company } = window.selectedAppointment || {};
    const emptyState = document.getElementById('documentsEmptyState');
    const documentsList = document.getElementById('documentsList');
    if (!emptyState || !documentsList) return;
    
    // Hide empty state
    emptyState.style.display = 'none';
    
    // Populate and show documents list
    documentsList.innerHTML = `
        <div class="document-item">
            <div class="document-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            </div>
            <div class="document-info">
                <div class="document-name">Board Resolution</div>
                <div class="document-meta">For board approval via Boards system</div>
            </div>
            <button class="document-action" onclick="previewDocument('board-resolution')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>
            <button class="document-action" onclick="downloadDocument('board-resolution')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
        </div>
        
        <div class="document-item">
            <div class="document-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
            </div>
            <div class="document-info">
                <div class="document-name">Consent to Act as Director</div>
                <div class="document-meta">For ${appointee.name} signature</div>
            </div>
            <button class="document-action" onclick="previewDocument('consent-form')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>
            <button class="document-action" onclick="downloadDocument('consent-form')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
        </div>
        
        <div class="document-item">
            <div class="document-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            </div>
            <div class="document-info">
                <div class="document-name">${company && company.location === 'Singapore' ? 'Form 45' : 'Regulatory Filing Form'}</div>
                <div class="document-meta">Government filing for ${company.location}, ${company.country}</div>
            </div>
            <button class="document-action" onclick="previewDocument('regulatory-form')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>
            <button class="document-action" onclick="downloadDocument('regulatory-form')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
        </div>
    `;
    documentsList.style.display = 'block';
}

// Update Start Process button visibility
function updateStartProcessButton() {
    const actionsSection = document.getElementById('panelActions');
    if (!actionsSection) return;
    
    const state = window.appointmentWorkflowState || {};
    
    if (state.approversSelected && state.documentsReviewed) {
        actionsSection.innerHTML = `
            <button class="panel-btn-secondary" onclick="closeAppointmentPanel()">Cancel</button>
            <button class="panel-btn-primary" onclick="startAppointmentWorkflow()">Start Process</button>
        `;
        
        // Update header to show "Ready" tag
        updateChatHeaderActions('preview-ready');
    }
}

function previewDocument(docId) {
    openDocumentViewer(docId);
}

function downloadDocument(docId) {
    downloadDocumentFromViewer(docId);
}

function closeAppointmentPanel() {
    chatView.classList.remove('show-right-panel');
    
    // Reset workflow state
    window.appointmentWorkflowState = null;
    
    // Hide header actions
    updateChatHeaderActions(null);
    
    if (currentChatId) {
        addMessageToChat(currentChatId, 'assistant', 
            'Appointment process cancelled. Let me know if you need anything else.'
        );
    }
}

// Removed: editApproversList - no longer needed with new workflow

// ============================================
// CONVERSATIONAL DIRECTOR REPLACEMENT FLOW
// ============================================

function generateDirectorDisambiguation() {
    return `
        <h3 style="margin-bottom: var(--space-3); color: var(--color-gray-900);">Replace Subsidiary Director</h3>
        <p style="margin-bottom: var(--space-4); line-height: var(--leading-normal); color: var(--color-gray-700);">
            I found 2 directors matching "David Chen". Please select which director you'd like to replace:
        </p>
        
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            <button 
                class="director-selection-btn" 
                onclick="selectDisambiguatedDirector('p1')"
                style="background: var(--color-white); border: 1px solid var(--color-gray-300); border-radius: var(--radius-lg); padding: var(--space-4); text-align: left; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; gap: var(--space-2);"
                onmouseover="this.style.background='var(--color-gray-50)'; this.style.borderColor='var(--color-gray-400)';"
                onmouseout="this.style.background='var(--color-white)'; this.style.borderColor='var(--color-gray-300)';">
                <div style="font-size: var(--text-lg); font-weight: 600; color: var(--color-gray-900);">Wei "David" Chen</div>
                <div style="font-size: var(--text-base); color: var(--color-gray-700);">Vice President, Commercial Operations (APAC)</div>
                <div style="font-size: var(--text-sm); color: var(--color-gray-600);">Pacific Polymer Logistics Pte. Ltd.</div>
            </button>
            
            <button 
                class="director-selection-btn" 
                onclick="selectDisambiguatedDirector('p9')"
                style="background: var(--color-white); border: 1px solid var(--color-gray-300); border-radius: var(--radius-lg); padding: var(--space-4); text-align: left; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; gap: var(--space-2);"
                onmouseover="this.style.background='var(--color-gray-50)'; this.style.borderColor='var(--color-gray-400)';"
                onmouseout="this.style.background='var(--color-white)'; this.style.borderColor='var(--color-gray-300)';">
                <div style="font-size: var(--text-lg); font-weight: 600; color: var(--color-gray-900);">David Chenney</div>
                <div style="font-size: var(--text-base); color: var(--color-gray-700);">Vice President, Manufacturing Operations</div>
                <div style="font-size: var(--text-sm); color: var(--color-gray-600);">DuraFlow Composites, Inc.</div>
            </button>
        </div>
    `;
}

function selectDisambiguatedDirector(directorId) {
    const director = mockPeople.find(p => p.id === directorId);
    
    if (!director) return;
    
    // Store the selected director temporarily
    window.selectedDisambiguatedDirector = director;
    
    // Send user message showing their selection
    if (currentChatId) {
        addMessageToChat(currentChatId, 'user', director.name);
        
        // Show appointee search
        setTimeout(() => {
            const response = generateAppointeeSearchForReplacement(directorId);
            addMessageToChat(currentChatId, 'assistant', response);
        }, 400);
    }
}

function generateAppointeeSearchForReplacement(directorId) {
    const director = mockPeople.find(p => p.id === directorId);
    
    return `
        <h3 style="margin-bottom: var(--space-3); color: var(--color-gray-900);">Select Appointee</h3>
        <p style="margin-bottom: var(--space-4); line-height: var(--leading-normal); color: var(--color-gray-700);">
            Great! Now search for the person who will replace <strong>${director.name}</strong>:
        </p>
        
        <div class="form-field" id="replacementAppointeeSearchField">
            <label class="form-label">Search for Appointee</label>
            <div class="search-field-wrapper">
                <input 
                    type="text" 
                    id="replacementAppointeeSearch" 
                    class="search-input"
                    placeholder="Type name to search..."
                />
                <div id="selectedReplacementAppointee" class="selected-item" style="display: none;"></div>
                <div id="replacementAppointeeResults" class="search-results" style="display: none;"></div>
                <input type="hidden" id="selectedReplacementAppointeeId" value="">
            </div>
        </div>
        
        <div style="margin-top: var(--space-4);">
            <button 
                id="continueToPreviewBtn" 
                class="panel-btn-primary" 
                onclick="continueToPreviewPanel()"
                disabled
                style="opacity: 0.5; cursor: not-allowed;">
                Continue
            </button>
        </div>
    `;
}

function continueToPreviewPanel() {
    const director = window.selectedDisambiguatedDirector;
    const appointeeId = document.getElementById('selectedReplacementAppointeeId').value;
    const appointee = mockPeople.find(p => p.id === appointeeId);
    
    if (!director || !appointee) return;
    
    // Find the company for this director (defaulting to Pacific Polymer Logistics for demo)
    const company = mockCompanies[4]; // Pacific Polymer Logistics Pte. Ltd. (Singapore)
    
    // Store appointment data
    window.selectedAppointment = {
        company: company,
        director: director,
        appointee: appointee,
        isReplacement: true
    };
    
    // Send user message
    if (currentChatId) {
        addMessageToChat(currentChatId, 'user', `Replace ${director.name} with ${appointee.name} at ${company.name}`);
        
        // Show confirmation and open panel
        setTimeout(() => {
            addMessageToChat(currentChatId, 'assistant', 
                `Perfect! I've prepared the appointment workflow to replace ${director.name} with ${appointee.name} at ${company.name}. Review the details in the panel on the right.`
            );
            openAppointmentPanel();
        }, 400);
    }
}

function initializeReplacementAppointeeSearch() {
    const appointeeSearch = document.getElementById('replacementAppointeeSearch');
    const continueBtn = document.getElementById('continueToPreviewBtn');
    
    if (!appointeeSearch) return;
    
    // Setup appointee search field
    setupSearchField(
        appointeeSearch,
        document.getElementById('replacementAppointeeResults'),
        mockAppointees,
        (item) => `
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <div style="font-weight: 500; color: var(--color-gray-900);">${item.name}</div>
                <div style="font-size: var(--text-xs); color: var(--color-gray-500);">${item.title}</div>
            </div>
        `,
        (item) => {
            document.getElementById('selectedReplacementAppointeeId').value = item.id;
            showSelectedItem('selectedReplacementAppointee', item.name, 'replacementAppointeeSearch', 'replacementAppointeeResults');
            
            // Enable continue button
            if (continueBtn) {
                continueBtn.disabled = false;
                continueBtn.style.opacity = '1';
                continueBtn.style.cursor = 'pointer';
            }
        }
    );
    
    // Focus the search field
    appointeeSearch.focus();
}

function startAppointmentWorkflow() {
    // Initialize process state
    processRunning = true;
    processPaused = false;
    
    // Mark current chat as having a workflow
    const chat = chats.find(c => c.id === currentChatId);
    if (chat) {
        chat.hasWorkflow = true;
        chat.lastUpdate = new Date();
    }
    
    // Get selected appointment data
    const { company, director, appointee, isReplacement } = window.selectedAppointment || {};
    
    if (!company || !appointee) {
        console.error('Appointment data not found');
        return;
    }
    
    // Store appointment context
    currentAppointment = {
        company: company.name,
        companyMeta: `Domiciled in ${company.location}, ${company.country}`,
        resigningDirector: isReplacement && director ? director.name : null,
        resigningDirectorTitle: isReplacement && director ? director.title : null,
        appointee: appointee.name,
        appointeeTitle: appointee.title,
        isReplacement: isReplacement
    };
    
    // Build entity update substeps based on appointment type
    const entitySubsteps = [];
    if (isReplacement && director) {
        entitySubsteps.push({ id: 'entity-resign', name: `Record ${director.name} resignation`, status: 'pending', time: null });
    }
    entitySubsteps.push({ id: 'entity-appoint', name: `Record ${appointee.name} appointment`, status: 'pending', time: null });
    
    // Get selected approvers from workflow state (in the order they were selected)
    const selectedApprovers = window.appointmentWorkflowState?.selectedApprovers || [];
    
    // Map to full approver objects with IDs (keep display order from chat)
    const approverIdMap = {
        'Robert Johnson': 'approval-johnson',
        'Margaret Sullivan': 'approval-sullivan',
        'James Davidson': 'approval-davidson',
        'Linda Williams': 'approval-williams',
        'David Martinez': 'approval-martinez'
    };
    
    const approvers = selectedApprovers.map(a => ({
        id: approverIdMap[a.name] || a.name.toLowerCase().replace(/\s+/g, '-'),
        name: a.name,
        title: a.role,
        status: 'pending',
        time: null,
        vote: null
    }));
    
    // Initialize workflow steps with sub-statuses
    processSteps = [
        {
            id: 'board-approval',
            name: 'Board Approval',
            description: 'Submit Board Resolution to the Boards system for asynchronous approval',
            substeps: [
                { id: 'approval-create', name: 'Create approval request', status: 'completed', time: 'Jan 7, 9:00 AM' },
                { id: 'approval-send', name: 'Send to board members', status: 'in_progress', time: null },
                { 
                    id: 'approval', 
                    name: 'Approval', 
                    status: 'pending', 
                    time: null,
                    approvers: approvers // Nested approvers array
                },
                { id: 'approval-store', name: 'Store signed Board Resolution', status: 'pending', time: null, docLink: 'board-resolution-signed' }
            ]
        },
        {
            id: 'regulatory-forms',
            name: 'Email Regulatory Forms',
            description: 'Send Consent to Act and regulatory forms to appointee for signature',
            substeps: [
                { id: 'forms-create', name: 'Generate regulatory forms', status: 'pending', time: null },
                { id: 'forms-send', name: `Email forms to ${appointee.name}`, status: 'pending', time: null },
                { id: 'forms-receive', name: 'Receive signed documents', status: 'pending', time: null },
                { id: 'forms-validate', name: 'Validate form completeness', status: 'pending', time: null },
                { id: 'forms-store-consent', name: 'Store Consent to Act form', status: 'pending', time: null, docLink: 'consent-form-signed' },
                { id: 'forms-store-regulatory', name: `Store signed ${company.location === 'Singapore' ? 'Form 45' : 'regulatory form'}`, status: 'pending', time: null, docLink: 'regulatory-form-signed', isManualFiling: true }
            ]
        },
        {
            id: 'entity-update',
            name: 'Update Entity Records',
            description: 'Update Entities system to reflect board changes',
            substeps: entitySubsteps
        }
    ];
    
    // Open the In-Progress status panel
    openInProgressPanel();
    
    // Update header to show View Status button with Running indicator
    updateChatHeaderActions('process-running');
    
    // Add a message to the chat with button to reopen panel
    if (currentChatId) {
        addMessageToChat(currentChatId, 'assistant', 
            `<div class="workflow-initiated">
                <h4 style="color: var(--color-gray-900); margin-bottom: var(--space-2);">✓ Appointment Workflow Started</h4>
                <p style="color: var(--color-gray-700); margin-bottom: var(--space-3);">
                    I'm coordinating the appointment of ${appointee.name} to ${company.name}.
                </p>
                <p style="color: var(--color-gray-600); font-size: var(--text-sm);">
                    I'll keep you updated as each step completes. You can continue working while I handle this in the background.
                </p>
                <button class="preview-panel-btn" onclick="reopenStatusPanel()" style="margin-top: var(--space-3);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--space-1);">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                    View Process Status
                </button>
            </div>`
        );
    }
    
    // Simulate live updates
    simulateLiveUpdates();
}

function openInProgressPanel() {
    // Show the right panel
    chatView.classList.add('show-right-panel');
    
    // Set panel type
    currentPanelType = processRunning ? 'process' : 'completion';
    
    // Update panel title
    document.querySelector('.right-panel-title').textContent = 'Process Status';
    
    // Populate the panel content
    const panelContent = document.querySelector('.right-panel-content');
    panelContent.innerHTML = generateInProgressPanel();
}

function generateInProgressPanel() {
    return `
        <div class="in-progress-panel">
            <!-- Workflow Progress -->
            <section class="panel-section" style="flex: 1; overflow-y: auto;">
                <h4 class="panel-section-title">Workflow Progress</h4>
                
                <div class="process-steps">
                    ${processSteps.map((step, stepIdx) => generateStepHTML(step, stepIdx)).join('')}
                </div>
            </section>
        </div>
    `;
}

function generateStepHTML(step, stepIdx) {
    // Determine overall step status
    const allCompleted = step.substeps.every(s => s.status === 'completed');
    const hasInProgress = step.substeps.some(s => s.status === 'in_progress');
    const allPending = step.substeps.every(s => s.status === 'pending');
    
    let stepStatusClass = 'step-pending';
    if (allCompleted) stepStatusClass = 'step-completed';
    else if (hasInProgress) stepStatusClass = 'step-active';
    
    return `
        <div class="process-step ${stepStatusClass}">
            <div class="process-step-header">
                <div class="process-step-number">${stepIdx + 1}</div>
                <div class="process-step-info">
                    <div class="process-step-title">${step.name}</div>
                    <div class="process-step-description">${step.description}</div>
                </div>
            </div>
            
            <div class="process-substeps">
                ${step.substeps.map(substep => {
                    // Check if this substep has nested approvers
                    if (substep.approvers) {
                        return `
                            <div class="process-substep ${substep.status}">
                                <div class="substep-indicator">
                                    ${getStatusIcon(substep.status)}
                                </div>
                                <div class="substep-content">
                                    <div class="substep-name">${substep.name}</div>
                                    <div class="approvers-list" style="margin-top: var(--space-2); padding-left: var(--space-4);">
                                        ${substep.approvers.map(approver => `
                                            <div style="display: flex; align-items: center; gap: var(--space-2); padding: var(--space-1) 0; font-size: var(--text-sm); color: var(--color-gray-700);">
                                                <span style="flex: 1;">${approver.name} - ${approver.title}</span>
                                                <div style="display: flex; align-items: center; gap: var(--space-2);">
                                                    ${approver.vote 
                                                        ? `<span style="color: #10b981; font-weight: 600; font-size: var(--text-xs);">${approver.vote}</span>` 
                                                        : ''
                                                    }
                                                    ${approver.time && approver.vote
                                                        ? `<span style="color: var(--color-gray-500); font-size: var(--text-xs); white-space: nowrap;">${approver.time}</span>`
                                                        : ''
                                                    }
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    ${substep.status === 'completed' && substep.time
                                        ? `<div class="substep-meta" style="margin-top: var(--space-2);">All approvals received ${substep.time}</div>`
                                        : ''
                                    }
                                </div>
                            </div>
                        `;
                    }
                    
                    // Regular substep rendering
                    return `
                        <div class="process-substep ${substep.status}">
                            <div class="substep-indicator">
                                ${getStatusIcon(substep.status)}
                            </div>
                            <div class="substep-content">
                                <div class="substep-name">${substep.name}${substep.vote ? ` • <span style="color: #10b981; font-weight: 600;">${substep.vote}</span>` : ''}</div>
                                ${substep.status === 'in_progress' 
                                    ? '<div class="substep-meta">In progress...</div>'
                                    : substep.time 
                                        ? `<div class="substep-meta">
                                            ${substep.vote ? 'Responded' : 'Completed'} ${substep.time}
                                            ${substep.docLink && substep.status === 'completed' 
                                                ? ` • <a href="#" onclick="event.preventDefault(); openDocumentFromWorkflow('${substep.docLink}');" style="color: var(--color-gray-900); font-weight: 500; text-decoration: underline;">Open document</a>`
                                                : ''
                                            }
                                            ${substep.isManualFiling && substep.status === 'completed'
                                                ? ` • <a href="#" onclick="event.preventDefault(); downloadDocument('${substep.docLink}');" style="color: var(--color-gray-900); font-weight: 500; text-decoration: underline;">Download</a>`
                                                : ''
                                            }
                                           </div>`
                                        : ''
                                }
                                ${substep.isManualFiling && substep.status === 'completed'
                                    ? `<div style="margin-top: var(--space-1); font-size: var(--text-xs); color: var(--color-gray-600); font-style: italic;">
                                        Manual filing required with regulatory agency
                                       </div>`
                                    : ''
                                }
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function getStatusIcon(status) {
    switch(status) {
        case 'completed':
            return '<div class="status-dot status-dot-completed"></div>';
        case 'in_progress':
            return '<div class="status-dot status-dot-in-progress"></div>';
        case 'pending':
        default:
            return '<div class="status-dot status-dot-pending"></div>';
    }
}

function toggleProcessPause() {
    processPaused = !processPaused;
    
    // Refresh the panel
    if (chatView.classList.contains('show-right-panel')) {
        const panelContent = document.querySelector('.right-panel-content');
        panelContent.innerHTML = generateInProgressPanel();
    }
    
    // Update message in chat
    if (currentChatId) {
        const status = processPaused ? 'paused' : 'resumed';
        addMessageToChat(currentChatId, 'assistant', 
            `Process ${status}. ${processPaused ? 'You can resume or cancel the process.' : 'Continuing workflow...'}`
        );
    }
    
    // If resuming, restart live updates
    if (!processPaused) {
        simulateLiveUpdates();
    }
}

function cancelProcess() {
    processRunning = false;
    processPaused = false;
    
    // Remove workflow indicator from current chat
    const chat = chats.find(c => c.id === currentChatId);
    if (chat) {
        chat.hasWorkflow = false;
    }
    
    // Close the panel
    chatView.classList.remove('show-right-panel');
    
    if (currentChatId) {
        addMessageToChat(currentChatId, 'assistant', 
            'Appointment process cancelled. All pending actions have been stopped. Let me know if you need anything else.'
        );
    }
}

function reopenStatusPanel() {
    if (processRunning) {
        openInProgressPanel();
    } else {
        openAppointmentPanel();
    }
}

function simulateLiveUpdates() {
    if (!processRunning || processPaused) return;
    
    // Timeline spanning 5 business days (Jan 7-13, 2025, skipping weekend)
    // Get approvers from processSteps
    const approvalStep = processSteps.find(s => s.id === 'board-approval');
    const approvalSubstep = approvalStep.substeps.find(s => s.id === 'approval');
    const approvers = approvalSubstep.approvers;
    
    // Create timeline with approval times (will be randomized)
    const approvalTimes = [
        'Jan 7, 2:30 PM',
        'Jan 8, 10:15 AM', 
        'Jan 8, 3:45 PM',
        'Jan 8, 4:30 PM',
        'Jan 9, 9:00 AM'  // In case there are 5 approvers
    ];
    
    // Shuffle approval times for random response order
    const shuffledTimes = [...approvalTimes];
    for (let i = shuffledTimes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTimes[i], shuffledTimes[j]] = [shuffledTimes[j], shuffledTimes[i]];
    }
    
    // Assign randomized times to approvers
    const approverTimeMap = {};
    approvers.forEach((approver, idx) => {
        approverTimeMap[approver.id] = shuffledTimes[idx];
    });
    
    // Find the last approval time (chronologically)
    const sortedApprovalTimes = [...shuffledTimes].slice(0, approvers.length).sort((a, b) => a.localeCompare(b));
    const lastApprovalTime = sortedApprovalTimes[sortedApprovalTimes.length - 1];
    
    // Calculate approval completion time (5 minutes after last approval)
    const approvalCompleteTime = lastApprovalTime.replace(/(\d+):(\d+)/, (match, h, m) => {
        const newMin = parseInt(m) + 5;
        return newMin >= 60 ? `${parseInt(h) + 1}:${String(newMin - 60).padStart(2, '0')}` : `${h}:${String(newMin).padStart(2, '0')}`;
    });
    
    // Calculate store time (10 minutes after last approval)
    const storeTime = lastApprovalTime.replace(/(\d+):(\d+)/, (match, h, m) => {
        const newMin = parseInt(m) + 10;
        return newMin >= 60 ? `${parseInt(h) + 1}:${String(newMin - 60).padStart(2, '0')}` : `${h}:${String(newMin).padStart(2, '0')}`;
    });
    
    const timeline = {
        // Business Day 1: Tuesday, Jan 7 - Board Approval starts
        'approval-send': 'Jan 7, 9:15 AM',
        'approval': approvalCompleteTime, // Completed when all approvers respond
        'approval-store': storeTime,
        
        // Business Day 3: Thursday, Jan 9 - Forms preparation and sending
        'forms-create': 'Jan 9, 10:00 AM',
        'forms-send': 'Jan 9, 10:30 AM',
        'forms-receive': 'Jan 10, 2:15 PM',
        'forms-validate': 'Jan 10, 2:30 PM',
        'forms-store-consent': 'Jan 10, 2:45 PM',
        'forms-store-regulatory': 'Jan 10, 3:00 PM',
        
        // Business Day 5: Monday, Jan 13 - Entity updates
        'entity-resign': 'Jan 13, 2:00 PM',
        'entity-appoint': 'Jan 13, 2:15 PM',
        
        // Add approver times
        ...approverTimeMap
    };
    
    // Build updates dynamically based on actual process steps
    const updates = [];
    let currentDelay = 2000;
    
    processSteps.forEach(step => {
        step.substeps.forEach(substep => {
            // Skip if already completed
            if (substep.status === 'completed') return;
            
            // Special handling for approval substep with nested approvers
            if (substep.approvers) {
                // Mark approval as in_progress when first approver starts
                updates.push({
                    stepId: step.id,
                    substepId: substep.id,
                    status: 'in_progress',
                    time: null,
                    delay: currentDelay
                });
                currentDelay = Math.floor(Math.random() * 2000) + 1500;
                
                // Create approver updates with their timestamps
                const approverUpdates = substep.approvers.map(approver => ({
                    stepId: step.id,
                    substepId: substep.id,
                    approverId: approver.id,
                    status: 'completed',
                    vote: 'Approved',
                    time: timeline[approver.id] || 'Completed',
                    timestamp: timeline[approver.id], // For sorting
                    delay: currentDelay,
                    isApprover: true
                }));
                
                // Sort approver updates by timestamp so they come in chronologically
                approverUpdates.sort((a, b) => {
                    const timeA = a.timestamp || '';
                    const timeB = b.timestamp || '';
                    return timeA.localeCompare(timeB);
                });
                
                // Add sorted approver updates
                approverUpdates.forEach(update => {
                    updates.push(update);
                    currentDelay = Math.floor(Math.random() * 2000) + 2000;
                });
                
                // Mark approval as completed when all approvers done
                updates.push({
                    stepId: step.id,
                    substepId: substep.id,
                    status: 'completed',
                    time: timeline[substep.id] || 'Completed',
                    delay: currentDelay
                });
                currentDelay = Math.floor(Math.random() * 2000) + 2000;
            } else {
                // Regular substep processing
                // Add in_progress update
                if (substep.status !== 'in_progress') {
                    updates.push({
                        stepId: step.id,
                        substepId: substep.id,
                        status: 'in_progress',
                        time: null,
                        delay: currentDelay
                    });
                    currentDelay = Math.floor(Math.random() * 2000) + 1500; // 1.5-3.5s
                }
                
                // Add completed update with realistic timestamp
                updates.push({
                    stepId: step.id,
                    substepId: substep.id,
                    status: 'completed',
                    time: timeline[substep.id] || 'Completed',
                    delay: currentDelay
                });
                currentDelay = Math.floor(Math.random() * 2000) + 2000; // 2-4s
            }
        });
    });
    
    // Simulate progress through substeps
    let updateIndex = 0;
    
    function applyUpdate() {
        if (!processRunning || processPaused || updateIndex >= updates.length) {
            // Check if all steps are complete
            if (updateIndex >= updates.length && processRunning) {
                completeWorkflow();
            }
            return;
        }
        
        const update = updates[updateIndex];
        
        // Find and update the substep
        const step = processSteps.find(s => s.id === update.stepId);
        if (step) {
            const substep = step.substeps.find(s => s.id === update.substepId);
            if (substep) {
                // Handle approver update
                if (update.isApprover && substep.approvers) {
                    const approver = substep.approvers.find(a => a.id === update.approverId);
                    if (approver) {
                        approver.status = update.status;
                        approver.time = update.time;
                        approver.vote = update.vote;
                    }
                } else {
                    // Regular substep update
                    substep.status = update.status;
                    if (update.time) {
                        substep.time = update.time;
                    }
                }
                
                // Refresh the panel if it's open
                if (chatView.classList.contains('show-right-panel')) {
                    const panelContent = document.querySelector('.right-panel-content');
                    panelContent.innerHTML = generateInProgressPanel();
                }
            }
        }
        
        updateIndex++;
        
        if (updateIndex < updates.length) {
            setTimeout(applyUpdate, updates[updateIndex].delay);
        } else {
            // All updates complete
            setTimeout(() => completeWorkflow(), 1000);
        }
    }
    
    // Start the first update
    setTimeout(applyUpdate, updates[0].delay);
}

function completeWorkflow() {
    if (!processRunning) return;
    
    processRunning = false;
    
    // Remove workflow indicator from current chat
    const chat = chats.find(c => c.id === currentChatId);
    if (chat) {
        chat.hasWorkflow = false;
        chat.hasUpdate = true;
    }
    
    // Update history display
    updateChatHistoryDisplay();
    
    // Show completion panel
    if (chatView.classList.contains('show-right-panel')) {
        currentPanelType = 'completion';
        const panelContent = document.querySelector('.right-panel-content');
        panelContent.innerHTML = generateCompletionPanel();
    }
    
    // Send completion message to chat
    if (currentChatId) {
        const { company, appointee } = window.selectedAppointment || {};
        addMessageToChat(currentChatId, 'assistant', 
            `<div style="padding: var(--space-4); background: var(--color-gray-50); border-left: 3px solid var(--color-gray-800); border-radius: var(--radius-md);">
                <h4 style="color: var(--color-gray-900); margin-bottom: var(--space-2);">✓ Appointment Process Complete</h4>
                <p style="color: var(--color-gray-700); margin-bottom: var(--space-2);">
                    The appointment of <strong>${appointee ? appointee.name : 'the appointee'}</strong> to <strong>${company ? company.name : 'the company'}</strong> has been successfully completed.
                </p>
                <p style="color: var(--color-gray-600); font-size: var(--text-sm);">
                    All documents have been filed and stored in the document repository. Entity records have been updated.
                </p>
                <button class="preview-panel-btn" onclick="reopenStatusPanel()" style="margin-top: var(--space-3);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--space-1);">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    View Summary
                </button>
            </div>`
        );
    }
}

function generateCompletionPanel() {
    const { company, appointee } = window.selectedAppointment || {};
    
    return `
        <div class="in-progress-panel">
            <!-- Header with Status -->
            <section class="panel-section">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
                    <div>
                        <h4 class="panel-section-title" style="margin-bottom: var(--space-1);">Director Appointment</h4>
                        <span class="status-badge status-completed">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Completed
                        </span>
                    </div>
                </div>
            </section>

            <!-- Context Summary -->
            <section class="panel-section">
                <h4 class="panel-section-title">Appointment Details</h4>
                
                <div class="summary-card-compact">
                    <div class="summary-item-compact">
                        <label class="summary-label">Company</label>
                        <div class="summary-value">${currentAppointment.company}</div>
                    </div>
                    
                    ${currentAppointment.resigningDirector ? `
                    <div class="summary-item-compact">
                        <label class="summary-label">Resigning Director</label>
                        <div class="summary-value">${currentAppointment.resigningDirector}</div>
                    </div>
                    ` : ''}
                    
                    <div class="summary-item-compact">
                        <label class="summary-label">${currentAppointment.isReplacement ? 'Appointee' : 'New Director'}</label>
                        <div class="summary-value">${currentAppointment.appointee}</div>
                    </div>
                </div>
            </section>

            <!-- Workflow Progress -->
            <section class="panel-section" style="flex: 1; overflow-y: auto;">
                <h4 class="panel-section-title">Completed Steps</h4>
                
                <div class="process-steps">
                    ${processSteps.map((step, stepIdx) => generateStepHTML(step, stepIdx)).join('')}
                </div>
            </section>

            <!-- Actions -->
            <section class="panel-section panel-actions">
                <button class="panel-btn-secondary" onclick="chatView.classList.remove('show-right-panel')">Close</button>
            </section>
        </div>
    `;
}

function openDocumentFromWorkflow(docId) {
    openDocumentViewer(docId);
}

function openDocumentViewer(docId) {
    // Store previous panel type for back navigation
    const previousPanelType = currentPanelType;
    currentPanelType = 'document';
    currentDocumentId = docId;
    
    // Update panel title
    document.querySelector('.right-panel-title').textContent = 'Document Viewer';
    
    // Populate the panel content
    const panelContent = document.querySelector('.right-panel-content');
    panelContent.innerHTML = generateDocumentViewerPanel(docId, previousPanelType);
}

function generateDocumentViewerPanel(docId, previousPanelType) {
    const { company, appointee } = window.selectedAppointment || {};
    const companyShort = company ? company.name.split(',')[0].replace(/[^a-zA-Z0-9]/g, '_') : 'Company';
    const appointeeShort = appointee ? appointee.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Appointee';
    
    // Map document IDs to display info
    const docInfo = {
        'board-resolution': {
            name: 'Board Resolution',
            filename: `Board_Resolution_${companyShort}.pdf`,
            description: 'Draft board resolution for director appointment',
            type: 'Draft'
        },
        'board-resolution-signed': {
            name: 'Board Resolution (Signed)',
            filename: `Board_Resolution_Signed_${companyShort}.pdf`,
            description: 'Signed and approved board resolution',
            type: 'Final'
        },
        'consent-form': {
            name: 'Consent to Act as Director',
            filename: `Consent_to_Act_${appointeeShort}.pdf`,
            description: 'Consent form for appointee signature',
            type: 'Draft'
        },
        'consent-form-signed': {
            name: 'Consent to Act as Director (Signed)',
            filename: `Consent_to_Act_Signed_${appointeeShort}.pdf`,
            description: 'Signed consent to act form',
            type: 'Final'
        },
        'regulatory-form': {
            name: company && company.location === 'Singapore' ? 'Form 45' : 'Regulatory Filing Form',
            filename: company && company.location === 'Singapore' 
                ? `Form_45_${companyShort}.pdf` 
                : `Regulatory_Filing_${companyShort}.pdf`,
            description: company && company.location === 'Singapore'
                ? 'Form 45 - Notification of Change of Director'
                : 'Regulatory filing for director change',
            type: 'Draft'
        },
        'regulatory-form-signed': {
            name: company && company.location === 'Singapore' ? 'Form 45 (Signed)' : 'Regulatory Filing Form (Signed)',
            filename: company && company.location === 'Singapore' 
                ? `Form_45_Signed_${companyShort}.pdf` 
                : `Regulatory_Filing_Signed_${companyShort}.pdf`,
            description: company && company.location === 'Singapore'
                ? 'Signed Form 45 - Ready for manual filing'
                : 'Signed regulatory form - Ready for manual filing',
            type: 'Signed'
        }
    };
    
    const doc = docInfo[docId] || {
        name: 'Document',
        filename: 'document.pdf',
        description: 'Document preview',
        type: 'Document'
    };
    
    return `
        <div class="document-viewer-panel">
            <!-- Document Header -->
            <section class="panel-section">
                <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
                    <button class="panel-btn-tertiary" onclick="navigateBackFromDocument('${previousPanelType}')" style="padding: var(--space-2); flex-shrink: 0;" title="Back">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <div style="flex: auto; min-width: 0;">
                        <h4 style="font-size: var(--text-xl); font-weight: 600; color: var(--color-gray-900); margin: 0 0 var(--space-1) 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${doc.name}</h4>
                        <div style="font-size: var(--text-sm); color: var(--color-gray-600); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${doc.description}</div>
                    </div>
                    <button class="panel-btn-secondary" onclick="downloadDocumentFromViewer('${docId}')" style="padding: 0; width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;" title="Download">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                </div>
                
                <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-4);">
                    <span style="display: inline-flex; align-items: center; padding: var(--space-1) var(--space-3); background: var(--color-gray-100); border-radius: var(--radius-md); font-size: var(--text-sm); color: var(--color-gray-700);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--space-1);">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        ${doc.type}
                    </span>
                    <span style="display: inline-flex; align-items: center; padding: var(--space-1) var(--space-3); background: var(--color-gray-100); border-radius: var(--radius-md); font-size: var(--text-sm); color: var(--color-gray-700);">
                        ${doc.filename}
                    </span>
                </div>
            </section>

            <!-- Document Preview -->
            <section class="panel-section" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                <div class="document-preview-container">
                    <div class="document-preview-placeholder">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-gray-400);">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <h4 style="margin-top: var(--space-4); color: var(--color-gray-700); font-size: var(--text-lg); font-weight: 600;">
                            ${doc.name}
                        </h4>
                        <p style="margin-top: var(--space-2); color: var(--color-gray-600); font-size: var(--text-sm);">
                            PDF document preview
                        </p>
                        <p style="margin-top: var(--space-1); color: var(--color-gray-500); font-size: var(--text-xs);">
                            ${doc.filename}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    `;
}

function navigateBackFromDocument(previousPanelType) {
    // Navigate back to the previous panel
    if (previousPanelType === 'appointment') {
        openAppointmentPanel();
    } else if (previousPanelType === 'process') {
        openInProgressPanel();
    } else if (previousPanelType === 'completion') {
        currentPanelType = 'completion';
        document.querySelector('.right-panel-title').textContent = 'Process Status';
        const panelContent = document.querySelector('.right-panel-content');
        panelContent.innerHTML = generateCompletionPanel();
    } else {
        // Default: close panel
        chatView.classList.remove('show-right-panel');
    }
}

function downloadDocumentFromViewer(docId) {
    const { company, appointee } = window.selectedAppointment || {};
    const companyShort = company ? company.name.split(',')[0].replace(/[^a-zA-Z0-9]/g, '_') : 'Company';
    const appointeeShort = appointee ? appointee.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Appointee';
    
    const docNames = {
        'board-resolution': `Board_Resolution_${companyShort}.pdf`,
        'board-resolution-signed': `Board_Resolution_Signed_${companyShort}.pdf`,
        'consent-form': `Consent_to_Act_${appointeeShort}.pdf`,
        'consent-form-signed': `Consent_to_Act_Signed_${appointeeShort}.pdf`,
        'regulatory-form': company && company.location === 'Singapore' 
            ? `Form_45_${companyShort}.pdf` 
            : `Regulatory_Filing_${companyShort}.pdf`,
        'regulatory-form-signed': company && company.location === 'Singapore' 
            ? `Form_45_Signed_${companyShort}.pdf` 
            : `Regulatory_Filing_Signed_${companyShort}.pdf`
    };
    
    if (currentChatId) {
        addMessageToChat(currentChatId, 'assistant', 
            `Downloading ${docNames[docId]}...`
        );
    }
}

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
    `;
    document.head.appendChild(style);
}

// ============================================
// INITIALIZE
// ============================================

// Initialize mock chats on page load
initializeMockChats();
