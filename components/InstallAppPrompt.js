'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

const DISMISSED_KEY = 'smart-ai-install-prompt-dismissed';

export default function InstallAppPrompt() {
  const [visible, setVisible] = useState(false);
  const [manualHelp, setManualHelp] = useState(false);
  const [ios, setIos] = useState(false);
  const installPrompt = useRef(null);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    const isIos =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIos(isIos);

    if (standalone) return undefined;

    try {
      if (window.localStorage.getItem(DISMISSED_KEY) === 'true') return undefined;
    } catch {
      // Showing the prompt is still safe when storage is unavailable.
    }
    setVisible(true);

    const onBeforeInstall = (event) => {
      event.preventDefault();
      installPrompt.current = event;
      setVisible(true);
    };
    const onInstalled = () => {
      installPrompt.current = null;
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, 'true');
    } catch {
      // Ignore storage restrictions; dismissal still applies for this page view.
    }
  }

  async function install() {
    if (!installPrompt.current) {
      setManualHelp((current) => !current);
      return;
    }

    const promptEvent = installPrompt.current;
    installPrompt.current = null;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice?.outcome === 'accepted') setVisible(false);
    else setManualHelp(true);
  }

  if (!visible) return null;

  return (
    <aside className="install-prompt" aria-label="Install Smart AI" aria-live="polite">
      <div className="install-prompt-icon"><Download size={18} /></div>
      <div className="install-prompt-copy">
        <strong>Install Smart AI</strong>
        <span>
          {manualHelp
            ? ios
              ? 'Tap Share, then choose “Add to Home Screen”.'
              : 'Open your browser menu and choose “Install app” or “Add to Home Screen”.'
            : 'Keep your private AI companion one tap away.'}
        </span>
      </div>
      {manualHelp ? (
        <Share className="install-share-icon" size={18} aria-hidden="true" />
      ) : (
        <button className="install-action" type="button" onClick={install}>
          {installPrompt.current ? 'Install' : 'How'}
        </button>
      )}
      <button className="install-dismiss" type="button" onClick={dismiss} aria-label="Dismiss install prompt">
        <X size={17} />
      </button>
    </aside>
  );
}
