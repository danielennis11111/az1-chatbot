# Arizona Digital Navigator Chatbot

An AI-powered digital navigator that helps users learn about broadband internet, digital literacy, and technology resources in Arizona. Built with a focus on serving users of all technical skill levels, from complete beginners to advanced users.

## Features

### 🧭 Digital Navigator Approach
- **NDIA Framework**: Uses the National Digital Inclusion Alliance's digital navigator learning methodology
- **Skill Level Detection**: Automatically detects user's technical comfort level and adapts responses
- **Empathetic Support**: Special handling for frustrated users with patient, encouraging responses
- **Progressive Learning**: Breaks down complex concepts into manageable steps

### 📚 Intelligent Resource Recommendations
- **Curated Resource Library**: Hand-picked resources for digital literacy, broadband info, and technical support
- **Context-Aware Suggestions**: Resources recommended based on user questions and skill level
- **Direct Links**: Provides clickable links to relevant external resources
- **Arizona-Specific Content**: Local resources and programs for Arizona residents

### 🎯 User-Centered Features
- **Conversation Starters**: Pre-written prompts to help users get started
- **Beginner-Friendly Interface**: Clear, jargon-free language and explanations
- **Global Knowledge**: Not limited to local content - can answer general technology questions
- **Accessibility**: Designed for users who may have no computer or internet experience

### 🤖 Advanced AI Capabilities
- **Gemini 2.0 Flash**: Powered by Google's latest language model
- **RAG Integration**: Enhances responses with knowledge base content
- **Rate Limiting**: Manages API usage with user-friendly cooldown messages
- **Data Collection Consent**: Optional data collection with clear user consent

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd az1-chatbot/app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
cd app && npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Resource Management
The chatbot includes a curated resource library in `src/lib/resources.ts`. You can:
- Add new resources to the `RESOURCES` array
- Categorize resources by type (broadband, digital-literacy, affordability, etc.)
- Target specific audiences (beginner, intermediate, advanced, everyone)
- Tag resources for better search and recommendations

### Knowledge Base
Upload documents through the Knowledge Manager interface to enhance the chatbot's responses with your own content:
- PDF documents are automatically processed
- Content is chunked and embedded for retrieval
- RAG (Retrieval Augmented Generation) enhances AI responses

### System Prompt Customization
Modify the digital navigator personality and behavior in `src/lib/gemini.ts`:
- Adjust tone and approach
- Add domain-specific knowledge
- Customize response guidelines

## Deployment

### Docker
The project includes Docker configuration:

```bash
docker-compose up --build
```

### Environment Variables for Production
- `GEMINI_API_KEY`: Your Google Gemini API key
- `NODE_ENV`: Set to "production"

## Usage Examples

### For Complete Beginners
- "I've never used the internet before. Where do I start?"
- "What is Wi-Fi and do I need it?"
- "Help me understand what broadband means"

### For Affordability Seekers
- "I can't afford high internet bills. Are there programs to help?"
- "What's the Affordable Connectivity Program?"
- "Find me the cheapest internet in Arizona"

### For Technical Issues
- "My internet keeps disconnecting"
- "How do I test my internet speed?"
- "My Wi-Fi password isn't working"

### For Arizona Residents
- "What broadband is available in my Arizona county?"
- "Are there local digital literacy classes?"
- "Show me the Arizona broadband map"

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

### Adding New Resources
When adding resources to the library:
1. Follow the `Resource` interface in `src/types/chat.ts`
2. Choose appropriate categories and audience levels
3. Add relevant tags for discoverability
4. Test resource recommendations with various user queries

## Technical Architecture

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.0 Flash API
- **Vector Search**: Chromadb for knowledge base
- **State Management**: React hooks
- **Type Safety**: TypeScript throughout

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the GitHub repository or contact the development team.

## Acknowledgments

- National Digital Inclusion Alliance (NDIA) for the digital navigator framework
- Arizona broadband advocacy organizations
- Google AI for the Gemini API
- The open source community for the supporting technologies
