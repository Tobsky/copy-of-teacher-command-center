Prompt: Integrated Syllabus Hub & Mastery Tracker

Role: Senior Full-Stack Engineer
Task: Refactor the "Syllabus Tracker" into a dual-mode "Integrated Syllabus Hub" that manages master templates and tracks class-specific progress.

1. Data Architecture (Supabase)

Master Curriculums: Table curriculums (id, user_id, name, board_code).

Syllabus Topics: Table syllabus_topics linked to curriculum_id (not the class).

Class Mapping: Table classes should have a curriculum_id field.

Mastery Tracking: Table syllabus_progress (id, user_id, class_id, topic_id, status ['not_started', 'taught', 'assessed', 'completed']).

2. Integrated UI: The Syllabus Hub

Modify the Syllabus Tab to have two sub-views (using a toggle or small tabs at the top):

A. Tracker View (Class Context)

Progress Overview: Show the "Mastery Heatmap" for the current class.

Status Updates: Allow marking topics as taught/completed specifically for this class.

Gap Analysis: Highlight topics from the master template that haven't been taught in this specific class yet.

Velocity Alert: Show the "Pacing Warning" if the teacher is behind schedule for this class.

B. Library View (Template Context)

Template Management: Create, edit, or delete master curriculum templates (e.g., "IGCSE CS 2026").

Topic Editor: Add/Remove sub-topics from the master list.

Syncing: Any changes made here immediately reflect in all classes that use this curriculum template.

3. Global & "Painkiller" Logic

Many-to-Many Linking: Ensure lessons and assignments can link to multiple topics from the curriculum template.

The "Board Overlay": Keep the functionality to overlay official Exam Board Thresholds onto the Gradebook.

AI Integration: The AI Lesson Planner should be able to see the topics in the "Library" to generate relevant content.

4. Technical Constraints

Modern SaaS Aesthetic: Use "Glassmorphism" for the sub-navigation/toggle. Ensure high-contrast themes for both Light and Dark modes.

Performance: Use useMemo to prevent UI lag when switching between the Tracker and Library views.

Output

Generate the updated TeacherDashboard.jsx incorporating the "Syllabus Hub" design. Ensure the transition between tracking a class and managing a template is seamless and intuitive.