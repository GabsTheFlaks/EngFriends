import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-blue-600 text-white rounded-xl p-4 shadow-xl flex items-center justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-sm">Instalar Eng+</h3>
          <p className="text-xs text-blue-100 mt-0.5">Adicione o app à tela inicial para acesso rápido e off-line.</p>
        </div>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1 bg-white text-blue-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
        >
          <Download size={14} />
          Instalar
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-full hover:bg-blue-700 transition-colors"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
