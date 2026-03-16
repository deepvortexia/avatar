'use client';

import { useState, useEffect } from 'react';
import { useFreeGenerations } from '@/hooks/useFreeGenerations';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { PricingModal } from '@/components/PricingModal';

export default function CreditsDisplay() {
  const { isLoggedIn, isClient } = useFreeGenerations();
  const { credits, refreshProfile, loading } = useCredits();
  const { loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Force client-side render to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add safety timeout for loading state
  useEffect(() => {
    if (authLoading) {
      const timer = setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('⏰ CreditsDisplay: Loading timeout reached after 5 seconds');
        }
        setLoadingTimeout(true);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [authLoading]);

  // Refresh profile when user logs in
  useEffect(() => {
    if (isLoggedIn && mounted) {
      refreshProfile();
    }
  }, [isLoggedIn, mounted, refreshProfile]);

  // Debug logging for CreditsDisplay
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 CreditsDisplay: State changed', { 
        isLoggedIn, 
        credits, 
        isClient,
        mounted,
        loading,
        authLoading
      })
    }
  }, [isLoggedIn, credits, isClient, mounted, loading, authLoading])

  // Show loading state while not mounted or auth is loading (with timeout)
  if (!mounted || (authLoading && !loadingTimeout)) {
    return (
      <div className="credits-display-section">
        <div className="credits-display-content">
          <div className="credits-info">
            <span className="credits-icon">⏳</span>
            <span className="credits-amount">Chargement...</span>
          </div>
        </div>
        
        <style jsx>{`
          .credits-display-section {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.5rem 1rem;
            margin: 0 auto;
            max-width: 900px;
          }

          .credits-display-content {
            display: flex;
            align-items: center;
            gap: 2rem;
            padding: 1rem 2rem;
            background: rgba(26, 26, 26, 0.8);
            border: 2px solid rgba(212, 175, 55, 0.3);
            border-radius: 16px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }

          .credits-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .credits-icon {
            font-size: 1.5rem;
          }

          .credits-amount {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.1rem;
            font-weight: 600;
            color: #D4AF37;
            letter-spacing: 0.05em;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="credits-display-section">
        <div className="credits-display-content">
          <div className="credits-info">
            {isLoggedIn ? (
              <>
                <span className="credits-icon">💰</span>
                <span className="credits-amount">{credits} credits</span>
              </>
            ) : (
              <>
                <span className="credits-icon">🔐</span>
                <span className="credits-amount">
                  Sign in to start generating
                </span>
              </>
            )}
          </div>
          
          <div className="credits-actions">
            <button 
              className="buy-credits-btn"
              onClick={() => {
                if (isLoggedIn) {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('💳 Opening pricing modal...');
                  }
                  setShowPricingModal(true);
                } else {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('🔐 Opening auth modal...')
                  }
                  setShowAuthModal(true);
                }
              }}
              aria-label={isLoggedIn ? "Buy more credits" : "Sign in"}
              title={isLoggedIn ? "Purchase credit packs" : "Sign in to get unlimited generations"}
            >
              <span aria-hidden="true">{isLoggedIn ? '💳' : '🔐'}</span>
              <span>{isLoggedIn ? 'Buy Credits' : 'Sign In'}</span>
            </button>
          </div>
        </div>
        
        <style jsx>{`
          .credits-display-section {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.5rem 1rem;
            margin: 0 auto;
            max-width: 900px;
          }

          .credits-display-content {
            display: flex;
            align-items: center;
            gap: 2rem;
            padding: 1rem 2rem;
            background: rgba(26, 26, 26, 0.8);
            border: 2px solid rgba(212, 175, 55, 0.3);
            border-radius: 16px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }

          .credits-display-content:hover {
            border-color: rgba(212, 175, 55, 0.5);
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
          }

          .credits-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .credits-icon {
            font-size: 1.5rem;
          }

          .credits-amount {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.1rem;
            font-weight: 600;
            color: #D4AF37;
            letter-spacing: 0.05em;
          }

          .credits-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .buy-credits-btn {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.6rem 1.2rem;
            background: linear-gradient(135deg, #D4AF37, #E8C87C);
            border: none;
            border-radius: 10px;
            color: #0a0a0a;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
          }

          .buy-credits-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.5);
            background: linear-gradient(135deg, #E8C87C, #F4D88A);
          }

          .buy-credits-btn:active {
            transform: translateY(0);
          }

          @media (max-width: 480px) {
            .credits-display-section {
              padding: 1rem 0.5rem;
            }
            
            .credits-display-content {
              flex-direction: column;
              gap: 1rem;
              padding: 1rem 1.5rem;
              width: 100%;
              max-width: 320px;
            }
            
            .credits-info {
              gap: 0.4rem;
            }
            
            .credits-icon {
              font-size: 1.3rem;
            }
            
            .credits-amount {
              font-size: 1rem;
            }
            
            .credits-actions {
              flex-direction: column;
              gap: 0.8rem;
              width: 100%;
            }
            
            .buy-credits-btn {
              width: 100%;
              justify-content: center;
              padding: 0.7rem 1rem;
            }
          }

          @media (min-width: 768px) and (max-width: 1024px) {
            .credits-display-content {
              gap: 1.5rem;
              padding: 0.9rem 1.5rem;
            }
          }
        `}</style>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
    </>
  );
}
