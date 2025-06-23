'use client';

import { useState } from 'react';

interface RegenerateHighlightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (customPrompt: string) => void;
  isLoading: boolean;
}

export default function RegenerateHighlightsModal({
  isOpen,
  onClose,
  onRegenerate,
  isLoading
}: RegenerateHighlightsModalProps) {
  const [customPrompt, setCustomPrompt] = useState('Generate professional highlights based on my resume and experience');

  const handleSubmit = () => {
    onRegenerate(customPrompt);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Customize AI Highlights</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Prompt
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Describe how you want your highlights to be generated..."
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Customize the prompt to generate highlights that best represent your experience and goals.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !customPrompt.trim()}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              !isLoading && customPrompt.trim()
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Regenerate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}