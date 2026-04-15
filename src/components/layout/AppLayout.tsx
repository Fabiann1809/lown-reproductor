import { Sidebar } from './Sidebar';
import { PlayerCenter } from './PlayerCenter';
import { RightPanel } from './RightPanel';
import { usePlayerContext } from '../../context/PlayerContext';

export function AppLayout() {
  const { activeView, setActiveView } = usePlayerContext();

  const handleViewChange = (view: typeof activeView) => {
    setActiveView(activeView === view ? 'queue' : view);
  };

  return (
    <div className="app-layout">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      <PlayerCenter />
      <RightPanel activeView={activeView} onViewChange={setActiveView} />
    </div>
  );
}
