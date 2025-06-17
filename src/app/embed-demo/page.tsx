import Script from 'next/script'

export default function EmbedDemo() {
  return (
    <>
      {/* This demonstrates how a third-party website would include the chatbot */}
      <Script id="az1-chatbot-config" strategy="beforeInteractive">
        {`
          window.AZ1ChatbotConfig = {
            apiKey: 'demo-key-123', // This would be provided to customers
            theme: 'teal',
            position: 'bottom-right',
            welcomeMessage: 'Hi! I\\'m your Arizona Digital Navigator. How can I help you today?',
            autoOpen: false,
            zIndex: 999999,
          };
        `}
      </Script>
      
      <Script 
        src="/embed.js" 
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Third-Party Website Demo</h1>
            <p className="mt-2 text-gray-600">
              This demonstrates how the Arizona Digital Navigator chatbot appears on any website
            </p>
          </div>
        </header>

        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Embed the Chatbot</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-teal-500 pl-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Step 1: Configure the Chatbot</h3>
                  <p className="text-gray-600 mb-4">Add this configuration script before loading the chatbot:</p>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`<script>
  window.AZ1ChatbotConfig = {
    apiKey: 'your-api-key-here',
    theme: 'teal',
    position: 'bottom-right',
    welcomeMessage: 'Hi! How can I help you today?',
    autoOpen: false
  };
</script>`}
                  </pre>
                </div>

                <div className="border-l-4 border-teal-500 pl-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Step 2: Load the Chatbot Script</h3>
                  <p className="text-gray-600 mb-4">Add this script tag to your website:</p>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed.js" defer></script>`}
                  </pre>
                </div>

                <div className="border-l-4 border-orange-500 pl-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Production Setup</h3>
                  <div className="space-y-3">
                    <p className="text-gray-600">For production deployment:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>Replace <code className="bg-gray-100 px-2 py-1 rounded">your-api-key-here</code> with your actual API key</li>
                      <li>Store your API key securely in your Google Cloud project</li>
                      <li>Add your domain to the allowed origins list</li>
                      <li>Update the script URL to your production domain</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Demo</h2>
              <p className="text-gray-600 mb-4">
                The chatbot is now active on this page! Look for the floating chat button in the bottom-right corner.
              </p>
              
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-teal-800 mb-3">Try It Out:</h3>
                <ul className="list-disc list-inside text-teal-700 space-y-2">
                  <li>Click the chat button to open the conversation</li>
                  <li>Ask about broadband internet options in Arizona</li>
                  <li>Request help with digital skills or technology</li>
                  <li>Take the digital skills assessment</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast & Responsive</h3>
                  <p className="text-gray-600">Lightweight widget that loads quickly and responds instantly</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure & Reliable</h3>
                  <p className="text-gray-600">Enterprise-grade security with domain validation and API key protection</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-4h.01M5 21h.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Easy Integration</h3>
                  <p className="text-gray-600">Simple 2-line setup - no complex configuration required</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
} 