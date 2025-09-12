# TodoApp

A simple todo list application built with Next.js, Better-Auth, and Prisma Postgres.

## 🚀 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/)
- **Database**: [Prisma Postgres](https://www.prisma.io/postgres)
- **Authentication**: [Better-Auth](https://www.better-auth.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Drag & Drop**: [dnd-kit](https://dndkit.com/)

## ✨ Features

- 📝 Create, edit, and delete todos
- ✅ Mark tasks as complete/incomplete
- 🎯 Drag and drop to reorder tasks
- 👤 Secure user authentication
- 🔄 Real-time synchronization
- 📱 Responsive design
- 🎨 Beautiful notebook-inspired UI

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd nextjs_with_prisma_and_better_auth
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your_postgres_connection_string"

# Authentication
BETTER_AUTH_SECRET="your_secret_key"
```

### 3. Get Your API Keys

#### Database URL (Prisma Postgres)

Create a new Prisma Postgres database:

```bash
npx create-db
```

Follow the prompts and copy the Prisma Postgres connection string to your `.env` file as `DATABASE_URL`.

📖 **More info**: [Prisma Postgres Documentation](https://www.prisma.io/docs/postgres/introduction/npx-create-db)

#### Better Auth Secret

Generate a secure secret for Better Auth:

```bash
npx @better-auth/cli@latest secret
```

Copy the generated secret to your `.env` file as `BETTER_AUTH_SECRET`.

### 4. Database Setup

Run Prisma migrations to set up your database:

```bash
npx prisma migrate dev
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see your TodoApp!

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── sign-in/          # Authentication pages
│   └── sign-up/
├── components/            # React components
│   └── TodoList.tsx      # Main todo component
└── lib/                  # Utilities
    ├── auth.ts           # Auth configuration
    ├── auth-client.ts    # Client-side auth
    └── prisma.ts         # Database client

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## 🚀 Deployment

### Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `DATABASE_URL`: Your production Postgres connection string
- `BETTER_AUTH_SECRET`: Your Better Auth secret key

## 🔧 Development

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio
```

### Useful Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```
