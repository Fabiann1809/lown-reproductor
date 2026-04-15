import { useState, useRef } from 'react';
import type { Song } from '../../types/song';
import type { NodoCancion } from '../../lib/Cola';
import { ContextMenu } from './ContextMenu';
import { usePlayerContext } from '../../context/PlayerContext';
import { formatDuration } from '../../types/song';

// Variable de módulo: ID de la canción siendo arrastrada en este momento.
// Se comparte entre todas las instancias de SongCard sin provocar re-renders.
let activeDragId: string | null = null;

interface SongCardProps {
  song: Song;
  node?: NodoCancion<Song>;
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
  // Ref para la posición actual: evita el cierre desactualizado en handleDrop
  const dropPosRef = useRef<'above' | 'below' | null>(null);

  // ── Reproducción ────────────────────────────────────────────
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

  // ── Drag & Drop ─────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    activeDragId = song.id;
    e.dataTransfer.setData('text/plain', song.id);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('song-card--dragging');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    activeDragId = null;
    e.currentTarget.classList.remove('song-card--dragging');
    dropPosRef.current = null;
    setDropIndicator(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Ignorar si no hay drag activo, si es la misma canción, o si no hay nodo
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
    // Solo limpiar si el cursor realmente sale de la card (no a un hijo)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      dropPosRef.current = null;
      setDropIndicator(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    const pos = dropPosRef.current; // leer del ref, no del estado

    dropPosRef.current = null;
    setDropIndicator(null);

    if (!draggedId || draggedId === song.id || !node) return;

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
            <button className="queue-action-btn" onClick={handlePlayNext} title="Reproducir a continuación">
              Sig.
            </button>
            <button className="queue-action-btn" onClick={handleAddToQueue} title="Agregar al final">
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
