# 📈 Performance Guide

Guide to understanding and optimizing CozyReads performance.

## Performance Metrics

### Core Web Vitals

CozyReads targets:
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Monitoring Performance

```bash
# Run Lighthouse audit
npm run build
npm start
# Open http://localhost:3000 and run audit in Chrome DevTools

# Check performance during development
npm run dev
# Open Chrome DevTools > Performance tab > Record
```

## Optimization Strategies

### 1. **Code Splitting**

Next.js automatically splits code by route. For dynamic imports:

```typescript
// ✓ Good: Dynamic import with loading state
const BookModal = dynamic(
  () => import('@/components/BookModal'),
  { loading: () => <LoadingSpinner /> }
);
```

### 2. **Image Optimization**

```typescript
// ✓ Good: Using Next.js Image component
import Image from 'next/image';

export function BookCard({ coverUrl }) {
  return (
    <Image
      src={coverUrl}
      alt="Book cover"
      width={200}
      height={300}
      placeholder="blur"
      blurDataURL={blurImage}
    />
  );
}

// ✗ Bad: Using HTML img tag
<img src={coverUrl} alt="Book cover" />
```

### 3. **Caching Strategy**

**React Query caching:**

```typescript
// ✓ Good: Configure cache time
const useBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

**HTTP caching headers in Next.js:**

```typescript
// app/api/books/route.ts
export const revalidate = 3600; // Cache for 1 hour
```

### 4. **Bundle Size**

Check bundle size:

```bash
npm run build
# Check .next/static/chunks for sizes
```

Reduce dependencies:
```bash
npm audit
npm ls <package-name>
npm uninstall <unused-package>
```

### 5. **Database Query Optimization**

```typescript
// ✗ Bad: N+1 query problem
const books = await prisma.book.findMany();
for (const book of books) {
  const author = await prisma.author.findUnique({
    where: { id: book.authorId }
  });
}

// ✓ Good: Use relations
const books = await prisma.book.findMany({
  include: {
    author: true,
    collections: true
  }
});
```

Add database indexes:

```prisma
model Book {
  // ... fields
  @@index([userId])
  @@index([readingStatus])
}
```

### 6. **Virtual Scrolling**

For long lists:

```typescript
// ✓ Good: Virtual scrolling for large lists
import VirtualizedBookGrid from '@/components/VirtualizedBookGrid';

export function BooksPage() {
  return <VirtualizedBookGrid books={books} />;
}
```

### 7. **Lazy Loading**

```typescript
// ✓ Good: Load content on demand
const { ref, inView } = useInView();

{inView && <FullContent />}
```

## Performance Monitoring

### Logging Performance

```typescript
// lib/performance.ts
export const logPerformance = (label: string) => {
  if (typeof window === 'undefined') return;

  const mark = `perf-${label}`;
  performance.mark(mark);

  return () => {
    const duration = performance.measure(mark).duration;
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  };
};

// Usage
const stopTimer = logPerformance('book-fetch');
// ... do work
stopTimer();
```

### Error Tracking

Monitor with services like:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - APM

## Best Practices

### Frontend

- ✓ Use React Query for server state
- ✓ Memoize expensive components
- ✓ Use `useCallback` for event handlers
- ✓ Lazy load modals and heavy components
- ✓ Optimize images with Next.js Image
- ✓ Use production build for testing
- ✓ Monitor Core Web Vitals
- ✓ Minimize main thread blocking

### Backend

- ✓ Add database indexes
- ✓ Use query pagination
- ✓ Implement caching headers
- ✓ Monitor slow queries
- ✓ Use connection pooling
- ✓ Optimize API endpoints
- ✓ Gzip compression enabled
- ✓ CDN for static assets

### DevOps

- ✓ Use production-grade database
- ✓ Enable database replication
- ✓ Use CDN for images
- ✓ Monitor server resources
- ✓ Set up alerting
- ✓ Regular backups
- ✓ Load balancing
- ✓ Auto-scaling

## Testing Performance

### Lighthouse

```bash
npm run build && npm start
# Chrome DevTools > Lighthouse > Analyze
```

### WebPageTest

Go to [webpagetest.org](https://www.webpagetest.org/) and test your deployed site.

### React DevTools Profiler

```typescript
// Wrap component in Profiler
import { Profiler } from 'react';

<Profiler id="BookList" onRender={onRender}>
  <BookList />
</Profiler>
```

## Performance Checklist

### Before Deployment

- [ ] Run Lighthouse audit
- [ ] Check bundle size
- [ ] Test with slow network (DevTools)
- [ ] Test on low-end device
- [ ] Verify database queries optimized
- [ ] Check image sizes optimized
- [ ] Monitor Core Web Vitals
- [ ] Cache strategy implemented
- [ ] Error tracking configured
- [ ] CDN configured

### Regular Monitoring

- [ ] Weekly Lighthouse audits
- [ ] Monthly bundle size review
- [ ] Quarterly database optimization
- [ ] Real user monitoring (RUM)
- [ ] Error rate monitoring
- [ ] API latency tracking

## Resources

- [Web.dev Metrics](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
