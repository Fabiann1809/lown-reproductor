import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { LibraryView } from '../library/LibraryView';
import { SearchBar } from '../search/SearchBar';
import { SearchResults } from '../search/SearchResults';
import { PlayerBar } from '../player/PlayerBar';

export function AppLayout() {
  const [activeView, setActiveView] = useState<'library' | 'search'>('library');

  return (
    <div className="app-layout">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="app-main">
        {activeView === 'search' && (
          <div className="app-main__search">
            <SearchBar />
            <SearchResults />
          </div>
        )}
        {activeView === 'library' && <LibraryView />}
      </main>

      <PlayerBar />
    </div>
  );
}
