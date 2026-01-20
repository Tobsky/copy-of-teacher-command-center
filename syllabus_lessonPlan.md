Prompt for Syllabus Creation & Lesson Plan Integration

Role: Expert React & Supabase Developer
Task: Build a new "Syllabus Tracker" module and integrate it with the existing "Lesson Planner" to create a linked curriculum tracking system.

1. New Feature: Syllabus Tracker

Topic Management: Create a new view/tab where teachers can define syllabus topics for each class (e.g., "1.1 Data Representation", "2.3 Logic Gates").

Semester Filtering: Allow topics to be categorized by "Semester 1" or "Semester 2".

Completion Status: Each topic should have a manual "Done" checkbox and a progress bar showing completion for the entire semester.

2. Integration Features

Link Lessons to Topics: Update the existing Lesson Planner form (the one with AI generation) to include a "Link to Topic" dropdown. This dropdown should pull from the Syllabus list of the selected class.

Auto-Tracking: When a lesson plan is saved and linked to a topic, display a "Lesson Planned" badge next to that topic in the Syllabus Tracker.

Automatic Completion: Add a toggle in the Lesson Plan view: "Mark Topic as Completed." When checked, it should update the status of the linked syllabus topic to 'Done' upon saving the lesson.

Gap Discovery (Early Warning System): Implement logic that identifies topics with no linked lesson plans. If a topic is unlinked and the semester is more than 75% complete, flag it as a "High Priority Gap."

3. Technical Requirements (Supabase & React)

New Table (syllabus_topics):

id (uuid)

user_id (references auth.users)

class_id (references classes)

title (text)

semester (int/text)

is_completed (boolean, default false)

Update Table (lessons):

Add syllabus_topic_id (uuid, nullable, references syllabus_topics).

State Management: Ensure that when a topic is marked 'Done' in the Syllabus view, it correctly updates the syllabus_topics table and reflects in the UI immediately.

4. UI/UX & Constraints

Visual Continuity: Use the established Modern SaaS aesthetic (indigo/violet gradients, rounded-2xl cards, dark/light mode).

The "Semester View": At the top of the Syllabus tab, show a high-level summary: "Semester 1: 45% Complete | Semester 2: 10% Complete."

Gap Alerts: Display an "Attention Needed" section or badge on the Syllabus Dashboard that lists topics currently unlinked to any planned lessons, serving as an automated "To-Teach" list.

Preserve Existing AI Logic: Do not break the current Gemini AI lesson generation; simply ensure the result can be linked to a topic.

Output

Generate the complete, updated code incorporating the new Syllabus Tracker and the integrated Lesson Planner logic.