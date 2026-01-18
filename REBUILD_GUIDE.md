# Teacher Command Center - Complete Rebuild Documentation

A comprehensive teacher management web application built with React, TypeScript, Vite, and Supabase.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Key Components](#key-components)

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^19.2.0 | UI Framework |
| TypeScript | ~5.8.2 | Type Safety |
| Vite | ^6.2.0 | Build Tool |
| Supabase | ^2.90.1 | Backend (Auth + DB) |
| React Router | ^7.12.0 | Client-side Routing |
| Lucide React | ^0.555.0 | Icons |
| XLSX | ^0.18.5 | Excel Parsing |
| Google GenAI | ^1.30.0 | AI Features |

---

## Features

- **Class Management**: Create, edit, delete classes
- **Student Roster**: Manage students per class
- **Gradebook**: Track assignments and grades with category support
- **Attendance**: Mark daily attendance
- **Lesson Planner**: Plan lessons with resources
- **Smart Feedback**: AI-generated student progress reports
- **Snippet Bank**: Store and organize code snippets
- **Excel Import**: Bulk import students and grades
- **Grade Curving**: Curve exam scores against board standards with custom grading systems

---

## Quick Start

```bash
# 1. Clone/copy project
cd copy-of-teacher-command-center

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)

# 4. Run the database SQL in Supabase (see database_schema.sql)

# 5. Start development server
npm run dev
```

---

## Supabase Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your **Project URL** and **anon public key**

### Step 2: Enable Email Authentication
1. Go to **Authentication → Providers**
2. Ensure **Email** is enabled
3. Optionally configure email templates

### Step 3: Run Database Schema
1. Go to **SQL Editor**
2. Copy the entire contents of `database_schema.sql`
3. Run the script

---

## Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_google_ai_api_key
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | From Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | From Supabase → Settings → API → anon public |
| `VITE_GEMINI_API_KEY` | From [Google AI Studio](https://aistudio.google.com/apikey) |

---

## Database Schema

### Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `classes` | Course/class info | name, section, schedule |
| `students` | Student roster | name, email, class_id |
| `assignments` | Gradebook items | title, max_points, category, weight |
| `grades` | Student scores | student_id, assignment_id, score |
| `attendance` | Daily attendance | student_id, date, status |
| `snippets` | Code bank | title, language, code, tags |
| `todos` | Task list | text, completed |
| `lessons` | Lesson plans | title, date, content, resources |

### RLS Policy Pattern
All tables use the same Row Level Security pattern:
- Each table has a `user_id` column referencing `auth.users`
- Users can only SELECT, INSERT, UPDATE, DELETE their own rows
- Policy: `auth.uid() = user_id`

### Key Constraints
- `grades`: Unique on `(student_id, assignment_id)` for upsert
- `attendance`: Unique on `(student_id, date, class_id)` for upsert
- Cascade deletes on foreign keys (except lessons.class_id = SET NULL)

---

## Project Structure

```
├── components/
│   ├── App.tsx              # Root with React Router
│   ├── AuthPage.tsx         # Login/Signup
│   ├── Dashboard.tsx        # Home dashboard
│   ├── ClassManager.tsx     # Classes + Students
│   ├── Gradebook.tsx        # Assignments + Grades
│   ├── Attendance.tsx       # Attendance tracking
│   ├── LessonPlanner.tsx    # Lesson management
│   ├── SmartFeedback.tsx    # AI feedback generator
│   ├── SnippetBank.tsx      # Code snippets
│   ├── GradeCurving.tsx     # Exam grade curving
│   ├── ExcelImporter.tsx    # Excel data import
│   └── Sidebar.tsx          # Navigation
├── context/
│   └── AppContext.tsx       # Global state + Supabase operations
├── services/
│   └── geminiService.ts     # AI generation functions
├── utils/
│   ├── mapper.ts            # camelCase ↔ snake_case utils
│   ├── gradeCurving.ts      # Curving engine logic
│   └── examBoards.ts        # Board templates & scaling data
├── types.ts                 # TypeScript interfaces
├── supabaseClient.ts        # Supabase client init
├── index.tsx                # Entry point
└── index.html
```

---

## Key Components

### AppContext (`context/AppContext.tsx`)
Global state management providing:
- **State**: classes, students, assignments, grades, attendance, snippets, todos, lessons
- **Actions**: CRUD operations for all entities
- **Auth**: Session management and logout

### Grade Curving (`components/GradeCurving.tsx`)
Features:
- **Board Management**: Create (fork), edit, and delete exam boards including custom boundaries
- **Curving Engine**: Scales raw scores to board max, maps to board grade, then linearly interpolates to school percentage
- **School Grading**: Configurable school grading scales (e.g., A*-F, IB 7-1)
- **Analytics**: Grade distribution visualization and class average calculation

### Routes (`App.tsx`)
```tsx
/           → Dashboard
/classes    → ClassManager
/attendance → Attendance
/gradebook  → Gradebook
/planner    → LessonPlanner
/snippets   → SnippetBank
/feedback   → SmartFeedback
/curving    → GradeCurving
```

### Data Mapper (`utils/mapper.ts`)
Converts between:
- Frontend: `camelCase` (e.g., `classId`)
- Database: `snake_case` (e.g., `class_id`)

---

## API/Service Functions

### Supabase Operations (in AppContext)
```typescript
// Fetch data
fetchClasses(), fetchStudents(), fetchAssignments()...

// CRUD
addClass(), updateClass(), deleteClass()
addStudent(), deleteStudent()
addAssignment(), updateAssignment(), deleteAssignment()
updateGrade()  // Upsert
updateAttendance()  // Upsert
```

### AI Functions (geminiService.ts)
```typescript
// Generate student feedback based on grades/attendance
generateStudentFeedback(student, class, assignments, grades, attendance, startDate?, endDate?)

// Generate lesson plan from topic
generateLessonPlan(topic, syllabus?)
```

---

## Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

Output goes to `dist/` folder - deploy to any static host (Vercel, Netlify, etc.)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth not working | Check Supabase URL/Key in .env.local |
| Data not saving | Verify RLS policies are created |
| Grades not linking | Run database_schema.sql with unique constraints |
| AI not generating | Get API key from Google AI Studio |

---

*Generated on 2026-01-11*
