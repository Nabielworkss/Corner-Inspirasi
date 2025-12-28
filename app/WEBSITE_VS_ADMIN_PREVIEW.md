# Corner Inspirasi - Preview Website & Admin Panel

## 📰 WEBSITE UTAMA (Public Portal Berita)

**URL Akses**: https://infoinspirative.preview.emergentagent.com/

### Fitur Website Utama:
✅ **Hero Carousel** - Slider otomatis untuk featured articles
✅ **Kategori Berita** - 6 kategori: Nasional, Daerah, Ekonomi, Pendidikan, Lifestyle, Komunitas
✅ **Trending Sidebar** - Top 5 artikel paling banyak dilihat
✅ **News Cards** - Card design modern dengan thumbnail
✅ **Tag Populer** - Quick navigation per kategori
✅ **Footer Lengkap** - Quick links, kategori, social media
✅ **Contact Page** - Form kontak dengan info lengkap
✅ **Mobile Responsive** - Optimized untuk semua device

### Halaman Website:
- `/` - Homepage dengan hero carousel & kategori
- `/kontak` - Halaman kontak
- `/artikel/{slug}` - Detail artikel (coming soon)
- `/kategori/{slug}` - Filter per kategori (coming soon)

---

## 🔐 ADMIN PANEL CMS (Content Management)

**URL Akses**: https://infoinspirative.preview.emergentagent.com/admin/login

### Login Credentials:
```
Email: nabielworks25@gmail.com
Password: admin123
```

### Fitur Admin Panel:

#### 1. 🏠 Dashboard
- **Statistik Real-time**: Total artikel, kategori, dan views
- **Recent Articles**: 5 artikel terbaru dengan quick info
- **Overview Cards**: Visual statistics dengan icons

#### 2. 📝 Manage Artikel
- **List View**: Table dengan judul, kategori, views, tanggal, status
- **Create New**: Form lengkap untuk buat artikel baru
  - Judul Artikel (auto-generate slug)
  - Slug (editable URL-friendly)
  - Ringkasan/Excerpt (max 500 karakter dengan counter)
  - Konten Artikel (large textarea, support HTML)
  - URL Gambar Utama (dengan image preview)
  - Pilih Kategori (dropdown)
  - Featured Toggle (mark untuk hero carousel)
  - Button: Simpan Artikel / Batal
- **Edit**: Edit artikel yang sudah ada
- **Delete**: Hapus artikel
- **Filter & Sort**: By category, date, views

#### 3. 📁 Manage Kategori
- **List View**: Table nama kategori dan slug
- **Add Category**: Dialog popup untuk tambah kategori baru
  - Nama Kategori
  - Slug (auto-generate dari nama)
- **Edit**: Edit kategori existing
- **Delete**: Hapus kategori

#### 4. 👥 Users Management (Coming Soon)
- User list dengan roles
- Add/edit users
- Role assignment (Super Admin, Editor, Reporter)

### Layout Admin Panel:
- **Sidebar Navigation**: Dashboard, Artikel, Kategori, Users
- **Top Bar**: User info (username + email) dan Logout button
- **Mobile Responsive**: Collapsible sidebar untuk mobile
- **Protected Routes**: Auto-redirect ke login jika belum authenticated

---

## 🔄 Workflow Edit Konten

### Via Admin Panel (Recommended - User Friendly):

1. **Login ke CMS**
   ```
   Buka: https://infoinspirative.preview.emergentagent.com/admin/login
   Login: nabielworks25@gmail.com / admin123
   ```

2. **Buat Artikel Baru**
   - Klik menu **"Artikel"** di sidebar
   - Klik button **"Buat Artikel Baru"** (merah, pojok kanan atas)
   - Isi form:
     * **Judul**: "Breaking: Gempa 7.2 SR Guncang Jawa Timur"
     * **Slug**: Otomatis jadi "breaking-gempa-72-sr-guncang-jawa-timur"
     * **Ringkasan**: "Gempa berkekuatan 7.2 SR mengguncang wilayah Jawa Timur pada pukul 14:30 WIB hari ini..."
     * **Konten**: Tulis berita lengkap (support HTML untuk formatting)
     * **Gambar**: Paste URL gambar dari Unsplash/internet
     * **Kategori**: Pilih "Nasional"
     * **Featured**: Toggle ON jika ingin muncul di hero carousel
   - Klik **"Simpan Artikel"**
   - Done! Artikel langsung publish & muncul di website

3. **Edit Artikel**
   - Buka menu **"Artikel"**
   - Klik icon **Edit** (pensil) di artikel yang ingin diedit
   - Update content
   - Simpan

4. **Tambah Kategori Baru**
   - Klik menu **"Kategori"**
   - Klik **"Tambah Kategori"**
   - Input nama (contoh: "Politik")
   - Slug auto-generate ("politik")
   - Simpan

### Via API (For Developers):

Gunakan REST API endpoint dengan JWT authentication.
Dokumentasi lengkap di file `CMS_USER_GUIDE.md`

---

## 📊 Database Structure

### Collections:
1. **articles** - Semua artikel berita
   - id, title, slug, excerpt, content
   - featured_image, category_id, author_id
   - views, is_featured, publishedAt, createdAt

2. **categories** - Kategori berita
   - id, name, slug, createdAt, updatedAt

3. **users** - Admin & editor users
   - id, username, email, password (hashed)
   - full_name, bio, role, createdAt

### Sample Data:
- ✅ 3 artikel sample (Pendidikan, Ekonomi, Daerah)
- ✅ 6 kategori default
- ✅ 2 users (Admin + Editor)

---

## 🎯 Perbedaan Website vs Admin Panel

| Feature | Website Utama | Admin Panel |
|---------|---------------|-------------|
| **URL** | `/` | `/admin` |
| **Access** | Public | Login Required |
| **Purpose** | Baca berita | Manage content |
| **Users** | Semua orang | Admin & Editor only |
| **Navigation** | Header menu publik | Sidebar admin menu |
| **Design** | News portal style | CMS dashboard style |
| **Actions** | View, read, search | Create, edit, delete |

---

## 🚀 Next Steps

### Untuk Website:
1. Tambah halaman detail artikel (`/artikel/{slug}`)
2. Filter by category page (`/kategori/{slug}`)
3. Search functionality
4. Pagination
5. Social sharing buttons

### Untuk Admin Panel:
1. Rich text editor (Quill/TinyMCE) untuk konten
2. Image upload (bukan hanya URL)
3. Article analytics (views tracking)
4. Bulk actions (delete multiple)
5. User management page
6. Media library untuk manage images

---

## 🔒 Security

### Current Implementation:
✅ JWT Authentication
✅ Email whitelist for registration
✅ Password hashing (bcrypt)
✅ Protected admin routes
✅ CORS configured
✅ Role-based access (Ready for expansion)

### Recommended for Production:
- [ ] HTTPS only
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Regular backups
- [ ] 2FA for admin

---

## 📝 Support Documentation

- **CMS_USER_GUIDE.md** - Complete API documentation
- **INTEGRATION_GUIDE.md** - Frontend-backend integration
- **STRAPI_DEPLOYMENT_GUIDE.md** - Alternative Strapi deployment

---

## 🎉 Ready to Use!

**Website Publik**: Sudah live dengan sample content
**Admin Panel**: Sudah bisa dipakai untuk manage konten

Login sekarang dan mulai buat artikel pertama Anda! 🚀
