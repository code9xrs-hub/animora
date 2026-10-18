import React from 'react';
import { X, Share2, PlusSquare, Download } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-[#181A22] border border-white/10 p-6 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#8E93A0] hover:text-white hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F47521] flex items-center justify-center shadow-lg shadow-[#F47521]/20">
            <svg className="w-6 h-6 text-black fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">Install Animora</h3>
            <p className="text-xs text-[#8E93A0]">Stream fast in standalone mode</p>
          </div>
        </div>

        <p className="text-xs text-white/80 leading-relaxed mb-4">
          Add Animora to your home screen or desktop for a cinema-grade fullscreen app experience with fast loading.
        </p>

        <div className="space-y-3 bg-[#121318] p-3.5 rounded-xl border border-white/5 text-xs text-white/90">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded bg-white/10 text-[#F47521] mt-0.5">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-white">1. Tap Share</span>
              <p className="text-[11px] text-[#8E93A0]">Tap the Share icon in your browser toolbar.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded bg-white/10 text-[#2ABDBB] mt-0.5">
              <PlusSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-white">2. Add to Home Screen</span>
              <p className="text-[11px] text-[#8E93A0]">Scroll down and choose "Add to Home Screen".</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-[#F47521] hover:bg-[#FF8533] text-black font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-[#F47521]/20"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
