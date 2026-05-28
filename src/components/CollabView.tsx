import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock'
import type { ModelResponse } from '../types'
import { CircleAlert as AlertCircle } from 'lucide-react'

type Props = {
  responses: ModelResponse[]
  userMessage: string
}

export default function CollabView({ responses, userMessage }: Props) {
  return (
    <div className="collab-view">
      <div className="user-message-collab">
        <div className="user-badge">You</div>
        <div className="message-content">{userMessage}</div>
      </div>
      <div className="collab-label">
        <span className="collab-tag">COLLAB RESPONSE</span>
        <span className="collab-desc">{responses.length} models worked on this</span>
      </div>
      <div className="collab-grid" style={{ '--cols': Math.min(responses.length, 2) } as React.CSSProperties}>
        {responses.map(({ model, content, error }) => (
          <div key={model.id} className="collab-card">
            <div className="collab-card-header" style={{ '--model-color': model.color } as React.CSSProperties}>
              <span className="model-icon">{model.icon}</span>
              <span className="model-name">{model.name}</span>
              <span className="provider-tag">{model.provider}</span>
            </div>
            <div className="collab-card-body">
              {error ? (
                <div className="collab-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children }) {
                      const match = /language-(\w+)/.exec(className || '')
                      const code = String(children).replace(/\n$/, '')
                      if (match) return <CodeBlock code={code} language={match[1]} />
                      return <code className="inline-code">{children}</code>
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
