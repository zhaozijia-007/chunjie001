import { Loader2, Sparkles } from 'lucide-react'

export type PaperStyle = 'plain' | 'sprinkled' | 'dragon'

export type InkColor = 'gold' | 'black'

export type BorderPattern = 'xiangyun' | 'huiwen' | 'lotus' | 'wanzi'

export type CoupletContent = {
  upper: string
  lower: string
  banner: string
  fu: string
}

export type SkuOption = {
  id: 'home' | 'grand'
  label: string
}

export type AiMode = 'keyword' | 'personal'

export type TabId = 'fortune' | 'keyword' | 'custom'

export type WishId = 'career' | 'wealth' | 'fame' | 'romance'

export type PersonalInfo = {
  year: string
  month: string
  day: string
  hour: string
  gender: 'male' | 'female'
  birthPlace: string
  wish: WishId[]
}

export const WISH_OPTIONS = [
  { id: 'career', label: '事业' },
  { id: 'wealth', label: '财运' },
  { id: 'fame', label: '名声' },
  { id: 'romance', label: '桃花' },
] as const

type FontOption = {
  label: string
  value: string
}

type ConfigPanelProps = {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  sku: SkuOption['id']
  skuOptions: SkuOption[]
  content: CoupletContent
  paperStyle: PaperStyle
  inkColor: InkColor
  borderPattern: BorderPattern
  fontFamily: string
  fontOptions: FontOption[]
  aiKeyword: string
  personalInfo: PersonalInfo
  isAiLoading: boolean
  onSkuChange: (id: SkuOption['id']) => void
  onContentChange: (content: CoupletContent) => void
  onPaperStyleChange: (style: PaperStyle) => void
  onInkColorChange: (color: InkColor) => void
  onBorderPatternChange: (pattern: BorderPattern) => void
  onFontChange: (font: string) => void
  onAiKeywordChange: (keyword: string) => void
  onPersonalInfoChange: (info: Partial<PersonalInfo>) => void
  onAiInspire: () => void
}

const paperOptions: { id: PaperStyle; label: string }[] = [
  { id: 'plain', label: '纯红' },
  { id: 'sprinkled', label: '洒金' },
  { id: 'dragon', label: '龙纹' },
]

const inkColorOptions: { id: InkColor; label: string }[] = [
  { id: 'gold', label: '金色' },
  { id: 'black', label: '黑色' },
]

const borderPatternOptions: { id: BorderPattern; label: string }[] = [
  { id: 'xiangyun', label: '祥云' },
  { id: 'huiwen', label: '回纹' },
  { id: 'lotus', label: '莲花' },
  { id: 'wanzi', label: '万字纹' },
]

const TABS: { id: TabId; label: string }[] = [
  { id: 'fortune', label: '流年运势' },
  { id: 'keyword', label: '关键词' },
  { id: 'custom', label: '自定义' },
]

function ConfigPanel({
  activeTab,
  onTabChange,
  sku,
  skuOptions,
  content,
  paperStyle,
  inkColor,
  borderPattern,
  fontFamily,
  fontOptions,
  aiKeyword,
  personalInfo,
  isAiLoading,
  onSkuChange,
  onContentChange,
  onPaperStyleChange,
  onInkColorChange,
  onBorderPatternChange,
  onFontChange,
  onAiKeywordChange,
  onPersonalInfoChange,
  onAiInspire,
}: ConfigPanelProps) {
  return (
    <section className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.08)] backdrop-blur paper-texture">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-red-600">吉语生联</p>
        <h1 className="mt-1 text-xl font-semibold text-ink-ink">在线春联生成器</h1>
        <div className="mt-2 rounded-lg border border-ink-red-500/10 bg-ink-red-500/5 px-2.5 py-1.5">
          <p className="text-[11px] leading-snug text-ink-ink/65">
            香港·苏民峰、麦玲玲；新加坡滨海湾金沙·陈军容、吴源良、陈俊元
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-1 rounded-xl bg-ink-red-500/10 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 rounded-lg px-2 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-ink-red-600 text-white shadow'
                : 'text-ink-ink/70 hover:text-ink-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'fortune' && (
        <div className="space-y-4">
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-ink-ink">出生信息（八字排盘）</p>
            <div className="grid grid-cols-3 gap-2">
              <input
                value={personalInfo.year}
                onChange={(e) => onPersonalInfoChange({ year: e.target.value })}
                className="rounded-lg border border-ink-red-500/20 bg-white px-2 py-2 text-sm focus:border-ink-red-500 focus:outline-none"
                placeholder="年"
              />
              <input
                value={personalInfo.month}
                onChange={(e) => onPersonalInfoChange({ month: e.target.value })}
                className="rounded-lg border border-ink-red-500/20 bg-white px-2 py-2 text-sm focus:border-ink-red-500 focus:outline-none"
                placeholder="月"
              />
              <input
                value={personalInfo.day}
                onChange={(e) => onPersonalInfoChange({ day: e.target.value })}
                className="rounded-lg border border-ink-red-500/20 bg-white px-2 py-2 text-sm focus:border-ink-red-500 focus:outline-none"
                placeholder="日"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={personalInfo.hour}
                onChange={(e) => onPersonalInfoChange({ hour: e.target.value })}
                className="rounded-lg border border-ink-red-500/20 bg-white px-2 py-2 text-sm focus:border-ink-red-500 focus:outline-none"
              >
                <option value="">选择时辰</option>
                {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map((h) => (
                  <option key={h} value={String(h)}>{h}时</option>
                ))}
              </select>
              <select
                value={personalInfo.gender}
                onChange={(e) => onPersonalInfoChange({ gender: e.target.value as 'male'|'female' })}
                className="rounded-lg border border-ink-red-500/20 bg-white px-2 py-2 text-sm focus:border-ink-red-500 focus:outline-none"
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <input
              value={personalInfo.birthPlace}
              onChange={(e) => onPersonalInfoChange({ birthPlace: e.target.value })}
              className="rounded-lg border border-ink-red-500/20 bg-white px-3 py-2 text-sm focus:border-ink-red-500 focus:outline-none"
              placeholder="出生地点（如：北京）"
            />
            <div>
              <p className="mb-1.5 text-xs text-ink-ink/70">2026 年愿望（可多选）</p>
              <div className="flex flex-wrap gap-1.5">
                {WISH_OPTIONS.map((opt) => {
                  const checked = personalInfo.wish.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        const next = checked
                          ? personalInfo.wish.filter((w) => w !== opt.id)
                          : [...personalInfo.wish, opt.id]
                        onPersonalInfoChange({ wish: next })
                      }}
                      className={`rounded-full border px-2.5 py-1 text-xs transition ${
                        checked
                          ? 'border-ink-gold-500 bg-ink-red-600 text-white'
                          : 'border-ink-red-500/20 text-ink-ink/70 hover:border-ink-red-500'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onAiInspire}
            disabled={isAiLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-red-500/20 bg-ink-red-500/10 px-4 py-3 text-sm font-semibold text-ink-ink transition hover:bg-ink-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isAiLoading ? 'AI 生成中...' : '根据八字流年生成春联'}
          </button>
        </div>
      )}

      {activeTab === 'keyword' && (
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-ink-ink">关键词</label>
            <input
              value={aiKeyword}
              onChange={(e) => onAiKeywordChange(e.target.value)}
              className="rounded-xl border border-ink-red-500/20 bg-white px-3 py-2 text-sm text-ink-ink shadow-sm focus:border-ink-red-500 focus:outline-none"
              placeholder="健康、学业、财运、团圆..."
            />
          </div>
          <button
            type="button"
            onClick={onAiInspire}
            disabled={isAiLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-red-500/20 bg-ink-red-500/10 px-4 py-3 text-sm font-semibold text-ink-ink transition hover:bg-ink-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isAiLoading ? 'AI 生成中...' : 'AI 根据关键词生成春联'}
          </button>
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-ink-ink">上联</label>
            <input
              value={content.upper}
              onChange={(e) => onContentChange({ ...content, upper: e.target.value })}
              className="rounded-xl border border-ink-red-500/20 bg-white px-3 py-2 text-sm shadow-sm focus:border-ink-red-500 focus:outline-none"
              placeholder="请输入上联"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-ink-ink">下联</label>
            <input
              value={content.lower}
              onChange={(e) => onContentChange({ ...content, lower: e.target.value })}
              className="rounded-xl border border-ink-red-500/20 bg-white px-3 py-2 text-sm shadow-sm focus:border-ink-red-500 focus:outline-none"
              placeholder="请输入下联"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <label className="text-sm font-semibold text-ink-ink">横批</label>
              <input
                value={content.banner}
                onChange={(e) => onContentChange({ ...content, banner: e.target.value })}
                className="rounded-xl border border-ink-red-500/20 bg-white px-3 py-2 text-sm shadow-sm focus:border-ink-red-500 focus:outline-none"
                placeholder="横批"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-semibold text-ink-ink">福字</label>
              <input
                value={content.fu}
                onChange={(e) => onContentChange({ ...content, fu: e.target.value })}
                className="rounded-xl border border-ink-red-500/20 bg-white px-3 py-2 text-sm shadow-sm focus:border-ink-red-500 focus:outline-none"
                placeholder="福"
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink-ink">款式</p>
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs text-ink-ink/70">SKU</p>
                <div className="flex gap-1 rounded-full bg-ink-red-500/10 p-1">
                  {skuOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onSkuChange(opt.id)}
                      className={`flex-1 rounded-full px-2 py-1.5 text-xs font-medium transition ${
                        opt.id === sku ? 'bg-ink-red-600 text-white' : 'text-ink-ink/70 hover:text-ink-ink'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-ink-ink/70">字体颜色</p>
                <div className="flex gap-1.5">
                  {inkColorOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onInkColorChange(opt.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        opt.id === inkColor
                          ? 'border-ink-gold-500 bg-ink-red-600 text-white'
                          : 'border-ink-red-500/20 text-ink-ink/70 hover:text-ink-ink'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-ink-ink/70">纸张</p>
                <div className="flex flex-wrap gap-1.5">
                  {paperOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onPaperStyleChange(opt.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        opt.id === paperStyle
                          ? 'border-ink-gold-500 bg-ink-red-600 text-white'
                          : 'border-ink-red-500/20 text-ink-ink/70 hover:text-ink-ink'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-ink-ink/70">镶边</p>
                <div className="flex flex-wrap gap-1.5">
                  {borderPatternOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onBorderPatternChange(opt.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        opt.id === borderPattern
                          ? 'border-ink-gold-500 bg-ink-red-600 text-white'
                          : 'border-ink-red-500/20 text-ink-ink/70 hover:text-ink-ink'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-ink-ink/70">字体</p>
                <select
                  value={fontFamily}
                  onChange={(e) => onFontChange(e.target.value)}
                  className="w-full rounded-lg border border-ink-red-500/20 bg-white px-3 py-2 text-sm focus:border-ink-red-500 focus:outline-none"
                >
                  {fontOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ConfigPanel
