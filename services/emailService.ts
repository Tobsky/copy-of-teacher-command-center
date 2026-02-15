import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

interface FeedbackEmailParams {
    type: string;
    message: string;
    contact_email?: string;
    user_id: string;
}

export const emailService = {
    async sendFeedbackEmail(params: FeedbackEmailParams): Promise<void> {
        if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
            console.warn("EmailJS keys missing. Skipping email notification.");
            return;
        }

        try {
            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                {
                    to_name: "Admin", // Or whatever placeholder your template uses
                    feedback_type: params.type,
                    message: params.message,
                    user_email: params.contact_email || 'Not provided',
                    user_id: params.user_id,
                    reply_to: params.contact_email
                },
                PUBLIC_KEY
            );
            console.log("Feedback email sent successfully!");
        } catch (error) {
            console.error("Failed to send feedback email:", error);
            // We log the error but don't re-throw to prevent blocking the UI success state
        }
    }
};
