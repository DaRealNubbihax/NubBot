import { supabase } from './supabase'
import type { ModelResponse, AIModel } from '../types'

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

async function callEdge(fn: string, body: unknown): Promise<Response> {
  return fetch(`${EDGE_URL}/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
}

export async function sendSingleMessage(
  model: AIModel,
  messages: { role: string; content: string }[],
  language: string
): Promise<string> {
  const res = await callEdge('chat', { model: model.id, provider: model.provider, messages, language })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Model request failed')
  }
  const data = await res.json()
  return data.content
}

export async function sendCollabMessage(
  models: AIModel[],
  messages: { role: string; content: string }[],
  language: string
): Promise<ModelResponse[]> {
  const results = await Promise.allSettled(
    models.map(async (model): Promise<ModelResponse> => {
      try {
        const content = await sendSingleMessage(model, messages, language)
        return { model, content }
      } catch (err) {
        return { model, content: '', error: (err as Error).message }
      }
    })
  )
  return results.map(r => (r.status === 'fulfilled' ? r.value : { model: models[0], content: '', error: 'Failed' }))
}

export async function loadConversations() {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function loadMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createConversation(
  title: string,
  language: string,
  mode: 'single' | 'collab',
  models: string[]
) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ title, language, mode, models })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateConversationTitle(id: string, title: string) {
  await supabase.from('conversations').update({ title, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function saveMessage(
  conversationId: string,
  role: string,
  content: string,
  modelId: string | null,
  modelName: string | null
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content, model_id: modelId, model_name: modelName })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteConversation(id: string) {
  await supabase.from('conversations').delete().eq('id', id)
}
