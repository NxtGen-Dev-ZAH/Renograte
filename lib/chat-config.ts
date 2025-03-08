export const CHAT_API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    CHAT: '/api/chat',
  },
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
}

export interface ChatResponse {
  content: string;
}

export interface ChatError {
  detail: string;
}

export class ChatApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ChatApiError';
  }
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = CHAT_API_CONFIG.MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new ChatApiError(`HTTP error! status: ${response.status}`, response.status);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await delay(CHAT_API_CONFIG.RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
} 