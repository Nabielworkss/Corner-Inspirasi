import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';

const HeroCarousel = ({ news }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const currentNews = news[currentIndex];

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden group">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${currentNews.image})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
        <div className="max-w-3xl">
          <Badge className="bg-red-600 text-white mb-4">{currentNews.category}</Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {currentNews.title}
          </h2>
          <p className="text-gray-200 text-lg mb-6 leading-relaxed">
            {currentNews.excerpt}
          </p>
          <div className="flex items-center space-x-6 text-gray-300 text-sm">
            <span className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>{new Date(currentNews.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </span>
            <span className="flex items-center space-x-2">
              <Eye size={16} />
              <span>{currentNews.views.toLocaleString()} views</span>
            </span>
            <span>{currentNews.author}</span>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {news.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
