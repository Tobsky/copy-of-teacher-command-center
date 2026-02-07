import { supabase } from '../supabaseClient';
import { AcademicSession } from '../types';
import { toCamelCase, toSnakeCase } from '../utils/mapper';

export const sessionService = {
    fetchAcademicSessions: async () => {
        const { data, error } = await supabase.from('academic_sessions').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return toCamelCase(data) as AcademicSession[];
    },

    addAcademicSession: async (session: Omit<AcademicSession, 'id'>, userId: string) => {
        const payload = toSnakeCase({ ...session, userId });
        const { data, error } = await supabase.from('academic_sessions').insert([payload]).select();
        if (error) throw error;
        return toCamelCase(data[0]) as AcademicSession;
    },

    updateAcademicSession: async (updated: AcademicSession) => {
        const payload = toSnakeCase(updated);
        const { error } = await supabase.from('academic_sessions').update(payload).eq('id', updated.id);
        if (error) throw error;
        return updated;
    },

    deleteAcademicSession: async (id: string) => {
        const { error } = await supabase.from('academic_sessions').delete().eq('id', id);
        if (error) throw error;
    },

    setActiveSession: async (id: string | null, userId: string) => {
        // 1. Deactivate ALL sessions for this user
        await supabase.from('academic_sessions').update({ is_active: false }).eq('user_id', userId);

        if (id === null) return null;

        // 2. Activate the target session
        const { data, error } = await supabase.from('academic_sessions').update({ is_active: true }).eq('id', id).select();
        if (error) throw error;
        return toCamelCase(data[0]) as AcademicSession;
    },

    // Specialized Legacy Migration
    createSessionFromLegacy: async (newSession: Omit<AcademicSession, 'id'>, userId: string) => {
        // 1. Deactivate all existing sessions
        await supabase.from('academic_sessions').update({ is_active: false }).eq('user_id', userId);

        // 2. Create the new session
        const payload = toSnakeCase({ ...newSession, userId, isActive: true });
        const { data: sessionData, error: sessionError } = await supabase.from('academic_sessions').insert([payload]).select();

        if (sessionError) throw sessionError;

        const createdSession = toCamelCase(sessionData[0]) as AcademicSession;
        const newSessionId = createdSession.id;

        // 3. Update classes
        const { error: updateError } = await supabase.from('classes')
            .update({ session_id: newSessionId })
            .is('session_id', null);

        if (updateError) throw updateError;

        return createdSession;
    }
};
