import { useState } from 'react'
import { X, Key, ExternalLink, Eye, EyeOff, CircleCheck as CheckCircle } from 'lucide-react'

type KeyConfig = {
  id: string
  label: string
  provider: string
  envVar: string
  docsUrl: string
  placeholder: string
  note: string
}

const KEY_CONFIGS: KeyConfig[] = [
  {
    id: 'anthropic',
    label: 'Anthropic API Key',
    provider: 'Claude (Sonnet / Opus)',
    envVar: 'ANTHROPIC_API_KEY',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-...',
    note: 'Get your key from console.anthropic.com',
  },
  {
    id: 'openai',
    label: 'OpenAI API Key',
    provider: 'GPT-4o / GPT-4 Turbo',
    envVar: 'OPENAI_API_KEY',
    docsUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...',
    note: 'Get your key from platform.openai.com',
  },
  {
    id: 'google',
    label: 'Google AI API Key',
    provider: 'Gemini 1.5 Pro',
    envVar: 'GOOGLE_AI_API_KEY',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    placeholder: 'AIza...',
    note: 'Get your key from Google AI Studio',
  },
  {
    id: 'mistral',
    label: 'Mistral API Key',
    provider: 'Mistral Large',
    envVar: 'MISTRAL_API_KEY',
    docsUrl: 'https://console.mistral.ai/api-keys',
    placeholder: 'your-mistral-key',
    note: 'Get your key from console.mistral.ai',
  },
]

type Props = {
  configuredKeys: Record<string, boolean>
  onClose: () => void
}

export default function ApiKeysModal({ configuredKeys, onClose }: Props) {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Key size={18} />
            <h2>API Key Setup</h2>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <p className="modal-intro">
            Each AI provider requires its own API key. Keys are stored securely as Supabase Edge Function secrets and
            never exposed to the browser.
          </p>

          <div className="keys-setup-grid">
            {KEY_CONFIGS.map(cfg => {
              const configured = configuredKeys[cfg.id]
              return (
                <div key={cfg.id} className={`key-card ${configured ? 'configured' : ''}`}>
                  <div className="key-card-header">
                    <div>
                      <div className="key-card-label">{cfg.label}</div>
                      <div className="key-card-provider">{cfg.provider}</div>
                    </div>
                    {configured && (
                      <span className="key-status-badge">
                        <CheckCircle size={14} /> Configured
                      </span>
                    )}
                  </div>

                  <div className="key-info-row">
                    <code className="env-var">{cfg.envVar}</code>
                    <a href={cfg.docsUrl} target="_blank" rel="noreferrer" className="key-docs-link">
                      Get key <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className="key-input-wrap">
                    <input
                      type={showKeys[cfg.id] ? 'text' : 'password'}
                      className="field-input"
                      placeholder={cfg.placeholder}
                      readOnly
                      value={configured ? '••••••••••••••••' : ''}
                    />
                    <button
                      className="key-toggle"
                      onClick={() => setShowKeys(p => ({ ...p, [cfg.id]: !p[cfg.id] }))}
                    >
                      {showKeys[cfg.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  <p className="key-note">{cfg.note}</p>
                </div>
              )
            })}
          </div>

          <div className="keys-instructions">
            <h3>How to add your API keys</h3>
            <ol>
              <li>Go to <strong>Supabase Dashboard</strong> → your project → <strong>Edge Functions</strong></li>
              <li>Click <strong>Secrets</strong> in the sidebar</li>
              <li>Add each key with the exact variable name shown above</li>
              <li>The edge function will automatically use the keys on the next request</li>
            </ol>
            <p className="keys-security-note">
              Keys are never stored in your frontend code or exposed to users. They only exist inside Supabase's secure secret store.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-confirm" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}
