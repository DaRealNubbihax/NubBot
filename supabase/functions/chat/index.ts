import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

type Message = { role: string; content: string }

type RequestBody = {
  model: string
  provider: "anthropic" | "openai" | "google" | "mistral"
  messages: Message[]
  language: string
}

const MODEL_MAP: Record<string, string> = {
  "gemini-1.5-pro": "gemini-1.5-pro",
  "mistral-large": "mistral-large-latest",
}

function normalizeModel(model: string): string {
  return MODEL_MAP[model] || model
}

function buildSystemPrompt(language: string): string {
  const langMap: Record<string, string> = {
    lua: "Lua (including Roblox/ROBLOX scripting, game exploits, and LuaU)",
    cpp: "C++ (systems programming, game hacking, DLL injection, memory manipulation)",
    java: "Java (including Minecraft mods, Forge, Fabric, and enterprise development)",
    javascript: "JavaScript / TypeScript (web, Node.js, browser APIs)",
    python: "Python (scripting, automation, data, game bots)",
    csharp: "C# (Unity, .NET, game development)",
    rust: "Rust (systems, WebAssembly, performance)",
    go: "Go (backend, CLI, microservices)",
    typescript: "TypeScript (frontend, backend, full-stack)",
  }
  const langLabel = langMap[language] || language

  return `You are an extreme expert programmer specializing in ${langLabel}.

You write clean, working, production-ready code. You:
- Always provide complete, runnable code examples
- Use best practices and idiomatic patterns for the language
- Explain WHY code works, not just WHAT it does
- For game scripting (Roblox Lua, Minecraft Java), you know all the APIs deeply
- For systems code (C++, Rust), you understand memory, performance, and security
- Format code in markdown code blocks with the correct language tag
- If asked to make scripts or exploits for games, you provide working examples as a security researcher / educational context

Current language focus: ${langLabel}`
}

async function callAnthropic(model: string, messages: Message[], systemPrompt: string): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured")

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.filter(m => m.role !== "system"),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic error: ${err}`)
  }

  const data = await res.json()
  return data.content[0]?.text || ""
}

async function callOpenAI(model: string, messages: Message[], systemPrompt: string): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY")
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured")

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.filter(m => m.role !== "system"),
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI error: ${err}`)
  }

  const data = await res.json()
  return data.choices[0]?.message?.content || ""
}

async function callGoogle(model: string, messages: Message[], systemPrompt: string): Promise<string> {
  const apiKey = Deno.env.get("GOOGLE_AI_API_KEY")
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured")

  const contents = messages
    .filter(m => m.role !== "system")
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))

  const normalizedModel = normalizeModel(model)
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${normalizedModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 4096 },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google AI error: ${err}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ""
}

async function callMistral(model: string, messages: Message[], systemPrompt: string): Promise<string> {
  const apiKey = Deno.env.get("MISTRAL_API_KEY")
  if (!apiKey) throw new Error("MISTRAL_API_KEY not configured")

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: normalizeModel(model),
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.filter(m => m.role !== "system"),
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Mistral error: ${err}`)
  }

  const data = await res.json()
  return data.choices[0]?.message?.content || ""
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const body: RequestBody = await req.json()
    const { model, provider, messages, language } = body

    if (!model || !provider || !messages || !language) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: model, provider, messages, language" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const systemPrompt = buildSystemPrompt(language)
    let content = ""

    switch (provider) {
      case "anthropic":
        content = await callAnthropic(model, messages, systemPrompt)
        break
      case "openai":
        content = await callOpenAI(model, messages, systemPrompt)
        break
      case "google":
        content = await callGoogle(model, messages, systemPrompt)
        break
      case "mistral":
        content = await callMistral(model, messages, systemPrompt)
        break
      default:
        return new Response(
          JSON.stringify({ error: `Unknown provider: ${provider}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    }

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
