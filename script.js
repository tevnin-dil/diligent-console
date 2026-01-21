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
    { id: 'c1', name: 'Acme Corporation', jurisdiction: 'Delaware' },
    { id: 'c2', name: 'Global Industries Ltd', jurisdiction: 'Ontario' },
    { id: 'c3', name: 'Tech Ventures Inc', jurisdiction: 'California' },
    { id: 'c4', name: 'Horizon Enterprises', jurisdiction: 'New York' },
    { id: 'c5', name: 'Summit Holdings', jurisdiction: 'British Columbia' }
];

const mockDirectors = [
    { id: 'd1', name: 'John Smith', title: 'Board Chair', company: 'Acme Corporation' },
    { id: 'd2', name: 'Sarah Johnson', title: 'Director', company: 'Acme Corporation' },
    { id: 'd3', name: 'Michael Chen', title: 'Independent Director', company: 'Global Industries Ltd' },
    { id: 'd4', name: 'Emily Rodriguez', title: 'Director', company: 'Tech Ventures Inc' },
    { id: 'd5', name: 'David Williams', title: 'Board Member', company: 'Horizon Enterprises' }
];

const mockAppointees = [
    { id: 'a1', name: 'Jennifer Lee', credentials: 'MBA, CPA', experience: '15 years finance' },
    { id: 'a2', name: 'Robert Taylor', credentials: 'JD, LLM', experience: '20 years legal' },
    { id: 'a3', name: 'Amanda Foster', credentials: 'PhD Economics', experience: '10 years academia' },
    { id: 'a4', name: 'James Park', credentials: 'MBA', experience: '12 years operations' },
    { id: 'a5', name: 'Maria Garcia', credentials: 'CFA', experience: '18 years investment banking' }
];

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
        (item) => `${item.name} <span style="color: var(--color-gray-500); font-size: var(--text-xs);">• ${item.jurisdiction}</span>`,
        (item) => {
            document.getElementById('selectedCompanyId').value = item.id;
            showSelectedItem('selectedCompany', item.name, 'companySearch', 'companyResults');
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
        (item) => `${item.name} <span style="color: var(--color-gray-500); font-size: var(--text-xs);">• ${item.title}</span>`,
        (item) => {
            document.getElementById('selectedDirectorId').value = item.id;
            showSelectedItem('selectedDirector', `${item.name} (${item.title})`, 'directorSearch', 'directorResults');
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
        (item) => `${item.name} <span style="color: var(--color-gray-500); font-size: var(--text-xs);">• ${item.credentials}</span>`,
        (item) => {
            document.getElementById('selectedAppointeeId').value = item.id;
            showSelectedItem('selectedAppointee', `${item.name} (${item.credentials})`, 'appointeeSearch', 'appointeeResults');
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

        const filtered = data.filter(item => 
            item.name.toLowerCase().includes(query)
        );

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
    
    // Create summary message from user
    const userSummary = `I've selected Pacific Polymer Logistics Pte. Ltd., replacing Wei Chen with Priya Nair`;
    
    if (currentChatId) {
        addMessageToChat(currentChatId, 'user', userSummary);
        
        // Simulate AI response acknowledging the selection
        setTimeout(() => {
            const response = `
                <div>
                    <p style="margin-bottom: var(--space-3);">Perfect. I'm preparing the appointment workflow for Pacific Polymer Logistics.</p>
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
    return `
        <div class="appointment-panel">
            <!-- Summary Section -->
            <section class="panel-section">
                <h4 class="panel-section-title">Appointment Summary</h4>
                
                <div class="summary-card">
                    <div class="summary-item">
                        <label class="summary-label">Company</label>
                        <div class="summary-value">Pacific Polymer Logistics Pte. Ltd.</div>
                        <div class="summary-meta">Subsidiary of Acme, Co (USA) • Domiciled in Singapore</div>
                    </div>
                    
                    <div class="summary-divider"></div>
                    
                    <div class="summary-item">
                        <label class="summary-label">Resigning Director</label>
                        <div class="summary-value">Wei Chen</div>
                        <div class="summary-meta">Current Board Member</div>
                    </div>
                    
                    <div class="summary-divider"></div>
                    
                    <div class="summary-item">
                        <label class="summary-label">Appointee</label>
                        <div class="summary-value">Priya Nair</div>
                        <div class="summary-meta">Incoming Director</div>
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
                            <div class="document-meta">For appointee signature (Singapore)</div>
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
                            <div class="document-name">ACRA Form 45 - Lodgement</div>
                            <div class="document-meta">Regulatory filing (ACRA Singapore)</div>
                        </div>
                        <button class="document-action" onclick="previewDocument('acra-form')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="document-action" onclick="downloadDocument('acra-form')">
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
                                Send Consent to Act and ACRA forms to <strong>Priya Nair</strong> for signature. Monitor inbox for signed documents.
                            </div>
                        </div>
                    </div>
                    
                    <div class="workflow-step">
                        <div class="workflow-step-number">3</div>
                        <div class="workflow-step-content">
                            <div class="workflow-step-title">Update Entity Records</div>
                            <div class="workflow-step-description">
                                Update <strong>Entities</strong> system to reflect Wei Chen's resignation and Priya Nair's appointment to the board.
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
            'acra-form': 'ACRA Form 45 - Lodgement'
        };
        addMessageToChat(currentChatId, 'assistant', 
            `Opening preview of ${docNames[docId]}... (Preview functionality would open document viewer here)`
        );
    }
}

function downloadDocument(docId) {
    if (currentChatId) {
        const docNames = {
            'board-resolution': 'Board_Resolution_Pacific_Polymer.pdf',
            'consent-form': 'Consent_to_Act_Priya_Nair.pdf',
            'acra-form': 'ACRA_Form_45_Pacific_Polymer.pdf'
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
    // Close the panel
    chatView.classList.remove('show-right-panel');
    
    if (currentChatId) {
        addMessageToChat(currentChatId, 'assistant', 
            `<div class="workflow-initiated">
                <h4 style="color: var(--color-gray-900); margin-bottom: var(--space-2);">✓ Appointment Workflow Started</h4>
                <p style="color: var(--color-gray-700); margin-bottom: var(--space-3);">
                    I'm coordinating the appointment of Priya Nair to Pacific Polymer Logistics Pte. Ltd.
                </p>
                <div style="background: var(--color-gray-50); border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: var(--space-3);">
                    <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
                        <div class="status-indicator status-active"></div>
                        <strong style="color: var(--color-gray-900);">Step 1:</strong> Creating board approval in Boards system...
                    </div>
                    <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
                        <div class="status-indicator status-pending"></div>
                        <strong style="color: var(--color-gray-900);">Step 2:</strong> Waiting to email forms to Priya Nair
                    </div>
                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                        <div class="status-indicator status-pending"></div>
                        <strong style="color: var(--color-gray-900);">Step 3:</strong> Waiting to update entity records
                    </div>
                </div>
                <p style="color: var(--color-gray-600); font-size: var(--text-sm); margin-top: var(--space-3);">
                    I'll keep you updated as each step completes. You can continue working while I handle this in the background.
                </p>
            </div>`
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
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}
