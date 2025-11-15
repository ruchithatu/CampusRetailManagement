# Password Reset Setup Guide

## Gmail Configuration for Sending Emails

To enable password reset emails, you need to configure Gmail:

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left menu
3. Under "Signing in to Google", enable **2-Step Verification**
4. Follow the prompts to set it up

### Step 2: Generate App Password
1. After enabling 2-Step Verification, go back to **Security**
2. Under "Signing in to Google", click **App passwords**
3. Select **Mail** as the app
4. Select **Other (Custom name)** as the device
5. Enter "Student Portal" as the name
6. Click **Generate**
7. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

### Step 3: Update Backend .env File
Open `backend/.env` and update these lines:

```env
EMAIL_USER=your_actual_gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

Replace:
- `your_actual_gmail@gmail.com` with your Gmail address
- `xxxx xxxx xxxx xxxx` with the app password you generated

### Step 4: Restart the Backend Server
```powershell
cd backend
npm start
```

## How to Test Password Reset

1. **Request Password Reset:**
   - Go to login page
   - Click "Forgot Password?"
   - Enter your registered email
   - Click "Send Reset Link"

2. **Check Your Email:**
   - Open your Gmail inbox
   - Look for "Password Reset Request - Student Portal"
   - Click the "Reset Password" button or copy the link

3. **Reset Your Password:**
   - You'll be redirected to the reset password page
   - Enter your new password
   - Confirm the password
   - Click "Reset Password"

4. **Login with New Password:**
   - Return to login page
   - Use your email and new password

## Flow Summary

```
Login Page → Forgot Password → Enter Email → Email Sent
                                                  ↓
                                            Gmail Inbox
                                                  ↓
                                          Click Reset Link
                                                  ↓
                                     Reset Password Page → Enter New Password
                                                  ↓
                                         Password Updated in MongoDB
                                                  ↓
                                          Login with New Password
```

## Important Notes

- Reset link expires in **1 hour**
- Password must be at least **6 characters**
- Old password is replaced in MongoDB database
- Password is hashed for security
