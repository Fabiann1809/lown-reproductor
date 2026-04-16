import { usePlayerContext } from '../../context/PlayerContext';
import { SongCard } from '../song/SongCard';

export function HistoryView() {
  const { historyItems } = usePlayerContext();

  return (
    <div className="queue-panel">
      <div className="queue-panel__header">
        <div className="queue-panel__title-row">
          <h2 className="queue-panel__title">Historial</h2>
          {historyItems.length > 0 && (
            <span className="queue-panel__meta">{historyItems.length} {historyItems.length === 1 ? 'canción' : 'canciones'}</span>
          )}
        </div>
      </div>

      <div className="queue-panel__list">
        {historyItems.length === 0 ? (
          <div className="empty-state">
            <p>Tu historial está vacío</p>
            <small>Las canciones que reproduzcas aparecerán aquí</small>
          </div>
        ) : (
          <div className="song-list">
            {[...historyItems].reverse().map((song, i) => (
              <SongCard
                key={`${song.id}-hist-${i}`}
                song={song}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
