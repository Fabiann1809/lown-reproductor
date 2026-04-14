import { NowPlaying } from './NowPlaying';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { VolumeRepeatShuffle } from './VolumeRepeatShuffle';

export function PlayerBar() {
  return (
    <div className="player-bar">
      <NowPlaying />
      <div className="player-bar__bottom">
        <ProgressBar />
        <div className="player-bar__controls-row">
          <PlayerControls />
          <VolumeRepeatShuffle />
        </div>
      </div>
    </div>
  );
}
