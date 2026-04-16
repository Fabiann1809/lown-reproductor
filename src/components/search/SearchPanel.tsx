import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { usePlayerContext } from '../../context/PlayerContext';
import { SongCard } from '../song/SongCard';

export function SearchPanel() {
  const [activeTab, setActiveTab] = useState<'itunes' | 'local'>('itunes');
  const { songs } = usePlayerContext();
  const localSongs = songs.filter((s) => s.source === 'local');

  return (
    <div className="search-panel">
      <div className="search-panel__header">
        <SearchBar />
        <div className="search-tabs">
          <button
            className={`search-tab ${activeTab === 'itunes' ? 'search-tab--active' : ''}`}
            onClick={() => setActiveTab('itunes')}
          >
            iTunes
          </button>
          <button
            className={`search-tab ${activeTab === 'local' ? 'search-tab--active' : ''}`}
            onClick={() => setActiveTab('local')}
          >
            Local
          </button>
        </div>
      </div>

      <div className="search-panel__list">
        {activeTab === 'itunes' ? (
          <SearchResults showQueueActions />
        ) : (
          <div className="song-list">
            {localSongs.length === 0 ? (
              <div className="empty-state">
                <p>No se encontraron archivos locales</p>
                <small>Usa el botón "Subir archivo local" para importar</small>
              </div>
            ) : (
              localSongs.map((song) => (
                <SongCard key={song.id} song={song} showQueueActions />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
