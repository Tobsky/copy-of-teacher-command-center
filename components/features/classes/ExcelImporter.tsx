import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { ClassGroup, Student, Assignment } from '../../../types';
import { supabase } from '../../../supabaseClient';

interface ExcelImporterProps {
    onImportComplete: () => void;
    classes: ClassGroup[];
}

// Structure for parsed grade columns
interface GradeColumn {
    category: string; // e.g., "Homework(20%)"
    title: string;    // e.g., "IG1 Homework week 16"
    scoreColIndex: number;
    totalScoreColIndex: number;
}

const ExcelImporter: React.FC<ExcelImporterProps> = ({ onImportComplete, classes }) => {
    const { addStudent, addAssignment, updateGrade, fetchStudents, fetchAssignments, fetchGrades, students, assignments } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [selectedClassId, setSelectedClassId] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus(null);
        }
    };

    const processExcel = async () => {
        if (!file || !selectedClassId) {
            setStatus({ type: 'error', message: 'Please select a file and a class.' });
            return;
        }

        setIsProcessing(true);
        setStatus({ type: 'info', message: 'Reading file...' });

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON (array of arrays) to handle complex headers
            const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // --- Find Header Rows ---
            // We need to find 3 key rows:
            // 1. Category Row: Contains "Attendance(5%)", "Homework(20%)", etc.
            // 2. Assignment Title Row: Contains "IG1 Homework week 16", etc.
            // 3. Score Type Row: Contains "Score", "TotalScore"

            // Find the row with "Student No." - this is the student info header row
            const studentHeaderRowIndex = jsonData.findIndex(row =>
                row.some((cell: any) => cell && String(cell).includes('Student No'))
            );
            if (studentHeaderRowIndex === -1) throw new Error("Could not find 'Student No.' header row.");

            const studentHeaders = jsonData[studentHeaderRowIndex];
            const categoryRow = jsonData[studentHeaderRowIndex]; // Category is on the same row as main headers
            const assignmentTitleRow = jsonData[studentHeaderRowIndex + 1]; // Row below has assignment titles
            const scoreTypeRow = jsonData[studentHeaderRowIndex + 2]; // Row below that has Score/TotalScore

            const dataRows = jsonData.slice(studentHeaderRowIndex + 3);

            // Identify student columns
            const nameColIdx = studentHeaders.findIndex((h: any) => h && String(h).includes('English Name'));
            const studentNoColIdx = studentHeaders.findIndex((h: any) => h && String(h).includes('Student No'));

            if (nameColIdx === -1) throw new Error("Could not find 'English Name' column.");

            setStatus({ type: 'info', message: 'Parsing grade structure...' });

            // --- Parse Grade Columns ---
            // Categories are spread across columns. We need to handle merged cells logic.
            const gradeColumns: GradeColumn[] = [];
            let currentCategory = '';

            for (let colIdx = 0; colIdx < (categoryRow?.length || 0); colIdx++) {
                const categoryCell = categoryRow[colIdx];
                const titleCell = assignmentTitleRow ? assignmentTitleRow[colIdx] : '';
                const scoreTypeCell = scoreTypeRow ? scoreTypeRow[colIdx] : '';

                // Update current category if a new one is found (handles merged cells)
                if (categoryCell && String(categoryCell).match(/(Attendance|Participation|Homework|Test|Assessment|Project|Exam)/i)) {
                    currentCategory = String(categoryCell);
                }

                // Check if this column is a "Score" column
                if (scoreTypeCell && String(scoreTypeCell).toLowerCase() === 'score') {
                    // Find the corresponding TotalScore (usually the next column)
                    const totalScoreColIdx = scoreTypeRow.findIndex((cell: any, idx: number) =>
                        idx > colIdx && cell && String(cell).toLowerCase() === 'totalscore'
                    );

                    if (titleCell && currentCategory) {
                        gradeColumns.push({
                            category: currentCategory,
                            title: String(titleCell),
                            scoreColIndex: colIdx,
                            totalScoreColIndex: totalScoreColIdx !== -1 ? totalScoreColIdx : colIdx + 1,
                        });
                    }
                }
            }

            setStatus({ type: 'info', message: `Found ${gradeColumns.length} grade columns. Importing students...` });

            // --- 1. Import Students ---
            let studentsAdded = 0;
            const studentNameToNoMap = new Map<string, string>(); // Name -> Student No.

            for (const row of dataRows) {
                const name = row[nameColIdx];
                const studentNo = studentNoColIdx !== -1 ? row[studentNoColIdx] : '';

                if (!name || !String(name).trim()) continue;

                studentNameToNoMap.set(String(name).trim(), String(studentNo));

                await addStudent({
                    name: String(name).trim(),
                    email: studentNo ? `${String(studentNo)}@school.example.com` : `${String(name).toLowerCase().replace(/\s+/g, '.')}@example.com`,
                    classId: selectedClassId
                });
                studentsAdded++;
            }

            setStatus({ type: 'info', message: `Imported ${studentsAdded} students. Fetching updated student list...` });

            // Directly query Supabase for the updated student list (context state doesn't update synchronously)
            const { data: freshStudents } = await supabase.from('students').select('*').eq('class_id', selectedClassId);
            const classStudents: Student[] = (freshStudents || []).map((s: any) => ({
                id: s.id,
                name: s.name,
                email: s.email,
                classId: s.class_id,
            }));

            // --- 2. Import Assignments ---
            setStatus({ type: 'info', message: `Importing ${gradeColumns.length} assignments...` });
            let assignmentsAdded = 0;
            const assignmentTitleToIdMap = new Map<string, string>();

            // First check existing assignments
            const { data: existingAssignments } = await supabase.from('assignments').select('*').eq('class_id', selectedClassId);
            for (const a of (existingAssignments || [])) {
                assignmentTitleToIdMap.set(a.title, a.id);
            }

            for (const gc of gradeColumns) {
                // Check if assignment already exists
                if (assignmentTitleToIdMap.has(gc.title)) {
                    continue;
                }

                // Get maxPoints from the first data row's TotalScore column
                let maxPoints = 100;
                if (dataRows.length > 0 && gc.totalScoreColIndex < (dataRows[0]?.length || 0)) {
                    const totalScoreVal = dataRows[0][gc.totalScoreColIndex];
                    if (totalScoreVal && !isNaN(Number(totalScoreVal))) {
                        maxPoints = Number(totalScoreVal);
                    }
                }

                await addAssignment({
                    classId: selectedClassId,
                    title: gc.title,
                    maxPoints: maxPoints,
                    date: new Date().toISOString().split('T')[0],
                    completed: false,
                    category: gc.category,
                    weight: gc.category.match(/\(([^)]+%)\)/)?.[1] || undefined, // Extract weight like "20%"
                });
                assignmentsAdded++;
            }

            setStatus({ type: 'info', message: `Created ${assignmentsAdded} new assignments. Fetching updated list...` });

            // Directly query Supabase for the updated assignment list
            const { data: freshAssignments } = await supabase.from('assignments').select('*').eq('class_id', selectedClassId);
            for (const a of (freshAssignments || [])) {
                assignmentTitleToIdMap.set(a.title, a.id);
            }

            // --- 3. Import Grades ---
            setStatus({ type: 'info', message: 'Importing grades...' });
            let gradesUpdated = 0;

            for (const row of dataRows) {
                const name = row[nameColIdx];
                if (!name || !String(name).trim()) continue;

                // Find the student
                const student = classStudents.find(s => s.name === String(name).trim());
                if (!student) continue;

                for (const gc of gradeColumns) {
                    const assignmentId = assignmentTitleToIdMap.get(gc.title);
                    if (!assignmentId) continue;

                    const scoreVal = row[gc.scoreColIndex];
                    if (scoreVal !== undefined && scoreVal !== null && scoreVal !== '' && !isNaN(Number(scoreVal))) {
                        await updateGrade({
                            studentId: student.id,
                            assignmentId: assignmentId,
                            score: Number(scoreVal),
                        });
                        gradesUpdated++;
                    }
                }
            }

            await fetchGrades();

            setIsProcessing(false);
            setStatus({ type: 'success', message: `Import complete! ${studentsAdded} students, ${assignmentsAdded} assignments, ${gradesUpdated} grades.` });
            onImportComplete();

        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', message: error.message || 'Failed to parse file.' });
            setIsProcessing(false);
        }
    };

    const downloadTemplate = () => {
        // Define the 3-row header structure
        // Row 1: Categories and Student Metadata Headers
        const row1 = [
            "Student No.",
            "English Name",
            "Homework(20%)", "", "", // Merged cell simulation for category
            "Test(30%)", "", ""      // Another category
        ];

        // Row 2: Assignment Titles
        const row2 = [
            "", "", // Spacer for student info
            "Week 1 Homework", "", "",
            "Unit 1 Test", "", ""
        ];

        // Row 3: Score Types
        const row3 = [
            "", "", // Spacer
            "Score", "TotalScore", "", // 3 columns per assignment to be safe, though usually 2. Let's stick to the pattern.
            // Actually, the parser logic looks for "Score" and then looks ahead for "TotalScore". 
            // Often it's: [Score-Col] [TotalScore-Col]
            // Let's make it clear:
            "Score", "TotalScore", "", // Extra column for spacing or remarks if needed, matching the 3-column span of row 1 roughly? 
            // Wait, let's align strictly with the parser.
            // Parser iterates colIdx. 
            // If it finds "Score", it looks for "TotalScore".
            // So:
            // Col 2: Score, Col 3: TotalScore.
        ];

        // Let's refine the structure to be cleaner and more robust for the user
        const headers = [
            // Row 1
            ["Student No.", "English Name", "Homework(30%)", "", "Test(50%)", ""],
            // Row 2
            ["", "", "Math HW 1", "", "Mid-term Exam", ""],
            // Row 3 (The parser looks for 'Score' and 'TotalScore')
            ["", "", "Score", "TotalScore", "Score", "TotalScore"]
        ];

        // Sample Data
        const data = [
            ["1001", "John Doe", 85, 100, 92, 100],
            ["1002", "Jane Smith", 90, 100, 88, 100],
        ];

        // Combine
        const wsData = [...headers, ...data];

        // Create Sheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Optional: Merges for better visuals (though parser handles it logic-wise, visual merges help user)
        // Merge "Homework(30%)" over 2 columns
        // Merge "Test(50%)" over 2 columns
        ws['!merges'] = [
            { s: { r: 0, c: 2 }, e: { r: 0, c: 3 } }, // Homework
            { s: { r: 0, c: 4 }, e: { r: 0, c: 5 } }  // Test
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Gradebook_Template.xlsx");
    };

    return (
        <div className="animate-fade-in w-full">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <FileSpreadsheet size={20} />
                </div>
                Import from Excel
            </h3>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Select Class Target</label>
                    <div className="relative">
                        <select
                            value={selectedClassId}
                            onChange={e => setSelectedClassId(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white text-sm appearance-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={downloadTemplate}
                        className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 font-bold transition-colors"
                    >
                        <Upload size={14} className="rotate-180" />
                        Need a template? Download here
                    </button>
                </div>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="excel-upload"
                    />
                    <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center w-full h-full">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload size={32} className="text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-bold">Click to Upload Excel</span>
                        <span className="text-xs text-slate-400 mt-2 font-mono">{file ? file.name : 'No file selected'}</span>
                    </label>
                </div>

                {status && (
                    <div className={`p-4 rounded-xl text-sm flex items-start gap-3 ${status.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-900/50' :
                        status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50' :
                            'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50'
                        }`}>
                        <div className="mt-0.5">
                            {status.type === 'error' ? <AlertCircle size={18} /> :
                                status.type === 'success' ? <CheckCircle size={18} /> :
                                    <Loader2 size={18} className="animate-spin" />}
                        </div>
                        <div className="font-medium leading-relaxed">{status.message}</div>
                    </div>
                )}

                <button
                    onClick={processExcel}
                    disabled={isProcessing || !file || !selectedClassId}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-0.5"
                >
                    {isProcessing ? 'Processing...' : 'Start Import'}
                </button>
            </div>
        </div>
    );
};

export default ExcelImporter;
