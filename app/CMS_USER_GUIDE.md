# Corner Inspirasi CMS - User Guide

## 🎯 Overview

Anda sekarang memiliki **2 pilihan** untuk mengelola konten Corner Inspirasi:

### Option 1: REST API Backend (Current - FastAPI) ✅ **READY TO USE**
- **Status**: ✅ Running & Ready
- **Admin Panel**: Not available (API only)
- **Base URL**: `https://infoinspirative.preview.emergentagent.com/api`
- **Use Case**: Akses programmatic, integrasi dengan frontend

### Option 2: Strapi CMS (Recommended for Production) 🚀
- **Status**: Need deployment to Railway/Render
- **Admin Panel**: ✅ Yes (Visual Editor)
- **Use Case**: Content management dengan UI visual
- **Guide**: See `STRAPI_DEPLOYMENT_GUIDE.md`

---

## 📚 Current API Documentation (FastAPI)

### Base URL
```
https://infoinspirative.preview.emergentagent.com/api
```

### Authentication

#### 1. Register (Email Whitelist Only)
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "yourusername",
  "email": "nabielworks25@gmail.com",
  "password": "yourpassword",
  "full_name": "Your Full Name"
}
```

**Response:**
```json
{
  "jwt": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "username": "yourusername",
    "email": "nabielworks25@gmail.com"
  }
}
```

#### 2. Login
```bash
POST /api/auth/local
Content-Type: application/json

{
  "identifier": "nabielworks25@gmail.com",
  "password": "admin123"
}
```

**Default Credentials:**
- **Admin**: `nabielworks25@gmail.com` / `admin123`
- **Editor**: `editor@cornerinspirasi.id` / `editor123`

⚠️ **CHANGE DEFAULT PASSWORDS!**

### Categories API

#### Get All Categories
```bash
GET /api/categories
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "attributes": {
        "name": "Nasional",
        "slug": "nasional",
        "createdAt": "2025-01-15T10:00:00",
        "updatedAt": "2025-01-15T10:00:00"
      }
    }
  ]
}
```

#### Create Category (Requires Auth)
```bash
POST /api/categories
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Politik",
  "slug": "politik"
}
```

### Articles API

#### Get All Articles
```bash
GET /api/articles
```

#### Get Articles with Relations
```bash
GET /api/articles?populate=*
```

#### Filter by Category
```bash
GET /api/articles?filters_category_slug=nasional
```

#### Filter by Slug
```bash
GET /api/articles?filters_slug=artikel-slug-here
```

#### Get Featured Articles
```bash
GET /api/articles?filters_is_featured=true
```

#### Get Trending (Most Viewed)
```bash
GET /api/articles?sort=views:desc&pagination_limit=5
```

#### Get Single Article
```bash
GET /api/articles/{id}?populate=*
```

**Note:** Views akan otomatis bertambah setiap kali artikel dibuka

#### Create Article (Requires Auth)
```bash
POST /api/articles
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Judul Artikel Anda",
  "slug": "judul-artikel-anda",
  "excerpt": "Ringkasan singkat artikel",
  "content": "<p>Konten lengkap artikel dalam HTML</p>",
  "featured_image": "https://example.com/image.jpg",
  "category_id": "category-uuid-here",
  "is_featured": false
}
```

---

## 🔧 Managing Content

### Via API (Current Method)

#### 1. Get JWT Token
```bash
curl -X POST https://infoinspirative.preview.emergentagent.com/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{"identifier":"nabielworks25@gmail.com","password":"admin123"}'
```

Save the `jwt` from response.

#### 2. Create New Article
```bash
curl -X POST https://infoinspirative.preview.emergentagent.com/api/articles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Breaking News: Judul Berita Terbaru",
    "slug": "breaking-news-judul-berita-terbaru",
    "excerpt": "Ringkasan berita dalam 1-2 kalimat menarik",
    "content": "<h2>Pendahuluan</h2><p>Isi berita lengkap di sini...</p>",
    "featured_image": "https://images.unsplash.com/photo-xxx",
    "category_id": "GET_FROM_CATEGORIES_API",
    "is_featured": true
  }'\n```

### Via Postman/Insomnia (Recommended)

1. **Import Collection**: Create new collection in Postman
2. **Set Base URL**: `{{base_url}}/api` where `base_url` = `https://infoinspirative.preview.emergentagent.com`
3. **Login**: POST `/auth/local` → Save JWT token
4. **Set Authorization**: Bearer Token with saved JWT
5. **Create Content**: POST `/articles` with JSON body

---

## 📝 Content Management Workflow

### For Admin (nabielworks25@gmail.com)
1. Login untuk mendapat JWT token
2. Buat/edit kategori jika perlu
3. Buat artikel baru atau edit yang sudah ada
4. Set `is_featured: true` untuk artikel utama
5. Publish dengan field `publishedAt`

### For Editor
- Sama seperti admin, tapi mungkin terbatas hak akses tertentu
- Dapat membuat dan mengedit artikel
- Publish artikel setelah review

### For Reporter  
- Hanya bisa membuat draft
- Tidak bisa publish (perlu approval editor/admin)

---

## 🎨 Admin Panel Alternative (Strapi)

Jika Anda ingin admin panel visual yang lebih user-friendly:

### Quick Deploy to Railway (5 menit)

1. **Buka Railway.app** → Sign up/login
2. **New Project** → Deploy from template
3. **Search "Strapi"** → Select Strapi CMS template
4. **Add PostgreSQL** database (auto-provision)
5. **Deploy** → Tunggu 2-3 menit
6. **Open Admin** → `your-app.railway.app/admin`
7. **Create First Admin** → gunakan `nabielworks25@gmail.com`

Setelah deploy:
- Buat content types (Article, Category) via admin panel
- Setup relations
- Start creating content dengan visual editor
- API otomatis tersedia di `/api/articles`, `/api/categories`

**Full Guide**: Lihat file `STRAPI_DEPLOYMENT_GUIDE.md`

---

## 🔄 Switching to Strapi (Optional)

Jika Anda deploy Strapi ke hosting:

### Update Frontend
```javascript
// frontend/.env
REACT_APP_BACKEND_URL=https://your-strapi-app.railway.app
```

### Migrate Data
```python
# Export dari MongoDB current
# Import ke Strapi PostgreSQL
# Script migration bisa dibuat jika perlu
```

---

## 🎯 Next Steps

### Immediate (FastAPI):
1. ✅ Backend API sudah running
2. ✅ Sample data sudah ada
3. ⚠️ Ganti password admin (via update user API atau direct DB)
4. 📝 Mulai buat konten via API/Postman
5. 🔗 Integrate dengan frontend React

### Optional (Strapi CMS):
1. Deploy Strapi ke Railway/Render
2. Setup admin dengan email Anda
3. Buat content types via admin panel
4. Migrate/re-create content
5. Update frontend URL

---

## 🆘 Troubleshooting

### "403 Forbidden" saat register
- ✅ Pastikan email ada di whitelist: `nabielworks25@gmail.com`
- Tambah email lain di `server.py` → `WHITELISTED_EMAILS`

### "401 Unauthorized" saat create article
- ✅ Pastikan JWT token valid
- ✅ Cek header: `Authorization: Bearer YOUR_JWT_TOKEN`

### Article tidak muncul di frontend
- ✅ Cek `publishedAt` sudah diset
- ✅ Cek `populate=*` untuk relations
- ✅ Cek category_id valid

---

## 📧 Add New Whitelisted Email

Edit `/app/backend/server.py`:
```python
WHITELISTED_EMAILS = [
    "nabielworks25@gmail.com",
    "editor@cornerinspirasi.id",
    "newuser@example.com"  # Add here
]
```

Restart backend:
```bash
supervisorctl restart backend
```

---

## 🎓 Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **MongoDB Docs**: https://docs.mongodb.com
- **Strapi Guide**: See `STRAPI_DEPLOYMENT_GUIDE.md`
- **Frontend Integration**: See `INTEGRATION_GUIDE.md`

---

**Status Backend**: ✅ Running at https://infoinspirative.preview.emergentagent.com/api

**Ready to create content!** 🚀
