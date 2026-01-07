# Wealth Tracker

A calm, clear, and fast wealth tracking dashboard built with Next.js 16, Tailwind v4, Solide/UI, and Supabase.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Custom Dark/Yellow Theme)
- **Database**: Supabase (Postgres)
- **ORM**: Drizzle ORM
- **State**: TanStack Query v5 + Server Actions

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
   ```bash
   cp .env.example .env.local
   ```

3. **Database Setup**
   Push the schema to Supabase:
   ```bash
   npx drizzle-kit push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Features (MVP)
- **Dashboard Overview**: Net worth, day change, and asset allocation.
- **Persistent Sidebar**: Quick navigation between portfolio, budget, and tools.
- **Zen Mode**: (Coming Soon) Blur sensitive numbers.
