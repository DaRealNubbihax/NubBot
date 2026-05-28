import { useState } from 'react'
import { X, Bot, Users } from 'lucide-react'
import { LANGUAGES, MODELS } from '../lib/models'

type Props = {
  onConfirm: (title: string, language: string, mode: 'single' | 'collab', models: string[]) => void
  onClose: () => void
}

export default function NewChatModal({ onConfirm, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('lua')
  const [mode, setMode] = useState<'single' | 'collab'>('single')
  const [selectedModels, setSelectedModels] = useState<string[]>(['claude-sonnet-4-5'])

  const toggleModel = (id: string) => {
    if (mode === 'single') {
      setSelectedModels([id])
    } else {
      setSelectedModels(prev =>
        prev.includes(id) ? (prev.length > 1 ? prev.filter(m => m !== id) : prev) : [...prev, id]
      )
    }
  }

  const handleConfirm = () => {
    const t = title.trim() || `${language.toUpperCase()} Chat`
    onConfirm(t, language, mode, selectedModels)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Chat</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <label className="field-label">Chat Title (optional)</label>
          <input
            className="field-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Roblox ESP Script"
          />

          <label className="field-label">Language</label>
          <div className="lang-grid">
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                className={`lang-btn ${language === lang.id ? 'active' : ''}`}
                onClick={() => setLanguage(lang.id)}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <label className="field-label">Mode</label>
          <div className="mode-cards">
            <button
              className={`mode-card ${mode === 'single' ? 'active' : ''}`}
              onClick={() => { setMode('single'); setSelectedModels([selectedModels[0]]) }}
            >
              <Bot size={20} />
              <span className="mode-card-name">Single Model</span>
              <span className="mode-card-desc">One AI answers your question</span>
            </button>
            <button
              className={`mode-card ${mode === 'collab' ? 'active' : ''}`}
              onClick={() => setMode('collab')}
            >
              <Users size={20} />
              <span className="mode-card-name">Collab Mode</span>
              <span className="mode-card-desc">Multiple AIs work together</span>
            </button>
          </div>

          <label className="field-label">
            {mode === 'single' ? 'Select Model' : 'Select Models (pick 2+)'}
          </label>
          <div className="model-list">
            {MODELS.map(model => {
              const selected = selectedModels.includes(model.id)
              return (
                <button
                  key={model.id}
                  className={`model-list-item ${selected ? 'selected' : ''}`}
                  onClick={() => toggleModel(model.id)}
                  style={{ '--model-color': model.color } as React.CSSProperties}
                >
                  <span className="model-list-icon">{model.icon}</span>
                  <div className="model-list-info">
                    <span className="model-list-name">{model.name}</span>
                    <span className="model-list-desc">{model.description}</span>
                  </div>
                  {selected && <span className="model-list-check">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-confirm" onClick={handleConfirm}>Start Chat</button>
        </div>
      </div>
    </div>
  )
}
