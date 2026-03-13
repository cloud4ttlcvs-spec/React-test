import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUp,
  BadgePercent,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ExternalLink,
  Gift,
  House,
  Image as ImageIcon,
  LayoutGrid,
  Menu,
  Palette,
  PlayCircle,
  Printer,
  RefreshCw,
  Search,
  Settings2,
  Share2,
  Sparkles,
  Star,
  Tags,
  Type,
  Video,
  X,
} from 'lucide-react'

const BASE_URL = import.meta.env.BASE_URL || '/'
const STORAGE_KEYS = {
  theme: 'ttl-react-theme-v6',
  scale: 'ttl-react-scale-v6',
  seenVideos: 'ttl-react-seen-videos-v6',
}

const CATEGORY_META = [
  { key: 'all', label: '全部', anchor: 'top' },
  { key: '保健飲品', label: '保健飲品', anchor: 'drinks' },
  { key: '保健食品', label: '保健食品', anchor: 'health' },
  { key: '美容產品', label: '美容產品', anchor: 'beauty' },
  { key: '清潔產品', label: '清潔產品', anchor: 'cleaning' },
  { key: '其他', label: '其他', anchor: 'other' },
]

const THEMES = [
  {
    key: 'rose',
    label: '玫瑰粉',
    colors: {
      '--bg': '#fff8fb',
      '--bg-soft': '#fff0f6',
      '--bg-soft-2': '#ffe3ed',
      '--surface': '#ffffff',
      '--surface-soft': '#fff7fa',
      '--border': '#f4d7e3',
      '--primary': '#c74d7c',
      '--primary-strong': '#aa2f62',
      '--primary-soft': '#ffe1ed',
      '--shadow': 'rgba(199,77,124,0.18)',
    },
  },
  {
    key: 'peach',
    label: '蜜桃粉',
    colors: {
      '--bg': '#fff8f5',
      '--bg-soft': '#fff0ea',
      '--bg-soft-2': '#ffe0d6',
      '--surface': '#ffffff',
      '--surface-soft': '#fff9f7',
      '--border': '#f3d7ca',
      '--primary': '#ce6b7d',
      '--primary-strong': '#b34d65',
      '--primary-soft': '#ffe5ea',
      '--shadow': 'rgba(206,107,125,0.18)',
    },
  },
  {
    key: 'berry',
    label: '莓果粉',
    colors: {
      '--bg': '#fff8fc',
      '--bg-soft': '#fbeff6',
      '--bg-soft-2': '#f5dfeb',
      '--surface': '#ffffff',
      '--surface-soft': '#fff9fc',
      '--border': '#ecd2df',
      '--primary': '#b45182',
      '--primary-strong': '#8f2e5f',
      '--primary-soft': '#f6deea',
      '--shadow': 'rgba(180,81,130,0.18)',
    },
  },
  {
    key: 'mauve',
    label: '霧紫粉',
    colors: {
      '--bg': '#fdf8ff',
      '--bg-soft': '#f6eefb',
      '--bg-soft-2': '#eee0f6',
      '--surface': '#ffffff',
      '--surface-soft': '#fefbff',
      '--border': '#e5d6ef',
      '--primary': '#9c5eb0',
      '--primary-strong': '#7d3f91',
      '--primary-soft': '#f0e2f6',
      '--shadow': 'rgba(156,94,176,0.18)',
    },
  },
]

const SCALE_PRESETS = {
  A: {
    image: 54,
    compactImage: 78,
    name: 'text-[14px] md:text-[15px]',
    title: 'text-[12px] md:text-[13px]',
    code: 'text-[10px] md:text-[11px]',
    price: 'text-[15px] md:text-[17px]',
    badge: 'text-[10px]',
    panelTitle: 'text-base md:text-lg',
  },
  'A+': {
    image: 62,
    compactImage: 88,
    name: 'text-[15px] md:text-[16px]',
    title: 'text-[13px] md:text-[14px]',
    code: 'text-[11px] md:text-[12px]',
    price: 'text-[16px] md:text-[18px]',
    badge: 'text-[11px]',
    panelTitle: 'text-lg md:text-xl',
  },
  'A++': {
    image: 70,
    compactImage: 100,
    name: 'text-[16px] md:text-[18px]',
    title: 'text-[14px] md:text-[15px]',
    code: 'text-[12px] md:text-[13px]',
    price: 'text-[18px] md:text-[20px]',
    badge: 'text-[12px]',
    panelTitle: 'text-xl md:text-2xl',
  },
}

const PROMO_STATUS_META = {
  active: { label: '進行中', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  upcoming: { label: '即將開始', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  ended: { label: '已結束', className: 'bg-slate-100 text-slate-600 border-slate-200' },
}

const PLACEHOLDER = (text = 'TTL Bio-Tech') =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#f9e8ef"/><stop offset="1" stop-color="#f4d7e3"/></linearGradient></defs><rect width="480" height="360" fill="url(#g)" rx="28"/><g fill="#b45182"><circle cx="120" cy="120" r="26" opacity="0.18"/><circle cx="350" cy="90" r="20" opacity="0.18"/><circle cx="390" cy="250" r="30" opacity="0.18"/></g><text x="50%" y="45%" font-size="18" text-anchor="middle" fill="#8f2e5f" font-family="Arial, sans-serif">${text}</text><text x="50%" y="58%" font-size="13" text-anchor="middle" fill="#9c6a80" font-family="Arial, sans-serif">Image unavailable</text></svg>`)}`

function normalizeCategory(raw) {
  const value = raw || ''
  if (value.includes('美容')) return '美容產品'
  if (value.includes('清潔')) return '清潔產品'
  if (value.includes('飲品') || value.includes('黑麥汁')) return '保健飲品'
  if (value.includes('保健食品') || value.includes('買一送一')) return '保健食品'
  return '其他'
}

function currency(value) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function safeDateLabel(value) {
  if (!value) return '未設定'
  return String(value).replace(/-/g, '/')
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
      return { type, label: label || type || '更多連結', url }
    })
    .filter((item) => item.url)
}

function getYouTubeEmbed(url) {
  if (!url) return ''
  const match = String(url).match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/)
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&playsinline=1` : ''
}

function matchesPromoCategory(promo, category) {
  if (category === 'all') return true
  return (promo.groups || []).includes(category)
}

function sortProducts(items, sortKey) {
  const arr = [...items]
  switch (sortKey) {
    case 'price-asc':
      return arr.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return arr.sort((a, b) => b.price - a.price)
    case 'name':
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
    case 'new':
      return arr.sort((a, b) => Number(b.isNew) - Number(a.isNew) || a.name.localeCompare(b.name, 'zh-Hant'))
    default:
      return arr.sort((a, b) => (a.rank || 999) - (b.rank || 999) || a.name.localeCompare(b.name, 'zh-Hant'))
  }
}

function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}

function LoaderOverlay({ progress, stage, hint, longWait }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-white"
    >
      <div className="w-[min(92vw,420px)] rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_60px_var(--shadow)]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary-strong)]">
          <Sparkles className="h-3.5 w-3.5" />
          台酒生技 TTL BIO-TECH
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">正在準備銷售支援內容</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">首次啟動時，系統會先同步主資料、促銷活動與熱銷排行。</p>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--bg-soft)]">
          <motion.div
            className="h-full rounded-full bg-[var(--primary)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 70, damping: 18 }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{stage}</span>
          <span>{progress}%</span>
        </div>
        <p className="mt-4 text-sm text-slate-600">{hint}</p>
        {longWait ? <p className="mt-3 text-sm font-medium text-[var(--primary-strong)]">首次啟動較久，請稍候…</p> : null}
      </div>
    </motion.div>
  )
}

function ToastStack({ items }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[130] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg"
          >
            {item.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function ControlChip({ active, children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${className} ${
        active
          ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm'
          : 'border-[var(--border)] bg-white text-slate-600 hover:border-[var(--primary)]/40 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

function SettingsPanel({ open, theme, setTheme, scale, setScale }) {
  if (!open) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      className="absolute right-0 top-[calc(100%+10px)] z-30 w-[min(90vw,310px)] rounded-[24px] border border-[var(--border)] bg-white p-4 shadow-[0_16px_48px_var(--shadow)]"
    >
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Type className="h-4 w-4 text-[var(--primary)]" />
          顯示大小
        </div>
        <div className="mt-3 flex gap-2">
          {Object.keys(SCALE_PRESETS).map((item) => (
            <ControlChip key={item} active={scale === item} onClick={() => setScale(item)}>
              {item}
            </ControlChip>
          ))}
        </div>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Palette className="h-4 w-4 text-[var(--primary)]" />
          網頁配色
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {THEMES.map((item) => (
            <button
              key={item.key}
              onClick={() => setTheme(item.key)}
              className={`rounded-2xl border px-3 py-2 text-left text-sm transition ${
                theme === item.key
                  ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-strong)]'
                  : 'border-[var(--border)] bg-[var(--surface-soft)] text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-4 w-4 rounded-full border border-white/60"
                  style={{ background: item.colors['--primary'] }}
                />
                {item.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function CompactPromoCard({ promo, onOpenPromoView }) {
  const statusMeta = PROMO_STATUS_META[promo.status] || PROMO_STATUS_META.active
  return (
    <button
      onClick={onOpenPromoView}
      className="group w-[80vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-[24px] border border-[var(--border)] bg-white text-left shadow-[0_10px_28px_var(--shadow)]"
    >
      <div className="aspect-[1.4/1] overflow-hidden bg-[var(--bg-soft)]">
        <img
          src={promo.imgUrl || PLACEHOLDER(promo.shortTitle || 'Promotion')}
          alt={promo.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = PLACEHOLDER('Promotion')
          }}
        />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusMeta.className}`}>{statusMeta.label}</span>
          <span className="text-[11px] text-slate-400">{safeDateLabel(promo.startDate)}</span>
        </div>
        <h3 className="line-clamp-2 text-[15px] font-semibold text-slate-900">{promo.shortTitle || promo.title}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-slate-500">{promo.content}</p>
      </div>
    </button>
  )
}

function RankingCard({ product, onOpen }) {
  return (
    <button
      onClick={() => onOpen(product.code)}
      className="group w-[74vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-[24px] border border-[var(--border)] bg-white p-4 text-left shadow-[0_10px_28px_var(--shadow)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-black text-[var(--primary-strong)]">
          {product.rank}
        </div>
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]">
          <img
            src={product.photo || PLACEHOLDER(product.name)}
            alt={product.name}
            className="h-full w-full object-contain p-1.5"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = PLACEHOLDER(product.name)
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[14px] font-semibold leading-6 text-slate-900">{product.name}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{product.title}</p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--primary-strong)]">
            <Star className="h-3.5 w-3.5" />
            TOP {product.rank}
          </div>
        </div>
      </div>
    </button>
  )
}

function ProductRowCard({
  product,
  expanded,
  compact,
  scale,
  onToggle,
  onImage,
  onVideo,
  onMore,
  onShare,
  toast,
  seenVideo,
}) {
  const cfg = SCALE_PRESETS[scale]
  const imageSize = compact ? cfg.compactImage : cfg.image
  return (
    <div className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-white shadow-[0_8px_24px_var(--shadow)]">
      <div className="flex items-start gap-2.5 px-2.5 py-2.5 md:gap-3 md:px-3 md:py-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onImage(product.code)
          }}
          className="shrink-0 overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--surface-soft)]"
          style={{ width: imageSize, height: imageSize }}
        >
          <img
            src={product.photo || PLACEHOLDER(product.name)}
            alt={product.name}
            className="h-full w-full object-contain p-1"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = PLACEHOLDER(product.name)
            }}
          />
        </button>

        <button type="button" onClick={() => onToggle(product.code)} className="min-w-0 flex-1 text-left">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`rounded-full bg-[var(--bg-soft)] px-2 py-0.5 font-medium text-[var(--primary-strong)] ${cfg.badge}`}>
                  {product.group}
                </span>
                {product.rank ? (
                  <span className={`rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 ${cfg.badge}`}>TOP {product.rank}</span>
                ) : null}
                {product.isNew ? (
                  <span className={`rounded-full bg-rose-50 px-2 py-0.5 font-medium text-rose-700 ${cfg.badge}`}>NEW</span>
                ) : null}
              </div>
              <p className={`mt-1.5 ${cfg.code} text-slate-400`}>{product.code}</p>
              <h3 className={`mt-0.5 line-clamp-2 font-semibold leading-6 text-slate-900 ${cfg.name}`}>{product.name}</h3>
              <p className={`mt-1 line-clamp-2 text-slate-600 ${cfg.title}`}>{product.title}</p>
            </div>
            <div className="shrink-0 text-right">
              <div className={`font-semibold text-slate-900 ${cfg.price}`}>{currency(product.price)}</div>
              <div className="mt-1 flex items-center justify-end gap-1">
                <span className={`rounded-full border border-[var(--border)] px-2 py-0.5 text-slate-500 ${cfg.badge}`}>{product.promos.length ? `${product.promos.length} 活動` : '一般'}</span>
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </motion.div>
              </div>
            </div>
          </div>

          {product.promos.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5 overflow-hidden">
              {product.promos.slice(0, 2).map((promo) => {
                const statusMeta = PROMO_STATUS_META[promo.status] || PROMO_STATUS_META.active
                return (
                  <span key={promo.promoId} className={`rounded-full border px-2 py-0.5 font-medium ${statusMeta.className} ${cfg.badge}`}>
                    {promo.shortTitle || promo.title}
                  </span>
                )
              })}
            </div>
          ) : null}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3 md:px-4">
              <div className="grid gap-3 md:grid-cols-[116px_minmax(0,1fr)] md:gap-4">
                <div className="flex items-start justify-center">
                  <button
                    type="button"
                    onClick={() => onImage(product.code)}
                    className="h-[116px] w-[116px] overflow-hidden rounded-[18px] border border-[var(--border)] bg-white"
                  >
                    <img
                      src={product.photo || PLACEHOLDER(product.name)}
                      alt={product.name}
                      className="h-full w-full object-contain p-2"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = PLACEHOLDER(product.name)
                      }}
                    />
                  </button>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-semibold text-slate-900 ${cfg.panelTitle}`}>{product.title}</span>
                    {product.spec ? <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-500">{product.spec}</span> : null}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{product.content || '尚未設定完整商品簡介。'}</p>
                  {product.tags.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toast(`已套用標籤：#${tag}`)}
                          className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-xs text-slate-600"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {product.promos.length ? (
                <div className="mt-4 rounded-[18px] border border-[var(--border)] bg-white p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <BadgePercent className="h-4 w-4 text-[var(--primary)]" />
                    相關促銷
                  </div>
                  <div className="mt-3 space-y-2">
                    {product.promos.map((promo) => {
                      const statusMeta = PROMO_STATUS_META[promo.status] || PROMO_STATUS_META.active
                      return (
                        <div key={promo.promoId} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>{statusMeta.label}</span>
                            <span className="text-xs text-slate-400">{safeDateLabel(promo.startDate)} - {safeDateLabel(promo.endDate)}</span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-800">{promo.shortTitle || promo.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{promo.content}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {product.videoUrl ? (
                  <button
                    onClick={() => onVideo(product.code)}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      seenVideo ? 'border border-slate-200 bg-white text-slate-600' : 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-[0_12px_24px_rgba(251,146,60,0.28)]'
                    }`}
                  >
                    <Video className="h-4 w-4" />
                    {seenVideo ? '已看過影片' : '播放站內影片'}
                  </button>
                ) : null}
                {product.moreLinks.length ? (
                  <button onClick={() => onMore(product.code)} className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-[var(--surface-soft)]">
                    <ExternalLink className="h-4 w-4" />
                    更多素材
                  </button>
                ) : null}
                <button onClick={() => onShare(product.code)} className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-[var(--surface-soft)]">
                  <Share2 className="h-4 w-4" />
                  複製銷售文案
                </button>
                <button onClick={() => toast(`${product.name} 已套用至篩選情境`)} className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-[var(--surface-soft)]">
                  <Tags className="h-4 w-4" />
                  套用篩選
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function VideoModal({ product, onClose }) {
  if (!product) return null
  const embed = getYouTubeEmbed(product.videoUrl)
  const isMp4 = product.videoUrl && /\.mp4($|\?)/i.test(product.videoUrl)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/65 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl rounded-t-[28px] bg-slate-950 p-4 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-white/60">站內影音</p>
            <h3 className="text-base font-semibold">{product.name}</h3>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/10 p-2 text-white/80">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="aspect-video overflow-hidden rounded-[22px] bg-black">
          {embed ? (
            <iframe title={product.name} src={embed} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          ) : isMp4 ? (
            <video className="h-full w-full" controls playsInline src={product.videoUrl} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/70">此影片格式目前不支援站內播放</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function MediaSheet({ product, onClose }) {
  if (!product) return null
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[105] bg-black/45 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 240, damping: 26 }} className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-xl rounded-t-[28px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <div>
            <p className="text-xs text-slate-400">更多素材</p>
            <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
          <div className="space-y-2">
            {product.moreLinks.map((item, index) => (
              <a key={`${item.url}-${index}`} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-slate-700">
                <div>
                  <div className="font-medium text-slate-900">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.type || '連結'}</div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ImageLightbox({ product, onClose }) {
  if (!product) return null
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[115] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white">
        <X className="h-5 w-5" />
      </button>
      <img
        src={product.photo || PLACEHOLDER(product.name)}
        alt={product.name}
        className="max-h-[82vh] max-w-full rounded-[28px] bg-white p-3"
        onClick={(e) => e.stopPropagation()}
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = PLACEHOLDER(product.name)
        }}
      />
    </motion.div>
  )
}

function PromoView({ promos, filters, onSetStatus, onSetCategory, onOpenProduct, onBack }) {
  const categories = ['all', '保健飲品', '保健食品', '美容產品', '清潔產品', '其他']
  return (
    <div className="pb-20">
      <div className="sticky top-[108px] z-20 rounded-[24px] border border-[var(--border)] bg-white/90 p-3 shadow-[0_10px_30px_var(--shadow)] backdrop-blur md:top-[132px]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">促銷專區</p>
            <h2 className="text-lg font-semibold text-slate-900">最新活動與相關商品</h2>
          </div>
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-medium text-slate-700">
            <ChevronLeft className="h-4 w-4" /> 返回型錄
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {['all', 'active', 'upcoming', 'ended'].map((status) => (
            <ControlChip key={status} active={filters.status === status} onClick={() => onSetStatus(status)}>
              {status === 'all' ? '全部狀態' : (PROMO_STATUS_META[status]?.label || status)}
            </ControlChip>
          ))}
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map((category) => (
            <ControlChip key={category} active={filters.category === category} onClick={() => onSetCategory(category)}>
              {category === 'all' ? '全部分類' : category}
            </ControlChip>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {promos.map((promo) => {
          const statusMeta = PROMO_STATUS_META[promo.status] || PROMO_STATUS_META.active
          return (
            <div key={promo.promoId} className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-[0_10px_30px_var(--shadow)]">
              {promo.imgUrl ? (
                <div className="aspect-[1.9/1] overflow-hidden bg-[var(--bg-soft)]">
                  <img
                    src={promo.imgUrl}
                    alt={promo.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = PLACEHOLDER('Promotion')
                    }}
                  />
                </div>
              ) : null}
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>{statusMeta.label}</span>
                  {promo.groups.map((group) => (
                    <span key={group} className="rounded-full bg-[var(--bg-soft)] px-2.5 py-1 text-xs font-medium text-[var(--primary-strong)]">{group}</span>
                  ))}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{promo.title}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{promo.content}</p>
                <p className="mt-3 text-xs text-slate-400">{safeDateLabel(promo.startDate)} - {safeDateLabel(promo.endDate)}</p>
                {promo.relatedProducts.length ? (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {promo.relatedProducts.map((product) => (
                      <button key={product.code} onClick={() => onOpenProduct(product.code)} className="min-w-[180px] rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-left">
                        <div className="text-xs text-slate-400">{product.code}</div>
                        <div className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</div>
                        <div className="mt-1 text-sm text-[var(--primary-strong)]">{currency(product.price)}</div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
        {promos.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-white/70 p-10 text-center text-sm text-slate-500">目前沒有符合條件的促銷活動。</div>
        ) : null}
      </div>
    </div>
  )
}

function FabMenu({ open, onToggle, onGoPromo, onGoTop, onGoCategory, onRefresh, onPrint, onInstall, installAvailable }) {
  const items = [
    { key: 'promo', label: '促銷專區', icon: Gift, onClick: onGoPromo },
    { key: 'health', label: '跳保健', icon: LayoutGrid, onClick: () => onGoCategory('保健食品') },
    { key: 'drinks', label: '跳飲品', icon: LayoutGrid, onClick: () => onGoCategory('保健飲品') },
    { key: 'refresh', label: '重整資料', icon: RefreshCw, onClick: onRefresh },
    { key: 'print', label: '列印目錄', icon: Printer, onClick: onPrint },
  ]
  if (installAvailable) items.splice(3, 0, { key: 'install', label: '安裝 App', icon: House, onClick: onInstall })
  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/10" onClick={onToggle} />
        ) : null}
      </AnimatePresence>
      <div className="fixed bottom-5 right-4 z-[95] flex flex-col items-end gap-3 md:right-6">
        <button onClick={onGoPromo} className="animate-promo-breath inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_var(--shadow)]">
          <Gift className="h-4 w-4" /> 最新活動
        </button>
        <AnimatePresence>
          {open ? (
            <motion.div initial="hidden" animate="show" exit="hidden" variants={{ hidden: { transition: { staggerChildren: 0.04, staggerDirection: -1 } }, show: { transition: { staggerChildren: 0.05 } } }} className="flex flex-col items-end gap-2">
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <motion.button
                    key={item.key}
                    variants={{ hidden: { opacity: 0, y: 10, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } }}
                    onClick={() => {
                      item.onClick()
                      onToggle()
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-[0_10px_24px_var(--shadow)]"
                  >
                    <Icon className="h-4 w-4 text-[var(--primary)]" />
                    {item.label}
                  </motion.button>
                )
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>
        <button onClick={onToggle} className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <button onClick={onGoTop} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-slate-700 shadow-[0_10px_24px_var(--shadow)]">
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </>
  )
}

export default function App() {
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || THEMES[0].key)
  const [scaleKey, setScaleKey] = useState(() => localStorage.getItem(STORAGE_KEYS.scale) || 'A')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(8)
  const [loadingStage, setLoadingStage] = useState('啟動系統…')
  const [loadingHint, setLoadingHint] = useState('首次啟動時，系統會建立商品卡與分類索引。')
  const [longWait, setLongWait] = useState(false)

  const [products, setProducts] = useState([])
  const [promos, setPromos] = useState([])
  const [currentView, setCurrentView] = useState('catalog')
  const [activeSection, setActiveSection] = useState('all')
  const [expandedCardId, setExpandedCardId] = useState(null)
  const [overlay, setOverlay] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState('featured')
  const [tagFilter, setTagFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [promoStatusFilter, setPromoStatusFilter] = useState('all')
  const [promoCategoryFilter, setPromoCategoryFilter] = useState('all')
  const [toasts, setToasts] = useState([])
  const [seenVideos, setSeenVideos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.seenVideos) || '[]')
    } catch {
      return []
    }
  })
  const [installPrompt, setInstallPrompt] = useState(null)

  const settingsRef = useRef(null)
  const navRef = useRef(null)
  const navButtonRefs = useRef(new Map())
  const sectionRefs = useRef(new Map())
  const rowRefs = useRef(new Map())
  const didInitHistory = useRef(false)

  const theme = useMemo(() => THEMES.find((item) => item.key === themeKey) || THEMES[0], [themeKey])
  const scale = SCALE_PRESETS[scaleKey] || SCALE_PRESETS.A

  useEffect(() => {
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
    localStorage.setItem(STORAGE_KEYS.theme, themeKey)
  }, [themeKey, theme])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.scale, scaleKey)
  }, [scaleKey])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.seenVideos, JSON.stringify(seenVideos))
  }, [seenVideos])

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    const onClick = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useBodyScrollLock(Boolean(overlay))

  const pushToast = (message) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, 2000)
  }

  const normalizeLoadedData = async () => {
    setLoadingStage('同步主資料…')
    setLoadingProgress(18)
    setLoadingHint('正在取得 merged-feed.json')
    const mergedResp = await fetch(`${BASE_URL}merged-feed.json`, { cache: 'no-store' })
    const merged = await mergedResp.json()

    setLoadingStage('同步促銷活動…')
    setLoadingProgress(42)
    setLoadingHint('正在取得 promotions.json')
    const promoResp = await fetch(`${BASE_URL}promotions.json`, { cache: 'no-store' })
    const promoJson = await promoResp.json()

    setLoadingStage('同步熱銷排行…')
    setLoadingProgress(62)
    setLoadingHint('正在取得 rankings.json')
    const rankResp = await fetch(`${BASE_URL}rankings.json`, { cache: 'no-store' })
    const rankJson = await rankResp.json()

    setLoadingStage('建立商品卡片…')
    setLoadingProgress(82)
    setLoadingHint('正在建立分類、活動標籤與橫向焦點區。')

    const rankMap = new Map((rankJson.items || []).map((item) => [item.code, item]))

    const baseProducts = (merged.items || []).map((item) => {
      const pitch = item.pitch || {}
      const rank = rankMap.get(item.code)
      return {
        code: item.code,
        name: item.name,
        group: normalizeCategory(item.category),
        categoryRaw: item.category || '',
        price: Number(item.price || 0),
        spec: item.spec || '',
        photo: item.photo || '',
        videoUrl: item.videoUrl || '',
        moreLinks: parseMoreLinks(item.moreLinksRaw),
        title: pitch.title || item.name,
        content: pitch.content || '',
        tags: parseTags(pitch.tags),
        isNew: Boolean(pitch.isNew),
        rank: rank?.rank || null,
        promos: [],
      }
    })

    const productMap = new Map(baseProducts.map((item) => [item.code, item]))

    const normalizedPromos = (promoJson.items || []).map((item) => {
      const relatedProducts = (item.relatedCodes || []).map((code) => productMap.get(code)).filter(Boolean)
      const groups = [...new Set(relatedProducts.map((product) => product.group))]
      return {
        ...item,
        groups,
        relatedProducts,
      }
    })

    normalizedPromos.forEach((promo) => {
      promo.relatedProducts.forEach((product) => {
        product.promos.push(promo)
      })
    })

    const normalizedProducts = baseProducts.map((item) => ({ ...item }))
    setPromos(normalizedPromos)
    setProducts(normalizedProducts)

    setLoadingStage('完成載入')
    setLoadingProgress(100)
    setLoadingHint('內容已準備完成。')
    await new Promise((resolve) => window.setTimeout(resolve, 220))
    setLoading(false)
  }

  const reloadData = async () => {
    setLoading(true)
    setLongWait(false)
    try {
      await normalizeLoadedData()
      pushToast('資料已重新同步')
    } catch (error) {
      console.error(error)
      setLoading(false)
      pushToast('資料同步失敗，請稍後再試')
    }
  }

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      if (active) setLongWait(true)
    }, 8000)
    normalizeLoadedData().catch((error) => {
      console.error(error)
      setLoading(false)
      pushToast('資料讀取失敗，請確認 public 檔案是否存在')
    })
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [])

  const productByCode = useMemo(() => {
    const map = new Map()
    products.forEach((item) => map.set(item.code, item))
    return map
  }, [products])

  const activePromoFocus = useMemo(() => promos.filter((item) => item.status === 'active' || item.status === 'upcoming').slice(0, 8), [promos])
  const topRankedProducts = useMemo(() => products.filter((item) => item.rank).sort((a, b) => a.rank - b.rank).slice(0, 8), [products])
  const allTags = useMemo(() => {
    const count = new Map()
    products.forEach((product) => {
      product.tags.forEach((tag) => count.set(tag, (count.get(tag) || 0) + 1))
    })
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([tag]) => tag)
  }, [products])

  const categoryCounts = useMemo(() => {
    const count = new Map()
    products.forEach((product) => count.set(product.group, (count.get(product.group) || 0) + 1))
    return count
  }, [products])

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    const items = products.filter((product) => {
      const categoryOk = categoryFilter === 'all' || product.group === categoryFilter
      const tagOk = !tagFilter || product.tags.includes(tagFilter)
      const haystack = [product.code, product.name, product.title, product.content, ...product.tags].join(' ').toLowerCase()
      const keywordOk = !keyword || haystack.includes(keyword)
      return categoryOk && tagOk && keywordOk
    })
    return sortProducts(items, sortKey)
  }, [products, searchTerm, categoryFilter, tagFilter, sortKey])

  const groupedProducts = useMemo(() => {
    const groups = new Map()
    filteredProducts.forEach((product) => {
      if (!groups.has(product.group)) groups.set(product.group, [])
      groups.get(product.group).push(product)
    })
    return CATEGORY_META.filter((item) => item.key !== 'all' && groups.has(item.key)).map((item) => ({
      ...item,
      items: groups.get(item.key),
    }))
  }, [filteredProducts])

  const filteredPromos = useMemo(() => {
    return promos.filter((promo) => {
      const statusOk = promoStatusFilter === 'all' || promo.status === promoStatusFilter
      const categoryOk = matchesPromoCategory(promo, promoCategoryFilter)
      return statusOk && categoryOk
    })
  }, [promos, promoStatusFilter, promoCategoryFilter])

  const currentOverlayProduct = overlay?.code ? productByCode.get(overlay.code) : null

  const buildState = ({ view = currentView, expandedId = expandedCardId, overlayType = overlay?.type || null, overlayCode = overlay?.code || null } = {}) => ({
    view,
    expandedId,
    overlayType,
    overlayCode,
  })

  const applyHistoryState = (state) => {
    const next = state || { view: 'catalog', expandedId: null, overlayType: null, overlayCode: null }
    setCurrentView(next.view || 'catalog')
    setExpandedCardId(next.expandedId || null)
    if (next.overlayType && next.overlayCode) {
      setOverlay({ type: next.overlayType, code: next.overlayCode })
    } else {
      setOverlay(null)
    }
  }

  useEffect(() => {
    if (didInitHistory.current || loading) return
    const initial = { view: 'catalog', expandedId: null, overlayType: null, overlayCode: null }
    window.history.replaceState(initial, '')
    const onPopState = (event) => {
      applyHistoryState(event.state)
    }
    window.addEventListener('popstate', onPopState)
    didInitHistory.current = true
    return () => window.removeEventListener('popstate', onPopState)
  }, [loading])

  useEffect(() => {
    if (!expandedCardId) return
    const node = rowRefs.current.get(expandedCardId)
    if (node) {
      window.setTimeout(() => {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 180)
    }
  }, [expandedCardId])

  useEffect(() => {
    if (currentView !== 'catalog' || groupedProducts.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          const targetId = visible[0].target.id
          const matched = CATEGORY_META.find((item) => item.anchor === targetId)
          if (matched) setActiveSection(matched.key)
        }
      },
      { rootMargin: '-190px 0px -70% 0px', threshold: [0.1, 0.24, 0.4] }
    )
    sectionRefs.current.forEach((node) => {
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [groupedProducts, currentView])

  useEffect(() => {
    const btn = navButtonRefs.current.get(activeSection)
    if (btn) btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeSection])

  const pushHistory = (next) => {
    window.history.pushState(next, '')
    applyHistoryState(next)
  }

  const toggleProduct = (code) => {
    if (expandedCardId === code && !overlay) {
      window.history.back()
      return
    }
    pushHistory(buildState({ view: currentView, expandedId: code, overlayType: null, overlayCode: null }))
  }

  const openImage = (code) => pushHistory(buildState({ overlayType: 'lightbox', overlayCode: code }))
  const openVideo = (code) => {
    setSeenVideos((prev) => (prev.includes(code) ? prev : [...prev, code]))
    pushHistory(buildState({ overlayType: 'video', overlayCode: code }))
  }
  const openMore = (code) => pushHistory(buildState({ overlayType: 'media', overlayCode: code }))

  const openPromoView = () => pushHistory({ view: 'promo', expandedId: null, overlayType: null, overlayCode: null })
  const backToCatalog = () => {
    if (window.history.state?.view === 'promo') {
      window.history.back()
    } else {
      applyHistoryState({ view: 'catalog', expandedId: null, overlayType: null, overlayCode: null })
      window.history.replaceState({ view: 'catalog', expandedId: null, overlayType: null, overlayCode: null }, '')
    }
  }

  const openPromoRelatedProduct = (code) => {
    pushHistory({ view: 'catalog', expandedId: code, overlayType: null, overlayCode: null })
  }

  const handleShare = async (code) => {
    const product = productByCode.get(code)
    if (!product) return
    const text = `${product.name}\n${product.title}\n${product.content}\n建議售價：${currency(product.price)}`
    try {
      await navigator.clipboard.writeText(text)
      pushToast('已複製銷售文案')
    } catch {
      pushToast('無法複製，請改用手動複製')
    }
  }

  const handleInstall = async () => {
    if (!installPrompt) {
      pushToast('目前裝置尚未出現安裝提示')
      return
    }
    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  const goToCategory = (key) => {
    setCategoryFilter(key)
    setCurrentView('catalog')
    const anchor = CATEGORY_META.find((item) => item.key === key)?.anchor
    window.setTimeout(() => {
      document.getElementById(anchor || 'top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-slate-900" style={theme.colors}>
      <style>{`
        html, body, #root { overflow-x: hidden; }
        body { background: var(--bg); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-row { scroll-snap-type: x mandatory; }
        @keyframes promo-breath {
          0%, 100% { box-shadow: 0 16px 32px var(--shadow); transform: translateY(0px); }
          50% { box-shadow: 0 18px 38px rgba(255, 82, 124, 0.26); transform: translateY(-1px); }
        }
        .animate-promo-breath { animation: promo-breath 2.4s ease-in-out infinite; }
      `}</style>

      <AnimatePresence>{loading ? <LoaderOverlay progress={loadingProgress} stage={loadingStage} hint={loadingHint} longWait={longWait} /> : null}</AnimatePresence>
      <ToastStack items={toasts} />

      <AnimatePresence>{overlay?.type === 'video' ? <VideoModal product={currentOverlayProduct} onClose={() => window.history.back()} /> : null}</AnimatePresence>
      <AnimatePresence>{overlay?.type === 'media' ? <MediaSheet product={currentOverlayProduct} onClose={() => window.history.back()} /> : null}</AnimatePresence>
      <AnimatePresence>{overlay?.type === 'lightbox' ? <ImageLightbox product={currentOverlayProduct} onClose={() => window.history.back()} /> : null}</AnimatePresence>

      <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 md:px-6 md:pt-6">
        <div className="sticky top-0 z-40 -mx-4 border-b border-transparent bg-[var(--bg)]/92 px-4 pb-3 pt-1 backdrop-blur md:mx-0 md:rounded-[30px] md:border md:border-[var(--border)] md:bg-white/88 md:px-5 md:py-4 md:shadow-[0_10px_28px_var(--shadow)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight text-slate-900 md:text-3xl">TTL Bio-tech 健康美學</h1>
              <p className="mt-1 text-sm text-slate-500 md:text-base">台酒生技 產品銷售輔助</p>
            </div>
            <div ref={settingsRef} className="relative shrink-0">
              <button onClick={() => setSettingsOpen((prev) => !prev)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-slate-700 shadow-[0_8px_20px_var(--shadow)]">
                <Settings2 className="h-4 w-4" />
              </button>
              <AnimatePresence>
                <SettingsPanel open={settingsOpen} theme={themeKey} setTheme={setThemeKey} scale={scaleKey} setScale={setScaleKey} />
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋產品名稱、關鍵字…"
                className="h-11 w-full rounded-2xl border border-[var(--border)] bg-white pl-11 pr-10 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 md:h-12"
              />
              {searchTerm ? (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <button onClick={() => setMobileFiltersOpen((prev) => !prev)} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 text-sm font-medium text-slate-700 md:hidden">
              <Tags className="h-4 w-4" /> 篩選
            </button>
            <button onClick={() => window.print()} className="hidden h-12 items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-slate-700 md:inline-flex">
              <Printer className="h-4 w-4" /> 列印目錄
            </button>
          </div>

          <div className="mt-3 overflow-x-auto hide-scrollbar" ref={navRef}>
            <div className="flex gap-2 pb-1">
              {CATEGORY_META.filter((item) => item.key !== '其他').map((item) => (
                <button
                  key={item.key}
                  ref={(node) => navButtonRefs.current.set(item.key, node)}
                  onClick={() => {
                    if (item.key === 'all') {
                      setCategoryFilter('all')
                      setCurrentView('catalog')
                      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    } else {
                      goToCategory(item.key)
                    }
                  }}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                    activeSection === item.key || (item.key === 'all' && categoryFilter === 'all')
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                      : 'border-[var(--border)] bg-white text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {mobileFiltersOpen ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden md:hidden">
                <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {['featured', 'new', 'price-asc', 'price-desc', 'name'].map((item) => (
                      <ControlChip key={item} active={sortKey === item} onClick={() => setSortKey(item)}>
                        {{ featured: '預設', new: '新品', 'price-asc': '價低到高', 'price-desc': '價高到低', name: '名稱' }[item]}
                      </ControlChip>
                    ))}
                  </div>
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {allTags.map((tag) => (
                      <ControlChip key={tag} active={tagFilter === tag} onClick={() => setTagFilter((prev) => (prev === tag ? '' : tag))}>
                        #{tag}
                      </ControlChip>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <main id="top" className="mt-4 md:mt-6">
          {currentView === 'catalog' ? (
            <>
              {activePromoFocus.length ? (
                <section className="mb-5 overflow-hidden rounded-[28px] border border-[var(--border)] bg-white p-4 shadow-[0_10px_28px_var(--shadow)]">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400">促銷焦點</p>
                      <h2 className="text-lg font-semibold text-slate-900">近期活動快覽</h2>
                    </div>
                    <button onClick={openPromoView} className="text-sm font-medium text-[var(--primary-strong)]">查看全部</button>
                  </div>
                  <div className="snap-row flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
                    {activePromoFocus.map((promo) => (
                      <CompactPromoCard key={promo.promoId} promo={promo} onOpenPromoView={openPromoView} />
                    ))}
                  </div>
                </section>
              ) : null}

              {topRankedProducts.length ? (
                <section className="mb-5 overflow-hidden rounded-[28px] border border-[var(--border)] bg-white p-4 shadow-[0_10px_28px_var(--shadow)]">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400">熱銷主推</p>
                      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Star className="h-4 w-4 text-[var(--primary)]" /> 熱銷排行</h2>
                    </div>
                  </div>
                  <div className="snap-row flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
                    {topRankedProducts.map((product) => (
                      <RankingCard key={product.code} product={product} onOpen={openPromoRelatedProduct} />
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="mb-4 hidden items-center justify-between gap-3 md:flex">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {['featured', 'new', 'price-asc', 'price-desc', 'name'].map((item) => (
                    <ControlChip key={item} active={sortKey === item} onClick={() => setSortKey(item)}>
                      {{ featured: '預設排序', new: '新品優先', 'price-asc': '價格低到高', 'price-desc': '價格高到低', name: '名稱排序' }[item]}
                    </ControlChip>
                  ))}
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {allTags.slice(0, 8).map((tag) => (
                    <ControlChip key={tag} active={tagFilter === tag} onClick={() => setTagFilter((prev) => (prev === tag ? '' : tag))}>
                      #{tag}
                    </ControlChip>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                {groupedProducts.map((section) => (
                  <section
                    key={section.key}
                    id={section.anchor}
                    ref={(node) => sectionRefs.current.set(section.key, node)}
                    className="scroll-mt-[170px] rounded-[28px] border border-[var(--border)] bg-white p-4 shadow-[0_10px_28px_var(--shadow)]"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-xs text-slate-400">{section.label}</p>
                        <h2 className="text-lg font-semibold text-slate-900">{section.label}</h2>
                      </div>
                      <span className="rounded-full bg-[var(--bg-soft)] px-3 py-1 text-sm font-medium text-[var(--primary-strong)]">{section.items.length} 項</span>
                    </div>
                    <div className="grid gap-2.5">
                      {section.items.map((product) => (
                        <div key={product.code} ref={(node) => rowRefs.current.set(product.code, node)}>
                          <ProductRowCard
                            product={product}
                            expanded={expandedCardId === product.code}
                            compact
                            scale={scaleKey}
                            onToggle={toggleProduct}
                            onImage={openImage}
                            onVideo={openVideo}
                            onMore={openMore}
                            onShare={handleShare}
                            toast={pushToast}
                            seenVideo={seenVideos.includes(product.code)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
                {groupedProducts.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-white/75 p-10 text-center text-sm text-slate-500">目前沒有符合條件的商品。</div>
                ) : null}
              </div>
            </>
          ) : (
            <PromoView
              promos={filteredPromos}
              filters={{ status: promoStatusFilter, category: promoCategoryFilter }}
              onSetStatus={setPromoStatusFilter}
              onSetCategory={setPromoCategoryFilter}
              onOpenProduct={openPromoRelatedProduct}
              onBack={backToCatalog}
            />
          )}
        </main>
      </div>

      {!loading ? (
        <FabMenu
          open={fabOpen}
          onToggle={() => setFabOpen((prev) => !prev)}
          onGoPromo={openPromoView}
          onGoTop={goTop}
          onGoCategory={goToCategory}
          onRefresh={reloadData}
          onPrint={() => window.print()}
          onInstall={handleInstall}
          installAvailable={Boolean(installPrompt)}
        />
      ) : null}
    </div>
  )
}
