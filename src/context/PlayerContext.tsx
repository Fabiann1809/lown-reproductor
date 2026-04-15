import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import { usePlaylist } from '../hooks/usePlaylist';
import { useSearch } from '../hooks/useSearch';
import type { Song } from '../types/song';
import type { NodoCancion } from '../lib/Cola';
import type { Cola } from '../lib/Cola';
import type { RepeatMode } from '../hooks/usePlayer';

export type ActiveView = 'queue' | 'library' | 'history';

interface PlayerContextValue {
  // Player state
  nowPlaying: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  historyItems: Song[];
  currentNode: React.MutableRefObject<NodoCancion<Song> | null>;
  // Player actions
  playSong: (node: NodoCancion<Song>) => void;
  next: () => void;
  prev: () => void;
  togglePlay: () => void;
  seek: (delta: number) => void;
  seekTo: (time: number) => void;
  setVolumeLevel: (v: number) => void;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
  // Playlist state
  songs: Song[];
  // Playlist actions
  addToQueue: (song: Song) => NodoCancion<Song>;
  playNext: (song: Song, currentNode: NodoCancion<Song> | null) => NodoCancion<Song>;
  removeSong: (node: NodoCancion<Song>) => void;
  shufflePlaylist: () => void;
  reversePlaylist: () => void;
  clearPlaylist: () => void;
  updateSongDuration: (songId: string, durationMs: number) => void;
  moveNode: (draggedId: string, afterId: string | null) => void;
  dll: React.MutableRefObject<Cola<Song>>;
  // Search state
  query: string;
  setQuery: (q: string) => void;
  results: Song[];
  isLoading: boolean;
  searchError: string | null;
  // UI state
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const player   = usePlayer();
  const playlist = usePlaylist();
  const search   = useSearch();
  const [activeView, setActiveView] = useState<ActiveView>('queue');

  const handleToggleShuffle = () => {
    if (!player.isShuffle) {
      // Activar: mezclar dejando la canción actual al principio
      playlist.shufflePlaylist(player.currentNode.current);
    } else {
      // Desactivar: restaurar el orden original con la canción actual primero
      playlist.restoreOriginalOrder(player.currentNode.current);
    }
    player.toggleShuffle();
  };

  const addToQueue = useCallback((song: Song): NodoCancion<Song> => {
    const node = playlist.addToQueue(song);
    setActiveView('queue');
    return node;
  }, [playlist]);

  const playNext = useCallback((song: Song, currentNode: NodoCancion<Song> | null): NodoCancion<Song> => {
    const node = playlist.playNext(song, currentNode);
    setActiveView('queue');
    return node;
  }, [playlist]);

  const value: PlayerContextValue = {
    nowPlaying:          player.nowPlaying,
    isPlaying:           player.isPlaying,
    currentTime:         player.currentTime,
    duration:            player.duration,
    volume:              player.volume,
    repeatMode:          player.repeatMode,
    isShuffle:           player.isShuffle,
    historyItems:        player.historyItems,
    currentNode:         player.currentNode,
    playSong:            player.playSong,
    next:                player.next,
    prev:                player.prev,
    togglePlay:          player.togglePlay,
    seek:                player.seek,
    seekTo:              player.seekTo,
    setVolumeLevel:      player.setVolumeLevel,
    cycleRepeatMode:     player.cycleRepeatMode,
    toggleShuffle:       handleToggleShuffle,
    songs:               playlist.songs,
    addToQueue,
    playNext,
    removeSong:          playlist.removeSong,
    shufflePlaylist:     playlist.shufflePlaylist,
    reversePlaylist:     playlist.reversePlaylist,
    clearPlaylist:       playlist.clearPlaylist,
    updateSongDuration:  playlist.updateSongDuration,
    moveNode:            playlist.moveNode,
    dll:                 playlist.dll,
    query:               search.query,
    setQuery:            search.setQuery,
    results:             search.results,
    isLoading:           search.isLoading,
    searchError:         search.error,
    activeView,
    setActiveView,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayerContext(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayerContext must be used within PlayerProvider');
  return ctx;
}
