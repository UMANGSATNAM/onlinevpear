'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Send,
  Sparkles,
  FileText,
  Search,
  Mail,
  BarChart3,
  Loader2,
  Bot,
  User,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const promptSuggestions = [
  {
    label: 'Generate product description',
    prompt: 'Generate a compelling product description for a new product in my store. Make it SEO-friendly and engaging.',
    feature: 'product_desc',
    icon: FileText,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    label: 'Optimize my SEO',
    prompt: 'Review my store and suggest SEO improvements for better search rankings. Include meta title and description recommendations.',
    feature: 'seo',
    icon: Search,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    label: 'Create a marketing email',
    prompt: 'Create an engaging marketing email for my store. Include a compelling subject line, body content, and call-to-action.',
    feature: 'marketing',
    icon: Mail,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    label: 'Analyze my sales',
    prompt: 'Analyze my recent sales data and provide actionable insights to improve revenue, conversion rates, and customer retention.',
    feature: 'analytics',
    icon: BarChart3,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
]

export function AiAssistant() {
  const { selectedMerchantId } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (content: string, feature: string = 'chat') => {
    if (!content.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const data = await api.post<{ result: string }>('/ai', {
        feature,
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
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.result || 'I couldn\'t generate a response. Please try again.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">Get AI-powered help for your store</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="border-b shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                ShopForge AI
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full" ref={scrollRef}>
                <div className="p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">How can I help you?</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        I can help with product descriptions, SEO optimization, marketing emails,
                        sales analysis, and more. Try one of the suggestions or ask anything!
                      </p>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
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
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <div className="border-t p-4 shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder="Ask me anything about your store..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading || !input.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Quick Prompts</h3>
          {promptSuggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              onClick={() => sendMessage(suggestion.prompt, suggestion.feature)}
              disabled={loading}
              className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${suggestion.color}`}>
                  <suggestion.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{suggestion.label}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{suggestion.prompt}</p>
                </div>
              </div>
            </button>
          ))}

          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Be specific about your store and products</li>
              <li>• Ask for variations of generated content</li>
              <li>• Request multiple options to choose from</li>
              <li>• Use for brainstorming marketing ideas</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
