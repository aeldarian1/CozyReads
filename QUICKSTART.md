# 🚀 Quick Start Guide

Get CozyReads running locally in minutes!

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **PostgreSQL** 14+ or [Neon account](https://neon.tech)
- **Git**

## 5-Minute Setup

### 1. Clone the Repository

```bash
git clone https://github.com/aeldarian1/CozyReads.git
cd CozyReads
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From [Clerk Dashboard](https://dashboard.clerk.com)
- `CLERK_SECRET_KEY` - From [Clerk Dashboard](https://dashboard.clerk.com)

**Getting Clerk Keys:**
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application or select existing
3. Copy your keys from API Keys section
4. Add `http://localhost:3000` to Allowed redirect URLs

### 4. Initialize Database

```bash
npx prisma migrate dev
```

This will:
- Create database schema
- Generate Prisma Client
- Run initial migrations

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at: **[http://localhost:3000](http://localhost:3000)**

---

## 🐳 Using Docker (Optional)

```bash
docker-compose up -d
```

This starts both PostgreSQL and the Next.js application.

---

## 📝 First Steps

1. **Sign up** with your Clerk account
2. **Add a book** using the "Add Book" button
3. **Explore features**:
   - Search your library
   - Set reading goals
   - View statistics
   - Manage collections

---

## 🛠️ Useful Commands

```bash
# Development server with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Check types
npm run type-check

# Format code
npm run format

# Run tests
npm run test

# View database with Prisma Studio
npm run prisma:studio

# Push schema to database
npm run prisma:push
```

---

## 📱 Features to Try

- **Virtual Bookshelf**: 3D visualization of your collection
- **Smart Search**: Find books by title, author, or genre
- **Reading Stats**: Track your reading habits
- **Collections**: Organize books into custom collections
- **Quotes**: Save meaningful quotes from books
- **Import/Export**: Bulk import from CSV or export your data

---

## 🐛 Troubleshooting

### "DATABASE_URL is not set"
- Check `.env.local` exists
- Verify `DATABASE_URL` is filled in
- Restart dev server

### "Prisma Client not found"
```bash
npx prisma generate
```

### Authentication not working
- Verify Clerk keys in `.env.local`
- Check `http://localhost:3000` is in Clerk's redirect URLs
- Clear browser cookies

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

---

## 📚 Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the codebase
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

---

## 🆘 Need Help?

- 📖 [View Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/aeldarian1/CozyReads/issues)
- 💬 [GitHub Discussions](https://github.com/aeldarian1/CozyReads/discussions)

Happy reading! 📚✨
