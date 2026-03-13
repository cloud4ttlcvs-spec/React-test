import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  ChevronRight,
  ChevronDown,
  Tags,
  ArrowUpDown,
  PlayCircle,
  ExternalLink,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react'

const CATEGORY_META = [
  {
    key: 'all',
    label: '全部',
    anchor: 'all',
    tone: 'border-slate-200 bg-white text-slate-700',
    section: 'border-slate-200/80 bg-white/95',
    accent: 'bg-slate-700',
  },
  {
    key: '保健飲品',
    label: '保健飲品',
    anchor: 'drinks',
    tone: 'border-amber-200 bg-amber-50 text-amber-800',
    section: 'border-amber-200/80 bg-white/95',
    accent: 'bg-amber-500',
  },
  {
    key: '保健食品',
    label: '保健食品',
    anchor: 'health',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    section: 'border-emerald-200/80 bg-white/95',
    accent: 'bg-emerald-500',
  },
  {
    key: '美容產品',
    label: '美容產品',
    anchor: 'beauty',
    tone: 'border-rose-200 bg-rose-50 text-rose-800',
    section: 'border-rose-200/80 bg-white/95',
    accent: 'bg-rose-500',
  },
  {
    key: '清潔產品',
    label: '清潔產品',
    anchor: 'cleaning',
    tone: 'border-cyan-200 bg-cyan-50 text-cyan-800',
    section: 'border-cyan-200/80 bg-white/95',
    accent: 'bg-cyan-500',
  },
  {
    key: '其他',
    label: '其他',
    anchor: 'other',
    tone: 'border-violet-200 bg-violet-50 text-violet-800',
    section: 'border-violet-200/80 bg-white/95',
    accent: 'bg-violet-500',
  },
]

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
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
  }
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

function toTags(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (!raw) return []
  return String(raw)
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeItem(item) {
  const pitch = item?.pitch || {}
  return {
    code: item.code || '',
    name: item.name || pitch.name || '未命名商品',
    category: item.category || '',
    group: normalizeCategory(item.category || ''),
    price: Number(item.price || 0),
    spec: item.spec || '',
    photo: item.photo || '',
    title: pitch.title || item.name || '商品重點',
    content: pitch.content || '目前尚未設定商品話術摘要。',
    tags: toTags(pitch.tags),
    isNew: Boolean(pitch.isNew),
    videoUrl: item.videoUrl || '',
    moreLinks: parseMoreLinks(item.moreLinksRaw),
  }
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

function FilterPill({ active, children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${className} ${
        active
          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

function LoadingCard() {
  return (
    <div className="rounded-[26px] border border-slate-200/80 bg-white/95 p-5 shadow-sm shadow-slate-200/60">
      <div className="flex items-center gap-3 text-slate-500">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">正在讀取商品資料…</span>
      </div>
    </div>
  )
}

function ProductRowCard({ product, onOpen }) {
  const meta = getMeta(product.group)
  return (
    <motion.button layout whileHover={{ y: -1 }} onClick={() => onOpen(product)} className="w-full text-left">
      <div className="group flex gap-3 rounded-[24px] border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-200/60 transition hover:border-slate-300 hover:shadow-md md:gap-4 md:p-4">
        <div className="relative shrink-0">
          <div className="flex h-22 w-22 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 md:h-24 md:w-24">
            {product.photo ? (
              <img src={product.photo} alt={product.name} className="h-full w-full object-contain p-1.5" />
            ) : (
              <div className="text-xs text-slate-400">No Image</div>
            )}
          </div>
          {product.isNew ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold tracking-wide text-white shadow-sm">
              NEW
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.tone}`}>{product.group}</span>
                <span className="text-[11px] text-slate-400">{product.code}</span>
              </div>
              <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-6 text-slate-900 md:text-base">
                {product.name}
              </h3>
              <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-600">{product.title}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{product.content}</p>
            </div>

            <div className="flex shrink-0 items-end justify-between gap-3 md:min-w-[168px] md:flex-col md:items-end">
              <div className="text-right">
                <p className="text-[11px] tracking-wide text-slate-400">建議售價</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{currency(product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                {product.videoUrl ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(product.videoUrl, '_blank', 'noopener,noreferrer')
                    }}
                    className="inline-flex items-center gap-1 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    影音
                  </button>
                ) : null}
                <div className="rounded-2xl bg-slate-100 p-2 text-slate-400 transition group-hover:text-slate-700">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {product.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                #{tag}
              </span>
            ))}
            {product.moreLinks.length ? (
              <span className="rounded-full bg-slate-900/5 px-2.5 py-1 text-xs text-slate-500">
                更多素材 {product.moreLinks.length} 筆
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.button>
  )
}

function SectionBlock({ title, count, children, meta, anchor }) {
  return (
    <section id={anchor} className={`scroll-mt-28 rounded-[28px] border ${meta.section} p-4 shadow-sm shadow-slate-200/60 md:p-5`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-1.5 rounded-full ${meta.accent}`} />
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">目前 {count} 項商品</p>
          </div>
        </div>
        <span className={`self-start rounded-full border px-3 py-1.5 text-sm font-medium ${meta.tone}`}>{title}</span>
      </div>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  )
}

function DetailPanel({ product, onClose }) {
  if (!product) return null
  const meta = getMeta(product.group)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ type: 'spring', stiffness: 250, damping: 24 }}
          className="absolute inset-x-0 bottom-0 mx-auto max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-t-[32px] border border-white/60 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs tracking-wide text-slate-400">商品資訊</p>
              <h3 className="truncate text-lg font-semibold text-slate-900">{product.name}</h3>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-6 overflow-y-auto p-5 md:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-4">
              <div className={`rounded-[28px] border ${meta.section} p-5`}>
                <div className="mx-auto flex h-64 items-center justify-center rounded-[24px] border border-white/80 bg-white/80 p-4">
                  {product.photo ? (
                    <img src={product.photo} alt={product.name} className="max-h-full w-full object-contain" />
                  ) : (
                    <div className="text-sm text-slate-400">No Image</div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${meta.tone}`}>{product.group}</span>
                  {product.isNew ? <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">新品</span> : null}
                </div>
              </div>

              {(product.videoUrl || product.moreLinks.length) && (
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs tracking-wide text-slate-400">影音與素材</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.videoUrl ? (
                      <button
                        onClick={() => window.open(product.videoUrl, '_blank', 'noopener,noreferrer')}
                        className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                      >
                        <PlayCircle className="h-4 w-4" />
                        開啟影音
                      </button>
                    ) : null}
                    {product.moreLinks.map((item, idx) => (
                      <button
                        key={`${item.url}-${idx}`}
                        onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {item.label || item.type || '更多素材'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <p className="text-xs tracking-wide text-slate-400">主訴求</p>
                <h4 className="mt-2 text-xl font-semibold text-slate-900">{product.title}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-600">{product.content}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-white p-4">
                  <p className="text-xs tracking-wide text-slate-400">商品資訊</p>
                  <dl className="mt-3 space-y-3 text-sm text-slate-600">
                    <div className="flex justify-between gap-4"><dt>商品代碼</dt><dd className="font-medium text-slate-900">{product.code}</dd></div>
                    <div className="flex justify-between gap-4"><dt>分類</dt><dd className="font-medium text-slate-900">{product.group}</dd></div>
                    <div className="flex justify-between gap-4"><dt>價格</dt><dd className="font-medium text-slate-900">{currency(product.price)}</dd></div>
                    <div className="flex justify-between gap-4"><dt>規格</dt><dd className="font-medium text-slate-900">{product.spec || '—'}</dd></div>
                  </dl>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-4">
                  <p className="text-xs tracking-wide text-slate-400">標籤</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.tags.length ? (
                      product.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">尚未設定標籤</span>
                    )}
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

export default function TtlBioTechFormalCatalog() {
  const [catalog, setCatalog] = useState([])
  const [meta, setMeta] = useState({ generatedAt: '', buildId: '', count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTag, setActiveTag] = useState('')
  const [sortKey, setSortKey] = useState('featured')
  const [activeProduct, setActiveProduct] = useState(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    let active = true
    async function loadCatalog() {
      try {
        setLoading(true)
        setError('')
        const response = await fetch(`${import.meta.env.BASE_URL}merged-feed.json`, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        if (!active) return
        const items = Array.isArray(data?.items) ? data.items.map(normalizeItem) : []
        setCatalog(items)
        setMeta({
          generatedAt: data?.generatedAt || '',
          buildId: data?.buildId || '',
          count: Number(data?.count || items.length || 0),
        })
      } catch (err) {
        if (!active) return
        setError(`商品資料載入失敗：${err?.message || '未知錯誤'}`)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadCatalog()
    return () => {
      active = false
    }
  }, [])

  const categoryCounts = useMemo(() => {
    const counts = new Map()
    catalog.forEach((item) => counts.set(item.group, (counts.get(item.group) || 0) + 1))
    return counts
  }, [catalog])

  const allTags = useMemo(() => {
    const counter = new Map()
    catalog.forEach((item) => item.tags.forEach((tag) => counter.set(tag, (counter.get(tag) || 0) + 1)))
    return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([tag]) => tag)
  }, [catalog])

  const filtered = useMemo(() => {
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
    filtered.forEach((item) => {
      const key = item.group || '其他'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(item)
    })
    return CATEGORY_META.filter((metaItem) => metaItem.key !== 'all' && groups.has(metaItem.key)).map((metaItem) => ({
      ...metaItem,
      items: groups.get(metaItem.key) || [],
    }))
  }, [filtered])

  const clearFilters = () => {
    setKeyword('')
    setActiveCategory('all')
    setActiveTag('')
    setSortKey('featured')
  }

  const openCategoryAnchor = (key) => {
    setActiveCategory(key)
    const sectionMeta = getMeta(key)
    requestAnimationFrame(() => {
      document.getElementById(sectionMeta.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc,white_32%,#f8fafc)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <section className="rounded-[24px] border border-white/70 bg-white/95 p-4 shadow-sm shadow-slate-200/70 backdrop-blur md:rounded-[30px] md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-[0.18em] text-slate-400">TTL BIO-TECH PRODUCT CATALOG</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">台酒生技商品型錄</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                依類別瀏覽商品主訴求、影音與延伸素材，作為銷售支援與導購參考。
              </p>
            </div>
            <div className="shrink-0 text-xs leading-5 text-slate-500 md:text-right">
              <div>共 {meta.count || catalog.length} 項商品</div>
              <div>資料更新：{formatUpdatedAt(meta.generatedAt)}</div>
            </div>
          </div>
        </section>

        <section className="sticky top-2 z-40 rounded-[22px] border border-white/70 bg-white/92 p-3 shadow-lg shadow-slate-200/50 backdrop-blur md:top-4 md:rounded-[28px] md:p-4">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:hidden">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜尋商品名稱、代碼、標籤"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                />
              </div>
              <button
                onClick={() => setMobileFiltersOpen((prev) => !prev)}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
              >
                <SlidersHorizontal className="h-4 w-4" />
                篩選
                <ChevronDown className={`h-4 w-4 transition ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="hidden flex-col gap-4 md:flex">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="搜尋商品名稱、代碼、主訴求或標籤"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                  />
                </div>

                <div className="flex gap-3 sm:w-auto">
                  <div className="relative min-w-[185px] flex-1 sm:flex-none">
                    <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value)}
                      className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                    >
                      <option value="featured">預設排序</option>
                      <option value="new">新品優先</option>
                      <option value="price-asc">價格低到高</option>
                      <option value="price-desc">價格高到低</option>
                      <option value="name">名稱排序</option>
                    </select>
                  </div>

                  <button
                    onClick={clearFilters}
                    className="h-12 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    清除條件
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORY_META.filter((item) => item.key !== '其他').map((item) => (
                  <FilterPill
                    key={item.key}
                    active={activeCategory === item.key || (item.key === 'all' && activeCategory === 'all')}
                    onClick={() => (item.key === 'all' ? clearFilters() : openCategoryAnchor(item.key))}
                    className={activeCategory === item.key || (item.key === 'all' && activeCategory === 'all') ? '' : item.tone}
                  >
                    {item.label}
                    {item.key !== 'all' ? ` · ${categoryCounts.get(item.key) || 0}` : ` · ${catalog.length}`}
                  </FilterPill>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="mr-1 inline-flex items-center gap-2 text-sm text-slate-500">
                  <Tags className="h-4 w-4" />
                  熱門標籤
                </div>
                {allTags.map((tag) => (
                  <FilterPill key={tag} active={activeTag === tag} onClick={() => setActiveTag((prev) => (prev === tag ? '' : tag))}>
                    #{tag}
                  </FilterPill>
                ))}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {mobileFiltersOpen ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden md:hidden"
                >
                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select
                          value={sortKey}
                          onChange={(e) => setSortKey(e.target.value)}
                          className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                        >
                          <option value="featured">預設排序</option>
                          <option value="new">新品優先</option>
                          <option value="price-asc">價格低到高</option>
                          <option value="price-desc">價格高到低</option>
                          <option value="name">名稱排序</option>
                        </select>
                      </div>
                      <button onClick={clearFilters} className="h-11 shrink-0 rounded-2xl border border-slate-200 px-3 text-sm font-medium text-slate-600">
                        清除
                      </button>
                    </div>

                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                      {CATEGORY_META.filter((item) => item.key !== '其他').map((item) => (
                        <FilterPill
                          key={item.key}
                          active={activeCategory === item.key || (item.key === 'all' && activeCategory === 'all')}
                          onClick={() => (item.key === 'all' ? clearFilters() : openCategoryAnchor(item.key))}
                          className={`whitespace-nowrap ${activeCategory === item.key || (item.key === 'all' && activeCategory === 'all') ? '' : item.tone}`}
                        >
                          {item.label}
                        </FilterPill>
                      ))}
                    </div>

                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                      {allTags.map((tag) => (
                        <FilterPill key={tag} active={activeTag === tag} onClick={() => setActiveTag((prev) => (prev === tag ? '' : tag))} className="whitespace-nowrap">
                          #{tag}
                        </FilterPill>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </section>

        {error ? (
          <section className="rounded-[26px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm shadow-rose-100/60">
            {error}
          </section>
        ) : null}

        <div className="grid gap-5">
          {loading ? (
            <LoadingCard />
          ) : groupedSections.length ? (
            groupedSections.map((section) => (
              <SectionBlock key={section.key} title={section.label} count={section.items.length} meta={section} anchor={section.anchor}>
                <AnimatePresence mode="popLayout">
                  {section.items.map((product) => (
                    <ProductRowCard key={product.code} product={product} onOpen={setActiveProduct} />
                  ))}
                </AnimatePresence>
              </SectionBlock>
            ))
          ) : (
            <section className="rounded-[28px] border border-dashed border-slate-300 bg-white/85 p-10 text-center shadow-sm shadow-slate-200/60">
              <h2 className="text-lg font-semibold text-slate-900">目前沒有符合條件的商品</h2>
              <p className="mt-2 text-sm text-slate-500">可調整搜尋字詞、分類或標籤，再重新檢視列表結果。</p>
            </section>
          )}
        </div>
      </div>

      <DetailPanel product={activeProduct} onClose={() => setActiveProduct(null)} />
    </div>
  )
}
