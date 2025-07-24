'use client';

import { useRef, useCallback } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isFullScreen?: boolean;
}

export default function RichTextEditor({ value, onChange, placeholder, isFullScreen = false }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback(
    (before: string, after: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
      onChange(newText);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      }, 0);
    },
    [value, onChange]
  );

  const insertAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newText = value.substring(0, start) + text + value.substring(end);
      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    },
    [value, onChange]
  );

  const insertLineText = useCallback(
    (linePrefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const lines = value.split('\n');
      let currentPos = 0;

      // Find which line the cursor is on
      for (let i = 0; i < lines.length; i++) {
        if (currentPos + lines[i].length >= start) {
          break;
        }
        currentPos += lines[i].length + 1; // +1 for \n
      }

      // Insert at the beginning of the current line
      const lineStart = currentPos;
      const newText = value.substring(0, lineStart) + linePrefix + value.substring(lineStart);
      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + linePrefix.length, start + linePrefix.length);
      }, 0);
    },
    [value, onChange]
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            insertText('**', '**');
            break;
          case 'i':
            e.preventDefault();
            insertText('_', '_');
            break;
          case 'u':
            e.preventDefault();
            insertText('<u>', '</u>');
            break;
          case 'd':
            e.preventDefault();
            insertText('~~', '~~');
            break;
          default:
            break;
        }
      }
    },
    [insertText]
  );

  const toolbarButtons = [
    {
      label: 'Bold (Ctrl+B)',
      icon: 'B',
      action: () => insertText('**', '**'),
      className: 'font-bold',
    },
    {
      label: 'Italic (Ctrl+I)',
      icon: 'I',
      action: () => insertText('_', '_'),
      className: 'italic',
    },
    {
      label: 'Underline (Ctrl+U)',
      icon: 'U',
      action: () => insertText('<u>', '</u>'),
      className: 'underline',
    },
    {
      label: 'Strikethrough (Ctrl+D)',
      icon: 'S̶',
      action: () => insertText('~~', '~~'),
      className: 'line-through',
    },
    {
      label: 'H1',
      icon: 'H1',
      action: () => insertLineText('# '),
      className: 'text-sm font-bold',
    },
    {
      label: 'H2',
      icon: 'H2',
      action: () => insertLineText('## '),
      className: 'text-sm font-bold',
    },
    {
      label: 'H3',
      icon: 'H3',
      action: () => insertLineText('### '),
      className: 'text-sm font-bold',
    },
    {
      label: 'H4',
      icon: 'H4',
      action: () => insertLineText('#### '),
      className: 'text-xs font-bold',
    },
    {
      label: 'Link',
      icon: '🔗',
      action: () => insertText('[', '](url)'),
      className: '',
    },
    {
      label: 'Bullet List',
      icon: '•',
      action: () => insertLineText('- '),
      className: '',
    },
    {
      label: 'Quote',
      icon: '❝',
      action: () => insertLineText('> '),
      className: '',
    },
    {
      label: 'Horizontal Rule',
      icon: '─',
      action: () => insertAtCursor('\n---\n'),
      className: '',
    },
  ];

  // Determine height based on context
  const getEditorHeight = () => {
    if (isFullScreen) {
      return 'h-full';
    }
    return 'h-96';
  };

  return (
    <div className={`space-y-3 ${isFullScreen ? 'h-full flex flex-col' : ''}`}>
      {/* Toolbar */}
      <div className='flex flex-wrap gap-1 p-3 bg-gray-50 border border-gray-300 rounded-t-md'>
        <div className='flex gap-1 flex-wrap'>
          {toolbarButtons.map((button) => (
            <button
              key={button.label}
              type='button'
              onClick={button.action}
              title={button.label}
              className={`px-2 py-1 text-sm border border-gray-300 bg-white hover:bg-gray-100 rounded transition-colors font-serif ${button.className}`}
            >
              {button.icon}
            </button>
          ))}
        </div>

        <div className='ml-auto flex gap-2'>
          <div className='text-xs text-gray-500 bg-white px-2 py-1 rounded'>{value.length} chars</div>
        </div>
      </div>

      {/* Editor */}
      <div className={`relative ${isFullScreen ? 'flex-1' : ''}`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-3 py-3 bg-white border border-gray-300 rounded-b-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500 resize-none ${getEditorHeight()}`}
          style={{
            lineHeight: '1.5',
            fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Consolas", monospace',
          }}
        />
      </div>

      {/* Quick Help - Only show when not in full screen */}
      {!isFullScreen && (
        <div className='text-xs text-gray-600 font-serif space-y-1'>
          <p className='font-medium'>Klaviatura qısayolları:</p>
          <div className='grid grid-cols-2 gap-x-4 gap-y-1'>
            <span>Ctrl+B: **qalın tekst**</span>
            <span>Ctrl+I: _italic tekst_</span>
            <span>Ctrl+U: &lt;u&gt;altdan xətt&lt;/u&gt;</span>
            <span>Ctrl+D: ~~ortadan xətt~~</span>
            <span># H1, ## H2, ### H3, #### H4</span>
            <span>- nöqtəli siyahı • &gt; sitat • [link](url)</span>
          </div>
        </div>
      )}
    </div>
  );
}
