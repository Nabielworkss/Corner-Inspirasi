import React from 'react';
import { Link } from 'react-router-dom';
import { featuredNews, newsByCategory, trendingNews, categories } from '../mockData';
import HeroCarousel from '../components/HeroCarousel';
import NewsCard from '../components/NewsCard';
import { TrendingUp, Eye } from 'lucide-react';
import { Badge } from '../components/ui/badge';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <HeroCarousel news={featuredNews} />
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
            {/* Category Sections */}
            {categories.map((category) => {
              const categoryNews = newsByCategory[category.id] || [];
              return (
                <section key={category.id} className="">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-red-600 pl-3">
                      {category.name}
                    </h2>
                    <Link
                      to={`/kategori/${category.slug}`}
                      className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                    >
                      Lihat Semua →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categoryNews.map((news) => (
                      <NewsCard key={news.id} news={news} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Trending Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="text-red-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Trending Now</h3>
              </div>

              <div className="space-y-4">
                {trendingNews.map((news, index) => (
                  <div key={news.id} className="group cursor-pointer">
                    <div className="flex space-x-3">
                      <span className="text-2xl font-bold text-red-600 flex-shrink-0">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors leading-snug mb-1">
                          {news.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Badge variant="secondary" className="text-xs">{news.category}</Badge>
                          <span className="flex items-center space-x-1">
                            <Eye size={12} />
                            <span>{news.views.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    {index < trendingNews.length - 1 && (
                      <div className="border-b border-gray-100 mt-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tag Populer</h3>
              <div className="flex flex-wrap gap-2">
                {['Politik', 'Ekonomi', 'Pendidikan', 'Teknologi', 'Kesehatan', 'Olahraga', 'Entertainment', 'Kuliner'].map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ad Space Placeholder */}
            <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500 text-sm font-medium">Space Iklan</p>
              <p className="text-gray-400 text-xs mt-1">300 x 250</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;
