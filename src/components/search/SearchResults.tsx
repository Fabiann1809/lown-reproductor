import { usePlayerContext } from '../../context/PlayerContext';
import { SongCard } from '../song/SongCard';

interface SearchResultsProps {
  showQueueActions?: boolean;
}

export function SearchResults({ showQueueActions = false }: SearchResultsProps) {
  const { results, isLoading, searchError, query } = usePlayerContext();

  if (!query.trim()) {
    return (
      <div className="empty-state">
        <p>Busca tus canciones favoritas</p>
        <small>Escribe el nombre de un artista o canción</small>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="spinner" />
        <p>Buscando...</p>
      </div>
    );
  }

  if (searchError) {
    return (
      <div className="empty-state empty-state--error">
        <p>{searchError}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="empty-state">
        <p>No se encontraron resultados para "{query}"</p>
      </div>
    );
  }

  return (
    <div className="song-list">
      {results.map((song) => (
        <SongCard key={song.id} song={song} showQueueActions={showQueueActions} />
      ))}
    </div>
  );
}
