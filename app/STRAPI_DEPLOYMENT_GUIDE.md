# Corner Inspirasi CMS - Deployment Guide

## 📋 Overview
Headless CMS Backend untuk Corner Inspirasi News Portal

## 🛠️ Tech Stack Recommended
- **CMS**: Strapi v5.33.0
- **Database**: PostgreSQL 15+ (Production) / SQLite (Development)
- **Authentication**: JWT with Email Whitelist
- **API**: REST API

## 🚀 Deployment Options

### Option 1: Deploy to Railway.app (Recommended - Free Tier Available)

1. **Setup Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy Strapi**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Create new project
   railway init
   
   # Add PostgreSQL
   railway add
   # Select PostgreSQL from list
   
   # Deploy
   railway up
   ```

3. **Environment Variables** (Set in Railway Dashboard)
   ```
   NODE_ENV=production
   HOST=0.0.0.0
   PORT=1337
   APP_KEYS=generate-random-key-here
   API_TOKEN_SALT=generate-random-salt
   ADMIN_JWT_SECRET=generate-random-secret
   TRANSFER_TOKEN_SALT=generate-random-salt
   JWT_SECRET=generate-random-jwt-secret
   DATABASE_CLIENT=postgres
   DATABASE_URL=${DATABASE_URL} # Railway auto-provides this
   ```

4. **Generate Secrets**
   ```bash
   # Run this locally to generate secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

### Option 2: Deploy to Render.com (Also Free Tier)

1. Go to https://render.com
2. Connect GitHub repository
3. Create New Web Service
4. Select your Strapi repository
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Add PostgreSQL Database** from Render dashboard
6. Add environment variables (same as Railway)

### Option 3: Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create corner-inspirasi-cms

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set HOST=0.0.0.0
heroku config:set PORT=1337
# ... add other env vars

# Deploy
git push heroku main
```

## 📦 Local Development Setup

### Prerequisites
- Node.js 18+ or 20.x
- PostgreSQL 15+ (or use SQLite for local dev)

### Quick Start

```bash
# Create new Strapi project
npx create-strapi-app@latest corner-inspirasi-cms --quickstart

# Navigate to project
cd corner-inspirasi-cms

# Start development server
npm run develop
```

### Database Configuration

**For PostgreSQL** (config/database.ts):
```typescript
export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'corner_inspirasi'),
      user: env('DATABASE_USERNAME', 'postgres'),
      password: env('DATABASE_PASSWORD', ''),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
```

**For SQLite** (Development - Default):
```typescript
export default ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: env('DATABASE_FILENAME', '.tmp/data.db'),
    },
    useNullAsDefault: true,
  },
});
```

## 🔐 Authentication Setup

### Disable Public Registration

Create `src/extensions/users-permissions/strapi-server.js`:
```javascript
module.exports = (plugin) => {
  plugin.controllers.auth.register = async (ctx) => {
    ctx.status = 403;
    ctx.body = {
      error: 'Forbidden',
      message: 'Registrasi publik tidak diperbolehkan. Hubungi administrator.',
    };
  };
  return plugin;
};
```

### Email Whitelist

1. Create admin account first: `nabielworks25@gmail.com`
2. Login to admin panel: `http://localhost:1337/admin`
3. Go to Settings > Roles > Editor/Reporter
4. Manually create users with whitelisted emails

## 📝 Content Types Setup

### Article Schema
Create via Strapi Admin Panel or use this JSON:

```json
{
  "kind": "collectionType",
  "collectionName": "articles",
  "info": {
    "singularName": "article",
    "pluralName": "articles",
    "displayName": "Article"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title", "required": true },
    "excerpt": { "type": "text", "required": true, "maxLength": 500 },
    "content": { "type": "richtext", "required": true },
    "featured_image": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "category": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::category.category",
      "inversedBy": "articles"
    },
    "author": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "views": { "type": "integer", "default": 0 },
    "is_featured": { "type": "boolean", "default": false }
  }
}
```

### Category Schema
```json
{
  "kind": "collectionType",
  "collectionName": "categories",
  "info": {
    "singularName": "category",
    "pluralName": "categories",
    "displayName": "Category"
  },
  "attributes": {
    "name": { "type": "string", "required": true, "unique": true },
    "slug": { "type": "uid", "targetField": "name", "required": true },
    "articles": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::article.article",
      "mappedBy": "category"
    }
  }
}
```

## 🌐 API Endpoints

After deployment, your API will be available at:

```
GET  https://your-cms-domain.com/api/articles
GET  https://your-cms-domain.com/api/articles?filters[slug][$eq]=your-slug
GET  https://your-cms-domain.com/api/articles?filters[category][slug][$eq]=nasional
GET  https://your-cms-domain.com/api/articles?filters[is_featured][$eq]=true
GET  https://your-cms-domain.com/api/articles?sort=views:desc&pagination[limit]=5
GET  https://your-cms-domain.com/api/categories
```

### Populate Relations
```
GET /api/articles?populate=*
GET /api/articles?populate[category]=*&populate[author]=*&populate[featured_image]=*
```

## 🎨 Admin Panel Customization

Edit `src/admin/app.tsx` (or create if not exists):
```typescript
export default {
  config: {
    locales: ['id'], // Indonesian locale
    translations: {
      id: {
        'app.components.LeftMenu.navbrand.title': 'Corner Inspirasi CMS',
        'app.components.LeftMenu.navbrand.workplace': 'Admin Panel',
      },
    },
    head: {
      favicon: '/favicon.png', // Add your favicon
    },
  },
  bootstrap(app) {
    console.log('Corner Inspirasi CMS loaded!');
  },
};
```

## 🔒 Security Best Practices

1. **Change default secrets** - Never use default APP_KEYS, JWT_SECRET
2. **Enable CORS** only for your frontend domain
3. **Use HTTPS** in production
4. **Regular backups** of PostgreSQL database
5. **Update Strapi** regularly for security patches

## 📚 Default Categories to Create

Via Admin Panel, create these categories:
- Nasional
- Daerah
- Ekonomi
- Pendidikan
- Lifestyle
- Komunitas

## 👥 User Roles Setup

1. **Super Admin** (built-in)
   - Full access to everything
   - Email: nabielworks25@gmail.com

2. **Editor**
   - Create, edit, publish articles
   - Manage categories
   - View media library

3. **Reporter**
   - Create and edit drafts only
   - Cannot publish
   - Limited media access

## 🔗 Frontend Integration

Update your React frontend `.env`:
```
REACT_APP_CMS_URL=https://your-cms-domain.com
```

Example API call:
```javascript
const response = await fetch(`${process.env.REACT_APP_CMS_URL}/api/articles?populate=*`);
const data = await response.json();
```

## 💡 Tips

- Use **Railway.app** for easiest deployment (free tier, auto PostgreSQL)
- Test locally with SQLite first
- Use Strapi's **Media Library** for image management
- Enable **draft/publish** workflow for editorial process
- Set up **webhooks** to notify frontend on content changes

## 📞 Support

- Strapi Docs: https://docs.strapi.io
- Railway Docs: https://docs.railway.app
- Community: https://discord.strapi.io

---

**Next Steps:**
1. Choose deployment platform (Railway recommended)
2. Deploy Strapi CMS
3. Create admin account with nabielworks25@gmail.com
4. Set up content types via admin panel
5. Create categories
6. Start creating content!
