import { supabase } from '../supabaseClient';
import { UserFeedback } from '../types';

export const feedbackService = {
    async submitFeedback(feedback: Omit<UserFeedback, 'id' | 'createdAt' | 'status'>, userId: string): Promise<UserFeedback> {
        const { data, error } = await supabase
            .from('user_feedback')
            .insert({
                user_id: userId,
                type: feedback.type,
                message: feedback.message,
                contact_email: feedback.contactEmail
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            userId: data.user_id,
            type: data.type,
            message: data.message,
            contactEmail: data.contact_email,
            status: data.status,
            createdAt: data.created_at
        };
    }
};
