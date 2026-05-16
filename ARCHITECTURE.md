# CozyReads Project Architecture

## Overview

CozyReads is a modern full-stack web application built with Next.js for managing personal book collections. The application follows a clean architecture pattern with clear separation of concerns.

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Query
- **Animation**: Framer Motion
- **3D Graphics**: Three.js with React Three Fiber

### Backend
- **Runtime**: Node.js
- **ORM**: Prisma
- **Authentication**: Clerk
- **API**: REST (Next.js Route Handlers)

### Database
- **Primary**: PostgreSQL (Neon)
- **Caching**: React Query

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions

## Project Structure

```
CozyReads/
├── app/                      # Next.js App Router
│   ├── api/                  # API route handlers
│   │   ├── books/            # Book operations
│   │   ├── collections/      # Collection management
│   │   ├── quotes/           # Quote operations
│   │   ├── import/           # Data import
│   │   ├── export/           # Data export
│   │   ├── statistics/       # Analytics endpoints
│   │   └── ...
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── goals/                # Reading goals page
│   ├── series/               # Series view page
│   ├── settings/             # Settings page
│   ├── statistics/           # Statistics dashboard
│   ├── sign-in/              # Authentication pages
│   └── sign-up/              # Authentication pages
│
├── components/               # Reusable React components
│   ├── ui/                   # Base UI components
│   ├── modals/               # Modal components
│   ├── accessibility/        # A11y components
│   └── [Feature components]  # Feature-specific components
│
├── contexts/                 # React Context providers
│   ├── DialogContext.tsx     # Dialog state management
│   ├── ThemeContext.tsx      # Theme configuration
│   └── ToastContext.tsx      # Toast notifications
│
├── lib/                      # Utility functions and hooks
│   ├── hooks/                # Custom React hooks
│   ├── auth-middleware.ts    # Authentication utility
│   ├── db.ts                 # Database client
│   ├── google-books.ts       # Google Books API integration
│   ├── csv-parser.ts         # CSV parsing utilities
│   ├── validation.ts         # Input validation (Zod schemas)
│   └── [Other utilities]
│
├── prisma/                   # Database schema and migrations
│   └── schema.prisma         # Prisma data model
│
├── types/                    # Shared TypeScript types
│   └── index.ts              # Type definitions
│
├── public/                   # Static assets
│
└── Configuration files
    ├── next.config.ts        # Next.js configuration
    ├── tailwind.config.ts    # Tailwind CSS configuration
    ├── tsconfig.json         # TypeScript configuration
    ├── jest.config.js        # Jest configuration
    ├── .prettierrc            # Prettier configuration
    └── package.json          # Dependencies
```

## Data Flow

### Authentication Flow
```
User → Clerk Auth → Authenticated Session → API Route Handler
```

### Data Operations Flow
```
Component → useBooks() Hook → React Query → API Route → Prisma → PostgreSQL
```

### State Management
- **Global State**: React Query for server state, Context API for UI state
- **Component State**: useState for local component state
- **Derived State**: useMemo and useCallback for optimizations

## API Routes Structure

All API routes follow a consistent pattern:

```typescript
// /api/[resource]/route.ts
import { getAuthenticatedUser } from '@/lib/auth-middleware';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  // Handle request...
}
```

## Component Architecture

### Component Hierarchy
```
<QueryProvider>
  <ThemeContext>
    <ToastContext>
      <DialogContext>
        <Layout>
          <Navigation>
          <PageContent>
            <Modal>
            <Toast>
```

### Component Types

**Page Components** (`app/**/page.tsx`)
- Top-level page components
- Handle route-specific logic
- Server components by default

**Feature Components** (`components/*`)
- Reusable, feature-specific components
- Client components with hooks
- Composed of UI components

**UI Components** (`components/ui/`)
- Primitive, reusable UI elements
- No business logic
- Highly composable

**Modals** (`components/modals/`)
- Dialog/modal components
- Managed via DialogContext
- Accessible and animated

## Performance Optimizations

### Code Splitting
- Route-based code splitting (Next.js automatic)
- Component-level lazy loading with `dynamic()`
- API route splitting by feature

### Caching Strategies
- React Query stale-while-revalidate
- Next.js image optimization
- Browser caching headers

### Rendering Optimization
- Server-side rendering for initial load
- Client-side navigation with React
- Memoization of expensive components
- Virtual scrolling for large lists

## Security Measures

### Authentication & Authorization
- Clerk JWT tokens
- Server-side authentication middleware
- Protected API routes

### Data Protection
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS prevention via DOMPurify
- CSRF protection via Next.js

### Rate Limiting
- API rate limiting per user
- Request validation
- Structured error handling

## Testing Strategy

### Unit Tests
- Utility functions
- Custom hooks
- Prisma models

### Integration Tests
- API routes
- Context providers
- Component integration

### E2E Tests
- User workflows
- Critical paths
- Authentication flows

## Deployment

### Platforms
- **Frontend**: Vercel (recommended)
- **Database**: Neon PostgreSQL
- **Authentication**: Clerk
- **Image CDN**: Google Cloud Storage / Cloudinary

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `GOOGLE_BOOKS_API_KEY` - Google Books API (optional)

## Key Design Decisions

### Why React Query?
- Automatic caching and background updates
- Optimistic updates support
- Built-in loading/error states
- Reduces boilerplate

### Why Prisma?
- Type-safe database access
- Automatic migrations
- Built-in relationships
- Developer experience

### Why Clerk?
- Passwordless authentication
- Social login support
- Session management
- SAML/SSO ready

### Why Tailwind CSS?
- Utility-first approach
- Rapid UI development
- Consistent design tokens
- Small production bundle

## Contributing Guidelines

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

## License

MIT License - See [LICENSE](./LICENSE) for details.
