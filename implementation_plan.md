# Restructuring for Scalability and Growth

This plan outlines the steps to transition the current "monolithic component" structure into a modular, feature-based architecture suitable for scaling.

## Goals
1.  **Decouple Data Logic:** Move Supabase queries out of components and context into dedicated `services/`.
2.  **Modularize State:** Split the giant `AppContext` into focused contexts (e.g. `AuthContext`, `SessionContext`).
3.  **Organize Components:** Group UI by feature (e.g. `features/gradebook/`) rather than a flat list.
4.  **Enhance Reusability:** Extract common UI elements to `components/ui/`.

## Proposed Structure
```
/src
  /components
    /ui              # Generic reusable components (Button, Modal, Input)
    /layout          # App shell, Sidebar, Navbar
    /features        # Feature-specific components
      /auth
      /gradebook
      /syllabus
      /students
      /sessions
  /context           # Application state providers
  /hooks             # Custom React hooks (useStudents, useSession)
  /services          # API / Supabase interaction layer
  /types             # TypeScript definitions
  /utils             # Helper functions
```

## Step-by-Step Implementation

### Phase 1: Service Extraction (High Impact, Low Risk)
Move all Supabase logic from `AppContext.tsx` into typed service files.
- [ ] Create `services/studentService.ts`
- [ ] Create `services/classService.ts`
- [ ] Create `services/gradeService.ts`
- [ ] Create `services/sessionService.ts`
- [ ] Refactor `AppContext.tsx` to use these services instead of direct `supabase` calls.

### Phase 2: Feature Organization
Move existing components into feature folders.
- [ ] Move `Gradebook.tsx` -> `components/features/gradebook/Gradebook.tsx`
- [ ] Move `SyllabusHub.tsx` -> `components/features/syllabus/SyllabusHub.tsx`
- [ ] Move `SessionManager.tsx` -> `components/features/sessions/SessionManager.tsx`
- [ ] Move `AuthPage.tsx` -> `components/features/auth/AuthPage.tsx`

### Phase 3: Shared UI Extraction
Identify and extract common UI patterns.
- [ ] Create `components/ui/Modal.tsx` (Extract from generic modal implementations)
- [ ] Create `components/ui/Button.tsx` (Standardize styling)
- [ ] Create `components/ui/Card.tsx`

### Phase 4: Context Refactoring (Complex)
Split `AppContext` into smaller, focused providers.
- [ ] `AuthContext` (User, Profile)
- [ ] `SessionContext` (Academic Years, Active Session)
- [ ] `SchoolContext` (Classes, Students, Grades - *or keep as DataContext for now*)

## Immediate Action: Phase 1
I will start by creating the **Services Layer** to clean up the data fetching logic. This is the most crucial step for scalability as it separates data access from the view layer.
