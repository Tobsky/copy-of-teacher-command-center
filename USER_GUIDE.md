# Teacher Command Center - User Guide

Welcome to the **Teacher Command Center**, your modern, all-in-one dashboard for efficiently managing your classroom. This guide will help you get up and running with all the features available to you.

## 👋 Introduction

The Teacher Command Center is designed to streamline your daily tasks, from taking attendance to planning lessons and grading exams. It runs right in your browser and syncs your data securely to the cloud.

**Key Interface Features:**
*   **Sidebar Navigation**: Access all modules (Dashboard, Classes, Gradebook, etc.) from the left menu.
*   **Theme Toggle**: Switch between Light ☀️ and Dark 🌙 mode using the toggle in the sidebar.
*   **Logout**: Securely sign out using the button at the bottom of the sidebar.

---

## 🚀 Getting Started

### 1. Sign Up / Login
When you first open the application, you will be greeted by the Authentication page.
-   **Sign Up**: Enter your email and password to create a secure account.
-   **Login**: If you already have an account, simply sign in.
-   **Data Security**: Your data (classes, students, grades) is private and protected by Row Level Security, meaning only you can access it.

### 2. The Dashboard
Once logged in, the **Dashboard** serves as your daily hub:
-   **Quick Stats**: View total students, classes, and tasks at a glance.
-   **Today's Schedule**: Automatically lists classes or lessons scheduled for the current day.
-   **Pending Grading**: A summary of assignments that need attention.
-   **Quick Tasks**: A built-in Todo list to keep track of your personal tasks.

---

## 📚 Managing Your Classes

Before you can track anything, you need to set up your classes.

### Creating a Class
1.  Navigate to **Classes & Roster**.
2.  Click **"Add Class"**.
3.  Enter details:
    -   **Class Name**: e.g., "Year 10 Math".
    -   **Section**: e.g., "10A".
    -   **Schedule**: e.g., "Mon/Wed 10:00 AM".
4.  Click **Save**.

### Managing Students
1.  Select a class from the dropdown or list.
2.  **Add Single Student**:
    -   Click the **"+"** button next to the student list.
    -   Enter **Name** and **Email** (optional).
3.  **Delete Student**: Click the trash icon next to a student's name.

### 📥 Bulk Import from Excel
You can import a full class roster and even existing grades from an Excel file.
1.  Click **"Import Excel"** in the Classes view.
2.  Select the **Class Target**.
3.  Upload your `.xlsx` file.
    -   **Required Column**: `English Name`
    -   **Optional Column**: `Student No.` (Used to auto-generate emails).
    -   **Optional Grades**: The importer can also read columns like "Homework(20%)" to automatically create assignments and input grades.
4.  Click **Start Import**.

---

## 📝 Gradebook

The Gradebook is where you track assessments and view student performance.

### Managing Assignments
-   **Create Assignment**: Click **"New Assignment"**. Enter the **Title** and **Max Points**.
-   **Edit Assignment**: Click the column header of any assignment to:
    -   Rename it.
    -   Change Max Points.
    -   Mark as **Completed** (Visual checkmark).
    -   **Delete** the assignment.

### Entering Grades
-   The grid displays students vs. assignments.
-   **Direct Entry**: Click any cell and type the score. It saves automatically.
-   **Visual Cues**:
    -   **Green**: 90% and above.
    -   **Amber**: 80-89%.
    -   **Red**: Below 70%.
-   **Calculated Averages**: The first column automatically calculates each student's current average percentage.

### 📊 Student Performance View
Click on any **Student Name** in the gradebook to open their detailed profile:
-   **Performance Timeline**: A graph showing their progress over time.
-   **Stats**: Current Average, Assignments Submitted count, and Class Rank/Percentile.

### Exporting Data
-   Click **"Export CSV"** to download the current gradebook view as a spreadsheet.

---

## 📅 Attendance Tracking

1.  Navigate to **Attendance**.
2.  **Select Date**: Use the date picker (defaults to today).
3.  **Select Class**: Choose which class roster to view.
4.  **Mark Status**: Click the buttons for each student to toggle:
    -   <span style="color: #10b981">**P**</span> (Present)
    -   <span style="color: #ef4444">**A**</span> (Absent)
    -   <span style="color: #eab308">**L**</span> (Late)
    -   <span style="color: #3b82f6">**E**</span> (Excused)
5.  **Visual Overview**: The cards highlight with the color of the selected status for easy scanning.

---

## 📈 Grade Curving

A powerful tool for normalizing internal raw scores to standardized Examination Board boundaries.

### How to Curve Grades
1.  **Configuration**:
    -   Select **Class** and **Assignment** (to pull real data).
    -   OR use **Manual Score Entry** to type raw scores directly.
    -   Set **Internal Maximum** (max possible raw score).
2.  **Select Examination Board**:
    -   Choose a preset like **IGCSE**, **A-Level**, or **IB**.
    -   **Create Custom Board**: Click "New Board" to define your own grade boundaries (e.g., A* = 85%).
    -   **Load Defaults**: Refreshes standard boards if missing.
3.  **View Results**: The table shows:
    -   **Raw Score**: The original student score.
    -   **Scaled Score**: The score adjusted to the board's scale.
    -   **Board Grade**: The final letter/number grade (A*, 7, etc.).
4.  **Export**: Download the curved results as a CSV.

---

## 🧠 Lesson Planner

Organize your curriculum and daily plans.

1.  **Calendar View**: Select a date on the left to see that day's plan.
2.  **Create Lesson**:
    -   Click **"Plan Lesson"** or **"Create a Lesson Plan"**.
    -   Enter Title, Date, and Class.
    -   **Content**: Write your objectives, activities, and notes.
3.  **✨ AI Assistance**:
    -   Click **"Auto-Generate"** in the form.
    -   Type a topic (e.g., "Introduction to Photosynthesis").
    -   The AI will generate a structured lesson plan for you.
4.  **Resources**: Attach links, PDFs, Videos, or Images to keep your materials organized.

---

## ✨ Smart Feedback (AI)

Generate personalized narrative reports for students in seconds.

1.  Navigate to **Smart Feedback**.
2.  **Select Context**: Choose a **Class** and then a **Student**.
3.  **Date Range** (Optional): Filter data by start/end date (e.g., for a specific term).
4.  **Generate**: Click **"Generate Feedback"**.
    -   The AI analyzes grades, attendance trends, and missing assignments.
    -   It writes a professional, constructive comment suitable for report cards.
5.  **Copy**: Use the copy button to paste the feedback into your reports or emails.

---

## 💻 Snippet Bank

A repository for reusing code or text. Useful for Computer Science teachers or storing standard rubric comments.

1.  **Add Snippet**: Click "New Snippet".
2.  **Details**:
    -   Title.
    -   **Language**: Java, Python, JavaScript, C++, or Plain Text.
    -   **Content**: Paste your code or text.
3.  **Use**: Click the **Copy** icon on any card to instantly copy the content to your clipboard.

---

## ❓ Frequently Asked Questions

**Q: Can I restore deleted data?**
A: Currently, deleted items (classes, assignments) are permanent to ensure data integrity. Please delete with caution.

**Q: Can I use this on my tablet?**
A: Yes! The application is fully responsive and touch-friendly, perfect for walking around the classroom with an iPad or tablet.

**Q: Where is my data stored?**
A: All data is securely stored in a cloud database (Supabase), linked exclusively to your user account.
