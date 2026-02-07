# How to Customize Supabase Auth Emails

To change the sender name, email subject, and body content for your sign-up emails, you need to use the **Supabase Dashboard**.

## 1. Open Email Settings
1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project (**Teacher Command Center**).
3.  In the left sidebar, click on **Authentication**.
4.  Under the "Configuration" section, click on **Email Templates**.

## 2. Customize "Confirm Your Signup" Template
This is the email sent when a new user signs up.

### Sender Details
*   **Sender Email**: The email address users will see (e.g., `noreply@yourdomain.com`). *Note: You need to configure a custom SMTP server in Supabase Project Settings -> Auth -> SMTP Settings to use a custom domain, otherwise it will come from `noreply@mail.app.supabase.io`.*
*   **Sender Name**: Enter your web app name here (e.g., **"Teacher Command Center"**).

### Subject Line
*   Change the subject to something welcoming, e.g., *"Welcome to Teacher Command Center! Please confirm your email."*

### Email Body (HTML)
You can use HTML to style the email. Make sure to keep the confirmation link variable.

**Example Template:**
```html
<h2>Welcome to Teacher Command Center!</h2>
<p>Thanks for signing up. Please verify your email address to get started.</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
    Confirm Email Address
  </a>
</p>
<p>Or copy and paste this link: {{ .ConfirmationURL }}</p>
<p>Best regards,<br>The Teacher Command Center Team</p>
```

## 3. Important: Site URL Configuration
1.  Go to **Authentication** -> **URL Configuration**.
2.  **Site URL**: Set this to your production URL (e.g., `https://your-app.vercel.app`).
3.  **Redirect URLs**: Add `http://localhost:5173/` (for local development) and any other URLs where you want users to be redirected.

I have updated your code to automatically tell Supabase to redirect users back to the correct page they signed up from (`window.location.origin`), but these dashboard settings are the ultimate fallback.
