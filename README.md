# Task Manager

A full-featured task manager web application built with Next.js (App Router), Prisma ORM, SQLite, and Tailwind CSS.

## Features

- **Projects**: Organize tasks into projects (create, edit, delete)
- **Tasks**: Full CRUD with title, notes, status, priority, due date, and tags
- **Tags**: Add/remove tags on tasks; create tags as needed
- **Filters**: Filter by project, status, or tag
- **Search**: Search tasks by title or notes
- **Sort**: Sort by due date, priority, created date, or title
- **Status tracking**: Todo → In Progress → Done with auto-timestamps

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [Prisma ORM](https://www.prisma.io/) with SQLite
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Zod](https://zod.dev/) for input validation
- Server Actions for all mutations

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Database Setup

```bash
# Copy the example env file
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run migrations (creates dev.db)
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm run start
```

## Database Management

```bash
# Open Prisma Studio (visual DB browser)
npm run db:studio

# Reset the database (drops all data and re-runs migrations)
npm run db:reset

# Push schema changes without creating a migration (dev only)
npm run db:push
```

## Project Structure

```
├── app/
│   ├── actions/            # Server actions (mutations)
│   │   ├── project-actions.ts
│   │   ├── task-actions.ts
│   │   └── tag-actions.ts
│   ├── components/         # React components
│   │   ├── Sidebar.tsx     # Main navigation sidebar
│   │   ├── Filters.tsx     # Task filters panel
│   │   ├── TaskForm.tsx    # Create task form
│   │   ├── TaskItem.tsx    # Task list item + edit form
│   │   └── ProjectForm.tsx # Create/edit project form
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main task list page
│   └── globals.css
├── lib/
│   └── db.ts               # Prisma client singleton
├── prisma/
│   ├── schema.prisma       # Data model
│   ├── migrations/         # Migration history
│   └── seed.ts             # Seed script
└── .env.example
```

## Data Model

- **Project**: id, name, createdAt, updatedAt
- **Task**: id, title, notes, status (TODO/IN_PROGRESS/DONE), priority (LOW/MEDIUM/HIGH), dueDate, completedAt, projectId, createdAt, updatedAt
- **Tag**: id, name (unique), createdAt, updatedAt
- **TaskTag**: taskId + tagId (many-to-many join table)
