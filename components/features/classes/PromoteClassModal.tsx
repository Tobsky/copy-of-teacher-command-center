import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { supabase } from '../../../supabaseClient';
import { toCamelCase } from '../../../utils/mapper';
import { ClassGroup } from '../../../types';
import { X, ArrowRight, Download, Users } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface PromoteClassModalProps {
    onClose: () => void;
}

const PromoteClassModal: React.FC<PromoteClassModalProps> = ({ onClose }) => {
    const { activeSession, promoteClass } = useAppContext();
    const [allClasses, setAllClasses] = useState<ClassGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    // New Class Details
    const [targetName, setTargetName] = useState('');
    const [targetSection, setTargetSection] = useState('');

    useEffect(() => {
        const fetchAllClasses = async () => {
            // Fetch ALL classes (ignoring session filter) to let user pick a source
            const { data } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
            if (data) {
                // Filter out classes that are already in the CURRENT session to avoid confusion? 
                // Or maybe allowing copying within same session is fine (e.g. splitting a class).
                // But primarily we want classes from other sessions.
                const mapped = toCamelCase(data) as ClassGroup[];
                const otherSessionClasses = mapped.filter(c => c.sessionId !== activeSession?.id);
                setAllClasses(otherSessionClasses);
            }
            setLoading(false);
        };
        fetchAllClasses();
    }, [activeSession]);

    const handleSelectClass = (cls: ClassGroup) => {
        setSelectedClassId(cls.id);
        // Pre-fill target name logic? 
        // e.g. "Grade 9" -> "Grade 10"? Or just keep same name and let user edit.
        setTargetName(cls.name);
        setTargetSection(cls.section);
    };

    const handlePromote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClassId && targetName && targetSection) {
            await promoteClass(selectedClassId, targetName, targetSection);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Download size={20} />
                    </div>
                    Promote Class
                </div>
            }
            size="md"
        >

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {!selectedClassId ? (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 mb-2">Select a class from a previous session to promote:</p>
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">Loading classes...</div>
                        ) : allClasses.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                No eligible classes found from other sessions.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {allClasses.map(cls => (
                                    <button
                                        key={cls.id}
                                        onClick={() => handleSelectClass(cls)}
                                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 text-left transition-all group"
                                    >
                                        <div>
                                            <h4 className="font-bold text-slate-700 dark:text-slate-200">{cls.name}</h4>
                                            <p className="text-xs text-slate-500">{cls.section}</p>
                                        </div>
                                        <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={20} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handlePromote} className="space-y-6 animate-slide-up">
                        <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <Users className="text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase">Source Class</p>
                                <p className="font-bold text-slate-700 dark:text-slate-300">
                                    {allClasses.find(c => c.id === selectedClassId)?.name}
                                    <span className="font-normal opacity-70 ml-2">{allClasses.find(c => c.id === selectedClassId)?.section}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedClassId(null)}
                                className="ml-auto text-xs font-bold text-indigo-600 hover:underline"
                            >
                                Change
                            </button>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="New Class Name"
                                value={targetName}
                                onChange={e => setTargetName(e.target.value)}
                                placeholder="e.g. Grade 10"
                                required
                                helperText="Typically the next grade level (e.g. Grade 9 → Grade 10)"
                            />
                            <Input
                                label="Section"
                                value={targetSection}
                                onChange={e => setTargetSection(e.target.value)}
                                placeholder="e.g. A"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                icon={<Download size={16} />}
                            >
                                Promote Class
                            </Button>
                        </div>
                    </form>
                )}
            </div>

        </Modal>
    );
};

export default PromoteClassModal;
