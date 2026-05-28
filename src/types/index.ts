export type AIModel = {
  id: string
  name: string
  provider: 'anthropic' | 'openai' | 'google' | 'mistral'
  description: string
  color: string
  icon: string
}

export type MessageRole = 'user' | 'assistant' | 'system'

export type CodeBlock = {
  language: string
  code: string
}

export type Message = {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  model_id: string | null
  model_name: string | null
  created_at: string
}

export type Conversation = {
  id: string
  title: string
  language: string
  mode: 'single' | 'collab'
  models: string[]
  created_at: string
  updated_at: string
}

export type ModelResponse = {
  model: AIModel
  content: string
  error?: string
}

export type CollabResult = {
  responses: ModelResponse[]
  merged: string
}
