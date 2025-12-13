/**
 * Chat Service - Backend API communication layer
 *
 * Handles all HTTP communication with the FastAPI backend,
 * including query validation, error categorization, and timeout management.
 */

import type { BackendConfig, ChatResponse, ErrorState } from '../../types/chat';

/**
 * Send query to backend and return response
 * @throws Error if request fails (network, timeout, backend error)
 */
export async function sendQuery(
  question: string,
  config: BackendConfig
): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(`${config.baseURL}/api/chat/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Server error' }));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * Validate query before sending
 * @returns validation result with optional error message
 */
export function validateQuery(question: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = question.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Question cannot be empty',
    };
  }

  if (trimmed.length > 10000) {
    return {
      valid: false,
      error: 'Question is too long (max 10,000 characters)',
    };
  }

  return { valid: true };
}

/**
 * Transform backend error to user-friendly ErrorState
 */
export function categorizeError(error: unknown): ErrorState {
  // Network errors (fetch rejection)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Connection failed. Please check your internet connection and try again.',
      retryable: true,
    };
  }

  // Timeout errors (AbortController)
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      type: 'timeout',
      message: 'Request timed out. The server took too long to respond.',
      retryable: true,
    };
  }

  // Backend errors (parsed from response)
  if (error instanceof Error) {
    // Check if it's a validation error (from backend)
    if (error.message.includes('empty') || error.message.includes('required')) {
      return {
        type: 'validation',
        message: error.message,
        retryable: false,
      };
    }

    // Generic backend error
    return {
      type: 'backend',
      message: error.message || 'An unexpected error occurred. Please try again.',
      retryable: true,
    };
  }

  // Unknown error type
  return {
    type: 'backend',
    message: 'An unexpected error occurred. Please try again.',
    retryable: true,
  };
}
