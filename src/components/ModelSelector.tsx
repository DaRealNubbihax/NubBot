import { useState } from 'react'
import { ChevronDown, Check, Users, Bot } from 'lucide-react'
import { MODELS } from '../lib/models'
import type { AIModel } from '../types'

type Props = {
  mode: 'single' | 'collab'
  selectedModels: string[]
  onModeChange: (mode: 'single' | 'collab') => void
  onModelsChange: (models: string[]) => void
}

export default function ModelSelector({ mode, selectedModels, onModeChange, onModelsChange }: Props) {
  const [open, setOpen] = useState(false)

  const toggleModel = (id: string) => {
    if (mode === 'single') {
      onModelsChange([id])
      setOpen(false)
    } else {
      const next = selectedModels.includes(id)
        ? selectedModels.filter(m => m !== id)
        : [...selectedModels, id]
      if (next.length > 0) onModelsChange(next)
    }
  }

  const activeModels: AIModel[] = selectedModels
    .map(id => MODELS.find(m => m.id === id))
    .filter(Boolean) as AIModel[]

  return (
    <div className="model-selector">
      <div className="mode-tabs">
        <button
          className={`mode-tab ${mode === 'single' ? 'active' : ''}`}
          onClick={() => { onModeChange('single'); onModelsChange([selectedModels[0] || MODELS[0].id]) }}
        >
          <Bot size={14} /> Single Model
        </button>
        <button
          className={`mode-tab ${mode === 'collab' ? 'active' : ''}`}
          onClick={() => onModeChange('collab')}
        >
          <Users size={14} /> Collab Mode
        </button>
      </div>

      <div className="model-dropdown-wrap">
        <button className="model-dropdown-btn" onClick={() => setOpen(v => !v)}>
          <div className="selected-models-preview">
            {activeModels.map(m => (
              <span key={m.id} className="model-dot" style={{ background: m.color }} title={m.name} />
            ))}
          </div>
          <span className="selected-label">
            {mode === 'single'
              ? activeModels[0]?.name || 'Pick a model'
              : `${activeModels.length} model${activeModels.length !== 1 ? 's' : ''} selected`
            }
          </span>
          <ChevronDown size={14} className={`chevron ${open ? 'open' : ''}`} />
        </button>

        {open && (
          <div className="model-dropdown">
            {MODELS.map(model => {
              const selected = selectedModels.includes(model.id)
              return (
                <button
                  key={model.id}
                  className={`model-option ${selected ? 'selected' : ''}`}
                  onClick={() => toggleModel(model.id)}
                >
                  <span className="model-option-icon" style={{ background: model.color }}>{model.icon}</span>
                  <div className="model-option-info">
                    <span className="model-option-name">{model.name}</span>
                    <span className="model-option-desc">{model.description}</span>
                  </div>
                  {selected && <Check size={14} className="model-check" />}
                </button>
              )
            })}
            {mode === 'collab' && (
              <div className="collab-hint">Select 2+ models to have them collaborate</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
