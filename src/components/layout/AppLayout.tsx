import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { PlayerCenter } from './PlayerCenter';
import { RightPanel } from './RightPanel';
import { usePlayerContext } from '../../context/PlayerContext';
import type { ActiveView } from '../../context/PlayerContext';

export function AppLayout() {
  const { activeView, setActiveView } = usePlayerContext();
  const [mobileShowPlayer, setMobileShowPlayer] = useState(true);

  const handleViewChange = (view: ActiveView) => {
    setActiveView(activeView === view ? 'queue' : view);
    setMobileShowPlayer(false);
  };

  const handleMobilePanel = (view: ActiveView) => {
    setActiveView(view);
    setMobileShowPlayer(false);
  };

  const mobileClass = mobileShowPlayer ? 'app-layout--mobile-player' : 'app-layout--mobile-panel';

  return (
    <div className={`app-layout ${mobileClass}`}>
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      <PlayerCenter />
      <RightPanel activeView={activeView} onViewChange={setActiveView} />

      {/* ── Barra de navegación móvil (solo visible en pantallas pequeñas) ── */}
      <nav className="mobile-nav">
        <button
          className={`mobile-nav__tab ${mobileShowPlayer ? 'mobile-nav__tab--active' : ''}`}
          onClick={() => setMobileShowPlayer(true)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <circle cx="12" cy="12" r="10" opacity="0.15"/>
            <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="2"/>
            <path d="M12 2a10 10 0 0 1 7.07 17.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
          <span>Player</span>
        </button>

        <button
          className={`mobile-nav__tab ${!mobileShowPlayer && activeView === 'queue' ? 'mobile-nav__tab--active' : ''}`}
          onClick={() => handleMobilePanel('queue')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
          </svg>
          <span>Cola</span>
        </button>

        <button
          className={`mobile-nav__tab ${!mobileShowPlayer && activeView === 'library' ? 'mobile-nav__tab--active' : ''}`}
          onClick={() => handleMobilePanel('library')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span>Playlist</span>
        </button>

        <button
          className={`mobile-nav__tab ${!mobileShowPlayer && activeView === 'history' ? 'mobile-nav__tab--active' : ''}`}
          onClick={() => handleMobilePanel('history')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
          </svg>
          <span>Historial</span>
        </button>
      </nav>
    </div>
  );
}
