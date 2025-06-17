(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.AZ1ChatbotLoaded) return;
  window.AZ1ChatbotLoaded = true;

  // Default configuration
  const defaultConfig = {
    apiKey: null, // This will be provided by the customer
    theme: 'teal',
    position: 'bottom-right',
    welcomeMessage: null,
    autoOpen: false,
    zIndex: 999999,
  };

  // Merge user config with defaults
  const config = Object.assign({}, defaultConfig, window.AZ1ChatbotConfig || {});

  // API endpoint - will be fetched from config endpoint
  let apiEndpoint = '';
  let embedConfig = {};

  // Create the chat widget
  function createChatWidget() {
    // Create the floating button
    const button = document.createElement('div');
    button.id = 'az1-chatbot-button';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
        <path d="M8 12C8 13.1 8.9 14 10 14C11.1 14 12 13.1 12 12C12 10.9 11.1 10 10 10C8.9 10 8 10.9 8 12Z" fill="currentColor"/>
        <path d="M14 12C14 13.1 14.9 14 16 14C17.1 14 18 13.1 18 12C18 10.9 17.1 10 16 10C14.9 10 14 10.9 14 12Z" fill="currentColor"/>
        <path d="M12 16C13.5 16 14.8 15.2 15.5 14H8.5C9.2 15.2 10.5 16 12 16Z" fill="currentColor"/>
      </svg>
    `;
    button.style.cssText = `
      position: fixed;
      ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      ${config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
      width: 60px;
      height: 60px;
      background: ${embedConfig.theme?.primaryColor || '#00797D'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: ${embedConfig.ui?.shadow || '0 4px 12px rgba(0,0,0,0.15)'};
      z-index: ${config.zIndex};
      color: white;
      transition: all 0.3s ease;
      border: none;
      outline: none;
    `;

    // Create the chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'az1-chatbot-window';
    chatWindow.style.cssText = `
      position: fixed;
      ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      ${config.position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;'}
      width: 400px;
      height: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: ${embedConfig.ui?.borderRadius || '12px'};
      box-shadow: ${embedConfig.ui?.shadow || '0 10px 40px rgba(0,0,0,0.1)'};
      z-index: ${config.zIndex + 1};
      display: none;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border: 1px solid #e1e5e9;
    `;

    // Chat header
    const header = document.createElement('div');
    header.style.cssText = `
      background: ${embedConfig.theme?.primaryColor || '#00797D'};
      color: white;
      padding: 16px;
      border-radius: ${embedConfig.ui?.borderRadius || '12px'} ${embedConfig.ui?.borderRadius || '12px'} 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    header.innerHTML = `
      <div style="display: flex; align-items: center;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 12px;">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"/>
          <path d="M8 12C8 13.1 8.9 14 10 14C11.1 14 12 13.1 12 12C12 10.9 11.1 10 10 10C8.9 10 8 10.9 8 12Z"/>
          <path d="M14 12C14 13.1 14.9 14 16 14C17.1 14 18 13.1 18 12C18 10.9 17.1 10 16 10C14.9 10 14 10.9 14 12Z"/>
          <path d="M12 16C13.5 16 14.8 15.2 15.5 14H8.5C9.2 15.2 10.5 16 12 16Z"/>
        </svg>
        <span style="font-weight: 600;">Arizona Digital Navigator</span>
      </div>
      <button id="az1-chatbot-close" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    `;

    // Chat messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'az1-chatbot-messages';
    messagesContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    // Welcome message
    if (embedConfig.messages?.welcomeMessage) {
      const welcomeMsg = document.createElement('div');
      welcomeMsg.style.cssText = `
        background: #f1f3f4;
        padding: 12px;
        border-radius: 18px 18px 18px 4px;
        max-width: 80%;
        color: #333;
        line-height: 1.4;
      `;
      welcomeMsg.textContent = embedConfig.messages.welcomeMessage;
      messagesContainer.appendChild(welcomeMsg);
    }

    // Chat input area
    const inputArea = document.createElement('div');
    inputArea.style.cssText = `
      padding: 16px;
      border-top: 1px solid #e1e5e9;
      display: flex;
      gap: 8px;
      align-items: center;
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = embedConfig.messages?.placeholder || 'Type your message...';
    input.style.cssText = `
      flex: 1;
      padding: 12px;
      border: 1px solid #e1e5e9;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
    `;

    const sendButton = document.createElement('button');
    sendButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
      </svg>
    `;
    sendButton.style.cssText = `
      width: 40px;
      height: 40px;
      background: ${embedConfig.theme?.primaryColor || '#00797D'};
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `;

    inputArea.appendChild(input);
    inputArea.appendChild(sendButton);

    // Assemble chat window
    chatWindow.appendChild(header);
    chatWindow.appendChild(messagesContainer);
    chatWindow.appendChild(inputArea);

    // Add to DOM
    document.body.appendChild(button);
    document.body.appendChild(chatWindow);

    // Event listeners
    button.addEventListener('click', () => {
      chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
      if (chatWindow.style.display === 'flex') {
        input.focus();
      }
    });

    header.querySelector('#az1-chatbot-close').addEventListener('click', () => {
      chatWindow.style.display = 'none';
    });

    // Message sending
    const sendMessage = async () => {
      const message = input.value.trim();
      if (!message) return;

      // Add user message to chat
      addMessage(message, 'user');
      input.value = '';

      // Show typing indicator
      const typingIndicator = addTypingIndicator();

      try {
        // Send to API
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: message }
            ],
            embedKey: config.apiKey
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Remove typing indicator
        removeTypingIndicator(typingIndicator);

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';

        const assistantMessageElement = addMessage('', 'assistant');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  assistantMessage += data.content;
                  assistantMessageElement.innerHTML = formatMessage(assistantMessage);
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }

      } catch (error) {
        removeTypingIndicator(typingIndicator);
        addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        console.error('Chat error:', error);
      }
    };

    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    // Auto-open if configured
    if (config.autoOpen) {
      setTimeout(() => {
        chatWindow.style.display = 'flex';
      }, 1000);
    }
  }

  // Helper functions
  function addMessage(content, role) {
    const messagesContainer = document.getElementById('az1-chatbot-messages');
    const messageDiv = document.createElement('div');
    
    messageDiv.style.cssText = `
      max-width: 80%;
      padding: 12px;
      border-radius: 18px;
      line-height: 1.4;
      word-wrap: break-word;
      ${role === 'user' 
        ? `background: ${embedConfig.theme?.primaryColor || '#00797D'}; color: white; align-self: flex-end; border-radius: 18px 18px 4px 18px;`
        : 'background: #f1f3f4; color: #333; align-self: flex-start; border-radius: 18px 18px 18px 4px;'
      }
    `;

    messageDiv.innerHTML = formatMessage(content);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
  }

  function addTypingIndicator() {
    const messagesContainer = document.getElementById('az1-chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.style.cssText = `
      max-width: 80%;
      padding: 12px;
      border-radius: 18px 18px 18px 4px;
      background: #f1f3f4;
      color: #666;
      align-self: flex-start;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    typingDiv.innerHTML = `
      <span>Typing</span>
      <div style="display: flex; gap: 2px;">
        <div style="width: 4px; height: 4px; background: #666; border-radius: 50%; animation: typing 1.4s infinite ease-in-out;"></div>
        <div style="width: 4px; height: 4px; background: #666; border-radius: 50%; animation: typing 1.4s infinite ease-in-out 0.2s;"></div>
        <div style="width: 4px; height: 4px; background: #666; border-radius: 50%; animation: typing 1.4s infinite ease-in-out 0.4s;"></div>
      </div>
    `;
    
    // Add typing animation styles if not already added
    if (!document.getElementById('az1-typing-styles')) {
      const style = document.createElement('style');
      style.id = 'az1-typing-styles';
      style.textContent = `
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return typingDiv;
  }

  function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }

  function formatMessage(content) {
    // Basic markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  // Initialize the widget
  async function init() {
    try {
      // Fetch configuration
      const configUrl = window.location.hostname === 'localhost' 
        ? `${window.location.protocol}//${window.location.hostname}:3000/api/embed/config?domain=${encodeURIComponent(window.location.hostname)}`
        : `https://az-1.info/api/embed/config?domain=${encodeURIComponent(window.location.hostname)}`;
      
      const configResponse = await fetch(configUrl);
      embedConfig = await configResponse.json();
      apiEndpoint = embedConfig.apiEndpoint;

      // Validate API key
      if (!config.apiKey) {
        console.error('AZ1 Chatbot: API key is required. Please set window.AZ1ChatbotConfig.apiKey');
        return;
      }

      // Create the widget
      createChatWidget();
      
    } catch (error) {
      console.error('AZ1 Chatbot initialization error:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(); 