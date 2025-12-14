/**
 * Modern ChatWidget Component - Bottom Input Bar Design
 *
 * A sleek, modern chatbot interface with:
 * - Fixed input bar at bottom center
 * - Expandable chat panel above input
 * - Smooth animations and modern styling
 */

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import type { BackendConfig } from '../../types/chat';
import './ModernChatWidget.css';

interface ModernChatWidgetProps {
  backendURL?: string;
  timeout?: number;
}

export default function ModernChatWidget({
  backendURL,
  timeout = 30000,
}: ModernChatWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Backend configuration
  const config: BackendConfig = {
    baseURL: backendURL || 'https://sums2121-rag-chatbot-backend.hf.space',
    timeout,
  };

  // Chat state management
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearError,
  } = useChat(config);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed && !isLoading) {
      sendMessage(trimmed);
      setInputValue('');
      if (!isExpanded) {
        setIsExpanded(true);
      }
    }
  };

  const handleInputFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleSourceClick = (url: string) => {
    window.location.href = url;
  };

  return (
    <>
      {/* Chat Panel - Appears above input when expanded */}
      {isExpanded && (
        <div className="modern-chat-panel">
          <div className="modern-chat-header">
            <div className="chat-header-content">
              <div className="chat-header-icon">🤖</div>
              <div className="chat-header-text">
                <h3>AI Assistant</h3>
                <p>Ask me anything about the textbook</p>
              </div>
            </div>
            <button
              className="chat-close-btn"
              onClick={() => setIsExpanded(false)}
              aria-label="Minimize chat"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="modern-chat-messages">
            {messages.length === 0 && (
              <div className="modern-welcome">
                <div className="welcome-icon">👋</div>
                <h4>Welcome!</h4>
                <p>Ask me anything about ROS 2, robotics, simulations, or AI models.</p>
                <div className="quick-questions">
                  <button onClick={() => { setInputValue('What is ROS 2?'); inputRef.current?.focus(); }}>
                    What is ROS 2?
                  </button>
                  <button onClick={() => { setInputValue('Explain digital twins'); inputRef.current?.focus(); }}>
                    Explain digital twins
                  </button>
                  <button onClick={() => { setInputValue('What is NVIDIA Isaac Sim?'); inputRef.current?.focus(); }}>
                    NVIDIA Isaac Sim
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSourceClick={handleSourceClick}
              />
            ))}

            {error && (
              <div className="modern-error">
                <div className="error-icon">⚠️</div>
                <div className="error-content">
                  <p>{error.message}</p>
                  {error.retryable && (
                    <button onClick={clearError} className="error-dismiss">
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Fixed Input Bar at Bottom */}
      <div className="modern-chat-input-bar">
        <div className="input-bar-container">
          <form onSubmit={handleSubmit} className="input-bar-form">
            <div className="input-wrapper">
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
                  <path d="M8 7h4M8 10h4M8 13h2"/>
                </svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleInputFocus}
                placeholder="Ask a question..."
                className="modern-input"
                disabled={isLoading}
              />
              {isLoading && (
                <div className="input-loading">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="modern-send-btn"
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10l16-8-8 16-2-8-6-0z" />
              </svg>
            </button>
          </form>
          {isExpanded && (
            <p className="input-hint">
              Press <kbd>Enter</kbd> to send • <kbd>Esc</kbd> to minimize
            </p>
          )}
        </div>
      </div>
    </>
  );
}
