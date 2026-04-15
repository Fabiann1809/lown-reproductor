import { useRef, useEffect, useState } from 'react';
import { usePlayerContext } from '../../context/PlayerContext';
import { SongCard } from '../song/SongCard';

export function CenterSearch() {
  const { query, setQuery, results, isLoading, searchError } = usePlayerContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div className="center-search" ref={containerRef}>
      {/* Barra de búsqueda */}
      <div className={`center-search__bar ${showDropdown ? 'center-search__bar--open' : ''}`}>
        <svg className="center-search__icon" viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          type="text"
          className="center-search__input"
          placeholder="Buscar canciones, artistas..."
          value={query}
          onChange={handleChange}
          onFocus={() => query.trim() && setIsOpen(true)}
          aria-label="Buscar canciones"
        />
        {query && (
          <button className="center-search__clear" onClick={handleClear} aria-label="Limpiar búsqueda">
            ✕
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && (
        <div className="center-search__dropdown">
          {isLoading && (
            <div className="center-search__state">
              <div className="spinner" />
              <span>Buscando...</span>
            </div>
          )}

          {!isLoading && searchError && (
            <div className="center-search__state center-search__state--error">
              {searchError}
            </div>
          )}

          {!isLoading && !searchError && results.length === 0 && (
            <div className="center-search__state">
              No se encontraron resultados para "{query}"
            </div>
          )}

          {!isLoading && !searchError && results.length > 0 && (
            <div className="song-list">
              {results.map((song) => (
                <SongCard key={song.id} song={song} showQueueActions />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
