import { usePlayerContext } from '../../context/PlayerContext';
import { SongCard } from '../song/SongCard';

export function PlaylistPanel() {
  const { songs, dll, nowPlaying, clearPlaylist } = usePlayerContext();

  if (songs.length === 0) {
    return (
      <div className="empty-state">
        <p>Tu cola está vacía</p>
        <small>Busca canciones o importa archivos locales</small>
      </div>
    );
  }

  const getNode = (songId: string) => dll.current.findNode((s) => s.id === songId);

  return (
    <div className="playlist-panel">
      <div className="playlist-panel__header">
        <span className="playlist-panel__count">{songs.length} canciones</span>
        <button className="text-btn" onClick={clearPlaylist}>Limpiar</button>
      </div>
      <div className="song-list">
        {songs.map((song) => {
          const node = getNode(song.id);
          return (
            <SongCard
              key={song.id}
              song={song}
              node={node ?? undefined}
              showRemove
              isActive={nowPlaying?.id === song.id}
            />
          );
        })}
      </div>
    </div>
  );
}
