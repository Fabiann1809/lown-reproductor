import { NowPlaying } from '../player/NowPlaying';
import { ProgressBar } from '../player/ProgressBar';
import { PlayerControls } from '../player/PlayerControls';
import { VolumeRepeatShuffle } from '../player/VolumeRepeatShuffle';
import { WaveformVisualizer } from '../player/WaveformVisualizer';
import { DynamicBackground } from '../player/DynamicBackground';
import { CenterSearch } from '../search/CenterSearch';

export function PlayerCenter() {
  return (
    <main className="player-center">
      {/* z-index 0 — fondo dinámico con artwork difuminado */}
      <DynamicBackground />

      {/* z-index 1 — resplandor dorado ambiental */}
      <div className="player-center__glow" aria-hidden="true" />

      {/* z-index 3 — buscador encima del tocadiscos */}
      <CenterSearch />

      {/* z-index 2 — tocadiscos */}
      <div className="player-center__stage">
        <NowPlaying />
      </div>

      {/* z-index 3 — barra de controles estilo Spotify */}
      <div className="player-center__controls">
        {/* Visualizador de ondas en el fondo */}
        <WaveformVisualizer />

        {/* Fila superior: [spacer] [5 botones centrales] [volumen] */}
        <div className="player-center__ctrl-row">
          <div className="player-center__ctrl-side" />
          <PlayerControls />
          <div className="player-center__ctrl-side player-center__ctrl-side--right">
            <VolumeRepeatShuffle />
          </div>
        </div>

        {/* Barra de progreso con timestamps */}
        <ProgressBar />
      </div>
    </main>
  );
}
