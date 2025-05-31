# Renograte Chatbot Implementation

This document provides an overview of the Renograte chatbot implementation and how to set it up properly.

## Overview

The Renograte chatbot is an AI-powered assistant that helps users with questions about Renograte's platform, services, and benefits. It uses OpenAI's language models with Retrieval-Augmented Generation (RAG) to provide accurate and relevant information.

## Features

- **AI-Powered Responses**: Uses OpenAI's language models to generate helpful responses
- **Streaming Responses**: Delivers responses in a streaming fashion for better user experience
- **Rate Limiting**: Implements tiered rate limiting to prevent abuse
- **Response Caching**: Caches common responses for faster performance
- **FAQ Section**: Provides quick access to frequently asked questions
- **Knowledge Base**: Offers resources and guides for users
- **Contact Information**: Displays Renograte's contact details

## Setup Instructions

1. **Environment Variables**:
   Create a `.env.local` file in the root of your project with the following content:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
   Replace `your_openai_api_key_here` with your actual OpenAI API key.

2. **Install Dependencies**:
   ```
   npm install @langchain/core @langchain/openai langchain lru-cache
   ```

3. **Build and Run**:
   ```
   npm run build
   npm run start
   ```

## File Structure

- `Frontend/app/api/chat/route.ts`: API route that handles chatbot requests
- `Frontend/lib/streaming.ts`: Utility for streaming responses
- `Frontend/lib/chat-config.ts`: Configuration for the chatbot
- `Frontend/components/Chaticon.tsx`: Chat UI component
- `Frontend/components/FAQData.tsx`: FAQ data for the chatbot

## Customization

To customize the chatbot's knowledge base:
1. Update the `RENOGRATE_DATA` constant in `Frontend/app/api/chat/route.ts`
2. Update the FAQ data in `Frontend/components/FAQData.tsx`

## Troubleshooting

- If the chatbot is not responding, check that your OpenAI API key is correctly set in the `.env.local` file
- If you encounter rate limiting errors, adjust the `RATE_LIMIT_CONFIG` in `Frontend/app/api/chat/route.ts`
- For streaming issues, check the `streaming.ts` implementation

## Security Considerations

- The OpenAI API key should be kept secure and not exposed to the client
- Rate limiting is implemented to prevent abuse
- Input validation is performed on all user queries

## Future Improvements

- Add chat history persistence
- Implement user authentication for personalized responses
- Add support for multi-language responses
- Integrate with other Renograte services for more context-aware responses 