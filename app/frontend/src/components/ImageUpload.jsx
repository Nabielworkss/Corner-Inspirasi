import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import api from '../services/api';

const ImageUpload = ({ value, onChange, label = "Upload Gambar" }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipe File Tidak Valid',
        description: 'Gunakan file JPG, PNG, WEBP, atau GIF',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Terlalu Besar',
        description: 'Ukuran maksimal 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Get full URL for preview
      const imageUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.url}`;
      onChange(imageUrl);

      toast({
        title: 'Upload Berhasil!',
        description: 'Gambar berhasil diupload',
      });
    } catch (error) {
      toast({
        title: 'Upload Gagal',
        description: error.response?.data?.detail || 'Terjadi kesalahan saat upload',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {!value ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-red-600 bg-red-50'
              : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileInput}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-3">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  <p className="text-sm text-gray-600">Mengupload...</p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Klik untuk upload atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, WEBP, GIF (max 5MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </label>
        </div>
      ) : (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2"
          >
            <X size={16} className="mr-1" />
            Hapus
          </Button>
        </div>
      )}
      
      {/* Alternative: Manual URL input */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Atau masukkan URL gambar:</p>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
    </div>
  );
};

export default ImageUpload;
