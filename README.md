# Culcheth & Glazebury Residents Association

Community website for the Culcheth and Glazebury Residents Association. Built with **Next.js 15**, deployed on **Vercel**, and backed by **Neon** (serverless Postgres).

## Stack

- **Next.js 15** (App Router, React 19, TypeScript)
- **Vercel** – hosting, serverless, Blob storage
- **Neon** – serverless PostgreSQL
- **NextAuth v5** – credentials auth, JWT session
- **Tailwind CSS** – styling
- **Nodemailer** – SMTP (admin-configured; contact form + assignment emails)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Database

1. Create a project and database at [neon.tech](https://neon.tech).
2. Run the schema in the Neon SQL Editor: copy and execute `scripts/schema.sql`.
3. Add your first admin user (e.g. via SQL): insert into `users` with `role = 'admin'` and a bcrypt-hashed password, or sign up normally then set `role = 'admin'` in the DB.

### 3. Environment variables

Copy `.env.example` to `.env.local` and set:

- **DATABASE_URL** – Neon connection string (with `?sslmode=require`).
- **NEXTAUTH_SECRET** – e.g. `openssl rand -base64 32`.
- **NEXTAUTH_URL** – `http://localhost:3000` locally; your production URL on Vercel.
- **ENCRYPTION_KEY** – used to encrypt the SMTP password stored in the admin Settings (e.g. 32-character random string).

Optional for gallery uploads:

- **BLOB_READ_WRITE_TOKEN** – from Vercel when Blob is enabled.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, then set your user’s `role` to `admin` in Neon to access the admin panel.

## Features

- **Public**: Home, News, Gallery, Contact, About, Terms, Privacy, Cookies.
- **Auth**: Sign up / Sign in (NextAuth Credentials + JWT). Middleware protects `/admin` (admin only) and `/forum` (signed-in only).
- **Forum**: Categories, threads, replies. Add categories under Admin → Forum.
- **Contact**: Form sends email to your inbox (Proton Mail or any address) and stores messages in the DB. Configure SMTP under Admin → Settings.
- **Messages**: Admin can assign contact messages to other admins; assigning sends an email to that admin.
- **News**: Admin CRUD; public list and post pages.
- **Gallery**: Admin uploads (Vercel Blob); public grid.

## Deploy on Vercel

1. Push to GitHub and import the repo in Vercel.
2. Set environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ENCRYPTION_KEY`. Optionally enable Vercel Blob and add `BLOB_READ_WRITE_TOKEN`.
3. Deploy. Run `scripts/schema.sql` in Neon if the DB is new.

## Scripts

- `npm run dev` – development (Turbopack)
- `npm run build` – production build
- `npm run start` – run production build locally
- `npm run lint` – ESLint
