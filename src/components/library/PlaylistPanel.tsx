import { usePlayerContext } from '../../context/PlayerContext';
import { SongCard } from '../song/SongCard';
import { formatDuration } from '../../types/song';

export function PlaylistPanel() {
  const { songs, dll, nowPlaying, clearPlaylist, reversePlaylist } = usePlayerContext();

  const totalMs = songs.reduce((acc, s) => acc + (s.durationMs || 0), 0);
  const getNode = (songId: string) => dll.current.findNode((s) => s.id === songId);

  return (
    <div className="queue-panel">
      <div className="queue-panel__header">
        <div className="queue-panel__title-row">
          <h2 className="queue-panel__title">Mi playlist</h2>
          {songs.length > 0 && (
            <span className="queue-panel__meta">
              {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
              {totalMs > 0 && ` · ${formatDuration(totalMs)}`}
            </span>
          )}
        </div>

        {songs.length > 0 && (
          <div className="queue-panel__actions">
            <button className="text-btn" onClick={reversePlaylist} title="Invertir orden">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ marginRight: 4 }}>
                <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3 5 6.99h3V14h2V6.99h3L9 3z"/>
              </svg>
              Invertir
            </button>
            <button className="text-btn text-btn--danger" onClick={clearPlaylist} title="Vaciar cola">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ marginRight: 4 }}>
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              Vaciar
            </button>
          </div>
        )}
      </div>

      <div className="queue-panel__list">
        {songs.length === 0 ? (
          <div className="empty-state">
            <p>Tu cola está vacía</p>
            <small>Busca canciones o sube archivos locales</small>
          </div>
        ) : (
          <div className="song-list">
            {songs.map((song) => {
              const node = getNode(song.id);
              return (
                <SongCard
                  key={song.id}
                  song={song}
                  node={node ?? undefined}
                  showRemove
                  isActive={nowPlaying?.id === song.id}
                  draggable
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
