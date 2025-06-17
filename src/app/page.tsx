// import { Chat } from '@/components/Chat'
// import { KnowledgeManager } from '@/components/KnowledgeManager'
import { ChatEmbed } from '@/components/ChatEmbed'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Example website content */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Arizona Broadband</h1>
          <p className="mt-2 text-blue-100">Connecting communities across the state</p>
        </div>
      </header>

      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome to AZ-1 Broadband Information</h2>
          <p className="text-lg text-gray-700 mb-6">
            This is an example website showcasing our embedded AI chatbot. The chatbot can help answer questions 
            about broadband availability, digital literacy, and technology resources in Arizona.
          </p>
          <p className="text-lg text-gray-700 mb-6">
            Click the chat icon in the bottom right corner to start a conversation with our Digital Navigator assistant.
          </p>

          <div className="bg-gray-100 p-6 rounded-lg shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">About Our Digital Navigator</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Get help with understanding broadband internet options</li>
              <li>Learn about digital skills and resources</li>
              <li>Find affordable internet programs in Arizona</li>
              <li>Get technical support for common internet issues</li>
              <li>Take a digital skills assessment for personalized recommendations</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800">What is broadband internet?</h3>
                <p className="mt-2 text-gray-700">Broadband refers to high-speed internet access that is always on and faster than traditional dial-up access.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800">How can I find affordable internet in my area?</h3>
                <p className="mt-2 text-gray-700">Our chatbot can help you find affordable options based on your location in Arizona, including special programs and discounts.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800">What is the Affordable Connectivity Program?</h3>
                <p className="mt-2 text-gray-700">The Affordable Connectivity Program is a federal benefit that helps ensure households can afford the broadband they need for work, school, healthcare and more.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat embed component */}
      <ChatEmbed />
    </main>
  )
}
