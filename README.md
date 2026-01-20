# Diligent Console - AI Assistant

A professional, minimalist Hero-style AI web application designed for board governance and administrative tasks. Built with the **wireframe-kit** design system for a clean, grayscale aesthetic.

## Features

### Two-View Interface

#### 1. Hero View (Initial Landing)
- **Welcome Message**: Personalized greeting for the user
- **Quick Action Buttons**:
  - Critical Notifications - Shows count of critical items requiring attention
  - Updated Chats - Displays number of chats with recent activity
  - Appoint a Director - Quick access to director appointment workflow
  - Open Application - Access to recent applications and forms
- **AI Prompt Box**: Gemini-style prompt with auto-expanding textarea
- **Suggestion Chips**: Quick access to common tasks

#### 2. Chat View (Multi-Panel Interface)
When a prompt is submitted, the interface transitions to a three-panel layout:

**Left Sidebar (280px)**
- Chat history with most recent conversations
- Active chat is highlighted
- Quick navigation back to hero view
- New chat button

**Main Panel (Flexible)**
- Full conversation thread with user and assistant messages
- Chat title at the top
- Message avatars and timestamps
- Chat input at the bottom with auto-expanding textarea
- Real-time message updates

**Right Panel (320px - slides in on demand)**
- Contextual information and details
- Toggleable via button in chat header
- Smooth slide-in animation from the right
- Can be closed to maximize chat space

#### 3. Hybrid Form Interface
Special workflows like "Appoint a Director" display an interactive form within the chat:

**Search & Select Fields**
- **Company Search**: Type-ahead search to select the company
- **Director Search**: Find the director to be replaced (enabled after company selection)
- **Appointee Search**: Select the new director appointee (enabled after director selection)

**Progressive Disclosure**
- Fields unlock sequentially as previous selections are made
- Selected items display as removable chips
- Clear any selection to modify and restart from that point

**Form Validation**
- Submit button disabled until all fields are complete
- Real-time search with mock company, director, and appointee data
- Cancel option to exit the workflow

## Design

- **Design System**: Built on wireframe-kit with CSS custom properties
- **Theme**: Light, professional, minimalist grayscale
- **Color Palette**: Neutral grayscale (gray-50 to gray-900) for a clean, wireframe aesthetic
- **Typography**: System fonts with consistent sizing scale (text-xs to text-3xl)
- **Spacing**: Consistent spacing scale using CSS variables (space-1 to space-16)
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Interactions**: Smooth animations and hover effects

## Usage

Simply open `index.html` in a web browser. No build process or dependencies required.

### Hero View
1. **Quick Actions**: Click any of the four action buttons to auto-populate and submit a prompt
2. **AI Prompt**: Type your question or request and press Enter (or click send)
3. **Suggestion Chips**: Click any suggestion chip to quickly execute common tasks

### Chat View
Once you submit a prompt, the interface transitions to the chat view:

1. **View Conversation**: See the full thread of messages between you and the AI
2. **Continue Chat**: Type follow-up questions in the chat input at the bottom
3. **Chat History**: Access previous conversations from the left sidebar
4. **New Chat**: Click the + button to start a fresh conversation
5. **Context Panel**: Click the panel icon in the header to open the right panel
6. **Return Home**: Click "Home" in the sidebar to return to the hero view

### Hybrid Forms
Certain workflows present interactive forms within the chat:

**Appoint a Director Workflow:**
1. Click "Appoint a Director" quick action or ask about appointing a director
2. Complete the three search fields in sequence:
   - Search and select the **Company**
   - Search and select the **Director** to replace
   - Search and select the **Appointee** (new director)
3. Review your selections (displayed as removable chips)
4. Click "Continue" to proceed with the appointment process
5. AI provides a summary and next steps based on your selections

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift + Enter**: New line in message

## Customization

- **User name**: Update in `index.html` (line 14)
- **Notification counts**: Adjust badge values in the HTML
- **Colors**: Modify CSS custom properties in `wireframe-kit/styles/wireframe.css`
- **Spacing & Typography**: Adjust design tokens in the wireframe CSS
- **Custom styles**: Override in `styles.css` while maintaining wireframe-kit variables
- **AI Integration**: Connect to actual AI API in `script.js` (replace mock responses)

## Design System Variables

The app uses CSS custom properties from wireframe-kit:

```css
/* Colors */
--color-gray-50 to --color-gray-900
--color-white, --color-black

/* Spacing */
--space-1 (4px) to --space-16 (64px)

/* Typography */
--text-xs (12px) to --text-3xl (30px)

/* Border Radius */
--radius-sm to --radius-xl
```

## Architecture

### State Management
- **View States**: Toggle between 'hero' and 'chat' views
- **Chat Sessions**: Each conversation is stored with a unique ID
- **Message History**: All messages persist within their chat session
- **Active Chat**: Track and highlight the current conversation

### Layout System
- **Grid-based**: CSS Grid for flexible three-panel layout
- **Responsive**: Adapts to mobile, tablet, and desktop screens
- **Smooth Transitions**: View changes and panel animations use CSS transitions
- **Panel System**: Right panel can be toggled independently

### Hybrid Form System
- **Inline Forms**: Interactive forms embedded directly in the chat thread
- **Progressive Disclosure**: Fields unlock sequentially based on previous selections
- **Type-ahead Search**: Real-time filtering as user types
- **Selection Management**: Removable chip-style selected items
- **Form Validation**: Submit button only enabled when form is complete
- **Mock Data**: Includes sample companies, directors, and appointees for demonstration

## Future Enhancements

- **Backend Integration**: Connect to real AI backend (OpenAI, Google Gemini, etc.)
- **Persistence**: Save chat history to localStorage or database
- **Authentication**: Add user management and secure sessions
- **Real-time**: Implement WebSocket for live updates
- **Rich Content**: Support markdown, code blocks, and file attachments
- **Context Panel**: Populate right panel with relevant documents and data
- **Search**: Add search functionality across chat history
- **Export**: Allow exporting conversations as PDF or text
