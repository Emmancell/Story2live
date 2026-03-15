# Story2Life App

An AI-powered platform that transforms your personal life stories into books, movies, or documentaries.

## Features (Phase 1 MVP)

- **User Authentication** – Secure signup, login, and password reset
- **Project Management** – Create and manage multiple story projects
- **Story Input** – Type, upload documents, or record audio
- **AI Synopsis Generator** – Automatically extracts synopsis, themes, and story arc
- **Output Format Selection** – Choose between Book, Movie, or Documentary
- **Character Management** – Unlimited AI-detected or manually added characters

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: SQLite via Prisma 7 + better-sqlite3 adapter
- **Auth**: NextAuth.js v5 (credentials)
- **AI**: OpenAI GPT-4o-mini (with mock fallback when no API key)

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env
# Edit .env with your settings

# Run Prisma migrations & generate client
npx prisma migrate dev
npx prisma generate

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite database path (default: `file:./dev.db`) |
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT signing |
| `NEXTAUTH_URL` | Application base URL |
| `OPENAI_API_KEY` | OpenAI API key (optional – mock responses used if empty) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/         # Signup, login, password reset
│   │   └── projects/     # Projects, story, synopsis, format, characters
│   ├── dashboard/        # User dashboard
│   ├── projects/[id]/    # Project detail, story input, synopsis, format, characters
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── ...
├── components/           # Reusable UI components
└── lib/
    ├── auth.ts           # NextAuth configuration
    ├── prisma.ts         # Prisma client singleton
    ├── openai.ts         # AI synopsis & content generation
    └── auth-utils.ts     # Password hashing utilities
```
