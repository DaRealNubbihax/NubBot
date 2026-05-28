import type { AIModel } from '../types'

export const MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI — Fast, creative, great at diverse code tasks',
    color: '#16A34A',
    icon: 'G',
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'OpenAI — Powerful, large context window',
    color: '#15803D',
    icon: 'G',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Google — Huge context, strong multimodal understanding',
    color: '#2563EB',
    icon: 'Gm',
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    description: 'Mistral — Fast European model, great for structured code',
    color: '#7C3AED',
    icon: 'M',
  },
]

export function getModel(id: string): AIModel | undefined {
  return MODELS.find(m => m.id === id)
}

export const LANGUAGES = [
  { id: 'lua', label: 'Lua', ext: '.lua' },
  { id: 'cpp', label: 'C++', ext: '.cpp' },
  { id: 'java', label: 'Java', ext: '.java' },
  { id: 'javascript', label: 'JavaScript', ext: '.js' },
  { id: 'typescript', label: 'TypeScript', ext: '.ts' },
  { id: 'python', label: 'Python', ext: '.py' },
  { id: 'csharp', label: 'C#', ext: '.cs' },
  { id: 'rust', label: 'Rust', ext: '.rs' },
  { id: 'go', label: 'Go', ext: '.go' },
]
