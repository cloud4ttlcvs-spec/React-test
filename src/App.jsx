import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUp,
  BadgePercent,
  ChevronDown,
  ExternalLink,
  Gift,
  LayoutGrid,
  ImageIcon,
  Link2,
  Menu,
  Palette,
  PlayCircle,
  Printer,
  Search,
  Settings2,
  Share2,
  Sparkles,
  Star,
  Type,
  X,
} from 'lucide-react'
import { useAppStore } from './store/useAppStore'

const BASE_URL = import.meta.env.BASE_URL || '/'
const STORAGE_KEYS = {
  theme: 'ttl-react-theme-v7',
  scale: 'ttl-react-scale-v7',
}

const CATEGORY_META = [
  { key: 'all', label: '全部', anchor: 'promo' },
  { key: '保健飲品', label: '保健飲品', anchor: 'sec-drinks' },
  { key: '保健食品', label: '保健食品', anchor: 'sec-health' },
  { key: '美容產品', label: '美容產品', anchor: 'sec-beauty' },
  { key: '清潔產品', label: '清潔產品', anchor: 'sec-cleaning' },
  { key: '其他', label: '其他', anchor: 'sec-other' },
]

// 完美還原台酒品牌色與延伸主題
const THEMES = [
  {
    key: 'ttl-classic',
    label: '台酒綠',
    colors: {
      '--bg': '#f8f9fa',
      '--bg-soft': '#f0f4f8',
      '--surface': '#ffffff',
      '--surface-soft': '#fcfcfc',
      '--border': '#cfd8dc',
      '--text': '#263238',
      '--muted': '#546e7a',
      '--primary': '#00897b',
      '--primary-strong': '#00695c',
      '--primary-soft': '#e0f2f1',
      '--promo': '#00897b',
      '--promo-soft': '#dff5f1',
      '--chip': '#eceff1',
      '--highlight': '#ffeb3b',
      '--highlight-text': '#d81b60',
      '--price': '#d81b60',
      '--shadow': 'rgba(0,0,0,0.05)',
    },
  },
  {
    key: 'ttl-rose',
    label: '玫瑰金',
    colors: {
      '--bg': '#fff8fb',
      '--bg-soft': '#fff0f6',
      '--surface': '#ffffff',
      '--surface-soft': '#fff7fa',
      '--border': '#f4d7e3',
      '--text': '#38242f',
      '--muted': '#7e5a69',
      '--primary': '#c74d7c',
      '--primary-strong': '#a12d61',
      '--primary-soft': '#ffe2ec',
      '--promo': '#c74d7c',
      '--promo-soft': '#ffe5ee',
      '--chip': '#fff2f7',
      '--highlight': '#ffeb3b',
      '--highlight-text': '#d81b60',
      '--price': '#d81b60',
      '--shadow': 'rgba(199, 77, 124, 0.12)',
    },
  },
  {
    key: 'ttl-blue',
    label: '清新藍',
    colors: {
      '--bg': '#f6fbff',
      '--bg-soft': '#eef7ff',
      '--surface': '#ffffff',
      '--surface-soft': '#f8fbff',
      '--border': '#d9e8f6',
      '--text': '#1f3145',
      '--muted': '#60758a',
      '--primary': '#3b82f6',
      '--primary-strong': '#1d4ed8',
      '--primary-soft': '#dbeafe',
      '--promo': '#3b82f6',
      '--promo-soft': '#e3f0ff',
      '--chip': '#eef5ff',
      '--highlight': '#fff59d',
      '--highlight-text': '#d81b60',
      '--price': '#ef4444',
      '--shadow': 'rgba(59, 130, 246, 0.12)',
    },
  },
  {
    key: 'ttl-purple',
    label: '優雅紫',
    colors: {
      '--bg': '#faf7ff',
      '--bg-soft': '#f3eeff',
      '--surface': '#ffffff',
      '--surface-soft': '#fbf9ff',
      '--border': '#e4ddf5',
      '--text': '#342c46',
      '--muted': '#6f6588',
      '--primary': '#8b5cf6',
      '--primary-strong': '#6d28d9',
      '--primary-soft': '#ede9fe',
      '--promo': '#8b5cf6',
      '--promo-soft': '#f0ebff',
      '--chip': '#f4f0ff',
      '--highlight': '#fff59d',
      '--highlight-text': '#c2185b',
      '--price': '#e11d48',
      '--shadow': 'rgba(139, 92, 246, 0.12)',
    },
  },
]

const SCALE_PRESETS = {
  'A': { rowImage: 65, detailImage: 96, name: 'text-[14px]', title: 'text-[12px]', price: 'text-[16px]', body: 'text-[13px]' },
  'A+': { rowImage: 80, detailImage: 110, name: 'text-[16px]', title: 'text-[14px]', price: 'text-[18px]', body: 'text-[15px]' },
  'A++': { rowImage: 100, detailImage: 120, name: 'text-[18px]', title: 'text-[16px]', price: 'text-[20px]', body: 'text-[16px]' },
}

const PROMO_STATUS_META = {
  active: { label: '進行中', className: 'border-orange-200 bg-orange-50 text-orange-700' },
  upcoming: { label: '即將開始', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  ended: { label: '已結束', className: 'border-slate-200 bg-slate-100 text-slate-600 line-through' },
}

function normalizeCategory(raw) {
  const value = raw || ''
  if (value.includes('美容') || value.includes('保養')) return '美容產品'
  if (value.includes('清潔') || value.includes('洗沐')) return '清潔產品'
  if (value.includes('飲品') || value.includes('黑麥汁')) return '保健飲品'
  if (value.includes('保健食品') || value.includes('健康') || value.includes('買一送一')) return '保健食品'
  return '其他'
}


function getPromoGroups(promo) {
  const source = promo.relatedProducts || []
  const groups = [...new Set(source.map((item) => item?.group).filter(Boolean).filter((group) => group !== '其他'))]
  return groups.length ? groups : ['其他']
}

function getPromoImage(promo) {
  return promo.imgUrl || promo.img || ''
}

function parseTags(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (!raw) return []
  return String(raw).split(/[，,]/).map((item) => item.trim()).filter(Boolean)
}

function parseMoreLinks(raw) {
  if (!raw) return []
  return String(raw).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split('|')
    const type = parts[0] || ''
    const label = parts.length >= 3 ? parts[1] : (type || '更多素材')
    const url = parts.length >= 3 ? parts.slice(2).join('|') : (parts[1] || line)
    return { type, label, url }
  }).filter((item) => item.url)
}

function getYouTubeEmbed(url) {
  if (!url) return ''
  const match = String(url).match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/)
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&playsinline=1` : ''
}

function currency(value) {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(Number(value || 0))
}

function placeholderSvg(label = 'TTL Bio-Tech') {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#f0f4f8"/><stop offset="1" stop-color="#cfd8dc"/></linearGradient></defs><rect width="480" height="360" fill="url(#g)" rx="28"/><text x="50%" y="46%" font-size="20" text-anchor="middle" fill="#546e7a" font-family="Arial, sans-serif">${label}</text><text x="50%" y="58%" font-size="13" text-anchor="middle" fill="#90a4ae" font-family="Arial, sans-serif">無圖片</text></svg>`)}`
}

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return fallback
    try {
      return window.localStorage.getItem(key) || fallback
    } catch { return fallback }
  })
  useEffect(() => {
    try { window.localStorage.setItem(key, value) } catch {}
  }, [key, value])
  return [value, setValue]
}

function useScrollSpy(ids) {
  const setActiveSection = useAppStore((state) => state.setActiveSection)
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!elements.length) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-185px 0px -60% 0px', threshold: [0, 0.5, 1] }
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [ids, setActiveSection])
}

function useBodyLock(locked) {
  useEffect(() => {
    if (!locked) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [locked])
}

// 完美的關鍵字高亮元件，保留原始設計的 mark 標籤感
function HighlightText({ text, keyword }) {
  if (!keyword || !text) return <>{text}</>
  const parts = String(text).split(new RegExp(`(${keyword})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} className="rounded-[2px] bg-[var(--highlight)] px-0.5 font-bold text-[var(--highlight-text)] shadow-sm">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 border-l-4 border-[var(--primary)] pl-2">
      <div>
        <h2 className="text-[18px] font-black text-[var(--text)]">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p> : null}
      </div>
    </div>
  )
}

function CarouselCard({ children }) {
  return (
    <div className="w-[85vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-md shadow-[var(--shadow)] transition-transform active:scale-[0.98]">
      {children}
    </div>
  )
}

function SafeImage({ src, alt, className, fallbackLabel, contain = false }) {
  const [currentSrc, setCurrentSrc] = useState(src || placeholderSvg(fallbackLabel))
  useEffect(() => { setCurrentSrc(src || placeholderSvg(fallbackLabel)) }, [src, fallbackLabel])
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} ${contain ? 'object-contain mix-blend-multiply' : 'object-cover'}`}
      onError={() => setCurrentSrc(placeholderSvg(fallbackLabel))}
      loading="lazy"
      decoding="async"
    />
  )
}

function LoaderOverlay({ progress, stage }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="w-[min(90vw,340px)] rounded-[22px] border border-white/50 bg-white/90 p-6 text-center shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
          <Sparkles className="h-4 w-4" /> 台酒生技
        </div>
        <h3 className="mt-4 text-[17px] font-black text-[var(--text)]">正在準備銷售支援內容</h3>
        <p className="mt-2 text-xs text-[var(--muted)]">首次啟動時，系統會先同步主資料並建立商品卡。</p>
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[var(--primary-soft)] via-[var(--primary)] to-[var(--primary-strong)]" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        <p className="mt-3 text-[14px] font-bold text-[var(--text)]">{stage}</p>
      </div>
    </motion.div>
  )
}

function ToastMessage() {
  const toast = useAppStore((state) => state.toast)
  const clearToast = useAppStore((state) => state.clearToast)
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => clearToast(toast.id), 2500)
    return () => window.clearTimeout(timer)
  }, [toast, clearToast])
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 z-[90] flex w-max max-w-[90%] -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-black/90 px-6 py-3 text-[16px] font-bold text-white shadow-xl backdrop-blur-sm"
        >
          {toast.message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function SettingsPanel({ open, onClose, theme, setTheme, scale, setScale }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(event) => event.stopPropagation()}
            className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-[24px] bg-[var(--surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 shadow-2xl"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[var(--text)]">系統顯示設定</h3>
              <button onClick={onClose} className="rounded-full bg-[var(--surface-soft)] p-2 text-[var(--muted)]"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-6 space-y-6">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--text)]"><Type className="h-4 w-4" />字級與排版密度</div>
                <div className="flex gap-3">
                  {Object.keys(SCALE_PRESETS).map((key) => (
                    <button key={key} onClick={() => setScale(key)} className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition ${scale === key ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-md' : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]'}`}>
                      {key}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--text)]"><Palette className="h-4 w-4" />品牌配色主題</div>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((item) => (
                    <button key={item.key} onClick={() => setTheme(item.key)} className={`flex items-center gap-3 rounded-xl border p-3 transition ${theme === item.key ? 'border-[var(--primary)] bg-[var(--primary-soft)] ring-2 ring-[var(--primary)] ring-offset-1' : 'border-[var(--border)] bg-[var(--surface-soft)]'}`}>
                      <div className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[var(--border)]">
                        <div className="h-full w-1/2" style={{ background: item.colors['--bg'] }} />
                        <div className="h-full w-1/2" style={{ background: item.colors['--primary'] }} />
                      </div>
                      <span className="text-sm font-bold text-[var(--text)]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function PromoCarousel({ items, onOpenPromo }) {
  if (!items.length) return null
  return (
    <section id="promo" data-spy-section className="scroll-mt-[185px]">
      <SectionTitle title="🔥 促銷焦點" subtitle="左右滑動檢視近期活動" />
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:-mx-0 md:px-0">
        {items.map((promo) => {
          const statusMeta = PROMO_STATUS_META[promo.status] || PROMO_STATUS_META.active
          const promoImage = getPromoImage(promo)
          return (
            <CarouselCard key={promo.promoId}>
              <button onClick={() => onOpenPromo(promo)} className="flex h-full w-full flex-col text-left">
                <div className="relative aspect-[16/9] w-full bg-slate-100">
                  {promoImage ? <SafeImage src={promoImage} alt={promo.title} fallbackLabel="活動圖片" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><BadgePercent className="h-10 w-10" /></div>}
                  <div className={`absolute left-2 top-2 rounded-full border px-2.5 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-sm ${statusMeta.className}`}>
                    {statusMeta.label}
                  </div>
                  <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-sm" style={{ color: 'var(--promo)' }}>
                    {promo.endDate || promo.startDate}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 text-[15px] font-black leading-tight text-[var(--text)]">{promo.shortTitle || promo.title}</h3>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-[var(--muted)]">{promo.content}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {getPromoGroups(promo).slice(0,3).map((group) => (
                      <span key={group} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'var(--promo-soft)', color: 'var(--promo)' }}>
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            </CarouselCard>
          )
        })}
      </div>
    </section>
  )
}

function RankingCarousel({ items, onOpenProduct, subtitle = '依據實際銷售數據即時更新' }) {
  if (!items.length) return null
  return (
    <section id="hot" data-spy-section className="scroll-mt-[185px]">
      <SectionTitle title="👑 熱銷排行" subtitle={subtitle} />
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 md:-mx-0 md:px-0">
        {items.map((product) => (
          <div key={product.code} className="w-[110px] shrink-0 snap-start">
            <button onClick={() => onOpenProduct(product.code)} className="flex w-full flex-col items-center gap-2 text-center transition-transform active:scale-95">
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-2 shadow-sm">
                <SafeImage src={product.photo} alt={product.name} fallbackLabel={product.name} contain className="h-full w-full" />
                <div className={`absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-br-lg text-[12px] font-black text-white shadow-sm ${product.rank === 1 ? 'bg-[#ffd700] text-[#3e2723]' : product.rank === 2 ? 'bg-[#cfd8dc] text-[#37474f]' : product.rank === 3 ? 'bg-[#d7ccc8] text-[#3e2723]' : 'bg-black/60'}`}>
                  {product.rank}
                </div>
              </div>
              <p className="line-clamp-2 text-[12px] font-bold leading-tight text-[var(--text)]">{product.name}</p>
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProductRow({ product, scale, keyword, onOpenProductByCode, onApplyTagFilter }) {
  const expandedCardId = useAppStore((state) => state.expandedCardId)
  const setExpandedCardId = useAppStore((state) => state.setExpandedCardId)
  const openLightbox = useAppStore((state) => state.openLightbox)
  const openVideo = useAppStore((state) => state.openVideo)
  const openMediaSheet = useAppStore((state) => state.openMediaSheet)
  const seenVideos = useAppStore((state) => state.seenVideos)
  const markVideoSeen = useAppStore((state) => state.markVideoSeen)
  const showToast = useAppStore((state) => state.showToast)
  const cardRef = useRef(null)
  const isExpanded = expandedCardId === product.code
  const scalePreset = SCALE_PRESETS[scale]

  const toggle = () => {
    const willExpand = expandedCardId !== product.code
    setExpandedCardId(product.code)
    if (willExpand) {
      window.setTimeout(() => {
        const el = cardRef.current
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 185
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 150)
      if (typeof window !== 'undefined') window.history.pushState({ ui: 'card', code: product.code }, '')
    }
  }

  const copyPitch = async () => {
    const payload = `【 ✨ 產品推薦 】\n🌿 ${product.name}\n-------------------\n💬 主打：${product.title}\n📝 特色：${product.content}\n💰 優惠價：$${product.price.toLocaleString()}\n${product.tags.map(t => '#' + t).join(' ')}\n-------------------\n(台酒生技)`
    try {
      await navigator.clipboard.writeText(payload)
      showToast(<span><Sparkles className="inline mb-1 h-5 w-5"/> 已複製銷售文案</span>)
    } catch {
      showToast('複製失敗，請稍後再試')
    }
  }

  const openVideoInline = () => {
    if (!product.videoUrl) return
    markVideoSeen(product.code, product.videoUrl)
    openVideo({ title: product.name, url: product.videoUrl })
    if (typeof window !== 'undefined') window.history.pushState({ ui: 'video', code: product.code }, '')
  }

  const hasSeenVideo = Boolean(seenVideos[product.code])

  return (
    <div ref={cardRef} className={`relative overflow-hidden rounded-xl border bg-[var(--surface)] transition-all ${isExpanded ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10' : 'border-[var(--border)] shadow-sm'}`}>
      {product.isNew && (
        <div className="absolute left-0 top-0 z-10 flex items-center gap-0.5 rounded-br-[10px] bg-[#ff5252] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
          NEW
        </div>
      )}
      <button onClick={toggle} className="relative flex w-full items-center gap-3 p-3 text-left">
        <div className="relative shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-[#fcfcfc]" style={{ width: scalePreset.rowImage, height: scalePreset.rowImage }} onClick={(event) => { if (isExpanded) { event.stopPropagation(); openLightbox({ src: product.photo || placeholderSvg(product.name), title: product.name }) } }}>
          <SafeImage src={product.photo} alt={product.name} fallbackLabel={product.name} contain className="h-full w-full p-1" />
          {product.videoUrl && (
            <div className={`absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-sm shadow-sm ${hasSeenVideo ? 'bg-black/40' : 'bg-[var(--promo)] ring-2 ring-[var(--promo)]/35'}`}>
              <PlayCircle className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-[var(--muted)]"><HighlightText text={product.code} keyword={keyword} /></p>
              <h3 className={`mt-0.5 line-clamp-2 font-black leading-snug text-[var(--text)] ${scalePreset.name}`}>
                <HighlightText text={product.name} keyword={keyword} />
              </h3>
              <p className={`mt-0.5 line-clamp-2 font-bold text-[var(--primary)] ${scalePreset.title}`}><HighlightText text={product.title || product.spec || ''} keyword={keyword} /></p>
              {product.spec && product.spec !== product.title ? <p className="mt-0.5 text-[11px] text-[var(--muted)] line-clamp-1">{product.spec}</p> : null}
              <div className="mt-1 flex flex-wrap gap-1.5">
                {product.promos.map((promo) => (
                  <span key={promo.promoId} className="flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-bold" style={{ borderColor: 'var(--promo)', background: 'var(--promo-soft)', color: 'var(--promo)' }}>
                    <Gift className="h-3 w-3" />{promo.shortTitle || promo.title}
                  </span>
                ))}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className={`font-black text-[var(--price)] ${scalePreset.price}`}>
                <span className="text-xs mr-0.5">$</span>{product.price.toLocaleString()}
              </p>
              <ChevronDown className={`ml-auto mt-2 h-5 w-5 text-slate-300 transition-transform ${isExpanded ? 'rotate-180 text-[var(--primary)]' : ''}`} />
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-[var(--border)] bg-[#fafafa]"
          >
            <div className="p-4">
              {product.title && (
                <div className={`mb-1.5 flex items-center gap-1 font-black text-[var(--primary)] ${scalePreset.name}`}>
                  <span className="text-[#ffd700]">★</span>
                  <HighlightText text={product.title} keyword={keyword} />
                </div>
              )}
              <p className={`whitespace-pre-line leading-relaxed text-[#455a64] ${scalePreset.body}`}>{product.content || <span className="text-sm text-slate-400">尚無詳細資料</span>}</p>
              
              {product.tags && product.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <button key={tag} onClick={() => onApplyTagFilter(product.code, tag)} className="rounded text-[11px] bg-[var(--chip)] px-2 py-1 text-[var(--muted)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] active:scale-95">
                      #<HighlightText text={tag} keyword={keyword} />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                {product.videoUrl && (
                  <button onClick={openVideoInline} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95 ${hasSeenVideo ? 'bg-slate-200 text-slate-600' : 'bg-[var(--promo)] text-white shadow-md'}`}>
                    <PlayCircle className="h-4 w-4" />商品影片
                  </button>
                )}
                {product.moreLinks.length > 0 && (
                  <button onClick={() => { openMediaSheet(product); if (typeof window !== 'undefined') window.history.pushState({ ui: 'sheet', code: product.code }, '') }} className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--text)] transition active:scale-95">
                    <Link2 className="h-4 w-4" />更多素材
                  </button>
                )}
                <button onClick={copyPitch} className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--muted)] transition active:scale-95 hover:bg-slate-50">
                  <Share2 className="h-4 w-4" />分享
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function MediaSheet() {
  const activeModal = useAppStore((state) => state.activeModal)
  const mediaSheetProduct = useAppStore((state) => state.mediaSheetProduct)
  const closeModal = useAppStore((state) => state.closeModal)
  if (activeModal !== 'sheet' || !mediaSheetProduct) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[75] bg-black/55 backdrop-blur-[3px]" onClick={closeModal}>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          onClick={(event) => event.stopPropagation()}
          className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg rounded-t-[24px] bg-white px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 shadow-2xl"
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <p className="text-[14px] font-black text-[var(--text)] flex items-center gap-1.5"><Link2 className="h-4 w-4 text-[var(--muted)]"/>更多素材</p>
              <p className="mt-0.5 text-[12px] text-[var(--muted)]">商品：{mediaSheetProduct.name}</p>
            </div>
            <button onClick={closeModal} className="rounded-full bg-slate-100 p-2 text-slate-500"><X className="h-5 w-5" /></button>
          </div>
          <div className="mt-3 max-h-[60vh] overflow-y-auto space-y-2 pb-4">
            {mediaSheetProduct.moreLinks.length ? mediaSheetProduct.moreLinks.map((item, index) => {
              const IconTag = item.type === 'yt' ? PlayCircle : item.type === 'ig' ? ImageIcon : ExternalLink
              return (
                <a key={`${item.url}-${index}`} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-[14px] font-bold text-[var(--text)] active:bg-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm ${item.type==='yt'?'bg-red-500':item.type==='fb'?'bg-blue-600':item.type==='ig'?'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500':'bg-slate-500'}`}>
                      <IconTag className="h-4 w-4" />
                    </div>
                    {item.label}
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </a>
              )
            }) : <div className="py-8 text-center text-sm text-[var(--muted)]"><Search className="mx-auto mb-2 h-8 w-8 text-slate-300"/>沒有可用的連結</div>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function VideoModal() {
  const activeModal = useAppStore((state) => state.activeModal)
  const videoPayload = useAppStore((state) => state.videoPayload)
  const closeModal = useAppStore((state) => state.closeModal)
  if (activeModal !== 'video' || !videoPayload) return null
  const embedUrl = getYouTubeEmbed(videoPayload.url)
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[76] bg-black/80 backdrop-blur-sm" onClick={closeModal}>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} onClick={(event) => event.stopPropagation()} className="absolute inset-x-4 top-1/2 mx-auto w-[min(100%,760px)] -translate-y-1/2 overflow-hidden rounded-[20px] bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-100 p-3">
            <div className="min-w-0 pr-3">
              <h3 className="flex items-center gap-1.5 text-[15px] font-black text-[var(--text)]"><PlayCircle className="h-4 w-4 text-[var(--muted)]"/>商品影片</h3>
              <p className="mt-0.5 truncate text-[12px] text-[var(--muted)]">{videoPayload.title}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a href={videoPayload.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
                <ExternalLink className="h-3 w-3"/>外部開啟
              </a>
              <button onClick={closeModal} className="rounded-full bg-slate-100 p-1.5 text-slate-500"><X className="h-5 w-5" /></button>
            </div>
          </div>
          <div className="bg-black">
            <div className="relative w-full pt-[56.25%]">
              {embedUrl ? <iframe src={embedUrl} title={videoPayload.title} className="absolute inset-0 h-full w-full border-0 bg-black" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen playsInline /> : <video src={videoPayload.url} controls className="absolute inset-0 h-full w-full bg-black object-contain" playsInline />}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function LightboxModal() {
  const activeModal = useAppStore((state) => state.activeModal)
  const lightbox = useAppStore((state) => state.lightbox)
  const closeModal = useAppStore((state) => state.closeModal)
  if (activeModal !== 'lightbox' || !lightbox) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[77] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={closeModal}>
        <button onClick={closeModal} className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-md"><X className="h-6 w-6" /></button>
        <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={lightbox.src} alt={lightbox.title} className="max-h-[85vh] max-w-[95vw] object-contain" onClick={(e) => e.stopPropagation()} />
      </motion.div>
    </AnimatePresence>
  )
}

function FabMenu({ onScrollTop, onGotoPromo, onGotoHot, onToggleSettings, onCollapseAll }) {
  const fabOpen = useAppStore((state) => state.fabOpen)
  const toggleFab = useAppStore((state) => state.toggleFab)
  const closeFab = useAppStore((state) => state.closeFab)
  const actions = [
    { key: 'settings', label: '顯示設定', icon: Settings2, onClick: onToggleSettings },
    { key: 'collapse', label: '收合全部卡片', icon: LayoutGrid, onClick: onCollapseAll },
    { key: 'top', label: '回到最頂端', icon: ArrowUp, onClick: onScrollTop },
  ]

  return (
    <div className="fixed bottom-[calc(20px+env(safe-area-inset-bottom))] right-4 z-[72] flex flex-col items-end gap-3">
      <button onClick={onGotoPromo} className="promo-balloon flex h-[46px] w-[46px] items-center justify-center rounded-full text-white shadow-lg outline-none" style={{ background: 'var(--promo)' }}>
        <BadgePercent className="h-6 w-6" />
      </button>
      <AnimatePresence>
        {fabOpen && (
          <motion.div initial="hidden" animate="show" exit="hidden" variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } }, hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } } }} className="absolute bottom-16 right-0 flex flex-col items-end gap-2">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.key}
                  variants={{ hidden: { opacity: 0, y: 20, scale: 0.8 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } } }}
                  onClick={() => { action.onClick(); closeFab() }}
                  className="flex h-[40px] items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-md"
                >
                  {action.label}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100"><Icon className="h-4 w-4 text-[var(--primary)]" /></div>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={toggleFab} className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-xl outline-none transition-transform active:scale-90">
        <Menu className={`h-6 w-6 transition-transform duration-300 ${fabOpen ? 'rotate-90' : ''}`} />
      </button>
    </div>
  )
}

function PromoDrawer({ promo, onClose, onOpenProduct }) {
  if (!promo) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[74] bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} onClick={(event) => event.stopPropagation()} className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-[24px] bg-white shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-4">
            <div>
              <p className="text-[12px] font-bold text-[var(--primary)]">{promo.startDate} ~ {promo.endDate}</p>
              <h3 className="mt-0.5 text-[20px] font-black text-[var(--text)]">{promo.title}</h3>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500"><X className="h-6 w-6" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pb-[calc(20px+env(safe-area-inset-bottom))]">
            {getPromoImage(promo) && <div className="mb-4 overflow-hidden rounded-xl bg-black"><img src={getPromoImage(promo)} className="w-full" alt="活動" /></div>}
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-[var(--text)]">{promo.content}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


function PromoCenterPanel({ open, items, statusFilter, setStatusFilter, groupFilter, setGroupFilter, onOpenPromo, onClose }) {
  if (!open) return null
  const availableGroups = ['all', ...CATEGORY_META.filter((item) => item.key !== 'all' && item.key !== '其他').map((item) => item.key)]
  const filtered = items.filter((promo) => {
    const statusOk = statusFilter === 'all' || promo.status === statusFilter
    const groupOk = groupFilter === 'all' || getPromoGroups(promo).includes(groupFilter)
    return statusOk && groupOk
  })
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[73] bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} onClick={(event) => event.stopPropagation()} className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92vh] w-full max-w-3xl flex-col rounded-t-[24px] bg-[var(--surface)] shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] p-4">
            <div>
              <p className="text-[12px] font-bold" style={{ color: 'var(--promo)' }}>促銷專區</p>
              <h3 className="mt-0.5 text-[20px] font-black text-[var(--text)]">全部活動與篩選</h3>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500"><X className="h-5 w-5" /></button>
          </div>
          <div className="shrink-0 space-y-3 border-b border-[var(--border)] p-4">
            <div className="flex flex-wrap gap-2">
              {['all','active','upcoming','ended'].map((status) => {
                const active = statusFilter === status
                const label = status === 'all' ? '全部' : (PROMO_STATUS_META[status]?.label || status)
                return (
                  <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${active ? 'text-white shadow-sm' : 'bg-white text-[var(--muted)]'}`} style={active ? { background: 'var(--promo)', borderColor: 'var(--promo)' } : { borderColor: 'var(--border)' }}>
                    {label}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableGroups.map((group) => {
                const active = groupFilter === group
                const label = group === 'all' ? '全部品類' : group
                return (
                  <button key={group} onClick={() => setGroupFilter(group)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${active ? 'text-white shadow-sm' : 'bg-white text-[var(--muted)]'}`} style={active ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : { borderColor: 'var(--border)' }}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pb-[calc(20px+env(safe-area-inset-bottom))]">
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.length ? filtered.map((promo) => {
                const statusMeta = PROMO_STATUS_META[promo.status] || PROMO_STATUS_META.active
                const promoImage = getPromoImage(promo)
                return (
                  <button key={promo.promoId} onClick={() => onOpenPromo(promo)} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white text-left shadow-sm">
                    <div className="relative aspect-[16/9] bg-slate-100">
                      {promoImage ? <SafeImage src={promoImage} alt={promo.title} fallbackLabel="活動圖片" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><BadgePercent className="h-9 w-9" /></div>}
                      <div className={`absolute left-2 top-2 rounded-full border px-2.5 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-sm ${statusMeta.className}`}>
                        {statusMeta.label}
                      </div>
                    </div>
                    <div className="space-y-2 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="line-clamp-2 text-[15px] font-black leading-tight text-[var(--text)]">{promo.title}</h4>
                        <span className="shrink-0 text-[10px] font-bold text-[var(--muted)]">{promo.endDate || promo.startDate}</span>
                      </div>
                      <p className="line-clamp-3 text-[12px] leading-relaxed text-[var(--muted)]">{promo.content}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {getPromoGroups(promo).map((group) => (
                          <span key={group} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'var(--promo-soft)', color: 'var(--promo)' }}>
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                )
              }) : <div className="col-span-full py-10 text-center text-sm text-[var(--muted)]">沒有符合條件的促銷活動</div>}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const [theme, setTheme] = usePersistentState(STORAGE_KEYS.theme, THEMES[0].key)
  const [scale, setScale] = usePersistentState(STORAGE_KEYS.scale, 'A')
  const [products, setProducts] = useState([])
  const [promotions, setPromotions] = useState([])
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(8)
  const [stage, setStage] = useState('準備啟動系統...')
  const [keyword, setKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTag, setActiveTag] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [promoDrawer, setPromoDrawer] = useState(null)
  const [promoCenterOpen, setPromoCenterOpen] = useState(false)
  const [promoStatusFilter, setPromoStatusFilter] = useState('active')
  const [promoGroupFilter, setPromoGroupFilter] = useState('all')
  const [tagReturnCode, setTagReturnCode] = useState(null)
  const navRef = useRef(null)

  const expandedCardId = useAppStore((state) => state.expandedCardId)
  const closeExpandedCard = useAppStore((state) => state.closeExpandedCard)
  const activeSection = useAppStore((state) => state.activeSection)
  const activeModal = useAppStore((state) => state.activeModal)
  const mediaSheetProduct = useAppStore((state) => state.mediaSheetProduct)
  const hydrateSeenVideos = useAppStore((state) => state.hydrateSeenVideos)
  const closeModal = useAppStore((state) => state.closeModal)
  const closeFab = useAppStore((state) => state.closeFab)
  const showToast = useAppStore((state) => state.showToast)
  const setExpandedCardId = useAppStore((state) => state.setExpandedCardId)

  const themeConfig = THEMES.find((item) => item.key === theme) || THEMES[0]

  useBodyLock(Boolean(activeModal || promoDrawer || promoCenterOpen || settingsOpen))

  useEffect(() => { hydrateSeenVideos() }, [hydrateSeenVideos])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setStage('載入商品主檔...')
        setProgress(20)
        // 在真實環境應替換為實際 API
        const [mergedRes, promoRes, rankRes] = await Promise.allSettled([
          fetch(`${BASE_URL}merged-feed.json`),
          fetch(`${BASE_URL}promotions.json`),
          fetch(`${BASE_URL}rankings.json`)
        ])
        if (cancelled) return
        setProgress(60)

        const mergedJson = mergedRes.status === 'fulfilled' ? await mergedRes.value.json().catch(()=>({})) : {}
        const promoJson = promoRes.status === 'fulfilled' ? await promoRes.value.json().catch(()=>({})) : {}
        const rankJson = rankRes.status === 'fulfilled' ? await rankRes.value.json().catch(()=>({})) : {}

        setProducts(Array.isArray(mergedJson.items) ? mergedJson.items : [])
        setPromotions(Array.isArray(promoJson.items) ? promoJson.items : [])
        setRankings(Array.isArray(rankJson.items) ? rankJson.items : [])
        
        setProgress(100)
        setStage('完成載入')
        window.setTimeout(() => { if (!cancelled) setLoading(false) }, 300)
      } catch (error) {
        setStage('初始化完成 (無外掛資料)')
        setProgress(100)
        window.setTimeout(() => { if (!cancelled) setLoading(false) }, 300)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const normalizedProducts = useMemo(() => {
    const rankMap = new Map(rankings.map((item) => [item.code, item]))
    return products.map((item) => {
      const pitch = item.pitch || {}
      const rank = rankMap.get(item.code)
      return {
        code: item.code,
        name: item.name,
        category: item.category,
        group: normalizeCategory(item.category),
        price: Number(item.price || 0),
        photo: item.photo,
        title: pitch.title || '',
        content: pitch.content || '',
        tags: parseTags(pitch.tags),
        isNew: Boolean(pitch.isNew),
        spec: item.spec || '',
        videoUrl: item.videoUrl || '',
        moreLinks: parseMoreLinks(item.moreLinksRaw),
        rank: rank?.rank || null,
      }
    })
  }, [products, rankings])

  const productMap = useMemo(() => new Map(normalizedProducts.map((item) => [item.code, item])), [normalizedProducts])

  const enrichedPromotions = useMemo(() => {
    return promotions.map((promo) => ({
      ...promo,
      img: getPromoImage(promo),
      relatedProducts: (promo.relatedCodes || []).map((code) => productMap.get(code)).filter(Boolean),
    }))
  }, [promotions, productMap])

  const productsWithPromos = useMemo(() => {
    return normalizedProducts.map((product) => ({
      ...product,
      promos: enrichedPromotions.filter((promo) => (promo.relatedCodes || []).includes(product.code) && promo.status !== 'ended'),
    }))
  }, [normalizedProducts, enrichedPromotions])

  const allTags = useMemo(() => {
    const counter = new Map()
    productsWithPromos.forEach((item) => item.tags.forEach((tag) => counter.set(tag, (counter.get(tag) || 0) + 1)))
    return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([tag]) => tag)
  }, [productsWithPromos])

  const filteredProducts = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return productsWithPromos.filter((item) => {
      const categoryOk = activeCategory === 'all' || item.group === activeCategory
      const tagOk = !activeTag || item.tags.includes(activeTag)
      const haystack = [item.name, item.title, item.content, item.code, ...item.tags].join(' ').toLowerCase()
      const keywordOk = !q || haystack.includes(q)
      return categoryOk && tagOk && keywordOk
    })
  }, [productsWithPromos, keyword, activeCategory, activeTag])

  const groupedProducts = useMemo(() => {
    const groups = new Map()
    filteredProducts.forEach((item) => {
      if (!groups.has(item.group)) groups.set(item.group, [])
      groups.get(item.group).push(item)
    })
    return CATEGORY_META.filter((meta) => meta.key !== 'all').map((meta) => ({ ...meta, items: groups.get(meta.key) || [] })).filter((item) => item.items.length)
  }, [filteredProducts])

  const hotProducts = useMemo(() => productsWithPromos.filter((item) => item.rank && item.rank <= 10).sort((a, b) => a.rank - b.rank), [productsWithPromos])
  const visibleHotProducts = useMemo(() => {
    if (!filteredProducts.length) return hotProducts
    const codeSet = new Set(filteredProducts.map((item) => item.code))
    const matched = hotProducts.filter((item) => codeSet.has(item.code))
    return matched.length ? matched : hotProducts
  }, [filteredProducts, hotProducts])
  const promoItems = useMemo(() => enrichedPromotions.filter((promo) => promo.status !== 'ended').slice(0, 10), [enrichedPromotions])

  const sectionIds = useMemo(() => ['promo', 'hot', ...CATEGORY_META.filter((item) => item.key !== 'all').map((item) => item.anchor)], [])
  useScrollSpy(sectionIds)

  useEffect(() => {
    const button = navRef.current?.querySelector(`[data-anchor="${activeSection}"]`)
    button?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeSection])

  useEffect(() => {
    const handlePopState = () => {
      if (activeModal || mediaSheetProduct) { closeModal(); return }
      if (promoDrawer) { setPromoDrawer(null); return }
      if (promoCenterOpen) { setPromoCenterOpen(false); return }
      if (settingsOpen) { setSettingsOpen(false); return }
      if (activeTag || keyword || activeCategory !== 'all') {
        const restoreCode = tagReturnCode
        setActiveTag('')
        setKeyword('')
        setActiveCategory('all')
        if (restoreCode) {
          setExpandedCardId(restoreCode)
          window.setTimeout(() => {
            const el = document.getElementById(`card-${restoreCode}`)
            if (el) {
              const y = el.getBoundingClientRect().top + window.scrollY - 185
              window.scrollTo({ top: y, behavior: 'smooth' })
            }
          }, 120)
          setTagReturnCode(null)
        }
        return
      }
      if (expandedCardId) { closeExpandedCard(); return }
      closeFab()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [activeModal, mediaSheetProduct, promoDrawer, promoCenterOpen, settingsOpen, expandedCardId, activeTag, keyword, activeCategory, tagReturnCode, closeExpandedCard, closeFab, closeModal, setExpandedCardId])

  const scrollToId = useCallback((id) => {
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 185
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, [])

  const clearFilters = useCallback(() => {
    setKeyword('')
    setActiveTag('')
    setActiveCategory('all')
    setTagReturnCode(null)
  }, [])

  const applyTagFilter = useCallback((code, tag) => {
    setTagReturnCode(code)
    setActiveTag(tag)
    setKeyword('')
    setActiveCategory('all')
    setExpandedCardId(code)
    showToast(`已套用標籤：#${tag}`)
    if (typeof window !== 'undefined') window.history.pushState({ ui: 'tag-filter', code, tag }, '')
    window.setTimeout(() => {
      const el = document.getElementById(`card-${code}`)
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 185
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }, 120)
  }, [setExpandedCardId, showToast])

  const openProductByCode = useCallback((code) => {
    setExpandedCardId(code)
    window.setTimeout(() => {
      const el = document.getElementById(`card-${code}`)
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 185
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }, 150)
  }, [setExpandedCardId])

  return (
    <div style={themeConfig.colors} className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
      <style>{`
        html, body { min-height: 100%; background: var(--bg); overscroll-behavior-y: none; overflow-x: hidden; }
        .promo-balloon { animation: pulseGlow 2s infinite; }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(249,115,22,0.7); } 70% { box-shadow: 0 0 0 10px rgba(249,115,22,0); } 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); } }
        *::-webkit-scrollbar { display: none; } /* 為了 App 質感隱藏滾動條 */
      `}</style>

      {loading && <LoaderOverlay progress={progress} stage={stage} />}

      <div className="mx-auto max-w-4xl pb-[calc(100px+env(safe-area-inset-bottom))]">
        {/* 精確還原 Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/90 px-4 pb-2 pt-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="text-center w-full flex-1">
              <h1 className="text-[20px] font-black leading-none text-[var(--primary)]">TTL Bio-tech 健康美學</h1>
              <p className="mt-1 text-[11px] font-bold text-[var(--muted)]">台酒生技 產品銷售輔助</p>
            </div>
            <button className="absolute right-4 flex items-center gap-1 rounded-full border border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)] transition active:scale-95">
              <Printer className="h-4 w-4" />列印
            </button>
          </div>

          <div className="mx-auto mt-3 w-full max-w-[600px] relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input 
              value={keyword} 
              onChange={(e) => setKeyword(e.target.value)} 
              placeholder="搜尋產品名稱、關鍵字..." 
              className="h-[44px] w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-10 text-[15px] font-bold text-slate-700 outline-none focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-[var(--primary-soft)] transition"
            />
            {(keyword || activeTag) && (
              <button onClick={clearFilters} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-200 p-1 text-slate-500 hover:bg-slate-300">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {activeTag ? <div className="mt-2 flex items-center gap-2 px-1"><span className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>#{activeTag}</span><button onClick={clearFilters} className="text-[11px] font-bold text-[var(--muted)] underline underline-offset-2">返回全部</button></div> : null}
          <div ref={navRef} className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {[{ label: '全部', anchor: 'promo' }, ...CATEGORY_META.filter((item) => item.key !== 'all').map((item) => ({ label: item.label, anchor: item.anchor, category: item.key }))].map((item) => {
              const active = activeSection === item.anchor || (item.category && activeCategory === item.category)
              return (
                <button
                  key={item.anchor}
                  data-anchor={item.anchor}
                  onClick={() => { if (item.category) setActiveCategory(item.category); else setActiveCategory('all'); scrollToId(item.anchor) }}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[14px] font-bold transition ${active ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30' : 'bg-slate-100 text-slate-500'}`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </header>

        <main className="px-4 pt-4 space-y-6">
          <PromoCarousel items={promoItems} onOpenPromo={(promo) => { setPromoDrawer(promo); window.history.pushState({ ui: 'promo', promoId: promo.promoId }, '') }} />
          <RankingCarousel items={visibleHotProducts} onOpenProduct={openProductByCode} subtitle={keyword || activeTag ? '已依目前篩選條件保留相關熱銷品' : '依據實際銷售數據即時更新'} />

          {groupedProducts.length > 0 ? groupedProducts.map((group) => (
            <section key={group.key} id={group.anchor} data-spy-section className="scroll-mt-[185px]">
              <SectionTitle title={group.label} subtitle="" />
              <div className="space-y-3">
                {group.items.map((product) => (
                  <div id={`card-${product.code}`} key={product.code}>
                    <ProductRow product={product} scale={scale} keyword={keyword} onOpenProductByCode={openProductByCode} onApplyTagFilter={applyTagFilter} />
                  </div>
                ))}
              </div>
            </section>
          )) : (
            <div className="py-20 text-center">
              <Search className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-[16px] font-bold text-slate-500">沒有符合條件的商品</p>
            </div>
          )}
        </main>
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} theme={theme} setTheme={setTheme} scale={scale} setScale={setScale} />
      <MediaSheet />
      <VideoModal />
      <LightboxModal />
      <PromoCenterPanel open={promoCenterOpen} items={enrichedPromotions} statusFilter={promoStatusFilter} setStatusFilter={setPromoStatusFilter} groupFilter={promoGroupFilter} setGroupFilter={setPromoGroupFilter} onOpenPromo={(promo) => { setPromoDrawer(promo); window.history.pushState({ ui: 'promo', promoId: promo.promoId }, '') }} onClose={() => setPromoCenterOpen(false)} />
      <PromoDrawer promo={promoDrawer} onClose={() => setPromoDrawer(null)} onOpenProduct={openProductByCode} />
      <FabMenu onScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onGotoPromo={() => { setPromoCenterOpen(true); window.history.pushState({ ui: 'promo-center' }, '') }} onGotoHot={() => scrollToId('hot')} onToggleSettings={() => { setSettingsOpen(true); window.history.pushState({ ui: 'settings' }, '') }} onCollapseAll={() => closeExpandedCard()} />
      <ToastMessage />
    </div>
  )
}