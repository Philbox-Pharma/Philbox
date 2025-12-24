# Socket.IO Events Reference - Task Management

## Quick Reference

This document provides a quick reference for all Socket.IO events used in the task management system.

---

## Room Structure

### Room Naming Convention

- **Salesperson Room:** `salesperson:${salespersonId}`
- **Admin Room:** `admin:${adminId}`
- **Branch Room:** `branch:${branchId}`

### Joining Rooms (Client-Side)

```javascript
// Salesperson joins their room
socket.emit("join", { room: `salesperson:${salespersonId}` });

// Admin joins their room
socket.emit("join", { room: `admin:${adminId}` });

// Admin joins branch room for monitoring
socket.emit("join", { room: `branch:${branchId}` });
```

---

## Events from Admin to Salesperson

### 1. `task:created`

**Triggered:** When admin creates a new task
**Target:** Salesperson's room
**Payload:**

```javascript
{
  taskId: "65f1234567890abcdef99999",
  title: "Follow up with pending customers",
  priority: "high",                        // low | medium | high | urgent
  deadline: "2024-02-15T23:59:59.999Z",
  assignedBy: {
    _id: "65f1234567890abcdef11111",
    name: "Admin Name",
    category: "super-admin"                // super-admin | branch-admin
  },
  timestamp: "2024-02-01T10:00:00.000Z"
}
```

**Client Handler:**

```javascript
socket.on("task:created", (data) => {
  showNotification(`New task: ${data.title}`);
  addTaskToList(data);
  playNotificationSound();
});
```

---

### 2. `task:updated`

**Triggered:** When admin updates task details
**Target:** Salesperson's room
**Payload:**

```javascript
{
  taskId: "65f1234567890abcdef99999",
  title: "Updated: Follow up with pending customers",
  changes: {
    priority: "urgent",
    deadline: "2024-02-14T23:59:59.999Z",
    description: "Updated description"
  },
  updatedBy: {
    _id: "65f1234567890abcdef11111",
    name: "Admin Name",
    category: "super-admin"
  },
  timestamp: "2024-02-01T11:00:00.000Z"
}
```

**Client Handler:**

```javascript
socket.on("task:updated", (data) => {
  showNotification(`Task updated: ${data.title}`);
  updateTaskInList(data.taskId, data.changes);
});
```

---

### 3. `task:comment_added` (from Admin)

**Triggered:** When admin adds a comment to the task
**Target:** Salesperson's room
**Payload:**

```javascript
{
  taskId: "65f1234567890abcdef99999",
  message: "Please prioritize customers with orders over $500",
  addedBy: {
    _id: "65f1234567890abcdef11111",
    name: "Admin Name",
    category: "super-admin"
  },
  timestamp: "2024-02-01T12:00:00.000Z"
}
```

**Client Handler:**

```javascript
socket.on("task:comment_added", (data) => {
  showNotification(`New comment from ${data.addedBy.name}`);
  addCommentToTask(data.taskId, data.message, data.addedBy);
});
```

---

### 4. `task:deleted`

**Triggered:** When admin deletes a task
**Target:** Salesperson's room
**Payload:**

```javascript
{
  taskId: "65f1234567890abcdef99999",
  title: "Follow up with pending customers",
  deletedBy: {
    _id: "65f1234567890abcdef11111",
    name: "Admin Name",
    category: "super-admin"
  },
  timestamp: "2024-02-01T13:00:00.000Z"
}
```

**Client Handler:**

```javascript
socket.on("task:deleted", (data) => {
  showNotification(`Task deleted: ${data.title}`);
  removeTaskFromList(data.taskId);
});
```

---

## Events from Salesperson to Admin

### 5. `task:status_updated`

**Triggered:** When salesperson updates task status
**Target:** Admin's room + Branch room
**Payload:**

```javascript
{
  taskId: "65f1234567890abcdef99999",
  salespersonId: "65f1234567890abcdef12345",
  salespersonName: "John Doe",
  oldStatus: "pending",                    // pending | in-progress | completed | cancelled
  newStatus: "in-progress",
  title: "Follow up with pending customers",
  timestamp: "2024-02-02T09:00:00.000Z"
}
```

**Client Handler (Admin):**

```javascript
socket.on("task:status_updated", (data) => {
  showNotification(
    `${data.salespersonName} updated task`,
    `${data.oldStatus} → ${data.newStatus}`,
  );
  updateTaskStatus(data.taskId, data.newStatus);
  refreshDashboard();
});
```

---

### 6. `task:comment_added` (from Salesperson)

**Triggered:** When salesperson adds a progress comment
**Target:** Admin's room + Branch room
**Payload:**

```javascript
{
  taskId: "65f1234567890abcdef99999",
  salespersonId: "65f1234567890abcdef12345",
  salespersonName: "John Doe",
  message: "Contacted 5 customers today. 3 confirmed orders, 2 require follow-up tomorrow.",
  title: "Follow up with pending customers",
  timestamp: "2024-02-02T14:30:00.000Z"
}
```

**Client Handler (Admin):**

```javascript
socket.on("task:comment_added", (data) => {
  showNotification(
    `${data.salespersonName} added comment`,
    data.message.substring(0, 50),
  );
  addCommentToTask(data.taskId, data.message, {
    name: data.salespersonName,
    role: "salesperson",
  });
});
```

---

## Branch Room Events

All task events are also broadcast to branch rooms. Branch admins can join branch rooms to monitor all tasks within their branches.

**Events in Branch Room:**

- `task:created` (minimal data)
- `task:updated` (minimal data)
- `task:deleted` (minimal data)
- `task:status_updated` (minimal data)
- `task:comment_added` (minimal data)

**Branch Room Payloads:**

```javascript
// Simplified payloads for branch monitoring
{
  taskId: "65f1234567890abcdef99999",
  salespersonId: "65f1234567890abcdef12345",
  branchId: "65f1234567890abcdef67890",
  // ... other minimal data
}
```

---

## Connection Events

### `connect`

```javascript
socket.on("connect", () => {
  console.log("Connected:", socket.id);
  // Join rooms after connection
  socket.emit("join", { room: `salesperson:${userId}` });
});
```

### `disconnect`

```javascript
socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
  // Handle reconnection logic
});
```

### `connect_error`

```javascript
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
  // Show error message to user
});
```

### `joined` (Server Acknowledgment)

```javascript
socket.on("joined", (data) => {
  console.log("Joined room:", data.room);
  // { room: 'salesperson:123', timestamp: '...' }
});
```

---

## Client Implementation Examples

### React Hook (useSocket)

```javascript
import { useEffect, useState } from "react";
import io from "socket.io-client";

export function useSocket(userId, userType) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      setConnected(true);
      newSocket.emit("join", { room: `${userType}:${userId}` });
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, userType]);

  return { socket, connected };
}
```

### Usage in Component

```javascript
function SalespersonDashboard() {
  const { userId } = useAuth();
  const { socket, connected } = useSocket(userId, "salesperson");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new tasks
    socket.on("task:created", (data) => {
      setTasks((prev) => [data, ...prev]);
      toast.success(`New task: ${data.title}`);
    });

    // Listen for task updates
    socket.on("task:updated", (data) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.taskId === data.taskId ? { ...task, ...data.changes } : task,
        ),
      );
    });

    // Listen for deletions
    socket.on("task:deleted", (data) => {
      setTasks((prev) => prev.filter((task) => task.taskId !== data.taskId));
    });

    return () => {
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:deleted");
    };
  }, [socket]);

  return (
    <div>
      <ConnectionStatus connected={connected} />
      <TaskList tasks={tasks} />
    </div>
  );
}
```

---

## Testing with curl + Socket Client

### 1. Start Socket Test Client

Open `socket-test-client.html` in browser:

- Enter salesperson ID
- Select "Salesperson" as user type
- Click "Connect"
- Will auto-join `salesperson:${id}` room

### 2. Create Task via API (in terminal)

```bash
curl -X POST http://localhost:5000/api/admin/salesperson-tasks \
  -H "Content-Type: application/json" \
  -b admin-cookies.txt \
  -d '{
    "salesperson_id": "YOUR_SALESPERSON_ID",
    "branch_id": "YOUR_BRANCH_ID",
    "title": "Test Socket Event",
    "description": "Testing real-time updates",
    "priority": "high",
    "deadline": "2024-02-20T23:59:59.999Z"
  }'
```

### 3. Verify Event

- Socket client should display `task:created` event
- Browser notification should appear
- Event data should show in the events list

---

## Debugging Tips

### Enable Socket.IO Debug Logs

```javascript
localStorage.debug = "socket.io-client:socket";
```

### Check Room Membership (Server-Side)

```javascript
// In socket.config.js or server logs
io.on("connection", (socket) => {
  console.log("Rooms:", socket.rooms); // Set of room IDs
});
```

### Verify Events Are Emitted

```javascript
// Add logging in service files
console.log(`Emitting task:created to salesperson:${salespersonId}`);
emitToSalesperson(salespersonId, "task:created", data);
```

---

## Performance Best Practices

1. **Debounce rapid updates** to avoid event flooding
2. **Batch similar events** when possible
3. **Use room targeting** instead of broadcasting to all
4. **Disconnect socket** when component unmounts
5. **Implement reconnection logic** with exponential backoff
6. **Handle offline scenarios** with event queuing

---

## Security Considerations

- ✅ Socket.IO configured with `withCredentials: true`
- ✅ CORS restricted to specific origins
- ✅ Authentication verified before joining rooms
- ✅ Events only emitted to authorized rooms
- ✅ No sensitive data in event payloads (IDs only)

---

## Event Flow Diagrams

### Task Creation Flow

```
Admin → POST /api/admin/salesperson-tasks
  ↓
Server creates task in DB
  ↓
Server emits "task:created" → Salesperson Room
  ↓
Salesperson client receives event
  ↓
UI updates with new task
```

### Status Update Flow

```
Salesperson → PUT /api/salesperson/tasks/:id/status
  ↓
Server updates status in DB
  ↓
Server emits "task:status_updated" → Admin Room + Branch Room
  ↓
Admin client receives event
  ↓
Dashboard updates task status
```

---

**Last Updated:** February 2024
**Socket.IO Version:** 4.7.5
