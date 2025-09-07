// ===== Global State Management =====
class LifeOSApp {
    constructor() {
        this.tasks = [];
        this.notes = [];
        this.events = [];
        this.chatMessages = [];
        this.wellnessEntries = [];
        this.currentUser = { name: 'Ananya' };
        this.isDarkTheme = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.updateGreeting();
        this.loadData();
        this.setupAutoSave();
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

    // ===== Data Management =====
    loadData() {
        this.loadTasks();
        this.loadNotes();
        this.loadEvents();
        this.loadChatMessages();
        this.loadWellnessData();
    }

    saveData() {
        localStorage.setItem('lifeos-tasks', JSON.stringify(this.tasks));
        localStorage.setItem('lifeos-notes', JSON.stringify(this.notes));
        localStorage.setItem('lifeos-events', JSON.stringify(this.events));
        localStorage.setItem('lifeos-chat', JSON.stringify(this.chatMessages));
        localStorage.setItem('lifeos-wellness', JSON.stringify(this.wellnessEntries));
    }

    setupAutoSave() {
        setInterval(() => this.saveData(), 30000); // Auto-save every 30 seconds
        window.addEventListener('beforeunload', () => this.saveData());
    }

    // ===== Task Management =====
    loadTasks() {
        const saved = localStorage.getItem('lifeos-tasks');
        this.tasks = saved ? JSON.parse(saved) : this.getSampleTasks();
        this.renderTasks();
        this.updateTaskStats();
    }

    getSampleTasks() {
        return [{
                id: this.generateId(),
                title: 'Review quarterly goals',
                description: 'Analyze Q3 performance and set Q4 objectives',
                priority: 'high',
                status: 'pending',
                dueDate: null,
                aiSuggestion: 'Schedule this for early morning when you\'re most focused',
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
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
            div.dataset.taskId = task.id;

            const priorityEmoji = {
                'high': '🔴',
                'medium': '🟡',
                'low': '🟢'
            };

            div.innerHTML = `
            <div class="task-checkbox ${task.status === 'completed' ? 'checked' : ''}" 
                 onclick="app.toggleTask('${task.id}')"></div>
            <div class="task-content">
                <div class="task-title ${task.status === 'completed' ? 'completed' : ''}">${task.title}</div>
                <div class="task-meta">
                    <span class="task-priority">${priorityEmoji[task.priority]}</span>
                    ${task.aiSuggestion ? `<span>AI: ${task.aiSuggestion}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="icon-btn" onclick="app.editTask('${task.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn" onclick="app.deleteTask('${task.id}')" title="Delete">
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

    handleTaskSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const task = {
            id: this.generateId(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value || null,
            status: 'pending',
            aiSuggestion: null,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.renderTasks();
        this.updateTaskStats();
        this.closeTaskModal();
        this.saveData();

        // Simulate AI optimization if enabled
        if (document.getElementById('aiOptimize').checked) {
            setTimeout(() => this.prioritizeTasks(), 1000);
        }

        this.showNotification('Task created successfully', 'success');
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = task.status === 'completed' ? 'pending' : 'completed';
            task.completedAt = task.status === 'completed' ? new Date().toISOString() : null;
            this.renderTasks();
            this.updateTaskStats();
            this.saveData();
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.renderTasks();
            this.updateTaskStats();
            this.saveData();
            this.showNotification('Task deleted', 'success');
        }
    }

    prioritizeTasks() {
        // Simulate AI prioritization
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
        this.saveData();
        this.showNotification('Tasks prioritized with AI assistance', 'success');
    }

    updateTaskStats() {
        const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        const totalTasks = this.tasks.length;
        document.getElementById('taskProgress').textContent = `${completedTasks}/${totalTasks}`;
        
        // Update AI insight
        this.updateAIInsight(completedTasks, totalTasks);
    }

    // ===== Chat Management =====
    loadChatMessages() {
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

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const content = input.value.trim();
        
        if (!content) return;

        // Add user message
        const userMessage = {
            id: this.generateId(),
            role: 'user',
            content: content,
            timestamp: new Date().toISOString()
        };

        this.chatMessages.push(userMessage);
        input.value = '';

        // Generate AI response
        const aiResponse = this.generateAIResponse(content);
        const assistantMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
        };

        this.chatMessages.push(assistantMessage);
        this.renderChatMessages();
        this.saveData();
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
        // Scroll to chat if needed
        document.getElementById('aiChat').scrollIntoView({ behavior: 'smooth' });
    }

    // ===== Notes Management =====
    loadNotes() {
        const saved = localStorage.getItem('lifeos-notes');
        this.notes = saved ? JSON.parse(saved) : this.getSampleNotes();
        this.renderNotes();
        this.renderQuickNotes();
    }

    getSampleNotes() {
        return [
            {
                id: this.generateId(),
                title: 'Meeting Notes - Q4 Planning',
                content: 'Key objectives for Q4: Increase user engagement by 25%, Launch new feature set, Improve customer satisfaction scores',
                summary: 'Q4 planning session focused on growth metrics and feature development',
                tags: ['meeting', 'planning', 'q4'],
                createdAt: new Date().toISOString(),
                type: 'note'
            },
            {
                id: this.generateId(),
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
                <div class="empty-state">
                    <i class="fas fa-book" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
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
        div.dataset.noteId = note.id;

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

        div.addEventListener('click', () => this.openNote(note.id));
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

        // Add notes count
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

        div.addEventListener('click', () => this.openNote(note.id));
        return div;
    }

    createQuickNote() {
        const title = prompt('Note title (optional):') || `Note ${new Date().toLocaleString()}`;
        const content = prompt('Note content:');
        
        if (content) {
            const note = {
                id: this.generateId(),
                title: title,
                content: content,
                tags: [],
                createdAt: new Date().toISOString(),
                type: 'note'
            };

            this.notes.unshift(note);
            this.renderNotes();
            this.renderQuickNotes();
            this.saveData();
            this.showNotification('Note created successfully', 'success');
        }
    }

    uploadDocument() {
        // Simulate document upload
        const filename = prompt('Document filename (e.g., report.pdf):');
        if (filename) {
            const note = {
                id: this.generateId(),
                title: filename,
                content: 'Document content would be extracted here...',
                summary: 'AI-generated summary would appear here after processing',
                tags: ['uploaded', 'document'],
                createdAt: new Date().toISOString(),
                type: 'document'
            };

            this.notes.unshift(note);
            this.renderNotes();
            this.renderQuickNotes();
            this.saveData();
            this.showNotification('Document uploaded successfully', 'success');
        }
    }

    // ===== Events Management =====
    loadEvents() {
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
                id: this.generateId(),
                title: 'Team Stand-up',
                startTime: tomorrow.toISOString(),
                endTime: new Date(tomorrow.getTime() + 30 * 60000).toISOString(),
                type: 'event'
            },
            {
                id: this.generateId(),
                title: 'Focus Block: Deep Work',
                startTime: new Date(tomorrow.getTime() + 2 * 60 * 60000).toISOString(),
                endTime: new Date(tomorrow.getTime() + 4 * 60 * 60000).toISOString(),
                type: 'focus-block'
            },
            {
                id: this.generateId(),
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
        const endTime = new Date(event.endTime);
        const relativeDate = this.getRelativeDate(startTime);
        const duration = this.getDuration(startTime, endTime);
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

    // ===== Wellness Management =====
    loadWellnessData() {
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

    showMoodLogger() {
        const mood = prompt('How are you feeling today? (1-5, where 5 is great):');
        const focusScore = prompt('How focused do you feel? (0-100):');
        const notes = prompt('Any notes about your day? (optional):');

        if (mood && focusScore) {
            const entry = {
                id: this.generateId(),
                mood: parseInt(mood),
                focusScore: parseInt(focusScore),
                notes: notes || '',
                createdAt: new Date().toISOString()
            };

            this.wellnessEntries.unshift(entry);
            this.updateWellnessStats();
            this.updateAIInsight();
            this.saveData();
            this.showNotification('Wellness data logged successfully', 'success');
        }
    }

    updateAIInsight(completedTasks = null, totalTasks = null) {
        if (completedTasks === null) {
            completedTasks = this.tasks.filter(t => t.status === 'completed').length;
            totalTasks = this.tasks.length;
        }

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const latestWellness = this.wellnessEntries[0];
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

    // ===== Navigation =====
    handleNavigation(e) {
        e.preventDefault();
        
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        e.currentTarget.classList.add('active');
        
        // Close sidebar on mobile
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

    getDuration(start, end) {
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${mins}m`;
    }

    showNotification(message, type = 'info') {
        // Create notification element
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
        `;
        
        if (type === 'success') {
            notification.style.background = 'var(--success-color)';
        } else if (type === 'error') {
            notification.style.background = 'var(--danger-color)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
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

// ===== Service Worker Registration (for PWA functionality) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}