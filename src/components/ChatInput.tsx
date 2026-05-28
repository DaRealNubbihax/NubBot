import { useRef, useEffect } from 'react'
import { Send, Loader as Loader2 } from 'lucide-react'

type Props = {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  loading: boolean
  placeholder?: string
}

export default function ChatInput({ value, onChange, onSubmit, loading, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = Math.min(ref.current.scrollHeight, 200) + 'px'
    }
  }, [value])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!loading && value.trim()) onSubmit()
    }
  }

  return (
    <div className="chat-input-wrap">
      <textarea
        ref={ref}
        className="chat-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder || 'Ask anything about Lua, C++, Java...'}
        disabled={loading}
        rows={1}
      />
      <button
        className={`send-btn ${loading ? 'loading' : ''}`}
        onClick={onSubmit}
        disabled={loading || !value.trim()}
      >
        {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
      </button>
    </div>
  )
}
