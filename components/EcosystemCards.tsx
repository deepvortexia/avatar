'use client'
import './EcosystemCards.css'

const tools = [
  { name: 'Image Editor', icon: '✏️', desc: 'Edit any image with AI',       href: 'https://image-editor.deepvortexai.com', isCurrent: false },
  { name: 'Emoticons',    icon: '😃', desc: 'Custom emoji creation',        href: 'https://emoticons.deepvortexai.com', isCurrent: false },
  { name: 'Image Gen',    icon: '🎨', desc: 'AI artwork',                   href: 'https://images.deepvortexai.com',    isCurrent: false },
  { name: 'Logo Gen',     icon: '🛡️', desc: 'AI logo creation',             href: 'https://logo.deepvortexai.com',      isCurrent: false },
  { name: 'Avatar Gen',   icon: '🎭', desc: 'AI portrait styles',           href: 'https://avatar.deepvortexai.com',    isCurrent: true  },
  { name: 'Remove BG',    icon: '✂️', desc: 'Remove backgrounds instantly', href: 'https://bgremover.deepvortexai.com', isCurrent: false },
  { name: 'Upscaler',     icon: '🔍', desc: 'Upscale images up to 4x',      href: 'https://upscaler.deepvortexai.com',  isCurrent: false },
  { name: '3D Generator', icon: '🧊', desc: 'Image to 3D model',            href: 'https://3d.deepvortexai.com',        isCurrent: false },
  { name: 'Voice Gen',    icon: '🎙️', desc: 'AI Voice Generator',           href: 'https://voice.deepvortexai.com',     isCurrent: false },
  { name: 'Image → Video',icon: '🎬', desc: 'Animate images with AI',       href: 'https://video.deepvortexai.com',     isCurrent: false },
]

export default function EcosystemCards() {
  return (
    <section className="ecosystem-section">
      <h2 className="ecosystem-heading">Complete AI Ecosystem</h2>
      <div className="ecosystem-grid">
        {tools.map((tool, idx) => (
          <div
            key={idx}
            className={`ecosystem-card eco-card-active${tool.isCurrent ? ' eco-glow' : ''}`}
            onClick={() => { if (!tool.isCurrent) window.location.href = tool.href }}
            role={tool.isCurrent ? 'presentation' : 'button'}
            style={{ cursor: tool.isCurrent ? 'default' : 'pointer' }}
          >
            <div className="eco-icon">{tool.icon}</div>
            <h3 className="eco-title">{tool.name}</h3>
            <p className="eco-desc">{tool.desc}</p>
            <div className="eco-status-container">
              <span className="eco-status-badge eco-badge-active">Available Now</span>
              {tool.isCurrent && <div className="eco-current-label">CURRENT TOOL</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
