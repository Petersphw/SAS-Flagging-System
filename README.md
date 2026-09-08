# SAS Flagging System — Next.js Fullstack + Supabase + Vercel

Production-grade Next.js 14 fullstack web application for **Sandock Austral Shipyards (SHERQ Compliance & PPE Traffic-Light Flagging)**.

---

## 🔒 Security Enhancements (Admin Email Verification)

* **Zero Local Device Leaks**: When an administrator initiates sign-in, the system **never opens a local email app or `mailto:` draft on that device**.
* **Server-Side Code Dispatch**: The 6-digit verification code is generated server-side via `/api/auth/send-code` and dispatched directly to the admin's SAS mailbox (`petersm@sas.co.za` or `NandiL@sas.co.za`).
* **Personal Device Verification**: The user holding the phone must check their own email inbox on their private device and enter the 6-digit code to proceed.

---

## 🚀 How to Deploy on GitHub & Vercel (100% Free Forever)

### Step 1: Push to GitHub
```bash
cd /home/user/sas-flagging-app
git init
git add .
git commit -m "feat: SAS Flagging System Next.js Fullstack App"
git branch -M main
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/sas-flagging-app.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Go to [vercel.com](https://vercel.com) (free Hobby tier).
2. Click **"Add New..." → Project**.
3. Select your `sas-flagging-app` GitHub repository.
4. Framework Preset: **Next.js** (detected automatically).
5. Click **Deploy**.

---

## ☁️ Free PostgreSQL Database Setup (Supabase)

1. Create a free account at [supabase.com](https://supabase.com).
2. Click **"New Project"** (name it `sas-flagging-db`).
3. In your Supabase Dashboard, go to **SQL Editor** (left menu).
4. Copy and paste the entire content of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
   * This creates all tables: `departments`, `people`, `flags`, `escalations`, `admins`, `audit_logs`.
   * It pre-seeds the official SAS organogram (9 departments, 90 staff members).
5. Go to **Project Settings → API** in Supabase and copy:
   * **Project URL**
   * **Anon Public Key**
6. In your Vercel Project dashboard:
   * Go to **Settings → Environment Variables**.
   * Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`
   * Redeploy the project.

---

## 🎨 Theme & Visual Design Language

* **Palette**: Midnight Sapphire Abyss (`#030712`, `#070d24`, `#0c1538`), Royal Cobalt (`#2563eb`), and Electric Cyan (`#38bdf8`).
* **Glassmorphism**: High-gloss specular frosted glass (`backdrop-filter: blur(36px) saturate(210%)`).
* **3D Background**: Floating luminous cobalt pills and volumetric light bloom.
* **0% Purple Remnants**: 100% clean oceanic midnight theme.
