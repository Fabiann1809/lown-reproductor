import { usePlayerContext } from '../../context/PlayerContext';
import { SongCard } from '../song/SongCard';
import { PlaylistPanel } from '../library/PlaylistPanel';
import { HistoryView } from '../library/HistoryView';
import { formatDuration } from '../../types/song';
import type { ActiveView } from '../../context/PlayerContext';
import type { Song } from '../../types/song';

// ─── Queue info panel ────────────────────────────────────────

function NowPlayingCard({ song }: { song: Song }) {
  return (
    <div className="queue-now-playing">
      {song.artworkUrl ? (
        <img
          src={song.artworkUrl}
          alt={song.title}
          className="queue-now-playing__artwork"
        />
      ) : (
        <div className="queue-now-playing__artwork queue-now-playing__artwork--placeholder">
          {song.artist.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="queue-now-playing__info">
        <p className="queue-now-playing__title">{song.title}</p>
        <p className="queue-now-playing__artist">{song.artist}</p>
        {song.durationMs > 0 && (
          <p className="queue-now-playing__duration">{formatDuration(song.durationMs)}</p>
        )}
      </div>
    </div>
  );
}

function QueueInfoPanel() {
  const { nowPlaying, songs, dll } = usePlayerContext();

  // Upcoming songs: everything after the current song in the array
  const currentIdx = nowPlaying ? songs.findIndex((s) => s.id === nowPlaying.id) : -1;
  const upcomingSongs = currentIdx >= 0 ? songs.slice(currentIdx + 1) : songs;

  const getNode = (songId: string) => dll.current.findNode((s) => s.id === songId);

  return (
    <div className="queue-info">
      {/* ─ Estás escuchando ─ */}
      <section className="queue-section">
        <p className="queue-section__label">ESTÁS ESCUCHANDO</p>
        {nowPlaying ? (
          <NowPlayingCard song={nowPlaying} />
        ) : (
          <p className="queue-section__empty">Selecciona una canción para empezar</p>
        )}
      </section>

      {/* ─ Siguiente en la fila ─ */}
      <section className="queue-section queue-section--scrollable">
        <p className="queue-section__label">
          SIGUIENTE EN LA FILA
          {upcomingSongs.length > 0 && (
            <span className="queue-section__count"> · {upcomingSongs.length}</span>
          )}
        </p>

        {upcomingSongs.length === 0 ? (
          <p className="queue-section__empty">
            {songs.length === 0
              ? 'Añade canciones a tu playlist'
              : 'No hay más canciones en la fila'}
          </p>
        ) : (
          <div className="song-list">
            {upcomingSongs.map((song) => {
              const node = getNode(song.id);
              return (
                <SongCard
                  key={song.id}
                  song={song}
                  node={node ?? undefined}
                  showRemove
                  draggable
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Right panel wrapper ─────────────────────────────────────

interface RightPanelProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

const VIEW_TITLES: Record<Exclude<ActiveView, 'queue'>, string> = {
  library:  'Mi playlist',
  history:  'Historial',
};

export function RightPanel({ activeView, onViewChange }: RightPanelProps) {
  const isQueue = activeView === 'queue';

  return (
    <aside className="right-panel">
      {/* Header */}
      <div className="right-panel__header">
        {isQueue ? (
          <h2 className="right-panel__title">Fila de reproducción</h2>
        ) : (
          <>
            <h2 className="right-panel__title">{VIEW_TITLES[activeView]}</h2>
            <button
              className="right-panel__back"
              onClick={() => onViewChange('queue')}
              title="Volver a la cola"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Cola
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="right-panel__content">
        {isQueue                   && <QueueInfoPanel />}
        {activeView === 'library'  && <PlaylistPanel />}
        {activeView === 'history'  && <HistoryView />}
      </div>
    </aside>
  );
}
