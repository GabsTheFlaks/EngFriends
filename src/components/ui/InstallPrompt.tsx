import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Detect if the device is iOS (iPhone/iPad/iPod)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    // Check if the app is already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (navigator as Navigator & { standalone?: boolean }).standalone;
    
    // Check if the user previously dismissed the prompt
    const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';

    if (isIOS && !isStandalone && !isDismissed) {
      setIsIOSDevice(true);
      setIsVisible(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as BeforeInstallPromptEvent);
      if (!isDismissed) {
        setIsVisible(true);
      }
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

  const handleClose = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[416px] z-50 animate-slide-up">
      <div className="bg-blue-600 text-white rounded-xl p-4 shadow-xl flex items-center justify-between gap-3">
        {isIOSDevice ? (
          <div className="flex-1 pr-2">
            <h3 className="font-bold text-sm">Instalar Eng+ no iPhone</h3>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              Toque no ícone de compartilhar{' '}
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline mx-1 align-middle -mt-1 text-white bg-blue-700 p-0.5 rounded">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>{' '}
              e depois em <strong className="text-white">"Adicionar à Tela de Início"</strong> para instalar e poder ativar notificações.
            </p>
          </div>
        ) : (
          <div className="flex-1">
            <h3 className="font-bold text-sm">Instalar Eng+</h3>
            <p className="text-xs text-blue-100 mt-0.5">Adicione o app à tela inicial para acesso rápido e off-line.</p>
          </div>
        )}

        {!isIOSDevice && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1 bg-white text-blue-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors shrink-0"
          >
            <Download size={14} />
            Instalar
          </button>
        )}

        <button
          onClick={handleClose}
          className="p-1 rounded-full hover:bg-blue-700 transition-colors shrink-0"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

