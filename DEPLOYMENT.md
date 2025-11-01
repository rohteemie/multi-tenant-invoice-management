# Deployment Guide

This guide covers deploying the Multi-Tenant Invoice Management frontend to various platforms.

## Prerequisites

- The application builds successfully with `npm run build`
- You have configured the `.env` file with the correct API URL
- You have tested the application locally

## Environment Configuration

Before deploying, ensure your `.env` file has the correct API base URL:

**Production:**
```env
VITE_API_BASE_URL=http://3.86.89.25:8000/api/v1
```

**Local Development:**
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides the easiest deployment for Vite applications.

#### Method 1: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Method 2: Using GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add environment variable:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `http://3.86.89.25:8000/api/v1`
7. Click "Deploy"

### 2. Netlify

#### Method 1: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the project
npm run build

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### Method 2: Using Drag and Drop

1. Build the project: `npm run build`
2. Go to [app.netlify.com](https://app.netlify.com)
3. Drag and drop the `dist` folder

#### Method 3: Using GitHub Integration

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "New site from Git"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add environment variable:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `http://3.86.89.25:8000/api/v1`
6. Click "Deploy site"

### 3. GitHub Pages

1. Install gh-pages package:
```bash
npm install -D gh-pages
```

2. Update `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Update `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/multi-tenant-invoice-management/'  // Your repository name
})
```

4. Deploy:
```bash
npm run deploy
```

5. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Select `gh-pages` branch
   - Save

### 4. AWS S3 + CloudFront

1. Build the project:
```bash
npm run build
```

2. Create an S3 bucket:
```bash
aws s3 mb s3://invoice-management-frontend
```

3. Upload the build:
```bash
aws s3 sync dist/ s3://invoice-management-frontend
```

4. Configure bucket for static website hosting:
   - Enable static website hosting
   - Set index document to `index.html`
   - Set error document to `index.html` (for SPA routing)

5. Create CloudFront distribution:
   - Origin: Your S3 bucket
   - Default root object: `index.html`
   - Error pages: Redirect 404 to `/index.html` with 200 status

### 5. Docker Deployment

Create a `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

Build and run:

```bash
# Build Docker image
docker build -t invoice-management-frontend .

# Run container
docker run -p 80:80 invoice-management-frontend
```

### 6. Azure Static Web Apps

1. Install Azure Static Web Apps CLI:
```bash
npm install -g @azure/static-web-apps-cli
```

2. Create a `staticwebapp.config.json`:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ]
}
```

3. Deploy using Azure Portal or GitHub Actions

## Post-Deployment Checklist

- [ ] Verify the application loads correctly
- [ ] Test login functionality
- [ ] Test registration functionality
- [ ] Verify API calls work with the backend
- [ ] Test invoice creation
- [ ] Check analytics dashboard
- [ ] Verify export functionality works
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Verify all routes work correctly

## Environment Variables

Remember to set these environment variables in your deployment platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://3.86.89.25:8000/api/v1` |

## SSL/HTTPS Configuration

For production deployments, always use HTTPS. Most platforms (Vercel, Netlify) provide automatic SSL certificates.

For custom domains:
1. Add your custom domain in the platform settings
2. Update DNS records as instructed
3. Wait for SSL certificate provisioning (usually automatic)

## Monitoring and Analytics

Consider adding:
- Google Analytics for usage tracking
- Sentry for error tracking
- Performance monitoring tools

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### API Calls Fail
- Verify `VITE_API_BASE_URL` is set correctly
- Check CORS settings on the backend
- Verify the backend is running and accessible

### Routing Issues (404 on refresh)
- Ensure your server is configured for SPA routing
- All routes should redirect to `index.html`

### Environment Variables Not Working
- Ensure variables are prefixed with `VITE_`
- Rebuild after changing environment variables
- Check platform-specific environment variable configuration

## Performance Optimization

1. **Enable Compression:**
   - Most platforms enable this by default
   - Check server configuration if deploying manually

2. **CDN:**
   - Use a CDN for static assets
   - Platforms like Vercel and Netlify have built-in CDNs

3. **Caching:**
   - Configure proper cache headers
   - Use service workers for offline support (optional)

## Security Considerations

1. Never commit `.env` files with production credentials
2. Use environment variables for all sensitive data
3. Enable HTTPS for all production deployments
4. Set appropriate CORS headers on the backend
5. Implement rate limiting on the API
6. Use Content Security Policy headers

## Continuous Deployment

Most platforms support automatic deployment from Git:

1. **GitHub Integration:**
   - Push to main branch triggers deployment
   - Pull requests get preview deployments

2. **GitHub Actions:**
   - Set up workflows for automated testing and deployment
   - Run tests before deployment

Example GitHub Actions workflow:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test
      # Add deployment step based on your platform
```

## Support

For issues related to deployment:
- Check platform-specific documentation
- Review deployment logs
- Contact platform support

For application issues:
- Open an issue on GitHub
- Check the README for common problems
