/**
 * Professional ChatWidget Component
 *
 * An elegant, minimal chatbot interface with:
 * - Compact input bar at bottom
 * - Professional icons (no emojis)
 * - Smooth animations and transitions
 * - Clean, modern design
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

  // Handle Escape key to minimize
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
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
              <svg className="chat-header-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <circle cx="9" cy="10" r="1" fill="currentColor"/>
                <circle cx="12" cy="10" r="1" fill="currentColor"/>
                <circle cx="15" cy="10" r="1" fill="currentColor"/>
              </svg>
              <div className="chat-header-text">
                <h3>AI Assistant</h3>
                <p>Powered by your textbook knowledge</p>
              </div>
            </div>
            <button
              className="chat-close-btn"
              onClick={() => setIsExpanded(false)}
              aria-label="Minimize chat"
              title="Minimize (Esc)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5"/>
              </svg>
            </button>
          </div>

          <div className="modern-chat-messages">
            {messages.length === 0 && (
              <div className="modern-welcome">
                <svg className="welcome-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                <h4>Welcome to AI Assistant</h4>
                <p>Get instant answers from your Physical AI & Robotics textbook</p>
                <div className="quick-questions">
                  <button onClick={() => { setInputValue('What is ROS 2?'); inputRef.current?.focus(); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    What is ROS 2?
                  </button>
                  <button onClick={() => { setInputValue('Explain digital twin in robotics'); inputRef.current?.focus(); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    Digital Twin Concepts
                  </button>
                  <button onClick={() => { setInputValue('What is NVIDIA Isaac Sim?'); inputRef.current?.focus(); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                      <polyline points="2 17 12 22 22 17"/>
                      <polyline points="2 12 12 17 22 12"/>
                    </svg>
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
                <svg className="error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
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
            <button
              type="button"
              className="chat-trigger-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Minimize chat" : "Expand chat"}
              title={isExpanded ? "Minimize" : "Open AI Assistant"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleInputFocus}
                placeholder="Ask a question..."
                className="modern-input"
                disabled={isLoading}
                maxLength={500}
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
              title="Send (Enter)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
