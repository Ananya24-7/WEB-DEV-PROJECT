# LifeOS API Reference

## 🔌 Base URL & Authentication

```
Base URL: https://api.lifeos.app/v1
Local Development: http://localhost:3000/api
```

### Headers
```http
Content-Type: application/json
Authorization: Bearer {token}  # For authenticated requests
```

## 📋 Task Management API

### GET /api/tasks
Retrieve all tasks for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a8b2c1234567890abcde",
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "priority": "high",
      "status": "pending",
      "dueDate": "2024-02-15T09:00:00.000Z",
      "aiSuggestion": "Best tackled in the morning when you're fresh",
      "tags": ["documentation", "project"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "priority": "high",
  "dueDate": "2024-02-15T09:00:00.000Z",
  "tags": ["documentation", "project"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a8b2c1234567890abcde",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "priority": "high",
    "status": "pending",
    "dueDate": "2024-02-15T09:00:00.000Z",
    "aiSuggestion": "Consider breaking this into smaller 30-minute sessions",
    "tags": ["documentation", "project"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### PATCH /api/tasks/:id
Update an existing task.

**Request Body:**
```json
{
  "status": "completed",
  "priority": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a8b2c1234567890abcde",
    "title": "Complete project documentation",
    "status": "completed",
    "completedAt": "2024-01-16T14:20:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

### DELETE /api/tasks/:id
Delete a task.

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### POST /api/tasks/prioritize
AI-powered task prioritization.

**Response:**
```json
{
  "success": true,
  "message": "Tasks prioritized successfully",
  "data": {
    "tasksUpdated": 5,
    "aiSuggestionsAdded": 3
  }
}
```

## 🤖 AI Chat API

### GET /api/chat/messages
Retrieve chat message history.

**Query Parameters:**
- `limit` (optional): Number of messages to retrieve (default: 20)
- `before` (optional): Get messages before this timestamp

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a8b2c1234567890abcde",
      "role": "user",
      "content": "How can I improve my productivity?",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "64f5a8b2c1234567890abcdf",
      "role": "assistant",
      "content": "Based on your recent tasks, I recommend focusing on high-priority items first and using time-blocking techniques.",
      "createdAt": "2024-01-15T10:30:05.000Z"
    }
  ],
  "count": 2,
  "hasMore": false
}
```

### POST /api/chat/messages
Send a message to the AI assistant.

**Request Body:**
```json
{
  "content": "How can I improve my productivity?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "_id": "64f5a8b2c1234567890abcde",
      "role": "user",
      "content": "How can I improve my productivity?",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "aiMessage": {
      "_id": "64f5a8b2c1234567890abcdf",
      "role": "assistant",
      "content": "Based on your recent tasks, I recommend focusing on high-priority items first and using time-blocking techniques.",
      "createdAt": "2024-01-15T10:30:05.000Z"
    }
  }
}
```

## 📝 Notes API

### GET /api/notes
Retrieve all notes.

**Query Parameters:**
- `type` (optional): Filter by type (`note` or `document`)
- `tags` (optional): Comma-separated list of tags
- `search` (optional): Search in title and content

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a8b2c1234567890abcde",
      "title": "Meeting Notes - Q4 Planning",
      "content": "Key objectives for Q4: Increase user engagement by 25%...",
      "summary": "Q4 planning session focused on growth metrics",
      "tags": ["meeting", "planning", "q4"],
      "type": "note",
      "metadata": {
        "wordCount": 150,
        "readingTime": 1
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### POST /api/notes
Create a new note.

**Request Body:**
```json
{
  "title": "Meeting Notes - Q4 Planning",
  "content": "Key objectives for Q4: Increase user engagement by 25%",
  "tags": ["meeting", "planning", "q4"],
  "type": "note"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a8b2c1234567890abcde",
    "title": "Meeting Notes - Q4 Planning",
    "content": "Key objectives for Q4: Increase user engagement by 25%",
    "summary": "Auto-generated summary will appear here",
    "tags": ["meeting", "planning", "q4"],
    "type": "note",
    "metadata": {
      "wordCount": 150,
      "readingTime": 1
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /api/notes/:id/summarize
Generate AI summary for a note.

**Response:**
```json
{
  "success": true,
  "data": {
    "note": {
      "_id": "64f5a8b2c1234567890abcde",
      "summary": "Q4 planning meeting discussing growth targets and feature development",
      "tags": ["meeting", "planning", "q4", "ai-processed"]
    },
    "analysis": {
      "summary": "Q4 planning meeting discussing growth targets and feature development",
      "keyPoints": [
        "25% user engagement increase target",
        "New feature set launch planned",
        "Customer satisfaction improvement focus"
      ],
      "tags": ["ai-processed", "summarized"]
    }
  }
}
```

## 📅 Calendar API

### GET /api/calendar/events
Retrieve calendar events.

**Query Parameters:**
- `startDate` (optional): Start date filter (ISO 8601)
- `endDate` (optional): End date filter (ISO 8601)
- `type` (optional): Filter by event type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a8b2c1234567890abcde",
      "title": "Team Stand-up",
      "description": "Daily team synchronization meeting",
      "startTime": "2024-01-16T09:00:00.000Z",
      "endTime": "2024-01-16T09:30:00.000Z",
      "type": "event",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### POST /api/calendar/events
Create a new calendar event.

**Request Body:**
```json
{
  "title": "Team Stand-up",
  "description": "Daily team synchronization meeting",
  "startTime": "2024-01-16T09:00:00.000Z",
  "endTime": "2024-01-16T09:30:00.000Z",
  "type": "event"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a8b2c1234567890abcde",
    "title": "Team Stand-up",
    "description": "Daily team synchronization meeting",
    "startTime": "2024-01-16T09:00:00.000Z",
    "endTime": "2024-01-16T09:30:00.000Z",
    "type": "event",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## 💚 Wellness API

### GET /api/wellness
Retrieve wellness entries.

**Query Parameters:**
- `limit` (optional): Number of entries to retrieve (default: 7)
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a8b2c1234567890abcde",
      "mood": 4,
      "focusScore": 85,
      "notes": "Great focus today, completed most tasks",
      "createdAt": "2024-01-15T18:00:00.000Z"
    }
  ],
  "count": 1,
  "averages": {
    "mood": 4.2,
    "focusScore": 78.5
  }
}
```

### POST /api/wellness
Log wellness data.

**Request Body:**
```json
{
  "mood": 4,
  "focusScore": 85,
  "notes": "Great focus today, completed most tasks"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a8b2c1234567890abcde",
    "mood": 4,
    "focusScore": 85,
    "notes": "Great focus today, completed most tasks",
    "createdAt": "2024-01-15T18:00:00.000Z"
  }
}
```

## 📊 Analytics API

### GET /api/analytics/productivity
Get productivity analytics and insights.

**Query Parameters:**
- `period` (optional): Time period (`week`, `month`, `quarter`)
- `includeRecommendations` (optional): Include AI recommendations

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "completedTasks": 15,
      "totalTasks": 20,
      "completionRate": 75,
      "avgFocusScore": 82
    },
    "insights": [
      "Excellent task completion rate!",
      "High focus scores indicate good concentration levels"
    ],
    "recommendations": [
      "Keep up the great work and maintain your productivity momentum",
      "Consider time-blocking to increase focus on important tasks"
    ],
    "trends": {
      "focusTrend": "improving",
      "productivityScore": 78,
      "weekOverWeekChange": 12
    },
    "chartData": {
      "dailyTasks": [3, 5, 2, 4, 6, 3, 2],
      "focusScores": [75, 80, 85, 78, 82, 88, 85],
      "moodTrend": [3, 4, 4, 5, 4, 5, 4]
    }
  }
}
```

## 👤 User API

### GET /api/user
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a8b2c1234567890abcde",
    "name": "Ananya",
    "email": "ananya@example.com",
    "preferences": {
      "theme": "light",
      "notifications": true,
      "aiSuggestions": true,
      "timeZone": "UTC"
    },
    "stats": {
      "totalTasks": 156,
      "completedTasks": 142,
      "totalNotes": 23,
      "daysActive": 45
    },
    "createdAt": "2023-12-01T10:00:00.000Z",
    "lastLoginAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### PATCH /api/user
Update user profile.

**Request Body:**
```json
{
  "name": "Ananya Sharma",
  "preferences": {
    "theme": "dark",
    "notifications": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a8b2c1234567890abcde",
    "name": "Ananya Sharma",
    "preferences": {
      "theme": "dark",
      "notifications": false,
      "aiSuggestions": true,
      "timeZone": "UTC"
    },
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## ⚠️ Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "title",
      "reason": "Title is required"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_64f5a8b2c1234567890abcde"
}
```

### Common Error Codes
- `400` - Bad Request / Validation Error
- `401` - Unauthorized / Authentication Required
- `403` - Forbidden / Insufficient Permissions
- `404` - Not Found / Resource Doesn't Exist
- `429` - Too Many Requests / Rate Limited
- `500` - Internal Server Error

## 🔧 Rate Limiting

### Limits
- **General API**: 100 requests per minute per user
- **AI Chat**: 20 requests per minute per user
- **File Upload**: 5 requests per minute per user

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1642234567
```

## 📝 Request Examples

### Using cURL
```bash
# Get all tasks
curl -X GET "https://api.lifeos.app/v1/api/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Create a task
curl -X POST "https://api.lifeos.app/v1/api/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete API documentation",
    "priority": "high",
    "description": "Write comprehensive API docs"
  }'
```

### Using JavaScript Fetch
```javascript
// Get tasks
const response = await fetch('/api/tasks', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Create task
const newTask = await fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Complete API documentation',
    priority: 'high',
    description: 'Write comprehensive API docs'
  })
});
```

## 🔄 Webhook Events

### Available Events
- `task.created` - New task created
- `task.completed` - Task marked as completed
- `note.created` - New note created
- `wellness.logged` - Wellness data logged
- `chat.message` - New chat message

### Webhook Payload Example
```json
{
  "event": "task.completed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "taskId": "64f5a8b2c1234567890abcde",
    "title": "Complete project documentation",
    "completedAt": "2024-01-15T10:30:00.000Z"
  }
}
```
