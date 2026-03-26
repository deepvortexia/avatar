'use client'
import './EcosystemCards.css'

export default function EcosystemCards() {
  return (
    <section className="ecosystem-section">
      <h2 className="ecosystem-heading">Complete AI Ecosystem</h2>
      <div className="ecosystem-grid">
        {[
          { name: 'Image Editor', icon: '✏️', desc: 'Edit any image with AI',        status: 'Available Now',  isActive: true,  href: 'https://image-editor.deepvortexai.com', isCurrent: false },
          { name: 'Emoticons',    icon: '😃', desc: 'Custom emoji creation',         status: 'Available Now',  isActive: true,  href: 'https://emoticons.deepvortexai.com',    isCurrent: false },
          { name: 'Image Gen',    icon: '🎨', desc: 'AI artwork',                   status: 'Available Now',  isActive: true,  href: 'https://images.deepvortexai.com',       isCurrent: false },
          { name: 'Logo Gen',     icon: '🛡️', desc: 'AI logo creation',            status: 'Available Now',  isActive: true,  href: 'https://logo.deepvortexai.com',         isCurrent: false },
          { name: 'Avatar Gen',   icon: '🎭', desc: 'AI portrait styles',           status: 'Available Now',  isActive: true,  href: 'https://avatar.deepvortexai.com',       isCurrent: true  },
          { name: 'Remove BG',    icon: '✂️', desc: 'Remove backgrounds instantly', status: 'Available Now',  isActive: true,  href: 'https://bgremover.deepvortexai.com',    isCurrent: false },
          { name: 'Upscaler',     icon: '🔍', desc: 'Upscale images up to 4x',      status: 'Available Now',  isActive: true,  href: 'https://upscaler.deepvortexai.com',     isCurrent: false },
          { name: '3D Generator', icon: '🧊', desc: 'Image to 3D model',            status: 'Available Now',  isActive: true,  href: 'https://3d.deepvortexai.com',           isCurrent: false },
          { name: 'Voice Gen',    icon: '🎙️', desc: 'AI Voice Generator',          status: 'Available Now',  isActive: true,  href: 'https://voice.deepvortexai.com',        isCurrent: false },
          { name: 'Image → Video',icon: '🎬', desc: 'Animate images with AI',       status: 'Available Now',  isActive: true,  href: 'https://video.deepvortexai.com',        isCurrent: false },
        ].map((tool, idx) => (
          <div
            key={idx}
            className={`ecosystem-card ${tool.isActive ? 'eco-card-active' : 'eco-card-inactive'}${tool.isCurrent ? ' eco-glow' : ''}`}
            onClick={() => { if (tool.isActive && tool.href) window.location.href = tool.href; }}
            role={tool.isActive ? 'button' : 'presentation'}
            style={{ cursor: tool.isActive ? 'pointer' : 'default' }}
          >
            <div className="eco-icon">{tool.icon}</div>
            <h3 className="eco-title">{tool.name}</h3>
            <p className="eco-desc">{tool.desc}</p>
            <div className="eco-status-container">
              <span className={`eco-status-badge ${tool.isActive ? 'eco-badge-active' : 'eco-badge-upcoming'}`}>
                {tool.status}
              </span>
              {tool.isCurrent && <div className="eco-current-label">CURRENT TOOL</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
