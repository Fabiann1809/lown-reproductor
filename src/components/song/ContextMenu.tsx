import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ContextMenuProps {
  x: number;
  y: number;
  onPlayNow: () => void;
  onPlayNext: () => void;
  onAddToQueue: () => void;
  onClose: () => void;
}

export function ContextMenu({ x, y, onPlayNow, onPlayNext, onAddToQueue, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  const clampedX = Math.min(x, window.innerWidth - 200);
  const clampedY = Math.min(y, window.innerHeight - 130);

  const menu = (
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: clampedY, left: clampedX, zIndex: 9999 }}
      className="context-menu"
    >
      <button className="context-menu-item" onClick={() => { onPlayNow(); onClose(); }}>
        <span>▶</span> Reproducir ahora
      </button>
      <button className="context-menu-item" onClick={() => { onPlayNext(); onClose(); }}>
        <span>⏭</span> Reproducir siguiente
      </button>
      <button className="context-menu-item" onClick={() => { onAddToQueue(); onClose(); }}>
        <span>+</span> Agregar a la cola
      </button>
    </div>
  );

  return ReactDOM.createPortal(menu, document.body);
}
