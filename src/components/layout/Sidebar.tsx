import { usePlayerContext } from '../../context/PlayerContext';
import { LocalFileImport } from '../library/LocalFileImport';
import type { ActiveView } from '../../context/PlayerContext';

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  usePlayerContext(); // mantiene suscripción al contexto

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#C9A96E" opacity="0.15"/>
          <circle cx="12" cy="12" r="6" fill="none" stroke="#C9A96E" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="2" fill="#C9A96E"/>
          <path d="M12 2a10 10 0 0 1 7.07 17.07" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className="sidebar__logo-text">Lown</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <button
          className={`sidebar__nav-item ${activeView === 'library' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => onViewChange('library')}
          title="Mi playlist"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          Mi playlist
        </button>

        <button
          className={`sidebar__nav-item ${activeView === 'history' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => onViewChange('history')}
          title="Historial"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
          </svg>
          Historial
        </button>
      </nav>

      {/* Upload */}
      <div className="sidebar__section">
        <LocalFileImport compact />
      </div>

    </aside>
  );
}
