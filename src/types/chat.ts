export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: Date
  isStreaming?: boolean
}

export interface ConsentRequest {
  id: string
  message: string
  accepted: boolean
  timestamp?: Date
}

export interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: 'broadband' | 'digital-literacy' | 'affordability' | 'devices' | 'technical-support' | 'mapping'
  audience: 'beginner' | 'intermediate' | 'advanced' | 'everyone'
  tags: string[]
  source: string
}

export interface DigitalSkillsAssessment {
  id: string
  userId?: string
  currentStep: number
  totalSteps: number
  responses: AssessmentResponse[]
  comfortLevel?: 'none' | 'basic' | 'intermediate' | 'advanced'
  deviceTypes: string[]
  primaryNeeds: string[]
  learningPreferences: string[]
  specificChallenges: string[]
  isComplete: boolean
  startedAt: Date
  completedAt?: Date
}

export interface AssessmentResponse {
  questionId: string
  question: string
  answer: string | string[]
  timestamp: Date
}

export interface AssessmentQuestion {
  id: string
  step: number
  category: 'basic-comfort' | 'device-experience' | 'internet-access' | 'digital-skills' | 'learning-goals' | 'barriers'
  question: string
  description?: string
  type: 'single-choice' | 'multiple-choice' | 'scale' | 'open-text'
  options?: AssessmentOption[]
  validation?: {
    required: boolean
    minSelections?: number
    maxSelections?: number
  }
}

export interface AssessmentOption {
  id: string
  label: string
  value: string
  description?: string
  followUpQuestion?: string
}

export interface ChatResponse {
  response: string
  resources?: Resource[]
  assessmentSuggestions?: string[]
  nextSteps?: string[]
  shouldStartAssessment?: boolean
  assessmentQuestion?: AssessmentQuestion
}

export interface ChatSession {
  id: string
  messages: Message[]
  assessment?: DigitalSkillsAssessment
  userProfile: {
    skillLevel?: 'beginner' | 'intermediate' | 'advanced'
    completedAssessment: boolean
    primaryGoals: string[]
    preferredTopics: string[]
  }
  startedAt: Date
  lastActivity: Date
} 