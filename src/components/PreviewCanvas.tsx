import { forwardRef } from 'react'
import type { CSSProperties } from 'react'
import type { BorderPattern, CoupletContent, InkColor, PaperStyle } from './ConfigPanel'

type PreviewCanvasProps = {
  content: CoupletContent
  paperStyle: PaperStyle
  inkColor: InkColor
  borderPattern: BorderPattern
  fontFamily: string
}

type PaperStyleValue = CSSProperties & {
  ['--paper-pattern']?: string
  ['--paper-pattern-size']?: string
}

const paperStyleMap: Record<PaperStyle, PaperStyleValue> = {
  plain: {
    backgroundColor: '#C41E3A',
    '--paper-pattern': 'none',
  },
  sprinkled: {
    backgroundColor: '#E60012',
    '--paper-pattern':
      'radial-gradient(circle at 12px 12px, rgba(255,215,0,0.35) 1px, rgba(255,215,0,0) 0), radial-gradient(circle at 24px 30px, rgba(255,215,0,0.3) 1px, rgba(255,215,0,0) 0)',
    '--paper-pattern-size': '36px 36px, 42px 42px',
  },
  dragon: {
    backgroundColor: '#C41E3A',
    '--paper-pattern':
      'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,215,0,0)), radial-gradient(circle at 18px 22px, rgba(255,215,0,0.25) 1px, rgba(255,215,0,0) 0)',
    '--paper-pattern-size': '120px 120px, 28px 28px',
  },
}

const inkColorMap: Record<InkColor, string> = {
  gold: '#FFD700',
  black: '#1a1a1a',
}

const borderPatternStyles: Record<BorderPattern, string> = {
  xiangyun: 'border-xiangyun',
  huiwen: 'border-huiwen',
  lotus: 'border-lotus',
  wanzi: 'border-wanzi',
}

const PreviewCanvas = forwardRef<HTMLElement, PreviewCanvasProps>(function PreviewCanvas(
  { content, paperStyle, inkColor, borderPattern, fontFamily },
  ref
) {
  const paperStyleValue = paperStyleMap[paperStyle]
  const textColor = inkColorMap[inkColor]
  const borderClass = borderPatternStyles[borderPattern]

  const HorseMascot = () => (
    <svg
      className="horse-mascot absolute right-4 top-6 h-14 w-14 opacity-75 sm:right-8 sm:top-8 sm:h-16 sm:w-16"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 4c-2 2-4 6-4 12v6c0 2 1 4 2 6l-2 12h4l2-10c1 0 2-1 2-2v-6c0-4-1-8 2-10 2-2 6-2 8-2 2 0 4 0 6 2 3 2 2 6 2 10v6c0 1 1 2 2 2l2 10h4l-2-12c1-2 2-4 2-6v-6c0-6-2-10-4-12-4-2-10-2-14 0z"
        fill="#C41E3A"
      />
      <circle cx="34" cy="14" r="3" fill="#1a1a1a" />
    </svg>
  )

  return (
    <section
      ref={ref}
      className="relative flex min-h-[480px] flex-1 items-center justify-center rounded-3xl border border-white/60 bg-white/70 p-4 shadow-[0_30px_60px_rgba(0,0,0,0.1)] wall-texture sm:min-h-[560px] sm:p-6 lg:min-h-[620px] lg:p-8"
    >
      <HorseMascot />
      <div className="flex h-full w-full items-center justify-center overflow-auto">
        <div className="relative grid w-full max-w-4xl grid-cols-[1fr_auto_1fr] gap-6 px-2 py-6 sm:gap-8 sm:px-4 sm:py-10 lg:gap-12 lg:px-6 lg:py-12">
          <div className="col-span-3 flex justify-center">
            <div
              style={{ ...paperStyleValue, fontFamily, color: textColor }}
              className={`paper-texture rounded-2xl px-10 py-4 text-xl font-semibold tracking-[0.4em] shadow-[0_12px_24px_rgba(0,0,0,0.2)] sm:px-12 sm:py-5 sm:text-2xl sm:tracking-[0.5em] lg:px-16 lg:py-6 lg:text-3xl lg:tracking-[0.6em] ${borderClass}`}
            >
              {content.banner}
            </div>
          </div>

          <div className="flex justify-end">
            <div
              style={{ ...paperStyleValue, fontFamily, color: textColor }}
              className={`paper-texture flex min-h-[280px] w-[100px] items-center justify-center rounded-2xl px-4 py-8 text-2xl shadow-[0_18px_30px_rgba(0,0,0,0.25)] sm:min-h-[360px] sm:w-[120px] sm:px-5 sm:py-10 sm:text-3xl lg:min-h-[420px] lg:w-[140px] lg:px-6 lg:py-12 lg:text-4xl ${borderClass}`}
            >
              <span className="vertical-rl">{content.lower}</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div
              style={{ ...paperStyleValue, fontFamily, color: textColor }}
              className={`paper-texture flex h-24 w-24 rotate-45 items-center justify-center rounded-3xl text-3xl shadow-[0_14px_24px_rgba(0,0,0,0.25)] sm:h-32 sm:w-32 sm:text-4xl lg:h-36 lg:w-36 lg:text-5xl ${borderClass}`}
            >
              <span className="-rotate-45">{content.fu}</span>
            </div>
          </div>

          <div className="flex justify-start">
            <div
              style={{ ...paperStyleValue, fontFamily, color: textColor }}
              className={`paper-texture flex min-h-[280px] w-[100px] items-center justify-center rounded-2xl px-4 py-8 text-2xl shadow-[0_18px_30px_rgba(0,0,0,0.25)] sm:min-h-[360px] sm:w-[120px] sm:px-5 sm:py-10 sm:text-3xl lg:min-h-[420px] lg:w-[140px] lg:px-6 lg:py-12 lg:text-4xl ${borderClass}`}
            >
              <span className="vertical-rl">{content.upper}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

export default PreviewCanvas
