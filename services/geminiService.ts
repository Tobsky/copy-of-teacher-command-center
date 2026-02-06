import { GoogleGenAI } from "@google/genai";
import { Student, Assignment, Grade, AttendanceRecord, ClassGroup } from "../types";

const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateStudentFeedback = async (
  student: Student,
  clazz: ClassGroup,
  assignments: Assignment[],
  grades: Grade[],
  attendance: AttendanceRecord[],
  startDate?: string,
  endDate?: string,
  behaviors: string[] = [],
  focusAssignmentId?: string
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Error: API Key is missing. Please check your configuration.";

  // Filter assignments to only those in the student's class
  let classAssignments = assignments.filter(a => a.classId === clazz.id);

  // Apply date range filter if provided
  if (startDate) {
    classAssignments = classAssignments.filter(a => a.date >= startDate);
  }
  if (endDate) {
    classAssignments = classAssignments.filter(a => a.date <= endDate);
  }

  // Get grades for this student
  const studentGrades = grades.filter(g => g.studentId === student.id);

  // Create a map of assignmentId -> grade for quick lookup
  const gradeMap = new Map(studentGrades.map(g => [g.assignmentId, g.score]));

  // Calculate overall performance based on class assignments only
  let totalMaxPoints = 0;
  let totalEarnedPoints = 0;
  let completedAssignments = 0;

  // Build category-based performance breakdown
  const categoryPerformance: { [key: string]: { earned: number; max: number; count: number } } = {};

  for (const assignment of classAssignments) {
    const score = gradeMap.get(assignment.id);
    const category = assignment.category || 'General';

    if (!categoryPerformance[category]) {
      categoryPerformance[category] = { earned: 0, max: 0, count: 0 };
    }

    categoryPerformance[category].max += assignment.maxPoints;
    totalMaxPoints += assignment.maxPoints;

    if (score !== undefined && score !== null) {
      categoryPerformance[category].earned += score;
      totalEarnedPoints += score;
      completedAssignments++;
    }
  }

  const overallAverage = totalMaxPoints > 0 ? (totalEarnedPoints / totalMaxPoints) * 100 : 0;

  // Format category breakdown for the prompt
  const categoryBreakdown = Object.entries(categoryPerformance)
    .map(([cat, data]) => {
      const catAvg = data.max > 0 ? ((data.earned / data.max) * 100).toFixed(1) : 'N/A';
      return `  - ${cat}: ${catAvg}% (${data.earned}/${data.max} pts)`;
    })
    .join('\n');

  // Attendance analysis - also filtered by date range
  let studentAttendance = attendance.filter(a => a.studentId === student.id && a.classId === clazz.id);
  if (startDate) {
    studentAttendance = studentAttendance.filter(a => a.date >= startDate);
  }
  if (endDate) {
    studentAttendance = studentAttendance.filter(a => a.date <= endDate);
  }
  const totalRecords = studentAttendance.length;
  const absences = studentAttendance.filter(a => a.status === 'Absent').length;
  const lates = studentAttendance.filter(a => a.status === 'Late').length;
  const presents = studentAttendance.filter(a => a.status === 'Present').length;

  const behaviorContext = behaviors.length > 0
    ? `Observed Behaviors/Attitudes: ${behaviors.join(', ')}`
    : 'Observed Behaviors: None recorded.';

  // --- Construct Prompt ---
  let promptTask = "Task: Write a personalized, constructive paragraph (max 120 words) for a student's progress report.";
  let focusContext = "";

  if (focusAssignmentId) {
    const focusAssign = assignments.find(a => a.id === focusAssignmentId);
    if (focusAssign) {
      const focusScore = gradeMap.get(focusAssign.id);
      const focusGradeStr = focusScore !== undefined ? `${focusScore}/${focusAssign.maxPoints} (${((focusScore / focusAssign.maxPoints) * 100).toFixed(1)}%)` : "Not submitted / Missing";

      promptTask = `Task: Write a specific feedback comment (max 80 words) focusing primarily on the student's performance on the assignment: "${focusAssign.title}".`;
      focusContext = `
      FOCUS ASSIGNMENT DETAILS:
      - Assignment: ${focusAssign.title}
      - Date: ${focusAssign.date}
      - Category: ${focusAssign.category}
      - Student Grade: ${focusGradeStr}
      `;
    }
  }

  const prompt = `
    Role: You are an encouraging but rigorous Teacher.
    ${promptTask}
    
    Student: ${student.name}
    Class: ${clazz.name} (${clazz.section})
    
    ${focusContext}

    Overall Performance Context (for reference):
    
    Performance Summary:
    - Overall Average: ${overallAverage.toFixed(1)}%
    - Assignments Completed: ${completedAssignments}/${classAssignments.length}
    
    Performance by Category:
${categoryBreakdown}
    
    Attendance (${totalRecords} records):
    - Present: ${presents}, Absent: ${absences}, Late: ${lates}
    
    ${behaviorContext}

    Instructions:
    - ${focusAssignmentId ? "Focus mainly on the specific assignment mentioned above." : "Summarize overall progress."}
    - Incorporate the observed behaviors into the feedback to make it personal.
    - Reference specific categories where the student excels or needs improvement.
    - If any category average is below 60%, mention it as an area needing attention.
    - If any category average is above 85%, praise the student for it.
    - Mention attendance issues ONLY if absences > 2 or lates > 3.
    - Use a professional, encouraging academic tone.
    - Write the final feedback directly without any placeholders or formatting instructions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Could not generate feedback.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating feedback. Please try again later.";
  }
};

export const generateLessonPlan = async (
  topic: string,
  syllabus: string = ''
): Promise<{ title: string; content: string } | null> => {
  const ai = getAIClient();
  if (!ai) return null;

  const prompt = `
    Role: You are an expert teacher helping to plan a lesson.
    Task: Create a lesson plan for the following topic/syllabus item.
    
    Topic: ${topic}
    ${syllabus ? `Syllabus Context: ${syllabus}` : ''}
    
    Output Format: JSON with "title" and "content" fields.
    - "title": A concise, engaging title for the lesson.
    - "content": A structured lesson plan including Learning Objectives, Key Concepts, Activities (with timing), and Homework/Assessment. 
    - Formatting Rules:
      1. Do NOT use Markdown syntax (no #, **, ##, etc).
      2. Use Unicode Bold text for headers and emphasis (e.g. 𝐈𝐧𝐭𝐫𝐨𝐝𝐮𝐜𝐭𝐢𝐨𝐧).
      3. Use Emojis for icons and bullet points (e.g. 🎯 Objectives, ⏱️ 10 min).
      4. Use plain text formatting (newlines and spacing) for structure.
    
    Keep the content concise but useful (approx 200-300 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error (Lesson Gen):", error);
    return null;
  }
};