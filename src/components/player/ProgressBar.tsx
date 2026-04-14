import { usePlayerContext } from '../../context/PlayerContext';
import { formatTime } from '../../types/song';

export function ProgressBar() {
  const { currentTime, duration, seekTo } = usePlayerContext();
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  return (
    <div className="progress-bar">
      <span className="progress-bar__time">{formatTime(currentTime)}</span>
      <div className="progress-bar__track">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleChange}
          className="progress-bar__slider"
          style={{ '--percent': `${percent}%` } as React.CSSProperties}
          aria-label="Progreso de reproducción"
        />
      </div>
      <span className="progress-bar__time">{formatTime(duration)}</span>
    </div>
  );
}
