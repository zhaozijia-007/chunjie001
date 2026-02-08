import { forwardRef } from 'react'
import type { CSSProperties } from 'react'
import type { BorderPattern, CoupletContent, InkColor, PaperStyle } from './ConfigPanel'

type PreviewCanvasProps = {
  content: CoupletContent
  paperStyle: PaperStyle
  inkColor: InkColor
  borderPattern: BorderPattern
  fontFamily: string
  isPetMode?: boolean
  petType?: string
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

const PetIcon = ({ petType, className }: { petType: string; className?: string }) => {
  const svgClass = `fill-none stroke-2 stroke-[#1a1a1a] ${className ?? ''}`
  switch (petType) {
    case '猫':
      return (
        <svg viewBox="0 0 64 64" className={svgClass} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="32" cy="38" rx="14" ry="16" />
          <circle cx="28" cy="34" r="2" fill="#1a1a1a" stroke="none" />
          <circle cx="36" cy="34" r="2" fill="#1a1a1a" stroke="none" />
          <path d="M32 42c2 2 4 4 6 2M32 42c-2 2-4 4-6 2" />
          <path d="M22 28c-2-4 0-10 4-12M42 28c2-4 0-10-4-12" />
          <path d="M20 20c2 0 4-2 4-4M44 20c-2 0-4-2-4-4" />
          <ellipse cx="32" cy="50" rx="4" ry="2" />
        </svg>
      )
    case '狗':
      return (
        <svg viewBox="0 0 64 64" className={svgClass} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="32" cy="36" rx="12" ry="14" />
          <ellipse cx="32" cy="20" rx="8" ry="10" />
          <circle cx="28" cy="18" r="2" fill="#1a1a1a" stroke="none" />
          <circle cx="36" cy="18" r="2" fill="#1a1a1a" stroke="none" />
          <path d="M26 26c0-2 2-4 4-2M38 26c0-2-2-4-4-2" />
          <path d="M20 36c-2 4 0 8 4 10M44 36c2 4 0 8-4 10" />
          <path d="M28 48c0 4 4 4 8 0M36 48c0 4-4 4-8 0" />
        </svg>
      )
    case '乌龟':
      return (
        <svg viewBox="0 0 64 64" className={svgClass} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="32" cy="38" rx="16" ry="12" />
          <ellipse cx="32" cy="26" rx="8" ry="10" />
          <circle cx="28" cy="24" r="2" fill="#1a1a1a" stroke="none" />
          <circle cx="36" cy="24" r="2" fill="#1a1a1a" stroke="none" />
          <path d="M24 38c-4 0-6 4-4 8M40 38c4 0 6 4 4 8" />
          <path d="M20 42c0 4 4 6 12 6s12-2 12-6" />
        </svg>
      )
    case '仓鼠':
      return (
        <svg viewBox="0 0 64 64" className={svgClass} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="34" r="14" />
          <circle cx="28" cy="32" r="2" fill="#1a1a1a" stroke="none" />
          <circle cx="36" cy="32" r="2" fill="#1a1a1a" stroke="none" />
          <path d="M24 34c-2-2-4-6 0-8M40 34c2-2 4-6 0-8" />
          <path d="M22 42c0 4 10 6 20 6s20-2 20-6" />
          <ellipse cx="32" cy="24" rx="4" ry="3" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 64 64" className={svgClass} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="32" cy="38" rx="14" ry="16" />
          <circle cx="28" cy="34" r="2" fill="#1a1a1a" stroke="none" />
          <circle cx="36" cy="34" r="2" fill="#1a1a1a" stroke="none" />
          <path d="M32 42c2 2 4 4 6 2M32 42c-2 2-4 4-6 2" />
          <path d="M22 28c-2-4 0-10 4-12M42 28c2-4 0-10-4-12" />
        </svg>
      )
  }
}

const PreviewCanvas = forwardRef<HTMLElement, PreviewCanvasProps>(function PreviewCanvas(
  { content, paperStyle, inkColor, borderPattern, fontFamily, isPetMode, petType },
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

  const textClass = inkColor === 'gold' && !isPetMode ? 'couplet-text' : ''
  const textStyle = inkColor === 'black' && !isPetMode ? { color: textColor } : {}
  const petTextClass = isPetMode ? 'style-pet-text' : ''
  const wrapperClass = isPetMode ? 'style-pet' : ''

  const TextWithEn = ({
    text,
    en,
    className,
    style,
  }: { text: string; en?: string; className: string; style?: React.CSSProperties }) => (
    <span className="inline-flex flex-col items-center">
      <span className={className} style={style}>{text}</span>
      {isPetMode && en && <span className="english-tag">{en}</span>}
    </span>
  )

  return (
    <section
      ref={ref}
      className="preview-container relative flex min-h-[480px] flex-1 items-center justify-center rounded-3xl border border-white/60 p-4 shadow-[0_30px_60px_rgba(0,0,0,0.1)] sm:min-h-[560px] sm:p-6 lg:min-h-[620px] lg:p-8"
    >
      <HorseMascot />
      <div className={`flex h-full w-full items-center justify-center overflow-auto ${wrapperClass}`}>
        <div className="relative grid w-full max-w-4xl grid-cols-[1fr_auto_1fr] gap-6 px-2 py-6 sm:gap-8 sm:px-4 sm:py-10 lg:gap-12 lg:px-6 lg:py-12">
          <div className="col-span-3 flex justify-center">
            <div
              style={{ ...paperStyleValue, fontFamily }}
              className={`couplet-bg rounded-2xl px-10 py-3 text-xl font-semibold tracking-[0.4em] sm:px-12 sm:py-4 sm:text-2xl sm:tracking-[0.5em] lg:px-16 lg:py-5 lg:text-3xl lg:tracking-[0.6em] ${borderClass}`}
            >
              <TextWithEn
                text={content.banner}
                en={content.bannerEn}
                className={`${textClass} ${petTextClass}`}
                style={textStyle}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <div
              style={{ ...paperStyleValue, fontFamily }}
              className={`couplet-bg flex min-h-[280px] w-[100px] items-center justify-center rounded-2xl px-4 py-8 text-2xl sm:min-h-[360px] sm:w-[120px] sm:px-5 sm:py-10 sm:text-3xl lg:min-h-[420px] lg:w-[140px] lg:px-6 lg:py-12 lg:text-4xl ${borderClass}`}
            >
              <TextWithEn
                text={content.lower}
                en={content.lowerEn}
                className={`vertical-rl ${textClass} ${petTextClass}`}
                style={textStyle}
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div
              style={{ ...paperStyleValue, fontFamily }}
              className={`couplet-bg flex h-24 w-24 rotate-45 items-center justify-center rounded-3xl text-3xl sm:h-32 sm:w-32 sm:text-4xl lg:h-36 lg:w-36 lg:text-5xl ${borderClass}`}
            >
              {isPetMode ? (
                <div className="-rotate-45 flex h-full w-full flex-col items-center justify-center gap-0.5 px-0.5">
                  <span className={`text-sm font-bold leading-none sm:text-base lg:text-lg ${petTextClass}`} style={{ color: '#1a1a1a' }}>
                    {content.fu}
                  </span>
                  <PetIcon petType={petType ?? '猫'} className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12 lg:h-14 lg:w-14" />
                  {content.fuEn && (
                    <span className="english-tag !text-[9px] sm:!text-[10px] lg:!text-xs">{content.fuEn}</span>
                  )}
                </div>
              ) : (
                <TextWithEn
                  text={content.fu}
                  en={content.fuEn}
                  className={`-rotate-45 ${textClass} ${petTextClass}`}
                  style={textStyle}
                />
              )}
            </div>
          </div>

          <div className="flex justify-start">
            <div
              style={{ ...paperStyleValue, fontFamily }}
              className={`couplet-bg flex min-h-[280px] w-[100px] items-center justify-center rounded-2xl px-4 py-8 text-2xl sm:min-h-[360px] sm:w-[120px] sm:px-5 sm:py-10 sm:text-3xl lg:min-h-[420px] lg:w-[140px] lg:px-6 lg:py-12 lg:text-4xl ${borderClass}`}
            >
              <TextWithEn
                text={content.upper}
                en={content.upperEn}
                className={`vertical-rl ${textClass} ${petTextClass}`}
                style={textStyle}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

export default PreviewCanvas
