import { supabase } from '../supabaseClient';
import { Student } from '../types';
import { toCamelCase, toSnakeCase } from '../utils/mapper';

export const studentService = {
    fetchStudents: async () => {
        const { data, error } = await supabase.from('students').select('*');
        if (error) throw error;
        return toCamelCase(data) as Student[];
    },

    addStudent: async (student: Omit<Student, 'id'>, userId: string) => {
        const { data, error } = await supabase.from('students').insert([
            toSnakeCase({ ...student, userId })
        ]).select();

        if (error) throw error;
        return toCamelCase(data[0]) as Student;
    },

    deleteStudent: async (id: string) => {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) throw error;
    }
};
