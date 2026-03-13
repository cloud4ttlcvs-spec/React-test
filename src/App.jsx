import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  RefreshCw,
  PlayCircle,
  ExternalLink,
  BadgePercent,
  Sparkles,
  Palette,
  Type,
  Gift,
  ArrowUp,
  House,
  Printer,
  Star,
  Settings2,
  Tags,
  LayoutGrid,
  PanelTop,
} from 'lucide-react'

const CATEGORY_META = [
  { key: 'all', label: '全部', anchor: 'top', tone: 'border-slate-200 bg-white text-slate-700', accent: 'bg-slate-700' },
  { key: '保健飲品', label: '保健飲品', anchor: 'drinks', tone: 'border-amber-200 bg-amber-50 text-amber-800', accent: 'bg-amber-500' },
  { key: '保健食品', label: '保健食品', anchor: 'health', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800', accent: 'bg-emerald-500' },
  { key: '美容產品', label: '美容產品', anchor: 'beauty', tone: 'border-rose-200 bg-rose-50 text-rose-800', accent: 'bg-rose-500' },
  { key: '清潔產品', label: '清潔產品', anchor: 'cleaning', tone: 'border-cyan-200 bg-cyan-50 text-cyan-800', accent: 'bg-cyan-500' },
  { key: '其他', label: '其他', anchor: 'other', tone: 'border-violet-200 bg-violet-50 text-violet-800', accent: 'bg-violet-500' },
]

const THEMES = [
  {
    key: 'rose',
    label: '玫瑰粉',
    vars: {
      '--theme-bg': '#fff7fb',
      '--theme-surface': '#ffffff',
      '--theme-soft': '#fff0f6',
      '--theme-soft-2': '#ffe5ef',
      '--theme-border': '#f4cedd',
      '--theme-primary': '#c44778',
      '--theme-primary-dark': '#a92e60',
      '--theme-primary-soft': '#ffe1ed',
      '--theme-shadow': 'rgba(196, 71, 120, 0.16)',
    },
  },
  {
    key: 'peach',
    label: '蜜桃粉',
    vars: {
      '--theme-bg': '#fff8f6',
      '--theme-surface': '#ffffff',
      '--theme-soft': '#fff0ec',
      '--theme-soft-2': '#ffe3db',
      '--theme-border': '#f6d2c7',
      '--theme-primary': '#cf6a83',
      '--theme-primary-dark': '#b0506a',
      '--theme-primary-soft': '#ffe3ea',
      '--theme-shadow': 'rgba(207, 106, 131, 0.16)',
    },
  },
  {
    key: 'berry',
    label: '莓果粉',
    vars: {
      '--theme-bg': '#fff7fa',
      '--theme-surface': '#ffffff',
      '--theme-soft': '#fbeef6',
      '--theme-soft-2': '#f7dfec',
      '--theme-border': '#ebcade',
      '--theme-primary': '#b84d7f',
      '--theme-primary-dark': '#97335f',
      '--theme-primary-soft': '#f7dfec',
      '--theme-shadow': 'rgba(184, 77, 127, 0.18)',
    },
  },
  {
    key: 'mauve',
    label: '霧紫粉',
    vars: {
      '--theme-bg': '#fdf8ff',
      '--theme-surface': '#ffffff',
      '--theme-soft': '#f6effa',
      '--theme-soft-2': '#efe1f7',
      '--theme-border': '#e2cfe9',
      '--theme-primary': '#a659ad',
      '--theme-primary-dark': '#87418f',
      '--theme-primary-soft': '#f0e0f4',
      '--theme-shadow': 'rgba(166, 89, 173, 0.17)',
    },
  },
]

const SCALE_PRESETS = {
  A: {
    rowImage: 'h-[54px] w-[54px] md:h-[66px] md:w-[66px]',
    rowCode: 'text-[10px] md:text-[11px]',
    rowName: 'text-[14px] leading-5 md:text-[15px]',
    rowTitle: 'text-[12px] leading-5 md:text-[13px]',
    rowPrice: 'text-[15px] md:text-[17px]',
    rowBadge: 'text-[10px]',
    stickyInput: 'h-11 md:h-12',
    sectionTitle: 'text-lg md:text-xl',
    detailTitle: 'text-lg md:text-xl',
  },
  'A+': {
    rowImage: 'h-[62px] w-[62px] md:h-[76px] md:w-[76px]',
    rowCode: 'text-[11px] md:text-[12px]',
    rowName: 'text-[15px] leading-6 md:text-[16px]',
    rowTitle: 'text-[13px] leading-5 md:text-[14px]',
    rowPrice: 'text-[16px] md:text-[19px]',
    rowBadge: 'text-[11px]',
    stickyInput: 'h-12 md:h-[52px]',
    sectionTitle: 'text-xl md:text-2xl',
    detailTitle: 'text-xl md:text-2xl',
  },
  'A++': {
    rowImage: 'h-[72px] w-[72px] md:h-[88px] md:w-[88px]',
    rowCode: 'text-[12px] md:text-[13px]',
    rowName: 'text-[16px] leading-6 md:text-[18px]',
    rowTitle: 'text-[14px] leading-6 md:text-[15px]',
    rowPrice: 'text-[18px] md:text-[21px]',
    rowBadge: 'text-[12px]',
    stickyInput: 'h-[52px] md:h-14',
    sectionTitle: 'text-[22px] md:text-[26px]',
    detailTitle: 'text-[22px] md:text-[26px]',
  },
}

const PROMO_STATUS_META = {
  active: { label: '進行中', tone: 'bg-rose-50 text-rose-700 border-rose-200' },
  upcoming: { label: '即將開始', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  ended: { label: '已結束', tone: 'bg-slate-100 text-slate-600 border-slate-200' },
}

function getMeta(key) {
  return CATEGORY_META.find((item) => item.key === key) || CATEGORY_META[0]
}

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

function formatUpdatedAt(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function toTags(raw) {
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
      return { type, label, url }
    })
    .filter((item) => item.url)
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

function sortPromos(promos) {
  const score = { active: 0, upcoming: 1, ended: 2 }
  return [...(promos || [])].sort((a, b) => {
    const scoreDiff = (score[a.status] ?? 9) - (score[b.status] ?? 9)
    if (scoreDiff !== 0) return scoreDiff
    return String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hant')
  })
}

function choosePromoBadge(promos) {
  if (!promos?.length) return null
  return promos.find((item) => item.status === 'active') || promos.find((item) => item.status === 'upcoming') || promos[0]
}

function normalizeItem(item) {
  const pitch = item?.pitch || {}
  const promos = sortPromos(item?.promos || [])
  return {
    code: item.code || '',
    name: item.name || pitch.name || '未命名商品',
    category: item.category || '',
    group: normalizeCategory(item.category || ''),
    price: Number(item.price || 0),
    spec: item.spec || '',
    photo: item.photo || '',
    videoUrl: item.videoUrl || '',
    moreLinks: parseMoreLinks(item.moreLinksRaw),
    title: pitch.title || item.name || '商品重點',
    content: pitch.content || '目前尚未設定商品話術摘要。',
    tags: toTags(pitch.tags),
    isNew: Boolean(pitch.isNew),
    promos,
    promoBadge: choosePromoBadge(promos),
    rank: item.rank || null,
    qty2025: item.qty2025 || null,
    salesTwd2025: item.salesTwd2025 || null,
  }
}

function matchPromoToProduct(promo, product) {
  const related = Array.isArray(promo?.relatedCodes) ? promo.relatedCodes : []
  const bag = `${product.code} ${product.name} ${product.category} ${product.tags.join(' ')}`
  return related.some((token) => {
    const value = String(token || '').trim()
    if (!value) return false
    if (value === product.code) return true
    return value
      .split(/\s+/)
      .filter(Boolean)
      .every((part) => bag.includes(part))
  })
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored || fallback
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

function LoadingCard() {
  return (
    <div className="rounded-[24px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-sm">
      <div className="flex items-center gap-3 text-slate-500">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">正在讀取商品資料…</span>
      </div>
    </div>
  )
}

function ControlChip({ active, children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white shadow-sm'
          : className || 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

function SectionBlock({ meta, count, children, scale }) {
  return (
    <section id={meta.anchor} className="scroll-mt-28 rounded-[26px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 shadow-sm md:rounded-[30px] md:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-1.5 rounded-full ${meta.accent}`} />
          <div>
            <h2 className={`${scale.sectionTitle} font-semibold text-slate-900`}>{meta.label}</h2>
            <p className="text-sm text-slate-500">目前 {count} 項商品</p>
          </div>
        </div>
        <span className={`self-start rounded-full border px-3 py-1.5 text-sm font-medium ${meta.tone}`}>{meta.label}</span>
      </div>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  )
}

function ProductRowCard({ product, scale, onOpen }) {
  const meta = getMeta(product.group)
  const promo = product.promoBadge
  return (
    <motion.button layout whileHover={{ y: -1 }} onClick={() => onOpen(product.code)} className="w-full text-left">
      <div className="group flex items-center gap-2.5 rounded-[22px] border border-slate-200/80 bg-white px-2.5 py-2.5 shadow-sm transition hover:border-slate-300 hover:shadow-md md:gap-4 md:px-4 md:py-3">
        <div className="relative shrink-0">
          <div className={`flex items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 ${scale.rowImage}`}>
            {product.photo ? <img src={product.photo} alt={product.name} className="h-full w-full object-contain p-1" /> : <div className="text-[10px] text-slate-400">No Image</div>}
          </div>
          {product.isNew ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white shadow-sm">NEW</span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 md:gap-4">
            <div className="min-w-0 flex-1">
              <div className={`flex items-center gap-1.5 text-slate-400 ${scale.rowCode}`}>
                <span className={`inline-flex rounded-full border px-2 py-0.5 font-medium ${meta.tone}`}>{product.group}</span>
                <span className="truncate">{product.code}</span>
                {product.rank ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--theme-primary-soft)] px-2 py-0.5 font-medium text-[var(--theme-primary-dark)]">
                    <Star className="h-3 w-3" /> TOP {product.rank}
                  </span>
                ) : null}
              </div>
              <h3 className={`mt-1 line-clamp-1 font-semibold text-slate-900 ${scale.rowName}`}>{product.name}</h3>
              <p className={`mt-0.5 line-clamp-1 text-slate-600 ${scale.rowTitle}`}>{product.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {promo ? (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${PROMO_STATUS_META[promo.status]?.tone || PROMO_STATUS_META.ended.tone} ${scale.rowBadge}`}>
                    <BadgePercent className="h-3 w-3" />
                    {promo.shortTitle || promo.title}
                  </span>
                ) : null}
                {product.videoUrl ? (
                  <span className={`inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-700 ${scale.rowBadge}`}>
                    <PlayCircle className="h-3 w-3" /> 影音
                  </span>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 pl-1 text-right">
              <p className="text-[10px] tracking-wide text-slate-400">建議售價</p>
              <p className={`mt-0.5 font-semibold text-slate-900 ${scale.rowPrice}`}>{currency(product.price)}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

function RankingStrip({ items, onOpenDetail }) {
  if (!items.length) return null
  return (
    <section id="ranking" className="rounded-[26px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 shadow-sm md:rounded-[30px] md:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs tracking-[0.18em] text-[var(--theme-primary-dark)]">TOP PICKS</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">熱銷主推</h2>
        </div>
        <span className="rounded-full bg-[var(--theme-primary-soft)] px-3 py-1 text-sm font-medium text-[var(--theme-primary-dark)]">2025 實銷量排序</span>
      </div>
      <div className="mt-4 -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {items.map((product) => (
          <button
            key={product.code}
            onClick={() => onOpenDetail(product.code)}
            className="w-[200px] shrink-0 rounded-[22px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {product.photo ? <img src={product.photo} alt={product.name} className="h-full w-full object-contain p-1" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1 rounded-full bg-[var(--theme-primary-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--theme-primary-dark)]">
                  <Star className="h-3 w-3" /> TOP {product.rank}
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{product.qty2025?.toLocaleString('zh-TW')} 件</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function PromoSpotlight({ promos, onOpenPromo }) {
  if (!promos.length) return null
  return (
    <section id="promo-spotlight" className="rounded-[26px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 shadow-sm md:rounded-[30px] md:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs tracking-[0.18em] text-[var(--theme-primary-dark)]">PROMOTIONS</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">促銷焦點</h2>
        </div>
        <button onClick={() => onOpenPromo('active')} className="rounded-full bg-[var(--theme-primary)] px-3.5 py-2 text-sm font-medium text-white shadow-sm">
          進入促銷專區
        </button>
      </div>
      <div className="mt-4 -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {promos.map((promo) => (
          <button
            key={promo.promoId}
            onClick={() => onOpenPromo(promo.status || 'active')}
            className="w-[260px] shrink-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="aspect-[16/9] bg-[var(--theme-soft)]">
              {promo.imgUrl ? <img src={promo.imgUrl} alt={promo.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">Promotion</div>}
            </div>
            <div className="p-3">
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${PROMO_STATUS_META[promo.status]?.tone || PROMO_STATUS_META.ended.tone}`}>
                {PROMO_STATUS_META[promo.status]?.label || '促銷'}
              </span>
              <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">{promo.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{promo.content}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function SettingsPanel({ open, onClose, themeKey, setThemeKey, scaleKey, setScaleKey }) {
  if (!open) return null
  return (
    <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[290px] rounded-[24px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.18em] text-slate-400">SETTINGS</p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">版面設定</h3>
        </div>
        <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Type className="h-4 w-4" /> 字體 / 圖片大小
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {Object.keys(SCALE_PRESETS).map((key) => (
            <button
              key={key}
              onClick={() => setScaleKey(key)}
              className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${scaleKey === key ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Palette className="h-4 w-4" /> 配色主題
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.key}
              onClick={() => setThemeKey(theme.key)}
              className={`rounded-2xl border p-2.5 text-left transition ${themeKey === theme.key ? 'border-[var(--theme-primary)] bg-[var(--theme-soft)] shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full border" style={{ background: theme.vars['--theme-primary'], borderColor: theme.vars['--theme-border'] }} />
                <span className="text-sm font-medium text-slate-800">{theme.label}</span>
              </div>
              <div className="mt-2 flex gap-1.5">
                <span className="h-4 flex-1 rounded-full" style={{ background: theme.vars['--theme-soft'] }} />
                <span className="h-4 flex-1 rounded-full" style={{ background: theme.vars['--theme-primary'] }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function PromoHub({ promos, status, onStatusChange, onBack, catalogMap, onOpenDetail }) {
  const visible = promos.filter((item) => item.status === status)
  return (
    <div className="grid gap-5">
      <section className="rounded-[24px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 shadow-sm md:rounded-[30px] md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.18em] text-[var(--theme-primary-dark)]">PROMOTION HUB</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">促銷專區</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">集中查看進行中、即將開始與已結束活動，並可回到相關商品。</p>
          </div>
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full bg-[var(--theme-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm">
            <House className="h-4 w-4" /> 返回型錄
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {['active', 'upcoming', 'ended'].map((key) => (
            <ControlChip key={key} active={status === key} onClick={() => onStatusChange(key)}>
              {PROMO_STATUS_META[key].label} · {promos.filter((item) => item.status === key).length}
            </ControlChip>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((promo) => (
          <article key={promo.promoId || promo.title} className="overflow-hidden rounded-[24px] border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-sm">
            <div className="aspect-[16/10] bg-[var(--theme-soft)]">
              {promo.imgUrl ? <img src={promo.imgUrl} alt={promo.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">Promotion</div>}
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${PROMO_STATUS_META[promo.status]?.tone || PROMO_STATUS_META.ended.tone}`}>
                  {PROMO_STATUS_META[promo.status]?.label || '促銷'}
                </span>
                <span className="text-xs text-slate-400">{promo.startDate || ''}{promo.endDate ? ` → ${promo.endDate}` : ''}</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{promo.title}</h3>
                {promo.shortTitle && promo.shortTitle !== promo.title ? <p className="mt-1 text-sm text-slate-500">{promo.shortTitle}</p> : null}
              </div>
              <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{promo.content}</p>
              <div>
                <p className="text-xs tracking-[0.16em] text-slate-400">相關商品</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(promo.relatedCodes || []).slice(0, 6).map((code) => {
                    const product = catalogMap.get(code)
                    return product ? (
                      <button
                        key={code}
                        onClick={() => onOpenDetail(code)}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        {product.name}
                      </button>
                    ) : (
                      <span key={code} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-400">{code}</span>
                    )
                  })}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function DetailPanel({ product, onClose, onOpenPromo, scale }) {
  if (!product) return null
  const meta = getMeta(product.group)
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 18 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="absolute inset-0 flex flex-col overflow-hidden bg-white md:inset-x-4 md:bottom-6 md:top-6 md:mx-auto md:max-w-5xl md:rounded-[32px] md:border md:border-white/70"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 md:px-5 md:py-4">
            <div className="min-w-0">
              <p className="text-xs tracking-[0.16em] text-slate-400">商品資訊</p>
              <h3 className="truncate text-lg font-semibold text-slate-900 md:text-xl">{product.name}</h3>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-4 md:px-5 md:pt-5">
            <div className="grid gap-4 md:grid-cols-[0.92fr_1.08fr] md:gap-6">
              <div className="space-y-4">
                <div className="rounded-[26px] border border-[var(--theme-border)] bg-[var(--theme-soft)] p-4">
                  <div className="mx-auto flex min-h-[240px] items-center justify-center rounded-[22px] border border-white/80 bg-white/85 p-4 md:min-h-[320px]">
                    {product.photo ? <img src={product.photo} alt={product.name} className="max-h-full w-full object-contain" /> : <div className="text-sm text-slate-400">No Image</div>}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${meta.tone}`}>{product.group}</span>
                    {product.rank ? <span className="rounded-full bg-[var(--theme-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--theme-primary-dark)]">TOP {product.rank}</span> : null}
                    {product.isNew ? <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">新品</span> : null}
                  </div>
                </div>

                {(product.videoUrl || product.moreLinks.length) ? (
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs tracking-[0.16em] text-slate-400">影音與素材</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.videoUrl ? (
                        <button onClick={() => window.open(product.videoUrl, '_blank', 'noopener,noreferrer')} className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-3.5 py-2 text-sm font-medium text-sky-700">
                          <PlayCircle className="h-4 w-4" /> 開啟影音
                        </button>
                      ) : null}
                      {product.moreLinks.map((item, idx) => (
                        <button key={`${item.url}-${idx}`} onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')} className="inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 text-sm font-medium text-slate-700 border border-slate-200">
                          <ExternalLink className="h-4 w-4" /> {item.label || item.type || '更多素材'}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="rounded-[26px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5">
                  <p className="text-xs tracking-[0.16em] text-slate-400">主訴求</p>
                  <h4 className={`mt-2 font-semibold text-slate-900 ${scale.detailTitle}`}>{product.title}</h4>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 md:text-[15px]">{product.content}</p>
                </div>

                {product.promos?.length ? (
                  <div className="rounded-[24px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs tracking-[0.16em] text-slate-400">促銷活動</p>
                      <button onClick={() => onOpenPromo(product.promos[0]?.status || 'active')} className="rounded-full bg-[var(--theme-primary)] px-3 py-1.5 text-xs font-medium text-white">
                        查看促銷專區
                      </button>
                    </div>
                    <div className="mt-3 space-y-2.5">
                      {product.promos.map((promo) => (
                        <div key={promo.promoId || promo.title} className={`rounded-2xl border px-3.5 py-3 text-sm ${PROMO_STATUS_META[promo.status]?.tone || PROMO_STATUS_META.ended.tone}`}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{promo.title}</span>
                            <span className="text-[11px] opacity-80">{PROMO_STATUS_META[promo.status]?.label || '促銷'}</span>
                          </div>
                          <p className="mt-1 whitespace-pre-line leading-6">{promo.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                    <p className="text-xs tracking-[0.16em] text-slate-400">商品資訊</p>
                    <dl className="mt-3 space-y-3 text-sm text-slate-600">
                      <div className="flex justify-between gap-4"><dt>商品代碼</dt><dd className="font-medium text-slate-900">{product.code}</dd></div>
                      <div className="flex justify-between gap-4"><dt>分類</dt><dd className="font-medium text-slate-900">{product.group}</dd></div>
                      <div className="flex justify-between gap-4"><dt>價格</dt><dd className="font-medium text-slate-900">{currency(product.price)}</dd></div>
                      <div className="flex justify-between gap-4"><dt>規格</dt><dd className="font-medium text-slate-900">{product.spec || '—'}</dd></div>
                    </dl>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                    <p className="text-xs tracking-[0.16em] text-slate-400">標籤</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.tags.length ? product.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">#{tag}</span>) : <span className="text-sm text-slate-400">尚未設定標籤</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function FloatingButtons({ currentView, onTogglePromo, onScrollTop, onPrint }) {
  return (
    <div className="fixed bottom-4 right-3 z-40 flex flex-col gap-2 md:bottom-6 md:right-6">
      <button onClick={onTogglePromo} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--theme-primary)] text-white shadow-lg" aria-label={currentView === 'promo' ? '返回型錄' : '促銷專區'}>
        {currentView === 'promo' ? <House className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
      </button>
      <button onClick={onScrollTop} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg border border-slate-200" aria-label="回到頂端">
        <ArrowUp className="h-5 w-5" />
      </button>
      <button onClick={onPrint} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg border border-slate-200" aria-label="列印目錄">
        <Printer className="h-5 w-5" />
      </button>
    </div>
  )
}

export default function TtlBioTechFormalCatalogV5() {
  const [catalog, setCatalog] = useState([])
  const [promos, setPromos] = useState([])
  const [meta, setMeta] = useState({ generatedAt: '', buildId: '', count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTag, setActiveTag] = useState('')
  const [sortKey, setSortKey] = useState('featured')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [currentView, setCurrentView] = useState('catalog')
  const [detailCode, setDetailCode] = useState(null)
  const [promoStatus, setPromoStatus] = useState('active')
  const [themeKey, setThemeKey] = useStoredState('ttl-react-theme-v5', 'rose')
  const [scaleKey, setScaleKey] = useStoredState('ttl-react-scale-v5', 'A')
  const settingsRef = useRef(null)

  const scale = SCALE_PRESETS[scaleKey] || SCALE_PRESETS.A
  const theme = THEMES.find((item) => item.key === themeKey) || THEMES[0]

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        setLoading(true)
        setError('')
        const [catalogRes, promoRes, rankRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}merged-feed.json`, { cache: 'no-store' }),
          fetch(`${import.meta.env.BASE_URL}promotions.json`, { cache: 'no-store' }).catch(() => null),
          fetch(`${import.meta.env.BASE_URL}rankings.json`, { cache: 'no-store' }).catch(() => null),
        ])
        if (!catalogRes.ok) throw new Error(`HTTP ${catalogRes.status}`)
        const catalogData = await catalogRes.json()
        const promoData = promoRes && promoRes.ok ? await promoRes.json() : { items: [] }
        const rankData = rankRes && rankRes.ok ? await rankRes.json() : { items: [] }
        if (!active) return

        const rankingsMap = new Map((rankData.items || []).map((item) => [item.code, item]))
        const products = Array.isArray(catalogData?.items) ? catalogData.items : []
        const promoItems = Array.isArray(promoData?.items) ? promoData.items : []
        const normalized = products.map((item) => {
          const rank = rankingsMap.get(item.code)
          const matchedPromos = promoItems.filter((promo) => matchPromoToProduct(promo, {
            code: item.code || '',
            name: item.name || '',
            category: item.category || '',
            tags: toTags(item?.pitch?.tags),
          }))
          return normalizeItem({ ...item, promos: matchedPromos, ...rank })
        })
        setCatalog(normalized)
        setPromos(sortPromos(promoItems))
        setMeta({
          generatedAt: catalogData?.generatedAt || '',
          buildId: catalogData?.buildId || '',
          count: Number(catalogData?.count || normalized.length || 0),
        })
      } catch (err) {
        if (!active) return
        setError(`商品資料載入失敗：${err?.message || '未知錯誤'}`)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadData()
    return () => { active = false }
  }, [])

  const catalogMap = useMemo(() => new Map(catalog.map((item) => [item.code, item])), [catalog])
  const activeProduct = detailCode ? catalogMap.get(detailCode) || null : null

  useEffect(() => {
    const current = window.history.state || {}
    if (!current.__ttlReactV5) {
      window.history.replaceState({ __ttlReactV5: true, view: 'catalog', detailCode: null, promoStatus: 'active' }, '')
    }
    const onPopState = (event) => {
      const state = event.state || { view: 'catalog', detailCode: null, promoStatus: 'active' }
      setCurrentView(state.view || 'catalog')
      setDetailCode(state.detailCode || null)
      setPromoStatus(state.promoStatus || 'active')
      setSettingsOpen(false)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!activeProduct) return undefined
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [activeProduct])

  useEffect(() => {
    const onPointer = (event) => {
      if (!settingsRef.current) return
      if (!settingsRef.current.contains(event.target)) setSettingsOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [])

  const categoryCounts = useMemo(() => {
    const counts = new Map()
    catalog.forEach((item) => counts.set(item.group, (counts.get(item.group) || 0) + 1))
    return counts
  }, [catalog])

  const allTags = useMemo(() => {
    const counter = new Map()
    catalog.forEach((item) => item.tags.forEach((tag) => counter.set(tag, (counter.get(tag) || 0) + 1)))
    return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([tag]) => tag)
  }, [catalog])

  const filteredCatalog = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    const base = catalog.filter((item) => {
      const categoryOk = activeCategory === 'all' || item.group === activeCategory
      const tagOk = !activeTag || item.tags.includes(activeTag)
      const haystack = [item.name, item.title, item.content, item.code, ...item.tags].join(' ').toLowerCase()
      const keywordOk = !q || haystack.includes(q)
      return categoryOk && tagOk && keywordOk
    })
    return sortProducts(base, sortKey)
  }, [catalog, keyword, activeCategory, activeTag, sortKey])

  const groupedSections = useMemo(() => {
    const groups = new Map()
    filteredCatalog.forEach((item) => {
      const key = item.group || '其他'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(item)
    })
    return CATEGORY_META.filter((metaItem) => metaItem.key !== 'all' && groups.has(metaItem.key)).map((metaItem) => ({
      ...metaItem,
      items: groups.get(metaItem.key) || [],
    }))
  }, [filteredCatalog])

  const featuredPromos = useMemo(() => promos.filter((item) => item.status === 'active').slice(0, 6), [promos])
  const rankingItems = useMemo(() => catalog.filter((item) => item.rank && item.rank <= 8).sort((a, b) => a.rank - b.rank), [catalog])

  const pushState = (payload) => {
    window.history.pushState({ __ttlReactV5: true, ...payload }, '')
  }

  const openDetail = (code) => {
    setDetailCode(code)
    pushState({ view: currentView, detailCode: code, promoStatus })
  }

  const closeDetail = () => {
    if (window.history.state?.detailCode) {
      window.history.back()
    } else {
      setDetailCode(null)
    }
  }

  const openPromoView = (status = promoStatus || 'active') => {
    setCurrentView('promo')
    setDetailCode(null)
    setPromoStatus(status)
    pushState({ view: 'promo', detailCode: null, promoStatus: status })
  }

  const backToCatalog = () => {
    if (window.history.state?.view === 'promo' && !window.history.state?.detailCode) {
      window.history.back()
    } else {
      setCurrentView('catalog')
      setDetailCode(null)
    }
  }

  const switchPromoStatus = (status) => {
    setPromoStatus(status)
    if (currentView === 'promo' && window.history.replaceState) {
      window.history.replaceState({ ...(window.history.state || {}), __ttlReactV5: true, view: 'promo', promoStatus: status, detailCode }, '')
    }
  }

  const clearFilters = () => {
    setKeyword('')
    setActiveCategory('all')
    setActiveTag('')
    setSortKey('featured')
  }

  const openCategoryAnchor = (key) => {
    setActiveCategory(key)
    setMobileFiltersOpen(false)
    const metaItem = getMeta(key)
    requestAnimationFrame(() => {
      document.getElementById(metaItem.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const printCatalog = () => window.print()

  return (
    <div style={theme.vars} className="min-h-screen bg-[var(--theme-bg)] text-slate-900 transition-colors duration-300">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-4 md:gap-5 md:px-6 md:py-6 lg:px-8" id="top">
        <section className="rounded-[24px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 shadow-sm md:rounded-[30px] md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[24px] font-black tracking-tight text-slate-900 md:text-[30px]">TTL Bio-tech 健康美學</h1>
              <p className="mt-1 text-sm font-medium text-[var(--theme-primary-dark)] md:text-base">台酒生技 產品銷售輔助</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 md:max-w-2xl">
                依類別快速瀏覽商品主訴求、建議售價、促銷連動、影音與延伸素材，作為銷售支援與導購參考。
              </p>
            </div>
            <div ref={settingsRef} className="relative flex shrink-0 items-start gap-2">
              <button onClick={printCatalog} className="hidden rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm md:inline-flex md:items-center md:gap-2">
                <Printer className="h-4 w-4" /> 列印目錄
              </button>
              <button onClick={() => setSettingsOpen((prev) => !prev)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-border)] bg-[var(--theme-soft)] text-[var(--theme-primary-dark)] shadow-sm md:h-11 md:w-11">
                <Settings2 className="h-4 w-4" />
              </button>
              <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} themeKey={themeKey} setThemeKey={setThemeKey} scaleKey={scaleKey} setScaleKey={setScaleKey} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 md:text-sm">
            <span className="inline-flex items-center gap-1"><LayoutGrid className="h-4 w-4" /> 共 {meta.count || catalog.length} 項商品</span>
            <span>資料更新：{formatUpdatedAt(meta.generatedAt)}</span>
            {meta.buildId ? <span>Build：{meta.buildId}</span> : null}
          </div>
        </section>

        <section className="sticky top-2 z-40 rounded-[22px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 shadow-lg md:top-4 md:rounded-[28px] md:p-4">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜尋商品名稱、代碼、主訴求或標籤"
                  className={`w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--theme-primary)] focus:bg-white ${scale.stickyInput}`}
                />
              </div>
              <button onClick={() => setMobileFiltersOpen((prev) => !prev)} className={`inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 md:px-4 ${scale.stickyInput}`}>
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">篩選</span>
                <ChevronDown className={`h-4 w-4 transition ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="hidden flex-wrap gap-2 md:flex">
              {CATEGORY_META.filter((item) => item.key !== '其他').map((item) => (
                <ControlChip
                  key={item.key}
                  active={activeCategory === item.key || (item.key === 'all' && activeCategory === 'all')}
                  onClick={() => (item.key === 'all' ? clearFilters() : openCategoryAnchor(item.key))}
                  className={item.tone}
                >
                  {item.label}{item.key !== 'all' ? ` · ${categoryCounts.get(item.key) || 0}` : ` · ${catalog.length}`}
                </ControlChip>
              ))}
            </div>

            <AnimatePresence initial={false}>
              {mobileFiltersOpen ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none transition focus:border-[var(--theme-primary)] focus:bg-white">
                          <option value="featured">預設排序</option>
                          <option value="new">新品優先</option>
                          <option value="price-asc">價格低到高</option>
                          <option value="price-desc">價格高到低</option>
                          <option value="name">名稱排序</option>
                        </select>
                      </div>
                      <button onClick={clearFilters} className="h-11 shrink-0 rounded-2xl border border-slate-200 px-3 text-sm font-medium text-slate-600">清除</button>
                    </div>

                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                      {CATEGORY_META.filter((item) => item.key !== '其他').map((item) => (
                        <ControlChip key={item.key} active={activeCategory === item.key || (item.key === 'all' && activeCategory === 'all')} onClick={() => (item.key === 'all' ? clearFilters() : openCategoryAnchor(item.key))} className={`whitespace-nowrap ${item.tone}`}>
                          {item.label}
                        </ControlChip>
                      ))}
                    </div>

                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                      {allTags.map((tag) => (
                        <ControlChip key={tag} active={activeTag === tag} onClick={() => setActiveTag((prev) => (prev === tag ? '' : tag))} className="whitespace-nowrap border-slate-200 bg-white text-slate-600">
                          #{tag}
                        </ControlChip>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </section>

        {error ? <section className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">{error}</section> : null}

        {currentView === 'promo' ? (
          <PromoHub promos={promos} status={promoStatus} onStatusChange={switchPromoStatus} onBack={backToCatalog} catalogMap={catalogMap} onOpenDetail={openDetail} />
        ) : (
          <div className="grid gap-5">
            {loading ? <LoadingCard /> : null}
            {!loading && !error ? <PromoSpotlight promos={featuredPromos} onOpenPromo={openPromoView} /> : null}
            {!loading && !error ? <RankingStrip items={rankingItems} onOpenDetail={openDetail} /> : null}
            {!loading && !error && groupedSections.length ? (
              groupedSections.map((section) => (
                <SectionBlock key={section.key} meta={section} count={section.items.length} scale={scale}>
                  <AnimatePresence mode="popLayout">
                    {section.items.map((product) => (
                      <ProductRowCard key={product.code} product={product} scale={scale} onOpen={openDetail} />
                    ))}
                  </AnimatePresence>
                </SectionBlock>
              ))
            ) : null}
            {!loading && !error && !groupedSections.length ? (
              <section className="rounded-[26px] border border-dashed border-slate-300 bg-[var(--theme-surface)] p-10 text-center shadow-sm">
                <PanelTop className="mx-auto h-8 w-8 text-slate-300" />
                <h2 className="mt-4 text-lg font-semibold text-slate-900">目前沒有符合條件的商品</h2>
                <p className="mt-2 text-sm text-slate-500">可調整搜尋字詞、分類或標籤，再重新檢視列表結果。</p>
              </section>
            ) : null}
          </div>
        )}
      </div>

      <FloatingButtons currentView={currentView} onTogglePromo={() => (currentView === 'promo' ? backToCatalog() : openPromoView('active'))} onScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onPrint={printCatalog} />
      <DetailPanel product={activeProduct} onClose={closeDetail} onOpenPromo={openPromoView} scale={scale} />
    </div>
  )
}
