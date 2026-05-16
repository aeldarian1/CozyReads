# 🚨 Troubleshooting Guide

Common issues and their solutions.

## Installation & Setup

### "npm install" fails with permission error

**Symptom:** `npm ERR! code EACCES`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Install with proper permissions
npm install

# Or use sudo (not recommended)
sudo npm install
```

### "node_modules not found" after clone

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Database Issues

### "DATABASE_URL is not set" error

**Symptom:**
```
Error: DATABASE_URL is required
```

**Solution:**
1. Check `.env.local` exists in project root
2. Verify it contains `DATABASE_URL="postgresql://..."`
3. Restart dev server: `Ctrl+C` then `npm run dev`

### "Cannot connect to database"

**Symptoms:**
- `connect ECONNREFUSED`
- `FATAL: password authentication failed`
- Connection timeout

**Solutions:**

**For Neon:**
1. Go to [neon.tech](https://neon.tech)
2. Check your project dashboard
3. Verify database is running
4. Reset password if needed
5. Update `DATABASE_URL` in `.env.local`

**For Local PostgreSQL:**
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start

# Test connection
psql $DATABASE_URL
```

**For Docker:**
```bash
# Check if container is running
docker ps | grep postgres

# Start container
docker-compose up -d
```

### "Prisma Client not found" error

**Symptom:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
npm run prisma:generate
# or
npx prisma generate
```

### Migration failed

**Symptom:**
```
Error: P3005 - A migration failed when it was applied to the database
```

**Solutions:**

1. **View migration status:**
   ```bash
   npx prisma migrate status
   ```

2. **Reset database (⚠️ Deletes all data):**
   ```bash
   npx prisma migrate reset
   ```

3. **Create manual migration:**
   ```bash
   npx prisma migrate dev --name add_my_column
   ```

4. **Check Prisma Studio:**
   ```bash
   npm run prisma:studio
   ```

---

## Authentication Issues

### "Clerk authentication not working"

**Symptoms:**
- Stuck on sign-in page
- "Invalid credentials" error
- Can't sign up

**Solutions:**

1. **Verify Clerk keys:**
   - Check `.env.local` has keys
   - Keys must start with `pk_test_` and `sk_test_` (dev) or `pk_live_` and `sk_live_` (prod)

2. **Check redirect URLs in Clerk dashboard:**
   - Go to [dashboard.clerk.com](https://dashboard.clerk.com)
   - Settings → Paths & URLs
   - Add `http://localhost:3000` to "Allowed redirect URLs"

3. **Clear browser storage:**
   - Open DevTools (F12)
   - Application → Local Storage → Clear all
   - Application → Cookies → Delete

4. **Test in incognito window:**
   - Open private/incognito window
   - Try signing in again

### "CORS error with Clerk"

**Symptom:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Add your domain to Clerk's allowed origins:
  - Clerk Dashboard → Settings → Paths & URLs
  - Add your full URL (e.g., `http://localhost:3000`)

---

## Development Server Issues

### "Port 3000 already in use"

**Symptom:**
```
Error: EADDRINUSE: address already in use :::3000
```

**Solutions:**

**Kill existing process:**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Use different port:**
```bash
npm run dev -- -p 3001
```

### "Hot reload not working"

**Solutions:**
1. Restart dev server: `Ctrl+C` then `npm run dev`
2. Check file permissions
3. Clear `.next` folder: `rm -rf .next`
4. Reinstall dependencies: `rm -rf node_modules && npm install`

### "TypeScript errors in editor but code works"

**Solution:**
```bash
# Type check
npm run type-check

# If errors shown:
# 1. Restart VSCode
# 2. Run: npx tsc --noEmit
# 3. Update TypeScript: npm update typescript
```

---

## Build & Production Issues

### "Build fails with TypeScript errors"

**Solution:**
```bash
# Check errors
npm run type-check

# Fix issues in code, then rebuild
npm run build
```

### "Build size too large"

**Solutions:**
1. Analyze bundle:
   ```bash
   npm run build -- --analyze
   ```

2. Remove unused dependencies:
   ```bash
   npm audit
   npm uninstall <package>
   ```

3. Enable code splitting for dynamic imports

---

## Performance Issues

### "Slow initial page load"

**Solutions:**
1. Check Network tab in DevTools
2. Enable image optimization
3. Use React Query caching
4. Check database query performance:
   ```bash
   npm run prisma:studio
   ```

### "High memory usage"

**Solutions:**
1. Check for memory leaks in DevTools
2. Limit dataset pagination
3. Clear browser cache
4. Restart dev server

---

## Deployment Issues

### "Vercel deployment fails"

**Solutions:**
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Ensure `npm run build` works locally
4. Check database URL is accessible from Vercel
5. Verify Clerk credentials are valid

### "Docker build fails"

**Symptom:**
```
Error during docker build
```

**Solutions:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker-compose build --no-cache

# Run
docker-compose up
```

---

## Code Quality Issues

### "ESLint errors"

```bash
# Fix automatically
npm run lint

# Check without fixing
npm run lint:check
```

### "Prettier formatting issues"

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### "TypeScript strict mode errors"

**Solution:** Update code to match strict TypeScript:
```typescript
// ❌ Bad
const value: any = ...

// ✓ Good
const value: string = ...
```

---

## Testing Issues

### "Tests fail to run"

```bash
# Clear Jest cache
npm test -- --clearCache

# Run tests with verbose output
npm test -- --verbose
```

---

## Getting More Help

1. **Check logs:**
   ```bash
   # Next.js logs
   npm run dev

   # Prisma logs
   PRISMA_DEBUG=* npm run dev
   ```

2. **Enable debug mode:**
   ```bash
   DEBUG=* npm run dev
   ```

3. **Check GitHub Issues:**
   - [CozyReads Issues](https://github.com/aeldarian1/CozyReads/issues)
   - Search for similar problems

4. **Ask for help:**
   - [GitHub Discussions](https://github.com/aeldarian1/CozyReads/discussions)
   - Provide detailed error messages and logs

5. **Check documentation:**
   - [DEVELOPMENT.md](./DEVELOPMENT.md)
   - [ARCHITECTURE.md](./ARCHITECTURE.md)
   - [API.md](./API.md)

---

## Still stuck?

1. **Collect information:**
   - OS and Node.js version: `node -v`, `npm -v`
   - Error message with full stack trace
   - Steps to reproduce
   - What you've already tried

2. **Create GitHub Issue:**
   - Use [bug report template](./.github/ISSUE_TEMPLATE/bug_report.yml)
   - Include all information above

3. **Reach out:**
   - Email maintainers
   - Check GitHub Discussions
