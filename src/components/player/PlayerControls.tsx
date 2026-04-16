import { usePlayerContext } from '../../context/PlayerContext';
import type { RepeatMode } from '../../hooks/usePlayer';

function RepeatIcon({ mode }: { mode: RepeatMode }) {
  if (mode === 'one') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
    </svg>
  );
}

export function PlayerControls() {
  const {
    isPlaying, togglePlay, next, prev, nowPlaying,
    isShuffle, toggleShuffle,
    repeatMode, cycleRepeatMode,
  } = usePlayerContext();
  const disabled = !nowPlaying;

  return (
    <div className="player-controls">
      {/* Shuffle */}
      <button
        className={`mode-btn ${isShuffle ? 'mode-btn--active' : ''}`}
        onClick={toggleShuffle}
        title="Aleatorio"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
        </svg>
      </button>

      {/* Prev */}
      <button
        className="control-btn control-btn--secondary"
        onClick={prev}
        disabled={disabled}
        title="Anterior"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
        </svg>
      </button>

      {/* Play / Pause */}
      <button
        className="control-btn control-btn--play"
        onClick={togglePlay}
        disabled={disabled}
        title={isPlaying ? 'Pausa' : 'Reproducir'}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>

      {/* Next */}
      <button
        className="control-btn control-btn--secondary"
        onClick={next}
        disabled={disabled}
        title="Siguiente"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 3.9V8.1L8.5 12zM16 6h2v12h-2z"/>
        </svg>
      </button>

      {/* Repeat */}
      <button
        className={`mode-btn ${repeatMode !== 'none' ? 'mode-btn--active' : ''}`}
        onClick={cycleRepeatMode}
        title={repeatMode === 'none' ? 'Repetir todo' : repeatMode === 'all' ? 'Repetir una' : 'Sin repetición'}
      >
        <RepeatIcon mode={repeatMode} />
      </button>
    </div>
  );
}
