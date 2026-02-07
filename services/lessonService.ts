import { supabase } from '../supabaseClient';
import { Lesson } from '../types';
import { toCamelCase, toSnakeCase } from '../utils/mapper';

export const lessonService = {
    fetchLessons: async () => {
        const { data, error } = await supabase.from('lessons').select('*');
        if (error) throw error;
        return toCamelCase(data) as Lesson[];
    },

    addLesson: async (lesson: Omit<Lesson, 'id'>, userId: string) => {
        const { data, error } = await supabase.from('lessons').insert([
            toSnakeCase({ ...lesson, userId })
        ]).select();
        if (error) throw error;
        return toCamelCase(data[0]) as Lesson;
    },

    updateLesson: async (updated: Lesson) => {
        const { error } = await supabase.from('lessons').update(
            toSnakeCase(updated)
        ).eq('id', updated.id);
        if (error) throw error;
        return updated;
    },

    deleteLesson: async (id: string) => {
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;
    }
};
