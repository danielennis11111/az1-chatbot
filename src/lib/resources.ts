import { Resource } from '@/types/chat'

// Sample resources - in production this would come from a database or CMS
export const RESOURCES: Resource[] = [
  // Digital Literacy - Beginner
  {
    id: 'dl-basics-1',
    title: 'Internet Basics for Beginners',
    description: 'Learn what the internet is and how it works in simple terms. Perfect for those who are just getting started.',
    url: 'https://digitallearn.org/courses/internet-basics',
    category: 'digital-literacy',
    audience: 'beginner',
    tags: ['internet', 'basics', 'getting-started'],
    source: 'DigitalLearn.org'
  },
  {
    id: 'dl-basics-2', 
    title: 'Computer Basics for Seniors',
    description: 'Step-by-step guide to using computers, designed specifically for older adults who are new to technology.',
    url: 'https://seniorplanet.org/computer-basics/',
    category: 'digital-literacy',
    audience: 'beginner',
    tags: ['computer', 'seniors', 'basics'],
    source: 'Senior Planet'
  },
  
  // Broadband Information
  {
    id: 'bb-what-is-1',
    title: 'What is Broadband Internet?',
    description: 'Clear explanation of broadband internet, different types of connections, and what speeds mean for everyday use.',
    url: 'https://www.fcc.gov/consumers/guides/getting-broadband',
    category: 'broadband',
    audience: 'everyone',
    tags: ['broadband', 'explanation', 'types', 'speeds'],
    source: 'FCC'
  },
  {
    id: 'bb-check-availability',
    title: 'Check Broadband Availability',
    description: 'Find out what internet services are available in your area and compare options.',
    url: 'https://broadbandmap.fcc.gov/',
    category: 'broadband',
    audience: 'everyone',
    tags: ['availability', 'map', 'providers', 'arizona'],
    source: 'FCC Broadband Map'
  },

  // Affordability Programs
  {
    id: 'aff-acp-1',
    title: 'Affordable Connectivity Program (ACP)',
    description: 'Learn about the federal program that helps eligible households save on broadband internet service.',
    url: 'https://www.fcc.gov/acp',
    category: 'affordability',
    audience: 'everyone',
    tags: ['affordable', 'program', 'federal', 'subsidy'],
    source: 'FCC'
  },
  {
    id: 'aff-lowcost-1',
    title: 'Low-Cost Internet Programs',
    description: 'Directory of internet service providers offering discounted rates for qualifying households.',
    url: 'https://www.internetessentials.com/',
    category: 'affordability',
    audience: 'everyone',
    tags: ['low-cost', 'discount', 'qualifying'],
    source: 'Internet Essentials'
  },

  // Device Help
  {
    id: 'dev-tablets-1',
    title: 'Getting Started with Tablets',
    description: 'Learn how to use tablets (iPad, Android) for internet browsing, email, and basic apps.',
    url: 'https://digitallearn.org/courses/tablets',
    category: 'devices',
    audience: 'beginner',
    tags: ['tablet', 'ipad', 'android', 'mobile'],
    source: 'DigitalLearn.org'
  },
  {
    id: 'dev-smartphone-1',
    title: 'Smartphone Basics',
    description: 'Master the fundamentals of using smartphones for calls, texts, internet, and apps.',
    url: 'https://digitallearn.org/courses/smartphone-basics',
    category: 'devices',
    audience: 'beginner',
    tags: ['smartphone', 'mobile', 'apps', 'basics'],
    source: 'DigitalLearn.org'
  },

  // Technical Support
  {
    id: 'tech-troubleshoot-1',
    title: 'Basic Internet Troubleshooting',
    description: 'Simple steps to fix common internet connection problems at home.',
    url: 'https://www.wikihow.com/Fix-Your-Internet-Connection',
    category: 'technical-support',
    audience: 'intermediate',
    tags: ['troubleshooting', 'wifi', 'connection', 'problems'],
    source: 'WikiHow'
  },

  // Arizona Specific
  {
    id: 'az-broadband-1',
    title: 'Arizona Broadband Map',
    description: 'Interactive map showing broadband availability and speeds across Arizona counties.',
    url: 'https://az-1.info',
    category: 'mapping',
    audience: 'everyone',
    tags: ['arizona', 'map', 'availability', 'counties'],
    source: 'AZ-1.info'
  },
  {
    id: 'az-digital-equity',
    title: 'Arizona Digital Equity Resources',
    description: 'State-specific programs and resources for improving digital access and literacy in Arizona.',
    url: 'https://azcommerce.com/broadband/',
    category: 'digital-literacy',
    audience: 'everyone',
    tags: ['arizona', 'digital-equity', 'state-programs'],
    source: 'Arizona Commerce Authority'
  }
]

/**
 * Search for resources based on query, category, and audience
 */
export function searchResources(
  query: string = '',
  category?: Resource['category'],
  audience?: Resource['audience'],
  limit: number = 5
): Resource[] {
  const queryLower = query.toLowerCase()
  
  let filtered = RESOURCES.filter(resource => {
    // Category filter
    if (category && resource.category !== category) return false
    
    // Audience filter (show 'everyone' resources to all audiences)
    if (audience && resource.audience !== audience && resource.audience !== 'everyone') return false
    
    // Query search in title, description, and tags
    if (query) {
      const searchText = `${resource.title} ${resource.description} ${resource.tags.join(' ')}`.toLowerCase()
      if (!searchText.includes(queryLower)) return false
    }
    
    return true
  })
  
  // Sort by relevance (simple scoring)
  if (query) {
    filtered = filtered.sort((a, b) => {
      const scoreA = getRelevanceScore(a, queryLower)
      const scoreB = getRelevanceScore(b, queryLower)
      return scoreB - scoreA
    })
  }
  
  return filtered.slice(0, limit)
}

/**
 * Get resources by category
 */
export function getResourcesByCategory(category: Resource['category'], audience?: Resource['audience']): Resource[] {
  return RESOURCES.filter(resource => {
    if (resource.category !== category) return false
    if (audience && resource.audience !== audience && resource.audience !== 'everyone') return false
    return true
  })
}

/**
 * Get featured resources for beginners
 */
export function getBeginnerResources(): Resource[] {
  return RESOURCES.filter(resource => 
    resource.audience === 'beginner' || 
    (resource.audience === 'everyone' && resource.tags.includes('basics'))
  ).slice(0, 4)
}

/**
 * Simple relevance scoring for search results
 */
function getRelevanceScore(resource: Resource, query: string): number {
  let score = 0
  
  // Title matches are highest priority
  if (resource.title.toLowerCase().includes(query)) score += 10
  
  // Description matches
  if (resource.description.toLowerCase().includes(query)) score += 5
  
  // Tag matches
  resource.tags.forEach(tag => {
    if (tag.toLowerCase().includes(query)) score += 3
  })
  
  return score
}

/**
 * Get recommended resources based on user's expressed needs
 */
export function getRecommendedResources(
  userMessage: string,
  skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Resource[] {
  const message = userMessage.toLowerCase()
  
  // Detect topics from user message
  const topics = {
    broadband: /broadband|internet|connection|speed|provider/i.test(message),
    affordability: /afford|cheap|low.?cost|money|expensive|budget/i.test(message),
    devices: /phone|tablet|computer|device|laptop/i.test(message),
    basics: /learn|start|begin|basic|how.?to|don.?t.?know/i.test(message),
    troubleshoot: /problem|not.?working|fix|trouble|broken/i.test(message),
    arizona: /arizona|az|county|local/i.test(message)
  }
  
  let recommendations: Resource[] = []
  
  // Add resources based on detected topics
  if (topics.broadband) {
    recommendations.push(...getResourcesByCategory('broadband', skillLevel === 'beginner' ? 'beginner' : undefined))
  }
  
  if (topics.affordability) {
    recommendations.push(...getResourcesByCategory('affordability'))
  }
  
  if (topics.devices) {
    recommendations.push(...getResourcesByCategory('devices', skillLevel === 'beginner' ? 'beginner' : undefined))
  }
  
  if (topics.basics || skillLevel === 'beginner') {
    recommendations.push(...getBeginnerResources())
  }
  
  if (topics.troubleshoot) {
    recommendations.push(...getResourcesByCategory('technical-support'))
  }
  
  if (topics.arizona) {
    recommendations.push(...RESOURCES.filter(r => r.tags.includes('arizona')))
  }
  
  // Remove duplicates and limit results
  const unique = recommendations.filter((resource, index, array) => 
    array.findIndex(r => r.id === resource.id) === index
  )
  
  return unique.slice(0, 6)
}

/**
 * Get resources from the content catalog based on the query
 * This function integrates with the RAG system to find relevant resources
 * from the content catalog PDF
 */
export async function getContentCatalogResources(query: string): Promise<Resource[]> {
  try {
    // Import dynamically to avoid circular dependencies
    const { queryKnowledgeBase } = await import('./rag')
    
    // Query the knowledge base for relevant documents
    const relevantDocs = await queryKnowledgeBase(query, 3)
    
    // Convert documents to resources
    const catalogResources: Resource[] = relevantDocs
      .filter(doc => {
        // Only include documents from the content catalog
        const source = doc.metadata.source || ''
        const filename = doc.metadata.filename || ''
        return source.includes('Content Catalog') || filename.includes('Content Catalog')
      })
      .map((doc, index) => {
        // Extract information from the document
        const content = doc.pageContent
        
        // Try to extract a title from the content
        let title = 'Content Catalog Resource'
        const titleMatch = content.match(/(?:title|resource|program):\s*([^\n.]+)/i)
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].trim()
        }
        
        // Try to extract a URL
        let url = 'https://az-1.info'
        const urlMatch = content.match(/(?:https?:\/\/[^\s]+)/i)
        if (urlMatch) {
          url = urlMatch[0]
        }
        
        return {
          id: `catalog-${index}`,
          title: title,
          description: content.substring(0, 150) + '...',
          url: url,
          category: 'broadband',
          audience: 'everyone',
          tags: ['content-catalog', 'arizona', 'broadband'],
          source: 'AZ-1 Content Catalog'
        }
      })
    
    return catalogResources
  } catch (error) {
    console.error('Error getting content catalog resources:', error)
    return []
  }
}

/**
 * Enhanced version of getRecommendedResources that includes content catalog resources
 */
export async function getEnhancedRecommendedResources(
  userMessage: string,
  skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Promise<Resource[]> {
  // Get standard recommendations
  const standardRecommendations = getRecommendedResources(userMessage, skillLevel)
  
  try {
    // Get content catalog recommendations
    const catalogRecommendations = await getContentCatalogResources(userMessage)
    
    // Combine and deduplicate (prioritize catalog resources)
    const combined = [...catalogRecommendations]
    
    // Add standard recommendations that don't overlap with catalog ones
    for (const stdRec of standardRecommendations) {
      if (!combined.some(rec => rec.title === stdRec.title || rec.url === stdRec.url)) {
        combined.push(stdRec)
      }
    }
    
    // Return top recommendations (max 5)
    return combined.slice(0, 5)
  } catch (error) {
    console.error('Error getting enhanced recommendations:', error)
    return standardRecommendations
  }
} 