import { useState, useEffect, useRef } from 'react';

interface JsonEditorProps {
  initialValue: any;
  onChange?: (value: any) => void;
}

export function JsonEditor({ initialValue, onChange }: JsonEditorProps) {
  const [jsonString, setJsonString] = useState<string>(
    JSON.stringify(initialValue, null, 2)
  );
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastCursorPosition = useRef<number | null>(null);
  
  // Update JSON string when initialValue prop changes
  useEffect(() => {
    const newJsonString = JSON.stringify(initialValue, null, 2);
    
    // Only update if the serialized objects are different to avoid unnecessary re-renders
    if (newJsonString !== jsonString) {
      // Save cursor position before update
      if (textareaRef.current) {
        lastCursorPosition.current = textareaRef.current.selectionStart;
      }
      
      setJsonString(newJsonString);
      
      // Restore cursor position after state update
      // Using setTimeout to ensure this happens after the state update is applied to the DOM
      setTimeout(() => {
        if (textareaRef.current && lastCursorPosition.current !== null) {
          // Make sure we don't put cursor beyond the text length
          const position = Math.min(lastCursorPosition.current, textareaRef.current.value.length);
          textareaRef.current.setSelectionRange(position, position);
        }
      }, 0);
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setJsonString(newValue);
    
    // Save cursor position
    lastCursorPosition.current = e.target.selectionStart;
    
    try {
      const parsed = JSON.parse(newValue);
      setError(null);
      onChange?.(parsed);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  // Function to copy JSON to clipboard
  const copyToClipboard = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      navigator.clipboard.writeText(textareaRef.current.value)
        .then(() => {
          setCopyMessage("Copied to clipboard!");
          setTimeout(() => setCopyMessage(null), 2000);
        })
        .catch(err => {
          console.error("Failed to copy: ", err);
          setCopyMessage("Failed to copy");
          setTimeout(() => setCopyMessage(null), 2000);
        });
    }
  };

  // Handle keyboard shortcut (Ctrl+C already works natively)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Add Ctrl+S for example to save/copy
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault(); // Prevent browser save dialog
      copyToClipboard();
    }
  };
  return (
    <div className="json-editor w-full">
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full h-64 font-mono text-sm p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md"
          value={jsonString}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-xs"
          title="Copy to clipboard (Ctrl+S)"
        >
          Copy
        </button>
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
      {copyMessage && (
        <div className="text-green-500 text-sm mt-2">{copyMessage}</div>
      )}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Tip: Press Ctrl+S to copy the entire JSON to clipboard
      </div>
    </div>
  );
}
