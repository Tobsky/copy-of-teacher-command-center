import { supabase } from '../supabaseClient';

export interface AnalyticsEvent {
    event_name: string;
    metadata?: Record<string, any>;
}

export const trackEvent = async (eventName: string, metadata: Record<string, any> = {}) => {
    try {
        // Get current user if available (but don't block if not)
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('analytics_events')
            .insert({
                user_id: user?.id || null,
                event_name: eventName,
                metadata: metadata
            });

        if (error) {
            console.error('Error tracking event:', error);
        }
    } catch (err) {
        console.error('Failed to track event:', err);
    }
};
