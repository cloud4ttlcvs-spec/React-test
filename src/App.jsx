
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUp,
  BadgePercent,
  ChevronDown,
  ExternalLink,
  Gift,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  Menu,
  Palette,
  PlayCircle,
  Search,
  Settings2,
  Share2,
  Sparkles,
  Star,
  Tags,
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

const THEMES = [
  {
    key: 'rose',
    label: '玫瑰粉',
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
      '--chip': '#fff2f7',
      '--shadow': 'rgba(199, 77, 124, 0.18)',
    },
  },
  {
    key: 'peach',
    label: '蜜桃粉',
    colors: {
      '--bg': '#fff8f5',
      '--bg-soft': '#fff0ea',
      '--surface': '#ffffff',
      '--surface-soft': '#fff8f6',
      '--border': '#f2d8cd',
      '--text': '#3b2724',
      '--muted': '#82655d',
      '--primary': '#ce6b7d',
      '--primary-strong': '#b24d63',
      '--primary-soft': '#ffe5ea',
      '--chip': '#fff3f1',
      '--shadow': 'rgba(206, 107, 125, 0.18)',
    },
  },
  {
    key: 'berry',
    label: '莓果粉',
    colors: {
      '--bg': '#fff8fc',
      '--bg-soft': '#fbeff6',
      '--surface': '#ffffff',
      '--surface-soft': '#fff9fc',
      '--border': '#ecd2df',
      '--text': '#3a2232',
      '--muted': '#7d5f71',
      '--primary': '#b45182',
      '--primary-strong': '#8f2e5f',
      '--primary-soft': '#f6deea',
      '--chip': '#fff1f7',
      '--shadow': 'rgba(180, 81, 130, 0.18)',
    },
  },
  {
    key: 'mauve',
    label: '霧紫粉',
    colors: {
      '--bg': '#fdf8ff',
      '--bg-soft': '#f6eefb',
      '--surface': '#ffffff',
      '--surface-soft': '#fefbff',
      '--border': '#e5d6ef',
      '--text': '#32253a',
      '--muted': '#6b5b74',
      '--primary': '#9c5eb0',
      '--primary-strong': '#7d3f91',
      '--primary-soft': '#f0e2f6',
      '--chip': '#f7f0fb',
      '--shadow': 'rgba(156, 94, 176, 0.18)',
    },
  },
]

const SCALE_PRESETS = {
  A: { rowImage: 52, detailImage: 96, name: 'text-[14px]', title: 'text-[12px]', price: 'text-[15px]', body: 'text-sm' },
  'A+': { rowImage: 58, detailImage: 108, name: 'text-[15px]', title: 'text-[13px]', price: 'text-[16px]', body: 'text-[15px]' },
  'A++': { rowImage: 64, detailImage: 120, name: 'text-[16px]', title: 'text-[14px]', price: 'text-[17px]', body: 'text-base' },
}

const PROMO_STATUS_META = {
  active: { label: '進行中', className: 'border-rose-200 bg-rose-50 text-rose-700' },
  upcoming: { label: '即將開始', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  ended: { label: '已結束', className: 'border-slate-200 bg-slate-100 text-slate-600' },
}

function normalizeCategory(raw) {
  const value = raw || ''
  if (value.includes('美容')) return '美容產品'
  if (value.includes('清潔')) return '清潔產品'
  if (value.includes('飲品') || value.includes('黑麥汁')) return '保健飲品'
  if (value.includes('保健食品') || value.includes('買一送一')) return '保健食品'
  return '其他'
}

function parseTags(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (!raw) return []
  return String(raw)
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseMoreLinks(raw) {
  if (!raw) return []
  return String(raw)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [type = '', label = '', url = ''] = line.split('|')
      return { type, label: label || type || '更多素材', url }
    })
    .filter((item) => item.url)
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
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#f9e8ef"/><stop offset="1" stop-color="#f4d7e3"/></linearGradient></defs><rect width="480" height="360" fill="url(#g)" rx="28"/><text x="50%" y="46%" font-size="20" text-anchor="middle" fill="#8f2e5f" font-family="Arial, sans-serif">${label}</text><text x="50%" y="58%" font-size="13" text-anchor="middle" fill="#9c6a80" font-family="Arial, sans-serif">Image unavailable</text></svg>`)}`
}

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return fallback
    try {
      return window.localStorage.getItem(key) || fallback
    } catch {
      return fallback
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, value)
    } catch {}
  }, [key, value])

  return [value, setValue]
}

function useScrollSpy(ids) {
  const setActiveSection = useAppStore((state) => state.setActiveSection)

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (!elements.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) {
          setActiveSection(visible[0].target.id)
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0.1, 0.35, 0.6] }
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
    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[18px] font-semibold text-[var(--text)]">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p> : null}
      </div>
    </div>
  )
}

function CarouselCard({ children }) {
  return (
    <div className="w-[78vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm shadow-[var(--shadow)]/60">
      {children}
    </div>
  )
}

function SafeImage({ src, alt, className, fallbackLabel, contain = false }) {
  const [currentSrc, setCurrentSrc] = useState(src || placeholderSvg(fallbackLabel))

  useEffect(() => {
    setCurrentSrc(src || placeholderSvg(fallbackLabel))
  }, [src, fallbackLabel])

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} ${contain ? 'object-contain' : 'object-cover'}`}
      onError={() => setCurrentSrc(placeholderSvg(fallbackLabel))}
      loading="lazy"
    />
  )
}

function LoaderOverlay({ progress, stage }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-[color:var(--bg)]/95 backdrop-blur-sm">
      <div className="w-[min(88vw,360px)] rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl shadow-[var(--shadow)]/60">
        <div className="flex items-center gap-3 text-[var(--primary)]">
          <Sparkles className="h-5 w-5" />
          <p className="text-sm font-medium">正在整理銷售支援資料</p>
        </div>
        <p className="mt-3 text-[13px] text-[var(--muted)]">{stage}</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--bg-soft)]">
          <motion.div className="h-full rounded-full bg-[var(--primary)]" animate={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-right text-xs text-[var(--muted)]">{progress}%</p>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-20 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-[var(--text)] px-4 py-2 text-sm text-white shadow-lg"
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(event) => event.stopPropagation()}
            className="absolute right-4 top-16 w-[min(92vw,340px)] rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl shadow-[var(--shadow)]/60"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--muted)]">閱讀與主題</p>
                <h3 className="text-base font-semibold text-[var(--text)]">顯示設定</h3>
              </div>
              <button onClick={onClose} className="rounded-full bg-[var(--bg-soft)] p-2 text-[var(--muted)]"><X className="h-4 w-4" /></button>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text)]"><Type className="h-4 w-4" />字級 / 圖片倍率</div>
              <div className="flex gap-2">
                {Object.keys(SCALE_PRESETS).map((key) => (
                  <button key={key} onClick={() => setScale(key)} className={`rounded-full border px-3 py-2 text-sm ${scale === key ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]'}`}>
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text)]"><Palette className="h-4 w-4" />配色主題</div>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((item) => (
                  <button key={item.key} onClick={() => setTheme(item.key)} className={`rounded-2xl border p-3 text-left ${theme === item.key ? 'border-[var(--primary)] bg-[var(--primary-soft)]' : 'border-[var(--border)] bg-[var(--surface-soft)]'}`}>
                    <div className="flex gap-2">
                      <span className="h-5 w-5 rounded-full" style={{ background: item.colors['--bg-soft'] }} />
                      <span className="h-5 w-5 rounded-full" style={{ background: item.colors['--primary'] }} />
                    </div>
                    <p className="mt-2 text-sm font-medium text-[var(--text)]">{item.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function PromoCarousel({ items, onOpenPromo, onOpenProduct }) {
  if (!items.length) return null
  return (
    <section id="promo" data-spy-section className="scroll-mt-28">
      <SectionTitle title="促銷焦點" subtitle="左右滑動檢視近期活動，維持單手操作節奏。" />
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {items.map((promo) => {
          const statusMeta = PROMO_STATUS_META[promo.status] || PROMO_STATUS_META.active
          return (
            <CarouselCard key={promo.promoId}>
              <button onClick={() => onOpenPromo(promo)} className="block w-full text-left">
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusMeta.className}`}>{statusMeta.label}</span>
                    <BadgePercent className="h-4 w-4 text-[var(--primary)]" />
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold text-[var(--text)]">{promo.shortTitle || promo.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{promo.content}</p>
                  <p className="mt-3 text-xs text-[var(--muted)]">{promo.startDate || '未設定'} ～ {promo.endDate || '未設定'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {promo.relatedProducts.slice(0, 2).map((item) => (
                      <button key={item.code} onClick={(event) => { event.stopPropagation(); onOpenProduct(item.code) }} className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-[11px] text-[var(--muted)]">
                        {item.name}
                      </button>
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

function RankingCarousel({ items, onOpenProduct }) {
  if (!items.length) return null
  return (
    <section id="hot" data-spy-section className="scroll-mt-28">
      <SectionTitle title="熱銷主推" subtitle="優先呈現已有銷售驗證的強勢商品。" />
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {items.map((product) => (
          <CarouselCard key={product.code}>
            <button onClick={() => onOpenProduct(product.code)} className="block w-full text-left">
              <div className="flex gap-3 p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]">
                  <SafeImage src={product.photo} alt={product.name} fallbackLabel={product.name} contain className="h-full w-full p-1.5" />
                  <span className="absolute left-2 top-2 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold text-white">TOP {product.rank}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[var(--muted)]">{product.code}</p>
                  <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold text-[var(--text)]">{product.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{product.title}</p>
                  <p className="mt-3 text-sm font-semibold text-[var(--text)]">{currency(product.price)}</p>
                </div>
              </div>
            </button>
          </CarouselCard>
        ))}
      </div>
    </section>
  )
}

function ProductRow({ product, scale, onOpenProductByCode }) {
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
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 150)
      if (typeof window !== 'undefined') {
        window.history.pushState({ ui: 'card', code: product.code }, '')
      }
    }
  }

  const copyPitch = async () => {
    const payload = `${product.name}\n${product.title}\n${product.content}`
    try {
      await navigator.clipboard.writeText(payload)
      showToast('已複製銷售話術')
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

  const openSheet = () => {
    openMediaSheet(product)
    if (typeof window !== 'undefined') window.history.pushState({ ui: 'sheet', code: product.code }, '')
  }

  const hasSeenVideo = Boolean(seenVideos[product.code])

  return (
    <div ref={cardRef} className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-sm shadow-[var(--shadow)]/60">
      <button onClick={toggle} className="flex w-full items-center gap-3 px-2.5 py-2.5 text-left">
        <div className="relative shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]" style={{ width: scalePreset.rowImage, height: scalePreset.rowImage }}>
          <SafeImage src={product.photo} alt={product.name} fallbackLabel={product.name} contain className="h-full w-full p-1" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] text-[var(--muted)]">{product.code}</p>
              <h3 className={`mt-0.5 line-clamp-1 font-semibold text-[var(--text)] ${scalePreset.name}`}>{product.name}</h3>
              <p className={`mt-1 line-clamp-1 text-[var(--muted)] ${scalePreset.title}`}>{product.title}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {product.rank ? <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--primary-strong)]">TOP {product.rank}</span> : null}
                {product.promos.slice(0, 1).map((promo) => (
                  <span key={promo.promoId} className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">{promo.shortTitle || promo.title}</span>
                ))}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className={`font-semibold text-[var(--text)] ${scalePreset.price}`}>{currency(product.price)}</p>
              <ChevronDown className={`ml-auto mt-2 h-4 w-4 text-[var(--muted)] transition ${isExpanded ? 'rotate-180' : ''}`} />
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
            transition={{ duration: 0.26, ease: 'easeOut' }}
            className="overflow-hidden border-t border-[var(--border)]"
          >
            <div className="space-y-3 px-2.5 pb-3 pt-3">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    openLightbox({ src: product.photo, title: product.name })
                    if (typeof window !== 'undefined') window.history.pushState({ ui: 'lightbox', code: product.code }, '')
                  }}
                  className="relative shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]"
                  style={{ width: scalePreset.detailImage, height: scalePreset.detailImage }}
                >
                  <SafeImage src={product.photo} alt={product.name} fallbackLabel={product.name} contain className="h-full w-full p-2" />
                  <div className="absolute inset-x-2 bottom-2 rounded-full bg-black/55 px-2 py-1 text-[11px] text-white backdrop-blur-sm">點圖放大</div>
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`leading-6 text-[var(--text)] ${scalePreset.body}`}>{product.content}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <button key={tag} onClick={() => onOpenProductByCode(product.code, tag)} className="rounded-full border border-[var(--border)] bg-[var(--chip)] px-2.5 py-1 text-xs text-[var(--muted)]">
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  onClick={openVideoInline}
                  disabled={!product.videoUrl}
                  className={`rounded-2xl px-3 py-2.5 text-sm font-medium ${product.videoUrl ? (hasSeenVideo ? 'bg-slate-100 text-slate-600' : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md') : 'bg-slate-100 text-slate-400'}`}
                >
                  <span className="inline-flex items-center gap-2"><PlayCircle className="h-4 w-4" />影音</span>
                </button>
                <button onClick={openSheet} className="rounded-2xl bg-[var(--primary-soft)] px-3 py-2.5 text-sm font-medium text-[var(--primary-strong)]">
                  <span className="inline-flex items-center gap-2"><Link2 className="h-4 w-4" />更多素材</span>
                </button>
                <button onClick={copyPitch} className="rounded-2xl bg-[var(--surface-soft)] px-3 py-2.5 text-sm font-medium text-[var(--text)]">
                  <span className="inline-flex items-center gap-2"><Share2 className="h-4 w-4" />複製話術</span>
                </button>
                <button onClick={() => setExpandedCardId(product.code)} className="rounded-2xl bg-[var(--surface-soft)] px-3 py-2.5 text-sm font-medium text-[var(--muted)]">
                  收合內容
                </button>
              </div>

              {product.promos.length ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-rose-700"><Gift className="h-4 w-4" />相關促銷</div>
                  <div className="space-y-2">
                    {product.promos.map((promo) => (
                      <div key={promo.promoId} className="rounded-2xl bg-white/80 p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-[var(--text)]">{promo.shortTitle || promo.title}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] ${PROMO_STATUS_META[promo.status || 'active']?.className || PROMO_STATUS_META.active.className}`}>{PROMO_STATUS_META[promo.status || 'active']?.label || '活動中'}</span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{promo.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[75] bg-black/50 backdrop-blur-sm" onClick={closeModal}>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 240, damping: 26 }}
          onClick={(event) => event.stopPropagation()}
          className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-[32px] bg-[var(--surface)] px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-2xl"
        >
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-300" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--muted)]">更多素材</p>
              <h3 className="text-lg font-semibold text-[var(--text)]">{mediaSheetProduct.name}</h3>
            </div>
            <button onClick={closeModal} className="rounded-full bg-[var(--surface-soft)] p-2 text-[var(--muted)]"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 space-y-2">
            {mediaSheetProduct.moreLinks.length ? mediaSheetProduct.moreLinks.map((item, index) => (
              <a key={`${item.url}-${index}`} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)]">
                <span>{item.label}</span>
                <ExternalLink className="h-4 w-4 text-[var(--muted)]" />
              </a>
            )) : <div className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">此商品目前沒有更多素材。</div>}
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[76] bg-black/60 backdrop-blur-sm" onClick={closeModal}>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} onClick={(event) => event.stopPropagation()} className="absolute inset-x-4 top-1/2 mx-auto w-[min(92vw,760px)] -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/20 bg-black shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white">
            <div>
              <p className="text-xs text-white/60">站內影音</p>
              <h3 className="text-base font-semibold">{videoPayload.title}</h3>
            </div>
            <button onClick={closeModal} className="rounded-full bg-white/10 p-2 text-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="aspect-video bg-black">
            {embedUrl ? <iframe src={embedUrl} title={videoPayload.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <video src={videoPayload.url} controls className="h-full w-full" playsInline />}
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[77] bg-black/78 backdrop-blur-sm" onClick={closeModal}>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} onClick={(event) => event.stopPropagation()} className="absolute inset-x-4 top-1/2 mx-auto w-[min(92vw,780px)] -translate-y-1/2 overflow-hidden rounded-[28px] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div>
              <p className="text-xs text-[var(--muted)]">圖片預覽</p>
              <h3 className="text-base font-semibold text-[var(--text)]">{lightbox.title}</h3>
            </div>
            <button onClick={closeModal} className="rounded-full bg-[var(--surface-soft)] p-2 text-[var(--muted)]"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex items-center justify-center bg-[var(--bg-soft)] p-4">
            <SafeImage src={lightbox.src} alt={lightbox.title} fallbackLabel={lightbox.title} contain className="max-h-[72vh] w-full" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function FabMenu({ onScrollTop, onGotoPromo, onGotoHot, onToggleSettings, onCollapseAll }) {
  const fabOpen = useAppStore((state) => state.fabOpen)
  const toggleFab = useAppStore((state) => state.toggleFab)
  const closeFab = useAppStore((state) => state.closeFab)
  const actions = [
    { key: 'promo', label: '最新活動', icon: BadgePercent, onClick: onGotoPromo, balloon: true },
    { key: 'hot', label: '熱銷主推', icon: Star, onClick: onGotoHot },
    { key: 'settings', label: '顯示設定', icon: Settings2, onClick: onToggleSettings },
    { key: 'collapse', label: '收合全部', icon: LayoutGrid, onClick: onCollapseAll },
    { key: 'top', label: '回到頂端', icon: ArrowUp, onClick: onScrollTop },
  ]

  return (
    <div className="fixed bottom-[calc(18px+env(safe-area-inset-bottom))] right-4 z-[72] flex flex-col items-end gap-3">
      <button onClick={onGotoPromo} className="promo-balloon inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--shadow)]">
        <BadgePercent className="h-4 w-4" />最新活動
      </button>
      <AnimatePresence>
        {fabOpen ? (
          <motion.div initial="hidden" animate="show" exit="hidden" variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } }, hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } } }} className="flex flex-col items-end gap-2">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.key}
                  variants={{ hidden: { opacity: 0, y: 18, scale: 0.92 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 22 } } }}
                  onClick={() => { action.onClick(); closeFab() }}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] shadow-md shadow-[var(--shadow)]/60"
                >
                  <Icon className="h-4 w-4 text-[var(--primary)]" />
                  {action.label}
                </motion.button>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button onClick={toggleFab} className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-2xl shadow-[var(--shadow)]">
        <Menu className={`h-6 w-6 transition ${fabOpen ? 'rotate-90' : ''}`} />
      </button>
    </div>
  )
}

function PromoDrawer({ promo, onClose, onOpenProduct }) {
  if (!promo) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[74] bg-black/45 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 240, damping: 26 }} onClick={(event) => event.stopPropagation()} className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-[32px] bg-[var(--surface)] px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-2xl">
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-300" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--muted)]">促銷專區</p>
              <h3 className="text-lg font-semibold text-[var(--text)]">{promo.title}</h3>
            </div>
            <button onClick={onClose} className="rounded-full bg-[var(--surface-soft)] p-2 text-[var(--muted)]"><X className="h-4 w-4" /></button>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--text)]">{promo.content}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {promo.relatedProducts.map((item) => (
              <button key={item.code} onClick={() => onOpenProduct(item.code)} className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1.5 text-sm text-[var(--text)]">
                {item.name}
              </button>
            ))}
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
  const [stage, setStage] = useState('準備啟動...')
  const [keyword, setKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTag, setActiveTag] = useState('')
  const [promoFilter, setPromoFilter] = useState('all')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [promoDrawer, setPromoDrawer] = useState(null)
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
  const scalePreset = SCALE_PRESETS[scale] || SCALE_PRESETS.A

  useBodyLock(Boolean(activeModal || promoDrawer || settingsOpen))

  useEffect(() => {
    hydrateSeenVideos()
  }, [hydrateSeenVideos])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setStage('載入商品主檔...')
        setProgress(16)
        const mergedRes = await fetch(`${BASE_URL}merged-feed.json`)
        const mergedJson = await mergedRes.json()
        if (cancelled) return
        setProgress(46)

        setStage('整理促銷活動...')
        const promoRes = await fetch(`${BASE_URL}promotions.json`)
        const promoJson = await promoRes.json()
        if (cancelled) return
        setProgress(70)

        setStage('整合熱銷排行...')
        const rankRes = await fetch(`${BASE_URL}rankings.json`)
        const rankJson = await rankRes.json()
        if (cancelled) return

        setProducts(Array.isArray(mergedJson.items) ? mergedJson.items : [])
        setPromotions(Array.isArray(promoJson.items) ? promoJson.items : [])
        setRankings(Array.isArray(rankJson.items) ? rankJson.items : [])
        setProgress(100)
        setStage('完成')
        window.setTimeout(() => {
          if (!cancelled) setLoading(false)
        }, 220)
      } catch (error) {
        console.error(error)
        setStage('資料載入失敗')
        setProgress(100)
        window.setTimeout(() => {
          if (!cancelled) setLoading(false)
        }, 260)
      }
    }
    load()
    return () => {
      cancelled = true
    }
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
        title: pitch.title || item.name,
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
      relatedProducts: (promo.relatedCodes || []).map((code) => productMap.get(code)).filter(Boolean),
    }))
  }, [promotions, productMap])

  const productsWithPromos = useMemo(() => {
    return normalizedProducts.map((product) => ({
      ...product,
      promos: enrichedPromotions.filter((promo) => (promo.relatedCodes || []).includes(product.code)),
    }))
  }, [normalizedProducts, enrichedPromotions])

  const allTags = useMemo(() => {
    const counter = new Map()
    productsWithPromos.forEach((item) => item.tags.forEach((tag) => counter.set(tag, (counter.get(tag) || 0) + 1)))
    return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag)
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

  const promoItems = useMemo(() => {
    const base = promoFilter === 'all' ? enrichedPromotions : enrichedPromotions.filter((promo) => (promo.relatedProducts || []).some((product) => product.group === promoFilter))
    return base.filter((promo) => promo.status !== 'ended').slice(0, 10)
  }, [enrichedPromotions, promoFilter])

  const sectionIds = useMemo(() => ['promo', 'hot', ...CATEGORY_META.filter((item) => item.key !== 'all').map((item) => item.anchor)], [])
  useScrollSpy(sectionIds)

  useEffect(() => {
    const button = navRef.current?.querySelector(`[data-anchor="${activeSection}"]`)
    button?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeSection])

  useEffect(() => {
    const handlePopState = () => {
      if (activeModal || mediaSheetProduct) {
        closeModal()
        return
      }
      if (promoDrawer) {
        setPromoDrawer(null)
        return
      }
      if (settingsOpen) {
        setSettingsOpen(false)
        return
      }
      if (expandedCardId) {
        closeExpandedCard()
        return
      }
      closeFab()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [activeModal, mediaSheetProduct, promoDrawer, settingsOpen, expandedCardId, closeExpandedCard, closeFab, closeModal])

  const scrollToId = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const openProductByCode = useCallback((code, tag) => {
    const target = productsWithPromos.find((item) => item.code === code)
    if (!target) return
    if (tag) {
      setActiveTag(tag)
      showToast(`已套用標籤：#${tag}`)
    }
    setExpandedCardId(code)
    window.setTimeout(() => {
      document.getElementById(`card-${code}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
  }, [productsWithPromos, setExpandedCardId, showToast])

  const applyTheme = themeConfig.colors

  return (
    <div style={applyTheme} className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]">
      <style>{`
        html, body, #root { min-height: 100%; background: var(--bg); }
        body { overflow-x: hidden; }
        .promo-balloon { animation: pulseGlow 2s ease-in-out infinite; }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 10px 24px var(--shadow), 0 0 0 0 rgba(255,255,255,.0); }
          50% { box-shadow: 0 10px 24px var(--shadow), 0 0 0 10px rgba(255,255,255,.0); }
        }
        *::-webkit-scrollbar { height: 8px; width: 8px; }
        *::-webkit-scrollbar-thumb { background: rgba(0,0,0,.15); border-radius: 999px; }
      `}</style>

      {loading ? <LoaderOverlay progress={progress} stage={stage} /> : null}

      <div className="mx-auto max-w-6xl px-4 pb-[calc(110px+env(safe-area-inset-bottom))] pt-4 md:px-6 md:pt-6">
        <header className="sticky top-0 z-30 -mx-4 border-b border-[var(--border)] bg-[var(--bg)]/90 px-4 pb-3 pt-4 backdrop-blur-sm md:mx-0 md:rounded-[28px] md:border md:bg-[var(--surface)]/92 md:px-5 md:shadow-sm md:shadow-[var(--shadow)]/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.18em] text-[var(--muted)]">TTL Bio-tech 健康美學</p>
              <h1 className="mt-1 text-[20px] font-semibold md:text-[24px]">台酒生技 產品銷售輔助</h1>
              <p className="mt-1 text-xs text-[var(--muted)]">單手銷售武器｜維持原地展開、原地操作、原地返回</p>
            </div>
            <button onClick={() => { setSettingsOpen(true); window.history.pushState({ ui: 'settings' }, '') }} className="rounded-full border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--primary)] shadow-sm">
              <Settings2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜尋商品名稱、代號、主訴求或標籤" className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] pl-10 pr-4 text-sm outline-none" />
            </div>
          </div>

          <div ref={navRef} className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
            {[
              { label: '促銷焦點', anchor: 'promo' },
              { label: '熱銷主推', anchor: 'hot' },
              ...CATEGORY_META.filter((item) => item.key !== 'all').map((item) => ({ label: item.label, anchor: item.anchor, category: item.key })),
            ].map((item) => {
              const active = activeSection === item.anchor || (item.category && activeCategory === item.category)
              return (
                <button
                  key={item.anchor}
                  data-anchor={item.anchor}
                  onClick={() => { if (item.category) setActiveCategory(item.category); scrollToId(item.anchor) }}
                  className={`whitespace-nowrap rounded-full border px-3 py-2 text-sm transition ${active ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]'}`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => { setActiveCategory('all'); setActiveTag(''); showToast('已切回全部商品') }} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${activeCategory === 'all' ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-strong)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]'}`}>全部</button>
            {allTags.map((tag) => (
              <button key={tag} onClick={() => { setActiveTag((prev) => (prev === tag ? '' : tag)); showToast(`已套用標籤：#${tag}`) }} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${activeTag === tag ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-strong)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]'}`}>
                #{tag}
              </button>
            ))}
          </div>
        </header>

        <main className="space-y-6 pt-4">
          <PromoCarousel items={promoItems} onOpenPromo={(promo) => { setPromoDrawer(promo); window.history.pushState({ ui: 'promo', promoId: promo.promoId }, '') }} onOpenProduct={openProductByCode} />
          <RankingCarousel items={hotProducts} onOpenProduct={openProductByCode} />

          <section id="promo-zone" className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm shadow-[var(--shadow)]/50">
            <SectionTitle title="促銷專區" subtitle="用商品群組快速切換活動範圍。" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => setPromoFilter('all')} className={`whitespace-nowrap rounded-full border px-3 py-2 text-sm ${promoFilter === 'all' ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]'}`}>全部活動</button>
              {CATEGORY_META.filter((item) => item.key !== 'all').map((item) => (
                <button key={item.key} onClick={() => setPromoFilter(item.key)} className={`whitespace-nowrap rounded-full border px-3 py-2 text-sm ${promoFilter === item.key ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]'}`}>{item.label}</button>
              ))}
            </div>
          </section>

          {groupedProducts.map((group) => (
            <section key={group.key} id={group.anchor} data-spy-section className="scroll-mt-32 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm shadow-[var(--shadow)]/50">
              <SectionTitle title={group.label} subtitle={`目前 ${group.items.length} 項，維持緊湊掃描節奏。`} />
              <div className="space-y-3">
                {group.items.map((product) => (
                  <div id={`card-${product.code}`} key={product.code}>
                    <ProductRow product={product} scale={scale} onOpenProductByCode={openProductByCode} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} theme={theme} setTheme={setTheme} scale={scale} setScale={setScale} />
      <MediaSheet />
      <VideoModal />
      <LightboxModal />
      <PromoDrawer promo={promoDrawer} onClose={() => setPromoDrawer(null)} onOpenProduct={openProductByCode} />
      <FabMenu onScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onGotoPromo={() => scrollToId('promo')} onGotoHot={() => scrollToId('hot')} onToggleSettings={() => { setSettingsOpen(true); window.history.pushState({ ui: 'settings' }, '') }} onCollapseAll={() => closeExpandedCard()} />
      <ToastMessage />
    </div>
  )
}
