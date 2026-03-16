"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import './Header.css';
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { FavoritesModal } from "@/components/FavoritesModal";
import { PricingModal } from "@/components/PricingModal";

function StripeSuccessHandler({ user, refreshProfile }: { user: User | null, refreshProfile: () => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const isSuccess = searchParams?.get('success');
    
    if (isSuccess === 'true' && user) {
      console.log('Payment successful — refreshing credits...');
      refreshProfile();
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [searchParams, user, refreshProfile]);

  return null;
}
// ------------------------------------

interface HeaderProps {
  buyPack?: string | null;
  onBuyPackHandled?: () => void;
}

export default function Header({ buyPack, onBuyPackHandled }: HeaderProps) {
  const { user, profile, signOut, loading, refreshProfile } = useAuth();
  const router = useRouter();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [defaultPack, setDefaultPack] = useState<string | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    try { setIsEmbedded(window.self !== window.top); } catch { setIsEmbedded(true); }
  }, []);

  // Handle auto-open pricing modal when buyPack is provided
  useEffect(() => {
    if (buyPack) {
      setDefaultPack(buyPack);
      if (user) {
        setShowPricingModal(true);
      } else {
        setShowAuthModal(true);
      }
      if (onBuyPackHandled) {
        onBuyPackHandled();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyPack, user])

  // Add safety timeout for loading state
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
        setShowRetry(true);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
      setShowRetry(false);
    }
  }, [loading])

  // FIX: No more confirm() dialog - just sign out directly
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleRetry = () => {
    setShowRetry(false);
    setLoadingTimeout(false);
    if (user) {
      refreshProfile();
    }
  };

  const handleFavoritesClick = () => {
    setShowFavoritesModal(true);
  };

  const handleBuyCreditsClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowPricingModal(true);
    }
  };

  const getAvatarUrl = () => {
    return user?.user_metadata?.avatar_url || profile?.avatar_url || null;
  };

  const getUserDisplayName = () => {
    return profile?.full_name || profile?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    if (displayName.length >= 2) {
      return displayName.substring(0, 2).toUpperCase();
    }
    return displayName.toUpperCase() || 'U';
  };

  return (
    <>
      <Suspense fallback={null}>
        <StripeSuccessHandler user={user} refreshProfile={refreshProfile} />
      </Suspense>

      <header className="hub-header" role="banner">
        {/* Back to Hub Link — hidden when embedded in hub iframe */}
        {!isEmbedded && (
          <Link href="https://deepvortexai.art" className="back-to-hub-link">
            ← Back to Hub
          </Link>
        )}

        {/* Logo Display Zone */}
        <div className="logo-display-zone">
          <Image
            src="/logotinyreal.webp"
            alt="Deep Vortex"
            width={400}
            height={130}
            className="brand-logo-image"
            priority={true}
          />
        </div>

        {/* Brand Title */}
        <h1 className="brand-title-text">AI Avatar Generator</h1>

        {/* Tagline */}
        <p className="primary-tagline">🎭 Transform your photo into any art style</p>

        {/* Pill Buttons Container */}
        <div className="hub-pills-container">
          {/* Credits Pill */}
          {user ? (
            <div className="hub-pill credits-pill">
              <span className="pill-icon">🏆</span>
              <span className="pill-text">{profile?.credits ?? 0} credits</span>
            </div>
          ) : (
            <button className="hub-pill credits-pill" style={{ cursor: 'pointer' }} onClick={() => setShowAuthModal(true)} title="Sign in to get free credits">
              <span className="pill-icon">🏆</span>
              <span className="pill-text">Sign in - Get 2 Free Credits</span>
            </button>
          )}

          {/* Buy Credits Pill */}
          <button 
            className="hub-pill buy-credits-pill"
            onClick={handleBuyCreditsClick}
            title="Purchase more credits"
          >
            <span className="pill-icon">💳</span>
            <span className="pill-text">Buy Credits</span>
          </button>

          {/* How to Use Pill */}
          <Link href="/how-to-use" className="hub-pill how-to-use-pill" style={{ textDecoration: "none" }} title="How to use this tool">
            <span className="pill-icon">📖</span>
            <span className="pill-text">How to Use</span>
          </Link>

          {/* Favorites Pill */}
          <button
            className="hub-pill favorites-pill"
            onClick={handleFavoritesClick}
            title="View your favorite images"
          >
            <span className="pill-icon">⭐</span>
            <span className="pill-text">Favorites</span>
          </button>

          {/* Profile / Sign In Pill */}
          {user ? (
            <div className="hub-pill profile-pill">
              {getAvatarUrl() ? (
                <div className="profile-avatar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getAvatarUrl()!} alt={`${getUserDisplayName()}'s avatar`} />
                </div>
              ) : (
                <div className="profile-avatar-fallback">
                  {getUserInitials()}
                </div>
              )}
              <span className="profile-name">{getUserDisplayName()}</span>
              <button 
                className="signout-btn"
                onClick={handleSignOut}
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              className="hub-pill signin-pill"
              onClick={() => setShowAuthModal(true)}
              disabled={loading && !loadingTimeout}
              title="Sign in to get credits"
            >
              <span className="pill-icon">🔐</span>
              <span className="pill-text">
                {(loading && !loadingTimeout) ? 'Loading...' : 'Sign In'}
              </span>
            </button>
          )}

          {/* Retry Button */}
          {showRetry && (
            <button 
              className="hub-pill retry-pill"
              onClick={handleRetry}
              title="Retry loading"
            >
              <span className="pill-icon">🔄</span>
              <span className="pill-text">Retry</span>
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <FavoritesModal isOpen={showFavoritesModal} onClose={() => setShowFavoritesModal(false)} />
      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => {
          setShowPricingModal(false);
          setDefaultPack(null);
        }}
        defaultPack={defaultPack}
      />

    </>
  );
}
