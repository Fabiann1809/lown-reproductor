import { useState } from 'react';
import type { Song } from '../../types/song';
import type { DLLNode } from '../../lib/DoublyLinkedList';
import { ContextMenu } from './ContextMenu';
import { usePlayerContext } from '../../context/PlayerContext';
import { formatDuration } from '../../types/song';

interface SongCardProps {
  song: Song;
  node?: DLLNode<Song>;
  showRemove?: boolean;
  isActive?: boolean;
}

export function SongCard({ song, node, showRemove = false, isActive = false }: SongCardProps) {
  const { playSong, playNext, addToQueue, removeSong, currentNode, dll } = usePlayerContext();
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  const resolveNode = (): DLLNode<Song> => {
    if (node) return node;
    const found = dll.current.findNode((s) => s.id === song.id);
    if (found) return found;
    return addToQueue(song);
  };

  const handlePlayNow = () => {
    const n = resolveNode();
    playSong(n);
  };

  const handlePlayNext = () => {
    playNext(song, currentNode.current);
  };

  const handleAddToQueue = () => {
    addToQueue(song);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleMenuButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom });
  };

  return (
    <>
      <div
        className={`song-card ${isActive ? 'song-card--active' : ''}`}
        onContextMenu={handleContextMenu}
        onClick={handlePlayNow}
      >
        {song.artworkUrl ? (
          <img src={song.artworkUrl} alt={song.title} className="song-card__artwork" />
        ) : (
          <div className="song-card__artwork song-card__artwork--placeholder">
            {song.artist.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="song-card__info">
          <span className="song-card__title">{song.title}</span>
          <span className="song-card__artist">{song.artist}</span>
        </div>

        <span className="song-card__duration">{formatDuration(song.durationMs)}</span>

        <div className="song-card__actions">
          <button className="icon-btn" onClick={handleMenuButton} title="Opciones">
            ⋮
          </button>
          {showRemove && node && (
            <button className="icon-btn icon-btn--danger" onClick={(e) => { e.stopPropagation(); removeSong(node); }} title="Eliminar">
              ✕
            </button>
          )}
        </div>
      </div>

      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onPlayNow={handlePlayNow}
          onPlayNext={handlePlayNext}
          onAddToQueue={handleAddToQueue}
          onClose={() => setMenuPos(null)}
        />
      )}
    </>
  );
}
