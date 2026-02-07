<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Teacher Command Center

An AI-powered classroom management system for teachers.

## Documentation
For detailed architecture, database schema, and project structure, please refer to [REBUILD_GUIDE.md](./REBUILD_GUIDE.md).
For user instructions, see [USER_GUIDE.md](./USER_GUIDE.md).

## Quick Start

1. Install dependencies:
   `npm install`

2. Set up environment variables:
   Copy `.env.example` to `.env.local` and add your keys (Supabase, Gemini).

3. Run locally:
   `npm run dev`

4. Initialize Database:
   Run the SQL script `database_schema.sql` in your Supabase project.

## Security & Privacy

### Data Security
- **Row Level Security (RLS)**: All database tables are protected by RLS policies. This means each user can *only* access data that they created. Even if someone obtains your anon key, they cannot query another teacher's data.
- **Authentication**: Powered by Supabase Auth (JWT).

### AI & API Keys
- **Gemini API Key**: This application runs entirely on the client side. Your `VITE_GEMINI_API_KEY` is bundled with the application.
  - **Recommendation**: If deploying publicly (e.g., Vercel), restricts your API key in the [Google AI Studio](https://aistudio.google.com/) console to only accept requests from your deployed domain.

View your app in AI Studio: https://ai.studio/apps/drive/19pwL9qgUf9-1-PwC9HRVsEP8tJqPfelD
