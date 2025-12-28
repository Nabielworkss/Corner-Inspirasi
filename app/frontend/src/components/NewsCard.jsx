import React from 'react';
import { Eye, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';

const NewsCard = ({ news }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-red-600 text-white">{news.category}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
          {news.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {news.excerpt}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{new Date(news.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Eye size={14} />
            <span>{news.views.toLocaleString()}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
