# Boundaries - Rebuild Guide

A comprehensive teacher management web application built with **React**, **TypeScript**, **Vite**, and **Supabase**.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Library |
| **TypeScript** | Static Typing |
| **Vite** | Build Tool & Dev Server |
| **Supabase** | Backend as a Service (Auth, DB, Realtime) |
| **Tailwind CSS** | Styling |
| **React Router 7** | Client-side Routing |
| **Lucide React** | Icons |
| **XLSX** | Excel File Processing |
| **Google GenAI** | AI Features (Gemini) |

---

## Features

- **Class Management**: Create/Edit classes and manage student rosters.
- **Gradebook**: Assignments, grading with color-coded alerts, and CSV export.
- **Attendance**: Daily status tracking (Present, Absent, Late, Excused).
- **Lesson Planner**: Daily curriculum planning with resource attachments.
- **Smart Feedback**: AI-generated student progress reports.
- **Snippet Bank**: Store code snippets and texts.
- **Grade Curving**: Normalize scores using custom or standard exam boards (IGCSE, IB).
- **Excel Import**: Bulk import students and grades from spreadsheets.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (see below)
cp .env.example .env.local

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

---

## Supabase Setup

The application relies on Supabase for data persistence and authentication.

### 1. Create Project
- Go to [Supabase](https://supabase.com) and create a new project.
- Note your `Project URL` and `anon key`.

### 2. Authentication
- Enable **Email/Password** provider in **Authentication > Providers**.
- Disable "Confirm Email" in project settings if you want instant signups for testing.

### 3. Database Schema
Execute the following SQL in your Supabase **SQL Editor** to create all tables and policies. A consolidated script `complete_schema.sql` is provided in the project root.

*(See [Database Schema](#database-schema) section below for details)*

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GEMINI_API_KEY=your-google-gemini-api-key
```

---

## Database Schema

All tables use **Row Level Security (RLS)** to enforce that users can only access their own data.
**Common Policy**: `auth.uid() = user_id`

### Core Tables

| Table | key_columns | Description |
|-------|-------------|-------------|
| **classes** | `id`, `user_id`, `name`, `section`, `schedule` | Class groups. |
| **students** | `id`, `user_id`, `class_id`, `name`, `email` | Students linked to a class. |
| **assignments** | `id`, `user_id`, `class_id`, `title`, `max_points`, `category`, `weight` | Gradebook items. |
| **grades** | `id`, `user_id`, `student_id`, `assignment_id`, `score` | Student scores (Unique constraint on student+assignment). |
| **attendance** | `id`, `user_id`, `student_id`, `class_id`, `date`, `status` | Daily records. |

### Feature Tables

| Table | key_columns | Description |
|-------|-------------|-------------|
| **lessons** | `id`, `user_id`, `title`, `date`, `content`, `resources` (JSONB) | Daily lesson plans. |
| **snippets** | `id`, `user_id`, `title`, `code`, `language` | Code/Text bank. |
| **todos** | `id`, `user_id`, `text`, `completed` | Dashboard todo list. |
| **exam_boards** | `id`, `user_id`, `name`, `boundaries` (JSONB) | Custom grading scales for curving. |

---

## Project Structure

```
/
├── components/          # React UI Components
│   ├── Dashboard.tsx    # Main Hub
│   ├── ClassManager.tsx # Class & Roster Logic
│   ├── Gradebook.tsx    # Grading Interface
│   └── ...
├── context/
│   └── AppContext.tsx   # Global State & logical layer
├── services/
│   └── geminiService.ts # AI Integration
├── utils/
│   ├── mapper.ts        # snake_case <-> camelCase conversion
│   └── gradeCurving.ts  # Math logic for grade curving
└── complete_schema.sql  # Consolidated Database Setup Script
```

### Key Logic
- **Data Flow**: `AppContext` fetches data on mount (`useEffect`) and exposes CRUD actions (`addClass`, `updateGrade`, etc.) to components.
- **Imports**: `ExcelImporter.tsx` handles parsing complicated spreadsheet layouts.
- **AI**: Uses Google Generative AI for generating specific text outputs (feedback, lesson plans).
