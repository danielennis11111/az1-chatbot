'use client'

import { useState, useRef, useEffect } from 'react'
import { Message, DigitalSkillsAssessment, AssessmentQuestion } from '@/types/chat'
import { MessageCircle, Send, Loader2, AlertCircle, Info, ChartBarIcon, UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { AssessmentQuestionComponent } from './AssessmentQuestion'
import { AssessmentProgress } from './AssessmentProgress'
import { AIBrainIcon } from './AIBrainIcon'
import { tailwindClasses } from '@/lib/theme'
import { 
  createAssessment, 
  getNextQuestion, 
  processAssessmentResponse, 
  getAssessmentProgress, 
  generateAssessmentRecommendations 
} from '@/lib/assessment'

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
  },
  {
    text: "Take a digital skills assessment to get personalized help",
    category: "assessment"
  }
]

const INITIAL_MESSAGES: Message[] = []

export function Chat({ embedMode = false }: { embedMode?: boolean }) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [consentStatus, setConsentStatus] = useState<'pending' | 'accepted' | 'declined'>('pending')
  const [error, setError] = useState<string | null>(null)
  const [cooldownTime, setCooldownTime] = useState<number | null>(null)
  
  // Assessment state
  const [isInAssessment, setIsInAssessment] = useState(false)
  const [currentAssessment, setCurrentAssessment] = useState<DigitalSkillsAssessment | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null)
  const [assessmentLoading, setAssessmentLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentQuestion])

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

  const startAssessment = () => {
    const assessment = createAssessment()
    const firstQuestion = getNextQuestion(assessment)
    
    setCurrentAssessment(assessment)
    setCurrentQuestion(firstQuestion)
    setIsInAssessment(true)
    
    // Add a welcome message for the assessment
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: "Great! I'd love to learn more about your digital skills and goals so I can provide the best help for you. This quick assessment will take about 3-5 minutes. Let's get started!",
      role: 'assistant',
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, welcomeMessage])
  }

  const handleAssessmentAnswer = async (answer: string | string[]) => {
    if (!currentAssessment || !currentQuestion) return

    console.log('Processing answer:', answer, 'for question:', currentQuestion.id)
    setAssessmentLoading(true)

    try {
      // Process the response
      const updatedAssessment = processAssessmentResponse(
        currentAssessment,
        currentQuestion.id,
        answer
      )

      setCurrentAssessment(updatedAssessment)

      // Add user's answer to chat
      const userAnswerText = Array.isArray(answer) 
        ? answer.length === 1 
          ? answer[0] 
          : answer.join(', ')
        : answer

      const userMessage: Message = {
        id: Date.now().toString(),
        content: `**${currentQuestion.question}**\n\n${userAnswerText}`,
        role: 'user',
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, userMessage])

      // Check if assessment is complete
      console.log('Updated assessment:', updatedAssessment)
      if (updatedAssessment.isComplete) {
        console.log('Assessment complete!')
        setIsInAssessment(false)
        setCurrentQuestion(null)

        // Generate recommendations
        const recommendations = generateAssessmentRecommendations(updatedAssessment)
        
        const completionMessage: Message = {
          id: Date.now().toString(),
          content: `🎉 **Assessment Complete!** Thank you for sharing that information with me.\n\n**Your Digital Skills Level:** ${recommendations.skillLevel.charAt(0).toUpperCase() + recommendations.skillLevel.slice(1)}\n\n**Here's what I recommend for you:**\n\n${recommendations.nextSteps.map(step => `• ${step}`).join('\n')}\n\n**Helpful Resources:**\n${recommendations.recommendedResources.map(resource => `• ${resource}`).join('\n')}\n\nFeel free to ask me about any of these topics, or let me know what specific help you'd like!`,
          role: 'assistant',
          createdAt: new Date(),
        }
        setMessages(prev => [...prev, completionMessage])
      } else {
        // Get next question
        const nextQuestion = getNextQuestion(updatedAssessment)
        console.log('Next question:', nextQuestion)
        setCurrentQuestion(nextQuestion)

        // Add encouraging message
        const encouragementMessages = [
          "Thanks for that! Let's continue...",
          "Perfect! Next question:",
          "Got it! Moving on:",
          "Excellent! One more question:",
        ]
        const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
        
        const encouragementMsg: Message = {
          id: Date.now().toString(),
          content: randomMessage,
          role: 'assistant',
          createdAt: new Date(),
        }
        setMessages(prev => [...prev, encouragementMsg])
      }
    } catch (error) {
      console.error('Assessment error:', error)
      setError('There was an issue processing your response. Please try again.')
    } finally {
      setAssessmentLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || consentStatus === 'pending' || cooldownTime || isInAssessment) return

    // Check if user wants to start assessment
    if (input.toLowerCase().includes('assessment') || input.toLowerCase().includes('skills') || 
        input.toLowerCase().includes('evaluate') || input.toLowerCase().includes('test my')) {
      startAssessment()
      setInput('')
      return
    }

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

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
        createdAt: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

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

  const handleStarterClick = (starterText: string) => {
    if (starterText.includes('assessment')) {
      startAssessment()
    } else {
      setInput(starterText)
    }
  }

  if (consentStatus === 'pending') {
    return (
      <div className={`flex flex-col items-center justify-center ${embedMode ? 'min-h-full' : 'min-h-[500px]'} p-6 bg-gradient-to-br from-blue-50 to-indigo-100 ${!embedMode && 'rounded-2xl shadow-xl'}`}>
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
          <UserIcon className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
          Welcome to Your Digital Navigator
        </h2>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl leading-relaxed">
          I'm here to help you learn about broadband internet, digital literacy, and technology - no matter your experience level. Whether you're just getting started or need specific technical help, I'll guide you step by step with patience and understanding.
        </p>
        
        <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6 mb-8 flex items-start gap-4 max-w-2xl">
          <Info className="w-6 h-6 flex-shrink-0 mt-1 text-blue-600" />
          <div>
            <p className="font-semibold text-gray-900 mb-2">About Data Collection</p>
            <p className="text-gray-700 text-sm leading-relaxed">
              We can collect chat data to improve our service and provide better assistance. You can choose to share your data or use the chatbot without data collection - both options work perfectly.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={() => setConsentStatus('accepted')}
            className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Accept & Continue
          </button>
          <button
            onClick={() => setConsentStatus('declined')}
            className="flex-1 bg-white text-gray-700 border-2 border-gray-300 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
          >
            Continue Without Data Sharing
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-6 max-w-2xl text-center">
          By continuing, you agree to our <a href="#" className="underline text-blue-600">Terms of Service</a> and <a href="#" className="underline text-blue-600">Privacy Policy</a>.
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${embedMode ? 'h-full' : 'h-[700px]'} bg-white ${!embedMode && 'rounded-2xl shadow-xl'} overflow-hidden`}>
      {/* Header - don't show in embed mode as we already have a header in the sidebar */}
      {!embedMode && (
        <div className={`flex items-center justify-between p-4 md:p-6 border-b ${tailwindClasses.gradient.tealToLightTeal} text-white`}>
          <div className="flex items-center">
            <AIBrainIcon className="w-6 h-6 mr-3" />
            <div>
              <h2 className="text-lg font-semibold">Arizona Digital Navigator</h2>
              <p className="text-sm text-white/80">Your guide to digital literacy & broadband</p>
            </div>
          </div>
          {consentStatus === 'declined' && (
            <div className="text-xs text-white/80 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              Private mode
            </div>
          )}
        </div>
      )}

      {/* Assessment Progress */}
      {isInAssessment && currentAssessment && (
        <div className="p-4 bg-blue-50 border-b">
          <AssessmentProgress 
            currentStep={currentAssessment.currentStep}
            totalSteps={currentAssessment.totalSteps}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Assessment Question */}
        {isInAssessment && currentQuestion && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8">
            <AssessmentQuestionComponent
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={handleAssessmentAnswer}
              isLoading={assessmentLoading}
            />
          </div>
        )}

        {/* Welcome State */}
        {messages.length === 0 && !isLoading && !isInAssessment ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 ${tailwindClasses.gradient.tealToLightTeal} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <AIBrainIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                Welcome! I'm here to help you with:
              </h3>
              <p className="text-gray-600 text-lg">
                Broadband information • Digital literacy • Technology basics • Arizona resources
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 max-w-2xl mx-auto">
              <p className="text-sm text-gray-500 font-medium mb-2">Try asking about:</p>
              {CONVERSATION_STARTERS.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleStarterClick(starter.text)}
                  className={cn(
                    "text-left p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] focus:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#006269]/20",
                    starter.category === 'assessment' 
                      ? `bg-gradient-to-r from-[#DDB176]/20 to-[#F0EDE9] ${tailwindClasses.border.sand} hover:border-[#C09B56] text-[#B1591E]`
                      : `${tailwindClasses.bg.background} hover:bg-[#E0DCD5] ${tailwindClasses.border.lightTeal} hover:${tailwindClasses.border.teal} text-[#006269]`
                  )}
                >
                  <span className="font-medium">{starter.text}</span>
                  {starter.category === 'assessment' && (
                    <span className="block text-xs text-green-600 mt-1">
                      Recommended for personalized guidance
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            <div className={`mt-8 p-6 bg-gradient-to-r from-[#A5C9CA]/20 to-[#F0EDE9] rounded-2xl ${tailwindClasses.border.teal} max-w-2xl mx-auto`}>
              <p className={`${tailwindClasses.text.teal} leading-relaxed`}>
                <strong>Remember:</strong> No question is too basic! I'm here to help whether you're completely new to technology or looking for advanced information. Take your time, and don't hesitate to ask for clarification.
              </p>
            </div>
          </div>
        ) : !isInAssessment ? (
          /* Chat Messages */
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
                    'max-w-[90%] md:max-w-[85%] rounded-2xl p-4 md:p-5 shadow-sm',
                    message.role === 'user'
                      ? `${tailwindClasses.gradient.tealToLightTeal} text-white`
                      : `${tailwindClasses.bg.background} text-gray-900 border ${tailwindClasses.border.sand}`
                  )}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                      a: ({ href, children }) => (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={cn(
                            "underline hover:no-underline transition-all",
                            message.role === 'user' ? "text-blue-100" : "text-blue-600"
                          )}
                        >
                          {children}
                        </a>
                      ),
                      strong: ({ children }) => (
                        <strong className={message.role === 'user' ? "text-blue-100" : "text-gray-900"}>
                          {children}
                        </strong>
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
                <div className={`${tailwindClasses.bg.background} ${tailwindClasses.border.sand} rounded-2xl p-4`}>
                  <Loader2 className={`w-5 h-5 animate-spin ${tailwindClasses.text.teal}`} />
                </div>
              </div>
            )}
          </>
        ) : null}

        {error && (
          <div className="flex justify-center">
            <div className={`bg-[#B1591E]/10 ${tailwindClasses.text.rust} rounded-2xl p-4 flex items-center gap-3 max-w-[90%] md:max-w-[85%] ${tailwindClasses.border.rust}`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm leading-relaxed">{error}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form - Hidden during assessment */}
      {!isInAssessment && (
        <form onSubmit={handleSubmit} className={`p-4 md:p-6 border-t ${tailwindClasses.border.sand} ${tailwindClasses.bg.background}`}>
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={cooldownTime ? "Please wait for the cooldown period..." : "Ask about broadband, technology, or digital literacy..."}
              className={`flex-1 px-4 py-3 border ${tailwindClasses.border.sand} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006269] focus:border-transparent transition-all`}
              disabled={isLoading || !!cooldownTime}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !!cooldownTime}
              className={`${tailwindClasses.gradient.tealToLightTeal} text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {cooldownTime && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              Cooldown: {Math.ceil(cooldownTime / 1000 / 60)} minutes remaining
            </p>
          )}
        </form>
      )}
    </div>
  )
} 