import { supabase } from '../supabaseClient';
import { Grade } from '../types';
import { toCamelCase, toSnakeCase } from '../utils/mapper';

export const gradeService = {
    fetchGrades: async () => {
        const { data, error } = await supabase.from('grades').select('*');
        if (error) throw error;
        return toCamelCase(data) as Grade[];
    },

    updateGrade: async (grade: Grade, userId: string): Promise<Grade> => {
        const payload = toSnakeCase({ ...grade, userId });

        // onConflict: 'student_id, assignment_id'
        const { data, error } = await supabase
            .from('grades')
            .upsert(payload, { onConflict: 'student_id, assignment_id' })
            .select();

        if (error) throw error;
        return toCamelCase(data[0]) as Grade;
    },

    deleteGrade: async (studentId: string, assignmentId: string) => {
        const { error } = await supabase
            .from('grades')
            .delete()
            .match({ student_id: studentId, assignment_id: assignmentId });

        if (error) throw error;
    },

    purgeEmptyGrades: async () => {
        const { error } = await supabase.from('grades').delete().eq('score', 0);
        if (error) throw error;
    }
};
