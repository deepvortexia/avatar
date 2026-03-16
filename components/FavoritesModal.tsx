'use client';

import { useState, useEffect } from 'react';
import { fetchFavorites, removeFavorite, FavoriteImage } from '@/lib/favorites';
import { useAuth } from '@/context/AuthContext';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FavoritesModal = ({ isOpen, onClose }: FavoritesModalProps) => {
  const [favorites, setFavorites] = useState<FavoriteImage[]>([]);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    const loadFavorites = async () => {
      if (isOpen && session?.access_token) {
        setLoading(true);
        try {
          const data = await fetchFavorites(session.access_token);
          setFavorites(data);
        } catch (err) {
          console.error('Error loading favorites:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadFavorites();
  }, [isOpen, session]);

  const handleRemove = async (id: string) => {
    if (!session?.access_token) {
      alert('Please sign in to manage favorites');
      return;
    }

    if (confirm('Remove this image from favorites?')) {
      try {
        await removeFavorite(session.access_token, id);
        const data = await fetchFavorites(session.access_token);
        setFavorites(data);
      } catch (err) {
        console.error('Error removing favorite:', err);
        alert('Failed to remove favorite');
      }
    }
  };

  const handleDownload = async (imageUrl: string) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (isMobile) {
        const filename = `favorite-${Date.now()}.jpg`;
        const file = new File([blob], filename, { type: blob.type });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file] });
          return;
        }
        window.open(imageUrl, '_blank');
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `favorite-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download image. Please try right-clicking and "Save Image As..."');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="favorites-modal-overlay" onClick={onClose}>
      <div className="favorites-modal" onClick={(e) => e.stopPropagation()}>
        <button className="favorites-modal-close" onClick={onClose}>×</button>
        
        <div className="favorites-modal-header">
          <h2>⭐ Your Favorites</h2>
          <p>{favorites.length} {favorites.length === 1 ? 'image' : 'images'} saved</p>
        </div>

        <div className="favorites-modal-content">
          {loading ? (
            <div className="favorites-loading">
              <div className="loading-spinner"></div>
              <p>Loading favorites...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="favorites-empty">
              <div className="empty-icon">📭</div>
              <p>No favorites yet</p>
              <p className="empty-hint">Generate images and add them to favorites!</p>
            </div>
          ) : (
            <div className="favorites-grid">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="favorite-item">
                  <div className="favorite-image-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={favorite.result_url}
                      alt={favorite.prompt || ''}
                      className="favorite-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="favorite-details">
                    <p className="favorite-prompt">{favorite.prompt}</p>
                    <p className="favorite-date">
                      {new Date(favorite.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="favorite-actions">
                    <button
                      className="favorite-btn download-btn"
                      onClick={() => handleDownload(favorite.result_url)}
                      title="Download image"
                    >
                      📥 Download
                    </button>
                    <button
                      className="favorite-btn remove-btn"
                      onClick={() => handleRemove(favorite.id)}
                      title="Remove from favorites"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .favorites-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
          overflow-y: auto;
          padding: 20px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .favorites-modal {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 20px;
          padding: 2rem;
          max-width: 900px;
          width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          animation: slideUp 0.3s ease;
          box-shadow: 0 10px 50px rgba(212, 175, 55, 0.2);
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .favorites-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: none;
          font-size: 2rem;
          color: #999;
          cursor: pointer;
          padding: 0.5rem;
          line-height: 1;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .favorites-modal-close:hover {
          color: #D4AF37;
          transform: rotate(90deg);
        }

        .favorites-modal-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .favorites-modal-header h2 {
          font-family: 'Orbitron', sans-serif;
          color: #D4AF37;
          font-size: 1.8rem;
          margin: 0 0 0.5rem 0;
        }

        .favorites-modal-header p {
          color: #999;
          font-size: 0.95rem;
          margin: 0;
        }

        .favorites-modal-content {
          min-height: 200px;
        }

        .favorites-loading {
          text-align: center;
          padding: 3rem 1rem;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          margin: 0 auto 1rem;
          border: 3px solid rgba(212, 175, 55, 0.2);
          border-top-color: #D4AF37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .favorites-loading p {
          color: #999;
        }

        .favorites-empty {
          text-align: center;
          padding: 3rem 1rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .favorites-empty p {
          color: #999;
          margin: 0.5rem 0;
        }

        .empty-hint {
          font-size: 0.9rem;
          color: #666;
        }

        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .favorite-item {
          background: rgba(26, 26, 26, 0.6);
          border: 2px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .favorite-item:hover {
          border-color: rgba(212, 175, 55, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
        }

        .favorite-image-container {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .favorite-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .favorite-details {
          padding: 1rem;
        }

        .favorite-prompt {
          color: #E8C87C;
          font-size: 0.9rem;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .favorite-date {
          color: #666;
          font-size: 0.8rem;
          margin: 0;
        }

        .favorite-actions {
          display: flex;
          gap: 0.5rem;
          padding: 0 1rem 1rem;
        }

        .favorite-btn {
          flex: 1;
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
        }

        .download-btn {
          background: linear-gradient(135deg, #D4AF37, #E8C87C);
          color: #0a0a0a;
        }

        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
        }

        .remove-btn {
          background: rgba(220, 38, 38, 0.2);
          color: #FCA5A5;
          border: 1px solid rgba(220, 38, 38, 0.3);
        }

        .remove-btn:hover {
          background: rgba(220, 38, 38, 0.3);
          border-color: rgba(220, 38, 38, 0.5);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .favorites-modal {
            padding: 1.5rem;
            max-height: 90vh;
          }

          .favorites-grid {
            grid-template-columns: 1fr;
          }

          .favorites-modal-header h2 {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .favorites-modal {
            padding: 1rem;
          }

          .favorites-modal-close {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};
