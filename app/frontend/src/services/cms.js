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

  // Validate token
  async validateToken() {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) return false;
      
      // Use dedicated validation endpoint
      const response = await api.get('/auth/validate');
      return response.data.valid;
    } catch (error) {
      // If 401 or any error, token is invalid
      return false;
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
