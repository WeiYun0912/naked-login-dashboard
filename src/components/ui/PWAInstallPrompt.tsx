import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 檢測是否為 iOS Safari
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    setIsIOS(isIOSDevice);

    // 如果已經安裝，不顯示提示
    if (isStandalone) {
      return;
    }

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    
    // iOS Safari - 手動顯示提示
    if (isIOSDevice && !isStandalone && !dismissed) {
      setTimeout(() => setShowPrompt(true), 2000); // 延遲 2 秒顯示
      return;
    }

    // Android/Chrome - 使用 beforeinstallprompt 事件
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // iOS 安裝說明
  const IOSInstructions = () => (
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold text-foreground mb-1">
        安裝到主畫面
      </h3>
      <div className="text-xs text-foreground-muted space-y-2">
        <p>在 Safari 中，點擊下方的</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-bg rounded">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
            </svg>
            <span className="font-medium">分享</span>
          </div>
          <span>按鈕</span>
        </div>
        <p>然後選擇「加入主畫面」</p>
      </div>
      
      <button
        onClick={handleDismiss}
        className="mt-3 w-full px-3 py-2 bg-bg-elevated border border-border text-foreground-muted text-sm font-medium rounded-lg hover:text-foreground hover:border-accent transition-colors"
      >
        知道了
      </button>
    </div>
  );

  // Android/Chrome 安裝按鈕
  const AndroidInstall = () => (
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold text-foreground mb-1">
        安裝應用程式
      </h3>
      <p className="text-xs text-foreground-muted mb-3">
        將 YouTube Dashboard 安裝到主畫面，快速存取數據分析
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
        >
          安裝
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-2 text-foreground-muted text-sm font-medium hover:text-foreground transition-colors"
        >
          稍後
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50"
        >
          <div className="bg-bg-elevated backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              {isIOS ? <IOSInstructions /> : <AndroidInstall />}
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-foreground-muted hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
