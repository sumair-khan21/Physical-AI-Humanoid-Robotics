/**
 * TypeScript type definitions for Chat Widget
 *
 * These types define the data structures used across the chat interface,
 * matching the backend API contract and frontend component requirements.
 */

/**
 * Represents a single message in the chat conversation
 */
export interface ChatMessage {
  /** Unique identifier for this message (UUID v4) */
  id: string;

  /** Message type */
  type: 'user' | 'assistant' | 'error';

  /** Message content (question or answer text) */
  content: string;

  /** Source citations (only for assistant messages, null for user/error messages) */
  sources: Source[] | null;

  /** When this message was created */
  timestamp: Date;

  /** Current status of this message */
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Represents a source citation from the RAG system
 */
export interface Source {
  /** Title of the source document/section */
  title: string;

  /** URL to the source (absolute or relative) */
  url: string;

  /** Relevance score from RAG system (0.0 to 1.0) */
  relevanceScore: number;
}

/**
 * Error state for the chat interface
 */
export interface ErrorState {
  /** Error type for categorization */
  type: 'validation' | 'network' | 'timeout' | 'backend';

  /** User-friendly error message */
  message: string;

  /** Whether this error is retryable */
  retryable: boolean;

  /** Original query that caused the error (for retry functionality) */
  originalQuery?: string;
}

/**
 * Configuration for backend communication
 */
export interface BackendConfig {
  /** Base URL for backend API */
  baseURL: string;

  /** Request timeout in milliseconds */
  timeout: number;
}

/**
 * Backend API response structure
 * Matches the FastAPI ChatResponse Pydantic model
 */
export interface ChatResponse {
  /** Generated answer from RAG system */
  answer: string;

  /** Source citations (null if no sources found) */
  sources: {
    title: string;
    url: string;
    relevance_score: number; // Note: snake_case from backend API
  }[] | null;

  /** Response generation timestamp (ISO 8601 format) */
  timestamp: string;
}

/**
 * Type guard to check if an error is retryable
 */
export function isRetryableError(error: ErrorState): boolean {
  return error.retryable === true;
}

/**
 * Type guard to check if a message has sources
 */
export function hasSources(message: ChatMessage): message is ChatMessage & { sources: Source[] } {
  return message.sources !== null && message.sources.length > 0;
}

/**
 * Helper to convert backend source format to frontend format
 */
export function transformBackendSource(backendSource: {
  title: string;
  url: string;
  relevance_score: number;
}): Source {
  return {
    title: backendSource.title,
    url: backendSource.url,
    relevanceScore: backendSource.relevance_score,
  };
}
