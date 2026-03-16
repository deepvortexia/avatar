'use client';

import { useState } from 'react';

interface PricingPack {
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

const PRICING_PACKS: PricingPack[] = [
  { name: 'Starter', credits: 10, price: 4.99 },
  { name: 'Basic', credits: 30, price: 9.99 },
  { name: 'Popular', credits: 75, price: 19.99, popular: true },
  { name: 'Pro', credits: 200, price: 49.99 },
  { name: 'Ultimate', credits: 500, price: 99.99 },
];

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPack?: string | null;
}

export function PricingModal({ isOpen, onClose, defaultPack }: PricingModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async (pack: PricingPack) => {
    try {
      setLoading(pack.name);

      // Get the session token directly
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession?.access_token) {
        alert('Please sign in before purchasing credits.');
        setLoading(null);
        return;
      }

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`,
        },
        body: JSON.stringify({ packName: pack.name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Purchase error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout');
      setLoading(null);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <img 
              src="/deepgoldremoveetiny.png" 
              alt="Deep Vortex Logo" 
              className="modal-logo"
            />
            <h2 className="modal-title">Choose Your Credit Pack</h2>
            <p className="modal-subtitle">Power up your AI image generation</p>
            <button className="modal-close" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="pricing-grid">
            {PRICING_PACKS.map((pack) => (
              <div 
                key={pack.name} 
                className={`pricing-card ${pack.popular ? 'pricing-card-popular' : ''} ${defaultPack === pack.name ? 'pricing-card-selected' : ''}`}
              >
                {pack.popular && !defaultPack && <div className="popular-badge">⭐ Popular</div>}
                {defaultPack === pack.name && (
                  <div className="selected-badge">
                    {pack.popular ? '⭐✓ Popular & Selected' : '✓ Selected'}
                  </div>
                )}
                
                <div className="pack-name">{pack.name}</div>
                <div className="pack-credits">{pack.credits} Credits</div>
                <div className="pack-price">${pack.price.toFixed(2)}</div>
                <div className="pack-per-credit">
                  ${(pack.price / pack.credits).toFixed(2)} per credit
                </div>
                
                <button
                  className="purchase-btn"
                  onClick={() => handlePurchase(pack)}
                  disabled={loading !== null}
                >
                  {loading === pack.name ? (
                    <>
                      <span className="spinner">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      Purchase
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <span className="secure-badge">🔒 Secure payment powered by Stripe</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: var(--bg-secondary);
          border: 2px solid var(--gold-primary);
          border-radius: 24px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: slideUp 0.3s ease-out;
          box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3);
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          padding: 2rem 2rem 1.5rem;
          text-align: center;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          position: relative;
        }

        .modal-logo {
          height: 60px;
          width: auto;
          margin: 0 auto 1rem;
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
        }

        .modal-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: var(--gold-primary);
          margin: 0 0 0.5rem;
          text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
        }

        .modal-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--gold-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: rgba(212, 175, 55, 0.2);
          border-color: var(--gold-primary);
          transform: scale(1.1);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
          padding: 2rem;
        }

        .pricing-card {
          background: var(--bg-tertiary);
          border: 2px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 1.5rem 1rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .pricing-card:hover {
          border-color: var(--gold-primary);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.3);
        }

        .pricing-card-popular {
          border-color: var(--gold-primary);
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), var(--bg-tertiary));
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, var(--gold-primary), var(--gold-light));
          color: #0a0a0a;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          white-space: nowrap;
        }

        .selected-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #10b981, #34d399);
          color: #ffffff;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          white-space: nowrap;
        }

        .pricing-card-selected {
          border-color: #10b981;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), var(--bg-tertiary));
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
        }

        .pack-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--gold-primary);
          margin-top: 0.5rem;
        }

        .pack-credits {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .pack-price {
          font-family: 'Orbitron', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: var(--gold-light);
        }

        .pack-per-credit {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .purchase-btn {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, var(--gold-primary), var(--gold-light));
          border: none;
          border-radius: 10px;
          color: #0a0a0a;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
        }

        .purchase-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.5);
          background: linear-gradient(135deg, var(--gold-light), #F4D88A);
        }

        .purchase-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          text-align: center;
        }

        .secure-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .modal-content { border-radius: 16px; max-height: 95vh; }
          .modal-header { padding: 1.5rem 1rem 1rem; }
          .modal-logo { height: 50px; }
          .modal-title { font-size: 1.5rem; }
          .modal-subtitle { font-size: 0.9rem; }
          .modal-close { top: 1rem; right: 1rem; width: 36px; height: 36px; font-size: 1.25rem; }
          .pricing-grid { grid-template-columns: 1fr; gap: 1rem; padding: 1.5rem 1rem; }
          .pricing-card { padding: 1.25rem 1rem; }
          .pack-name { font-size: 1.1rem; }
          .pack-credits { font-size: 1.25rem; }
          .pack-price { font-size: 1.75rem; }
          .modal-footer { padding: 1rem; }
          .secure-badge { font-size: 0.85rem; }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .pricing-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
