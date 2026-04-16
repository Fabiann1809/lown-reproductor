import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerContext } from '../../context/PlayerContext';
import type { Song } from '../../types/song';

function colorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 45%, 35%)`;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────
// Geometry (all values in SVG user units, viewBox 0 0 300 260)
//
//  Disc  center : (130, 130)   radius 118
//  Arm   pivot  : (255, 12)    in outer SVG space
//
//  Playing θ = +12° (CW): tip ≈ (218, 147) → on disc  ✓
//  Lifted  θ = −22° (CCW): tip far right, off disc     ✓
// ─────────────────────────────────────────────────────────────

const PIVOT_X = 255;
const PIVOT_Y = 12;
const PLAYING_ANGLE =  12;   // CW  → tip goes LEFT, onto disc
const LIFTED_ANGLE  = -22;   // CCW → tip goes RIGHT, off disc

const ARM_LIFT_MS   = 550;   // arm-up duration (ms)
const DISC_FADE_MS  = 300;   // disc opacity fade duration (ms)

interface TurntableProps {
  artworkUrl: string;
  artist: string;
  spinning: boolean;
  lifted: boolean;
}

function Turntable({ artworkUrl, artist, spinning, lifted }: TurntableProps) {
  const initials = artist.slice(0, 2).toUpperCase();
  const bgColor = colorFromString(artist);
  const armAngle = lifted ? LIFTED_ANGLE : PLAYING_ANGLE;

  return (
    <svg
      viewBox="0 0 300 260"
      xmlns="http://www.w3.org/2000/svg"
      className="turntable-svg"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="artwork-clip">
          <circle cx="0" cy="0" r="48" />
        </clipPath>
        <radialGradient id="disc-sheen" cx="38%" cy="38%" r="62%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <linearGradient id="arm-shine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#111" />
          <stop offset="40%"  stopColor="#4a4a4a" />
          <stop offset="60%"  stopColor="#6e6e6e" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="cart-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#888" />
          <stop offset="50%"  stopColor="#555" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>
      </defs>

      {/* Disc */}
      <g transform="translate(130, 130)">
        <g
          className={spinning ? 'disc-spin' : ''}
          style={{ transformOrigin: '0px 0px' }}
        >
          {/* Disc image — mix-blend-mode:multiply keeps white background transparent */}
          <image
            href="/disco.png"
            x="-122"
            y="-122"
            width="244"
            height="244"
            preserveAspectRatio="xMidYMid meet"
            style={{ mixBlendMode: 'multiply' }}
          />

          {/* Song artwork over center label */}
          {artworkUrl ? (
            <image
              href={artworkUrl}
              x="-48"
              y="-48"
              width="96"
              height="96"
              clipPath="url(#artwork-clip)"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <>
              <circle cx="0" cy="0" r="48" fill={bgColor} />
              <text
                x="0" y="7"
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

          {/* Center point */}
          <circle cx="0" cy="0" r="5" fill="#1a1a1a" />
        </g>
      </g>

      {/* ── TONEARM ── */}
      <g transform={`translate(${PIVOT_X}, ${PIVOT_Y})`}>
        <g
          style={{
            transformOrigin: '0px 0px',
            transform: `rotate(${armAngle}deg)`,
            transition: lifted
              ? `transform ${ARM_LIFT_MS}ms ease-in`
              : 'transform 1s ease-out',
          }}
        >
          {/* Pivot base — outer ring */}
          <circle cx="0" cy="0" r="13" fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="1.2" />
          {/* Pivot sheen */}
          <circle cx="0" cy="0" r="11" fill="url(#arm-shine)" opacity="0.6" />
          {/* Pivot cap */}
          <circle cx="0" cy="0" r="7"  fill="#222" stroke="#555" strokeWidth="0.6" />
          <circle cx="0" cy="0" r="3"  fill="#111" />
          <circle cx="-2" cy="-2" r="1.2" fill="rgba(255,255,255,0.25)" />

          {/* Arm body — dark with metallic highlight */}
          <line x1="0" y1="7" x2="-8" y2="134" stroke="url(#arm-shine)" strokeWidth="6" strokeLinecap="round" />
          {/* Highlight stripe on arm */}
          <line x1="-1" y1="10" x2="-9" y2="130" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />

          {/* Headshell / cartridge body */}
          <rect x="-20" y="126" width="24" height="13" rx="3" fill="url(#cart-shine)" stroke="#3a3a3a" strokeWidth="0.8" />
          {/* Cartridge highlight */}
          <rect x="-18" y="127.5" width="10" height="3" rx="1" fill="rgba(255,255,255,0.15)" />

          {/* Stylus mount */}
          <rect x="-16" y="138" width="14" height="7" rx="1.5" fill="#444" stroke="#2a2a2a" strokeWidth="0.6" />

          {/* Cantilever (needle rod) */}
          <line x1="-9" y1="145" x2="-9" y2="154" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
          {/* Stylus tip */}
          <ellipse cx="-9" cy="155.5" rx="2.5" ry="1.8" fill="#ccc" />
          <ellipse cx="-9.5" cy="154.8" rx="1" ry="0.6" fill="rgba(255,255,255,0.5)" />
        </g>
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

    // 1. Lift arm (550ms)
    setState((s) => ({ ...s, lifted: true }));
    await wait(ARM_LIFT_MS);

    // 2. Fade disc out
    setState((s) => ({ ...s, opacity: 0 }));
    await wait(DISC_FADE_MS);

    // 3. Swap song + fade in
    setState((s) => ({ ...s, displaySong: newSong, opacity: 1 }));
    await wait(80);

    // 4. Lower arm onto disc → reproduces if isPlaying (audio already started by usePlayer)
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
        style={{ opacity, transition: `opacity ${DISC_FADE_MS}ms ease` }}
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
            <p className="now-playing__title now-playing__title--idle">Lown</p>
            <p className="now-playing__artist">Selecciona una canción</p>
          </>
        )}
      </div>
    </div>
  );
}
