// ===== Enhanced LifeOS App with Backend Integration =====
class LifeOSApp {
    constructor() {
        this.tasks = [];
        this.notes = [];
        this.events = [];
        this.chatMessages = [];
        this.wellnessEntries = [];
        this.currentUser = { name: 'Ananya' };
        this.isDarkTheme = false;
        this.baseURL = '';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.updateGreeting();
        this.loadData();
        this.setupAutoRefresh();
    }

    // ===== API Integration =====
    async apiCall(method, endpoint, data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, options);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.showNotification('Connection error. Using local data.', 'error');
            throw error;
        }
    }

    // ===== Event Listeners =====
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => this.toggleSidebar());

        // Task management
        document.getElementById('newTaskBtn').addEventListener('click', () => this.openTaskModal());
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openTaskModal());
        document.getElementById('closeTaskModal').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('cancelTask').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        document.getElementById('prioritizeTasks').addEventListener('click', () => this.prioritizeTasks());

        // Chat
        document.getElementById('askAiBtn').addEventListener('click', () => this.focusChat());
        document.getElementById('floatingAiBtn').addEventListener('click', () => this.focusChat());
        document.getElementById('sendMessage').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });

        // Wellness
        document.getElementById('logMoodBtn').addEventListener('click', () => this.showMoodLogger());

        // Notes
        document.getElementById('newNoteBtn').addEventListener('click', () => this.createQuickNote());
        document.getElementById('uploadDocBtn').addEventListener('click', () => this.uploadDocument());

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Close modal on background click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') this.closeTaskModal();
        });
    }

    // ===== Theme Management =====
    setupTheme() {
        const savedTheme = localStorage.getItem('lifeos-theme');
        if (savedTheme === 'dark') {
            this.toggleTheme();
        }
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.classList.toggle('dark-theme', this.isDarkTheme);

        const icon = document.querySelector('.theme-icon');
        icon.className = this.isDarkTheme ? 'fas fa-moon theme-icon' : 'fas fa-sun theme-icon';

        localStorage.setItem('lifeos-theme', this.isDarkTheme ? 'dark' : 'light');
    }

    // ===== Sidebar Management =====
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }

    // ===== Greeting Management =====
    updateGreeting() {
        const now = new Date();
        const hour = now.getHours();
        let greeting = 'Good Evening';

        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 18) greeting = 'Good Afternoon';

        document.getElementById('greetingText').textContent = `${greeting}, ${this.currentUser.name}`;
    }

    // ===== Data Management with Backend Integration =====
    async loadData() {
        try {
            await Promise.all([
                this.loadTasks(),
                this.loadNotes(),
                this.loadEvents(),
                this.loadChatMessages(),
                this.loadWellnessData()
            ]);
        } catch (error) {
            console.log('Using local data fallback');
            this.loadLocalData();
        }
    }

    loadLocalData() {
        this.loadTasksLocal();
        this.loadNotesLocal();
        this.loadEventsLocal();
        this.loadChatMessagesLocal();
        this.loadWellnessDataLocal();
    }

    setupAutoRefresh() {
        // Refresh data every 30 seconds
        setInterval(() => {
            this.refreshData();
        }, 30000);
    }

    async refreshData() {
        try {
            await this.loadData();
        } catch (error) {
            // Silently fail and continue with local data
        }
    }

    // ===== Task Management with Backend =====
    async loadTasks() {
        try {
            this.tasks = await this.apiCall('GET', '/api/tasks');
            this.renderTasks();
            this.updateTaskStats();
        } catch (error) {
            this.loadTasksLocal();
        }
    }

    loadTasksLocal() {
        const saved = localStorage.getItem('lifeos-tasks');
        this.tasks = saved ? JSON.parse(saved) : this.getSampleTasks();
        this.renderTasks();
        this.updateTaskStats();
    }

    getSampleTasks() {
        return [{
                _id: this.generateId(),
                title: 'Review quarterly goals',
                description: 'Analyze Q3 performance and set Q4 objectives',
                priority: 'high',
                status: 'pending',
                dueDate: null,
                aiSuggestion: 'Schedule this for early morning when you\'re most focused',
                createdAt: new Date().toISOString()
            },
            {
                _id: this.generateId(),
                title: 'Complete project documentation',
                description: 'Write user guide and technical specifications',
                priority: 'medium',
                status: 'pending',
                dueDate: null,
                aiSuggestion: 'Break this into smaller 30-minute sessions',
                createdAt: new Date().toISOString()
            }
        ];
    }

    renderTasks() {
        const container = document.getElementById('taskList');
        container.innerHTML = '';

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
            const div = document.createElement('div');
            div.className = 'task-item fade-in';
            div.dataset.taskId = task._id || task.id;

            const priorityEmoji = {
                'high': '🔴',
                'medium': '🟡',
                'low': '🟢'
            };

            div.innerHTML = `
            <div class="task-checkbox ${task.status === 'completed' ? 'checked' : ''}" 
                 onclick="app.toggleTask('${task._id || task.id}')"></div>
            <div class="task-content">
                <div class="task-title ${task.status === 'completed' ? 'completed' : ''}">${task.title}</div>
                <div class="task-meta">
                    <span class="task-priority">${priorityEmoji[task.priority]}</span>
                    ${task.aiSuggestion ? `<span>AI: ${task.aiSuggestion}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="icon-btn" onclick="app.editTask('${task._id || task.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn" onclick="app.deleteTask('${task._id || task.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return div;
    }

    openTaskModal() {
        document.getElementById('taskModal').classList.add('active');
        document.getElementById('taskTitle').focus();
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        document.getElementById('taskForm').reset();
    }

    async handleTaskSubmit(e) {
        e.preventDefault();
        
        const task = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value || null,
            status: 'pending'
        };

        try {
            const newTask = await this.apiCall('POST', '/api/tasks', task);
            this.tasks.unshift(newTask);
            this.renderTasks();
            this.updateTaskStats();
            this.closeTaskModal();
            
            // Trigger AI optimization if enabled
            if (document.getElementById('aiOptimize').checked) {
                setTimeout(() => this.prioritizeTasks(), 1000);
            }
            
            this.showNotification('Task created successfully', 'success');
        } catch (error) {
            // Fallback to local storage
            task._id = this.generateId();
            task.createdAt = new Date().toISOString();
            this.tasks.unshift(task);
            this.renderTasks();
            this.updateTaskStats();
            this.closeTaskModal();
            this.saveLocalData();
            this.showNotification('Task created (offline)', 'success');
        }
    }

    async toggleTask(taskId) {
        const task = this.tasks.find(t => (t._id || t.id) === taskId);
        if (task) {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            
            try {
                await this.apiCall('PATCH', `/api/tasks/${taskId}`, { status: newStatus });
                task.status = newStatus;
                task.completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
            } catch (error) {
                // Update locally
                task.status = newStatus;
                task.completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
                this.saveLocalData();
            }
            
            this.renderTasks();
            this.updateTaskStats();
        }
    }

    async deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await this.apiCall('DELETE', `/api/tasks/${taskId}`);
                this.tasks = this.tasks.filter(t => (t._id || t.id) !== taskId);
            } catch (error) {
                // Delete locally
                this.tasks = this.tasks.filter(t => (t._id || t.id) !== taskId);
                this.saveLocalData();
            }
            
            this.renderTasks();
            this.updateTaskStats();
            this.showNotification('Task deleted', 'success');
        }
    }

    async prioritizeTasks() {
        try {
            await this.apiCall('POST', '/api/tasks/prioritize');
            await this.loadTasks();
            this.showNotification('Tasks prioritized with AI assistance', 'success');
        } catch (error) {
            // Fallback to local AI prioritization
            this.prioritizeTasksLocal();
        }
    }

    prioritizeTasksLocal() {
        this.tasks.forEach(task => {
            if (!task.aiSuggestion) {
                const suggestions = [
                    'Best tackled in the morning when you\'re fresh',
                    'Consider breaking this into smaller subtasks',
                    'Schedule during your peak productivity hours',
                    'Perfect for a focused work session',
                    'Good candidate for time-blocking'
                ];
                task.aiSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
            }
        });

        // Sort by priority
        this.tasks.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        this.renderTasks();
        this.saveLocalData();
        this.showNotification('Tasks prioritized with AI assistance', 'success');
    }

    updateTaskStats() {
        const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        const totalTasks = this.tasks.length;
        document.getElementById('taskProgress').textContent = `${completedTasks}/${totalTasks}`;
        
        this.updateAIInsight(completedTasks, totalTasks);
    }

    // ===== Chat Management with Backend =====
    async loadChatMessages() {
        try {
            this.chatMessages = await this.apiCall('GET', '/api/chat/messages');
            this.renderChatMessages();
        } catch (error) {
            this.loadChatMessagesLocal();
        }
    }

    loadChatMessagesLocal() {
        const saved = localStorage.getItem('lifeos-chat');
        this.chatMessages = saved ? JSON.parse(saved) : [];
        this.renderChatMessages();
    }

    renderChatMessages() {
        const container = document.getElementById('chatMessages');
        container.innerHTML = '';

        if (this.chatMessages.length === 0) {
            container.innerHTML = `
                <div class="chat-message assistant">
                    <div class="chat-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="chat-bubble assistant">
                        Hi ${this.currentUser.name}! I'm your AI productivity assistant. Ask me anything about your tasks, schedule, or how I can help optimize your day.
                    </div>
                </div>
            `;
            return;
        }

        this.chatMessages.forEach(message => {
            const messageElement = this.createChatMessage(message);
            container.appendChild(messageElement);
        });

        container.scrollTop = container.scrollHeight;
    }

    createChatMessage(message) {
        const div = document.createElement('div');
        div.className = `chat-message ${message.role} fade-in`;

        if (message.role === 'user') {
            div.innerHTML = `
                <div class="chat-bubble user">${message.content}</div>
                <div class="chat-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div class="chat-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="chat-bubble assistant">${message.content}</div>
            `;
        }

        return div;
    }

    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        const content = input.value.trim();
        
        if (!content) return;

        try {
            const response = await this.apiCall('POST', '/api/chat/messages', { content });
            this.chatMessages.push(response.userMessage, response.aiMessage);
            input.value = '';
            this.renderChatMessages();
        } catch (error) {
            // Fallback to local AI
            this.sendChatMessageLocal(content);
            input.value = '';
        }
    }

    sendChatMessageLocal(content) {
        const userMessage = {
            _id: this.generateId(),
            role: 'user',
            content: content,
            createdAt: new Date().toISOString()
        };

        this.chatMessages.push(userMessage);

        const aiResponse = this.generateAIResponse(content);
        const assistantMessage = {
            _id: this.generateId(),
            role: 'assistant',
            content: aiResponse,
            createdAt: new Date().toISOString()
        };

        this.chatMessages.push(assistantMessage);
        this.renderChatMessages();
        this.saveLocalData();
    }

    generateAIResponse(userInput) {
        const responses = {
            greeting: [
                `Hello ${this.currentUser.name}! How can I help you be more productive today?`,
                `Hi there! Ready to tackle your goals together?`,
                `Good to see you! What's on your mind today?`
            ],
            tasks: [
                'I see you have some pending tasks. Would you like me to help prioritize them?',
                'Based on your task list, I recommend focusing on high-priority items first.',
                'Consider time-blocking your tasks for better focus and productivity.'
            ],
            productivity: [
                'Here are some productivity tips: Take regular breaks, prioritize important tasks, and eliminate distractions.',
                'Your focus score has been improving! Keep up the great work.',
                'Try the Pomodoro technique - 25 minutes of focused work followed by a 5-minute break.'
            ],
            wellness: [
                'Remember to take care of your mental health. Regular breaks and stress management are important.',
                'How are you feeling today? Tracking your mood can help identify patterns.',
                'Consider some mindfulness exercises or a quick walk to boost your energy.'
            ],
            default: [
                'That\'s an interesting question! Could you tell me more about what you\'d like to accomplish?',
                'I\'m here to help with productivity, tasks, scheduling, and wellness. What would you like to focus on?',
                'Let me know how I can assist you with your daily planning and productivity goals.'
            ]
        };

        const lowerInput = userInput.toLowerCase();
        let category = 'default';

        if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
            category = 'greeting';
        } else if (lowerInput.includes('task') || lowerInput.includes('todo')) {
            category = 'tasks';
        } else if (lowerInput.includes('productive') || lowerInput.includes('focus') || lowerInput.includes('work')) {
            category = 'productivity';
        } else if (lowerInput.includes('mood') || lowerInput.includes('feel') || lowerInput.includes('stress')) {
            category = 'wellness';
        }

        const categoryResponses = responses[category];
        return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    }

    focusChat() {
        document.getElementById('chatInput').focus();
        document.getElementById('aiChat').scrollIntoView({ behavior: 'smooth' });
    }

    // ===== Notes Management with Backend =====
    async loadNotes() {
        try {
            this.notes = await this.apiCall('GET', '/api/notes');
            this.renderNotes();
            this.renderQuickNotes();
        } catch (error) {
            this.loadNotesLocal();
        }
    }

    loadNotesLocal() {
        const saved = localStorage.getItem('lifeos-notes');
        this.notes = saved ? JSON.parse(saved) : this.getSampleNotes();
        this.renderNotes();
        this.renderQuickNotes();
    }

    getSampleNotes() {
        return [
            {
                _id: this.generateId(),
                title: 'Meeting Notes - Q4 Planning',
                content: 'Key objectives for Q4: Increase user engagement by 25%, Launch new feature set, Improve customer satisfaction scores',
                summary: 'Q4 planning session focused on growth metrics and feature development',
                tags: ['meeting', 'planning', 'q4'],
                createdAt: new Date().toISOString(),
                type: 'note'
            },
            {
                _id: this.generateId(),
                title: 'Project Requirements.pdf',
                content: 'Technical specifications for the new user dashboard including wireframes, user stories, and acceptance criteria',
                summary: 'Comprehensive requirements document for dashboard redesign project',
                tags: ['project', 'requirements', 'dashboard'],
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                type: 'document'
            }
        ];
    }

    renderNotes() {
        const container = document.getElementById('notesList');
        container.innerHTML = '';

        if (this.notes.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-book" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Upload documents to get AI-powered summaries and insights</p>
                </div>
            `;
            return;
        }

        this.notes.forEach(note => {
            const noteElement = this.createNoteCard(note);
            container.appendChild(noteElement);
        });
    }

    createNoteCard(note) {
        const div = document.createElement('div');
        div.className = 'note-card fade-in';
        div.dataset.noteId = note._id || note.id;

        const fileIcon = this.getFileIcon(note.title);
        const tags = note.tags ? note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('') : '';

        div.innerHTML = `
            <div class="note-header">
                <div class="note-icon">${fileIcon}</div>
                <div class="note-info">
                    <div class="note-title">${note.title}</div>
                    <div class="note-date">${this.formatDate(note.createdAt)}</div>
                </div>
            </div>
            ${note.summary ? `<p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.75rem;">${note.summary}</p>` : ''}
            <div class="note-tags">${tags}</div>
        `;

        div.addEventListener('click', () => this.openNote(note._id || note.id));
        return div;
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return '📄';
            case 'doc':
            case 'docx': return '📝';
            case 'txt': return '📋';
            case 'ppt':
            case 'pptx': return '📊';
            default: return '📄';
        }
    }

    renderQuickNotes() {
        const container = document.getElementById('quickNotesList');
        const recentNotes = this.notes.slice(0, 3);
        
        container.innerHTML = '';

        if (recentNotes.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-sticky-note" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>Start capturing your thoughts and ideas</p>
                </div>
            `;
            return;
        }

        recentNotes.forEach(note => {
            const noteElement = this.createQuickNoteItem(note);
            container.appendChild(noteElement);
        });

        const today = new Date().toDateString();
        const todayNotes = this.notes.filter(note => 
            new Date(note.createdAt).toDateString() === today
        ).length;

        const footer = document.createElement('div');
        footer.style.cssText = 'margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;';
        footer.innerHTML = `
            <span style="font-size: 0.75rem; color: var(--text-muted);">${todayNotes} notes today</span>
            ${this.notes.length > 3 ? `<button class="link-btn" onclick="app.viewAllNotes()">View all (${this.notes.length})</button>` : ''}
        `;
        container.appendChild(footer);
    }

    createQuickNoteItem(note) {
        const div = document.createElement('div');
        div.className = 'quick-note-item fade-in';
        
        div.innerHTML = `
            <div class="quick-note-title">${note.title}</div>
            <div class="quick-note-preview">${note.content}</div>
        `;

        div.addEventListener('click', () => this.openNote(note._id || note.id));
        return div;
    }

    async createQuickNote() {
        const title = prompt('Note title (optional):') || `Note ${new Date().toLocaleString()}`;
        const content = prompt('Note content:');
        
        if (content) {
            const note = {
                title: title,
                content: content,
                tags: [],
                type: 'note'
            };

            try {
                const newNote = await this.apiCall('POST', '/api/notes', note);
                this.notes.unshift(newNote);
            } catch (error) {
                note._id = this.generateId();
                note.createdAt = new Date().toISOString();
                this.notes.unshift(note);
                this.saveLocalData();
            }

            this.renderNotes();
            this.renderQuickNotes();
            this.showNotification('Note created successfully', 'success');
        }
    }

    async uploadDocument() {
        const filename = prompt('Document filename (e.g., report.pdf):');
        if (filename) {
            const note = {
                title: filename,
                content: 'Document content would be extracted here...',
                summary: 'AI-generated summary would appear here after processing',
                tags: ['uploaded', 'document'],
                type: 'document'
            };

            try {
                const newNote = await this.apiCall('POST', '/api/notes', note);
                this.notes.unshift(newNote);
            } catch (error) {
                note._id = this.generateId();
                note.createdAt = new Date().toISOString();
                this.notes.unshift(note);
                this.saveLocalData();
            }

            this.renderNotes();
            this.renderQuickNotes();
            this.showNotification('Document uploaded successfully', 'success');
        }
    }

    // ===== Events Management with Backend =====
    async loadEvents() {
        try {
            this.events = await this.apiCall('GET', '/api/calendar/events');
            this.renderEvents();
        } catch (error) {
            this.loadEventsLocal();
        }
    }

    loadEventsLocal() {
        const saved = localStorage.getItem('lifeos-events');
        this.events = saved ? JSON.parse(saved) : this.getSampleEvents();
        this.renderEvents();
    }

    getSampleEvents() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(14, 0, 0, 0);

        return [
            {
                _id: this.generateId(),
                title: 'Team Stand-up',
                startTime: tomorrow.toISOString(),
                endTime: new Date(tomorrow.getTime() + 30 * 60000).toISOString(),
                type: 'event'
            },
            {
                _id: this.generateId(),
                title: 'Focus Block: Deep Work',
                startTime: new Date(tomorrow.getTime() + 2 * 60 * 60000).toISOString(),
                endTime: new Date(tomorrow.getTime() + 4 * 60 * 60000).toISOString(),
                type: 'focus-block'
            },
            {
                _id: this.generateId(),
                title: 'Project Review Meeting',
                startTime: nextWeek.toISOString(),
                endTime: new Date(nextWeek.getTime() + 60 * 60000).toISOString(),
                type: 'ai-suggested'
            }
        ];
    }

    renderEvents() {
        const container = document.getElementById('eventsList');
        const upcomingEvents = this.events
            .filter(event => new Date(event.startTime) > new Date())
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .slice(0, 4);

        container.innerHTML = '';

        if (upcomingEvents.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-calendar" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>No upcoming events. Your schedule is clear!</p>
                </div>
            `;
            return;
        }

        upcomingEvents.forEach(event => {
            const eventElement = this.createEventItem(event);
            container.appendChild(eventElement);
        });
    }

    createEventItem(event) {
        const div = document.createElement('div');
        div.className = 'event-item fade-in';

        const startTime = new Date(event.startTime);
        const relativeDate = this.getRelativeDate(startTime);
        const typeIcon = this.getEventTypeIcon(event.type);

        div.innerHTML = `
            <div class="event-indicator" style="background: ${this.getEventTypeColor(event.type)};"></div>
            <div class="event-content">
                <div class="event-title">${event.title}</div>
                <div class="event-time">
                    <span>${relativeDate}</span>
                    <i class="fas fa-clock" style="font-size: 0.75rem;"></i>
                    <span>${this.formatTime(startTime)}</span>
                </div>
            </div>
            <div class="event-icon">${typeIcon}</div>
        `;

        return div;
    }

    getEventTypeColor(type) {
        switch (type) {
            case 'ai-suggested': return 'var(--success-color)';
            case 'focus-block': return 'var(--accent-color)';
            default: return 'var(--primary-color)';
        }
    }

    getEventTypeIcon(type) {
        switch (type) {
            case 'ai-suggested': return '🤖';
            case 'focus-block': return '🎯';
            default: return '📅';
        }
    }

    // ===== Wellness Management with Backend =====
    async loadWellnessData() {
        try {
            this.wellnessEntries = await this.apiCall('GET', '/api/wellness');
            this.updateWellnessStats();
        } catch (error) {
            this.loadWellnessDataLocal();
        }
    }

    loadWellnessDataLocal() {
        const saved = localStorage.getItem('lifeos-wellness');
        this.wellnessEntries = saved ? JSON.parse(saved) : [];
        this.updateWellnessStats();
    }

    updateWellnessStats() {
        const latestEntry = this.wellnessEntries[0];
        const avgFocus = this.wellnessEntries.length > 0 
            ? Math.round(this.wellnessEntries.reduce((sum, e) => sum + (e.focusScore || 75), 0) / this.wellnessEntries.length)
            : 75;

        document.getElementById('focusScore').textContent = `${avgFocus}%`;
        document.getElementById('wellnessEmoji').textContent = latestEntry ? this.getMoodEmoji(latestEntry.mood) : '😊';
    }

    getMoodEmoji(mood) {
        const emojis = ['😢', '😕', '😐', '😊', '😄'];
        return emojis[mood - 1] || '😐';
    }

    async showMoodLogger() {
        const mood = prompt('How are you feeling today? (1-5, where 5 is great):');
        const focusScore = prompt('How focused do you feel? (0-100):');
        const notes = prompt('Any notes about your day? (optional):');

        if (mood && focusScore) {
            const entry = {
                mood: parseInt(mood),
                focusScore: parseInt(focusScore),
                notes: notes || ''
            };

            try {
                const newEntry = await this.apiCall('POST', '/api/wellness', entry);
                this.wellnessEntries.unshift(newEntry);
            } catch (error) {
                entry._id = this.generateId();
                entry.createdAt = new Date().toISOString();
                this.wellnessEntries.unshift(entry);
                this.saveLocalData();
            }

            this.updateWellnessStats();
            this.updateAIInsight();
            this.showNotification('Wellness data logged successfully', 'success');
        }
    }

    updateAIInsight(completedTasks = null, totalTasks = null) {
        if (completedTasks === null) {
            completedTasks = this.tasks.filter(t => t.status === 'completed').length;
            totalTasks = this.tasks.length;
        }

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const avgFocus = this.wellnessEntries.length > 0 
            ? Math.round(this.wellnessEntries.reduce((sum, e) => sum + (e.focusScore || 75), 0) / this.wellnessEntries.length)
            : 75;

        let insight;
        if (completionRate >= 70) {
            insight = "Great productivity! You're completing most of your tasks.";
        } else if (completionRate >= 50) {
            insight = "Your productivity is steady. Consider breaking larger tasks into smaller ones.";
        } else if (totalTasks === 0) {
            insight = `Welcome to LifeOS, ${this.currentUser.name}! Start by creating your first task.`;
        } else {
            insight = "Focus on completing high-priority tasks first. You've got this!";
        }

        if (avgFocus > 0 && this.wellnessEntries.length > 0) {
            insight += ` Your average focus score this week: ${avgFocus}%.`;
        }

        document.getElementById('insightText').textContent = insight;
    }

    // ===== Local Storage Fallback =====
    saveLocalData() {
        localStorage.setItem('lifeos-tasks', JSON.stringify(this.tasks));
        localStorage.setItem('lifeos-notes', JSON.stringify(this.notes));
        localStorage.setItem('lifeos-events', JSON.stringify(this.events));
        localStorage.setItem('lifeos-chat', JSON.stringify(this.chatMessages));
        localStorage.setItem('lifeos-wellness', JSON.stringify(this.wellnessEntries));
    }

    // ===== Navigation =====
    handleNavigation(e) {
        e.preventDefault();
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        e.currentTarget.classList.add('active');
        
        if (window.innerWidth <= 768) {
            this.toggleSidebar();
        }
    }

    // ===== Utility Functions =====
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    getRelativeDate(date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return this.formatDate(date);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-medium);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: var(--font-family);
            font-size: var(--font-size-sm);
        `;
        
        if (type === 'success') {
            notification.style.background = 'var(--success-color)';
        } else if (type === 'error') {
            notification.style.background = 'var(--danger-color)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// ===== Initialize App =====
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new LifeOSApp();
});

// ===== Responsive Behavior =====
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('open');
    }
});

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'k':
                e.preventDefault();
                app.focusChat();
                break;
            case 'n':
                e.preventDefault();
                app.openTaskModal();
                break;
            case '/':
                e.preventDefault();
                app.toggleTheme();
                break;
        }
    }
});