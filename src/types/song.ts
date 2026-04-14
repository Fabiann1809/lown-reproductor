export type SongSource = 'itunes' | 'local';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  artworkUrl: string;
  previewUrl: string;
  source: SongSource;
}

export function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
