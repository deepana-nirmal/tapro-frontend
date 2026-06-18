# Deployment Guide - Tapro Frontend

## Production Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] API base URL points to production backend
- [ ] CORS is properly configured on backend
- [ ] SSL/HTTPS is enabled
- [ ] All pages and features are tested
- [ ] Error handling is comprehensive
- [ ] Loading states are properly implemented
- [ ] Responsive design is tested on all devices

## Environment Setup

### Production Environment Variables

Create `.env.production.local`:
```
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
```

### Build Command
```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Deployment Options

### Option 1: Vercel (Recommended)

**Advantages**: Easiest setup, automatic deployments, edge functions

**Steps**:
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Configure environment variables:
   - REACT_APP_API_URL
6. Click Deploy

**Auto-deployments**: Every push to main branch triggers new deployment

### Option 2: Netlify

**Advantages**: GitHub integration, continuous deployment, CDN

**Steps**:
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Add environment variables:
   - REACT_APP_API_URL
7. Deploy

### Option 3: AWS S3 + CloudFront

**Advantages**: Scalable, cost-effective for high traffic

**Steps**:

1. Create S3 bucket:
```bash
aws s3 mb s3://tapro-frontend-bucket
```

2. Build the app:
```bash
npm run build
```

3. Upload to S3:
```bash
aws s3 sync build/ s3://tapro-frontend-bucket --delete
```

4. Create CloudFront distribution
5. Configure bucket policy for CloudFront
6. Point domain to CloudFront

### Option 4: Docker Deployment

**Dockerfile**:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Runtime stage
FROM node:18-alpine

RUN npm install -g serve

WORKDIR /app

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
```

**Build image**:
```bash
docker build -t tapro-frontend:1.0.0 \
  --build-arg REACT_APP_API_URL=https://api.yourdomain.com/api \
  .
```

**Run container**:
```bash
docker run -p 3000:3000 \
  -e REACT_APP_API_URL=https://api.yourdomain.com/api \
  tapro-frontend:1.0.0
```

**Docker Compose**:
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=https://api.yourdomain.com/api
    restart: always
```

### Option 5: Traditional Server (nginx/Apache)

**nginx Configuration**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/tapro-frontend/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Apache Configuration**:
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/tapro-frontend/build

    <Directory /var/www/tapro-frontend/build>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Enable gzip compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
    </IfModule>

    # Cache headers
    <FilesMatch "\.js$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>
    <FilesMatch "\.css$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>
</VirtualHost>
```

## SSL/HTTPS Setup

### Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Configure nginx for HTTPS
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Performance Optimization

### 1. Enable Gzip Compression
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;
```

### 2. Add Cache Headers
```nginx
location ~* \.(js|css)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

### 3. Use CDN
- CloudFront (AWS)
- Cloudflare
- Fastly

### 4. Monitor Performance
- Set up Sentry for error tracking
- Use Google Analytics for user tracking
- Monitor Core Web Vitals

## Monitoring & Logging

### Application Monitoring

**Sentry Integration** (for error tracking):
```typescript
import * as Sentry from "@sentry/react";

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_ENV,
    tracesSampleRate: 0.1,
  });
}
```

### Server Monitoring
- Use PM2 for process management
- Set up log aggregation (ELK Stack, Datadog)
- Monitor CPU, memory, disk usage
- Set up alerts

### Example PM2 Configuration
```json
{
  "apps": [{
    "name": "tapro-frontend",
    "script": "serve",
    "args": "-s build -l 3000",
    "instances": "max",
    "exec_mode": "cluster",
    "env": {
      "REACT_APP_API_URL": "https://api.yourdomain.com/api"
    }
  }]
}
```

## Database & Backup

The frontend doesn't require a database, but:
1. Backup `.env.production.local` separately
2. Store secrets in secure vault
3. Regular code backups in Git

## Rollback Strategy

### Version Control
```bash
# Tag releases
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0

# Create release branches
git checkout -b release/1.0.0
```

### Quick Rollback
```bash
# Rollback on Vercel
vercel rollback

# Rollback on Netlify
# Via Netlify UI: Deploy → Select previous deployment

# Rollback on S3
aws s3 sync s3://backup-bucket/v1.0.0 s3://tapro-frontend-bucket --delete
```

## Health Check Endpoint

The application will be available at:
```
GET https://yourdomain.com/
```

Test the deployment:
```bash
curl -I https://yourdomain.com/
# Should return HTTP 200
```

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: 18

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}

    - name: Deploy to S3
      run: aws s3 sync build/ s3://${{ secrets.AWS_S3_BUCKET }} --delete
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

    - name: Invalidate CloudFront
      run: aws cloudfront create-invalidation --distribution-id ${{ secrets.AWS_CF_DISTRIBUTION_ID }} --paths "/*"
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Post-Deployment Checklist

- [ ] Test login functionality
- [ ] Verify API connections work
- [ ] Check all pages load correctly
- [ ] Test responsive design
- [ ] Verify SSL certificate
- [ ] Check error handling
- [ ] Monitor performance metrics
- [ ] Review application logs
- [ ] Test with different browsers
- [ ] Verify analytics tracking

## Troubleshooting

### Blank Page Issue
- Check browser console for errors
- Verify API_BASE_URL is correct
- Check if JavaScript is loaded
- Clear browser cache

### 404 on Refresh
- Configure server to serve index.html for all routes
- For SPA routing, all non-file routes should return index.html

### Slow Loading
- Check bundle size: `npm run build -- --analyze`
- Enable gzip compression
- Use CDN
- Optimize images
- Enable caching

### CORS Issues
- Verify backend CORS headers
- Check API_BASE_URL
- Test with CORS browser extension

## Support

For deployment issues, check:
1. Server logs: `tail -f /var/log/nginx/error.log`
2. Application logs: Check Sentry or console
3. Browser console: F12 → Console tab
4. Network tab: F12 → Network tab

## Security Considerations

1. **Update dependencies regularly**
   ```bash
   npm audit fix
   npm update
   ```

2. **Use strong secrets**
   - Never commit `.env.production.local`
   - Rotate API keys regularly
   - Use HTTPS only

3. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self' 'unsafe-inline';">
   ```

4. **HSTS Headers**
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   ```

5. **X-Frame-Options**
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN" always;
   ```

---

**Deployment Complete!** 🚀

Your Tapro frontend is now live and ready to serve customers!
