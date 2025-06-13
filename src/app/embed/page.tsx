import { ChatEmbed } from '@/components/ChatEmbed'

export default function EmbedExample() {
  return (
    <main className="min-h-screen bg-white">
      <header className="bg-gray-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Example External Website</h1>
          <p className="mt-2 text-gray-300">This shows how the chatbot can be embedded in any website</p>
        </div>
      </header>

      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Embedding Instructions</h2>
          <p className="text-lg text-gray-700 mb-6">
            To embed the Arizona Digital Navigator chatbot in your website, follow these steps:
          </p>

          <div className="bg-gray-100 p-6 rounded-lg shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Step 1: Add the Script</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
              {`<script src="https://az-1.info/chatbot-embed.js" defer></script>`}
            </pre>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Step 2: Add the Container</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
              {`<div id="az1-chatbot-container"></div>`}
            </pre>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Step 3: Customize (Optional)</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
              {`<script>
  window.AZ1ChatbotConfig = {
    theme: "blue", // blue, green, or gray
    position: "right", // right or left
    welcomeMessage: "How can I help you with broadband today?"
  };
</script>`}
            </pre>
          </div>

          <p className="text-lg text-gray-700 mb-6">
            That's it! The chatbot will appear as a floating button in the corner of your website.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Example</h2>
            <p className="text-lg text-gray-700 mb-6">
              This page includes a live example of the embedded chatbot. Click the chat icon in the bottom right corner to try it out.
            </p>
          </div>
        </div>
      </section>

      {/* Chat embed component */}
      <ChatEmbed />
    </main>
  )
} 