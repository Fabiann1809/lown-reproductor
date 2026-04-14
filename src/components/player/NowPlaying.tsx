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
//  Arm is drawn in LOCAL coords (pivot = local 0,0):
//    arm tip  local : (-8, 140)
//
//  CSS rotate(θ) formula (positive θ = clockwise in screen):
//    x' = x·cos(θ) − y·sin(θ)
//    y' = x·sin(θ) + y·cos(θ)
//
//  Playing θ = +12° (CW):
//    tip in outer SVG ≈ (218, 147)  → ~90 px from disc center  ✓ on disc
//
//  Lifted  θ = −22° (CCW):
//    tip in outer SVG ≈ (300, 145)  → far right, off disc       ✓ lifted
// ─────────────────────────────────────────────────────────────

const PIVOT_X = 255;
const PIVOT_Y = 12;
const PLAYING_ANGLE =  12;   // CW  → tip goes LEFT, onto disc
const LIFTED_ANGLE  = -22;   // CCW → tip goes RIGHT, off disc

interface TurntableProps {
  artworkUrl: string;
  artist: string;
  spinning: boolean;
  lifted: boolean;
}

function Turntable({ artworkUrl, artist, spinning, lifted }: TurntableProps) {
  const grooves = Array.from({ length: 14 }, (_, i) => 115 - i * 6);
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
        {/* Clip path in LOCAL disc coords (origin = disc center after translate) */}
        <clipPath id="artwork-clip">
          <circle cx="0" cy="0" r="48" />
        </clipPath>
        <radialGradient id="disc-sheen" cx="38%" cy="38%" r="62%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* ── DISC
            Outer <g> uses SVG translate attribute to move to disc center.
            Inner <g> carries the CSS spin animation; its local (0,0) is the
            disc center, so transform-origin: 0px 0px is the exact center.  ── */}
      <g transform="translate(130, 130)">
        <g
          className={spinning ? 'disc-spin' : ''}
          style={{ transformOrigin: '0px 0px' }}
        >
          {/* Vinyl body */}
          <circle cx="0" cy="0" r="118" fill="#0d0d0d" stroke="#1e1e1e" strokeWidth="1" />

          {/* Concentric grooves */}
          {grooves.map((r, i) => (
            <circle key={i} cx="0" cy="0" r={r} fill="none" stroke="#1c1c1c" strokeWidth="1.1" />
          ))}

          {/* Label ring */}
          <circle cx="0" cy="0" r="52" fill="#111" />

          {/* Artwork — the clip path is in outer SVG coords,
              but the image is also referenced there via href + x/y */}
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

          {/* Center spindle hole */}
          <circle cx="0" cy="0" r="5" fill="#060606" />

          {/* Sheen overlay */}
          <circle cx="0" cy="0" r="118" fill="url(#disc-sheen)" />
          <circle cx="0" cy="0" r="118" fill="none" stroke="rgba(201,169,110,0.07)" strokeWidth="2" />
        </g>
      </g>

      {/* ── TONEARM
            Strategy: SVG `transform="translate(PIVOT_X, PIVOT_Y)"` positions
            the outer group so that local (0,0) = the pivot point in outer SVG.
            The inner group carries CSS rotate(θ) with transform-origin: 0px 0px,
            which now correctly rotates around the pivot.                        ── */}
      <g transform={`translate(${PIVOT_X}, ${PIVOT_Y})`}>
        <g
          style={{
            transformOrigin: '0px 0px',
            transform: `rotate(${armAngle}deg)`,
            transition: lifted
              ? 'transform 0.65s ease-in'
              : 'transform 1s ease-out',
          }}
        >
          {/* Pivot base plate */}
          <circle cx="0" cy="0" r="13" fill="#1e1e1e" stroke="#3a3a3a" strokeWidth="1" />
          <circle cx="0" cy="0" r="9"  fill="#C9A96E" />
          <circle cx="0" cy="0" r="4"  fill="#111" />

          {/* Arm tube — from pivot downward, slightly left */}
          <line
            x1="0"  y1="6"
            x2="-8" y2="134"
            stroke="#C9A96E"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Highlight stripe on arm */}
          <line
            x1="0"  y1="6"
            x2="-8" y2="134"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Headshell body */}
          <rect
            x="-20" y="126"
            width="24" height="12"
            rx="3"
            fill="#b89050"
            stroke="#8a6e3e"
            strokeWidth="0.8"
          />

          {/* Cartridge */}
          <rect
            x="-16" y="136"
            width="14" height="7"
            rx="1.5"
            fill="#777"
          />

          {/* Cantilever */}
          <line
            x1="-9" y1="143"
            x2="-9" y2="152"
            stroke="#bbb"
            strokeWidth="1.5"
          />

          {/* Stylus diamond */}
          <circle cx="-9" cy="153" r="2.8" fill="#ddd" />
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

    // 1. Lift arm
    setState((s) => ({ ...s, lifted: true }));
    await wait(650);

    // 2. Fade disc out
    setState((s) => ({ ...s, opacity: 0 }));
    await wait(300);

    // 3. Swap song + fade in
    setState((s) => ({ ...s, displaySong: newSong, opacity: 1 }));
    await wait(80);

    // 4. Lower arm onto disc
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
