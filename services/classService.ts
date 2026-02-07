import { supabase } from '../supabaseClient';
import { ClassGroup } from '../types';
import { toCamelCase, toSnakeCase } from '../utils/mapper';

export const classService = {
    fetchClasses: async (activeSessionId: string | null) => {
        let query = supabase.from('classes').select('*');

        if (activeSessionId) {
            query = query.eq('session_id', activeSessionId);
        } else {
            query = query.is('session_id', null);
        }

        const { data, error } = await query;
        if (error) throw error;
        return toCamelCase(data) as ClassGroup[];
    },

    addClass: async (cls: Omit<ClassGroup, 'id'>, userId: string, sessionId?: string) => {
        const payload = { ...cls, userId };
        if (sessionId) {
            Object.assign(payload, { sessionId });
        }

        const { data, error } = await supabase.from('classes').insert([
            toSnakeCase(payload)
        ]).select();

        if (error) throw error;
        return toCamelCase(data[0]) as ClassGroup;
    },

    updateClass: async (updated: ClassGroup) => {
        const { error } = await supabase.from('classes').update(
            toSnakeCase(updated)
        ).eq('id', updated.id);

        if (error) throw error;
        return updated;
    },

    deleteClass: async (id: string) => {
        const { error } = await supabase.from('classes').delete().eq('id', id);
        if (error) throw error;
    },

    // Promote Class Logic (Complex Transaction-like)
    promoteClass: async (userId: string, sourceClassId: string, targetClassName: string, targetSection: string, activeSessionId: string) => {
        // 1. Create target class
        const classPayload = toSnakeCase({
            userId,
            name: targetClassName,
            section: targetSection,
            schedule: 'TBA',
            sessionId: activeSessionId
        });

        const { data: classData, error: classError } = await supabase.from('classes').insert([classPayload]).select();
        if (classError || !classData) throw classError || new Error("Failed to create target class");

        const newClassId = classData[0].id;

        // 2. Fetch students from source
        const { data: sourceStudents, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('class_id', sourceClassId);

        if (studentsError) throw studentsError;

        if (!sourceStudents || sourceStudents.length === 0) {
            return { newClassId, count: 0 };
        }

        // 3. Duplicate students
        const studentsPayload = sourceStudents.map(s => ({
            user_id: userId,
            class_id: newClassId,
            name: s.name,
            email: s.email
        }));

        const { error: copyError } = await supabase.from('students').insert(studentsPayload);
        if (copyError) throw copyError;

        return { newClassId, count: sourceStudents.length };
    }
};
