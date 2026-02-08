import { useCallback, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas-pro'
import ConfigPanel, {
  type AiMode,
  type BorderPattern,
  type CoupletContent,
  type InkColor,
  type PaperStyle,
  type PersonalInfo,
  type SkuOption,
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
  {
    upper: '风和日丽山河秀',
    lower: '岁稔年丰社稷安',
    banner: '国泰民安',
    fu: '福',
  },
  {
    upper: '瑞雪纷飞迎盛世',
    lower: '红梅傲立报新春',
    banner: '喜迎春',
    fu: '春',
  },
  {
    upper: '春雨润物千枝秀',
    lower: '旭日临门万象新',
    banner: '吉祥如意',
    fu: '福',
  },
  {
    upper: '龙腾四海千家喜',
    lower: '福满九州万户欢',
    banner: '合家欢',
    fu: '喜',
  },
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
  const [aiMode, setAiMode] = useState<AiMode>('keyword')
  const [aiKeyword, setAiKeyword] = useState('')
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    year: '',
    month: '',
    day: '',
    hour: '',
    gender: 'male',
    birthPlace: '',
    wish: [],
  })
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const previewRef = useRef<HTMLElement>(null)

  const handlePersonalInfoChange = (info: Partial<PersonalInfo>) => {
    setPersonalInfo((prev) => ({ ...prev, ...info }))
  }

  const handleAiInspire = async () => {
    if (isAiLoading) return
    setIsAiLoading(true)
    try {
      const url = aiMode === 'personal' ? '/api/generate-personalized-couplet' : '/api/generate-couplet'
      const body =
        aiMode === 'personal'
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
      const data = await res.json()
      if (data.upper && data.lower && data.banner) {
        setContent({
          upper: data.upper,
          lower: data.lower,
          banner: data.banner,
          fu: data.fu || '福',
        })
      } else {
        throw new Error(data.error || '生成失败')
      }
    } catch {
      const next = mockCouplets[Math.floor(Math.random() * mockCouplets.length)]
      setContent(next)
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

  return (
    <div className="min-h-screen festive-bg">
      <div className="fixed right-4 top-4 z-10">
        <MusicPlayer />
      </div>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:flex-row lg:gap-8">
        <div className="flex w-full flex-col gap-6 lg:w-[360px]">
          <ConfigPanel
            sku={sku}
            skuOptions={skuOptions}
            content={content}
            paperStyle={paperStyle}
            inkColor={inkColor}
            borderPattern={borderPattern}
            fontFamily={fontFamily}
            fontOptions={fontOptions}
            aiMode={aiMode}
            aiKeyword={aiKeyword}
            personalInfo={personalInfo}
            isAiLoading={isAiLoading}
            onSkuChange={setSku}
            onContentChange={setContent}
            onPaperStyleChange={setPaperStyle}
            onInkColorChange={setInkColor}
            onBorderPatternChange={setBorderPattern}
            onFontChange={setFontFamily}
            onAiModeChange={setAiMode}
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
