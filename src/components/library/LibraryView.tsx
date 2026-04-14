import { LocalFileImport } from './LocalFileImport';
import { PlaylistPanel } from './PlaylistPanel';

export function LibraryView() {
  return (
    <div className="library-view">
      <LocalFileImport />
      <PlaylistPanel />
    </div>
  );
}
