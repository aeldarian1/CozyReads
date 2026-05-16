# DEPLOYMENT.md

## 🚀 Deployment Guide

This guide covers deploying CozyReads to various platforms.

## 📋 Prerequisites

- Database: PostgreSQL (Neon recommended)
- Authentication: Clerk account
- Optional: Google Books API key
- Deployment platform account

## 🔄 Environment Setup

### 1. Create `.env.production.local`

```bash
cp .env.example .env.production.local
```

### 2. Fill in production values

```env
DATABASE_URL="postgresql://user:password@your-db-host/cozyreads?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
GOOGLE_BOOKS_API_KEY="your_api_key"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
```

## ☁️ Vercel (Recommended)

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import GitHub repository
4. Configure settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Add Environment Variables

In Vercel dashboard:
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `GOOGLE_BOOKS_API_KEY` (optional)

### 4. Deploy

Click "Deploy" - Vercel will handle the rest!

### 5. Configure Domain

- Go to Project Settings → Domains
- Add your custom domain or use vercel.app subdomain

## 🐳 Docker Deployment

### 1. Build Docker image

```bash
docker build -t cozyreads:latest .
```

### 2. Run container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..." \
  -e CLERK_SECRET_KEY="sk_live_..." \
  cozyreads:latest
```

### 3. Using Docker Compose

```bash
cp .env.example .env.production.local
# Update .env.production.local with production values

docker-compose -f docker-compose.yml up -d
```

## 📦 Manual Deployment (VPS)

### 1. SSH into server

```bash
ssh user@your-server.com
```

### 2. Clone repository

```bash
git clone https://github.com/aeldarian1/CozyReads.git
cd CozyReads
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment

```bash
nano .env.production
```

### 5. Build application

```bash
npm run build
```

### 6. Start with PM2

```bash
npm install -g pm2
pm2 start "npm start" --name "cozyreads"
pm2 save
```

### 7. Configure Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8. Enable HTTPS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 🗄️ Database Setup

### Neon PostgreSQL (Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string to `DATABASE_URL`

### Manual PostgreSQL

1. Create database:
   ```bash
   createdb cozyreads
   ```

2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## ✅ Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Database is accessible and seeded
- [ ] Clerk authentication is configured
- [ ] CORS origins are whitelisted
- [ ] SSL certificate is valid
- [ ] Backups are configured
- [ ] Monitoring is set up
- [ ] Error logging is enabled

## 🔒 Security Checklist

- [ ] All secrets are in environment variables (not in code)
- [ ] Database has strong password
- [ ] HTTPS is enforced
- [ ] Rate limiting is enabled
- [ ] Firewall rules are configured
- [ ] Regular backups are scheduled
- [ ] Dependencies are up to date

## 📊 Monitoring & Logging

### Vercel
- Built-in analytics and error tracking
- Check dashboard for performance metrics

### Custom VPS
```bash
# View application logs
pm2 logs cozyreads

# Monitor system resources
htop

# Check disk usage
df -h
```

## 🔄 CI/CD Pipeline

GitHub Actions automatically:
- Runs tests on every push
- Deploys to Vercel on main branch
- Creates build artifacts

View workflows in `.github/workflows/`

## 📚 Additional Resources

- [Vercel Deployment Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/orm/more/deployment)
- [Clerk Authentication Setup](https://clerk.com/docs)
- [Docker Documentation](https://docs.docker.com/)

## 🆘 Troubleshooting

### Database connection error
- Verify `DATABASE_URL` format
- Check firewall rules
- Ensure database is running

### Clerk authentication not working
- Verify API keys in environment variables
- Check Clerk dashboard for active domain
- Clear browser cookies

### Out of memory
- Increase server RAM
- Optimize database queries
- Implement caching

## 📞 Support

For deployment issues:
1. Check [GitHub Issues](https://github.com/aeldarian1/CozyReads/issues)
2. Review logs for error messages
3. See [SECURITY.md](./SECURITY.md) for security concerns
