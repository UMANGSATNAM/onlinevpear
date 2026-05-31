import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = 3003

// Create HTTP server
const httpServer = createServer()

// Create Socket.io server with CORS
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// In-memory conversation store
const conversations = new Map<string, Array<{
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}>>()

const MAX_MESSAGES_PER_CONVERSATION = 50

// Lazy SDK initialization
let sdkInstance: any = null

async function getSdk() {
  if (!sdkInstance) {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    sdkInstance = await ZAI.create()
  }
  return sdkInstance
}

// Get or create conversation
function getConversation(conversationId: string) {
  if (!conversations.has(conversationId)) {
    conversations.set(conversationId, [])
  }
  return conversations.get(conversationId)!
}

// Add message to conversation (with max limit)
function addMessage(conversationId: string, message: {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}) {
  const conv = getConversation(conversationId)
  conv.push(message)
  // Trim to max messages
  if (conv.length > MAX_MESSAGES_PER_CONVERSATION) {
    conversations.set(conversationId, conv.slice(-MAX_MESSAGES_PER_CONVERSATION))
  }
}

// System prompt for Online Vepar AI
const SYSTEM_PROMPT = `You are Online Vepar AI, an intelligent ecommerce assistant. Help merchants with product management, marketing, analytics, and store optimization. Be concise and actionable. Use markdown formatting when helpful: **bold** for emphasis, bullet points for lists, and \`code\` for technical terms.`

// Fallback responses when AI fails
const FALLBACK_RESPONSES = [
  "I'm currently experiencing high demand. Please try again in a moment.",
  "I couldn't process your request right now. Could you please rephrase and try again?",
  "I'm having trouble connecting to my knowledge base. Please try again shortly.",
  "Something went wrong on my end. Your question is important — please try once more.",
]

function getFallbackResponse(): string {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
}

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`[ChatService] Client connected: ${socket.id}`)

  // Handle chat:message event
  socket.on('chat:message', async (data: {
    message: string
    merchantId?: string
    conversationId: string
  }) => {
    const { message, merchantId, conversationId } = data

    if (!message || !message.trim()) {
      socket.emit('chat:error', { error: 'Message cannot be empty' })
      return
    }

    if (!conversationId) {
      socket.emit('chat:error', { error: 'Conversation ID is required' })
      return
    }

    // Store user message
    const userMsg = {
      id: `msg_${Date.now()}_user`,
      role: 'user' as const,
      content: message,
      timestamp: Date.now(),
    }
    addMessage(conversationId, userMsg)

    // Notify that AI is typing
    socket.emit('chat:typing', { conversationId, isTyping: true })

    try {
      const sdk = await getSdk()

      // Build message history for context (last 10 messages)
      const conv = getConversation(conversationId)
      const contextMessages = conv.slice(-10).map((m) => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }))

      const response = await sdk.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...contextMessages,
        ],
        thinking: { type: 'disabled' },
      })

      const aiContent = response.choices?.[0]?.message?.content || ''

      if (!aiContent) {
        throw new Error('Empty response from AI')
      }

      // Store AI response
      const aiMsg = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant' as const,
        content: aiContent,
        timestamp: Date.now(),
      }
      addMessage(conversationId, aiMsg)

      // Send response back
      socket.emit('chat:response', {
        id: aiMsg.id,
        content: aiContent,
        conversationId,
        timestamp: aiMsg.timestamp,
        usage: response.usage || null,
      })
    } catch (error) {
      console.error('[ChatService] AI error:', error)

      // Fallback response
      const fallbackContent = getFallbackResponse()
      const fallbackMsg = {
        id: `msg_${Date.now()}_ai_fallback`,
        role: 'assistant' as const,
        content: fallbackContent,
        timestamp: Date.now(),
      }
      addMessage(conversationId, fallbackMsg)

      socket.emit('chat:response', {
        id: fallbackMsg.id,
        content: fallbackContent,
        conversationId,
        timestamp: fallbackMsg.timestamp,
        isFallback: true,
      })
    } finally {
      socket.emit('chat:typing', { conversationId, isTyping: false })
    }
  })

  // Handle chat:history event - return recent messages for a conversation
  socket.on('chat:history', (data: { conversationId: string }) => {
    const { conversationId } = data
    const conv = getConversation(conversationId)
    socket.emit('chat:history', {
      conversationId,
      messages: conv,
    })
  })

  // Handle chat:typing event from client
  socket.on('chat:typing', (data: { conversationId: string; isTyping: boolean }) => {
    socket.broadcast.emit('chat:typing', data)
  })

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`[ChatService] Client disconnected: ${socket.id}, reason: ${reason}`)
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`[ChatService] Socket.io server running on port ${PORT}`)
})

// Cleanup old conversations every 30 minutes
setInterval(() => {
  const now = Date.now()
  const THIRTY_MINUTES = 30 * 60 * 1000

  for (const [conversationId, messages] of conversations.entries()) {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && now - lastMessage.timestamp > THIRTY_MINUTES) {
      conversations.delete(conversationId)
    }
  }
}, 30 * 60 * 1000)
