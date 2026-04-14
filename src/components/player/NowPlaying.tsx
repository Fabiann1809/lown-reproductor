import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerContext } from '../../context/PlayerContext';
import type { Song } from '../../types/song';

// Generate a deterministic color from a string
function colorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 45%, 35%)`;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Vinyl disc SVG with concentric grooves
function VinylDisc({ artworkUrl, artist, spinning }: {
  artworkUrl: string;
  artist: string;
  spinning: boolean;
}) {
  const grooves = Array.from({ length: 14 }, (_, i) => 115 - i * 6);
  const initials = artist.slice(0, 2).toUpperCase();
  const bgColor = colorFromString(artist);

  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      className={`vinyl-disc ${spinning ? 'vinyl-disc--spinning' : ''}`}
    >
      {/* Outer disc */}
      <circle cx="120" cy="120" r="118" fill="#0d0d0d" stroke="#333" strokeWidth="1" />

      {/* Concentric grooves */}
      {grooves.map((r, i) => (
        <circle
          key={i}
          cx="120"
          cy="120"
          r={r}
          fill="none"
          stroke="#1f1f1f"
          strokeWidth="1.2"
        />
      ))}

      {/* Label area */}
      <circle cx="120" cy="120" r="52" fill="#1a1a1a" />
      <circle cx="120" cy="120" r="50" fill="#111" />

      {/* Artwork or initials */}
      <defs>
        <clipPath id="artwork-clip">
          <circle cx="120" cy="120" r="48" />
        </clipPath>
      </defs>

      {artworkUrl ? (
        <image
          href={artworkUrl}
          x="72"
          y="72"
          width="96"
          height="96"
          clipPath="url(#artwork-clip)"
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <>
          <circle cx="120" cy="120" r="48" fill={bgColor} />
          <text
            x="120"
            y="127"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="20"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            {initials}
          </text>
        </>
      )}

      {/* Center hole */}
      <circle cx="120" cy="120" r="5" fill="#0a0a0a" />

      {/* Shimmer ring */}
      <circle cx="120" cy="120" r="118" fill="none" stroke="rgba(201,169,110,0.08)" strokeWidth="2" />
    </svg>
  );
}

// SVG tonearm / needle
function Tonearm({ lifted }: { lifted: boolean }) {
  const rotation = lifted ? -35 : -8;
  return (
    <svg
      viewBox="0 0 100 200"
      xmlns="http://www.w3.org/2000/svg"
      className="tonearm"
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: '20px 20px',
        transition: lifted
          ? 'transform 0.6s ease-in'
          : 'transform 1s ease-out',
      }}
    >
      {/* Pivot circle */}
      <circle cx="20" cy="20" r="10" fill="#C9A96E" stroke="#8a6e3e" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="4" fill="#1a1a1a" />
      {/* Arm */}
      <line x1="20" y1="20" x2="65" y2="170" stroke="#C9A96E" strokeWidth="3" strokeLinecap="round" />
      {/* Headshell */}
      <rect x="56" y="162" width="24" height="8" rx="2" fill="#b89050" transform="rotate(-10 56 162)" />
      {/* Stylus */}
      <line x1="72" y1="168" x2="72" y2="178" stroke="#888" strokeWidth="1.5" />
      <circle cx="72" cy="179" r="2" fill="#aaa" />
    </svg>
  );
}

interface AnimationState {
  displaySong: Song | null;
  opacity: number;
  lifted: boolean;
}

export function NowPlaying() {
  const { nowPlaying, isPlaying } = usePlayerContext();
  const animatingRef = useRef(false);

  const [state, setState] = useState<AnimationState>({
    displaySong: nowPlaying,
    opacity: 1,
    lifted: true,
  });

  const runTransition = useCallback(async (newSong: Song) => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    // 1. Lift the tonearm
    setState((s) => ({ ...s, lifted: true }));
    await wait(600);

    // 2. Fade out disc
    setState((s) => ({ ...s, opacity: 0 }));
    await wait(300);

    // 3. Swap song
    setState((s) => ({ ...s, displaySong: newSong, opacity: 1 }));
    await wait(50);

    // 4. Lower tonearm
    setState((s) => ({ ...s, lifted: false }));

    animatingRef.current = false;
  }, []);

  const prevSongId = useRef<string | null>(null);

  useEffect(() => {
    if (!nowPlaying) return;

    if (prevSongId.current === null) {
      // First song — no animation needed
      prevSongId.current = nowPlaying.id;
      setState({ displaySong: nowPlaying, opacity: 1, lifted: false });
      return;
    }

    if (prevSongId.current !== nowPlaying.id) {
      prevSongId.current = nowPlaying.id;
      runTransition(nowPlaying);
    }
  }, [nowPlaying, runTransition]);

  const { displaySong, opacity, lifted } = state;

  return (
    <div className="now-playing">
      <div className="turntable">
        {/* Disc container */}
        <div
          className="turntable__disc-wrapper"
          style={{ opacity, transition: 'opacity 0.3s ease' }}
        >
          <VinylDisc
            artworkUrl={displaySong?.artworkUrl ?? ''}
            artist={displaySong?.artist ?? '?'}
            spinning={isPlaying && !lifted}
          />
        </div>

        {/* Tonearm */}
        <div className="turntable__arm-wrapper">
          <Tonearm lifted={lifted || !nowPlaying} />
        </div>
      </div>

      {/* Song info */}
      <div className="now-playing__info">
        {displaySong ? (
          <>
            <p className="now-playing__title">{displaySong.title}</p>
            <p className="now-playing__artist">{displaySong.artist}</p>
          </>
        ) : (
          <>
            <p className="now-playing__title now-playing__title--idle">Fabify</p>
            <p className="now-playing__artist">Selecciona una canción</p>
          </>
        )}
      </div>
    </div>
  );
}
