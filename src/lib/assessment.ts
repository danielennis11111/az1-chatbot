import { AssessmentQuestion, DigitalSkillsAssessment, AssessmentResponse } from '@/types/chat'

// NDIA Digital Navigator Assessment Questions
// Based on NDIA framework for progressive digital skills assessment
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Step 1: Basic Comfort Level
  {
    id: 'basic-comfort-1',
    step: 1,
    category: 'basic-comfort',
    question: "How comfortable do you feel using technology in general?",
    description: "This helps me understand where to start and how to best support you.",
    type: 'single-choice',
    options: [
      { id: 'not-comfortable', label: "Not comfortable at all - I'm very new to this", value: 'none' },
      { id: 'somewhat-comfortable', label: "Somewhat comfortable - I can do basic things", value: 'basic' },
      { id: 'fairly-comfortable', label: "Fairly comfortable - I can figure most things out", value: 'intermediate' },
      { id: 'very-comfortable', label: "Very comfortable - I'm good with technology", value: 'advanced' }
    ],
    validation: { required: true }
  },

  // Step 2: Current Internet Access
  {
    id: 'internet-access-1',
    step: 2,
    category: 'internet-access',
    question: "Do you currently have internet access at home?",
    description: "Understanding your current internet situation helps me provide relevant resources.",
    type: 'single-choice',
    options: [
      { id: 'no-internet', label: "No, I don't have internet at home", value: 'none' },
      { id: 'smartphone-only', label: "Only on my smartphone", value: 'mobile-only' },
      { id: 'limited-internet', label: "Yes, but it's slow or unreliable", value: 'limited' },
      { id: 'good-internet', label: "Yes, I have good internet at home", value: 'good' }
    ],
    validation: { required: true }
  },

  // Step 3: Device Experience
  {
    id: 'device-experience-1',
    step: 3,
    category: 'device-experience',
    question: "Which devices do you use or have access to? (Select all that apply)",
    description: "This helps me suggest resources that work with what you have.",
    type: 'multiple-choice',
    options: [
      { id: 'smartphone', label: "Smartphone", value: 'smartphone' },
      { id: 'tablet', label: "Tablet (like iPad)", value: 'tablet' },
      { id: 'laptop', label: "Laptop computer", value: 'laptop' },
      { id: 'desktop', label: "Desktop computer", value: 'desktop' },
      { id: 'none-own', label: "I don't own any devices", value: 'none' },
      { id: 'library-access', label: "I use computers at the library", value: 'library' }
    ],
    validation: { required: true, minSelections: 1 }
  },

  // Step 4: Basic Digital Skills
  {
    id: 'digital-skills-1',
    step: 4,
    category: 'digital-skills',
    question: "Which of these activities can you do? (Select all that apply)",
    description: "Don't worry if you can't do many of these - that's what I'm here to help with!",
    type: 'multiple-choice',
    options: [
      { id: 'send-text', label: "Send text messages", value: 'texting' },
      { id: 'make-calls', label: "Make phone calls on a smartphone", value: 'calling' },
      { id: 'browse-web', label: "Browse the internet", value: 'web-browsing' },
      { id: 'send-email', label: "Send and receive emails", value: 'email' },
      { id: 'online-shopping', label: "Shop online", value: 'online-shopping' },
      { id: 'video-calls', label: "Make video calls (like FaceTime or Zoom)", value: 'video-calls' },
      { id: 'social-media', label: "Use social media (Facebook, etc.)", value: 'social-media' },
      { id: 'online-banking', label: "Do online banking", value: 'online-banking' },
      { id: 'none-skills', label: "I can't do any of these yet", value: 'none' }
    ],
    validation: { required: true, minSelections: 1 }
  },

  // Step 5: Main Goals
  {
    id: 'learning-goals-1',
    step: 5,
    category: 'learning-goals',
    question: "What would you most like to learn or improve? (Select your top 3 priorities)",
    description: "This helps me focus on what matters most to you.",
    type: 'multiple-choice',
    options: [
      { id: 'basic-computer', label: "Basic computer skills", value: 'basic-computer' },
      { id: 'internet-safety', label: "How to stay safe online", value: 'internet-safety' },
      { id: 'email-communication', label: "Email and communication", value: 'email-communication' },
      { id: 'job-search', label: "Finding jobs online", value: 'job-search' },
      { id: 'healthcare-access', label: "Accessing healthcare services online", value: 'healthcare-access' },
      { id: 'government-services', label: "Using government websites and services", value: 'government-services' },
      { id: 'online-learning', label: "Taking online classes", value: 'online-learning' },
      { id: 'entertainment', label: "Entertainment (videos, music, games)", value: 'entertainment' },
      { id: 'social-connection', label: "Staying connected with family and friends", value: 'social-connection' },
      { id: 'financial-management', label: "Managing money and banking online", value: 'financial-management' },
      { id: 'better-internet', label: "Getting better internet service", value: 'better-internet' }
    ],
    validation: { required: true, minSelections: 1, maxSelections: 3 }
  },

  // Step 6: Current Challenges
  {
    id: 'barriers-1',
    step: 6,
    category: 'barriers',
    question: "What makes technology challenging for you? (Select all that apply)",
    description: "Understanding these challenges helps me provide better support and resources.",
    type: 'multiple-choice',
    options: [
      { id: 'too-expensive', label: "Internet or devices are too expensive", value: 'cost' },
      { id: 'too-complicated', label: "Technology feels too complicated", value: 'complexity' },
      { id: 'no-one-help', label: "I don't have anyone to help me learn", value: 'no-support' },
      { id: 'privacy-concerns', label: "I'm worried about privacy and safety", value: 'privacy-concerns' },
      { id: 'physical-limitations', label: "Physical challenges (vision, hearing, dexterity)", value: 'physical-limitations' },
      { id: 'language-barriers', label: "Language barriers", value: 'language' },
      { id: 'time-constraints', label: "I don't have time to learn", value: 'time' },
      { id: 'bad-experiences', label: "I've had bad experiences with technology", value: 'bad-experiences' },
      { id: 'changes-too-fast', label: "Technology changes too quickly", value: 'rapid-change' },
      { id: 'no-challenges', label: "I don't really have challenges", value: 'none' }
    ],
    validation: { required: true, minSelections: 1 }
  },

  // Step 7: Learning Preferences
  {
    id: 'learning-goals-2',
    step: 7,
    category: 'learning-goals',
    question: "How do you prefer to learn new things?",
    description: "This helps me suggest the best learning resources for you.",
    type: 'single-choice',
    options: [
      { id: 'one-on-one', label: "One-on-one help from a person", value: 'one-on-one' },
      { id: 'small-group', label: "Small group classes", value: 'small-group' },
      { id: 'online-tutorials', label: "Online videos and tutorials", value: 'online-tutorials' },
      { id: 'written-guides', label: "Written step-by-step guides", value: 'written-guides' },
      { id: 'practice-time', label: "Just need time to practice on my own", value: 'self-practice' },
      { id: 'combination', label: "A combination of different ways", value: 'combination' }
    ],
    validation: { required: true }
  }
]

/**
 * Create a new assessment instance
 */
export function createAssessment(userId?: string): DigitalSkillsAssessment {
  return {
    id: `assessment-${Date.now()}`,
    userId,
    currentStep: 1,
    totalSteps: ASSESSMENT_QUESTIONS.length,
    responses: [],
    deviceTypes: [],
    primaryNeeds: [],
    learningPreferences: [],
    specificChallenges: [],
    isComplete: false,
    startedAt: new Date()
  }
}

/**
 * Get the next question in the assessment
 */
export function getNextQuestion(assessment: DigitalSkillsAssessment): AssessmentQuestion | null {
  if (assessment.isComplete || assessment.currentStep > ASSESSMENT_QUESTIONS.length) {
    return null
  }

  return ASSESSMENT_QUESTIONS.find(q => q.step === assessment.currentStep) || null
}

/**
 * Process an assessment response and move to next step
 */
export function processAssessmentResponse(
  assessment: DigitalSkillsAssessment,
  questionId: string,
  answer: string | string[]
): DigitalSkillsAssessment {
  const question = ASSESSMENT_QUESTIONS.find(q => q.id === questionId)
  if (!question) {
    throw new Error('Question not found')
  }

  // Add the response
  const response: AssessmentResponse = {
    questionId,
    question: question.question,
    answer,
    timestamp: new Date()
  }

  // Update assessment based on the response
  const updatedAssessment = { ...assessment }
  updatedAssessment.responses = [...assessment.responses, response]

  // Process specific responses
  if (question.category === 'basic-comfort') {
    updatedAssessment.comfortLevel = Array.isArray(answer) ? answer[0] as any : answer as any
  } else if (question.category === 'device-experience') {
    updatedAssessment.deviceTypes = Array.isArray(answer) ? answer : [answer]
  } else if (question.category === 'learning-goals') {
    if (question.id === 'learning-goals-1') {
      updatedAssessment.primaryNeeds = Array.isArray(answer) ? answer : [answer]
    } else if (question.id === 'learning-goals-2') {
      updatedAssessment.learningPreferences = Array.isArray(answer) ? answer : [answer]
    }
  } else if (question.category === 'barriers') {
    updatedAssessment.specificChallenges = Array.isArray(answer) ? answer : [answer]
  }

  // Move to next step
  updatedAssessment.currentStep += 1

  // Check if assessment is complete
  if (updatedAssessment.currentStep > ASSESSMENT_QUESTIONS.length) {
    updatedAssessment.isComplete = true
    updatedAssessment.completedAt = new Date()
  }

  return updatedAssessment
}

/**
 * Generate recommendations based on completed assessment
 */
export function generateAssessmentRecommendations(assessment: DigitalSkillsAssessment): {
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  recommendedResources: string[]
  nextSteps: string[]
  priority: 'high' | 'medium' | 'low'
} {
  const comfortLevel = assessment.comfortLevel || 'none'
  const primaryNeeds = assessment.primaryNeeds
  const challenges = assessment.specificChallenges
  const devices = assessment.deviceTypes

  // Determine skill level
  let skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  if (comfortLevel === 'advanced') {
    skillLevel = 'advanced'
  } else if (comfortLevel === 'intermediate') {
    skillLevel = 'intermediate'
  }

  // Generate recommendations
  const recommendedResources: string[] = []
  const nextSteps: string[] = []

  // Base recommendations for beginners
  if (skillLevel === 'beginner') {
    recommendedResources.push('Internet Basics for Beginners')
    nextSteps.push('Start with basic computer skills training')
    
    if (devices.includes('none')) {
      recommendedResources.push('Device Access Programs')
      nextSteps.push('Find local programs that provide device access')
    }
  }

  // Internet access recommendations
  if (assessment.responses.find(r => r.answer.includes('none') || r.answer.includes('limited'))) {
    recommendedResources.push('Affordable Connectivity Program')
    recommendedResources.push('Low-Cost Internet Programs')
    nextSteps.push('Apply for internet assistance programs')
  }

  // Specific goal-based recommendations
  if (primaryNeeds.includes('basic-computer')) {
    recommendedResources.push('Computer Basics for Seniors')
    nextSteps.push('Practice basic computer skills weekly')
  }

  if (primaryNeeds.includes('internet-safety')) {
    recommendedResources.push('Online Safety Guide')
    nextSteps.push('Learn about password security and safe browsing')
  }

  if (primaryNeeds.includes('healthcare-access')) {
    recommendedResources.push('Telehealth Resources')
    nextSteps.push('Set up patient portals with your healthcare providers')
  }

  // Challenge-based support
  if (challenges.includes('cost')) {
    recommendedResources.push('Device Assistance Programs')
    nextSteps.push('Research local digital inclusion programs')
  }

  if (challenges.includes('no-support')) {
    recommendedResources.push('Local Digital Navigator Programs')
    nextSteps.push('Find a local digital navigator for one-on-one help')
  }

  // Determine priority based on challenges
  let priority: 'high' | 'medium' | 'low' = 'medium'
  if (challenges.includes('cost') || challenges.includes('no-support') || devices.includes('none')) {
    priority = 'high'
  } else if (skillLevel === 'advanced') {
    priority = 'low'
  }

  return {
    skillLevel,
    recommendedResources,
    nextSteps,
    priority
  }
}

/**
 * Get assessment progress
 */
export function getAssessmentProgress(assessment: DigitalSkillsAssessment): {
  currentStep: number
  totalSteps: number
  percentComplete: number
  isComplete: boolean
} {
  const percentComplete = Math.round((assessment.responses.length / ASSESSMENT_QUESTIONS.length) * 100)
  
  return {
    currentStep: assessment.currentStep,
    totalSteps: ASSESSMENT_QUESTIONS.length,
    percentComplete,
    isComplete: assessment.isComplete
  }
} 