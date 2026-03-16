'use client';

import { useState } from 'react';
import { saveFavorite } from '@/lib/favorites';
import { useAuth } from '@/context/AuthContext';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onRegenerate?: () => void;
  prompt?: string | null;
}

export default function ImageDisplay({ imageUrl, isLoading, error, onRegenerate, prompt = null }: ImageDisplayProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { session } = useAuth();

  const downloadImage=async()=>{if(!imageUrl)return;try{const r=await fetch(imageUrl);const b=await r.blob();const f=new File([b],`deepvortex-${Date.now()}.jpg`,{type:'image/jpeg'});if(navigator.canShare?.({files:[f]})){await navigator.share({files:[f]});return;}const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`deepvortex-${Date.now()}.jpg`;a.click();URL.revokeObjectURL(u);}catch{window.open(imageUrl,'_blank');}}

  const handleAddToFavorites = async () => {
    if (!imageUrl) {
      alert('No image to save');
      return;
    }

    if (!session?.access_token) {
      alert('Please sign in to add favorites');
      return;
    }

    try {
      const id = await saveFavorite(session.access_token, imageUrl, prompt || '');
      if (id) {
        setIsFavorited(true);
      } else {
        alert('Failed to add to favorites');
      }
    } catch (err) {
      console.error('Error adding to favorites:', err);
      alert('Failed to add to favorites');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-section">
        <div className="loading-spinner-large"></div>
        <p className="loading-message">Creating magic... ✨</p>
        <p className="loading-hint">This usually takes 2-5 seconds</p>
        
        <style jsx>{`
          .loading-section {
            text-align: center;
            padding: 60px 20px;
            animation: fadeIn 0.5s ease;
          }
          .loading-spinner-large {
            width: 100px;
            height: 100px;
            margin: 0 auto 30px;
            position: relative;
          }
          .loading-spinner-large::before {
            content: '';
            width: 100px;
            height: 100px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: #D4AF37;
            border-radius: 50%;
            position: absolute;
            top: 0; left: 0;
            animation: spin 1.5s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .loading-message { font-size: 20px; color: white; font-weight: 600; }
          .loading-hint { font-size: 14px; color: #888; }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <style jsx>{`
          .error-message {
            max-width: 600px;
            margin: 20px auto;
            padding: 16px 20px;
            background: rgba(220, 38, 38, 0.1);
            border: 2px solid rgba(220, 38, 38, 0.3);
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .error-message p { color: #FCA5A5; margin: 0; }
        `}</style>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="result-section">
        <h2 className="result-title">
          Your Image ✨
          <span className="generation-time">Generated</span>
        </h2>
        
        <div className="image-container">
          <img
            src={imageUrl}
            alt="Generated AI image"
            className="generated-image"
          />
        </div>
        
        <div className="action-buttons">
          <button onClick={downloadImage} className="action-btn download-btn">
            <span>📥</span> Download
          </button>
          <button
            onClick={handleAddToFavorites}
            className={`action-btn favorite-btn ${isFavorited ? 'favorited' : ''}`}
            disabled={isFavorited}
          >
            <span>{isFavorited ? '✅' : '⭐'}</span> {isFavorited ? 'Added!' : 'Favorite'}
          </button>
          {onRegenerate && (
            <button onClick={onRegenerate} className="action-btn regenerate-btn">
              <span>🔄</span> Regenerate
            </button>
          )}
        </div>

        <style jsx>{`
          .result-section { max-width: 600px; margin: 40px auto; text-align: center; }
          .result-title { display: flex; justify-content: space-between; color: white; margin-bottom: 20px; }
          .image-container { 
            background: #111; padding: 20px; border-radius: 16px; 
            border: 2px solid #D4AF37; box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
          }
          .generated-image { max-width: 100%; border-radius: 12px; }
          .action-buttons { display: flex; gap: 10px; margin-top: 20px; }
          .action-btn { flex: 1; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; border: none; }
          .download-btn { background: #D4AF37; color: black; }
          .favorite-btn { background: #222; color: #D4AF37; border: 1px solid #D4AF37; }
          .favorite-btn.favorited { background: #22c55e; color: white; border-color: #22c55e; }
        `}</style>
      </div>
    );
  }

  return null;
}
