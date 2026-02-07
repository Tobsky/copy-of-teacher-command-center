import { supabase } from '../supabaseClient';
import { SyllabusTopic, Curriculum, SyllabusProgress } from '../types';
import { toCamelCase, toSnakeCase } from '../utils/mapper';

export const syllabusService = {
    // Topics
    fetchSyllabusTopics: async () => {
        const { data, error } = await supabase.from('syllabus_topics').select('*');
        if (error) throw error;
        return toCamelCase(data) as SyllabusTopic[];
    },

    addSyllabusTopic: async (topic: Omit<SyllabusTopic, 'id'>, userId: string) => {
        const { data, error } = await supabase.from('syllabus_topics').insert([
            toSnakeCase({ ...topic, userId })
        ]).select();
        if (error) throw error;
        return toCamelCase(data[0]) as SyllabusTopic;
    },

    updateSyllabusTopic: async (updated: SyllabusTopic) => {
        const { error } = await supabase.from('syllabus_topics').update(
            toSnakeCase(updated)
        ).eq('id', updated.id);
        if (error) throw error;
        return updated;
    },

    deleteSyllabusTopic: async (id: string) => {
        const { error } = await supabase.from('syllabus_topics').delete().eq('id', id);
        if (error) throw error;
    },

    // Curriculums
    fetchCurriculums: async () => {
        const { data, error } = await supabase.from('curriculums').select('*');
        if (error) throw error;
        return toCamelCase(data) as Curriculum[];
    },

    addCurriculum: async (curriculum: Omit<Curriculum, 'id'>, userId: string) => {
        const { data, error } = await supabase.from('curriculums').insert([
            toSnakeCase({ ...curriculum, userId })
        ]).select();
        if (error) throw error;
        return toCamelCase(data[0]) as Curriculum;
    },

    updateCurriculum: async (updated: Curriculum) => {
        const { error } = await supabase.from('curriculums').update(
            toSnakeCase(updated)
        ).eq('id', updated.id);
        if (error) throw error;
        return updated;
    },

    deleteCurriculum: async (id: string) => {
        const { error } = await supabase.from('curriculums').delete().eq('id', id);
        if (error) throw error;
    },

    // Progress
    fetchSyllabusProgress: async () => {
        const { data, error } = await supabase.from('syllabus_progress').select('*');
        if (error) throw error;
        return toCamelCase(data) as SyllabusProgress[];
    },

    upsertSyllabusProgress: async (progress: Omit<SyllabusProgress, 'id'>, userId: string) => {
        const payload = toSnakeCase({ ...progress, userId });
        const { data, error } = await supabase.from('syllabus_progress').upsert(payload, { onConflict: 'class_id, topic_id' }).select();
        if (error) throw error;
        return toCamelCase(data[0]) as SyllabusProgress;
    }
};
