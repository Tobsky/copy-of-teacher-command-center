import { supabase } from '../supabaseClient';
import { Assignment } from '../types';
import { toCamelCase, toSnakeCase } from '../utils/mapper';

export const assignmentService = {
    fetchAssignments: async () => {
        const { data, error } = await supabase.from('assignments').select('*');
        if (error) throw error;
        return toCamelCase(data) as Assignment[];
    },

    addAssignment: async (assignment: Omit<Assignment, 'id'>, userId: string) => {
        const { data, error } = await supabase.from('assignments').insert([
            toSnakeCase({ ...assignment, userId })
        ]).select();

        if (error) throw error;
        return toCamelCase(data[0]) as Assignment;
    },

    updateAssignment: async (updated: Assignment) => {
        const { error } = await supabase.from('assignments').update(
            toSnakeCase(updated)
        ).eq('id', updated.id);

        if (error) throw error;
        return updated;
    },

    deleteAssignment: async (id: string) => {
        const { error } = await supabase.from('assignments').delete().eq('id', id);
        if (error) throw error;
    }
};
