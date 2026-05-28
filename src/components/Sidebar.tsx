import { Plus, MessageSquare, Trash2, Code as Code2 } from 'lucide-react'
import type { Conversation } from '../types'

type Props = {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Sidebar({ conversations, activeId, onSelect, onCreate, onDelete }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Code2 size={20} />
          <span>PolyCode AI</span>
        </div>
        <button className="new-chat-btn" onClick={onCreate}>
          <Plus size={16} />
          New Chat
        </button>
      </div>

      <div className="sidebar-section-label">Conversations</div>

      <nav className="sidebar-nav">
        {conversations.length === 0 && (
          <div className="sidebar-empty">No conversations yet. Start a new chat!</div>
        )}
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`sidebar-item ${conv.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            <MessageSquare size={14} className="sidebar-item-icon" />
            <div className="sidebar-item-content">
              <span className="sidebar-item-title">{conv.title}</span>
              <div className="sidebar-item-meta">
                <span className="sidebar-item-lang">{conv.language}</span>
                {conv.mode === 'collab' && <span className="collab-pill">COLLAB</span>}
                <span className="sidebar-item-time">{timeAgo(conv.updated_at)}</span>
              </div>
            </div>
            <button
              className="sidebar-delete"
              onClick={e => { e.stopPropagation(); onDelete(conv.id) }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </nav>
    </aside>
  )
}
