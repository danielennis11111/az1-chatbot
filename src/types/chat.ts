export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: Date
}

export type ChatSession = {
  id: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export type ConsentStatus = {
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
  comfortLevel: 'none' | 'basic' | 'intermediate' | 'advanced'
  deviceTypes: string[]
  primaryNeeds: string[]
  learningPreferences: string[]
  specificChallenges: string[]
}

export interface ChatResponse {
  response: string
  resources?: Resource[]
  assessmentSuggestions?: string[]
  nextSteps?: string[]
} 