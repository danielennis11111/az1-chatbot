'use client'

import { useState, useRef, useEffect } from 'react'
import { Message } from '@/types/chat'
import { MessageCircle, Send, Loader2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

// Add some initial messages to guide the user
const CONVERSATION_STARTERS = [
  {
    text: "What is broadband internet and do I need it?",
    category: "broadband-basics"
  },
  {
    text: "Help me find affordable internet options in Arizona",
    category: "affordability"
  },
  {
    text: "I'm new to technology - where should I start?",
    category: "digital-literacy"
  },
  {
    text: "My internet isn't working properly, what can I do?",
    category: "troubleshooting"
  }
]

const INITIAL_MESSAGES: Message[] = []

export function Chat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [consentStatus, setConsentStatus] = useState<'pending' | 'accepted' | 'declined'>('pending')
  const [error, setError] = useState<string | null>(null)
  const [cooldownTime, setCooldownTime] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Reset error when user starts typing
  useEffect(() => {
    if (input.trim()) {
      setError(null)
    }
  }, [input])

  // Add cooldown timer effect
  useEffect(() => {
    if (!cooldownTime) return

    const interval = setInterval(() => {
      setCooldownTime(prev => {
        if (!prev || prev <= 1000) {
          clearInterval(interval)
          return null
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [cooldownTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || consentStatus === 'pending' || cooldownTime) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      console.log('Sending message:', userMessage)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          dataCollectionEnabled: consentStatus === 'accepted',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429) {
          setCooldownTime(errorData.timeToWait)
          throw new Error(errorData.message || 'Rate limit exceeded')
        }
        throw new Error(errorData.message || `Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received response:', data)

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
        createdAt: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      // If we got remaining requests info, show a warning when low
      if (data.remainingRequests && data.remainingRequests < 10) {
        setError(`Note: Only ${data.remainingRequests} requests remaining in this hour.`)
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (consentStatus === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Welcome to Your Digital Navigator</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          I'm here to help you learn about broadband internet, digital literacy, and technology - no matter your experience level. Whether you're just getting started or need specific technical help, I'll guide you step by step.
        </p>
        
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6 flex items-start gap-3 max-w-md">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-2">About Data Collection</p>
            <p className="text-sm">
              We can collect chat data to improve our service. You can choose to share your data or use the chatbot without data collection.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={() => setConsentStatus('accepted')}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Accept Data Collection
          </button>
          <button
            onClick={() => setConsentStatus('declined')}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Decline & Continue
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4 max-w-md text-center">
          By continuing, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold">AZ-1 Broadband Information</h2>
        </div>
        {consentStatus === 'declined' && (
          <div className="text-xs text-gray-500 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            Data collection disabled
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="space-y-4">
            <div className="text-center text-gray-600 mb-6">
              <h3 className="text-lg font-medium mb-2">Welcome! I'm here to help you with:</h3>
              <p className="text-sm">Broadband information • Digital literacy • Technology basics • Arizona resources</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <p className="text-sm text-gray-500 font-medium">Try asking about:</p>
              {CONVERSATION_STARTERS.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => setInput(starter.text)}
                  className="text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <span className="text-blue-700 text-sm">{starter.text}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                <strong>Remember:</strong> No question is too basic! I'm here to help whether you're completely new to technology or looking for advanced information.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex w-full',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-4',
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="prose prose-sm">{children}</p>,
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {children}
                        </a>
                      )
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
          </>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-700 rounded-lg p-4 flex items-center gap-2 max-w-[80%]">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={cooldownTime ? "Please wait for the cooldown period..." : "Ask about broadband, technology, or digital literacy..."}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || !!cooldownTime}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !!cooldownTime}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {cooldownTime && (
          <p className="text-sm text-gray-500 mt-2">
            Cooldown: {Math.ceil(cooldownTime / 1000 / 60)} minutes remaining
          </p>
        )}
      </form>
    </div>
  )
} 