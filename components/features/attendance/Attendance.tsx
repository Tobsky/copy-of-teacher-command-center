import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { AttendanceStatus, Student } from '../../../types';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import StudentProfileModal from '../students/StudentProfileModal';

const Attendance: React.FC = () => {
  const { classes, students, attendance, updateAttendance, fetchClasses, fetchStudents, fetchAttendance } = useAppContext();

  useEffect(() => {
    fetchClasses();
    fetchStudents();
    fetchAttendance();
  }, []);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const activeStudents = students.filter(s => s.classId === selectedClassId);

  const getStatus = (studentId: string): AttendanceStatus | null => {
    const record = attendance.find(
      r => r.date === selectedDate && r.classId === selectedClassId && r.studentId === studentId
    );
    return record ? record.status : null;
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    updateAttendance({
      id: '', // Handled by context
      date: selectedDate,
      classId: selectedClassId,
      studentId,
      status
    });
  };

  const getStatusColor = (status: AttendanceStatus | null) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'Absent': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Late': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Excused': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-500';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 relative animate-fade-in pb-6">
      <header className="flex justify-between items-end flex-wrap gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Attendance</h2>
          <p className="text-slate-500 dark:text-slate-400">Track daily student presence and monitor trends.</p>
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 flex items-center shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <Calendar size={18} className="text-slate-400 ml-2 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-white text-sm outline-none px-3 font-medium cursor-pointer w-full sm:w-auto"
            />
          </div>
          <div className="relative group w-full sm:w-auto">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-medium rounded-xl px-5 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer w-full sm:min-w-[200px]"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 transition-transform group-hover:translate-y-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up delay-100 flex flex-col">
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeStudents.length > 0 ? activeStudents.map(student => {
              const currentStatus = getStatus(student.id);
              return (
                <div key={student.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-lg hover:border-blue-400/30 dark:hover:border-blue-500/30 transition-all group">
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold border border-slate-100 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform text-lg">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{student.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">ID: {student.id.substr(0, 4)}...</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {(['Present', 'Absent', 'Late', 'Excused'] as AttendanceStatus[]).map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(student.id, status)}
                        className={`text-xs py-2 rounded-lg font-bold border transition-all flex flex-col items-center justify-center gap-1
                          ${currentStatus === status
                            ? getStatusColor(status) + ' shadow-md scale-105 ring-1 ring-offset-1 dark:ring-offset-slate-900 ring-transparent'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      >
                        <span className={currentStatus === status ? 'opacity-100' : 'opacity-80'}>
                          {status.charAt(0)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 opacity-60">
                <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-3">
                  <Calendar size={32} />
                </div>
                <p className="font-medium">No students enrolled in this class.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          initialTab="attendance"
        />
      )}
    </div>
  );
};

export default Attendance;