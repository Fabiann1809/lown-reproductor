import { usePlayerContext } from '../../context/PlayerContext';

export function PlayerControls() {
  const { isPlaying, togglePlay, next, prev, seek, nowPlaying } = usePlayerContext();
  const disabled = !nowPlaying;

  return (
    <div className="player-controls">
      <button
        className="control-btn control-btn--secondary"
        onClick={() => seek(-10)}
        disabled={disabled}
        title="-10 segundos"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          <text x="8" y="15" fontSize="6" fill="currentColor" fontWeight="bold">10</text>
        </svg>
      </button>

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

      <button
        className="control-btn control-btn--play"
        onClick={togglePlay}
        disabled={disabled}
        title={isPlaying ? 'Pausar' : 'Reproducir'}
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

      <button
        className="control-btn control-btn--secondary"
        onClick={() => seek(10)}
        disabled={disabled}
        title="+10 segundos"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
          <text x="8" y="15" fontSize="6" fill="currentColor" fontWeight="bold">10</text>
        </svg>
      </button>
    </div>
  );
}
