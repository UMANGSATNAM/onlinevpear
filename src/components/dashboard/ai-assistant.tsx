'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Sparkles,
  BarChart3,
  Megaphone,
  Package,
  Tag,
  Lightbulb,
  Loader2,
  Bot,
  User,
  Wifi,
  WifiOff,
  Trash2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// Suggested prompts for quick actions
const suggestedPrompts = [
  {
    label: 'Analyze my store performance',
    prompt: 'Analyze my store performance and give me key insights about revenue, conversion rates, and areas for improvement.',
    icon: BarChart3,
    color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    iconBg: 'bg-amber-100',
  },
  {
    label: 'Suggest marketing strategies',
    prompt: 'Suggest effective marketing strategies for my ecommerce store to increase traffic and sales.',
    icon: Megaphone,
    color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    iconBg: 'bg-rose-100',
  },
  {
    label: 'Help optimize my products',
    prompt: 'Help me optimize my product listings for better visibility and conversion rates. What should I improve?',
    icon: Package,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    iconBg: 'bg-emerald-100',
  },
  {
    label: 'Generate a discount code',
    prompt: 'Generate a creative discount code and suggest a promotional campaign strategy around it.',
    icon: Tag,
    color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
    iconBg: 'bg-violet-100',
  },
  {
    label: 'What should I do next?',
    prompt: 'Based on best practices for growing ecommerce stores, what should I focus on next to grow my business?',
    icon: Lightbulb,
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
    iconBg: 'bg-cyan-100',
  },
]

// Simple markdown renderer
function renderMarkdown(text: string): string {
  let rendered = text
  // Bold: **text** or __text__
  rendered = rendered.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  rendered = rendered.replace(/__(.*?)__/g, '<strong>$1</strong>')
  // Inline code: `text`
  rendered = rendered.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
  // Code blocks: ```text```
  rendered = rendered.replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-lg my-2 overflow-x-auto"><code class="text-xs font-mono">$1</code></pre>')
  // Bullet points: * or - at start of line
  rendered = rendered.replace(/^[\*\-]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
  // Numbered lists: 1. at start of line
  rendered = rendered.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
  // Line breaks (double newline = paragraph)
  rendered = rendered.replace(/\n\n/g, '</p><p class="mt-2">')
  // Single newlines
  rendered = rendered.replace(/\n/g, '<br/>')
  return `<p>${rendered}</p>`
}

export function AiAssistant() {
  const { selectedMerchantId } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [useWebSocket, setUseWebSocket] = useState(true)
  const [conversationId] = useState(() => `conv_${selectedMerchantId || 'default'}_${Date.now()}`)
  const scrollRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize WebSocket connection
  useEffect(() => {
    if (!useWebSocket) return

    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('[AI Assistant] WebSocket connected')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('[AI Assistant] WebSocket disconnected')
      setIsConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('[AI Assistant] WebSocket connection error:', err.message)
      setIsConnected(false)
      // Fallback to HTTP after connection failures
      setUseWebSocket(false)
    })

    socket.on('chat:response', (data: {
      id: string
      content: string
      conversationId: string
      timestamp: number
      isFallback?: boolean
    }) => {
      const aiMessage: Message = {
        id: data.id,
        role: 'assistant',
        content: data.content,
        timestamp: data.timestamp,
      }
      setMessages((prev) => [...prev, aiMessage])
      setLoading(false)
      setIsTyping(false)
    })

    socket.on('chat:typing', (data: { conversationId: string; isTyping: boolean }) => {
      setIsTyping(data.isTyping)
    })

    socket.on('chat:history', (data: { conversationId: string; messages: Message[] }) => {
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages)
      }
    })

    socket.on('chat:error', (data: { error: string }) => {
      console.error('[AI Assistant] Chat error:', data.error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setLoading(false)
      setIsTyping(false)
    })

    socketRef.current = socket

    // Load conversation history on connect
    socket.on('connect', () => {
      socket.emit('chat:history', { conversationId })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [useWebSocket, conversationId])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Send message via WebSocket
  const sendMessageWS = useCallback((content: string) => {
    if (!socketRef.current || !isConnected) return false

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setIsTyping(true)

    socketRef.current.emit('chat:message', {
      message: content,
      merchantId: selectedMerchantId,
      conversationId,
    })

    return true
  }, [isConnected, selectedMerchantId, conversationId])

  // Send message via HTTP fallback
  const sendMessageHTTP = async (content: string) => {
    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setIsTyping(true)

    try {
      const data = await api.post<{ result: string }>('/ai', {
        feature: 'chat',
        prompt: content,
        merchantId: selectedMerchantId,
        context: {
          previousMessages: messages.slice(-5).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      })

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: data.result || 'I couldn\'t generate a response. Please try again.',
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
      setIsTyping(false)
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return
    setInput('')

    if (useWebSocket && isConnected) {
      const sent = sendMessageWS(content)
      if (!sent) {
        await sendMessageHTTP(content)
      }
    } else {
      await sendMessageHTTP(content)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearChat = () => {
    setMessages([])
    setIsTyping(false)
    setLoading(false)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Assistant</h2>
          <p className="text-sm text-muted-foreground">Get real-time AI-powered help for your store</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {useWebSocket ? (
              <Badge
                variant="outline"
                className={`gap-1.5 text-xs ${
                  isConnected
                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                    : 'border-red-200 text-red-700 bg-red-50'
                }`}
              >
                {isConnected ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5 text-xs border-amber-200 text-amber-700 bg-amber-50">
                <WifiOff className="h-3 w-3" />
                HTTP Mode
              </Badge>
            )}
          </div>
          {/* Clear Chat */}
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground hover:text-foreground">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="flex flex-col h-[650px]">
            <CardHeader className="border-b shrink-0 p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    {isConnected && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                    )}
                  </div>
                  ShopForge AI
                  {isTyping && (
                    <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                      is typing
                      <span className="flex gap-0.5">
                        <motion.span
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                          className="h-1 w-1 rounded-full bg-primary"
                        />
                        <motion.span
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                          className="h-1 w-1 rounded-full bg-primary"
                        />
                        <motion.span
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                          className="h-1 w-1 rounded-full bg-primary"
                        />
                      </span>
                    </span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full overflow-y-auto custom-scrollbar" ref={scrollRef}>
                <div className="p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6"
                      >
                        <Sparkles className="h-10 w-10 text-primary" />
                      </motion.div>
                      <h3 className="font-semibold text-xl mb-2">How can I help you?</h3>
                      <p className="text-sm text-muted-foreground max-w-md mb-6">
                        I can help with product management, marketing, analytics, and store optimization.
                        Try one of the suggestions or ask anything!
                      </p>
                      {/* Quick prompt buttons for empty state */}
                      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                        {suggestedPrompts.slice(0, 3).map((prompt) => (
                          <motion.button
                            key={prompt.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => sendMessage(prompt.prompt)}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all disabled:opacity-50 ${prompt.color}`}
                          >
                            <prompt.icon className="h-4 w-4" />
                            {prompt.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <div
                              className="prose prose-sm max-w-none [&_strong]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_code]:bg-muted/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-muted/80 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:my-2 [&_pre]:overflow-x-auto"
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                            />
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                          <p className={`text-xs mt-2 ${
                            message.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  {isTyping && messages.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex gap-3"
                    >
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                              className="h-2 w-2 rounded-full bg-primary/40"
                            />
                            <motion.div
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                              className="h-2 w-2 rounded-full bg-primary/40"
                            />
                            <motion.div
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                              className="h-2 w-2 rounded-full bg-primary/40"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">ShopForge AI is thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
            <div className="border-t p-4 shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Ask me anything about your store..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1 h-10"
                />
                <Button type="submit" disabled={loading || !input.trim()} size="icon" className="h-10 w-10 shrink-0">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Suggestions Sidebar */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Quick Actions</h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto custom-scrollbar pr-1">
            {suggestedPrompts.map((suggestion, index) => (
              <motion.button
                key={suggestion.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => sendMessage(suggestion.prompt)}
                disabled={loading}
                className={`w-full text-left p-3 rounded-xl border transition-all disabled:opacity-50 ${suggestion.color}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${suggestion.iconBg}`}>
                    <suggestion.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{suggestion.label}</p>
                    <p className="text-xs opacity-70 line-clamp-2 mt-0.5">{suggestion.prompt}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Tips
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                Be specific about your store and products
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                Ask for variations of generated content
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                Request multiple options to choose from
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                Use for brainstorming marketing ideas
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                Ask about SEO optimization strategies
              </li>
            </ul>
          </div>

          {/* Connection Info */}
          <div className="p-4 rounded-xl bg-muted/50 border">
            <h4 className="text-sm font-medium mb-2">Connection</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Mode</span>
                <Badge variant="outline" className="text-[10px] h-5">
                  {useWebSocket && isConnected ? 'WebSocket' : 'HTTP'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Status</span>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className={isConnected ? 'text-emerald-700' : 'text-red-700'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Messages</span>
                <span className="font-medium">{messages.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.4);
        }
      `}</style>
    </motion.div>
  )
}
