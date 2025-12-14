/**
 * ChatInput Component
 *
 * Text input field for users to enter questions.
 * Handles submission via Enter key or button click, with validation.
 */

import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  /** Current input value */
  value: string;

  /** Callback when input changes */
  onChange: (value: string) => void;

  /** Callback when user submits (Enter key or button click) */
  onSubmit: (question: string) => void;

  /** Whether input is disabled (loading state) */
  disabled: boolean;

  /** Placeholder text */
  placeholder?: string;

  /** Maximum allowed characters */
  maxLength?: number;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = 'Ask a question...',
  maxLength = 10000,
}: ChatInputProps) {
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content (max 5 lines)
  useEffect(() => {
    if (textareaRef.current) {
      const lineHeight = 20; // Approximate line height in pixels
      const maxRows = 5;
      const newRows = Math.min(
        Math.max(1, Math.ceil(textareaRef.current.scrollHeight / lineHeight)),
        maxRows
      );
      setRows(newRows);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (but allow Shift+Enter for newlines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed.length > 0 && !disabled) {
      onSubmit(trimmed);
    }
  };

  const isNearMaxLength = value.length > maxLength * 0.9;
  const isOverMaxLength = value.length > maxLength;

  return (
    <div className="chat-input-container">
      <textarea
        ref={textareaRef}
        className="chat-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        aria-label="Chat input"
        aria-invalid={isOverMaxLength}
        aria-describedby={isNearMaxLength ? 'char-count' : undefined}
      />

      {/* Character count warning (show when >90% of max) */}
      {isNearMaxLength && (
        <div
          id="char-count"
          className={`char-count ${isOverMaxLength ? 'error' : 'warning'}`}
          aria-live="polite"
        >
          {value.length} / {maxLength} characters
          {isOverMaxLength && ' (too long)'}
        </div>
      )}

      <button
        type="button"
        className="send-button"
        onClick={handleSubmit}
        disabled={disabled || value.trim().length === 0 || isOverMaxLength}
        aria-label="Send message"
      >
        {disabled ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
