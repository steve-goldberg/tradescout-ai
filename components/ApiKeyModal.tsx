import React, { useState } from 'react';
import { Key, Eye, EyeOff, X, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-[#0b1121] border border-slate-700 w-full max-w-md mx-4 p-1 shadow-2xl">
        {/* Corner Accents */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-500"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-500"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-500"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-500"></div>

        <div className="bg-[#050a15] border border-slate-800 p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30">
              <Key size={24} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">
                Enter_API_Key
              </h2>
              <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 to-transparent mt-1"></div>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-400 text-sm font-mono mb-4">
            Your Gemini API key is required to analyze video content.
            The key is stored locally in your browser and never sent to our servers.
          </p>

          {/* Link to AI Studio */}
          <a
            href="https://aistudio.google.com/app/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-mono mb-6 transition-colors"
          >
            Don't have an API key? Create one here
            <ExternalLink size={14} />
          </a>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* API Key Input */}
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="PASTE_YOUR_API_KEY_HERE..."
                className="w-full bg-[#0b1121] border border-slate-700 text-cyan-100 font-mono text-sm px-4 py-3 pr-12 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-600 text-slate-400 font-mono text-sm font-bold uppercase tracking-wider hover:text-white hover:border-slate-500 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!apiKey.trim()}
                className={`flex-1 px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all
                  ${apiKey.trim()
                    ? 'bg-cyan-600 text-black hover:bg-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
              >
                Save & Execute
              </button>
            </div>
          </form>

          {/* Security Note */}
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mt-4 text-center">
            Encrypted // Client-Side Only // Never Transmitted
          </p>
        </div>
      </div>
    </div>
  );
};
