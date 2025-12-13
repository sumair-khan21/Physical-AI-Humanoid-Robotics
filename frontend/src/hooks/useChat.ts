/**
 * useChat Hook - Chat state management
 *
 * Custom React hook that encapsulates all chat logic:
 * - Message state management
 * - Backend communication
 * - Error handling and retry
 * - Loading states
 */

import { useState, useCallback } from 'react';
import type { ChatMessage, ErrorState, BackendConfig } from '../types/chat';
import { sendQuery, validateQuery, categorizeError } from '../components/ChatWidget/chatService';
import { transformBackendSource } from '../types/chat';

export function useChat(config: BackendConfig) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [inputValue, setInputValue] = useState('');

  /**
   * Send a message to the backend
   */
  const sendMessage = useCallback(
    async (question: string) => {
      // Validate query
      const validation = validateQuery(question);
      if (!validation.valid) {
        setError({
          type: 'validation',
          message: validation.error!,
          retryable: false,
        });
        return;
      }

      // Create user message with pending status
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'user',
        content: question,
        sources: null,
        timestamp: new Date(),
        status: 'pending',
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // Send to backend
        const response = await sendQuery(question, config);

        // Transform backend sources to frontend format
        const transformedSources = response.sources
          ? response.sources.map(transformBackendSource)
          : null;

        // Create assistant message
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          type: 'assistant',
          content: response.answer,
          sources: transformedSources,
          timestamp: new Date(response.timestamp),
          status: 'completed',
        };

        // Update messages: mark user message as completed, add assistant message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status: 'completed' as const } : msg
          ).concat(assistantMessage)
        );

        // Clear input on success
        setInputValue('');
      } catch (err) {
        // Categorize error and set error state
        const categorizedError = categorizeError(err);
        setError({
          ...categorizedError,
          originalQuery: question, // Store for retry
        });

        // Update user message status to failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status: 'failed' as const } : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [config]
  );

  /**
   * Retry the last failed query
   */
  const retryLast = useCallback(() => {
    if (error?.originalQuery) {
      const query = error.originalQuery;
      setError(null); // Clear error before retry
      sendMessage(query);
    }
  }, [error, sendMessage]);

  /**
   * Clear current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    inputValue,
    setInputValue,
    sendMessage,
    retryLast,
    clearError,
  };
}
