import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerContext } from '../../context/PlayerContext';
import type { Song } from '../../types/song';

function colorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 45%, 35%)`;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────
// Unified turntable SVG — disc + tonearm in one coordinate space
// viewBox: 0 0 300 260
//   Disc  center : (130, 130) radius 118
//   Arm   pivot  : (255, 12)
//   Arm   length : 150px (SVG units)
//   Playing      : rotate(-12deg)  → tip ≈ (223, 159) — outer disc edge
//   Lifted       : rotate(+22deg)  → tip goes right, off the disc
// ─────────────────────────────────────────────────────────────

interface TurntableProps {
  artworkUrl: string;
  artist: string;
  spinning: boolean;
  lifted: boolean;
}

const PIVOT_X = 255;
const PIVOT_Y = 12;
const ARM_LENGTH = 150;
const PLAYING_ANGLE = -12;
const LIFTED_ANGLE = 22;

function Turntable({ artworkUrl, artist, spinning, lifted }: TurntableProps) {
  const grooves = Array.from({ length: 14 }, (_, i) => 115 - i * 6);
  const initials = artist.slice(0, 2).toUpperCase();
  const bgColor = colorFromString(artist);
  const armAngle = lifted ? LIFTED_ANGLE : PLAYING_ANGLE;

  // Compute stylus tip position for accuracy (not used in render, just FYI)
  const _tipX = PIVOT_X + ARM_LENGTH * Math.sin((armAngle * Math.PI) / 180);
  const _tipY = PIVOT_Y + ARM_LENGTH * Math.cos((armAngle * Math.PI) / 180);
  void _tipX; void _tipY;

  return (
    <svg
      viewBox="0 0 300 260"
      xmlns="http://www.w3.org/2000/svg"
      className="turntable-svg"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="artwork-clip">
          <circle cx="130" cy="130" r="48" />
        </clipPath>
        <radialGradient id="disc-sheen" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* ── Disc group — spins independently ── */}
      {/* We wrap disc content inside a <g> translated to the disc center.
          CSS animation spin rotates around transform-origin 130px 130px set on this element. */}
      <g
        style={{
          transformOrigin: '130px 130px',
          animation: spinning ? 'spin 3s linear infinite' : 'none',
        }}
      >
        {/* Outer vinyl */}
        <circle cx="130" cy="130" r="118" fill="#0d0d0d" stroke="#222" strokeWidth="1" />

        {/* Concentric grooves */}
        {grooves.map((r, i) => (
          <circle key={i} cx="130" cy="130" r={r} fill="none" stroke="#1c1c1c" strokeWidth="1.1" />
        ))}

        {/* Label area */}
        <circle cx="130" cy="130" r="52" fill="#111" />

        {/* Artwork or initials */}
        {artworkUrl ? (
          <image
            href={artworkUrl}
            x="82"
            y="82"
            width="96"
            height="96"
            clipPath="url(#artwork-clip)"
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <>
            <circle cx="130" cy="130" r="48" fill={bgColor} />
            <text
              x="130"
              y="137"
              textAnchor="middle"
              fill="#fff"
              fontSize="20"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              {initials}
            </text>
          </>
        )}

        {/* Center hole */}
        <circle cx="130" cy="130" r="5" fill="#060606" />

        {/* Sheen */}
        <circle cx="130" cy="130" r="118" fill="url(#disc-sheen)" />
        <circle cx="130" cy="130" r="118" fill="none" stroke="rgba(201,169,110,0.06)" strokeWidth="2" />
      </g>

      {/* ── Tonearm — rotates around PIVOT_X, PIVOT_Y ── */}
      <g
        style={{
          transformOrigin: `${PIVOT_X}px ${PIVOT_Y}px`,
          transform: `rotate(${armAngle}deg)`,
          transition: lifted
            ? 'transform 0.65s ease-in'
            : 'transform 1s ease-out',
        }}
      >
        {/* Base platform */}
        <circle cx={PIVOT_X} cy={PIVOT_Y} r="11" fill="#2a2a2a" stroke="#444" strokeWidth="1" />
        <circle cx={PIVOT_X} cy={PIVOT_Y} r="7" fill="#C9A96E" />
        <circle cx={PIVOT_X} cy={PIVOT_Y} r="3" fill="#1a1a1a" />

        {/* Arm tube — from pivot down */}
        <line
          x1={PIVOT_X}
          y1={PIVOT_Y + 4}
          x2={PIVOT_X - 8}
          y2={PIVOT_Y + ARM_LENGTH - 14}
          stroke="#C9A96E"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Arm highlight */}
        <line
          x1={PIVOT_X}
          y1={PIVOT_Y + 4}
          x2={PIVOT_X - 8}
          y2={PIVOT_Y + ARM_LENGTH - 14}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Headshell */}
        <rect
          x={PIVOT_X - 18}
          y={PIVOT_Y + ARM_LENGTH - 18}
          width="22"
          height="10"
          rx="3"
          fill="#b89050"
          stroke="#8a6e3e"
          strokeWidth="0.5"
        />

        {/* Cartridge */}
        <rect
          x={PIVOT_X - 14}
          y={PIVOT_Y + ARM_LENGTH - 10}
          width="12"
          height="6"
          rx="1"
          fill="#888"
        />

        {/* Stylus cantilever */}
        <line
          x1={PIVOT_X - 8}
          y1={PIVOT_Y + ARM_LENGTH - 5}
          x2={PIVOT_X - 8}
          y2={PIVOT_Y + ARM_LENGTH + 6}
          stroke="#aaa"
          strokeWidth="1.5"
        />
        {/* Stylus diamond */}
        <circle cx={PIVOT_X - 8} cy={PIVOT_Y + ARM_LENGTH + 7} r="2.5" fill="#ddd" />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────

interface AnimState {
  displaySong: Song | null;
  opacity: number;
  lifted: boolean;
}

export function NowPlaying() {
  const { nowPlaying, isPlaying } = usePlayerContext();
  const animating = useRef(false);
  const prevId = useRef<string | null>(null);

  const [state, setState] = useState<AnimState>({
    displaySong: nowPlaying,
    opacity: 1,
    lifted: true,
  });

  const runTransition = useCallback(async (newSong: Song) => {
    if (animating.current) return;
    animating.current = true;

    // 1. Lift arm
    setState((s) => ({ ...s, lifted: true }));
    await wait(650);

    // 2. Fade disc out
    setState((s) => ({ ...s, opacity: 0 }));
    await wait(300);

    // 3. Swap song data + fade in
    setState((s) => ({ ...s, displaySong: newSong, opacity: 1 }));
    await wait(80);

    // 4. Lower arm
    setState((s) => ({ ...s, lifted: false }));

    animating.current = false;
  }, []);

  useEffect(() => {
    if (!nowPlaying) return;
    if (prevId.current === null) {
      prevId.current = nowPlaying.id;
      setState({ displaySong: nowPlaying, opacity: 1, lifted: false });
      return;
    }
    if (prevId.current !== nowPlaying.id) {
      prevId.current = nowPlaying.id;
      runTransition(nowPlaying);
    }
  }, [nowPlaying, runTransition]);

  const { displaySong, opacity, lifted } = state;

  return (
    <div className="now-playing">
      <div
        className="turntable-wrapper"
        style={{ opacity, transition: 'opacity 0.3s ease' }}
      >
        <Turntable
          artworkUrl={displaySong?.artworkUrl ?? ''}
          artist={displaySong?.artist ?? '?'}
          spinning={isPlaying && !lifted}
          lifted={lifted || !nowPlaying}
        />
      </div>

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
