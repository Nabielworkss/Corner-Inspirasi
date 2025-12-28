import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import cmsService from '../../services/cms';
import { FileText, FolderOpen, Eye, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/card';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalCategories: 0,
    totalViews: 0,
    recentArticles: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [articles, categories] = await Promise.all([
        cmsService.getArticles({ limit: 100 }),
        cmsService.getCategories(),
      ]);

      const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
      const recentArticles = articles.slice(0, 5);

      setStats({
        totalArticles: articles.length,
        totalCategories: categories.length,
        totalViews,
        recentArticles,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang di Corner Inspirasi CMS</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Artikel</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalArticles}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <FileText className="text-red-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Kategori</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCategories}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <FolderOpen className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Articles */}
        <Card className="p-6 bg-white border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Artikel Terbaru</h2>
          <div className="space-y-4">
            {stats.recentArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{article.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {article.category} • {new Date(article.date).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Eye size={16} />
                  <span className="text-sm font-medium">{article.views}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
