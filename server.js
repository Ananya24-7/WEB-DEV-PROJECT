import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// ES module equivalents for __dirname
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// MongoDB Connection with fallback
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifeos';
let mongoConnected = false;

mongoose.connect(mongoUri)
    .then(() => {
        console.log('Connected to MongoDB');
        mongoConnected = true;
        // Initialize sample data after connection
        setTimeout(() => {
            initializeSampleData();
        }, 1000);
    })
    .catch((error) => {
        console.log('MongoDB connection failed, running in offline mode:', error.message);
        mongoConnected = false;
    });

// ===== Database Schemas =====

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, default: 'Ananya' },
    email: { type: String, unique: true, sparse: true },
    theme: { type: String, default: 'light' },
    createdAt: { type: Date, default: Date.now }
});

// Task Schema
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    dueDate: Date,
    aiSuggestion: String,
    completedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Note Schema
const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: String,
    tags: [String],
    type: { type: String, enum: ['note', 'document'], default: 'note' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Calendar Event Schema
const calendarEventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    type: { type: String, enum: ['event', 'ai-suggested', 'focus-block'], default: 'event' },
    createdAt: { type: Date, default: Date.now }
});

// Wellness Entry Schema
const wellnessEntrySchema = new mongoose.Schema({
    mood: { type: Number, required: true, min: 1, max: 5 },
    focusScore: { type: Number, min: 0, max: 100 },
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const Note = mongoose.model('Note', noteSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
const WellnessEntry = mongoose.model('WellnessEntry', wellnessEntrySchema);

// ===== Helper Functions =====

// AI Response Generator
function generateAIResponse(userInput, context = {}) {
    const responses = {
        greeting: [
            'Hello Ananya! How can I help you be more productive today?',
            'Hi there! Ready to tackle your goals together?',
            'Good to see you! What\'s on your mind today?'
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

// Task AI Suggestions
function generateTaskSuggestions(tasks) {
    const suggestions = [
        'Best tackled in the morning when you\'re fresh',
        'Consider breaking this into smaller subtasks',
        'Schedule during your peak productivity hours',
        'Perfect for a focused work session',
        'Good candidate for time-blocking',
        'Try the Pomodoro technique for this one',
        'Delegate if possible to free up your time',
        'Set a specific deadline to maintain urgency'
    ];

    return tasks.map((task, index) => {
        if (!task.aiSuggestion) {
            task.aiSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        }
        return task;
    });
}

// ===== API Routes =====

// Tasks Routes
app.get('/api/tasks', async(req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
});

app.post('/api/tasks', async(req, res) => {
    try {
        const task = new Task(req.body);
        task.updatedAt = new Date();
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: 'Error creating task', error: error.message });
    }
});

app.patch('/api/tasks/:id', async(req, res) => {
    try {
        const updates = {...req.body, updatedAt: new Date() };
        if (updates.status === 'completed') {
            updates.completedAt = new Date();
        }

        const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: 'Error updating task', error: error.message });
    }
});

app.delete('/api/tasks/:id', async(req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
});

app.post('/api/tasks/prioritize', async(req, res) => {
    try {
        const tasks = await Task.find({ status: 'pending' });
        const updatedTasks = generateTaskSuggestions(tasks);

        // Update tasks with AI suggestions
        for (const task of updatedTasks) {
            await Task.findByIdAndUpdate(task._id, {
                aiSuggestion: task.aiSuggestion,
                updatedAt: new Date()
            });
        }

        res.json({ message: 'Tasks prioritized successfully', count: updatedTasks.length });
    } catch (error) {
        res.status(500).json({ message: 'Error prioritizing tasks', error: error.message });
    }
});

// Notes Routes
app.get('/api/notes', async(req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes', error: error.message });
    }
});

app.post('/api/notes', async(req, res) => {
    try {
        const note = new Note(req.body);
        note.updatedAt = new Date();
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ message: 'Error creating note', error: error.message });
    }
});

app.patch('/api/notes/:id', async(req, res) => {
    try {
        const updates = {...req.body, updatedAt: new Date() };
        const note = await Note.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(400).json({ message: 'Error updating note', error: error.message });
    }
});

app.post('/api/notes/:id/summarize', async(req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Simulate AI summarization
        const summary = `AI-generated summary: ${note.content.substring(0, 100)}...`;
        const tags = ['ai-processed', 'summarized'];

        note.summary = summary;
        note.tags = [...(note.tags || []), ...tags];
        note.updatedAt = new Date();
        await note.save();

        res.json({ note, analysis: { summary, tags } });
    } catch (error) {
        res.status(500).json({ message: 'Error summarizing note', error: error.message });
    }
});

// Chat Routes
app.get('/api/chat/messages', async(req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const messages = await ChatMessage.find()
            .sort({ createdAt: 1 })
            .limit(limit);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
});

app.post('/api/chat/messages', async(req, res) => {
    try {
        const { content } = req.body;

        // Save user message
        const userMessage = new ChatMessage({
            role: 'user',
            content: content
        });
        await userMessage.save();

        // Get context for AI response
        const recentTasks = await Task.find().limit(5);
        const upcomingEvents = await CalendarEvent.find({
            startTime: { $gte: new Date() }
        }).limit(3);
        const latestWellness = await WellnessEntry.findOne().sort({ createdAt: -1 });

        const context = {
            recentTasks: recentTasks.map(t => ({ title: t.title, status: t.status })),
            upcomingEvents: upcomingEvents.map(e => ({ title: e.title, startTime: e.startTime })),
            wellnessData: latestWellness ? { mood: latestWellness.mood, focusScore: latestWellness.focusScore } : null
        };

        // Generate AI response
        const aiContent = generateAIResponse(content, context);

        // Save AI message
        const aiMessage = new ChatMessage({
            role: 'assistant',
            content: aiContent
        });
        await aiMessage.save();

        res.json({ userMessage, aiMessage });
    } catch (error) {
        res.status(500).json({ message: 'Error processing chat message', error: error.message });
    }
});

// Calendar Routes
app.get('/api/calendar/events', async(req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.startTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const events = await CalendarEvent.find(query).sort({ startTime: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
});

app.post('/api/calendar/events', async(req, res) => {
    try {
        const event = new CalendarEvent(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: 'Error creating event', error: error.message });
    }
});

// Wellness Routes
app.get('/api/wellness', async(req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 7;
        const entries = await WellnessEntry.find()
            .sort({ createdAt: -1 })
            .limit(limit);
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wellness data', error: error.message });
    }
});

app.post('/api/wellness', async(req, res) => {
    try {
        const entry = new WellnessEntry(req.body);
        await entry.save();
        res.status(201).json(entry);
    } catch (error) {
        res.status(400).json({ message: 'Error creating wellness entry', error: error.message });
    }
});

// Analytics Routes
app.get('/api/analytics/productivity', async(req, res) => {
    try {
        const tasks = await Task.find();
        const wellnessEntries = await WellnessEntry.find().limit(30);

        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const totalTasks = tasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const avgFocusScore = wellnessEntries.length > 0 ?
            Math.round(wellnessEntries.reduce((sum, e) => sum + (e.focusScore || 0), 0) / wellnessEntries.length) :
            0;

        // Generate insights
        const insights = [];
        const recommendations = [];

        if (completionRate >= 80) {
            insights.push('Excellent task completion rate!');
            recommendations.push('Keep up the great work and maintain your productivity momentum.');
        } else if (completionRate >= 60) {
            insights.push('Good productivity levels with room for improvement.');
            recommendations.push('Consider time-blocking to increase focus on important tasks.');
        } else {
            insights.push('Task completion could be improved.');
            recommendations.push('Try breaking larger tasks into smaller, manageable chunks.');
        }

        if (avgFocusScore >= 80) {
            insights.push('High focus scores indicate good concentration levels.');
        } else if (avgFocusScore >= 60) {
            insights.push('Focus levels are moderate - consider optimizing your work environment.');
            recommendations.push('Try using the Pomodoro technique for better focus.');
        } else if (avgFocusScore > 0) {
            insights.push('Focus scores suggest difficulty maintaining concentration.');
            recommendations.push('Consider eliminating distractions and taking regular breaks.');
        }

        const analysis = {
            insights,
            recommendations,
            focusTrend: avgFocusScore >= 70 ? 'improving' : avgFocusScore >= 50 ? 'stable' : 'declining',
            productivityScore: Math.round((completionRate + avgFocusScore) / 2)
        };

        res.json({
            ...analysis,
            stats: {
                completedTasks,
                totalTasks,
                completionRate,
                avgFocusScore
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating analytics', error: error.message });
    }
});

// User Routes
app.get('/api/user', async(req, res) => {
    try {
        let user = await User.findOne();
        if (!user) {
            user = new User({ name: 'Ananya' });
            await user.save();
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

app.patch('/api/user', async(req, res) => {
    try {
        let user = await User.findOne();
        if (!user) {
            user = new User({ name: 'Ananya' });
        }

        Object.assign(user, req.body);
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: 'Error updating user', error: error.message });
    }
});

// ===== Initialize Sample Data =====
async function initializeSampleData() {
    try {
        // Check if data already exists
        const taskCount = await Task.countDocuments();
        const noteCount = await Note.countDocuments();
        const eventCount = await CalendarEvent.countDocuments();

        if (taskCount === 0) {
            // Create sample tasks
            const sampleTasks = [{
                    title: 'Review quarterly goals',
                    description: 'Analyze Q3 performance and set Q4 objectives',
                    priority: 'high',
                    aiSuggestion: 'Schedule this for early morning when you\'re most focused'
                },
                {
                    title: 'Complete project documentation',
                    description: 'Write user guide and technical specifications',
                    priority: 'medium',
                    aiSuggestion: 'Break this into smaller 30-minute sessions'
                },
                {
                    title: 'Team meeting preparation',
                    description: 'Prepare agenda and talking points for weekly team sync',
                    priority: 'medium',
                    aiSuggestion: 'Perfect for a focused morning session'
                }
            ];

            await Task.insertMany(sampleTasks);
            console.log('Sample tasks created');
        }

        if (noteCount === 0) {
            // Create sample notes
            const sampleNotes = [{
                    title: 'Meeting Notes - Q4 Planning',
                    content: 'Key objectives for Q4: Increase user engagement by 25%, Launch new feature set, Improve customer satisfaction scores. Discussed timeline and resource allocation.',
                    summary: 'Q4 planning session focused on growth metrics and feature development',
                    tags: ['meeting', 'planning', 'q4'],
                    type: 'note'
                },
                {
                    title: 'Project Requirements.pdf',
                    content: 'Technical specifications for the new user dashboard including wireframes, user stories, and acceptance criteria. Full requirements document with 50+ pages of detailed specifications.',
                    summary: 'Comprehensive requirements document for dashboard redesign project',
                    tags: ['project', 'requirements', 'dashboard'],
                    type: 'document'
                }
            ];

            await Note.insertMany(sampleNotes);
            console.log('Sample notes created');
        }

        if (eventCount === 0) {
            // Create sample events
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);

            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            nextWeek.setHours(14, 0, 0, 0);

            const sampleEvents = [{
                    title: 'Team Stand-up',
                    startTime: tomorrow,
                    endTime: new Date(tomorrow.getTime() + 30 * 60000),
                    type: 'event'
                },
                {
                    title: 'Focus Block: Deep Work',
                    startTime: new Date(tomorrow.getTime() + 2 * 60 * 60000),
                    endTime: new Date(tomorrow.getTime() + 4 * 60 * 60000),
                    type: 'focus-block'
                },
                {
                    title: 'Project Review Meeting',
                    description: 'Weekly project status review and planning session',
                    startTime: nextWeek,
                    endTime: new Date(nextWeek.getTime() + 60 * 60000),
                    type: 'ai-suggested'
                }
            ];

            await CalendarEvent.insertMany(sampleEvents);
            console.log('Sample events created');
        }

    } catch (error) {
        console.error('Error initializing sample data:', error);
    }
}

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, async() => {
    console.log(`LifeOS server running on port ${PORT}`);

    // Initialize sample data
    setTimeout(() => {
        initializeSampleData();
    }, 2000);
});

export default app;