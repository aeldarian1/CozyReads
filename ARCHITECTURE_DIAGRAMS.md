# CozyReads Architecture Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         CozyReads Frontend (Next.js App Router)           │ │
│  │  ┌──────────────┬──────────────┬──────────────────────┐   │ │
│  │  │  Dashboard   │   Shelves    │    Collections       │   │ │
│  │  ├──────────────┼──────────────┼──────────────────────┤   │ │
│  │  │ Add Book     │  3D Bookshelf│    Reading Goals     │   │ │
│  │  │ Search       │  Book Cards   │    Statistics        │   │ │
│  │  │ Import Books │  Filters     │    Reading Sessions  │   │ │
│  │  └──────────────┴──────────────┴──────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓ (HTTP/REST)                        │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
        ┌────────────────────────────────────────────┐
        │   Next.js API Routes (Backend)             │
        │  ┌─────────────────────────────────────┐   │
        │  │ /api/books       /api/collections   │   │
        │  │ /api/search      /api/quotes        │   │
        │  │ /api/import      /api/statistics    │   │
        │  │ /api/goals       /api/sessions      │   │
        │  └─────────────────────────────────────┘   │
        │               ↓                             │
        │   ┌──────────────────────────┐              │
        │   │  Clerk Authentication    │              │
        │   │  (Session Management)    │              │
        │   └──────────────────────────┘              │
        │               ↓                             │
        │   ┌──────────────────────────┐              │
        │   │   Prisma ORM             │              │
        │   │   (Query Builder)        │              │
        │   └──────────────────────────┘              │
        └────────────────────────────────────────────┘
                        ↓
        ┌────────────────────────────────────────────┐
        │   PostgreSQL (Neon)                        │
        │   ┌─────────────────────────────────────┐  │
        │   │ Users  │  Books  │  Collections   │  │
        │   │ Quotes │ Sessions│  Goals         │  │
        │   │ Import │ Readlist│ Bookmarks      │  │
        │   └─────────────────────────────────────┘  │
        └────────────────────────────────────────────┘
```

## Data Flow - Adding a Book

```
User Action: Click "Add Book"
        ↓
Search API (Google Books)
        ↓
Display Results
        ↓
Select Book
        ↓
POST /api/books
        ↓
Clerk Auth Middleware
        ↓
Zod Validation
        ↓
Prisma Book.create()
        ↓
PostgreSQL INSERT
        ↓
React Query Cache Update
        ↓
UI Re-renders with New Book
```

## Component Hierarchy

```
<App>
├── <QueryProvider>
│   ├── <ThemeContext>
│   │   ├── <ModernDashboard>
│   │   │   ├── <ModernNavigation>
│   │   │   ├── <StatsCards>
│   │   │   ├── <QuickFilterTabs>
│   │   │   └── <ModernBookGrid>
│   │   │       └── <ModernBookCard> (×N)
│   │   │
│   │   ├── <Shelf>
│   │   │   ├── <BookCard>
│   │   │   ├── <BookCard>
│   │   │   └── <BookCard>
│   │   │
│   │   ├── <CollectionsManager>
│   │   │   └── <CollectionItem>
│   │   │
│   │   └── <Modals>
│   │       ├── <AddBookModal>
│   │       ├── <ImportCSVModal>
│   │       └── <ViewBookModal>
│   │
│   └── <ToastContext>
│       └── <Toast> (notifications)
│
└── <ErrorBoundary>
```

## Authentication Flow

```
User Opens App
        ↓
Check Clerk Session
        ↓
Is User Logged In?
    ├─ NO → Redirect to /sign-in
    │        ↓
    │    Clerk OAuth/Passwordless
    │        ↓
    │    Create User in DB (Prisma)
    │        ↓
    │    Redirect to Dashboard
    │
    └─ YES → JWT Token in Header
             ↓
         API Request
             ↓
         Verify Token
             ↓
         Return User Data
             ↓
         Load Dashboard
```

## Database Schema Relationships

```
┌─────────┐
│  User   │ (Clerk managed)
└────┬────┘
     │ 1:N
     │
  ┌──┴──┐
  │
  ├─────────────────────────────┬─────────────┬─────────────┐
  │                             │             │             │
  ▼                             ▼             ▼             ▼
┌─────────┐              ┌────────────┐  ┌───────┐  ┌──────────┐
│  Book   │ 1:N          │Collection  │  │ Quote │  │ Goal     │
└────┬────┘              └─────┬──────┘  └───────┘  └──────────┘
     │                         │
     │ M:N (BookCollection)    │
     │ (via junction table)    │
     │                         │
     └─────────────────────────┘
  
  Additional Relations:
  - Book → ReadingSession (1:N)
  - Book → ImportHistory (N:1)
  - User → ReadingGoal (1:N)
  - User → ImportHistory (1:N)
```

## API Request/Response Flow

```
┌─────────────────────────────────────────────┐
│ Client Request                              │
│ POST /api/books                             │
│ Headers: Authorization: Bearer {token}     │
│ Body: { title, author, genre, ... }       │
└────────────────┬────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Route Handler      │
        └────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Auth Middleware    │
        │ (Verify JWT)       │
        └────┬───────────────┘
             │
        ┌────▼───────────────┐
        │ Body Validation    │
        │ (Zod Schema)       │
        └────┬───────────────┘
             │
        ┌────▼───────────────┐
        │ Prisma Query       │
        │ CREATE book        │
        └────┬───────────────┘
             │
        ┌────▼───────────────┐
        │ PostgreSQL         │
        │ INSERT              │
        └────┬───────────────┘
             │
        ┌────▼───────────────┐
        │ Response Builder   │
        │ {success, data}    │
        └────┬───────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ HTTP Response (201)                         │
│ {                                           │
│   success: true,                           │
│   data: { id, title, author, ... }        │
│ }                                          │
└─────────────────────────────────────────────┘
```

## State Management Flow

```
┌──────────────────┐
│ React Query      │
│ (Server State)   │
└────┬─────────────┘
     │
     ├─ Cache (books, collections)
     │
     ├─ Mutations (add, update, delete)
     │
     └─ Auto-refetch on focus
     
┌──────────────────┐
│ React Context    │
│ (Client State)   │
└────┬─────────────┘
     │
     ├─ ThemeContext (dark/light)
     │
     ├─ ToastContext (notifications)
     │
     └─ DialogContext (modals)

┌──────────────────┐
│ Component State  │
│ (Local State)    │
└────┬─────────────┘
     │
     ├─ Form inputs
     │
     ├─ Filter selections
     │
     └─ UI interactions
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│ GitHub Repository                       │
│ ├── main branch                         │
│ └── develop branch                      │
└────────────────┬────────────────────────┘
                 │ Push/PR
                 ▼
┌─────────────────────────────────────────┐
│ GitHub Actions CI/CD                    │
│ ├── Lint (ESLint)                       │
│ ├── Type Check (TypeScript)             │
│ ├── Test (Jest)                         │
│ ├── Build (Next.js)                     │
│ └── Security Scan                       │
└────────────────┬────────────────────────┘
                 │ On Success
                 ▼
┌─────────────────────────────────────────┐
│ Deployment Options                      │
├─────────────────────────────────────────┤
│ 1. Vercel (Recommended)                 │
│    - Auto-deploy on push                │
│    - Edge network                       │
│    - Analytics                          │
│                                          │
│ 2. Docker                               │
│    - Container image                    │
│    - Any cloud provider                 │
│                                          │
│ 3. VPS (Manual)                         │
│    - PM2 process manager                │
│    - Nginx reverse proxy                │
│    - Systemd service                    │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Production Environment                  │
├─────────────────────────────────────────┤
│ ├── Next.js App (Node.js)               │
│ ├── PostgreSQL (Neon)                   │
│ ├── Clerk Auth                          │
│ ├── CDN (Images)                        │
│ └── Monitoring                          │
└─────────────────────────────────────────┘
```

## Key Technologies at Each Layer

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library with hooks
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **Three.js** - 3D bookshelf

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma** - ORM
- **Zod** - Validation
- **Clerk** - Authentication

### Database
- **PostgreSQL** - SQL database
- **Neon** - Serverless hosting

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Vercel** - Deployment

## Performance Optimizations

```
Frontend Optimizations:
├─ Code Splitting (dynamic imports)
├─ Image Optimization (Next.js Image)
├─ Virtual Scrolling (large lists)
├─ React Query Caching
└─ Bundle Analysis

Backend Optimizations:
├─ Database Indexing
├─ Query Optimization (Prisma relations)
├─ Pagination
├─ Caching Headers
└─ Rate Limiting

Network Optimizations:
├─ CDN for static assets
├─ Compression (gzip)
├─ Minification
└─ Tree-shaking
```

## Security Architecture

```
┌─────────────────────────────────┐
│ Security Layers                 │
├─────────────────────────────────┤
│ 1. HTTPS/TLS                    │
│    (Encryption in transit)      │
│                                  │
│ 2. Clerk JWT                    │
│    (Authentication)             │
│                                  │
│ 3. Authorization Checks         │
│    (userId matching)            │
│                                  │
│ 4. Input Validation             │
│    (Zod schemas)                │
│                                  │
│ 5. SQL Injection Prevention      │
│    (Prisma parameterized)       │
│                                  │
│ 6. XSS Prevention                │
│    (React escaping)             │
│                                  │
│ 7. CORS Configuration           │
│    (Allowed origins)            │
│                                  │
│ 8. Rate Limiting                │
│    (Request throttling)         │
└─────────────────────────────────┘
```
