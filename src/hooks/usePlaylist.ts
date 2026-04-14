import { useRef, useState, useCallback } from 'react';
import { DoublyLinkedList } from '../lib/DoublyLinkedList';
import type { DLLNode } from '../lib/DoublyLinkedList';
import type { Song } from '../types/song';
import { revokeObjectURL } from '../services/LocalFileService';

export function usePlaylist() {
  const dll = useRef(new DoublyLinkedList<Song>());
  const [songs, setSongs] = useState<Song[]>([]);

  const syncArray = useCallback(() => {
    setSongs(dll.current.toArray());
  }, []);

  const addToQueue = useCallback((song: Song): DLLNode<Song> => {
    const node = dll.current.append(song);
    syncArray();
    return node;
  }, [syncArray]);

  const playNext = useCallback((song: Song, currentNode: DLLNode<Song> | null): DLLNode<Song> => {
    let node: DLLNode<Song>;
    if (currentNode === null) {
      node = dll.current.append(song);
    } else {
      node = dll.current.insertAfter(currentNode, song);
    }
    syncArray();
    return node;
  }, [syncArray]);

  const removeSong = useCallback((node: DLLNode<Song>) => {
    if (node.value.source === 'local') {
      revokeObjectURL(node.value.id);
    }
    dll.current.remove(node);
    syncArray();
  }, [syncArray]);

  const shufflePlaylist = useCallback(() => {
    dll.current.shuffle();
    syncArray();
  }, [syncArray]);

  const clearPlaylist = useCallback(() => {
    for (const song of dll.current.toArray()) {
      if (song.source === 'local') revokeObjectURL(song.id);
    }
    dll.current.clear();
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
    clearPlaylist,
    updateSongDuration,
  };
}
