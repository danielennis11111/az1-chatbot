import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { origin } = new URL(req.url)
  
  const embedScript = `
(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    apiEndpoint: '${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://az1-chatbot-736861725983.us-central1.run.app'}/api/embed/stream',
    configEndpoint: '${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://az1-chatbot-736861725983.us-central1.run.app'}/api/embed/config',
    embedKey: '${process.env.EMBED_API_KEY || 'demo-key-123'}',
  };

  // Check if already loaded
  if (window.AZ1ChatbotLoaded) return;
  window.AZ1ChatbotLoaded = true;

  let config = {};
  let isOpen = false;
  let messages = [];

  // Default configuration (can be overridden by window.AZ1ChatbotConfig)
  const defaultConfig = {
    theme: 'blue',
    position: 'right',
    welcomeMessage: "Hi! I'm your Arizona Digital Navigator. How can I help you with broadband and digital skills today?",
    placeholder: 'Type your message here...',
    sendButton: 'Send',
    primaryColor: '#00797D',
    secondaryColor: '#634B7B',
  };

  // Merge with user config
  config = { ...defaultConfig, ...(window.AZ1ChatbotConfig || {}) };

  // Create styles
  const styles = \`
    #az1-chatbot-widget {
      position: fixed;
      bottom: 20px;
      \${config.position === 'left' ? 'left: 20px;' : 'right: 20px;'}
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    #az1-chatbot-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, \${config.primaryColor}, \${config.secondaryColor});
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      color: white;
      font-size: 24px;
    }
    
    #az1-chatbot-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(0,0,0,0.2);
    }
    
    #az1-chatbot-container {
      position: absolute;
      bottom: 80px;
      \${config.position === 'left' ? 'left: 0;' : 'right: 0;'}
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    
    #az1-chatbot-header {
      background: linear-gradient(135deg, \${config.primaryColor}, \${config.secondaryColor});
      color: white;
      padding: 15px 20px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    #az1-chatbot-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #az1-chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .az1-message {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 18px;
      word-wrap: break-word;
    }
    
    .az1-message.user {
      background: \${config.primaryColor};
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    
    .az1-message.assistant {
      background: #f1f1f1;
      color: #333;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    
    #az1-chatbot-input-container {
      padding: 15px 20px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 10px;
    }
    
    #az1-chatbot-input {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 10px 15px;
      outline: none;
      font-size: 14px;
    }
    
    #az1-chatbot-send {
      background: \${config.primaryColor};
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    
    .az1-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
    }
    
    .az1-typing-dot {
      width: 8px;
      height: 8px;
      background: #999;
      border-radius: 50%;
      animation: az1-typing 1.4s infinite ease-in-out;
    }
    
    .az1-typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .az1-typing-dot:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes az1-typing {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
  \`;

  // Add styles to page
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create widget HTML
  const widgetHTML = \`
    <div id="az1-chatbot-widget">
      <button id="az1-chatbot-button" aria-label="Open chat">💬</button>
      <div id="az1-chatbot-container">
        <div id="az1-chatbot-header">
          <span>Arizona Digital Navigator</span>
          <button id="az1-chatbot-close" aria-label="Close chat">×</button>
        </div>
        <div id="az1-chatbot-messages"></div>
        <div id="az1-chatbot-input-container">
          <input type="text" id="az1-chatbot-input" placeholder="\${config.placeholder}" />
          <button id="az1-chatbot-send" aria-label="Send message">→</button>
        </div>
      </div>
    </div>
  \`;

  // Add widget to page
  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  // Get elements
  const button = document.getElementById('az1-chatbot-button');
  const container = document.getElementById('az1-chatbot-container');
  const closeBtn = document.getElementById('az1-chatbot-close');
  const messagesDiv = document.getElementById('az1-chatbot-messages');
  const input = document.getElementById('az1-chatbot-input');
  const sendBtn = document.getElementById('az1-chatbot-send');

  // Toggle chat
  function toggleChat() {
    isOpen = !isOpen;
    container.style.display = isOpen ? 'flex' : 'none';
    button.textContent = isOpen ? '×' : '💬';
    
    if (isOpen && messages.length === 0) {
      addMessage('assistant', config.welcomeMessage);
    }
  }

  // Add message to chat
  function addMessage(role, content) {
    messages.push({ role, content });
    const messageDiv = document.createElement('div');
    messageDiv.className = \`az1-message \${role}\`;
    messageDiv.textContent = content;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'az1-message assistant az1-typing';
    typingDiv.innerHTML = '<div class="az1-typing-dot"></div><div class="az1-typing-dot"></div><div class="az1-typing-dot"></div>';
    typingDiv.id = 'az1-typing-indicator';
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    const typingDiv = document.getElementById('az1-typing-indicator');
    if (typingDiv) typingDiv.remove();
  }

  // Send message
  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    addMessage('user', message);
    showTyping();

    try {
      const response = await fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          embedKey: CONFIG.embedKey
        })
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      hideTyping();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                assistantMessage += data.text;
                // Update the last message in real-time
                const lastMessage = messagesDiv.querySelector('.az1-message.assistant:last-child');
                if (lastMessage && !lastMessage.classList.contains('az1-typing')) {
                  lastMessage.textContent = assistantMessage;
                } else {
                  addMessage('assistant', assistantMessage);
                }
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }

      if (assistantMessage) {
        messages.push({ role: 'assistant', content: assistantMessage });
      }

    } catch (error) {
      hideTyping();
      console.error('Chat error:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
  }

  // Event listeners
  button.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Auto-focus input when opened
  const observer = new MutationObserver(() => {
    if (container.style.display === 'flex') {
      input.focus();
    }
  });
  observer.observe(container, { attributes: true, attributeFilter: ['style'] });

})();
`;

  return new NextResponse(embedScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
} 