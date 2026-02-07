import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { Users, Plus, UserPlus, Trash2, Search, X, ChevronRight, GraduationCap, Download, Mail, Edit2 } from 'lucide-react';
import ExcelImporter from './ExcelImporter';
import StudentProfileModal from '../students/StudentProfileModal';
import PromoteClassModal from './PromoteClassModal';
import { Student } from '../../../types';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

const ClassManager: React.FC = () => {
  const { classes, students, addClass, updateClass, deleteClass, addStudent, deleteStudent, fetchClasses, fetchStudents } = useAppContext();

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [showEditClass, setShowEditClass] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  // Edit Class Form State
  const [editClassId, setEditClassId] = useState<string>('');
  const [editClassName, setEditClassName] = useState('');
  const [editClassSection, setEditClassSection] = useState('');
  const [editClassTime, setEditClassTime] = useState('');

  // New Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassSection, setNewClassSection] = useState('');
  const [newClassTime, setNewClassTime] = useState('');

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClassName && newClassSection) {
      addClass({ name: newClassName, section: newClassSection, schedule: newClassTime || 'TBA' });
      setNewClassName('');
      setNewClassSection('');
      setNewClassTime('');
      setShowAddClass(false);
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName && selectedClassId) {
      addStudent({ name: newStudentName, email: newStudentEmail || 'no-email', classId: selectedClassId });
      setNewStudentName('');
      setNewStudentEmail('');
      setShowAddStudent(false);
    }
  };

  const openEditClass = (cls: { id: string; name: string; section: string; schedule: string }) => {
    setEditClassId(cls.id);
    setEditClassName(cls.name);
    setEditClassSection(cls.section);
    setEditClassTime(cls.schedule);
    setShowEditClass(true);
  };

  const handleEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (editClassName && editClassSection && editClassId) {
      updateClass({ id: editClassId, name: editClassName, section: editClassSection, schedule: editClassTime || 'TBA' });
      setShowEditClass(false);
    }
  };

  const activeClass = selectedClassId ? classes.find(c => c.id === selectedClassId) : null;

  // Auto-select first class if none selected and classes exist
  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const classStudents = students.filter(s => s.classId === selectedClassId);

  return (
    <div className="flex flex-col md:flex-row gap-8 h-auto md:h-[calc(100vh-6rem)] animate-fade-in">
      {/* Left Column: Class List */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col h-[500px] md:h-full shrink-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <GraduationCap className="text-blue-500" />
            Classes
          </h2>
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded-full">{classes.length}</span>
        </div>

        {/* Actions Row */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setShowPromoteModal(true)}
            variant="secondary"
            size="sm"
            className="flex-1"
            icon={<Download size={14} />}
          >
            Promote Class
          </Button>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up">
          <div className="p-4 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
            {classes.map(cls => (
              <div
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 group
                  ${selectedClassId === cls.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50 shadow-md transform translate-x-1'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md hover:-translate-y-0.5'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-bold text-lg ${selectedClassId === cls.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>{cls.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${selectedClassId === cls.id ? 'bg-blue-200/50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        {cls.section}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Users size={12} /> {students.filter(s => s.classId === cls.id).length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-mono flex items-center gap-1">
                      🕒 {cls.schedule}
                    </p>
                  </div>
                  {selectedClassId === cls.id && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditClass(cls); }}
                        className="text-slate-400 hover:text-blue-500 p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                        title="Edit class"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteClass(cls.id); setSelectedClassId(null); }}
                        className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                        title="Delete class"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {classes.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GraduationCap size={24} className="opacity-50" />
                </div>
                <p className="text-sm">No classes yet.</p>
                <p className="text-xs mt-1 opacity-70">Add a class to get started.</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-3">
            <Button
              onClick={() => setShowAddClass(true)}
              className="w-full"
              icon={<Plus size={18} />}
            >
              Add New Class
            </Button>
            <Button
              onClick={() => setShowImporter(true)}
              variant="secondary"
              className="w-full"
              icon={<Download size={18} />}
            >
              Import from Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Student Roster */}
      <div className="flex-1 flex flex-col h-[600px] md:h-full animate-slide-up delay-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 truncate">
            {activeClass ? (
              <>
                <span className="text-slate-400 dark:text-slate-500 font-normal hidden sm:inline">Roster:</span>
                {activeClass.name}
              </>
            ) : 'Select a Class'}
          </h2>
          {activeClass && (
            <div className="flex gap-2">
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg">
                {activeClass.section}
              </span>
            </div>
          )}
        </div>

        {activeClass ? (
          <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-xl shadow-slate-200/50 dark:shadow-none animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                Student List ({classStudents.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-white dark:bg-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/30 text-xs uppercase font-semibold text-slate-500 sticky top-0 backdrop-blur-sm z-10">
                  <tr>
                    <th className="px-6 py-3 border-b border-slate-100 dark:border-slate-700">Student Info</th>
                    <th className="px-6 py-3 border-b border-slate-100 dark:border-slate-700 hidden sm:table-cell">Email</th>
                    <th className="px-6 py-3 border-b border-slate-100 dark:border-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {classStudents.length > 0 ? classStudents.map(student => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                            {student.name.charAt(0)}
                          </div>
                          {student.name}
                        </div>
                        {/* Mobile-only Email Display */}
                        <div className="sm:hidden text-xs font-mono text-slate-400 mt-1 ml-11 flex items-center gap-1">
                          <Mail size={10} /> {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400 hidden sm:table-cell">{student.email}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteStudent(student.id); }}
                          className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                          title="Remove student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                        <div className="flex flex-col items-center gap-3 opacity-60">
                          <Users size={32} />
                          <p>No students enrolled yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Student Form (Inline) */}
            <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Quick Add Student</h4>
              <form onSubmit={handleAddStudent} className="flex flex-col sm:flex-row gap-3 sm:items-end p-1">
                <div className="flex-1">
                  <Input
                    label="Student Name"
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    placeholder="John Doe"
                    className="py-2.5"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Email"
                    value={newStudentEmail}
                    onChange={e => setNewStudentEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="py-2.5"
                  />
                </div>
                <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" icon={<Plus size={18} />}>
                  <span className="sm:hidden">Add</span> <span className="hidden sm:inline">Add Student</span>
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
              <Users size={40} />
            </div>
            <p className="font-medium">Select a class to manage the roster.</p>
          </div>
        )}
      </div>

      {/* Add Class Modal */}
      <Modal
        isOpen={showAddClass}
        onClose={() => setShowAddClass(false)}
        title="Add New Class"
        size="sm"
      >
        <div className="p-6">
          <form onSubmit={handleCreateClass} className="space-y-5">
            <Input
              label="Class Name"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              placeholder="e.g. AP Computer Science"
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  label="Section"
                  value={newClassSection}
                  onChange={e => setNewClassSection(e.target.value)}
                  placeholder="101"
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Time"
                  value={newClassTime}
                  onChange={e => setNewClassTime(e.target.value)}
                  placeholder="09:00 AM"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create Class
            </Button>
          </form>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        size="lg"
        showCloseButton={true}
      >
        <div className="p-8">
          <ExcelImporter
            classes={classes}
            onImportComplete={() => {
              fetchStudents(); // Refresh data
              setShowImporter(false);
            }}
          />
        </div>
      </Modal>

      {/* Edit Class Modal */}
      {/* Edit Class Modal */}
      {/* Edit Class Modal */}
      <Modal
        isOpen={showEditClass}
        onClose={() => setShowEditClass(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Edit2 size={20} />
            </div>
            Edit Class
          </div>
        }
        size="sm"
      >
        <div className="p-6">
          <form onSubmit={handleEditClass} className="space-y-5">
            <Input
              label="Class Name"
              value={editClassName}
              onChange={e => setEditClassName(e.target.value)}
              placeholder="CS 101"
              required
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  label="Section"
                  value={editClassSection}
                  onChange={e => setEditClassSection(e.target.value)}
                  placeholder="101"
                  required
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Schedule"
                  value={editClassTime}
                  onChange={e => setEditClassTime(e.target.value)}
                  placeholder="09:00 AM"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                onClick={() => setShowEditClass(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {
        showPromoteModal && (
          <PromoteClassModal onClose={() => setShowPromoteModal(false)} />
        )
      }

      {
        selectedStudent && (
          <StudentProfileModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            initialTab="overview"
          />
        )
      }
    </div >
  );
};

export default ClassManager;