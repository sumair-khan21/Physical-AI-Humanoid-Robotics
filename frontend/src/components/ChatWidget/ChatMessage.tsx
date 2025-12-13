/**
 * ChatMessage Component
 *
 * Displays a single chat message (user or assistant) with optional source citations.
 * Handles different message types and loading states.
 */

import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../types/chat';
import { hasSources } from '../../types/chat';

interface ChatMessageProps {
  /** Message data to display */
  message: ChatMessageType;

  /** Callback when source link is clicked */
  onSourceClick: (url: string) => void;
}

export default function ChatMessage({ message, onSourceClick }: ChatMessageProps) {
  const isUser = message.type === 'user';
  const isAssistant = message.type === 'assistant';

  // Filter sources with low relevance (<0.3) and sort by relevance
  const relevantSources = hasSources(message)
    ? message.sources
        .filter((source) => source.relevanceScore >= 0.3)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
    : [];

  return (
    <div
      className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}
      role="article"
      aria-label={`${isUser ? 'User' : 'Assistant'} message`}
    >
      {/* Message header */}
      <div className="message-header">
        <span className="message-type">{isUser ? 'You' : 'Assistant'}</span>
        <span className="message-timestamp">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* Message content */}
      <div className="message-content">
        {message.status === 'pending' && isUser ? (
          <div className="typing-indicator" aria-label="Loading">
            <span>•</span>
            <span>•</span>
            <span>•</span>
          </div>
        ) : (
          <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
        )}
      </div>

      {/* Source citations (assistant messages only) */}
      {isAssistant && relevantSources.length > 0 && (
        <div className="message-sources">
          <p className="sources-label">Sources:</p>
          <ol className="sources-list">
            {relevantSources.map((source, index) => (
              <li key={index}>
                <a
                  href={source.url}
                  onClick={(e) => {
                    e.preventDefault();
                    onSourceClick(source.url);
                  }}
                  className="source-link"
                  aria-label={`Source: ${source.title}`}
                >
                  {source.title}
                </a>
                <span className="source-score" aria-label={`Relevance: ${Math.round(source.relevanceScore * 100)}%`}>
                  ({Math.round(source.relevanceScore * 100)}%)
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Status indicator for failed messages */}
      {message.status === 'failed' && (
        <div className="message-status failed" aria-label="Message failed">
          ⚠️ Failed to send
        </div>
      )}
    </div>
  );
}
