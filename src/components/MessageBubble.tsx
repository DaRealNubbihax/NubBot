import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock'
import type { Message } from '../types'
import { getModel } from '../lib/models'

type Props = {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const model = message.model_id ? getModel(message.model_id) : null

  return (
    <div className={`message ${message.role}`}>
      {message.role === 'assistant' && model && (
        <div className="model-badge" style={{ '--model-color': model.color } as React.CSSProperties}>
          <span className="model-icon">{model.icon}</span>
          <span className="model-label">{model.name}</span>
        </div>
      )}
      {message.role === 'user' && (
        <div className="user-badge">You</div>
      )}
      <div className="message-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children }) {
              const match = /language-(\w+)/.exec(className || '')
              const code = String(children).replace(/\n$/, '')
              if (match) {
                return <CodeBlock code={code} language={match[1]} />
              }
              return <code className="inline-code">{children}</code>
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
