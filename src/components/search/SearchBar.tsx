import { usePlayerContext } from '../../context/PlayerContext';

export function SearchBar() {
  const { query, setQuery, isLoading } = usePlayerContext();

  return (
    <div className="search-bar">
      <span className="search-bar__icon">{isLoading ? '⟳' : '🔍'}</span>
      <input
        type="text"
        className="search-bar__input"
        placeholder="Buscar artistas, canciones..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Buscar canciones"
      />
      {query && (
        <button className="search-bar__clear" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
          ✕
        </button>
      )}
    </div>
  );
}
