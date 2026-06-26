# Student Productivity Hub 🚀

A premium, production-grade **Student Productivity Dashboard** designed to showcase advanced React architectures, modular state contexts, visual data analytics, offline data portability, and MERN API integrations.

---

## Key Feature Modules

### 1. Unified Dashboard 📊
- Aggregates metrics from all sub-modules (notes counts, pending tasks, active timetable sessions).
- Highlights focus deadlines due today and recent notes drafts.

### 2. Evernote-Style Notes Editor 📝
- Split-pane layout with category filtering and full-text search.
- Clean distraction-free textareas with a debounced auto-save status marker.
- Integrated lightweight **Markdown Preview** mode (converts headers, bold, italics, lists, and linebreaks).

### 3. Kanban Tasks Board 📋
- Columns separating *To Do*, *In Progress*, *In Review*, and *Completed*.
- Detailed metadata: Priority levels, Subject tags, Due Dates (with overdue indicator warnings), Estimated Time, and Custom Labels.
- Shifter arrows on cards to toggle statuses quickly.

### 4. Course Timetable Planner ⏰
- Weekly calendar scheduling grid (Monday to Friday).
- Real-time active class check: highlights ongoing lectures using a glowing beacon pulse animation.

### 5. Attendance Tracker & Calculator 📈
- Tracks class presence counters (attended/conducted) per course.
- Highlights items dropping below a 75% academic threshold with warning badges.
- **Predictor Margin Solver**: inputs hypothetical attendances to calculate percentage scales, and computes exactly how many lectures can be missed consecutively before losing compliance.

### 6. Visual Performance Analytics 📉
- Recharts-powered graphs:
  - *Weekly Focus Hours* (Mon-Sun Line Chart).
  - *Task Completion Ratios* (Completed vs Pending by Subject Bar Chart).
  - *Attendance Distribution* (Present vs Absent ratio Pie Chart).

### 7. AI Study Assistant 🤖
- Interactive conversation panel.
- Inputs a goal -> generates broken-down subtasks that users can import directly to their Kanban board with a single click.
- Inputs an exam -> generates structured Pomodoro study schedules.

### 8. Global Keyboard Search (Ctrl+K) ⌨️
- Cmd/Ctrl+K launches a global modal search bar.
- Filters across notes, tasks, and system actions (e.g. switch themes, navigate pages) in real-time.

### 9. Backup & Portability 📂
- Direct data export: packages all local databases as a single `productivity_backup.json` file.
- Direct data import: reads and restores data backups instantly.

---

## Technology Stack

- **Frontend**: React 19, React Router, Lucide Icons, Recharts.
- **Backend (MERN)**: Node.js, Express, MongoDB (Mongoose ODM), JWT authentication, bcryptjs, CORS, dotenv.
- **Styling**: Vanilla CSS utilizing custom design variables for transitions, typography scales, and a dark theme.
- **Safety**: React Error Boundary wrappers for diagnostic readouts and localStorage resets.

---

## File Structure

```text
├── backend/            # Express REST API Server
│   ├── config/         # MongoDB Mongoose configurations
│   ├── middleware/     # JWT verification guards
│   ├── models/         # User, Note, Task, Timetable, Attendance, Goal schemas
│   ├── routes/         # REST routes mapping models to controllers
│   ├── .env            # Environment configurations (Port, URI, Secret keys)
│   └── server.js       # Main server entry listener
│
└── src/                # React Frontend Client
    ├── components/     # Reusable UI controls (Button, Card, Input, Modal, ErrorBoundary)
    ├── context/        # Split context stores (Theme, Auth, Notes, Tasks, Timetable, Goals...)
    ├── layouts/        # Layout shell with sidebars and notification dropdown panels
    ├── pages/          # Feature pages directories containing sub-elements & local CSS
    ├── services/       # REST API client facade (with local storage offline fallbacks)
    ├── styles/         # Design variables (index.css) and layout grids (layout.css)
    └── App.jsx         # App route bindings and providers wrapping
```

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/student-productivity-hub.git
cd student-productivity-hub
```

### 2. Configure & Run Backend Server
Ensure you have MongoDB running locally:
```bash
cd backend
npm install
```
Create a `backend/.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_hub
JWT_SECRET=your_jwt_secret_key
```
Start the backend server in development mode:
```bash
npm run dev
```

### 3. Run Frontend Client
Open a new terminal tab:
```bash
# Return to root directory
npm install
npm run dev
```
Open `http://localhost:5173` to explore!

---

## Portfolio Notes

- **Offline-First Synchronization**: The API service in `src/services/api.js` is designed to request Express server endpoints. If the server is offline or fails, the application switches to `localStorage` mode, ensuring a functional mock demo experience.
- **Demo Account Button**: Login page features an "Explore Demo Account" trigger to bypass registration forms and pre-load sample notes, Kanban tasks, timetables, and analytics charts.
