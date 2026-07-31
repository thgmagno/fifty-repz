'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const REEL_LENGTH = 51 // 0..50
const ROLL_DURATION_MS = 3100
const HOLD_MS = 700
const FADE_MS = 500
const SESSION_KEY = 'fifty-repz-splash-shown'

type Phase = 'spinning' | 'landed' | 'exiting' | 'done'

export function SplashScreen() {
  const [phase, setPhase] = React.useState<Phase>('spinning')

  React.useLayoutEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      // sincroniza antes do primeiro paint pra não piscar em navegações
      // dentro da mesma aba (já mostrou o splash nesta sessão)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase('done')
      return undefined
    }
    sessionStorage.setItem(SESSION_KEY, '1')

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const rollDuration = reduced ? 0 : ROLL_DURATION_MS

    const landTimer = window.setTimeout(() => setPhase('landed'), rollDuration)
    const exitTimer = window.setTimeout(
      () => setPhase('exiting'),
      rollDuration + HOLD_MS,
    )
    const doneTimer = window.setTimeout(
      () => setPhase('done'),
      rollDuration + HOLD_MS + FADE_MS,
    )

    return () => {
      window.clearTimeout(landTimer)
      window.clearTimeout(exitTimer)
      window.clearTimeout(doneTimer)
    }
  }, [])

  if (phase === 'done') return null

  const settled = phase === 'landed' || phase === 'exiting'

  return (
    <div
      aria-hidden="true"
      className={cn(
        'fixed inset-0 z-100 flex items-center justify-center transition-opacity duration-500',
        phase === 'exiting' && 'pointer-events-none opacity-0',
      )}
      style={{
        background:
          'radial-gradient(ellipse 120% 90% at 50% 38%, #1b1712 0%, #14120f 62%)',
      }}
    >
      <style>{`
        .splash-frame {
          --cell: clamp(108px, 24vw, 188px);
          position: relative;
          padding: clamp(10px, 2vw, 16px);
          border-radius: 18px;
          background: linear-gradient(180deg, #2a251e, #1d1a16);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.04) inset,
            0 0 0 1px rgba(0, 0, 0, 0.6),
            0 30px 60px -25px rgba(0, 0, 0, 0.8);
        }
        .splash-window {
          position: relative;
          width: clamp(150px, 34vw, 260px);
          height: var(--cell);
          overflow: hidden;
          border-radius: 10px;
          background: #0c0a08;
          box-shadow:
            inset 0 2px 6px rgba(0, 0, 0, 0.85),
            inset 0 0 0 1px rgba(0, 0, 0, 0.5);
        }
        .splash-window::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            #0c0a08 0%,
            transparent 30%,
            transparent 70%,
            #0c0a08 100%
          );
        }
        .splash-witness {
          position: absolute;
          left: 6%;
          right: 6%;
          top: 50%;
          height: 1px;
          z-index: 4;
          transform: translateY(-0.5px);
          background: #7a5a30;
          opacity: 0.55;
          transition: opacity 0.4s ease;
        }
        .splash-witness--hit {
          opacity: 1;
          box-shadow: 0 0 10px 1px rgba(201, 138, 61, 0.55);
        }
        .splash-reel {
          display: flex;
          flex-direction: column;
          will-change: transform;
          animation: splash-roll 3.1s cubic-bezier(0.74, 0, 0.88, 0.14) forwards;
        }
        @keyframes splash-roll {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(calc(var(--cell) * -50));
          }
        }
        .splash-digit {
          height: var(--cell);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family:
            ui-monospace, 'SF Mono', 'JetBrains Mono', 'Roboto Mono', monospace;
          font-weight: 700;
          font-size: calc(var(--cell) * 0.56);
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
          color: #f3ecdd;
          text-shadow: 0 2px 0 rgba(0, 0, 0, 0.5);
        }
        .splash-result {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .splash-icon {
          width: 34px;
          height: 34px;
          opacity: 0;
          color: #c98a3d;
        }
        .splash-icon--show {
          animation: splash-land 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards;
        }
        @keyframes splash-land {
          0% {
            opacity: 0;
            transform: scale(0.6) rotate(-35deg);
            filter: drop-shadow(0 0 0 transparent);
          }
          65% {
            opacity: 1;
            transform: scale(1.14) rotate(6deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 9px rgba(201, 138, 61, 0.55));
          }
        }
        .splash-brand {
          font-size: 11px;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: #9a9082;
          margin: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-reel {
            animation: none;
            transform: translateY(calc(var(--cell) * -50));
          }
          .splash-icon--show {
            animation: none;
            opacity: 1;
            filter: drop-shadow(0 0 9px rgba(201, 138, 61, 0.55));
          }
        }
      `}</style>

      <div className="flex flex-col items-center gap-8">
        <div className="splash-frame">
          <div className="splash-window">
            <div className="splash-reel">
              {Array.from({ length: REEL_LENGTH }, (_, n) => (
                <div key={n} className="splash-digit">
                  {n}
                </div>
              ))}
            </div>
            <div
              className={cn('splash-witness', settled && 'splash-witness--hit')}
            />
          </div>
        </div>

        <div className="splash-result">
          <svg
            className={cn('splash-icon', settled && 'splash-icon--show')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
        </div>

        <p className="splash-brand">Fifty Repz</p>
      </div>
    </div>
  )
}
