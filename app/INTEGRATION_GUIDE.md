# Frontend Integration Guide - Corner Inspirasi CMS

## 📋 Integration Steps

### Step 1: Update API Configuration

Create `/app/frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Step 2: Create API Service Functions

Create `/app/frontend/src/services/cms.js`:

```javascript
import api from './api';

// Transform Strapi response to frontend format
const transformArticle = (strapiArticle) => {
  if (!strapiArticle) return null;
  
  const { id, attributes } = strapiArticle;
  return {
    id,
    title: attributes.title,
    slug: attributes.slug,
    excerpt: attributes.excerpt,
    content: attributes.content,
    image: attributes.featured_image,
    category: attributes.category?.data?.attributes?.name || 'Uncategorized',
    categorySlug: attributes.category?.data?.attributes?.slug,
    author: attributes.author?.data?.attributes?.username || 'Admin',
    date: attributes.publishedAt || attributes.createdAt,
    views: attributes.views || 0,
    isFeatured: attributes.is_featured || false,
  };
};

// CMS Service
export const cmsService = {
  // Get all categories
  async getCategories() {
    try {
      const response = await api.get('/categories');
      return response.data.data.map(cat => ({
        id: cat.id,
        name: cat.attributes.name,
        slug: cat.attributes.slug,
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get all articles
  async getArticles(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append('populate', '*');
      
      if (options.category) {
        params.append('filters_category_slug', options.category);
      }
      
      if (options.featured) {
        params.append('filters_is_featured', 'true');
      }
      
      if (options.limit) {
        params.append('pagination_limit', options.limit);
      }
      
      if (options.sort === 'trending') {
        params.append('sort', 'views:desc');
      }
      
      const response = await api.get(`/articles?${params.toString()}`);
      return response.data.data.map(transformArticle);
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  },

  // Get single article by slug
  async getArticleBySlug(slug) {
    try {
      const response = await api.get(`/articles?filters_slug=${slug}&populate=*`);
      if (response.data.data.length > 0) {
        return transformArticle(response.data.data[0]);
      }
      return null;
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  },

  // Get single article by ID
  async getArticleById(id) {
    try {
      const response = await api.get(`/articles/${id}?populate=*`);
      return transformArticle(response.data.data);
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  },

  // Get featured articles for hero carousel
  async getFeaturedArticles() {
    return this.getArticles({ featured: true, limit: 3 });
  },

  // Get trending articles for sidebar
  async getTrendingArticles(limit = 5) {
    return this.getArticles({ sort: 'trending', limit });
  },

  // Get articles by category
  async getArticlesByCategory(categorySlug, limit = 10) {
    return this.getArticles({ category: categorySlug, limit });
  },

  // Authentication
  async login(email, password) {
    try {
      const response = await api.post('/auth/local', {
        identifier: email,
        password,
      });
      
      if (response.data.jwt) {
        localStorage.setItem('jwt', response.data.jwt);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('jwt');
  },

  // Create article (requires auth)
  async createArticle(articleData) {
    try {
      const response = await api.post('/articles', articleData);
      return response.data;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  },
};

export default cmsService;
```

### Step 3: Replace Mock Data with Real API Calls

Update `/app/frontend/src/pages/Home.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cmsService from '../services/cms';
import HeroCarousel from '../components/HeroCarousel';
import NewsCard from '../components/NewsCard';
import { TrendingUp, Eye } from 'lucide-react';
import { Badge } from '../components/ui/badge';

const Home = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newsByCategory, setNewsByCategory] = useState({});
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [featured, cats, trending] = await Promise.all([
        cmsService.getFeaturedArticles(),
        cmsService.getCategories(),
        cmsService.getTrendingArticles(),
      ]);

      setFeaturedNews(featured);
      setCategories(cats);
      setTrendingNews(trending);

      // Load articles for each category
      const categoryArticles = {};
      for (const category of cats) {
        const articles = await cmsService.getArticlesByCategory(category.slug, 3);
        categoryArticles[category.slug] = articles;
      }
      setNewsByCategory(categoryArticles);
      
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"text-center\">
          <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto\"></div>
          <p className=\"mt-4 text-gray-600\">Memuat konten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gray-50\">
      {/* Hero Carousel */}
      {featuredNews.length > 0 && (
        <section className=\"bg-white\">
          <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6\">
            <HeroCarousel news={featuredNews} />
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-8\">
          {/* Main Content Area */}
          <div className=\"lg:col-span-2 space-y-12\">
            {/* Category Sections */}
            {categories.map((category) => {
              const categoryArticles = newsByCategory[category.slug] || [];
              if (categoryArticles.length === 0) return null;
              
              return (
                <section key={category.id}>
                  <div className=\"flex items-center justify-between mb-6\">
                    <h2 className=\"text-2xl font-bold text-gray-900 border-l-4 border-red-600 pl-3\">
                      {category.name}
                    </h2>
                    <Link
                      to={`/kategori/${category.slug}`}
                      className=\"text-red-600 hover:text-red-700 font-medium text-sm transition-colors\"
                    >
                      Lihat Semua →
                    </Link>
                  </div>

                  <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
                    {categoryArticles.map((news) => (
                      <NewsCard key={news.id} news={news} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Sidebar */}
          <aside className=\"lg:col-span-1 space-y-8\">
            {/* Trending Section */}
            {trendingNews.length > 0 && (
              <div className=\"bg-white rounded-lg border border-gray-200 p-6 sticky top-24\">
                <div className=\"flex items-center space-x-2 mb-6\">
                  <TrendingUp className=\"text-red-600\" size={24} />
                  <h3 className=\"text-xl font-bold text-gray-900\">Trending Now</h3>
                </div>

                <div className=\"space-y-4\">
                  {trendingNews.map((news, index) => (
                    <div key={news.id} className=\"group cursor-pointer\">
                      <Link to={`/artikel/${news.slug}`} className=\"flex space-x-3\">
                        <span className=\"text-2xl font-bold text-red-600 flex-shrink-0\">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className=\"flex-1\">
                          <h4 className=\"text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors leading-snug mb-1\">
                            {news.title}
                          </h4>
                          <div className=\"flex items-center space-x-2 text-xs text-gray-500\">
                            <Badge variant=\"secondary\" className=\"text-xs\">{news.category}</Badge>
                            <span className=\"flex items-center space-x-1\">
                              <Eye size={12} />
                              <span>{news.views.toLocaleString()}</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                      {index < trendingNews.length - 1 && (
                        <div className=\"border-b border-gray-100 mt-4\"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Section */}
            <div className=\"bg-white rounded-lg border border-gray-200 p-6\">
              <h3 className=\"text-xl font-bold text-gray-900 mb-4\">Tag Populer</h3>
              <div className=\"flex flex-wrap gap-2\">
                {categories.map((cat) => (
                  <Link key={cat.id} to={`/kategori/${cat.slug}`}>
                    <Badge
                      variant=\"outline\"
                      className=\"cursor-pointer hover:bg-red-600 hover:text-white hover:border-red-600 transition-all\"
                    >
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;
```

### Step 4: Update NewsCard Component

The `NewsCard` component should work as-is, but ensure it uses the correct field names from the transformed data.

### Step 5: Update HeroCarousel Component

Update to use the transformed field names:

```javascript
// In HeroCarousel.jsx, replace:
// currentNews.image instead of currentNews.featured_image
// currentNews.author instead of author lookup
```

### Step 6: Create Article Detail Page

Create `/app/frontend/src/pages/ArticleDetail.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import cmsService from '../services/cms';
import { Calendar, Eye, User, ArrowLeft } from 'lucide-react';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await cmsService.getArticleBySlug(slug);
      setArticle(data);

      if (data && data.categorySlug) {
        const related = await cmsService.getArticlesByCategory(data.categorySlug, 3);
        setRelatedArticles(related.filter(a => a.slug !== slug));
      }
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"text-center\">
          <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto\"></div>
          <p className=\"mt-4 text-gray-600\">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"text-center\">
          <h1 className=\"text-2xl font-bold text-gray-900 mb-2\">Artikel Tidak Ditemukan</h1>
          <p className=\"text-gray-600 mb-4\">Artikel yang Anda cari tidak tersedia.</p>
          <Link to=\"/\" className=\"text-red-600 hover:text-red-700 font-medium\">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gray-50 py-8\">
      <div className=\"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8\">
        {/* Back Button */}
        <Link
          to=\"/\"
          className=\"inline-flex items-center space-x-2 text-gray-600 hover:text-red-600 mb-6 transition-colors\"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </Link>

        {/* Article Content */}
        <article className=\"bg-white rounded-lg border border-gray-200 p-8\">
          {/* Title */}
          <h1 className=\"text-4xl font-bold text-gray-900 mb-4 leading-tight\">
            {article.title}
          </h1>

          {/* Meta */}
          <div className=\"flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200\">
            <span className=\"flex items-center space-x-2\">
              <User size={16} />
              <span>{article.author}</span>
            </span>
            <span className=\"flex items-center space-x-2\">
              <Calendar size={16} />
              <span>{new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </span>
            <span className=\"flex items-center space-x-2\">
              <Eye size={16} />
              <span>{article.views.toLocaleString()} views</span>
            </span>
            <span className=\"px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium\">
              {article.category}
            </span>
          </div>

          {/* Featured Image */}
          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              className=\"w-full h-96 object-cover rounded-lg mb-8\"
            />
          )}

          {/* Excerpt */}
          <p className=\"text-xl text-gray-700 mb-6 leading-relaxed font-medium\">
            {article.excerpt}
          </p>

          {/* Content */}
          <div
            className=\"prose prose-lg max-w-none\"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className=\"mt-12\">
            <h2 className=\"text-2xl font-bold text-gray-900 mb-6\">Artikel Terkait</h2>
            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/artikel/${related.slug}`}
                  className=\"bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all\"
                >
                  <img
                    src={related.image}
                    alt={related.title}
                    className=\"w-full h-40 object-cover\"
                  />
                  <div className=\"p-4\">
                    <h3 className=\"font-bold text-gray-900 mb-2 line-clamp-2\">
                      {related.title}
                    </h3>
                    <p className=\"text-sm text-gray-600 line-clamp-2\">
                      {related.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetail;
```

### Step 7: Update Routes in App.js

```javascript
import ArticleDetail from './pages/ArticleDetail';

// In routes:
<Route path="/artikel/:slug" element={<ArticleDetail />} />
```

### Step 8: Test Integration

```bash
# Restart frontend to pick up changes
supervisorctl restart frontend

# Check logs
tail -f /var/log/supervisor/frontend.out.log
```

---

## 🔧 Troubleshooting

### CORS Errors
- Backend sudah configured untuk allow all origins
- Pastikan `REACT_APP_BACKEND_URL` benar di frontend/.env

### Data Not Loading
- Check browser console for API errors
- Verify backend is running: `supervisorctl status backend`
- Test API directly: `curl https://infoinspirative.preview.emergentagent.com/api/articles`

### Images Not Showing
- Pastikan featured_image URL valid
- Check if image URL is accessible
- Update image URLs in database if needed

---

## ✅ Next Steps

1. Replace mock data files with CMS integration
2. Test all pages (Home, Article Detail, Category pages)
3. Add loading states and error handling
4. Implement pagination if needed
5. Add search functionality

**Integration is ready!** 🚀
