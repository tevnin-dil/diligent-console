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
        preview: initialMessage.substring(0, 60),
        hasUpdate: false,
        hasWorkflow: false,
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
            title: 'Board Meeting Q1 2026 - Agenda Review',
            preview: 'Can you help me prepare the agenda for our Q1 board meeting?',
            createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            lastUpdate: new Date(now - 3 * 60 * 60 * 1000), // 3 hours ago
            hasUpdate: true,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-2',
            title: 'Compliance Audit Preparation',
            preview: 'I need to prepare documentation for our upcoming compliance audit...',
            createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            lastUpdate: new Date(now - 1 * 60 * 60 * 1000), // 1 hour ago
            hasUpdate: true,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-3',
            title: 'Annual Report Draft Review',
            preview: 'Please review the financial disclosures in the annual report draft',
            createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-4',
            title: 'Executive Compensation Committee Meeting',
            preview: 'Prepare materials for the executive compensation discussion',
            createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-5',
            title: 'Subsidiary Incorporation - Singapore',
            preview: 'Walk me through the process of incorporating a subsidiary in Singapore',
            createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000), // 14 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-6',
            title: 'Risk Assessment Framework Update',
            preview: 'Update our enterprise risk assessment framework based on new regulations',
            createdAt: new Date(now - 18 * 24 * 60 * 60 * 1000), // 18 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-7',
            title: 'Board Resolution - Share Buyback',
            preview: 'Draft a board resolution approving the share buyback program',
            createdAt: new Date(now - 21 * 24 * 60 * 60 * 1000), // 21 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-8',
            title: 'Conflict of Interest Policy Review',
            preview: 'Review and update our conflict of interest policy for directors',
            createdAt: new Date(now - 25 * 24 * 60 * 60 * 1000), // 25 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-9',
            title: 'Quarterly Board Book Preparation',
            preview: 'Help me compile and organize the Q4 board book materials',
            createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            lastUpdate: null,
            hasUpdate: false,
            hasWorkflow: false,
            messages: []
        },
        {
            id: 'mock-10',
            title: 'Director Independence Assessment',
            preview: 'Assess the independence status of our current board members',
            createdAt: new Date(now - 35 * 24 * 60 * 60 * 1000), // 35 days ago
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
        
        // Build badges HTML
        let badgesHTML = '';
        if (chat.hasWorkflow) {
            badgesHTML = '<span class="chat-badge workflow-badge"><span class="workflow-pulse"></span></span>';
        } else if (chat.hasUpdate) {
            badgesHTML = '<span class="chat-badge update-badge"></span>';
        }
        
        item.innerHTML = `
            <div class="chat-history-header">
                <div class="chat-history-title">${chat.title}</div>
                ${badgesHTML}
            </div>
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

// New chat
newChatBtn.addEventListener('click', () => {
    chatInput.focus();
});

// Chat sort control
const chatSortSelect = document.getElementById('chatSortSelect');
chatSortSelect.addEventListener('change', (e) => {
    chatSortMode = e.target.value;
    updateChatHistoryDisplay();
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
        return generateAppointDirectorForm();
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
    { id: 'p1', name: 'Wei "David" Chen', title: 'Vice President, Commercial Operations (APAC)' },
    { id: 'p2', name: 'Priya Nair', title: 'Regional Finance Director, APAC' },
    { id: 'p3', name: 'James "Jim" Sterling', title: 'Senior Director, Supply Chain & Logistics' },
    { id: 'p4', name: 'Elena Rossi', title: 'General Counsel, Asia Pacific' },
    { id: 'p5', name: 'Lim Pei Shan', title: 'Director of Risk Management & Trade Compliance' },
    { id: 'p6', name: 'Kenji Tanaka', title: 'Head of Digital Transformation, APAC' },
    { id: 'p7', name: 'Siti Nurhaliza', title: 'Human Resources Director, APAC' },
    { id: 'p8', name: 'Michael O\'Connell', title: 'Plant Manager - Jurong Island Compounding Facility' }
];

// Use same dataset for both directors and appointees
const mockDirectors = mockPeople;
const mockAppointees = mockPeople;

function generateAppointDirectorForm() {
    return `
        <h3 style="margin-bottom: var(--space-3); color: var(--color-gray-900);">Appoint a Director</h3>
        <p style="margin-bottom: var(--space-5); line-height: var(--leading-normal); color: var(--color-gray-700);">
            Let's start by identifying the key parties involved in this appointment.
        </p>
        
        <form id="appointDirectorForm" class="hybrid-form">
            <!-- Company Search -->
            <div class="form-field">
                <label class="form-label">Company</label>
                <div class="search-field-wrapper">
                    <input 
                        type="text" 
                        id="companySearch" 
                        class="search-input"
                        placeholder="Search for company..."
                        autocomplete="off"
                    />
                    <div class="search-results" id="companyResults"></div>
                    <input type="hidden" id="selectedCompanyId" />
                </div>
                <div class="selected-item" id="selectedCompany" style="display: none;"></div>
            </div>

            <!-- Director to Replace -->
            <div class="form-field">
                <label class="form-label">Director to Replace</label>
                <div class="search-field-wrapper">
                    <input 
                        type="text" 
                        id="directorSearch" 
                        class="search-input"
                        placeholder="Search for director..."
                        autocomplete="off"
                        disabled
                    />
                    <div class="search-results" id="directorResults"></div>
                    <input type="hidden" id="selectedDirectorId" />
                </div>
                <div class="selected-item" id="selectedDirector" style="display: none;"></div>
            </div>

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
                        disabled
                    />
                    <div class="search-results" id="appointeeResults"></div>
                    <input type="hidden" id="selectedAppointeeId" />
                </div>
                <div class="selected-item" id="selectedAppointee" style="display: none;"></div>
            </div>

            <div class="form-actions">
                <button type="button" class="form-btn-secondary" id="cancelFormBtn">Cancel</button>
                <button type="submit" class="form-btn-primary" id="submitFormBtn" disabled>Continue</button>
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
    
    if (!companySearch) return;

    // Company search
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
            // Enable director search
            directorSearch.disabled = false;
            directorSearch.focus();
            checkFormCompletion();
        }
    );

    // Director search
    setupSearchField(
        directorSearch,
        document.getElementById('directorResults'),
        mockDirectors,
        (item) => `
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <div style="font-weight: 500; color: var(--color-gray-900);">${item.name}</div>
                <div style="font-size: var(--text-xs); color: var(--color-gray-500);">${item.title}</div>
            </div>
        `,
        (item) => {
            document.getElementById('selectedDirectorId').value = item.id;
            showSelectedItem('selectedDirector', item.name, 'directorSearch', 'directorResults');
            // Enable appointee search
            appointeeSearch.disabled = false;
            appointeeSearch.focus();
            checkFormCompletion();
        }
    );

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
        const companyId = document.getElementById('selectedCompanyId').value;
        const directorId = document.getElementById('selectedDirectorId').value;
        const appointeeId = document.getElementById('selectedAppointeeId').value;
        
        submitBtn.disabled = !(companyId && directorId && appointeeId);
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
        if (directorSearch) directorSearch.disabled = true;
        if (appointeeSearch) appointeeSearch.disabled = true;
        clearSelection('selectedDirector', 'directorSearch', 'directorResults');
        clearSelection('selectedAppointee', 'appointeeSearch', 'appointeeResults');
    } else if (inputId === 'directorSearch') {
        if (appointeeSearch) appointeeSearch.disabled = true;
        clearSelection('selectedAppointee', 'appointeeSearch', 'appointeeResults');
    }
    
    // Update form state
    const submitBtn = document.getElementById('submitFormBtn');
    if (submitBtn) submitBtn.disabled = true;
}

function handleAppointDirectorFormSubmit() {
    const companyId = document.getElementById('selectedCompanyId').value;
    const directorId = document.getElementById('selectedDirectorId').value;
    const appointeeId = document.getElementById('selectedAppointeeId').value;
    
    const company = mockCompanies.find(c => c.id === companyId);
    const director = mockDirectors.find(d => d.id === directorId);
    const appointee = mockAppointees.find(a => a.id === appointeeId);
    
    if (!company || !director || !appointee) return;
    
    // Store selection for later use
    window.selectedAppointment = { company, director, appointee };
    
    // Create summary message from user
    const userSummary = `I've selected ${company.name}, replacing ${director.name} with ${appointee.name}`;
    
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
    // Show the right panel
    chatView.classList.add('show-right-panel');
    
    // Populate the panel content
    const panelContent = document.querySelector('.right-panel-content');
    panelContent.innerHTML = generateAppointmentPanelContent();
    
    // Initialize panel interactions
    setTimeout(() => initializeAppointmentPanel(), 100);
}

function generateAppointmentPanelContent() {
    const { company, director, appointee } = window.selectedAppointment || {};
    
    if (!company || !director || !appointee) {
        return '<p>Error: Appointment data not found</p>';
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
                    
                    <div class="summary-divider"></div>
                    
                    <div class="summary-item">
                        <label class="summary-label">Resigning Director</label>
                        <div class="summary-value">${director.name}</div>
                        <div class="summary-meta">${director.title}</div>
                    </div>
                    
                    <div class="summary-divider"></div>
                    
                    <div class="summary-item">
                        <label class="summary-label">Appointee</label>
                        <div class="summary-value">${appointee.name}</div>
                        <div class="summary-meta">${appointee.title}</div>
                    </div>
                </div>
            </section>

            <!-- Documents Section -->
            <section class="panel-section">
                <h4 class="panel-section-title">Required Documents</h4>
                
                <div class="document-list">
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
                            <div class="document-name">Regulatory Filing Form</div>
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
                </div>
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
                            <div class="workflow-step-title">Create Board Approval</div>
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
                                Send Consent to Act and regulatory forms to <strong>${appointee.name}</strong> for signature. Monitor inbox for signed documents.
                            </div>
                        </div>
                    </div>
                    
                    <div class="workflow-step">
                        <div class="workflow-step-number">3</div>
                        <div class="workflow-step-content">
                            <div class="workflow-step-title">Update Entity Records</div>
                            <div class="workflow-step-description">
                                Update <strong>Entities</strong> system to reflect ${director.name}'s resignation and ${appointee.name}'s appointment to the board.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Action Section -->
            <section class="panel-section panel-actions">
                <button class="panel-btn-secondary" onclick="closeAppointmentPanel()">Cancel</button>
                <button class="panel-btn-primary" onclick="startAppointmentWorkflow()">Start Process</button>
            </section>
        </div>
    `;
}

function initializeAppointmentPanel() {
    // Panel is already interactive via onclick handlers
    // Could add additional initialization here if needed
}

function previewDocument(docId) {
    if (currentChatId) {
        const docNames = {
            'board-resolution': 'Board Resolution',
            'consent-form': 'Consent to Act as Director',
            'regulatory-form': 'Regulatory Filing Form'
        };
        addMessageToChat(currentChatId, 'assistant', 
            `Opening preview of ${docNames[docId]}... (Preview functionality would open document viewer here)`
        );
    }
}

function downloadDocument(docId) {
    if (currentChatId) {
        const { company, appointee } = window.selectedAppointment || {};
        const companyShort = company ? company.name.split(',')[0].replace(/[^a-zA-Z0-9]/g, '_') : 'Company';
        const appointeeShort = appointee ? appointee.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Appointee';
        
        const docNames = {
            'board-resolution': `Board_Resolution_${companyShort}.pdf`,
            'consent-form': `Consent_to_Act_${appointeeShort}.pdf`,
            'regulatory-form': `Regulatory_Form_${companyShort}.pdf`
        };
        addMessageToChat(currentChatId, 'assistant', 
            `Downloading ${docNames[docId]}... (Download would start here)`
        );
    }
}

function closeAppointmentPanel() {
    chatView.classList.remove('show-right-panel');
    if (currentChatId) {
        addMessageToChat(currentChatId, 'assistant', 
            'Appointment process cancelled. Let me know if you need anything else.'
        );
    }
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
    const { company, director, appointee } = window.selectedAppointment || {};
    
    if (!company || !director || !appointee) {
        console.error('Appointment data not found');
        return;
    }
    
    // Store appointment context
    currentAppointment = {
        company: company.name,
        companyMeta: `Domiciled in ${company.location}, ${company.country}`,
        resigningDirector: director.name,
        resigningDirectorTitle: director.title,
        appointee: appointee.name,
        appointeeTitle: appointee.title
    };
    
    // Initialize workflow steps with sub-statuses
    processSteps = [
        {
            id: 'board-approval',
            name: 'Create Board Approval',
            description: 'Submit Board Resolution to the Boards system for asynchronous approval',
            substeps: [
                { id: 'approval-create', name: 'Create approval request', status: 'completed', time: '2 min ago' },
                { id: 'approval-send', name: 'Send to board members', status: 'in_progress', time: null },
                { id: 'approval-return', name: 'Await approval responses', status: 'pending', time: null }
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
                { id: 'forms-validate', name: 'Validate form completeness', status: 'pending', time: null }
            ]
        },
        {
            id: 'entity-update',
            name: 'Update Entity Records',
            description: 'Update Entities system to reflect board changes',
            substeps: [
                { id: 'entity-resign', name: `Record ${director.name} resignation`, status: 'pending', time: null },
                { id: 'entity-appoint', name: `Record ${appointee.name} appointment`, status: 'pending', time: null }
            ]
        }
    ];
    
    // Open the In-Progress status panel
    openInProgressPanel();
    
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
    
    // Update panel title
    document.querySelector('.right-panel-title').textContent = 'Process Status';
    
    // Populate the panel content
    const panelContent = document.querySelector('.right-panel-content');
    panelContent.innerHTML = generateInProgressPanel();
}

function generateInProgressPanel() {
    const runningBadge = processPaused 
        ? '<span class="status-badge status-paused">Paused</span>'
        : '<span class="status-badge status-running"><span class="pulse-dot"></span>Running</span>';
    
    return `
        <div class="in-progress-panel">
            <!-- Header with Status -->
            <section class="panel-section">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
                    <div>
                        <h4 class="panel-section-title" style="margin-bottom: var(--space-1);">Director Appointment</h4>
                        ${runningBadge}
                    </div>
                    <div style="display: flex; gap: var(--space-2);">
                        ${processPaused 
                            ? `<button class="panel-btn-danger" onclick="cancelProcess()">Cancel Process</button>
                               <button class="panel-btn-primary" onclick="toggleProcessPause()">Resume</button>`
                            : `<button class="panel-btn-secondary" onclick="toggleProcessPause()">Pause</button>`
                        }
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
                    
                    <div class="summary-item-compact">
                        <label class="summary-label">Resigning Director</label>
                        <div class="summary-value">${currentAppointment.resigningDirector}</div>
                    </div>
                    
                    <div class="summary-item-compact">
                        <label class="summary-label">Appointee</label>
                        <div class="summary-value">${currentAppointment.appointee}</div>
                    </div>
                </div>
            </section>

            <!-- Workflow Progress -->
            <section class="panel-section" style="flex: 1; overflow-y: auto;">
                <h4 class="panel-section-title">Workflow Progress</h4>
                
                <div class="process-steps">
                    ${processSteps.map((step, stepIdx) => generateStepHTML(step, stepIdx)).join('')}
                </div>
            </section>

            ${processPaused ? `
                <section class="panel-section" style="background: var(--color-gray-50); border-top: 1px solid var(--color-gray-200);">
                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                        <div style="color: var(--color-gray-600);">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="10" y1="15" x2="10" y2="9"></line>
                                <line x1="14" y1="15" x2="14" y2="9"></line>
                            </svg>
                        </div>
                        <div>
                            <p style="font-weight: 600; color: var(--color-gray-900); margin-bottom: var(--space-1);">Process Paused</p>
                            <p style="font-size: var(--text-sm); color: var(--color-gray-600);">
                                The workflow has been paused. You can resume to continue or cancel to stop entirely.
                            </p>
                        </div>
                    </div>
                </section>
            ` : ''}
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
                ${step.substeps.map(substep => `
                    <div class="process-substep ${substep.status}">
                        <div class="substep-indicator">
                            ${getStatusIcon(substep.status)}
                        </div>
                        <div class="substep-content">
                            <div class="substep-name">${substep.name}</div>
                            ${substep.status === 'in_progress' 
                                ? '<div class="substep-meta">In progress...</div>'
                                : substep.time 
                                    ? `<div class="substep-meta">Completed ${substep.time}</div>`
                                    : ''
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getStatusIcon(status) {
    switch(status) {
        case 'completed':
            return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        case 'in_progress':
            return '<div class="spinner-small"></div>';
        case 'pending':
        default:
            return '<div class="pending-dot"></div>';
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
    
    // Simulate progress through substeps
    let updateIndex = 0;
    const updates = [
        { stepId: 'board-approval', substepId: 'approval-send', status: 'completed', time: '1 min ago', delay: 2000 },
        { stepId: 'board-approval', substepId: 'approval-return', status: 'in_progress', time: null, delay: 3000 },
        { stepId: 'board-approval', substepId: 'approval-return', status: 'completed', time: 'Just now', delay: 5000 },
        { stepId: 'regulatory-forms', substepId: 'forms-create', status: 'in_progress', time: null, delay: 2000 },
        { stepId: 'regulatory-forms', substepId: 'forms-create', status: 'completed', time: 'Just now', delay: 3000 },
        { stepId: 'regulatory-forms', substepId: 'forms-send', status: 'in_progress', time: null, delay: 2000 },
        { stepId: 'regulatory-forms', substepId: 'forms-send', status: 'completed', time: 'Just now', delay: 4000 },
        { stepId: 'regulatory-forms', substepId: 'forms-receive', status: 'in_progress', time: null, delay: 1000 }
    ];
    
    function applyUpdate() {
        if (!processRunning || processPaused || updateIndex >= updates.length) return;
        
        const update = updates[updateIndex];
        
        // Find and update the substep
        const step = processSteps.find(s => s.id === update.stepId);
        if (step) {
            const substep = step.substeps.find(s => s.id === update.substepId);
            if (substep) {
                substep.status = update.status;
                substep.time = update.time;
                
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
        }
    }
    
    // Start the first update
    setTimeout(applyUpdate, updates[0].delay);
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
