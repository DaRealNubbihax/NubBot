import { useEffect, useRef, useState } from 'react'
import { Loader as Loader2, Settings } from 'lucide-react'
import MessageBubble from '../components/MessageBubble'
import CollabView from '../components/CollabView'
import ChatInput from '../components/ChatInput'
import ModelSelector from '../components/ModelSelector'
import type { Conversation, Message, ModelResponse } from '../types'
import { getModel, MODELS } from '../lib/models'
import {
  loadMessages,
  saveMessage,
  sendSingleMessage,
  sendCollabMessage,
  updateConversationTitle,
} from '../lib/api'

type CollabEntry = {
  userMessage: string
  responses: ModelResponse[]
}

type ChatItem =
  | { type: 'message'; data: Message }
  | { type: 'collab'; data: CollabEntry }

type Props = {
  conversation: Conversation
  onUpdate: (conv: Conversation) => void
}

export default function ChatPage({ conversation, onUpdate }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [collabItems, setCollabItems] = useState<CollabEntry[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'single' | 'collab'>(conversation.mode)
  const [selectedModels, setSelectedModels] = useState<string[]>(
    conversation.models.length > 0 ? conversation.models : [MODELS[0].id]
  )
  const bottomRef = useRef<HTMLDivElement>(null)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    isFirstLoad.current = true
    setMessages([])
    setCollabItems([])
    loadMessages(conversation.id).then(msgs => {
      setMessages(msgs)
      isFirstLoad.current = false
    })
  }, [conversation.id])

  useEffect(() => {
    if (!isFirstLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, collabItems])

  const submit = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    setLoading(true)

    const historyForApi = messages.map(m => ({ role: m.role, content: m.content }))

    try {
      await saveMessage(conversation.id, 'user', text, null, null)
      const userMsg: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversation.id,
        role: 'user',
        content: text,
        model_id: null,
        model_name: null,
        created_at: new Date().toISOString(),
      }

      if (mode === 'single') {
        const modelId = selectedModels[0]
        const model = getModel(modelId)
        if (!model) return

        setMessages(prev => [...prev, userMsg])
        const content = await sendSingleMessage(model, [...historyForApi, { role: 'user', content: text }], conversation.language)
        const saved = await saveMessage(conversation.id, 'assistant', content, model.id, model.name)
        setMessages(prev => [...prev, saved])

        if (messages.length === 0) {
          const title = text.slice(0, 50) + (text.length > 50 ? '...' : '')
          await updateConversationTitle(conversation.id, title)
          onUpdate({ ...conversation, title })
        }
      } else {
        const models = selectedModels.map(id => getModel(id)).filter(Boolean) as ReturnType<typeof getModel>[]
        setMessages(prev => [...prev, userMsg])
        const responses = await sendCollabMessage(
          models as Parameters<typeof sendCollabMessage>[0],
          [...historyForApi, { role: 'user', content: text }],
          conversation.language
        )

        const collabEntry: CollabEntry = { userMessage: text, responses }
        setCollabItems(prev => [...prev, collabEntry])

        for (const r of responses) {
          if (!r.error) {
            await saveMessage(conversation.id, 'assistant', r.content, r.model.id, r.model.name)
          }
        }

        if (messages.length === 0) {
          const title = text.slice(0, 50) + (text.length > 50 ? '...' : '')
          await updateConversationTitle(conversation.id, title)
          onUpdate({ ...conversation, title })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const chatItems: ChatItem[] = mode === 'collab'
    ? [
        ...messages.filter(m => m.role === 'user').map(m => ({ type: 'message' as const, data: m })),
        ...collabItems.map(c => ({ type: 'collab' as const, data: c })),
      ].sort((a, b) => {
        const aTime = a.type === 'message' ? a.data.created_at : new Date().toISOString()
        const bTime = b.type === 'message' ? b.data.created_at : new Date().toISOString()
        return aTime.localeCompare(bTime)
      })
    : messages.map(m => ({ type: 'message' as const, data: m }))

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-header-left">
          <h1 className="chat-title">{conversation.title}</h1>
          <span className="chat-lang-badge">{conversation.language}</span>
        </div>
        <div className="chat-header-right">
          <ModelSelector
            mode={mode}
            selectedModels={selectedModels}
            onModeChange={setMode}
            onModelsChange={setSelectedModels}
          />
        </div>
      </div>

      <div className="messages-area">
        {chatItems.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">
              <Settings size={36} />
            </div>
            <h2>Ready to code</h2>
            <p>Ask anything about <strong>{conversation.language}</strong>. Examples:</p>
            <div className="example-prompts">
              {getExamples(conversation.language).map(ex => (
                <button key={ex} className="example-btn" onClick={() => setInput(ex)}>{ex}</button>
              ))}
            </div>
          </div>
        )}

        {mode === 'collab'
          ? collabItems.map((item, i) => (
              <CollabView key={i} responses={item.responses} userMessage={item.userMessage} />
            ))
          : messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
        }

        {loading && (
          <div className="loading-indicator">
            <Loader2 size={18} className="spin" />
            <span>
              {mode === 'collab'
                ? `${selectedModels.length} models are thinking...`
                : `${getModel(selectedModels[0])?.name || 'AI'} is thinking...`
              }
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-footer">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={submit}
          loading={loading}
          placeholder={`Ask about ${conversation.language}... (Shift+Enter for newline)`}
        />
        <p className="chat-hint">
          {mode === 'collab'
            ? `${selectedModels.length} model${selectedModels.length !== 1 ? 's' : ''} will collaborate on your answer`
            : `Using ${getModel(selectedModels[0])?.name || 'AI'}`
          }
        </p>
      </div>
    </div>
  )
}

function getExamples(language: string): string[] {
  const map: Record<string, string[]> = {
    lua: [
      'Make me an ESP script for Roblox with player highlighting',
      'Write a Roblox aimbot script with smooth aim',
      'Create a Lua module for detecting players through walls',
    ],
    cpp: [
      'Write a memory scanner class in C++',
      'Create a thread-safe queue implementation',
      'How do I implement a DLL injection in C++?',
    ],
    java: [
      'Write a Minecraft Forge mod that adds a new item',
      'Create a Java reflection utility class',
      'Implement a thread pool executor from scratch',
    ],
  }
  return map[language] || [
    `Write a hello world in ${language}`,
    `Explain best practices for ${language}`,
    `Show me advanced ${language} patterns`,
  ]
}
