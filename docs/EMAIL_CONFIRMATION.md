# Email Confirmation Setup

## For Development (Disable Email Confirmation)

To skip email confirmation during development:

1. Go to **Supabase Dashboard** → Your Project → **Authentication** → **Settings**
2. Scroll down to **"Email Auth"** section
3. Find **"Enable email confirmations"**
4. **Toggle it OFF** (unchecked)
5. Click **Save**

Now users can sign up and immediately log in without email confirmation.

## For Production

Keep email confirmations enabled. The app now handles it properly:

- **Signup**: Shows "Check your email" message with resend option
- **Login**: Shows helpful error with resend button if email not confirmed
- **Callback**: Handles email confirmation links properly

## Testing Email Confirmation Flow

If you want to test the email confirmation flow:

1. Keep "Enable email confirmations" ON
2. Sign up with a real email address
3. Check your inbox for the confirmation email
4. Click the confirmation link
5. You'll be redirected to `/dashboard` automatically

## Troubleshooting

**"Email not confirmed" error:**
- Check your spam/junk folder
- Use the "Resend confirmation email" button on the login page
- Make sure the email address is correct

**Confirmation link not working:**
- Make sure `NEXT_PUBLIC_APP_URL` in `.env.local` matches your local URL (`http://localhost:3000`)
- Check Supabase Auth → URL Configuration → Redirect URLs includes your local URL
