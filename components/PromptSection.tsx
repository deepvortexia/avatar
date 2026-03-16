interface PromptSectionProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  disabled?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

const ratios = ["1:1", "4:3", "16:9", "9:16"];

export default function PromptSection({
  prompt,
  onPromptChange,
  aspectRatio,
  onAspectRatioChange,
  onGenerate,
  isLoading,
  disabled,
  textareaRef
}: PromptSectionProps) {
  return (
    <div className="prompt-section-wrapper">
      <h3 className="prompt-section-title">
        <span className="title-icon">✨</span>
        Create Your Image
      </h3>
      
      <div className="prompt-input-container">
        <textarea
          ref={textareaRef}
          className="prompt-input-enhanced"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe your image in detail (e.g., futuristic city at sunset with neon lights and flying cars) • Press Ctrl+Enter to generate"
          onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && !isLoading && onGenerate()}
          disabled={isLoading}
          rows={5}
        />
        
        {/* Aspect Ratio Selector */}
        <div className="aspect-ratio-container">
          <label className="aspect-ratio-label">Aspect Ratio</label>
          <div className="aspect-ratio-buttons">
            {ratios.map((ratio) => (
              <button
                key={ratio}
                onClick={() => onAspectRatioChange(ratio)}
                className={`aspect-ratio-btn ${aspectRatio === ratio ? 'active' : ''}`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          className="generate-btn-enhanced"
          onClick={onGenerate}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              <span className="btn-text">Generating...</span>
            </>
          ) : (
            <>
              <span className="btn-icon">🎨</span>
              <span className="btn-text">Generate</span>
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .prompt-section-wrapper {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(232, 200, 124, 0.04));
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 20px;
          padding: 2rem 1.5rem;
          margin: 0 auto 2rem;
          max-width: 900px;
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.12);
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .prompt-section-wrapper:hover {
          border-color: rgba(212, 175, 55, 0.5);
          box-shadow: 0 6px 25px rgba(212, 175, 55, 0.2);
          transform: translateY(-2px);
        }

        .prompt-section-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: #D4AF37;
          text-align: center;
          margin-bottom: 1.2rem;
          letter-spacing: 0.05em;
        }

        .title-icon {
          font-size: 1.5rem;
        }

        .prompt-input-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .prompt-input-enhanced {
          width: 100%;
          padding: 1rem 1.2rem;
          background: rgba(10, 10, 10, 0.6);
          border: 2px solid rgba(212, 175, 55, 0.4);
          border-radius: 12px;
          color: #E8C87C;
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          line-height: 1.5;
          resize: vertical;
          min-height: 140px;
          transition: all 0.3s ease;
          outline: none;
        }

        .prompt-input-enhanced::placeholder {
          color: rgba(232, 200, 124, 0.5);
        }

        .prompt-input-enhanced:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.15);
          background: rgba(10, 10, 10, 0.8);
        }

        .aspect-ratio-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .aspect-ratio-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(212, 175, 55, 0.8);
          text-align: center;
        }

        .aspect-ratio-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .aspect-ratio-btn {
          padding: 0.5rem 1rem;
          background: rgba(26, 26, 26, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 8px;
          color: rgba(232, 200, 124, 0.9);
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(5px);
        }

        .aspect-ratio-btn:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: rgba(212, 175, 55, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
        }

        .aspect-ratio-btn.active {
          background: linear-gradient(135deg, #D4AF37, #E8C87C);
          border-color: #D4AF37;
          color: #0a0a0a;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
        }

        .aspect-ratio-btn.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
        }

        .generate-btn-enhanced {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, #D4AF37, #E8C87C);
          border: none;
          border-radius: 12px;
          color: #0a0a0a;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
          letter-spacing: 0.05em;
        }

        .generate-btn-enhanced:hover:not(:disabled) {
          background: linear-gradient(135deg, #E8C87C, #F4D88A);
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.6);
        }

        .generate-btn-enhanced:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .generate-btn-enhanced:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 1.3rem;
        }

        .btn-text {
          font-size: 1.1rem;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(10, 10, 10, 0.3);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .prompt-section-wrapper {
            max-width: 100%;
            padding: 1rem;
            border-radius: 12px;
            margin: 0 auto 1rem;
          }
          
          .prompt-input-enhanced {
            font-size: 0.95rem;
            min-height: 100px;
          }
        }

        @media (max-width: 767px) {
          .prompt-section-wrapper {
            padding: 1.5rem 1rem;
            margin-bottom: 1.5rem;
          }
          
          .prompt-section-title {
            font-size: 1.1rem;
          }
          
          .title-icon {
            font-size: 1.3rem;
          }
          
          .prompt-input-enhanced {
            padding: 0.9rem 1rem;
            font-size: 1rem;
          }
          
          .generate-btn-enhanced {
            padding: 0.9rem 2rem;
            font-size: 1rem;
          }
          
          .btn-icon {
            font-size: 1.2rem;
          }
          
          .btn-text {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
