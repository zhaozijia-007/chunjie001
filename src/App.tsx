import { useCallback, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas-pro'
import ConfigPanel, {
  type BorderPattern,
  type TabId,
  type CoupletContent,
  type InkColor,
  type PaperStyle,
  type PersonalInfo,
  type SkuOption,
  WISH_OPTIONS,
} from './components/ConfigPanel'
import MusicPlayer from './components/MusicPlayer'
import PreviewCanvas from './components/PreviewCanvas'
import PrimaryButton from './components/PrimaryButton'

const defaultContent: CoupletContent = {
  upper: '龙腾虎跃春光好',
  lower: '鸟语花香气象新',
  banner: '新春纳福',
  fu: '福',
}

const mockCouplets: CoupletContent[] = [
  { upper: '风和日丽山河秀', lower: '岁稔年丰社稷安', banner: '国泰民安', fu: '福' },
  { upper: '瑞雪纷飞迎盛世', lower: '红梅傲立报新春', banner: '喜迎春', fu: '春' },
  { upper: '春雨润物千枝秀', lower: '旭日临门万象新', banner: '吉祥如意', fu: '福' },
  { upper: '龙腾四海千家喜', lower: '福满九州万户欢', banner: '合家欢', fu: '喜' },
  { upper: '马到成功事业旺', lower: '龙马精神福满堂', banner: '马年大吉', fu: '福' },
  { upper: '丙午马年财运亨', lower: '三合六合贵人迎', banner: '前程似锦', fu: '吉' },
  { upper: '虎马狗合贵人助', lower: '马羊六合喜事多', banner: '流年顺遂', fu: '喜' },
  { upper: '辞旧迎新万象新', lower: '迎春接福纳吉祥', banner: '新春快乐', fu: '福' },
  { upper: '金玉满堂家业兴', lower: '福星高照人康宁', banner: '五福临门', fu: '福' },
  { upper: '花开富贵春常在', lower: '竹报平安福自来', banner: '平安喜乐', fu: '春' },
]

const skuOptions: SkuOption[] = [
  { id: 'home', label: '1.2m 家用款' },
  { id: 'grand', label: '1.5m 气派款' },
]

function App() {
  const [sku, setSku] = useState<SkuOption['id']>('home')
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('plain')
  const [inkColor, setInkColor] = useState<InkColor>('gold')
  const [borderPattern, setBorderPattern] = useState<BorderPattern>('xiangyun')
  const [content, setContent] = useState<CoupletContent>(defaultContent)
  const [fontFamily, setFontFamily] = useState<string>(
    '"Ma Shan Zheng", "Noto Serif SC", "Songti SC", serif',
  )
  const [activeTab, setActiveTab] = useState<TabId>('fortune')
  const [aiKeyword, setAiKeyword] = useState('')
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    year: '1990',
    month: '1',
    day: '1',
    hour: '12',
    gender: 'male',
    birthPlace: '北京',
    wish: ['wealth'],
  })
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [generationReasoning, setGenerationReasoning] = useState<string | null>(null)
  const previewRef = useRef<HTMLElement>(null)

  const handlePersonalInfoChange = (info: Partial<PersonalInfo>) => {
    setPersonalInfo((prev) => ({ ...prev, ...info }))
  }

  const handleAiInspire = async () => {
    if (isAiLoading) return
    setIsAiLoading(true)
    if (activeTab === 'fortune') setGenerationReasoning(null)
    try {
      const url = activeTab === 'fortune' ? '/api/generate-personalized-couplet' : '/api/generate-couplet'
      const body =
        activeTab === 'fortune'
          ? {
              birth: {
                year: personalInfo.year,
                month: personalInfo.month,
                day: personalInfo.day,
                hour: personalInfo.hour ? +personalInfo.hour : undefined,
                gender: personalInfo.gender,
              },
              birthPlace: personalInfo.birthPlace,
              wish: personalInfo.wish.length ? personalInfo.wish : undefined,
            }
          : { keywords: aiKeyword || '新春吉祥' }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (data.upper && data.lower && data.banner) {
        setContent({
          upper: data.upper,
          lower: data.lower,
          banner: data.banner,
          fu: data.fu || '福',
        })
        const reasoning =
          activeTab === 'fortune'
            ? data.reasoning ||
              '根据您的生辰八字、马年丙午火马流年、三合六合贵人（虎马狗三合、马羊六合）及所选愿望定制生成。'
            : null
        setGenerationReasoning(reasoning)
      } else {
        const msg = [data.error, data.hint].filter(Boolean).join('；') || '生成失败'
        throw new Error(msg)
      }
    } catch {
      const next = mockCouplets[Math.floor(Math.random() * mockCouplets.length)]
      setContent(next)
      if (activeTab === 'fortune') {
        const { year, month, day, hour, gender, birthPlace, wish } = personalInfo
        const wishLabels = wish.map((w) => WISH_OPTIONS.find((o) => o.id === w)?.label ?? w)
        const wishText = wishLabels.length ? wishLabels.join('、') : '吉祥如意'
        const birthStr = [year, month, day].filter(Boolean).length >= 3
          ? `${year}年${month}月${day}日`
          : ''
        const hourStr = hour ? `${hour}时` : ''
        const genderStr = gender === 'female' ? '女' : '男'
        const placeStr = birthPlace || ''
        const birthDesc = birthStr
          ? `生于${birthStr}${hourStr ? hourStr : ''}、${genderStr}${placeStr ? `、${placeStr}` : ''}`
          : '您的生辰信息'
        const fallbackReasonings = [
          `根据${birthDesc}，结合 2026 丙午马年流年、三合六合贵人（虎马狗三合、马羊六合）及愿望「${wishText}」，为您推荐此春联。`,
          `依据八字排盘及马年丙午火马流年吉象，三合贵人（寅午戌）与六合贵人（午未）助力，结合您所愿「${wishText}」定制推荐。`,
          `参考您的生辰信息及 2026 马年流年运势，三合六合贵人逢时，融入「${wishText}」愿望，推荐此联以图吉祥。`,
        ]
        setGenerationReasoning(fallbackReasonings[Math.floor(Math.random() * fallbackReasonings.length)])
      } else {
        setGenerationReasoning(null)
      }
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleExportPrintPackage = useCallback(async () => {
    const el = previewRef.current
    if (!el) {
      alert('无法获取预览区域，请刷新页面后重试。')
      return
    }
    setIsExporting(true)
    try {
      await document.fonts.ready
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f8f3ec',
        logging: false,
      })
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            alert('生成图片失败，请重试。')
            return
          }
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = `吉语生联-打印包-${Date.now()}.png`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        },
        'image/png',
        0.95,
      )
    } catch (err) {
      console.error('Export failed:', err)
      alert('导出失败：' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setIsExporting(false)
    }
  }, [])

  const fontOptions = useMemo(
    () => [
      { label: '马善政 (Ma Shan Zheng)', value: '"Ma Shan Zheng", "Noto Serif SC", serif' },
      { label: '宋体衬线 (Noto Serif SC)', value: '"Noto Serif SC", "Songti SC", serif' },
      { label: '系统书卷 (Serif)', value: 'serif' },
    ],
    [],
  )

  const HorseSilhouette = () => (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden>
      <path
        d="M24 4c-2 2-4 6-4 12v6c0 2 1 4 2 6l-2 12h4l2-10c1 0 2-1 2-2v-6c0-4-1-8 2-10 2-2 6-2 8-2 2 0 4 0 6 2 3 2 2 6 2 10v6c0 1 1 2 2 2l2 10h4l-2-12c1-2 2-4 2-6v-6c0-6-2-10-4-12-4-2-10-2-14 0z"
        fill="currentColor"
      />
      <circle cx="34" cy="14" r="3" fill="currentColor" />
    </svg>
  )

  return (
    <div className="festive-bg relative min-h-screen">
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="festive-horse text-ink-red-600">
            <HorseSilhouette />
          </div>
        ))}
        {[...Array(6)].map((_, i) => (
          <div
            key={`p-${i}`}
            className="festive-particle"
            style={{
              width: 16 + i * 6,
              height: 16 + i * 6,
              left: `${8 + (i * 17) % 85}%`,
              top: `${15 + (i * 18) % 70}%`,
              animationDelay: `-${i * 1.5}s`,
            }}
          />
        ))}
      </div>
      <div className="fixed right-4 top-4 z-10">
        <MusicPlayer />
      </div>
      <div className="relative z-[1] mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:flex-row lg:gap-8">
        <div className="flex w-full flex-col gap-6 lg:w-[360px]">
          <ConfigPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sku={sku}
            skuOptions={skuOptions}
            content={content}
            paperStyle={paperStyle}
            inkColor={inkColor}
            borderPattern={borderPattern}
            fontFamily={fontFamily}
            fontOptions={fontOptions}
            aiKeyword={aiKeyword}
            personalInfo={personalInfo}
            isAiLoading={isAiLoading}
            generationReasoning={generationReasoning}
            onSkuChange={setSku}
            onContentChange={setContent}
            onPaperStyleChange={setPaperStyle}
            onInkColorChange={setInkColor}
            onBorderPatternChange={setBorderPattern}
            onFontChange={setFontFamily}
            onAiKeywordChange={setAiKeyword}
            onPersonalInfoChange={handlePersonalInfoChange}
            onAiInspire={handleAiInspire}
          />
          <PrimaryButton
            label={isExporting ? '导出中...' : '生成打印包'}
            onClick={handleExportPrintPackage}
            disabled={isExporting}
          />
        </div>
        <PreviewCanvas
          ref={previewRef}
          content={content}
          paperStyle={paperStyle}
          inkColor={inkColor}
          borderPattern={borderPattern}
          fontFamily={fontFamily}
        />
      </div>
    </div>
  )
}

export default App
