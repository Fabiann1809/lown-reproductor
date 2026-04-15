import { useRef, useState, useEffect, useCallback } from 'react';
import { Historial } from '../lib/Historial';
import type { NodoCancion } from '../lib/Cola';
import type { Song } from '../types/song';

export type RepeatMode = 'none' | 'one' | 'all';

export function usePlayer() {
  const audioRef = useRef(new Audio());
  const history = useRef(new Historial<Song>());
  const currentNode = useRef<NodoCancion<Song> | null>(null);

  const [nowPlaying, setNowPlaying] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [isShuffle, setIsShuffle] = useState(false);
  const [historyItems, setHistoryItems] = useState<Song[]>([]);

  const onShufflePlaylist = useRef<(() => void) | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => handleSongEnded();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushToHistory = useCallback((song: Song) => {
    history.current.push(song);
    setHistoryItems((prev) => [...prev, song]);
  }, []);

  const popFromHistory = useCallback((): Song | undefined => {
    const song = history.current.pop();
    if (song !== undefined) {
      setHistoryItems((prev) => prev.slice(0, -1));
    }
    return song;
  }, []);

  const playSong = useCallback((node: NodoCancion<Song>) => {
    const audio = audioRef.current;
    if (currentNode.current && currentNode.current.value.id !== node.value.id) {
      pushToHistory(currentNode.current.value);
    }
    currentNode.current = node;
    audio.src = node.value.previewUrl;
    audio.load();
    audio.play().catch(() => {});
    setNowPlaying(node.value);
    setCurrentTime(0);
    setDuration(0);
  }, [pushToHistory]);

  const next = useCallback(() => {
    const node = currentNode.current;
    if (!node) return;
    if (currentNode.current) {
      pushToHistory(currentNode.current.value);
    }
    const nextNode = node.next;
    if (nextNode) {
      currentNode.current = nextNode;
      const audio = audioRef.current;
      audio.src = nextNode.value.previewUrl;
      audio.load();
      audio.play().catch(() => {});
      setNowPlaying(nextNode.value);
      setCurrentTime(0);
      setDuration(0);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [pushToHistory]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const previous = popFromHistory();
    if (!previous) {
      audio.currentTime = 0;
      return;
    }
    const dll = currentNode.current;
    if (!dll) return;
    let cursor: NodoCancion<Song> | null = currentNode.current;
    while (cursor && cursor.value.id !== previous.id) {
      cursor = cursor.prev;
    }
    if (!cursor) {
      cursor = currentNode.current;
      while (cursor && cursor.value.id !== previous.id) {
        cursor = cursor.next;
      }
    }
    if (cursor) {
      currentNode.current = cursor;
      audio.src = cursor.value.previewUrl;
      audio.load();
      audio.play().catch(() => {});
      setNowPlaying(cursor.value);
      setCurrentTime(0);
      setDuration(0);
    } else {
      audio.currentTime = 0;
    }
  }, [popFromHistory]);

  const handleSongEnded = useCallback(() => {
    const node = currentNode.current;
    if (!node) return;

    const currentRepeat = repeatMode;

    if (currentRepeat === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    if (currentRepeat === 'all') {
      const nextNode = node.next ?? (node as NodoCancion<Song> & { _head?: NodoCancion<Song> })._head;
      if (node.next) {
        pushToHistory(node.value);
        currentNode.current = node.next;
        const audio = audioRef.current;
        audio.src = node.next.value.previewUrl;
        audio.load();
        audio.play().catch(() => {});
        setNowPlaying(node.next.value);
        setCurrentTime(0);
        setDuration(0);
      } else {
        onShufflePlaylist.current?.();
      }
      void nextNode;
      return;
    }

    // none
    if (node.next) {
      pushToHistory(node.value);
      currentNode.current = node.next;
      const audio = audioRef.current;
      audio.src = node.next.value.previewUrl;
      audio.load();
      audio.play().catch(() => {});
      setNowPlaying(node.next.value);
      setCurrentTime(0);
      setDuration(0);
    } else {
      setIsPlaying(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatMode, pushToHistory]);

  // Re-attach ended listener when repeatMode changes
  useEffect(() => {
    const audio = audioRef.current;
    audio.removeEventListener('ended', handleSongEnded);
    audio.addEventListener('ended', handleSongEnded);
    return () => {
      audio.removeEventListener('ended', handleSongEnded);
    };
  }, [handleSongEnded]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const seek = useCallback((delta: number) => {
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + delta);
  }, []);

  const seekTo = useCallback((time: number) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolumeLevel = useCallback((v: number) => {
    audioRef.current.volume = v;
    setVolume(v);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  return {
    audioRef,
    currentNode,
    nowPlaying,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    isShuffle,
    historyItems,
    playSong,
    next,
    prev,
    togglePlay,
    seek,
    seekTo,
    setVolumeLevel,
    cycleRepeatMode,
    toggleShuffle,
    onShufflePlaylist,
  };
}
