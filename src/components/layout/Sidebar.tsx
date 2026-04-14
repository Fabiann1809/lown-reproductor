import { usePlayerContext } from '../../context/PlayerContext';

interface SidebarProps {
  activeView: 'library' | 'search';
  onViewChange: (view: 'library' | 'search') => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { toggleTheme, theme } = usePlayerContext();

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__logo-icon">🎵</span>
        <span className="sidebar__logo-text">Fabify</span>
      </div>

      <nav className="sidebar__nav">
        <button
          className={`sidebar__nav-item ${activeView === 'library' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => onViewChange('library')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          Biblioteca
        </button>

        <button
          className={`sidebar__nav-item ${activeView === 'search' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => onViewChange('search')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          Buscar
        </button>
      </nav>

      <button
        className="sidebar__theme-toggle"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </aside>
  );
}
