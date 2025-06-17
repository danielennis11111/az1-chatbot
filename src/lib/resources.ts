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

  // Affordability Programs - Updated with current programs
  {
    id: 'aff-lifeline-1',
    title: 'Lifeline Program',
    description: 'Federal program providing monthly discounts on phone and internet service for qualifying low-income households. Still active and accepting applications.',
    url: 'https://www.fcc.gov/lifeline-consumers',
    category: 'affordability',
    audience: 'everyone',
    tags: ['affordable', 'program', 'federal', 'lifeline', 'active'],
    source: 'FCC'
  },
  {
    id: 'aff-isp-programs-1',
    title: 'Internet Provider Low-Cost Programs',
    description: 'Many internet providers offer their own affordable internet programs. Check with local providers like Cox, CenturyLink, and others for current offerings.',
    url: 'https://www.cox.com/residential/internet/cox-internet-essential.html',
    category: 'affordability',
    audience: 'everyone',
    tags: ['low-cost', 'discount', 'qualifying', 'cox', 'centurylink'],
    source: 'Internet Service Providers'
  },
  {
    id: 'aff-emergency-broadband-info',
    title: 'Important: ACP Program Has Ended',
    description: 'The Affordable Connectivity Program (ACP) ended funding in June 2024. However, the Lifeline program and provider-specific programs are still available.',
    url: 'https://www.fcc.gov/acp',
    category: 'affordability',
    audience: 'everyone',
    tags: ['acp', 'ended', 'discontinued', 'lifeline', 'alternatives'],
    source: 'FCC'
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
    
    // Query the knowledge base for relevant documents with higher limit for content catalog
    const relevantDocs = await queryKnowledgeBase(query, 15)
    
    // Convert documents to resources
    const catalogResources: Resource[] = []
    
    relevantDocs
      .filter(doc => {
        // Only include documents from the content catalog
        const isFromCatalog = doc.metadata.isContentCatalog || 
                             (doc.metadata.source || '').includes('Content Catalog') || 
                             (doc.metadata.filename || '').includes('Content Catalog')
        return isFromCatalog
      })
      .forEach((doc, index) => {
        // Extract information from the document
        const content = doc.pageContent
        
        // Try to parse multiple resources from a single chunk
        const resourceEntries = parseResourceEntries(content)
        
        resourceEntries.forEach((entry, entryIndex) => {
          catalogResources.push({
            id: `catalog-${index}-${entryIndex}`,
            title: entry.title,
            description: entry.description,
            url: entry.url,
            category: entry.category,
            audience: entry.audience,
            tags: ['content-catalog', 'arizona', 'broadband', ...entry.tags],
            source: 'AZ-1 Content Catalog'
          })
        })
      })
    
    // Remove duplicates based on title and URL
    const uniqueResources = catalogResources.filter((resource, index, array) => 
      array.findIndex(r => r.title === resource.title || r.url === resource.url) === index
    )
    
    console.log(`Found ${uniqueResources.length} unique resources from content catalog`)
    
    return uniqueResources.slice(0, 10) // Return up to 10 resources
  } catch (error) {
    console.error('Error getting content catalog resources:', error)
    return []
  }
}

/**
 * Parse individual resource entries from content catalog text
 */
function parseResourceEntries(content: string): Array<{
  title: string;
  description: string;
  url: string;
  category: Resource['category'];
  audience: Resource['audience'];
  tags: string[];
}> {
  const entries: Array<{
    title: string;
    description: string;
    url: string;
    category: Resource['category'];
    audience: Resource['audience'];
    tags: string[];
  }> = []
  
  // Split content by potential entry boundaries
  const lines = content.split('\n')
  let currentEntry: string[] = []
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Check if this looks like a new entry
    if (trimmedLine.match(/^(Title|Resource|Program|Service|Name):/i) && currentEntry.length > 0) {
      // Process the previous entry
      const entryText = currentEntry.join('\n')
      const parsed = parseSingleEntry(entryText)
      if (parsed) entries.push(parsed)
      
      // Start new entry
      currentEntry = [trimmedLine]
    } else if (trimmedLine.length > 0) {
      currentEntry.push(trimmedLine)
    }
  }
  
  // Process the last entry
  if (currentEntry.length > 0) {
    const entryText = currentEntry.join('\n')
    const parsed = parseSingleEntry(entryText)
    if (parsed) entries.push(parsed)
  }
  
  // If no structured entries found, create one from the whole content
  if (entries.length === 0) {
    const parsed = parseSingleEntry(content)
    if (parsed) entries.push(parsed)
  }
  
  return entries
}

/**
 * Parse a single resource entry from text
 */
function parseSingleEntry(text: string): {
  title: string;
  description: string;
  url: string;
  category: Resource['category'];
  audience: Resource['audience'];
  tags: string[];
} | null {
  if (text.trim().length < 20) return null
  
  // Extract title
  let title = 'Resource from Content Catalog'
  const titleMatch = text.match(/(?:title|resource|program|service|name):\s*([^\n]+)/i)
  if (titleMatch) {
    title = titleMatch[1].trim()
  } else {
    // Try to get first meaningful line as title
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    if (lines.length > 0) {
      title = lines[0].trim().substring(0, 80)
    }
  }
  
  // Extract URL
  let url = 'https://az-1.info'
  const urlMatch = text.match(/(https?:\/\/[^\s\)]+)/i)
  if (urlMatch) {
    url = urlMatch[1]
  }
  
  // Create description (use full text but limit length)
  let description = text.replace(/(?:title|resource|program|service|name):\s*[^\n]+/i, '').trim()
  if (description.length > 200) {
    description = description.substring(0, 200) + '...'
  }
  
  // Determine category based on content
  let category: Resource['category'] = 'broadband'
  const lowerText = text.toLowerCase()
  if (lowerText.includes('digital literacy') || lowerText.includes('computer skills')) {
    category = 'digital-literacy'
  } else if (lowerText.includes('device') || lowerText.includes('tablet') || lowerText.includes('phone')) {
    category = 'devices'
  } else if (lowerText.includes('affordable') || lowerText.includes('low cost') || lowerText.includes('free')) {
    category = 'affordability'
  } else if (lowerText.includes('support') || lowerText.includes('help') || lowerText.includes('technical')) {
    category = 'technical-support'
  }
  
  // Determine audience
  let audience: Resource['audience'] = 'everyone'
  if (lowerText.includes('beginner') || lowerText.includes('senior') || lowerText.includes('basic')) {
    audience = 'beginner'
  } else if (lowerText.includes('advanced') || lowerText.includes('technical')) {
    audience = 'advanced'
  }
  
  // Extract tags
  const tags: string[] = []
  if (lowerText.includes('senior')) tags.push('seniors')
  if (lowerText.includes('spanish') || lowerText.includes('bilingual')) tags.push('spanish')
  if (lowerText.includes('rural')) tags.push('rural')
  if (lowerText.includes('urban')) tags.push('urban')
  if (lowerText.includes('free')) tags.push('free')
  if (lowerText.includes('training')) tags.push('training')
  
  return {
    title,
    description,
    url,
    category,
    audience,
    tags
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