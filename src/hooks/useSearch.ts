import { useState, useEffect, useRef } from 'react';
import type { Song } from '../types/song';
import { searchSongs } from '../services/iTunesService';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const songs = await searchSongs(query, controller.signal);
        setResults(songs);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError('Error al buscar canciones. Intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return { query, setQuery, results, isLoading, error };
}
