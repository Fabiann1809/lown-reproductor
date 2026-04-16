import { useState, useRef, useEffect } from 'react';
import type { Song } from '../../types/song';
import type { SongNode } from '../../lib/Queue';
import { ContextMenu } from './ContextMenu';
import { usePlayerContext } from '../../context/PlayerContext';
import { formatDuration } from '../../types/song';

// Module-level variable: ID of the song being dragged.
// Shared across SongCard instances without triggering re-renders.
let activeDragId: string | null = null;

// Global registry of indicator cleanup functions.
// Lets handleDragEnd clean ALL cards, not just the dragged one.
const indicatorCleanups = new Set<() => void>();

interface SongCardProps {
  song: Song;
  node?: SongNode<Song>;
  showRemove?: boolean;
  showQueueActions?: boolean;
  isActive?: boolean;
  draggable?: boolean;
}

export function SongCard({
  song,
  node,
  showRemove = false,
  showQueueActions = false,
  isActive = false,
  draggable = false,
}: SongCardProps) {
  const { playSong, playNext, addToQueue, removeSong, moveNode, currentNode, dll } = usePlayerContext();
  const [menuPos, setMenuPos]       = useState<{ x: number; y: number } | null>(null);
  const [dropIndicator, setDropIndicator] = useState<'above' | 'below' | null>(null);
  const dropPosRef = useRef<'above' | 'below' | null>(null);

  // Register/unregister this card cleanup in the global registry.
  useEffect(() => {
    const cleanup = () => {
      dropPosRef.current = null;
      setDropIndicator(null);
    };
    indicatorCleanups.add(cleanup);
    return () => { indicatorCleanups.delete(cleanup); };
  }, []);

  // Playback
  const handlePlayNow = () => {
    if (node) { playSong(node); return; }
    const found = dll.current.findNode((s) => s.id === song.id);
    if (found) { playSong(found); return; }
    const newNode = playNext(song, currentNode.current);
    playSong(newNode);
  };

  const handlePlayNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    playNext(song, currentNode.current);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    activeDragId = song.id;
    e.dataTransfer.setData('text/plain', song.id);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('song-card--dragging');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    activeDragId = null;
    e.currentTarget.classList.remove('song-card--dragging');
    // Clear indicators on ALL cards, not only the dragged card.
    indicatorCleanups.forEach((fn) => fn());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Ignore if there is no active drag, same song, or missing target node.
    if (!activeDragId || activeDragId === song.id || !node) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const pos: 'above' | 'below' = e.clientY < rect.top + rect.height / 2 ? 'above' : 'below';
    if (pos !== dropPosRef.current) {
      dropPosRef.current = pos;
      setDropIndicator(pos);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear when cursor actually leaves the card (not entering a child).
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      dropPosRef.current = null;
      setDropIndicator(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');

    // Clear all indicators before processing drop.
    indicatorCleanups.forEach((fn) => fn());

    if (!draggedId || draggedId === song.id || !node) return;

    // Recompute drop position from event to avoid timing issues where
    // handleDragLeave clears dropPosRef right before drop.
    const rect = e.currentTarget.getBoundingClientRect();
    const pos: 'above' | 'below' = e.clientY < rect.top + rect.height / 2 ? 'above' : 'below';

    if (pos === 'above') {
      moveNode(draggedId, node.prev?.value.id ?? null);
    } else {
      moveNode(draggedId, song.id);
    }
  };

  const dragHandlers = draggable && node ? {
    draggable: true,
    onDragStart:  handleDragStart,
    onDragEnd:    handleDragEnd,
    onDragOver:   handleDragOver,
    onDragLeave:  handleDragLeave,
    onDrop:       handleDrop,
  } : {};

  return (
    <>
      <div
        className={[
          'song-card',
          isActive                    ? 'song-card--active'     : '',
          dropIndicator === 'above'   ? 'song-card--drop-above' : '',
          dropIndicator === 'below'   ? 'song-card--drop-below' : '',
        ].filter(Boolean).join(' ')}
        onClick={handlePlayNow}
        onContextMenu={!showQueueActions ? handleContextMenu : undefined}
        {...dragHandlers}
      >
        {draggable && node && (
          <span
            className="song-card__drag-handle"
            title="Arrastrar para mover"
            onClick={(e) => e.stopPropagation()}
          >
            ⠿
          </span>
        )}

        {song.artworkUrl ? (
          <img
            src={song.artworkUrl}
            alt={song.title}
            className="song-card__artwork"
            draggable={false}
          />
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

        {showQueueActions ? (
          <div className="song-queue-actions">
            <button className="queue-action-btn" onClick={handlePlayNext} title="Reproducir siguiente">
              Siguiente
            </button>
            <button className="queue-action-btn" onClick={handleAddToQueue} title="Añadir al final">
              Final
            </button>
          </div>
        ) : (
          <div className="song-card__actions">
            <button className="icon-btn" onClick={handleMenuButton} title="Opciones">
              ⋮
            </button>
            {showRemove && node && (
              <button
                className="icon-btn icon-btn--danger"
                onClick={(e) => { e.stopPropagation(); removeSong(node); }}
                title="Eliminar"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {menuPos && !showQueueActions && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onPlayNow={handlePlayNow}
          onPlayNext={() => playNext(song, currentNode.current)}
          onAddToQueue={() => addToQueue(song)}
          onClose={() => setMenuPos(null)}
        />
      )}
    </>
  );
}
