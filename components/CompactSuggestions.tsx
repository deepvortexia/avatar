interface CompactSuggestionsProps {
  onStyleSelect?: (style: string) => void;
  onIdeaSelect: (prompt: string) => void;
}

const quickIdeas = [
  { emoji: '🌌', text: 'Cosmic nebula explosion vibrant colors deep space photorealistic' },
  { emoji: '🐉', text: 'Ancient dragon soaring above mystical glowing mountain castle' },
  { emoji: '👸', text: 'Ethereal goddess with silver hair enchanted forest golden light' },
  { emoji: '🤖', text: 'Futuristic cyberpunk robot neon city rain night cinematic' },
  { emoji: '🌊', text: 'Massive ocean wave crashing dramatic stormy sky epic' },
  { emoji: '🦁', text: 'Majestic lion portrait golden savanna sunset dramatic lighting' },
  { emoji: '🏔️', text: 'Snow capped mountain reflection crystal lake misty morning' },
  { emoji: '🔮', text: 'Mystical wizard casting spell ancient ruins swirling energy' },
];

export default function CompactSuggestions({ onIdeaSelect }: CompactSuggestionsProps) {
  return (
    <div className="suggestions-compact-section">
      <div className="suggestion-row">
        <h4 className="suggestion-row-title">💡 Quick Ideas</h4>
        <div className="suggestion-tags-compact">
          {quickIdeas.map((item) => (
            <button
              key={item.text}
              className="suggestion-tag-compact"
              onClick={() => onIdeaSelect(item.text)}
              aria-label={`Quick idea: ${item.text}`}
            >
              <span className="tag-emoji" aria-hidden="true">{item.emoji}</span>
              <span className="tag-text">{item.text}</span>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .suggestions-compact-section {
          padding: 1rem 1rem 0.8rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .suggestion-row {
          margin-bottom: 0;
        }

        .suggestion-row-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(212, 175, 55, 0.6);
          text-align: center;
          margin-bottom: 0.8rem;
          letter-spacing: 0.02em;
        }

        .suggestion-tags-compact {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.6rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .suggestion-tag-compact {
          display: flex;
          align-items: flex-start;
          gap: 0.4rem;
          padding: 0.65rem 0.8rem;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(5px);
          text-align: left;
          line-height: 1.35;
        }

        .suggestion-tag-compact:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.6);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
        }

        .suggestion-tag-compact:active {
          transform: translateY(0);
        }

        .suggestion-tag-compact .tag-emoji {
          font-size: 1rem;
          line-height: 1.35;
          flex-shrink: 0;
        }

        .suggestion-tag-compact .tag-text {
          line-height: 1.35;
        }

        @media (max-width: 767px) {
          .suggestion-tags-compact {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }

          .suggestion-tag-compact {
            padding: 0.6rem 0.7rem;
            font-size: 0.78rem;
          }

          .suggestions-compact-section {
            padding: 1rem 0.5rem 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .suggestions-compact-section {
            padding: 0.8rem 0.5rem 0.6rem;
          }

          .suggestion-tags-compact {
            gap: 0.45rem;
          }

          .suggestion-tag-compact {
            padding: 0.55rem 0.6rem;
            font-size: 0.75rem;
          }

          .suggestion-tag-compact .tag-emoji {
            font-size: 0.95rem;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .suggestions-compact-section {
            padding: 0.9rem 1rem 0.7rem;
          }

          .suggestion-tags-compact {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
