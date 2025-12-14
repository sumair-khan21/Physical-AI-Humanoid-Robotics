/**
 * ChatWidget Component
 *
 * Main container component for the chat interface.
 * Manages collapsed/expanded state and orchestrates child components.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import type { BackendConfig } from '../../types/chat';
import './ChatWidget.css';

interface ChatWidgetProps {
  /** Override backend URL (optional) */
  backendURL?: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Widget position on screen (default: 'bottom-right') */
  position?: 'bottom-right' | 'bottom-left';

  /** Initial collapsed state (default: true) */
  initialCollapsed?: boolean;
}

export default function ChatWidget({
  backendURL,
  timeout = 30000,
  position = 'bottom-right',
  initialCollapsed = true,
}: ChatWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Backend configuration
  const config: BackendConfig = {
    baseURL: backendURL || 'http://localhost:8000', // Will be overridden by Docusaurus config
    timeout,
  };

  // Chat state management
  const {
    messages,
    isLoading,
    error,
    inputValue,
    setInputValue,
    sendMessage,
    retryLast,
    clearError,
  } = useChat(config);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle source link clicks (navigate to textbook section)
  const handleSourceClick = (url: string) => {
    window.location.href = url;
  };

  // Toggle collapsed state
  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`chat-widget ${position} ${isCollapsed ? 'collapsed' : 'expanded'}`}
      role="complementary"
      aria-label="AI Chat Assistant"
    >
      {isCollapsed ? (
        /* Collapsed state: floating button */
        <button
          className="chat-toggle-button"
          onClick={toggleCollapsed}
          aria-expanded={false}
          aria-label="Open chat"
        >
          💬
        </button>
      ) : (
        /* Expanded state: full chat interface */
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <h3>AI Assistant</h3>
            <button
              className="close-button"
              onClick={toggleCollapsed}
              aria-expanded={true}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            className="chat-messages"
            role="log"
            aria-live="polite"
            aria-busy={isLoading}
          >
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>👋 Hi! Ask me anything about the textbook content.</p>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSourceClick={handleSourceClick}
              />
            ))}

            {/* Error display */}
            {error && (
              <div className="error-banner" role="alert">
                <div className="error-content">
                  <span className="error-icon">
                    {error.type === 'validation' ? 'ℹ️' : '⚠️'}
                  </span>
                  <p className="error-message">{error.message}</p>
                </div>
                <div className="error-actions">
                  {error.retryable && (
                    <button
                      className="retry-button"
                      onClick={retryLast}
                      disabled={isLoading}
                    >
                      Retry
                    </button>
                  )}
                  <button
                    className="dismiss-button"
                    onClick={clearError}
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={sendMessage}
            disabled={isLoading}
            placeholder="Ask about the textbook content..."
          />
        </div>
      )}
    </div>
  );
}
