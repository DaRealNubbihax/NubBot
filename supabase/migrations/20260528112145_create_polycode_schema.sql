/*
  # PolyCode AI — Initial Schema

  ## Overview
  Sets up the core tables for the multi-model coding chatbot.

  ## New Tables

  ### conversations
  Stores each chat session with metadata about which language and AI models are used.
  - `id` (uuid, pk) — unique identifier
  - `title` (text) — display title, auto-generated from first message
  - `language` (text) — primary coding language (lua, cpp, java, etc.)
  - `mode` (text) — 'single' for one AI, 'collab' for multiple AIs working together
  - `models` (text[]) — array of model IDs selected for this conversation
  - `created_at`, `updated_at` — timestamps

  ### messages
  Every individual message in a conversation, including which AI model produced it.
  - `id` (uuid, pk)
  - `conversation_id` (uuid, fk → conversations)
  - `role` (text) — 'user' or 'assistant'
  - `content` (text) — full message body (may contain markdown + code blocks)
  - `model_id` (text, nullable) — the specific model ID (e.g. 'gpt-4o', 'claude-sonnet-4-5')
  - `model_name` (text, nullable) — human-friendly name
  - `created_at` — timestamp

  ## Security
  - RLS enabled on both tables
  - Public access policies (no auth required for this version — intended for personal/self-hosted use)
    Note: For multi-user deployment, these policies should be restricted to auth.uid() ownership
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'New Chat',
  language text NOT NULL DEFAULT 'lua',
  mode text NOT NULL DEFAULT 'single',
  models text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL DEFAULT '',
  model_id text,
  model_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON conversations(updated_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read on conversations"
  ON conversations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow all insert on conversations"
  ON conversations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all update on conversations"
  ON conversations FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all delete on conversations"
  ON conversations FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow all read on messages"
  ON messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow all insert on messages"
  ON messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all delete on messages"
  ON messages FOR DELETE
  TO anon, authenticated
  USING (true);
