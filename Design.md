Prompt for UI Redesign

Role: Expert React & Tailwind CSS Developer
Task: Redesign an existing Teacher Admin Dashboard to use a "Modern SaaS" aesthetic and implement a Light/Dark mode toggle.

Context

I have a single-file React application that uses Supabase for backend. It currently has functionalities for:

- **Dashboard (Quick stats, Tasks)**
- **Class Management**: Create, edit, delete classes
- **Student Roster**: Manage students per class
- **Gradebook**: Track assignments and grades with category support
- **Attendance**: Mark daily attendance
- **Lesson Planner**: Plan lessons with resources
- **Smart Feedback**: AI-generated student progress reports
- **Snippet Bank**: Store and organize code snippets
- **Excel Import**: Bulk import students and grades
- **Grade Curving**: Curve exam scores against board standards with custom grading systems

Design Requirements: "Modern SaaS" Theme

Please refactor the UI to match the following "Modern SaaS" aesthetic:

General Aesthetics:

Soft & Clean: Use softer background colors (e.g., bg-slate-50 for light mode).

Roundness: Increase border radius on cards and buttons (use rounded-2xl or rounded-3xl).

Gradients: Replace solid primary colors with subtle gradients for buttons and active states (e.g., bg-gradient-to-r from-indigo-600 to-violet-600).

Shadows: Use colored, diffused shadows for depth (e.g., shadow-lg shadow-indigo-500/10).

Glassmorphism: Add subtle backdrop blurs to sticky headers (backdrop-blur-md bg-white/80).

Dark Mode Implementation:

Add a toggle switch (Sun/Moon icon) in the Sidebar or Header.

Use Tailwind's dark: modifier class strategy.

Dark Palette:

Background: dark:bg-slate-950

Cards: dark:bg-slate-900

Borders: dark:border-slate-800

Text: dark:text-slate-100 (primary), dark:text-slate-400 (secondary).

Ensure all text has high contrast in both modes.

Component Refinements:

Sidebar: Make it floating or distinct from the main content. In Dark Mode, ensure it blends seamlessly.

Cards: In Light mode, use white cards with soft borders. In Dark mode, use dark slate cards with very subtle borders.

Inputs: heavily rounded inputs (rounded-xl) with focus rings matching the gradient theme.

Constraints & Rules

Preserve ALL Functionality: Do not remove any existing features (Add/Delete Student, Grade calculations, Syllabus tracking, Practical cycling, Auto-generated comments, Quick Tasks).

Keep everything the way it is.

Supabase: Do not alter the Supabase connection logic or imports.

Icons: Continue using lucide-react.

Output

Generate the complete, updated code.