# IntelliScan Deployment Guide (Vercel)

Follow these steps to take your project live on Vercel.

## 1. Prerequisites
- **GitHub Repository**: Your project must be pushed to a GitHub repository.
- **Supabase**: Ensure your database is hosted on Supabase and you have the connection string.

## 2. Vercel Project Setup
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. **Framework Preset**: Select **Vite** (Vercel will usually auto-detect this).
5. **Root Directory**: Leave as the root of the project.

## 3. Configure Environment Variables
Go to **Project Settings** > **Environment Variables** and add the keys from the [.env.production.template](file:///d:/Anant/Project/CardToExcel/stitch%20(1)MoreSCreens/.env.production.template) file.

> [!IMPORTANT]
> **CRON_SECRET**: Create a long, random string (like a password) and set it here and as a header in the Vercel Cron settings if using multiple services. By default, Vercel will verify the header.

## 4. Deploy
1. Click **Deploy**.
2. Once the build finishes, your app will be live at `https://[your-project].vercel.app`.

## 5. WhatsApp Webhook Setup (Twilio)
If using WhatsApp:
1. Go to your **Twilio Console** > **Messaging** > **Try it Out** > **WhatsApp Sandbox Settings**.
2. Set the "When a message comes in" URL to:
   `https://[your-project].vercel.app/api/webhooks/whatsapp/webhook`
3. Method: `HTTP POST`.

## 6. Background Jobs (Automatic)
The background jobs (Email sequences, etc.) are already configured in `vercel.json` to run every minute. You don't need to do anything extra here; Vercel will trigger the `/api/cron/process-all` route automatically.

---
**Happy Scanning! 🚀**
