import { useEffect, useState } from 'react'
import { Key } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ChatPage from './pages/ChatPage'
import NewChatModal from './components/NewChatModal'
import ApiKeysModal from './components/ApiKeysModal'
import type { Conversation } from './types'
import { loadConversations, createConversation, deleteConversation } from './lib/api'

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState(false)

  useEffect(() => {
    loadConversations().then(setConversations).catch(console.error)
  }, [])

  const activeConversation = conversations.find(c => c.id === activeId) ?? null

  const handleCreate = async (title: string, language: string, mode: 'single' | 'collab', models: string[]) => {
    const conv = await createConversation(title, language, mode, models)
    setConversations(prev => [conv, ...prev])
    setActiveId(conv.id)
    setShowNewChat(false)
  }

  const handleDelete = async (id: string) => {
    await deleteConversation(id)
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeId === id) setActiveId(null)
  }

  const handleUpdate = (updated: Conversation) => {
    setConversations(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={() => setShowNewChat(true)}
        onDelete={handleDelete}
      />

      <main className="main-area">
        {activeConversation ? (
          <ChatPage
            key={activeConversation.id}
            conversation={activeConversation}
            onUpdate={handleUpdate}
          />
        ) : (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-logo">
                <span className="logo-text">PolyCode AI</span>
              </div>
              <h1>Your Expert Coding Assistant</h1>
              <p>Powered by Claude, GPT-4, Gemini, Mistral and more. Ask anything about Lua, C++, Java, and dozens of other languages.</p>
              <div className="welcome-features">
                <div className="feature-card">
                  <span className="feature-icon">🤖</span>
                  <strong>Multiple AI Models</strong>
                  <span>Claude, GPT-4o, Gemini, Mistral</span>
                </div>
                <div className="feature-card">
                  <span className="feature-icon">🤝</span>
                  <strong>Collab Mode</strong>
                  <span>Multiple AIs work together on your code</span>
                </div>
                <div className="feature-card">
                  <span className="feature-icon">⚡</span>
                  <strong>Expert Level</strong>
                  <span>Roblox scripts, game mods, systems code</span>
                </div>
              </div>
              <button className="welcome-start-btn" onClick={() => setShowNewChat(true)}>
                Start a Chat
              </button>
              <button className="welcome-keys-btn" onClick={() => setShowApiKeys(true)}>
                <Key size={14} /> Setup API Keys
              </button>
            </div>
          </div>
        )}

        <button className="floating-keys-btn" onClick={() => setShowApiKeys(true)} title="API Key Setup">
          <Key size={16} />
        </button>
      </main>

      {showNewChat && (
        <NewChatModal onConfirm={handleCreate} onClose={() => setShowNewChat(false)} />
      )}
      {showApiKeys && (
        <ApiKeysModal configuredKeys={{}} onClose={() => setShowApiKeys(false)} />
      )}
    </div>
  )
}
