import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Tentang Kami', path: '/tentang' },
    { name: 'Redaksi', path: '/redaksi' },
    { name: 'Pedoman Media Siber', path: '/pedoman' },
    { name: 'Privacy & Disclaimer', path: '/privacy' },
    { name: 'Kontak', path: '/kontak' }
  ];

  const categories = [
    { name: 'Nasional', path: '/kategori/nasional' },
    { name: 'Daerah', path: '/kategori/daerah' },
    { name: 'Ekonomi', path: '/kategori/ekonomi' },
    { name: 'Pendidikan', path: '/kategori/pendidikan' },
    { name: 'Lifestyle', path: '/kategori/lifestyle' },
    { name: 'Komunitas', path: '/kategori/komunitas' }
  ];

  const socialMedia = [
    { name: 'Facebook', icon: Facebook, url: '#' },
    { name: 'Twitter', icon: Twitter, url: '#' },
    { name: 'Instagram', icon: Instagram, url: '#' },
    { name: 'Youtube', icon: Youtube, url: '#' }
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CI</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Corner Inspirasi</h2>
                <p className="text-xs text-gray-600">Ruang Inspirasi & Informasi</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Portal berita online yang menghadirkan informasi terkini, inspirasi, dan edukasi untuk masyarakat Indonesia. 
              Kami berkomitmen menyajikan berita berkualitas dengan prinsip jurnalisme profesional.
            </p>
            <div className="flex space-x-3">
              {socialMedia.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    className="w-9 h-9 bg-gray-100 hover:bg-red-600 rounded-full flex items-center justify-center text-gray-600 hover:text-white transition-all"
                    aria-label={social.name}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Kategori</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.path}>
                  <Link
                    to={category.path}
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">
              © 2025 Corner Inspirasi. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <Mail size={16} />
              <a href="mailto:info@cornerinspirasi.id" className="hover:text-red-600 transition-colors">
                info@cornerinspirasi.id
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
