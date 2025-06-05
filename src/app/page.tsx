import { Chat } from '@/components/Chat'
import { KnowledgeManager } from '@/components/KnowledgeManager'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Arizona Digital Navigator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your helpful guide to broadband information, digital literacy, and technology resources in Arizona. 
            We're here to help everyone - from complete beginners to advanced users - navigate the digital world.
          </p>
        </div>
        
        <div className="space-y-8">
          <Chat />
          
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-100 p-4 text-lg font-medium text-gray-900">
              <span>Knowledge Base Management</span>
              <span className="shrink-0 rounded-full bg-white p-1.5 text-gray-900 sm:p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </summary>

            <div className="mt-4">
              <KnowledgeManager />
            </div>
          </details>
        </div>
      </div>
    </main>
  )
}
