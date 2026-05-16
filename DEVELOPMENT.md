# Development Setup Guide

This guide helps developers set up CozyReads for local development.

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** 14+ or [Neon account](https://neon.tech) (free tier available)

## Automatic Setup (Recommended)

### On macOS/Linux

```bash
chmod +x setup.sh
./setup.sh
```

### On Windows

```bash
setup.bat
```

The setup script will:
- ✓ Check prerequisites
- ✓ Install dependencies
- ✓ Create `.env.local`
- ✓ Generate Prisma Client

## Manual Setup

If you prefer manual setup or the script doesn't work:

### 1. Clone Repository

```bash
git clone https://github.com/aeldarian1/CozyReads.git
cd CozyReads
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
DATABASE_URL="postgresql://user:password@host/database"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### 4. Setup Database

```bash
npx prisma migrate dev
```

### 5. Generate Prisma Client

```bash
npm run prisma:generate
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Setup Options

### Option 1: Neon PostgreSQL (Recommended for Development)

Neon provides a free tier PostgreSQL database in the cloud.

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a project
3. Copy your connection string to `DATABASE_URL`

**Advantages:**
- No local installation needed
- Free tier with good limits
- Works great for development
- Easy to reset or share

### Option 2: Local PostgreSQL

Install PostgreSQL locally:

**macOS:**
```bash
brew install postgresql
brew services start postgresql
createdb cozyreads
```

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run installer and follow setup
- Create database: `createdb cozyreads`

**Linux:**
```bash
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
createdb cozyreads
```

Set `DATABASE_URL`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cozyreads"
```

### Option 3: Docker PostgreSQL

```bash
docker run --name cozyreads-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cozyreads \
  -p 5432:5432 \
  -d postgres:16
```

Set `DATABASE_URL`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cozyreads"
```

## Clerk Authentication Setup

CozyReads uses Clerk for authentication.

### 1. Create Clerk Account

- Go to [dashboard.clerk.com](https://dashboard.clerk.com)
- Sign up with email or GitHub

### 2. Create Application

- Click "Create Application"
- Choose your preferred authentication method (email recommended for development)
- Click "Create application"

### 3. Get API Keys

In the Clerk dashboard:
1. Go to API Keys
2. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
3. Copy `CLERK_SECRET_KEY` (starts with `sk_`)
4. Add to `.env.local`

### 4. Configure Allowed Redirect URLs

In Clerk dashboard settings:
1. Go to "Authorized origins"
2. Add: `http://localhost:3000`
3. Save

## VSCode Setup (Optional)

Install recommended extensions:

```bash
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension rangav.vscode-thunder-client
```

Or use the built-in VSCode extension suggestion when opening the workspace.

## Running Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000` with:
- ✓ Hot reload on file changes
- ✓ Fast refresh for React components
- ✓ TypeScript type checking

## Useful Development Commands

```bash
# Format code
npm run format

# Check code quality
npm run lint

# Type check without building
npm run type-check

# Run tests
npm run test

# View database with UI
npm run prisma:studio

# Push schema to database
npm run prisma:push

# Run build to test production
npm run build
npm start
```

## Troubleshooting

### "DATABASE_URL is not set"
- Check `.env.local` exists in project root
- Verify `DATABASE_URL` is not empty
- Restart dev server: `Ctrl+C` then `npm run dev`

### "Prisma Client not found"
```bash
npm run prisma:generate
```

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
```

### Clerk authentication not working
- Verify keys in `.env.local`
- Check `http://localhost:3000` in Clerk's redirect URLs
- Clear browser cookies
- Try incognito/private window

### Database connection error
- Check `DATABASE_URL` format is correct
- Test connection with: `psql $DATABASE_URL`
- Ensure database is running
- For Neon, verify database exists in dashboard

## IDE Configuration

### ESLint in VSCode

Add to VSCode settings:
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit"
  }
}
```

### Prettier

The project includes `.prettierrc` with configured formatting rules. VSCode will auto-format on save if you have Prettier extension installed.

## Next Steps

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the codebase structure
2. Check [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
3. See [QUICKSTART.md](./QUICKSTART.md) for using the application
4. Review existing [GitHub Issues](https://github.com/aeldarian1/CozyReads/issues) for tasks

## Getting Help

- **Questions?** [GitHub Discussions](https://github.com/aeldarian1/CozyReads/discussions)
- **Found a bug?** [GitHub Issues](https://github.com/aeldarian1/CozyReads/issues)
- **Want to contribute?** [CONTRIBUTING.md](./CONTRIBUTING.md)
