import { useRef, useState, useCallback } from 'react';
import { Cola } from '../lib/Cola';
import type { NodoCancion } from '../lib/Cola';
import type { Song } from '../types/song';
import { revokeObjectURL } from '../services/LocalFileService';



export function usePlaylist() {
  const dll           = useRef(new Cola<Song>());
  // Guarda los IDs en el orden original antes de hacer shuffle
  const originalOrder = useRef<string[] | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);

  const syncArray = useCallback(() => {
    setSongs(dll.current.toArray());
  }, []);

  const addToQueue = useCallback((song: Song): NodoCancion<Song> => {
    const node = dll.current.append(song);
    syncArray();
    return node;
  }, [syncArray]);

  const playNext = useCallback((song: Song, currentNode: NodoCancion<Song> | null): NodoCancion<Song> => {
    let node: NodoCancion<Song>;
    if (currentNode === null) {
      node = dll.current.append(song);
    } else {
      node = dll.current.insertAfter(currentNode, song);
    }
    syncArray();
    return node;
  }, [syncArray]);

  const removeSong = useCallback((node: NodoCancion<Song>) => {
    if (node.value.source === 'local') {
      revokeObjectURL(node.value.id);
    }
    dll.current.remove(node);
    syncArray();
  }, [syncArray]);

  // Guarda el orden original (como IDs) y mezcla sin destruir nodos
  const shufflePlaylist = useCallback((anchorNode?: NodoCancion<Song> | null) => {
    if (originalOrder.current === null) {
      originalOrder.current = dll.current.toArray().map(s => s.id);
    }
    dll.current.shuffleNodes(anchorNode);
    syncArray();
  }, [syncArray]);

  // Restaura el orden anterior buscando cada nodo por ID.
  // Si se pasa anchorNode (canción actual), rota la lista para que quede
  // primera — igual que al activar shuffle — así nada "desaparece" de la fila.
  const restoreOriginalOrder = useCallback((anchorNode?: NodoCancion<Song> | null) => {
    if (!originalOrder.current) return;

    const savedIds = originalOrder.current;
    const restoredNodes: NodoCancion<Song>[] = [];
    for (const id of savedIds) {
      const node = dll.current.findNode(s => s.id === id);
      if (node) restoredNodes.push(node);
    }

    // Canciones añadidas durante el shuffle van al final
    const restoredSet = new Set(restoredNodes);
    const newNodes = dll.current.getNodes().filter(n => !restoredSet.has(n));
    let finalOrder = [...restoredNodes, ...newNodes];

    // Rotar para que la canción actual quede primera
    if (anchorNode) {
      const anchorIdx = finalOrder.indexOf(anchorNode);
      if (anchorIdx > 0) {
        finalOrder = [...finalOrder.slice(anchorIdx), ...finalOrder.slice(0, anchorIdx)];
      }
    }

    dll.current.reorderNodes(finalOrder);
    originalOrder.current = null;
    syncArray();
  }, [syncArray]);

  const reversePlaylist = useCallback(() => {
    dll.current.reverse();
    syncArray();
  }, [syncArray]);

  const clearPlaylist = useCallback(() => {
    for (const song of dll.current.toArray()) {
      if (song.source === 'local') revokeObjectURL(song.id);
    }
    dll.current.clear();
    syncArray();
  }, [syncArray]);

  const moveNode = useCallback((draggedId: string, afterId: string | null) => {
    const draggedNode = dll.current.findNode((s) => s.id === draggedId);
    if (!draggedNode) return;
    if (afterId === null) {
      dll.current.moveAfter(draggedNode, null);
    } else {
      const afterNode = dll.current.findNode((s) => s.id === afterId);
      if (!afterNode) return;
      dll.current.moveAfter(draggedNode, afterNode);
    }
    syncArray();
  }, [syncArray]);

  const updateSongDuration = useCallback((songId: string, durationMs: number) => {
    const node = dll.current.findNode((s) => s.id === songId);
    if (node) {
      node.value = { ...node.value, durationMs };
      syncArray();
    }
  }, [syncArray]);

  return {
    dll,
    songs,
    addToQueue,
    playNext,
    removeSong,
    shufflePlaylist,
    restoreOriginalOrder,
    reversePlaylist,
    clearPlaylist,
    updateSongDuration,
    moveNode,
  };
}
